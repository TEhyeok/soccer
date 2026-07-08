import type { Tactic } from '../types';
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from '../types';
import PitchBoard from './PitchBoard';

interface Props {
  tactic: Tactic;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function TacticCard({ tactic, isFavorite, onToggleFavorite }: Props) {
  return (
    <article className="card">
      <a className="card__board" href={`#/t/${tactic.id}`} aria-label={`${tactic.name} 상세 보기`}>
        <PitchBoard board={tactic.board} mini title={tactic.name} />
      </a>
      <div className="card__body">
        <div className="card__top">
          <span className={`badge badge--${tactic.category}`}>
            {CATEGORY_LABELS[tactic.category]}
          </span>
          <span className="badge badge--diff">{DIFFICULTY_LABELS[tactic.difficulty]}</span>
          <button
            className={isFavorite ? 'fav fav--on' : 'fav'}
            onClick={() => onToggleFavorite(tactic.id)}
            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <a className="card__title" href={`#/t/${tactic.id}`}>
          <h3>{tactic.name}</h3>
          <span className="card__en">{tactic.nameEn}</span>
        </a>
        <p className="card__summary">{tactic.summary}</p>
      </div>
    </article>
  );
}
