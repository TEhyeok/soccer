import type { PointerEvent as ReactPointerEvent, Ref } from 'react';
import type { Arrow, Board, Point } from '../types';
import { PITCH_H, PITCH_PAD, PITCH_W, toSvg, VIEW_H, VIEW_W } from '../lib/coords';

const W = PITCH_W;
const H = PITCH_H;
const PAD = PITCH_PAD;
const px = (p: Point) => toSvg(p);

const ARROW_STYLE: Record<Arrow['kind'], { stroke: string; dash?: string }> = {
  run: { stroke: 'var(--arrow-run)' },
  pass: { stroke: 'var(--arrow-pass)', dash: '2.2 1.6' },
  press: { stroke: 'var(--arrow-press)' },
};

function arrowPath(a: Arrow): string {
  const from = px(a.from);
  const to = px(a.to);
  if (!a.curve) {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // 진행 방향의 법선 벡터 방향으로 제어점 이동
  const cx = mx + (-dy / len) * a.curve * len * 0.35;
  const cy = my + (dx / len) * a.curve * len * 0.35;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

/** 편집기 모드 옵션 (v1.2-E2) — 없으면 기존과 완전히 동일한 정적 렌더 */
export interface EditorHooks {
  svgRef: Ref<SVGSVGElement>;
  onBoardPointerDown?: (e: ReactPointerEvent<SVGSVGElement>) => void;
  onBoardPointerMove?: (e: ReactPointerEvent<SVGSVGElement>) => void;
  onBoardPointerUp?: (e: ReactPointerEvent<SVGSVGElement>) => void;
  onPlayerPointerDown?: (id: string, e: ReactPointerEvent<SVGGElement>) => void;
  selectedId?: string | null;
  /** 그리는 중인 화살표 미리보기 */
  tempArrow?: Arrow | null;
}

interface Props {
  board: Board;
  mini?: boolean;
  title?: string;
  editor?: EditorHooks;
}

export default function PitchBoard({ board, mini = false, title, editor }: Props) {
  const vw = VIEW_W;
  const vh = VIEW_H;
  const r = mini ? 2.6 : 2.9; // 선수 마커 반지름
  const line = 'var(--pitch-line)';

  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className={mini ? 'pitch pitch--mini' : 'pitch'}
      role="img"
      aria-label={title ? `${title} 전술 보드` : '전술 보드'}
      ref={editor?.svgRef}
      onPointerDown={editor?.onBoardPointerDown}
      onPointerMove={editor?.onBoardPointerMove}
      onPointerUp={editor?.onBoardPointerUp}
      style={editor ? { touchAction: 'none' } : undefined}
    >
      <defs>
        {(['run', 'pass', 'press'] as const).map((kind) => (
          <marker
            key={kind}
            id={`ah-${kind}`}
            viewBox="0 0 8 8"
            refX="6.5"
            refY="4"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0.5 0.5 L 7.5 4 L 0.5 7.5 z" fill={ARROW_STYLE[kind].stroke} />
          </marker>
        ))}
      </defs>

      {/* 잔디 */}
      <rect x="0" y="0" width={vw} height={vh} rx="2.5" fill="var(--pitch-grass)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect
          key={i}
          x={PAD}
          y={PAD + i * (H / 7)}
          width={W}
          height={H / 7}
          fill={i % 2 === 0 ? 'var(--pitch-stripe)' : 'transparent'}
        />
      ))}

      {/* 라인 */}
      <g stroke={line} strokeWidth="0.55" fill="none">
        <rect x={PAD} y={PAD} width={W} height={H} />
        <line x1={PAD} y1={PAD + H / 2} x2={PAD + W} y2={PAD + H / 2} />
        <circle cx={PAD + W / 2} cy={PAD + H / 2} r="9.15" />
        {/* 페널티/골 에어리어: 위(상대) & 아래(우리) */}
        <rect x={PAD + (W - 40.3) / 2} y={PAD} width="40.3" height="16.5" />
        <rect x={PAD + (W - 18.3) / 2} y={PAD} width="18.3" height="5.5" />
        <rect x={PAD + (W - 40.3) / 2} y={PAD + H - 16.5} width="40.3" height="16.5" />
        <rect x={PAD + (W - 18.3) / 2} y={PAD + H - 5.5} width="18.3" height="5.5" />
        <path
          d={`M ${PAD + W / 2 - 7.3} ${PAD + 16.5} A 9.15 9.15 0 0 0 ${PAD + W / 2 + 7.3} ${PAD + 16.5}`}
        />
        <path
          d={`M ${PAD + W / 2 - 7.3} ${PAD + H - 16.5} A 9.15 9.15 0 0 1 ${PAD + W / 2 + 7.3} ${PAD + H - 16.5}`}
        />
      </g>
      <g fill={line}>
        <circle cx={PAD + W / 2} cy={PAD + H / 2} r="0.7" />
        <circle cx={PAD + W / 2} cy={PAD + 11} r="0.7" />
        <circle cx={PAD + W / 2} cy={PAD + H - 11} r="0.7" />
      </g>

      {/* 화살표 */}
      {board.arrows?.map((a, i) => (
        <path
          key={i}
          d={arrowPath(a)}
          stroke={ARROW_STYLE[a.kind].stroke}
          strokeDasharray={ARROW_STYLE[a.kind].dash}
          strokeWidth={mini ? 0.8 : 1}
          strokeLinecap="round"
          fill="none"
          markerEnd={`url(#ah-${a.kind})`}
          opacity="0.95"
        />
      ))}

      {/* 그리는 중인 화살표 (편집기) */}
      {editor?.tempArrow && (
        <path
          d={arrowPath(editor.tempArrow)}
          stroke={ARROW_STYLE[editor.tempArrow.kind].stroke}
          strokeDasharray={ARROW_STYLE[editor.tempArrow.kind].dash}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          markerEnd={`url(#ah-${editor.tempArrow.kind})`}
          opacity="0.6"
        />
      )}

      {/* 상대 팀 */}
      {board.opponents?.map((p) => {
        const c = px(p);
        return (
          <g
            key={p.id}
            opacity="0.85"
            onPointerDown={editor ? (e) => editor.onPlayerPointerDown?.(p.id, e) : undefined}
          >
            {editor?.selectedId === p.id && (
              <circle
                cx={c.x}
                cy={c.y}
                r={r * 1.35}
                fill="none"
                stroke="#fff"
                strokeWidth="0.5"
                strokeDasharray="1.2 0.8"
              />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={r * 0.9}
              fill="var(--opp-fill)"
              stroke="var(--opp-stroke)"
              strokeWidth="0.4"
            />
            {!mini && (
              <text
                x={c.x}
                y={c.y + 1.1}
                textAnchor="middle"
                fontSize="2.6"
                fill="var(--opp-text)"
                fontWeight="700"
              >
                {p.role}
              </text>
            )}
          </g>
        );
      })}

      {/* 우리 팀 */}
      {board.players.map((p) => {
        const c = px(p);
        return (
          <g
            key={p.id}
            onPointerDown={editor ? (e) => editor.onPlayerPointerDown?.(p.id, e) : undefined}
          >
            {editor?.selectedId === p.id && (
              <circle
                cx={c.x}
                cy={c.y}
                r={r * 1.35}
                fill="none"
                stroke="#fff"
                strokeWidth="0.5"
                strokeDasharray="1.2 0.8"
              />
            )}
            <circle
              cx={c.x}
              cy={c.y}
              r={r}
              fill="var(--team-fill)"
              stroke="var(--team-stroke)"
              strokeWidth="0.45"
            />
            <text
              x={c.x}
              y={c.y + 1.1}
              textAnchor="middle"
              fontSize={mini ? 2.4 : 2.7}
              fill="var(--team-text)"
              fontWeight="700"
            >
              {p.role}
            </text>
          </g>
        );
      })}

      {/* 공 */}
      {board.ball &&
        (() => {
          const c = px(board.ball);
          return (
            <g>
              <circle cx={c.x} cy={c.y} r="1.5" fill="#fff" stroke="#1a1a1a" strokeWidth="0.35" />
              <circle cx={c.x} cy={c.y} r="0.55" fill="#1a1a1a" />
            </g>
          );
        })()}
    </svg>
  );
}
