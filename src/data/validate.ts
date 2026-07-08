import type { Tactic } from '../types';

const inRange = (n: number) => n >= 0 && n <= 100;

/**
 * 전술 데이터 무결성 검증. 오류 메시지 목록을 반환한다 (빈 배열 = 통과).
 * CI의 데이터 무결성 테스트와 개발 모드 로더가 공유한다.
 */
export function validateTactics(tactics: readonly Tactic[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const t of tactics) {
    const at = (msg: string) => errors.push(`[${t.id}] ${msg}`);

    if (ids.has(t.id)) at('전술 id 중복');
    ids.add(t.id);

    if (!t.name.trim()) at('name 비어 있음');
    if (!t.summary.trim()) at('summary 비어 있음');
    if (t.description.length === 0) at('description 비어 있음');
    if (t.strengths.length === 0) at('strengths 비어 있음');
    if (t.weaknesses.length === 0) at('weaknesses 비어 있음');
    if (t.keyPoints.length === 0) at('keyPoints 비어 있음');
    if (t.tags.length === 0) at('tags 비어 있음');
    if (![1, 2, 3].includes(t.difficulty)) at(`difficulty 범위 밖: ${t.difficulty}`);

    if (t.counters.includes(t.id)) at('counters 자기 참조');

    if (t.category === 'formation' && t.board.players.length !== 11) {
      at(`포메이션인데 선수가 ${t.board.players.length}명 (11명이어야 함)`);
    }

    // 보드 내 id 유일성 (players + opponents 통합 네임스페이스)
    const boardIds = new Set<string>();
    const everyone = [...t.board.players, ...(t.board.opponents ?? [])];
    for (const p of everyone) {
      if (!p.id.trim()) at('보드 선수 id 비어 있음');
      if (boardIds.has(p.id)) at(`보드 선수 id 중복: ${p.id}`);
      boardIds.add(p.id);
      if (!inRange(p.x) || !inRange(p.y)) at(`선수 좌표 범위 밖: ${p.id} (${p.x}, ${p.y})`);
    }
    // 우리 팀 role은 필수, 상대 팀은 익명('') 허용 (CONTENT_GUIDE 표기 규칙)
    for (const p of t.board.players) {
      if (!p.role.trim()) at(`players role 비어 있음: ${p.id}`);
    }

    for (const [i, a] of (t.board.arrows ?? []).entries()) {
      for (const pt of [a.from, a.to]) {
        if (!inRange(pt.x) || !inRange(pt.y)) at(`화살표 ${i} 좌표 범위 밖`);
      }
      if (a.subjectId && !boardIds.has(a.subjectId)) {
        at(`화살표 ${i} subjectId 참조 오류: ${a.subjectId}`);
      }
      if (a.curve !== undefined && (a.curve < -1 || a.curve > 1)) at(`화살표 ${i} curve 범위 밖`);
    }

    if (t.board.ball && (!inRange(t.board.ball.x) || !inRange(t.board.ball.y))) {
      at('ball 좌표 범위 밖');
    }

    // steps 검증 (ADR-002): positions 키는 실존 선수 id, 좌표·화살표 규칙은 보드와 동일
    for (const [si, step] of (t.board.steps ?? []).entries()) {
      if (!step.caption.trim()) at(`step ${si} caption 비어 있음`);
      for (const [pid, pos] of Object.entries(step.positions ?? {})) {
        if (!boardIds.has(pid)) at(`step ${si} positions 참조 오류: ${pid}`);
        if (!inRange(pos.x) || !inRange(pos.y)) at(`step ${si} ${pid} 좌표 범위 밖`);
      }
      for (const [ai, a] of (step.arrows ?? []).entries()) {
        for (const pt of [a.from, a.to]) {
          if (!inRange(pt.x) || !inRange(pt.y)) at(`step ${si} 화살표 ${ai} 좌표 범위 밖`);
        }
        if (a.subjectId && !boardIds.has(a.subjectId)) {
          at(`step ${si} 화살표 ${ai} subjectId 참조 오류: ${a.subjectId}`);
        }
      }
      if (step.ball && (!inRange(step.ball.x) || !inRange(step.ball.y))) {
        at(`step ${si} ball 좌표 범위 밖`);
      }
    }
  }

  // counters 참조 무결성 (전체 id 집합 확정 후 검사)
  for (const t of tactics) {
    for (const c of t.counters) {
      if (!ids.has(c)) errors.push(`[${t.id}] counters 참조 오류: '${c}' 전술이 존재하지 않음`);
    }
  }

  return errors;
}
