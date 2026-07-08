import type { Tactic } from '../types';
import { FORMATION_TACTICS } from './formations';
import { ATTACK_TACTICS } from './attack';
import { DEFENSE_TACTICS } from './defense';
import { PRESSING_TACTICS } from './pressing';
import { SETPIECE_TACTICS } from './setpieces';
import { validateTactics } from './validate';

export const TACTICS: Tactic[] = [
  ...FORMATION_TACTICS,
  ...ATTACK_TACTICS,
  ...DEFENSE_TACTICS,
  ...PRESSING_TACTICS,
  ...SETPIECE_TACTICS,
];

const byId = new Map(TACTICS.map((t) => [t.id, t]));

export function getTactic(id: string): Tactic | undefined {
  return byId.get(id);
}

// 개발 모드에서 데이터 무결성 즉시 검증 — CI의 데이터 테스트와 같은 규칙 (validate.ts)
if (import.meta.env?.DEV) {
  const errors = validateTactics(TACTICS);
  if (errors.length > 0) {
    console.error(`[tacticbook] 전술 데이터 무결성 오류 ${errors.length}건:\n` + errors.join('\n'));
  }
}
