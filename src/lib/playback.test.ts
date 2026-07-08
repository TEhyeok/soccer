import { describe, expect, it } from 'vitest';
import type { Board } from '../types';
import { buildFrames, easeInOut, frameToBoard, interpolateFrames } from './playback';

const board: Board = {
  players: [
    { id: 'st', role: 'ST', x: 50, y: 70 },
    { id: 'cm', role: 'CM', x: 40, y: 50 },
  ],
  opponents: [{ id: 'o-cb', role: 'CB', x: 50, y: 80 }],
  ball: { x: 40, y: 52 },
  arrows: [{ from: { x: 40, y: 52 }, to: { x: 55, y: 72 }, kind: 'pass' }],
  steps: [
    {
      caption: '스트라이커가 침투한다',
      positions: { st: { x: 60, y: 90 } },
      ball: { x: 60, y: 88 },
    },
    {
      caption: '수비가 따라온다',
      positions: { 'o-cb': { x: 58, y: 86 } },
    },
  ],
};

describe('buildFrames (누적 상태 계산)', () => {
  it('frames[0]은 기본 보드다 — steps 없는 전술은 1프레임 (ADR-002)', () => {
    const frames = buildFrames({ players: board.players });
    expect(frames).toHaveLength(1);
    expect(frames[0].players).toEqual(board.players);
  });

  it('각 단계는 직전 상태에 누적 적용된다', () => {
    const frames = buildFrames(board);
    expect(frames).toHaveLength(3);
    // 1단계: st 이동, cm은 유지
    expect(frames[1].players.find((p) => p.id === 'st')).toMatchObject({ x: 60, y: 90 });
    expect(frames[1].players.find((p) => p.id === 'cm')).toMatchObject({ x: 40, y: 50 });
    expect(frames[1].ball).toEqual({ x: 60, y: 88 });
    // 2단계: 상대 이동, st는 1단계 위치 유지, 공도 유지
    expect(frames[2].opponents?.[0]).toMatchObject({ x: 58, y: 86 });
    expect(frames[2].players.find((p) => p.id === 'st')).toMatchObject({ x: 60, y: 90 });
    expect(frames[2].ball).toEqual({ x: 60, y: 88 });
  });

  it('단계 캡션과 화살표가 프레임에 실린다', () => {
    const frames = buildFrames(board);
    expect(frames[1].caption).toBe('스트라이커가 침투한다');
    expect(frames[0].arrows).toHaveLength(1); // 기본 보드 화살표
    expect(frames[1].arrows).toBeUndefined(); // 단계에 화살표 없으면 없음
  });
});

describe('interpolateFrames (id 기반 트위닝)', () => {
  const frames = buildFrames(board);

  it('t=0.5에서 이동 선수는 중간 지점, 나머지는 제자리', () => {
    const mid = interpolateFrames(frames[0], frames[1], 0.5);
    expect(mid.players.find((p) => p.id === 'st')).toMatchObject({ x: 55, y: 80 });
    expect(mid.players.find((p) => p.id === 'cm')).toMatchObject({ x: 40, y: 50 });
  });

  it('t=1은 도착 프레임 그대로', () => {
    expect(interpolateFrames(frames[0], frames[1], 1)).toBe(frames[1]);
  });

  it('공도 함께 보간된다', () => {
    const mid = interpolateFrames(frames[0], frames[1], 0.5);
    expect(mid.ball).toEqual({ x: 50, y: 70 });
  });

  it('화살표·캡션은 도착 프레임의 것을 쓴다', () => {
    const mid = interpolateFrames(frames[0], frames[1], 0.3);
    expect(mid.caption).toBe('스트라이커가 침투한다');
    expect(mid.arrows).toBeUndefined();
  });
});

describe('easeInOut / frameToBoard', () => {
  it('easing은 0→0, 0.5→0.5, 1→1을 보존한다', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
  });

  it('frameToBoard는 PitchBoard가 그릴 수 있는 정적 보드를 만든다', () => {
    const b = frameToBoard(buildFrames(board)[1]);
    expect(b.steps).toBeUndefined();
    expect(b.players).toHaveLength(2);
  });
});
