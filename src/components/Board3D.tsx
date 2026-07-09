/**
 * 3D 전술 보드 (v1.1.5 본 구현, ADR-008).
 * - 클래식 WebGLRenderer (스파이크 실측: WebGPU 대비 청크 -37%, 폴백 fps 3.2배)
 * - 스타일화 선수 피규어: 몸통·머리 InstancedMesh + 역할 라벨 스프라이트
 * - 화살표: 피치 바닥 리본 메시 (run 실선 / pass 점선 분절 / press 적색)
 * - steps 재생: 2D와 동일한 lib/playback 순수 함수 재사용 (단계·배속·캡션 컨트롤)
 * - 품질 자동 티어: fps 실측 → pixelRatio 하향, 비활성 탭 렌더 정지, reduced-motion 스틸 컷
 *
 * 아키텍처 (적대적 리뷰 반영): 렌더러·씬·카메라는 마운트 시 1회만 생성하고,
 * board 변경 시에는 ① 구조(선수 id/role 구성)가 바뀌면 피규어만 재구성,
 * ② 위치만 바뀌면 인스턴스 매트릭스 갱신만 한다 — 편집기 드래그(초당 수십 회
 * board 교체)에도 WebGL 컨텍스트 재생성이 없다.
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

    const mid = from.clone().add(to).multiplyScalar(0.5);
    const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    const ctrl = mid.add(normal.multiplyScalar((a.curve ?? 0) * len * 0.35));
    const curve = new THREE.QuadraticBezierCurve3(from, ctrl, to);

    const SAMPLES = 24;
    const pts = curve.getPoints(SAMPLES);
    const width = 0.55;
    const positions: number[] = [];
    const headLen = Math.min(2.2, len * 0.25);

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
    mesh.position.y = 0.07;
    mesh.renderOrder = 1;
    group.add(mesh);
  }
}

/** 마운트 1회 생성되는 3D 세계 */
interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  arrowGroup: THREE.Group;
  ball: THREE.Mesh;
  bodyGeo: THREE.CapsuleGeometry;
  headGeo: THREE.SphereGeometry;
  teamMat: THREE.MeshLambertMaterial;
  oppMat: THREE.MeshLambertMaterial;
  headMat: THREE.MeshLambertMaterial;
  figures: Figures | null;
  lastArrows: Arrow[] | undefined;
}

/** board 구조(선수 구성)에 종속 — 구조가 바뀔 때만 재구성 */
interface Figures {
  signature: string;
  teamBody: THREE.InstancedMesh;
  oppBody: THREE.InstancedMesh;
  heads: THREE.InstancedMesh;
  sprites: Map<string, THREE.Sprite>;
  teamCount: number;
}

function figureSignature(frame: Frame): string {
  const key = (p: { id: string; role: string }) => `${p.id}:${p.role}`;
  return `${frame.players.map(key).join(',')}|${(frame.opponents ?? []).map(key).join(',')}`;
}

function disposeFigures(w: World): void {
  const f = w.figures;
  if (!f) return;
  w.scene.remove(f.teamBody, f.oppBody, f.heads);
  f.teamBody.dispose();
  f.oppBody.dispose();
  f.heads.dispose();
  for (const sprite of f.sprites.values()) {
    w.scene.remove(sprite);
    sprite.material.map?.dispose();
    sprite.material.dispose();
  }
  w.figures = null;
}

function buildFigures(w: World, frame: Frame): void {
  disposeFigures(w);
  const teamCount = frame.players.length;
  const oppCount = frame.opponents?.length ?? 0;

  const teamBody = new THREE.InstancedMesh(w.bodyGeo, w.teamMat, Math.max(teamCount, 1));
  const oppBody = new THREE.InstancedMesh(w.bodyGeo, w.oppMat, Math.max(oppCount, 1));
  const heads = new THREE.InstancedMesh(w.headGeo, w.headMat, Math.max(teamCount + oppCount, 1));
  teamBody.visible = teamCount > 0;
  oppBody.visible = oppCount > 0;
  heads.visible = teamCount + oppCount > 0;
  w.scene.add(teamBody, oppBody, heads);

  const sprites = new Map<string, THREE.Sprite>();
  for (const p of [...frame.players, ...(frame.opponents ?? [])]) {
    if (!p.role.trim()) continue;
    const tex = labelTexture(p.role, p.id.startsWith('o-'));
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
    );
    sprite.scale.set(4.2, 2.1, 1);
    sprites.set(p.id, sprite);
    w.scene.add(sprite);
  }

  w.figures = { signature: figureSignature(frame), teamBody, oppBody, heads, sprites, teamCount };
}

const dummy = new THREE.Object3D();

/** 프레임 → 씬 반영. 구조가 다르면 피규어 재구성, 아니면 매트릭스 갱신만 */
function applyFrame(w: World, frame: Frame): void {
  const sig = figureSignature(frame);
  if (!w.figures || w.figures.signature !== sig) buildFigures(w, frame);
  const f = w.figures!;

  frame.players.forEach((p, i) => {
    const x = toX(p.x);
    const z = toZ(p.y);
    dummy.position.set(x, 1.75, z);
    dummy.updateMatrix();
    f.teamBody.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 3.35, z);
    dummy.updateMatrix();
    f.heads.setMatrixAt(i, dummy.matrix);
    f.sprites.get(p.id)?.position.set(x, 5.1, z);
  });
  frame.opponents?.forEach((p, i) => {
    const x = toX(p.x);
    const z = toZ(p.y);
    dummy.position.set(x, 1.75, z);
    dummy.updateMatrix();
    f.oppBody.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 3.35, z);
    dummy.updateMatrix();
    f.heads.setMatrixAt(f.teamCount + i, dummy.matrix);
    f.sprites.get(p.id)?.position.set(x, 5.1, z);
  });
  f.teamBody.instanceMatrix.needsUpdate = true;
  f.oppBody.instanceMatrix.needsUpdate = true;
  f.heads.instanceMatrix.needsUpdate = true;

  w.ball.visible = !!frame.ball;
  if (frame.ball) w.ball.position.set(toX(frame.ball.x), 0.9, toZ(frame.ball.y));

  if (frame.arrows !== w.lastArrows) {
    w.lastArrows = frame.arrows;
    buildArrowGroup(frame.arrows, w.arrowGroup);
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

  const worldRef = useRef<World | null>(null);
  const playRef = useRef({ playing: false, pos: { step: 0, t: 1 } as Pos, speedIdx: 0 });
  const playedOnce = useRef(false);

  const frames = useMemo(() => buildFrames(board), [board]);
  const framesRef = useRef(frames);
  framesRef.current = frames;
  const last = frames.length - 1;
  const hasSteps = last >= 1;
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  playRef.current.playing = playing;
  playRef.current.speedIdx = speedIdx;

  // ── 마운트 1회: 렌더러·씬·카메라·루프 (board와 무관 — 편집 중 재생성 금지) ──
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let raf = 0;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1410);
    scene.fog = new THREE.Fog(0x0d1410, 150, 320);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
    camera.position.set(...CAMERA_PRESETS.broadcast.pos);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.6);
    sun.position.set(40, 80, 30);
    scene.add(sun);

    const pitchTex = pitchTexture();
    const pitchMat = new THREE.MeshLambertMaterial({ map: pitchTex });
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(68, 105), pitchMat);
    pitch.rotation.x = -Math.PI / 2;
    scene.add(pitch);

    const ballGeo = new THREE.SphereGeometry(0.9, 16, 12);
    const ballMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ball = new THREE.Mesh(ballGeo, ballMat);
    scene.add(ball);

    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);

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

    const world: World = {
      scene,
      camera,
      renderer,
      controls,
      arrowGroup,
      ball,
      bodyGeo: new THREE.CapsuleGeometry(0.85, 1.8, 4, 10),
      headGeo: new THREE.SphereGeometry(0.55, 12, 10),
      teamMat: new THREE.MeshLambertMaterial({ color: 0xfbbf24 }),
      oppMat: new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
      headMat: new THREE.MeshLambertMaterial({ color: 0xf1d5b5 }),
      figures: null,
      lastArrows: undefined,
    };
    worldRef.current = world;
    applyFrame(world, framesRef.current[0]);
    setStatus('ready');

    // 품질 자동 티어: fps 실측 → pixelRatio 하향 (탭 복귀 시 측정 창 리셋 — 리뷰 반영)
    let frameCount = 0;
    let tierStart = performance.now();
    let tier = 0;
    const resetMeasure = (now: number) => {
      frameCount = 0;
      tierStart = now;
    };
    const measureQuality = (now: number) => {
      frameCount++;
      if (frameCount < 60) return;
      const elapsed = now - tierStart;
      resetMeasure(now);
      if (elapsed > 4000) return; // 탭 숨김 등 비정상 창은 판정에서 제외
      const fps = (60 * 1000) / elapsed;
      if (fps < 28 && tier < 2) {
        tier++;
        renderer.setPixelRatio(tier === 1 ? 1 : 0.75);
        setQuality(tier === 1 ? '품질 자동 조정됨' : '저사양 모드');
        track('view3d_quality', { tactic: id, tier });
      }
    };

    let lastTick = 0;
    const loop = (now: number) => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      controls.update();
      measureQuality(now);

      const fr = framesRef.current;
      const lastIdx = fr.length - 1;
      const s = playRef.current;
      if (s.playing && lastIdx >= 1) {
        if (!lastTick) lastTick = now;
        let { step, t } = s.pos;
        t += ((now - lastTick) * SPEEDS[s.speedIdx]) / STEP_MS;
        if (t >= 1) {
          if (step < lastIdx) {
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
        // reduced-motion: 해당 단계의 "도착 상태"를 스틸 컷으로 — 캡션과 장면 일치 (리뷰 반영)
        applyFrame(
          world,
          reduced || t >= 1 ? fr[step] : interpolateFrames(fr[step - 1], fr[step], easeInOut(t))
        );
      } else if (!s.playing && s.pos.t >= 1) {
        applyFrame(world, fr[Math.min(s.pos.step, lastIdx)]);
      }
      lastTick = now;
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(loop);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        lastTick = 0;
        resetMeasure(performance.now()); // 숨김 시간이 fps 판정을 오염시키지 않도록
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
      disposeFigures(world);
      buildArrowGroup(undefined, arrowGroup);
      world.bodyGeo.dispose();
      world.headGeo.dispose();
      world.teamMat.dispose();
      world.oppMat.dispose();
      world.headMat.dispose();
      pitchTex.dispose();
      pitchMat.dispose();
      pitch.geometry.dispose();
      ballGeo.dispose();
      ballMat.dispose();
      renderer.dispose();
      worldRef.current = null;
      mount.replaceChildren();
    };
    // 마운트 1회 — board 변경은 아래 frames 이펙트가 증분 반영
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── board 변경: 재생 위치 리셋 + 씬 증분 반영 (렌더러 재생성 없음 — 리뷰 반영) ──
  useEffect(() => {
    const world = worldRef.current;
    if (!world) return;
    setPlaying(false);
    playRef.current.playing = false;
    playRef.current.pos = { step: 0, t: 1 };
    setPosUi(playRef.current.pos);
    applyFrame(world, frames[0]);
  }, [frames]);

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
    const world = worldRef.current;
    if (!world) return;
    const [x, y, z] = CAMERA_PRESETS[key].pos;
    world.camera.position.set(x, y, z);
    world.controls.target.set(0, 0, 0);
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

  // 캡션·단계 표기: board 교체 직후에도 범위 밖 접근 금지 + 일시정지 중에도 캡션 유지 (리뷰 반영)
  const shownStep = Math.min(posUi.step, last);
  const caption =
    hasSteps && shownStep >= 1 && (playing || posUi.t > 0) ? (frames[shownStep].caption ?? '') : '';

  return (
    <div className="board3d">
      <div ref={mountRef} className="board3d__canvas" />
      {status === 'loading' && <p className="board3d__loading">3D 로딩 중…</p>}
      {status === 'ready' && (
        <>
          {hasSteps && (
            <div className="playback__caption" aria-live="polite">
              <span className="playback__stepnum mono">
                {shownStep}/{last}
              </span>
              {caption || '▶ 재생으로 시퀀스 시작'}
            </div>
          )}
          <div className="playback__controls">
            {hasSteps && (
              <>
                <button
                  className="playback__btn"
                  onClick={() => seek(shownStep - 1)}
                  disabled={shownStep <= 1}
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
                  onClick={() => seek(shownStep + 1)}
                  disabled={shownStep >= last && posUi.t >= 1}
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
