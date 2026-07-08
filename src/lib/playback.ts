/**
 * 시퀀스 재생 엔진 — 순수 함수 (ADR-002).
 * 렌더러 독립: 2D SVG(PitchBoard)와 v1.1.5 3D 뷰어가 동일한 함수를 공유한다.
 */
import type { Arrow, Board, PlayerPos, Point } from '../types';

export interface Frame {
  players: PlayerPos[];
  opponents?: PlayerPos[];
  arrows?: Arrow[];
  ball?: Point;
  caption?: string;
}

/**
 * 보드 → 누적 프레임 목록.
 * frames[0] = 기본 보드(정적 상태), frames[i] = steps[i-1] 적용 후 상태.
 * steps가 없으면 프레임 1개 — 기존 보드는 "1단계 시퀀스"다.
 */
export function buildFrames(board: Board): Frame[] {
  const frames: Frame[] = [
    {
      players: board.players,
      opponents: board.opponents,
      arrows: board.arrows,
      ball: board.ball,
    },
  ];
  let players = board.players;
  let opponents = board.opponents;
  let ball = board.ball;

  for (const step of board.steps ?? []) {
    const move = (p: PlayerPos): PlayerPos => {
      const next = step.positions?.[p.id];
      return next ? { ...p, x: next.x, y: next.y } : p;
    };
    players = players.map(move);
    opponents = opponents?.map(move);
    ball = step.ball ?? ball;
    frames.push({ players, opponents, arrows: step.arrows, ball, caption: step.caption });
  }
  return frames;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

/** 0~1 구간 easing (부드러운 가감속) */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (1 - t) * (1 - t) * 2;
}

/**
 * 프레임 from → to 보간 (t: 0~1). 선수는 id로 대응시켜 좌표를 선형 보간한다.
 * 화살표·캡션은 도착 프레임의 것을 표시한다 (이번 단계에서 일어나는 움직임 안내).
 */
export function interpolateFrames(from: Frame, to: Frame, t: number): Frame {
  if (t >= 1) return to;
  const byId = new Map(from.players.map((p) => [p.id, p]));
  const byIdOpp = new Map((from.opponents ?? []).map((p) => [p.id, p]));

  const tween = (source: Map<string, PlayerPos>) => (p: PlayerPos) => {
    const prev = source.get(p.id);
    return prev ? { ...p, ...lerpPoint(prev, p, t) } : p;
  };

  return {
    players: to.players.map(tween(byId)),
    opponents: to.opponents?.map(tween(byIdOpp)),
    arrows: to.arrows,
    ball: from.ball && to.ball ? lerpPoint(from.ball, to.ball, t) : (to.ball ?? from.ball),
    caption: to.caption,
  };
}

/** Frame → PitchBoard가 받는 Board 형태 (steps 없는 정적 보드) */
export function frameToBoard(frame: Frame): Board {
  return {
    players: frame.players,
    opponents: frame.opponents,
    arrows: frame.arrows,
    ball: frame.ball,
  };
}
