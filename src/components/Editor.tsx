import { useEffect, useMemo, useRef, useState } from 'react';
import type { Arrow, ArrowKind, Board, PlayerPos } from '../types';
import { fromClient } from '../lib/coords';
import { track } from '../lib/analytics';
import { shareBoardImage } from '../lib/exportImage';
import {
  clearDraft,
  loadDraft,
  newCustomId,
  saveDraft,
  upsertCustomTactic,
  type Draft,
} from '../lib/customTactics';
import { TACTICS } from '../data';
import PitchBoard from './PitchBoard';

type Tool = 'move' | ArrowKind | 'ball';

const TOOLS: Array<{ key: Tool; label: string }> = [
  { key: 'move', label: '↖ 선택·이동' },
  { key: 'run', label: '이동 화살표' },
  { key: 'pass', label: '패스 화살표' },
  { key: 'press', label: '압박 화살표' },
  { key: 'ball', label: '⚽ 공 놓기' },
];

const EMPTY_BOARD: Board = { players: [] };

/** 빈 보드 대신 시작점으로 쓸 기본 4-4-2 배치 */
function default442(): Board {
  const P = (id: string, role: string, x: number, y: number): PlayerPos => ({ id, role, x, y });
  return {
    players: [
      P('gk', 'GK', 50, 6),
      P('lb', 'LB', 15, 22),
      P('cb1', 'CB', 37, 18),
      P('cb2', 'CB', 63, 18),
      P('rb', 'RB', 85, 22),
      P('lm', 'LM', 13, 50),
      P('cm1', 'CM', 38, 46),
      P('cm2', 'CM', 62, 46),
      P('rm', 'RM', 87, 50),
      P('st1', 'ST', 38, 76),
      P('st2', 'ST', 62, 76),
    ],
  };
}

/** 템플릿 보드 복사 — steps는 편집 대상이 아니므로 제거 (v1.2 정책, ADR-002) */
export function boardFromTemplate(board: Board): Board {
  return JSON.parse(JSON.stringify({ ...board, steps: undefined })) as Board;
}

interface Props {
  /** '#/editor/:id' 로 저장된 내 전술을 여는 경우 */
  editingId?: string;
}

export default function Editor({ editingId }: Props) {
  // 시작 상태: 저장본 편집 > draft 복원 > 시작 화면
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (editingId) {
      const saved = loadDraft();
      if (saved?.editingId === editingId) return saved;
      return null; // MyTactics에서 열 때 draft를 세팅해줌 — 직접 진입 폴백은 아래 effect
    }
    return loadDraft();
  });
  const [tool, setTool] = useState<Tool>('move');
  const [selected, setSelected] = useState<string | null>(null);
  const [tempArrow, setTempArrow] = useState<Arrow | null>(null);
  const [history, setHistory] = useState<Board[]>([]);
  const [shareBusy, setShareBusy] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ kind: 'player' | 'arrow' | null; id?: string; moved: boolean }>({
    kind: null,
    moved: false,
  });
  const counter = useRef(1);

  // draft 자동 저장 (강제 새로고침 복원 — v1.2 게이트)
  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => saveDraft(draft), 400);
    return () => clearTimeout(t);
  }, [draft]);

  const board = draft?.board ?? EMPTY_BOARD;

  const setBoard = (next: Board, pushHistory = true) => {
    setDraft((d) => (d ? { ...d, board: next } : d));
    if (pushHistory) setHistory((h) => [...h.slice(-49), board]);
  };

  const start = (name: string, b: Board, source?: Draft['source']) => {
    setDraft({ name, board: JSON.parse(JSON.stringify(b)) as Board, source, editingId });
    setHistory([]);
    track('board_created', { from: source ? 'template' : 'blank' });
  };

  // ── 시작 화면 ──
  const formations = useMemo(() => TACTICS.filter((t) => t.category === 'formation'), []);
  if (!draft) {
    return (
      <div className="editor">
        <h1 className="editor__title">새 전술 보드</h1>
        <p className="sec-note" style={{ marginBottom: 16 }}>
          어디서 시작할까요? 만든 보드는 이 브라우저에 저장되고, 이미지로 단톡에 공유할 수 있습니다.
        </p>
        <div className="chips" style={{ marginBottom: 20 }}>
          <button className="chip chip--active" onClick={() => start('새 전술', default442())}>
            기본 11명 (4-4-2)로 시작
          </button>
          <button className="chip" onClick={() => start('새 전술', EMPTY_BOARD)}>
            빈 보드로 시작
          </button>
        </div>
        <h2 style={{ fontSize: 15, marginBottom: 10 }}>또는 포메이션 템플릿에서</h2>
        <div className="chips">
          {formations.map((f) => (
            <button
              key={f.id}
              className="chip"
              onClick={() =>
                start(`${f.name} (내 버전)`, boardFromTemplate(f.board), {
                  id: f.id,
                  name: f.name,
                })
              }
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── 포인터 인터랙션 ──
  const logical = (e: { clientX: number; clientY: number }) =>
    svgRef.current ? fromClient(svgRef.current, e.clientX, e.clientY) : { x: 50, y: 50 };

  const findPlayer = (id: string) =>
    board.players.find((p) => p.id === id) ?? board.opponents?.find((p) => p.id === id);

  const onPlayerDown = (id: string, e: React.PointerEvent<SVGGElement>) => {
    if (tool !== 'move') return;
    e.stopPropagation();
    setSelected(id);
    dragRef.current = { kind: 'player', id, moved: false };
    svgRef.current?.setPointerCapture(e.pointerId);
    setHistory((h) => [...h.slice(-49), board]);
  };

  const onBoardDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = logical(e);
    if (tool === 'move') {
      setSelected(null);
      return;
    }
    if (tool === 'ball') {
      setBoard({ ...board, ball: pt });
      return;
    }
    // 화살표 그리기 시작
    dragRef.current = { kind: 'arrow', moved: false };
    setTempArrow({ from: pt, to: pt, kind: tool });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onBoardMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag.kind) return;
    const pt = logical(e);
    drag.moved = true;
    if (drag.kind === 'player' && drag.id) {
      const move = (p: PlayerPos) => (p.id === drag.id ? { ...p, ...pt } : p);
      setBoard(
        {
          ...board,
          players: board.players.map(move),
          opponents: board.opponents?.map(move),
        },
        false
      );
    } else if (drag.kind === 'arrow') {
      setTempArrow((a) => (a ? { ...a, to: pt } : a));
    }
  };

  const onBoardUp = () => {
    const drag = dragRef.current;
    if (drag.kind === 'arrow' && tempArrow) {
      const len = Math.hypot(tempArrow.to.x - tempArrow.from.x, tempArrow.to.y - tempArrow.from.y);
      if (len >= 4) {
        setBoard({ ...board, arrows: [...(board.arrows ?? []), tempArrow] });
      }
      setTempArrow(null);
    }
    if (drag.kind === 'player' && !drag.moved) {
      // 이동 없는 탭 — 히스토리 되돌림 (불필요한 undo 스텝 방지)
      setHistory((h) => h.slice(0, -1));
    }
    dragRef.current = { kind: null, moved: false };
  };

  // ── 팔레트 동작 ──
  const addPlayer = (opponent: boolean) => {
    const id = `${opponent ? 'o-p' : 'p'}${counter.current++}${Date.now() % 1000}`;
    const p: PlayerPos = { id, role: opponent ? '' : 'P', x: 50, y: opponent ? 60 : 40 };
    setBoard(
      opponent
        ? { ...board, opponents: [...(board.opponents ?? []), p] }
        : { ...board, players: [...board.players, p] }
    );
    setSelected(id);
    setTool('move');
  };

  const removeSelected = () => {
    if (!selected) return;
    setBoard({
      ...board,
      players: board.players.filter((p) => p.id !== selected),
      opponents: board.opponents?.filter((p) => p.id !== selected),
    });
    setSelected(null);
  };

  const setRole = (role: string) => {
    const up = (p: PlayerPos) => (p.id === selected ? { ...p, role: role.toUpperCase() } : p);
    setBoard(
      { ...board, players: board.players.map(up), opponents: board.opponents?.map(up) },
      false
    );
  };

  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setDraft((d) => (d ? { ...d, board: prev } : d));
      return h.slice(0, -1);
    });
  };

  const save = () => {
    const id = draft.editingId ?? newCustomId();
    upsertCustomTactic({
      id,
      name: draft.name.trim() || '이름 없는 전술',
      updatedAt: Date.now(),
      board,
      source: draft.source,
    });
    clearDraft();
    window.location.hash = '#/my';
  };

  const share = async () => {
    if (!svgRef.current || shareBusy) return;
    setShareBusy(true);
    try {
      await shareBoardImage(svgRef.current, draft.name || '내 전술');
    } finally {
      setShareBusy(false);
    }
  };

  const discard = () => {
    clearDraft();
    setDraft(null);
    setSelected(null);
    setHistory([]);
  };

  const selectedPlayer = selected ? findPlayer(selected) : undefined;

  return (
    <div className="editor">
      <div className="editor__head">
        <input
          className="editor__name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          aria-label="전술 이름"
          placeholder="전술 이름"
          maxLength={30}
        />
        {draft.source && (
          <a className="editor__source" href={`#/t/${draft.source.id}`}>
            원본: {draft.source.name}
          </a>
        )}
      </div>

      <div className="editor__tools" role="toolbar" aria-label="편집 도구">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            className={tool === t.key ? 'chip chip--active' : 'chip'}
            onClick={() => setTool(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="editor__board">
        <PitchBoard
          board={board}
          title={draft.name}
          editor={{
            svgRef,
            onBoardPointerDown: onBoardDown,
            onBoardPointerMove: onBoardMove,
            onBoardPointerUp: onBoardUp,
            onPlayerPointerDown: onPlayerDown,
            selectedId: selected,
            tempArrow,
          }}
        />
      </div>

      <div className="editor__palette">
        <button className="chip" onClick={() => addPlayer(false)}>
          + 우리 선수
        </button>
        <button className="chip" onClick={() => addPlayer(true)}>
          + 상대 선수
        </button>
        {board.ball && (
          <button className="chip" onClick={() => setBoard({ ...board, ball: undefined })}>
            공 제거
          </button>
        )}
        <button className="chip" onClick={undo} disabled={history.length === 0}>
          ↩ 되돌리기
        </button>
        {(board.arrows?.length ?? 0) > 0 && (
          <button className="chip" onClick={() => setBoard({ ...board, arrows: [] })}>
            화살표 비우기
          </button>
        )}
      </div>

      {selectedPlayer && (
        <div className="editor__selected">
          <span>선택: </span>
          <input
            className="editor__role"
            value={selectedPlayer.role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={3}
            aria-label="선수 라벨"
            placeholder="라벨"
          />
          <button className="chip" onClick={removeSelected}>
            선수 삭제
          </button>
        </div>
      )}

      <div className="editor__actions">
        <button className="editor__save" onClick={save}>
          저장
        </button>
        <button className="chip chip--link" onClick={share} disabled={shareBusy}>
          {shareBusy ? '이미지 만드는 중…' : '📤 이미지로 공유'}
        </button>
        <button className="chip" onClick={discard}>
          버리고 새로 시작
        </button>
      </div>
    </div>
  );
}
