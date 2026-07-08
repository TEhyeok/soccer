import type { Category } from '../types';
import { CATEGORY_LABELS } from '../types';
import type { Filters } from '../lib/filterTactics';

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  resultCount: number;
}

const CATEGORIES: Array<Category | 'all'> = [
  'all',
  'formation',
  'buildup',
  'attack',
  'defense',
  'pressing',
  'setpiece',
];

export default function FilterBar({ filters, onChange, resultCount }: Props) {
  return (
    <div className="filters">
      <input
        type="search"
        className="filters__search"
        placeholder="전술 이름, 태그 검색 (예: 게겐프레싱, 역습, 4-3-3)"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        aria-label="전술 검색"
      />
      <div className="filters__row" role="tablist" aria-label="카테고리 필터">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filters.category === c}
            className={filters.category === c ? 'chip chip--active' : 'chip'}
            onClick={() => onChange({ ...filters, category: c })}
          >
            {c === 'all' ? '전체' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div className="filters__row filters__row--sub">
        <select
          value={filters.difficulty}
          onChange={(e) => onChange({ ...filters, difficulty: Number(e.target.value) })}
          aria-label="난이도 필터"
        >
          <option value={0}>난이도 전체</option>
          <option value={1}>기본</option>
          <option value={2}>중급</option>
          <option value={3}>고급</option>
        </select>
        <button
          className={filters.favoritesOnly ? 'chip chip--active' : 'chip'}
          onClick={() => onChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
          aria-pressed={filters.favoritesOnly}
        >
          ★ 즐겨찾기만
        </button>
        <span className="filters__count">{resultCount}개</span>
      </div>
    </div>
  );
}
