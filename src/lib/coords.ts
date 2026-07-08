/**
 * 보드 좌표 변환 (M0-E3에서 분리 — v1.2 편집기의 역변환에 사용).
 * 논리 좌표: x 0~100(좌→우), y 0~100(자기 골문→상대 골문)
 * SVG 좌표: viewBox 0 0 (W+2*PAD) (H+2*PAD), y축 아래 방향
 */
import type { Point } from '../types';

/** 실측 비율(68m x 105m) 기반 세로형 축구장 */
export const PITCH_W = 68;
export const PITCH_H = 105;
export const PITCH_PAD = 3;
export const VIEW_W = PITCH_W + PITCH_PAD * 2;
export const VIEW_H = PITCH_H + PITCH_PAD * 2;

/** 논리 → SVG */
export function toSvg(p: Point): { x: number; y: number } {
  return {
    x: PITCH_PAD + (p.x / 100) * PITCH_W,
    y: PITCH_PAD + ((100 - p.y) / 100) * PITCH_H, // y=100(상대 골문)이 화면 위쪽
  };
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n * 10) / 10));

/**
 * 화면(client) 좌표 → 논리 좌표. 편집기의 드래그/그리기 역변환.
 * SVG 기본 preserveAspectRatio(xMidYMid meet)의 레터박스를 보정한다 —
 * max-height 등으로 요소 박스가 viewBox 비율과 다를 때 좌표가 어긋나는 것 방지.
 */
export function fromClient(svg: SVGSVGElement, clientX: number, clientY: number): Point {
  const rect = svg.getBoundingClientRect();
  const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H);
  const offsetX = (rect.width - VIEW_W * scale) / 2;
  const offsetY = (rect.height - VIEW_H * scale) / 2;
  const sx = (clientX - rect.left - offsetX) / scale;
  const sy = (clientY - rect.top - offsetY) / scale;
  return {
    x: clamp(((sx - PITCH_PAD) / PITCH_W) * 100),
    y: clamp(100 - ((sy - PITCH_PAD) / PITCH_H) * 100),
  };
}
