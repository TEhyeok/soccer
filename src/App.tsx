import { useMemo, useState } from 'react';
import FilterBar, { type Filters } from './components/FilterBar';
import TacticCard from './components/TacticCard';
import TacticDetail from './components/TacticDetail';
import { getTactic, TACTICS } from './data/tactics';
import { useFavorites, useHashRoute } from './hooks';

const INITIAL_FILTERS: Filters = {
  query: '',
  category: 'all',
  difficulty: 0,
  favoritesOnly: false,
};

export default function App() {
  const route = useHashRoute();
  const { favorites, toggle } = useFavorites();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return TACTICS.filter((t) => {
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.difficulty !== 0 && t.difficulty !== filters.difficulty) return false;
      if (filters.favoritesOnly && !favorites.has(t.id)) return false;
      if (!q) return true;
      const haystack = [t.name, t.nameEn, t.summary, ...t.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [filters, favorites]);

  const detail = route[0] === 't' && route[1] ? getTactic(route[1]) : undefined;

  return (
    <div className="app">
      <header className="header">
        <a href="#/" className="header__brand">
          <span className="header__logo">⚽</span>
          <span>
            <strong>택틱북</strong>
            <small>축구 전략·전술 모음집</small>
          </span>
        </a>
      </header>

      <main className="main">
        {detail ? (
          <TacticDetail
            key={detail.id}
            tactic={detail}
            isFavorite={favorites.has(detail.id)}
            onToggleFavorite={toggle}
          />
        ) : route[0] === 't' ? (
          <div className="empty">
            <p>전술을 찾을 수 없습니다.</p>
            <a href="#/" className="chip chip--link">← 라이브러리로</a>
          </div>
        ) : (
          <>
            <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />
            {filtered.length === 0 ? (
              <div className="empty">
                <p>조건에 맞는 전술이 없습니다.</p>
                <button className="chip chip--link" onClick={() => setFilters(INITIAL_FILTERS)}>
                  필터 초기화
                </button>
              </div>
            ) : (
              <div className="grid">
                {filtered.map((t) => (
                  <TacticCard
                    key={t.id}
                    tactic={t}
                    isFavorite={favorites.has(t.id)}
                    onToggleFavorite={toggle}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>택틱북 v1.0 — 포메이션 · 공격 · 수비 · 압박 · 세트피스 {TACTICS.length}종</p>
      </footer>
    </div>
  );
}
