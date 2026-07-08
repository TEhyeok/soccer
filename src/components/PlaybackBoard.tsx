import { useEffect, useMemo, useRef, useState } from 'react';
import type { Board } from '../types';
import { buildFrames, easeInOut, frameToBoard, interpolateFrames } from '../lib/playback';
import { track } from '../lib/analytics';
import PitchBoard from './PitchBoard';

/** 단계 전환 기본 시간 (1x 기준) */
const STEP_MS = 1600;
/** reduced-motion: 트위닝 없이 단계 스틸 컷을 이 간격으로 넘긴다 */
const STILL_MS = 2000;

const SPEEDS = [1, 1.5, 2] as const;

interface Props {
  board: Board;
  title?: string;
  tacticId: string;
}

/** step: 도착 프레임 인덱스(1..n-1), t: 해당 단계 진행도 0~1 */
interface Pos {
  step: number;
  t: number;
}

/**
 * 시퀀스 재생 보드 (v1.1-E1).
 * steps가 있는 전술의 상세 화면에서 PitchBoard를 감싸 재생 컨트롤을 제공한다.
 * 보간은 lib/playback.ts 순수 함수 — 렌더러(2D/3D) 독립.
 */
export default function PlaybackBoard({ board, title, tacticId }: Props) {
  const frames = useMemo(() => buildFrames(board), [board]);
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState<Pos>({ step: 1, t: 0 });
  const [speedIdx, setSpeedIdx] = useState(0);
  const playedOnce = useRef(false);

  const last = frames.length - 1;
  const atEnd = pos.step === last && pos.t >= 1;

  // rAF 루프 — pos 갱신은 순수 updater로만
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let lastTick = performance.now();
    const duration = reduced ? STILL_MS : STEP_MS;

    const tick = (now: number) => {
      const dt = (now - lastTick) * SPEEDS[speedIdx];
      lastTick = now;
      setPos((prev) => {
        const nt = prev.t + dt / duration;
        if (nt < 1) return { ...prev, t: nt };
        if (prev.step < last) return { step: prev.step + 1, t: 0 };
        return { step: prev.step, t: 1 };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speedIdx, reduced, last]);

  // 마지막 단계 완료 시 자동 정지
  useEffect(() => {
    if (playing && atEnd) setPlaying(false);
  }, [playing, atEnd]);

  const play = () => {
    if (!playedOnce.current) {
      playedOnce.current = true;
      track('sequence_play', { tactic: tacticId });
    }
    setStarted(true);
    if (atEnd) setPos({ step: 1, t: 0 });
    setPlaying(true);
  };

  const seek = (target: number) => {
    setPlaying(false);
    setStarted(true);
    setPos({ step: Math.max(1, Math.min(last, target)), t: 1 });
  };

  const displayFrame = !started
    ? frames[0]
    : reduced || pos.t >= 1
      ? frames[pos.t >= 1 ? pos.step : pos.step - 1]
      : interpolateFrames(frames[pos.step - 1], frames[pos.step], easeInOut(pos.t));

  const caption = !started
    ? '기본 대형 — ▶ 재생으로 시퀀스 시작'
    : (displayFrame.caption ?? '기본 대형');

  return (
    <div className="playback">
      <PitchBoard board={frameToBoard(displayFrame)} title={title} />

      <div className="playback__caption" aria-live="polite">
        <span className="playback__stepnum mono">
          {started ? `${pos.step}/${last}` : `0/${last}`}
        </span>
        {caption}
      </div>

      <div className="playback__controls">
        <button
          className="playback__btn"
          onClick={() => seek(pos.step - 1)}
          disabled={!started || pos.step <= 1}
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
          onClick={() => seek(started ? pos.step + 1 : 1)}
          disabled={started && atEnd}
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
      </div>
    </div>
  );
}
