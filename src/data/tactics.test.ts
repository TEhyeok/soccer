import { describe, expect, it } from 'vitest';
import type { Tactic } from '../types';
import { getTactic, TACTICS } from './index';
import { validateTactics } from './validate';

describe('전술 데이터 무결성 (M0 게이트: 데이터 오류 0건)', () => {
  it('전체 데이터가 무결성 검증을 통과한다', () => {
    expect(validateTactics(TACTICS)).toEqual([]);
  });

  it('전술은 20종 이상이다', () => {
    expect(TACTICS.length).toBeGreaterThanOrEqual(20);
  });

  it('getTactic은 실존 id를 조회하고 없는 id에 undefined를 준다', () => {
    expect(getTactic('f433')?.name).toBe('4-3-3');
    expect(getTactic('no-such-id')).toBeUndefined();
  });

  it('counters는 실존 전술을 가리킨다 (역링크 오타 방지)', () => {
    const ids = new Set(TACTICS.map((t) => t.id));
    for (const t of TACTICS) {
      for (const c of t.counters) {
        expect(ids.has(c), `${t.id} → counters '${c}'`).toBe(true);
      }
    }
  });

  it('포메이션 카테고리는 항상 11명이다', () => {
    for (const t of TACTICS.filter((t) => t.category === 'formation')) {
      expect(t.board.players.length, t.id).toBe(11);
    }
  });

  it('보드의 모든 선수는 유일한 id를 가진다 (스키마 v2, ADR-001)', () => {
    for (const t of TACTICS) {
      const everyone = [...t.board.players, ...(t.board.opponents ?? [])];
      const ids = everyone.map((p) => p.id);
      expect(new Set(ids).size, t.id).toBe(ids.length);
      for (const p of everyone) expect(p.id, `${t.id} 선수 id 누락`).toBeTruthy();
    }
  });
});

describe('validateTactics는 깨진 데이터를 잡아낸다 (검증기 자체 검증)', () => {
  const valid = TACTICS[0];

  const broken = (patch: Partial<Tactic>): Tactic[] => [{ ...valid, ...patch }];

  it('존재하지 않는 counters 참조', () => {
    const errors = validateTactics(broken({ counters: ['ghost-tactic'] }));
    expect(errors.join()).toContain('counters 참조 오류');
  });

  it('좌표 범위 밖 (120)', () => {
    const errors = validateTactics(
      broken({
        board: { players: [{ id: 'gk', role: 'GK', x: 120, y: 50 }] },
        category: 'attack',
      })
    );
    expect(errors.join()).toContain('좌표 범위 밖');
  });

  it('전술 id 중복', () => {
    const errors = validateTactics([valid, { ...valid }]);
    expect(errors.join()).toContain('전술 id 중복');
  });

  it('포메이션인데 11명이 아님', () => {
    const errors = validateTactics(
      broken({
        category: 'formation',
        board: { players: [{ id: 'gk', role: 'GK', x: 50, y: 5 }] },
      })
    );
    expect(errors.join()).toContain('11명이어야 함');
  });

  it('보드 내 선수 id 중복', () => {
    const errors = validateTactics(
      broken({
        category: 'attack',
        board: {
          players: [
            { id: 'st', role: 'ST', x: 40, y: 70 },
            { id: 'st', role: 'ST', x: 60, y: 70 },
          ],
        },
      })
    );
    expect(errors.join()).toContain('보드 선수 id 중복');
  });

  it('화살표 subjectId 참조 오류', () => {
    const errors = validateTactics(
      broken({
        category: 'attack',
        board: {
          players: [{ id: 'st', role: 'ST', x: 50, y: 70 }],
          arrows: [
            { from: { x: 50, y: 70 }, to: { x: 50, y: 90 }, kind: 'run', subjectId: 'ghost' },
          ],
        },
      })
    );
    expect(errors.join()).toContain('subjectId 참조 오류');
  });
});
