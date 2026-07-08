import type { Tactic } from '../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import { getTactic, TACTICS } from '../data';
import { track } from '../lib/analytics';
import PitchBoard from './PitchBoard';
import PlaybackBoard from './PlaybackBoard';

interface Props {
  tactic: Tactic;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function TacticDetail({ tactic, isFavorite, onToggleFavorite }: Props) {
  const counters = tactic.counters
    .map((id) => getTactic(id))
    .filter((t): t is Tactic => Boolean(t));
  const related = TACTICS.filter((t) => t.category === tactic.category && t.id !== tactic.id).slice(
    0,
    4
  );

  return (
    <div className="detail">
      <nav className="detail__nav">
        <a href="#/" className="back">
          ← 라이브러리
        </a>
        <a
          className="chip chip--link"
          href={`#/t/${tactic.id}/3d`}
          onClick={() => track('view3d_open', { tactic: tactic.id })}
        >
          3D 보기 <small>베타</small>
        </a>
        <button
          className={isFavorite ? 'fav fav--on' : 'fav'}
          onClick={() => onToggleFavorite(tactic.id)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '★ 즐겨찾기됨' : '☆ 즐겨찾기'}
        </button>
      </nav>

      <header className="detail__head">
        <div className="detail__badges">
          <span className={`badge badge--${tactic.category}`}>
            {CATEGORY_LABELS[tactic.category]}
          </span>
          <span className="badge badge--diff">난이도: {DIFFICULTY_LABELS[tactic.difficulty]}</span>
        </div>
        <h1>{tactic.name}</h1>
        <p className="detail__en">{tactic.nameEn}</p>
        <p className="detail__summary">{tactic.summary}</p>
      </header>

      <div className="detail__board">
        {tactic.board.steps?.length ? (
          <PlaybackBoard board={tactic.board} title={tactic.name} tacticId={tactic.id} />
        ) : (
          <PitchBoard board={tactic.board} title={tactic.name} />
        )}
        <div className="legend">
          <span>
            <i className="legend__line legend__line--run" /> 선수 이동
          </span>
          <span>
            <i className="legend__line legend__line--pass" /> 패스
          </span>
          <span>
            <i className="legend__line legend__line--press" /> 압박
          </span>
          {tactic.board.opponents?.length ? (
            <span>
              <i className="legend__dot legend__dot--opp" /> 상대 팀
            </span>
          ) : null}
        </div>
      </div>

      <section className="detail__section">
        <h2>어떻게 작동하나</h2>
        {tactic.description.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <div className="detail__cols">
        <section className="detail__section detail__section--good">
          <h2>강점</h2>
          <ul>
            {tactic.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
        <section className="detail__section detail__section--bad">
          <h2>약점</h2>
          <ul>
            {tactic.weaknesses.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="detail__section">
        <h2>핵심 포인트</h2>
        <ol className="keypoints">
          {tactic.keyPoints.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      {counters.length > 0 && (
        <section className="detail__section">
          <h2>이 전술을 깨려면 (카운터)</h2>
          <div className="chips">
            {counters.map((c) => (
              <a
                key={c.id}
                className="chip chip--link"
                href={`#/t/${c.id}`}
                onClick={() => track('counter_click', { from: tactic.id, to: c.id })}
              >
                {c.name} →
              </a>
            ))}
          </div>
        </section>
      )}

      {tactic.famousTeams.length > 0 && (
        <section className="detail__section">
          <h2>대표 팀</h2>
          <div className="chips">
            {tactic.famousTeams.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="detail__section">
          <h2>연관 전술</h2>
          <div className="chips">
            {related.map((r) => (
              <a key={r.id} className="chip chip--link" href={`#/t/${r.id}`}>
                {r.name}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
