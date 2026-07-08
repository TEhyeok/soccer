/**
 * 3D 전술 보드 스파이크 (v1.1-E4, ADR-008 검증용 PoC).
 * - three.js WebGPURenderer + WebGL2 자동 폴백
 * - 선수 22명 InstancedMesh(팀당 1 draw call), 베이크 조명 없음/실시간 그림자 금지
 * - steps 재생은 2D와 동일한 lib/playback 순수 함수를 재사용 (렌더러 독립 설계 증명)
 * - lazy-load 전용: App에서 React.lazy로만 임포트 — 기본 번들에 포함 금지
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Tactic } from '../types';
import { buildFrames, easeInOut, interpolateFrames, type Frame } from '../lib/playback';
import { track } from '../lib/analytics';

/** 논리 좌표(0~100) → 3D 좌표. 피치 68x105m, 중앙 원점, y=100(상대 골문)이 -z */
const toX = (x: number) => (x / 100 - 0.5) * 68;
const toZ = (y: number) => (0.5 - y / 100) * 105;

const CAMERA_PRESETS = {
  broadcast: { pos: [0, 55, 78], label: '방송' },
  top: { pos: [0, 125, 0.1], label: '탑다운' },
  goal: { pos: [0, 22, 92], label: '골대 뒤' },
} as const;
type PresetKey = keyof typeof CAMERA_PRESETS;

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
  // 페널티 박스 (양쪽)
  g.strokeRect(340 - 201, 10, 402, 165);
  g.strokeRect(340 - 91, 10, 182, 55);
  g.strokeRect(340 - 201, 1040 - 165, 402, 165);
  g.strokeRect(340 - 91, 1040 - 55, 182, 55);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

interface Props {
  tactic: Tactic;
}

export default function Board3D({ tactic }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading');
  const [backend, setBackend] = useState('');
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const [preset, setPreset] = useState<PresetKey>('broadcast');
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let raf = 0;

    const frames = buildFrames(tactic.board);
    const everyone = [...frames[0].players, ...(frames[0].opponents ?? [])];
    const teamCount = frames[0].players.length;

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

    // 피치
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(68, 105),
      new THREE.MeshLambertMaterial({ map: pitchTexture() })
    );
    pitch.rotation.x = -Math.PI / 2;
    scene.add(pitch);

    // 선수: 팀/상대 각각 InstancedMesh 1개 (draw call 최소화)
    const capsule = new THREE.CapsuleGeometry(1.1, 2.4, 4, 12);
    const teamMesh = new THREE.InstancedMesh(
      capsule,
      new THREE.MeshLambertMaterial({ color: 0xfbbf24 }),
      teamCount
    );
    const oppCount = everyone.length - teamCount;
    const oppMesh = new THREE.InstancedMesh(
      capsule,
      new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
      Math.max(oppCount, 1)
    );
    oppMesh.visible = oppCount > 0;
    scene.add(teamMesh, oppMesh);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 16, 12),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    scene.add(ball);

    const dummy = new THREE.Object3D();
    const applyFrame = (frame: Frame) => {
      frame.players.forEach((p, i) => {
        dummy.position.set(toX(p.x), 2.1, toZ(p.y));
        dummy.updateMatrix();
        teamMesh.setMatrixAt(i, dummy.matrix);
      });
      teamMesh.instanceMatrix.needsUpdate = true;
      frame.opponents?.forEach((p, i) => {
        dummy.position.set(toX(p.x), 2.1, toZ(p.y));
        dummy.updateMatrix();
        oppMesh.setMatrixAt(i, dummy.matrix);
      });
      if (frame.opponents) oppMesh.instanceMatrix.needsUpdate = true;
      const b = frame.ball;
      ball.visible = !!b;
      if (b) ball.position.set(toX(b.x), 0.9, toZ(b.y));
    };
    applyFrame(frames[0]);

    const renderer = new THREE.WebGPURenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // 품질 티어: 상한 1.5

    const resize = () => {
      const w = mount.clientWidth;
      const h = Math.min(window.innerHeight * 0.7, w * 1.1);
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    // 재생 상태 (2D와 동일한 보간 함수 재사용)
    let step = 1;
    let t = 0;
    const STEP_MS = 1600;
    let lastTick = 0;

    renderer
      .init()
      .then(() => {
        if (disposed) return;
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

        const backendType = (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend;
        setBackend(backendType ? 'WebGPU' : 'WebGL2 (폴백)');
        setStatus('ready');

        const loop = (now: number) => {
          if (disposed) return;
          raf = requestAnimationFrame(loop);
          controls.update();

          if (playingRef.current && frames.length > 1) {
            if (!lastTick) lastTick = now;
            t += (now - lastTick) / STEP_MS;
            if (t >= 1) {
              if (step < frames.length - 1) {
                step += 1;
                t = 0;
              } else {
                t = 1;
                playingRef.current = false;
                setPlaying(false);
              }
            }
            applyFrame(
              t >= 1
                ? frames[step]
                : interpolateFrames(frames[step - 1], frames[step], easeInOut(t))
            );
          }
          lastTick = now;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);
      })
      .catch(() => setStatus('unsupported'));

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      controlsRef.current?.dispose();
      renderer.dispose();
      capsule.dispose();
      pitch.geometry.dispose();
      mount.replaceChildren();
    };
  }, [tactic]);

  const play = () => {
    track('view3d_play', { tactic: tactic.id });
    playingRef.current = true;
    setPlaying(true);
  };

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    const cam = cameraRef.current;
    const controls = controlsRef.current;
    if (!cam || !controls) return;
    const [x, y, z] = CAMERA_PRESETS[key].pos;
    cam.position.set(x, y, z);
    controls.target.set(0, 0, 0);
  };

  if (status === 'unsupported') {
    return (
      <div className="empty">
        <p>이 기기는 3D 보기를 지원하지 않습니다. 2D 보드를 이용해 주세요.</p>
        <a className="chip chip--link" href={`#/t/${tactic.id}`}>
          ← 2D 보드로
        </a>
      </div>
    );
  }

  return (
    <div className="board3d">
      <div ref={mountRef} className="board3d__canvas" />
      {status === 'loading' && <p className="board3d__loading">3D 로딩 중…</p>}
      {status === 'ready' && (
        <>
          <div className="playback__controls">
            {tactic.board.steps?.length ? (
              <button
                className="playback__btn playback__btn--main"
                onClick={play}
                disabled={playing}
              >
                {playing ? '⏸' : '▶'}
              </button>
            ) : null}
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
          <p className="board3d__meta">
            렌더러: <b>{backend}</b> · 드래그로 회전, 휠/핀치로 확대 — 3D 보기 베타 (스파이크)
          </p>
        </>
      )}
    </div>
  );
}
