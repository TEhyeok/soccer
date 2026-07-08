import type { Category, Tactic } from '../types';

export interface Filters {
  query: string;
  category: Category | 'all';
  difficulty: number | 0;
  favoritesOnly: boolean;
}

export const INITIAL_FILTERS: Filters = {
  query: '',
  category: 'all',
  difficulty: 0,
  favoritesOnly: false,
};

/**
 * 라이브러리 필터링 순수 함수.
 * 검색 대상은 이름/영문명/요약/태그 (PRD 3장 약속 범위).
 */
export function filterTactics(
  tactics: readonly Tactic[],
  filters: Filters,
  favorites: ReadonlySet<string>
): Tactic[] {
  const q = filters.query.trim().toLowerCase();
  return tactics.filter((t) => {
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.difficulty !== 0 && t.difficulty !== filters.difficulty) return false;
    if (filters.favoritesOnly && !favorites.has(t.id)) return false;
    if (!q) return true;
    const haystack = [t.name, t.nameEn, t.summary, ...t.tags].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
