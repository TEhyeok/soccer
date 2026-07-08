import { useEffect, useMemo, useRef, useState } from 'react';
import FilterBar from './components/FilterBar';
import TacticCard from './components/TacticCard';
import TacticDetail from './components/TacticDetail';
import { getTactic, TACTICS } from './data';
import { useFavorites, useHashRoute } from './hooks';
import { track } from './lib/analytics';
import { filterTactics, INITIAL_FILTERS, type Filters } from './lib/filterTactics';
import { registerSW } from './lib/sw';
import { FEEDBACK_EMAIL } from './config';

export default function App() {
  const route = useHashRoute();
  const { favorites, toggle } = useFavorites();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);

  // PWA: 새 버전 대기 시 새로고침 토스트 (v1.1-E3)
  useEffect(() => {
    registerSW((apply) => setApplyUpdate(() => apply));
  }, []);

  const filtered = useMemo(() => filterTactics(TACTICS, filters, favorites), [filters, favorites]);

  const detail = route[0] === 't' && route[1] ? getTactic(route[1]) : undefined;

  // 계측: 페이지뷰 + 전술 상세 진입 (docs/EVENTS.md)
  useEffect(() => {
    track('pageview');
    if (detail) track('tactic_view', { tactic: detail.id });
  }, [route, detail]);

  // 계측: 검색어 입력 (800ms 디바운스)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const q = filters.query.trim();
    if (!q) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => track('search', { query: q.slice(0, 50) }), 800);
    return () => clearTimeout(searchTimer.current);
  }, [filters.query]);

  const toggleFavorite = (id: string) => {
    track('favorite_toggle', { tactic: id, on: favorites.has(id) ? 0 : 1 });
    toggle(id);
  };

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
            onToggleFavorite={toggleFavorite}
          />
        ) : route[0] === 't' ? (
          <div className="empty">
            <p>전술을 찾을 수 없습니다.</p>
            <a href="#/" className="chip chip--link">
              ← 라이브러리로
            </a>
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
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {applyUpdate && (
        <div className="toast" role="status">
          <span>새 버전이 준비됐습니다</span>
          <button className="toast__btn" onClick={applyUpdate}>
            새로고침
          </button>
        </div>
      )}

      <footer className="footer">
        <p>
          택틱북 v{__APP_VERSION__} — 포메이션 · 공격 · 수비 · 압박 · 세트피스 {TACTICS.length}종
        </p>
        <p>
          <a href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('[택틱북] 피드백')}`}>
            피드백 보내기
          </a>{' '}
          — 전술 내용 오류 제보를 가장 먼저 처리합니다
        </p>
      </footer>
    </div>
  );
}
