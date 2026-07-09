/**
 * 3D 전술 보드 (v1.1.5 본 구현, ADR-008).
 * - 클래식 WebGLRenderer (스파이크 실측: WebGPU 대비 청크 -37%, 폴백 fps 3.2배)
 * - 스타일화 선수 피규어: 몸통·머리 InstancedMesh(팀당 draw call 2) + 역할 라벨 스프라이트
 * - 화살표: 피치 바닥 리본 메시 (run 실선 / pass 점선 분절 / press 적색)
 * - steps 재생: 2D와 동일한 lib/playback 순수 함수 재사용 (단계·배속·캡션 컨트롤)
 * - 품질 자동 티어: fps 실측 → pixelRatio 하향, 비활성 탭 렌더 정지, reduced-motion 스틸 컷
 * - lazy-load 전용: React.lazy로만 임포트 — 기본 번들 포함 금지
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Arrow, Board } from '../types';
import { buildFrames, easeInOut, interpolateFrames, type Frame } from '../lib/playback';
import { track } from '../lib/analytics';

/** 논리 좌표(0~100) → 3D 좌표. 피치 68x105m, 중앙 원점, y=100(상대 골문)이 -z */
const toX = (x: number) => (x / 100 - 0.5) * 68;
const toZ = (y: number) => (0.5 - y / 100) * 105;

const STEP_MS = 1600;
const SPEEDS = [1, 1.5, 2] as const;

const CAMERA_PRESETS = {
  broadcast: { pos: [0, 55, 78] as const, label: '방송' },
  top: { pos: [0, 125, 0.1] as const, label: '탑다운' },
  goal: { pos: [0, 22, 92] as const, label: '골대 뒤' },
};
type PresetKey = keyof typeof CAMERA_PRESETS;

const ARROW_COLORS: Record<Arrow['kind'], number> = {
  run: 0xfde047,
  pass: 0x7dd3fc,
  press: 0xfb7185,
};

function pitchTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 680;
  c.height = 1050;
  const g = c.getContext('2d')!;
  g.fillStyle = '#14522c';
  g.fillRect(0, 0, 680, 1050);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 7; i += 2) g.fillRect(0, (i * 1050) / 7, 680, 1050 / 7);
  g.strokeStyle = 'rgba(255,255,255,0.85)';
  g.lineWidth = 5;
  g.strokeRect(10, 10, 660, 1030);
  g.beginPath();
  g.moveTo(10, 525);
  g.lineTo(670, 525);
  g.stroke();
  g.beginPath();
  g.arc(340, 525, 91, 0, Math.PI * 2);
  g.stroke();
  g.strokeRect(340 - 201, 10, 402, 165);
  g.strokeRect(340 - 91, 10, 182, 55);
  g.strokeRect(340 - 201, 1040 - 165, 402, 165);
  g.strokeRect(340 - 91, 1040 - 55, 182, 55);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/** 역할 라벨 스프라이트 텍스처 (role별 캐시는 호출부에서) */
function labelTexture(role: string, opponent: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d')!;
  g.fillStyle = opponent ? 'rgba(226,232,240,0.92)' : 'rgba(251,191,36,0.95)';
  const w = Math.min(120, 34 + role.length * 22);
  g.beginPath();
  g.roundRect((128 - w) / 2, 8, w, 48, 14);
  g.fill();
  g.fillStyle = '#241a02';
  g.font = '700 30px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(role, 64, 33);
  return new THREE.CanvasTexture(c);
}

/** 화살표 → 바닥 리본 지오메트리 (pass는 점선 분절) */
function buildArrowGroup(arrows: Arrow[] | undefined, group: THREE.Group): void {
  // 기존 메시 정리
  for (const child of [...group.children]) {
    group.remove(child);
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material)?.dispose();
  }
  if (!arrows?.length) return;

  for (const a of arrows) {
    const from = new THREE.Vector3(toX(a.from.x), 0, toZ(a.from.y));
    const to = new THREE.Vector3(toX(a.to.x), 0, toZ(a.to.y));
    const dir = to.clone().sub(from);
    const len = dir.length();
    if (len < 1) continue;

    // 2D와 같은 곡률 규칙: 진행 방향 법선 쪽 제어점
    const mid = from.clone().add(to).multiplyScalar(0.5);
    const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    const ctrl = mid.add(normal.multiplyScalar((a.curve ?? 0) * len * 0.35));
    const curve = new THREE.QuadraticBezierCurve3(from, ctrl, to);

    const SAMPLES = 24;
    const pts = curve.getPoints(SAMPLES);
    const width = 0.55;
    const positions: number[] = [];
    const headLen = Math.min(2.2, len * 0.25);

    // 화살촉 직전까지 리본 (pass는 4분절 중 2분절만 채워 점선)
    for (let i = 0; i < SAMPLES; i++) {
      if (a.kind === 'pass' && i % 4 >= 2) continue;
      const p0 = pts[i];
      const p1 = pts[i + 1];
      if (p1.distanceTo(to) < headLen) break;
      const seg = p1.clone().sub(p0);
      const side = new THREE.Vector3(-seg.z, 0, seg.x).normalize().multiplyScalar(width / 2);
      const a0 = p0.clone().add(side);
      const b0 = p0.clone().sub(side);
      const a1 = p1.clone().add(side);
      const b1 = p1.clone().sub(side);
      positions.push(a0.x, 0, a0.z, b0.x, 0, b0.z, a1.x, 0, a1.z);
      positions.push(b0.x, 0, b0.z, b1.x, 0, b1.z, a1.x, 0, a1.z);
    }

    // 화살촉 (곡선 끝 접선 방향)
    const tangent = curve.getTangent(1).setY(0).normalize();
    const headSide = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(headLen * 0.45);
    const base = to.clone().sub(tangent.clone().multiplyScalar(headLen));
    const hA = base.clone().add(headSide);
    const hB = base.clone().sub(headSide);
    positions.push(hA.x, 0, hA.z, hB.x, 0, hB.z, to.x, 0, to.z);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.MeshBasicMaterial({
      color: ARROW_COLORS[a.kind],
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.07; // 잔디 z-fight 방지
    mesh.renderOrder = 1;
    group.add(mesh);
  }
}

interface Props {
  id: string;
  name: string;
  board: Board;
  /** 커스텀 보드 미리보기 등 상세로 돌아갈 링크가 없는 경우 false */
  showMeta?: boolean;
}

interface Pos {
  step: number;
  t: number;
}

export default function Board3D({ id, board, showMeta = true }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading');
  const [playing, setPlaying] = useState(false);
  const [posUi, setPosUi] = useState<Pos>({ step: 0, t: 1 }); // step 0 = 기본 대형
  const [speedIdx, setSpeedIdx] = useState(0);
  const [preset, setPreset] = useState<PresetKey>('broadcast');
  const [quality, setQuality] = useState('');

  // 렌더 루프가 읽는 가변 상태 (리렌더 없이)
  const playRef = useRef({ playing: false, pos: { step: 0, t: 1 } as Pos, speedIdx: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const playedOnce = useRef(false);

  const frames = useMemo(() => buildFrames(board), [board]);
  const last = frames.length - 1;
  const hasSteps = last >= 1;
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  playRef.current.playing = playing;
  playRef.current.speedIdx = speedIdx;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let raf = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1410);
    scene.fog = new THREE.Fog(0x0d1410, 150, 320);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    cameraRef.current = camera;
    camera.position.set(...CAMERA_PRESETS.broadcast.pos);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.6);
    sun.position.set(40, 80, 30);
    scene.add(sun);

    const pitchTex = pitchTexture();
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(68, 105),
      new THREE.MeshLambertMaterial({ map: pitchTex })
    );
    pitch.rotation.x = -Math.PI / 2;
    scene.add(pitch);

    // ── 선수 피규어: 몸통+머리 인스턴싱, 라벨 스프라이트 ──
    const teamCount = frames[0].players.length;
    const oppCount = frames[0].opponents?.length ?? 0;
    const bodyGeo = new THREE.CapsuleGeometry(0.85, 1.8, 4, 10);
    const headGeo = new THREE.SphereGeometry(0.55, 12, 10);
    const headMat = new THREE.MeshLambertMaterial({ color: 0xf1d5b5 });

    const teamBody = new THREE.InstancedMesh(
      bodyGeo,
      new THREE.MeshLambertMaterial({ color: 0xfbbf24 }),
      Math.max(teamCount, 1)
    );
    const oppBody = new THREE.InstancedMesh(
      bodyGeo,
      new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
      Math.max(oppCount, 1)
    );
    const heads = new THREE.InstancedMesh(headGeo, headMat, Math.max(teamCount + oppCount, 1));
    teamBody.visible = teamCount > 0;
    oppBody.visible = oppCount > 0;
    scene.add(teamBody, oppBody, heads);

    // 라벨 스프라이트 (role 있는 선수만)
    const labelTextures: THREE.CanvasTexture[] = [];
    const sprites = new Map<string, THREE.Sprite>();
    const everyone = [...frames[0].players, ...(frames[0].opponents ?? [])];
    for (const p of everyone) {
      if (!p.role.trim()) continue;
      const isOpp = p.id.startsWith('o-');
      const tex = labelTexture(p.role, isOpp);
      labelTextures.push(tex);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
      );
      sprite.scale.set(4.2, 2.1, 1);
      sprites.set(p.id, sprite);
      scene.add(sprite);
    }

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 12),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    scene.add(ball);

    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);
    let lastArrows: Arrow[] | undefined;

    const dummy = new THREE.Object3D();
    const applyFrame = (frame: Frame) => {
      frame.players.forEach((p, i) => {
        const x = toX(p.x);
        const z = toZ(p.y);
        dummy.position.set(x, 1.75, z);
        dummy.updateMatrix();
        teamBody.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, 3.35, z);
        dummy.updateMatrix();
        heads.setMatrixAt(i, dummy.matrix);
        sprites.get(p.id)?.position.set(x, 5.1, z);
      });
      frame.opponents?.forEach((p, i) => {
        const x = toX(p.x);
        const z = toZ(p.y);
        dummy.position.set(x, 1.75, z);
        dummy.updateMatrix();
        oppBody.setMatrixAt(i, dummy.matrix);
        dummy.position.set(x, 3.35, z);
        dummy.updateMatrix();
        heads.setMatrixAt(teamCount + i, dummy.matrix);
        sprites.get(p.id)?.position.set(x, 5.1, z);
      });
      teamBody.instanceMatrix.needsUpdate = true;
      oppBody.instanceMatrix.needsUpdate = true;
      heads.instanceMatrix.needsUpdate = true;
      ball.visible = !!frame.ball;
      if (frame.ball) ball.position.set(toX(frame.ball.x), 0.9, toZ(frame.ball.y));
      if (frame.arrows !== lastArrows) {
        lastArrows = frame.arrows;
        buildArrowGroup(frame.arrows, arrowGroup);
      }
    };
    applyFrame(frames[0]);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setStatus('unsupported');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.min(window.innerHeight * 0.7, w * 1.1);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    mount.appendChild(renderer.domElement);
    resize();
    window.addEventListener('resize', resize);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 25;
    controls.maxDistance = 220;
    controls.enableDamping = true;
    controlsRef.current = controls;
    setStatus('ready');

    // ── 품질 자동 티어: 초반 fps 실측 → pixelRatio 하향 ──
    let frameCount = 0;
    let tierStart = performance.now();
    let tier = 0; // 0: 기본(≤1.5), 1: 1.0, 2: 0.75
    const measureQuality = (now: number) => {
      frameCount++;
      if (frameCount < 60) return;
      const fps = (frameCount * 1000) / (now - tierStart);
      frameCount = 0;
      tierStart = now;
      if (fps < 28 && tier < 2) {
        tier++;
        renderer.setPixelRatio(tier === 1 ? 1 : 0.75);
        setQuality(tier === 1 ? '품질 자동 조정됨' : '저사양 모드');
        track('view3d_quality', { tactic: id, tier });
      }
    };

    // ── 렌더 루프 (재생 상태는 playRef로 구동) ──
    let lastTick = 0;
    const loop = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      controls.update();
      measureQuality(now);

      const s = playRef.current;
      if (s.playing && hasSteps) {
        if (!lastTick) lastTick = now;
        const duration = reduced ? STEP_MS * 1.4 : STEP_MS;
        let { step, t } = s.pos;
        t += ((now - lastTick) * SPEEDS[s.speedIdx]) / duration;
        if (t >= 1) {
          if (step < last) {
            step += 1;
            t = 0;
          } else {
            t = 1;
            s.playing = false;
            setPlaying(false);
          }
        }
        s.pos = { step, t };
        setPosUi(s.pos);
        applyFrame(
          reduced || t >= 1
            ? frames[t >= 1 ? step : step - 1]
            : interpolateFrames(frames[step - 1], frames[step], easeInOut(t))
        );
      } else if (!s.playing && s.pos.t >= 1) {
        // step 경계 가드: steps 없는 보드(frames 1개)도 안전하게 기본 대형 표시
        applyFrame(frames[Math.min(s.pos.step, last)]);
      }
      lastTick = now;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    // 비활성 탭 렌더 정지 (배터리 — v1.1.5-E3)
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        lastTick = 0;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      controls.dispose();
      buildArrowGroup(undefined, arrowGroup); // 화살표 지오메트리 정리
      for (const tex of labelTextures) tex.dispose();
      for (const sprite of sprites.values()) sprite.material.dispose();
      bodyGeo.dispose();
      headGeo.dispose();
      pitchTex.dispose();
      pitch.geometry.dispose();
      ball.geometry.dispose();
      renderer.dispose();
      mount.replaceChildren();
    };
    // frames는 board에서 파생 — board 변경 시 씬 전체 재구성
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  const play = () => {
    if (!playedOnce.current) {
      playedOnce.current = true;
      track('view3d_play', { tactic: id });
    }
    const s = playRef.current;
    if (s.pos.step === 0 || (s.pos.step === last && s.pos.t >= 1)) s.pos = { step: 1, t: 0 };
    setPlaying(true);
  };

  const seek = (target: number) => {
    setPlaying(false);
    playRef.current.playing = false;
    playRef.current.pos = { step: Math.max(1, Math.min(last, target)), t: 1 };
    setPosUi(playRef.current.pos);
  };

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    const cam = cameraRef.current;
    if (!cam || !controlsRef.current) return;
    const [x, y, z] = CAMERA_PRESETS[key].pos;
    cam.position.set(x, y, z);
    controlsRef.current.target.set(0, 0, 0);
  };

  if (status === 'unsupported') {
    return (
      <div className="empty">
        <p>이 기기는 3D 보기를 지원하지 않습니다. 2D 보드를 이용해 주세요.</p>
        {showMeta && (
          <a className="chip chip--link" href={`#/t/${id}`}>
            ← 2D 보드로
          </a>
        )}
      </div>
    );
  }

  const caption =
    hasSteps && posUi.step >= 1 && (playing || posUi.t >= 1)
      ? (frames[posUi.step].caption ?? '')
      : '';

  return (
    <div className="board3d">
      <div ref={mountRef} className="board3d__canvas" />
      {status === 'loading' && <p className="board3d__loading">3D 로딩 중…</p>}
      {status === 'ready' && (
        <>
          {hasSteps && (
            <div className="playback__caption" aria-live="polite">
              <span className="playback__stepnum mono">
                {posUi.step}/{last}
              </span>
              {caption || '▶ 재생으로 시퀀스 시작'}
            </div>
          )}
          <div className="playback__controls">
            {hasSteps && (
              <>
                <button
                  className="playback__btn"
                  onClick={() => seek(posUi.step - 1)}
                  disabled={posUi.step <= 1}
                  aria-label="이전 단계"
                >
                  ⏮
                </button>
                <button
                  className="playback__btn playback__btn--main"
                  onClick={playing ? () => setPlaying(false) : play}
                  aria-label={playing ? '일시정지' : '재생'}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                <button
                  className="playback__btn"
                  onClick={() => seek(posUi.step + 1)}
                  disabled={posUi.step >= last && posUi.t >= 1}
                  aria-label="다음 단계"
                >
                  ⏭
                </button>
                <button
                  className="playback__btn playback__btn--speed"
                  onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
                  aria-label={`재생 속도 (현재 ${SPEEDS[speedIdx]}배)`}
                >
                  {SPEEDS[speedIdx]}x
                </button>
              </>
            )}
            {(Object.keys(CAMERA_PRESETS) as PresetKey[]).map((key) => (
              <button
                key={key}
                className={preset === key ? 'chip chip--active' : 'chip'}
                onClick={() => applyPreset(key)}
              >
                {CAMERA_PRESETS[key].label}
              </button>
            ))}
          </div>
          {showMeta && (
            <p className="board3d__meta">
              드래그로 회전, 휠/핀치로 확대 {quality && <b>· {quality}</b>}
            </p>
          )}
        </>
      )}
    </div>
  );
}
