/**
 * 스키마 v2 마이그레이션 (ADR-001): 보드 선수에 id 부여 + 화살표 subjectId 자동 매핑.
 * 단일 tactics.ts를 카테고리별 파일로 분리 생성한다 (데이터-코드 분리).
 *
 * 규칙 (수기 편집 금지 — 반드시 이 스크립트로만):
 * - players: role 소문자 슬러그. 같은 role이 여럿이면 1부터 접미사 (cb1, cb2).
 * - opponents: 'o-' 접두사 + 같은 규칙. role이 ''이면 'o-x1' 형식.
 * - arrows.subjectId: from 좌표에서 거리 4 이내의 가장 가까운 선수. 없으면 미부여.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { TACTICS } from '../src/data';
import type { Arrow, Board, Category, PlayerPos, Tactic } from '../src/types';

const slug = (role: string) => role.toLowerCase().replace(/[^a-z0-9]/g, '');

/** 이미 id가 있으면 보존한다 (멱등 — 배포된 id는 불변, 로드맵 원칙 5). 재실행 시 카테고리 파일을 덮어쓴다. */
function assignIds(list: (Omit<PlayerPos, 'id'> & { id?: string })[], prefix: string): PlayerPos[] {
  const totals = new Map<string, number>();
  for (const p of list) {
    const base = slug(p.role) || 'x';
    totals.set(base, (totals.get(base) ?? 0) + 1);
  }
  const seen = new Map<string, number>();
  return list.map((p) => {
    const base = slug(p.role) || 'x';
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const needsIndex = (totals.get(base) ?? 0) > 1 || base === 'x';
    const { id: existing, ...rest } = p;
    return { id: existing ?? `${prefix}${base}${needsIndex ? n : ''}`, ...rest };
  });
}

function nearestSubject(
  arrow: Omit<Arrow, 'subjectId'>,
  everyone: PlayerPos[]
): string | undefined {
  let best: { id: string; d: number } | undefined;
  for (const p of everyone) {
    const d = Math.hypot(p.x - arrow.from.x, p.y - arrow.from.y);
    if (!best || d < best.d) best = { id: p.id, d };
  }
  return best && best.d <= 4 ? best.id : undefined;
}

function migrateBoard(board: Board): Board {
  const players = assignIds(board.players, '');
  const opponents = board.opponents ? assignIds(board.opponents, 'o-') : undefined;
  const everyone = [...players, ...(opponents ?? [])];
  const arrows = board.arrows?.map((a) => {
    const subjectId = nearestSubject(a, everyone);
    return subjectId ? { ...a, subjectId } : { ...a };
  });
  return {
    players,
    ...(opponents ? { opponents } : {}),
    ...(arrows ? { arrows } : {}),
    ...(board.ball ? { ball: board.ball } : {}),
  };
}

const FILES: Record<Category, { file: string; constName: string; label: string }> = {
  formation: { file: 'formations.ts', constName: 'FORMATION_TACTICS', label: '포메이션' },
  attack: { file: 'attack.ts', constName: 'ATTACK_TACTICS', label: '공격 전술' },
  defense: { file: 'defense.ts', constName: 'DEFENSE_TACTICS', label: '수비 전술' },
  pressing: { file: 'pressing.ts', constName: 'PRESSING_TACTICS', label: '압박·전환' },
  setpiece: { file: 'setpieces.ts', constName: 'SETPIECE_TACTICS', label: '세트피스' },
};

const migrated: Tactic[] = TACTICS.map((t) => ({ ...t, board: migrateBoard(t.board) }));

mkdirSync('src/data', { recursive: true });
for (const [category, meta] of Object.entries(FILES) as [Category, (typeof FILES)[Category]][]) {
  const items = migrated.filter((t) => t.category === category);
  const body = items.map((t) => JSON.stringify(t, null, 2)).join(',\n');
  const src = `// ${meta.label} 전술 데이터 (스키마 v2 — 선수 id 포함, ADR-001)
// 초기 버전은 scripts/migrate-board-ids.ts 로 생성. 이후 이 파일을 직접 편집한다.
// 표기 규칙: docs/CONTENT_GUIDE.md
import type { Tactic } from '../types';

export const ${meta.constName}: Tactic[] = [
${body}
];
`;
  writeFileSync(`src/data/${meta.file}`, src);
  console.log(`✓ src/data/${meta.file} — ${items.length}종`);
}

// 화살표 subjectId 매핑 리포트
let mapped = 0;
let total = 0;
for (const t of migrated) {
  for (const a of t.board.arrows ?? []) {
    total++;
    if (a.subjectId) mapped++;
  }
}
console.log(`화살표 subjectId 자동 매핑: ${mapped}/${total}`);
