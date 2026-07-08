import { describe, expect, it } from 'vitest';
import { TACTICS } from '../data';
import { filterTactics, INITIAL_FILTERS } from './filterTactics';

const none = new Set<string>();

describe('filterTactics (PRD 사용자 스토리 1·2: 훑어보기와 검색)', () => {
  it('기본 필터는 전체를 반환한다', () => {
    expect(filterTactics(TACTICS, INITIAL_FILTERS, none)).toHaveLength(TACTICS.length);
  });

  it('카테고리 필터: 포메이션 7종', () => {
    const out = filterTactics(TACTICS, { ...INITIAL_FILTERS, category: 'formation' }, none);
    expect(out).toHaveLength(7);
    expect(out.every((t) => t.category === 'formation')).toBe(true);
  });

  it('난이도 필터는 해당 난이도만 남긴다', () => {
    const out = filterTactics(TACTICS, { ...INITIAL_FILTERS, difficulty: 3 }, none);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((t) => t.difficulty === 3)).toBe(true);
  });

  it("검색 '게겐'은 게겐프레싱만 찾는다", () => {
    const out = filterTactics(TACTICS, { ...INITIAL_FILTERS, query: '게겐' }, none);
    expect(out.map((t) => t.id)).toEqual(['p-gegen']);
  });

  it('검색은 이름/영문명/요약/태그를 대상으로 하며 대소문자를 무시한다', () => {
    const byEn = filterTactics(TACTICS, { ...INITIAL_FILTERS, query: 'tiki' }, none);
    expect(byEn.map((t) => t.id)).toContain('a-tikitaka');
    const byTag = filterTactics(TACTICS, { ...INITIAL_FILTERS, query: '5초룰' }, none);
    expect(byTag.map((t) => t.id)).toEqual(['p-gegen']);
  });

  it('즐겨찾기만 보기 + 카테고리 조합', () => {
    const favs = new Set(['f433', 'p-gegen']);
    const out = filterTactics(
      TACTICS,
      { ...INITIAL_FILTERS, favoritesOnly: true, category: 'pressing' },
      favs
    );
    expect(out.map((t) => t.id)).toEqual(['p-gegen']);
  });

  it('일치 없는 검색은 빈 배열', () => {
    expect(filterTactics(TACTICS, { ...INITIAL_FILTERS, query: 'zzz없는전술' }, none)).toEqual([]);
  });
});
