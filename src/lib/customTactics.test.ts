// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import type { Board } from '../types';
import {
  clearDraft,
  duplicateCustomTactic,
  exportCustomTacticsJson,
  importCustomTacticsJson,
  loadCustomTactics,
  loadDraft,
  newCustomId,
  removeCustomTactic,
  saveDraft,
  upsertCustomTactic,
} from './customTactics';

const board: Board = {
  players: [{ id: 'gk', role: 'GK', x: 50, y: 6 }],
  arrows: [{ from: { x: 10, y: 10 }, to: { x: 30, y: 30 }, kind: 'pass' }],
};

const item = (id: string, name = '내 전술') => ({ id, name, updatedAt: 1, board });

beforeEach(() => localStorage.clear());

describe('내 전술 저장소 (envelope 버저닝 — v1.2 게이트)', () => {
  it('저장·조회·삭제·복제 라운드트립', () => {
    upsertCustomTactic(item('a'));
    expect(loadCustomTactics()).toHaveLength(1);

    upsertCustomTactic({ ...item('a'), name: '수정됨' });
    expect(loadCustomTactics()[0].name).toBe('수정됨');
    expect(loadCustomTactics()).toHaveLength(1);

    duplicateCustomTactic('a');
    expect(loadCustomTactics()).toHaveLength(2);
    expect(loadCustomTactics()[0].name).toContain('복사본');

    removeCustomTactic('a');
    expect(loadCustomTactics()).toHaveLength(1);
  });

  it('손상된 저장 데이터는 빈 목록으로 폴백한다', () => {
    localStorage.setItem('tacticbook:custom-tactics', '{{broken');
    expect(loadCustomTactics()).toEqual([]);
  });

  it('알 수 없는 envelope 버전은 무시한다 (마이그레이션 프레임)', () => {
    localStorage.setItem(
      'tacticbook:custom-tactics',
      JSON.stringify({ version: 99, items: [item('x')] })
    );
    expect(loadCustomTactics()).toEqual([]);
  });

  it('유효하지 않은 항목만 걸러내고 나머지는 살린다', () => {
    localStorage.setItem(
      'tacticbook:custom-tactics',
      JSON.stringify({ version: 1, items: [item('ok'), { broken: true }, null] })
    );
    expect(loadCustomTactics().map((t) => t.id)).toEqual(['ok']);
  });
});

describe('JSON 내보내기/가져오기 (백업 — v1.2 게이트 ⑥)', () => {
  it('내보낸 JSON을 다시 가져오면 id 충돌 시 새 id로 병합된다', () => {
    upsertCustomTactic(item('a'));
    const json = exportCustomTacticsJson();

    const added = importCustomTacticsJson(json);
    expect(added).toBe(1);
    const items = loadCustomTactics();
    expect(items).toHaveLength(2);
    expect(new Set(items.map((t) => t.id)).size).toBe(2); // id 유일
  });

  it('잘못된 JSON은 예외를 던진다 (UI에서 안내)', () => {
    expect(() => importCustomTacticsJson('not-json')).toThrow();
  });
});

describe('draft 자동 저장 (강제 새로고침 복원 — v1.2 게이트 ④)', () => {
  it('저장·복원·삭제', () => {
    saveDraft({ name: '작성 중', board });
    expect(loadDraft()?.name).toBe('작성 중');
    clearDraft();
    expect(loadDraft()).toBeNull();
  });

  it('손상된 draft는 null', () => {
    localStorage.setItem('tacticbook:editor-draft', 'oops');
    expect(loadDraft()).toBeNull();
  });
});

describe('newCustomId', () => {
  it('충돌하지 않는 id를 만든다', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newCustomId()));
    expect(ids.size).toBe(50);
  });
});
