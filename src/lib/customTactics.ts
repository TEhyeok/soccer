/**
 * 내 전술 저장소 (v1.2-E3): localStorage envelope + 스키마 버저닝.
 * envelope {version, items} — 미래 마이그레이션 프레임 (버전 상승 시 migrate에 단계 추가).
 * JSON 내보내기/가져오기는 localStorage 유실 대비 + v1.3 계정 마이그레이션 보험.
 */
import type { Board } from '../types';

export interface CustomTactic {
  id: string;
  name: string;
  updatedAt: number;
  board: Board;
  /** 라이브러리 템플릿에서 시작한 경우 원본 (v1.2-E4 출처 표시) */
  source?: { id: string; name: string };
}

interface Envelope {
  version: 1;
  items: CustomTactic[];
}

const KEY = 'tacticbook:custom-tactics';
const DRAFT_KEY = 'tacticbook:editor-draft';
export const MAX_ITEMS = 50;

export interface Draft {
  name: string;
  board: Board;
  editingId?: string;
  source?: { id: string; name: string };
}

function isValidItem(t: unknown): t is CustomTactic {
  if (typeof t !== 'object' || t === null) return false;
  const o = t as CustomTactic;
  return (
    typeof o.id === 'string' &&
    typeof o.name === 'string' &&
    typeof o.board === 'object' &&
    Array.isArray(o.board?.players)
  );
}

/** 손상·구버전 데이터는 조용히 버리지 않고 가능한 항목만 살린다 */
function migrate(raw: unknown): CustomTactic[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const env = raw as Partial<Envelope>;
  if (env.version !== 1 || !Array.isArray(env.items)) return [];
  return env.items.filter(isValidItem);
}

export function loadCustomTactics(): CustomTactic[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function persist(items: CustomTactic[]): void {
  const env: Envelope = { version: 1, items };
  try {
    localStorage.setItem(KEY, JSON.stringify(env));
  } catch {
    // 저장 실패(용량 초과 등)는 무시 — 호출부에서 목록으로 확인 가능
  }
}

export function upsertCustomTactic(t: CustomTactic): CustomTactic[] {
  const items = loadCustomTactics();
  const idx = items.findIndex((x) => x.id === t.id);
  if (idx >= 0) items[idx] = t;
  else items.unshift(t);
  persist(items.slice(0, MAX_ITEMS));
  return loadCustomTactics();
}

export function removeCustomTactic(id: string): CustomTactic[] {
  persist(loadCustomTactics().filter((x) => x.id !== id));
  return loadCustomTactics();
}

export function duplicateCustomTactic(id: string): CustomTactic[] {
  const items = loadCustomTactics();
  const src = items.find((x) => x.id === id);
  if (src) {
    upsertCustomTactic({
      ...src,
      id: newCustomId(),
      name: `${src.name} (복사본)`,
      updatedAt: Date.now(),
    });
  }
  return loadCustomTactics();
}

export function newCustomId(): string {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── draft (작성 중 자동 저장 — 강제 새로고침 복원용) ──
export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    return d && typeof d.name === 'string' && Array.isArray(d.board?.players) ? d : null;
  } catch {
    return null;
  }
}

export function saveDraft(d: Draft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    // 무시
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

// ── JSON 내보내기/가져오기 (사용자 백업) ──
export function exportCustomTacticsJson(): string {
  return JSON.stringify({ version: 1, items: loadCustomTactics() } satisfies Envelope, null, 2);
}

/** 가져오기: 유효 항목만 병합, id 충돌 시 새 id 부여. 반환: 추가된 개수 */
export function importCustomTacticsJson(json: string): number {
  const incoming = migrate(JSON.parse(json));
  const existing = loadCustomTactics();
  const ids = new Set(existing.map((x) => x.id));
  let added = 0;
  for (const t of incoming) {
    const item = ids.has(t.id) ? { ...t, id: newCustomId() } : t;
    existing.push(item);
    ids.add(item.id);
    added++;
  }
  persist(existing.slice(0, MAX_ITEMS));
  return added;
}
