import { useRef, useState } from 'react';
import {
  duplicateCustomTactic,
  exportCustomTacticsJson,
  importCustomTacticsJson,
  loadCustomTactics,
  removeCustomTactic,
  saveDraft,
  type CustomTactic,
} from '../lib/customTactics';
import PitchBoard from './PitchBoard';

function openInEditor(t: CustomTactic) {
  saveDraft({ name: t.name, board: t.board, editingId: t.id, source: t.source });
  window.location.hash = `#/editor/${t.id}`;
}

export default function MyTactics() {
  const [items, setItems] = useState<CustomTactic[]>(loadCustomTactics);
  const [notice, setNotice] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([exportCustomTacticsJson()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tacticbook-my-tactics.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const added = importCustomTacticsJson(await file.text());
      setItems(loadCustomTactics());
      setNotice(`${added}개 전술을 가져왔습니다`);
    } catch {
      setNotice('가져오기 실패 — 올바른 백업 파일인지 확인해 주세요');
    }
  };

  return (
    <div className="my">
      <div className="my__head">
        <h1>내 전술</h1>
        <div className="chips">
          <a className="chip chip--active" href="#/editor">
            + 새 보드
          </a>
          {items.length > 0 && (
            <button className="chip" onClick={exportJson}>
              JSON 내보내기
            </button>
          )}
          <button className="chip" onClick={() => fileRef.current?.click()}>
            JSON 가져오기
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importJson(f);
              e.target.value = '';
            }}
          />
        </div>
        {notice && <p className="my__notice">{notice}</p>}
      </div>

      {items.length === 0 ? (
        <div className="empty">
          <p>아직 만든 전술이 없습니다. 우리 팀 전술을 그려서 단톡에 공유해 보세요.</p>
          <a className="chip chip--link" href="#/editor">
            첫 보드 만들기 →
          </a>
        </div>
      ) : (
        <div className="grid">
          {items.map((t) => (
            <article key={t.id} className="card">
              <button className="card__board my__open" onClick={() => openInEditor(t)}>
                <PitchBoard board={t.board} mini title={t.name} />
              </button>
              <div className="card__body">
                <div className="card__title">
                  <h3>{t.name}</h3>
                </div>
                <p className="card__summary">
                  {new Date(t.updatedAt).toLocaleDateString('ko-KR')} ·{' '}
                  {t.board.players.length + (t.board.opponents?.length ?? 0)}명 ·{' '}
                  {t.board.arrows?.length ?? 0}개 화살표
                  {t.source ? ` · 원본: ${t.source.name}` : ''}
                </p>
                <div className="chips">
                  <button className="chip" onClick={() => openInEditor(t)}>
                    편집
                  </button>
                  <button className="chip" onClick={() => setItems(duplicateCustomTactic(t.id))}>
                    복제
                  </button>
                  <button
                    className="chip"
                    onClick={() => {
                      if (window.confirm(`'${t.name}'을(를) 삭제할까요?`)) {
                        setItems(removeCustomTactic(t.id));
                      }
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
