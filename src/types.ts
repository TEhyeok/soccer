export type Category = 'formation' | 'attack' | 'defense' | 'pressing' | 'setpiece';

export const CATEGORY_LABELS: Record<Category, string> = {
  formation: '포메이션',
  attack: '공격 전술',
  defense: '수비 전술',
  pressing: '압박·전환',
  setpiece: '세트피스',
};

export type Difficulty = 1 | 2 | 3;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: '기본',
  2: '중급',
  3: '고급',
};

/** 좌표계: x 0~100 (왼쪽→오른쪽), y 0~100 (자기 골문→상대 골문) */
export interface Point {
  x: number;
  y: number;
}

export interface PlayerPos extends Point {
  /**
   * 보드 내 유일 식별자 (ADR-001). 애니메이션 트위닝·편집기·3D 뷰어의 공통 기반.
   * 한 번 배포된 id는 변경하지 않는다.
   */
  id: string;
  role: string;
}

export type ArrowKind = 'run' | 'pass' | 'press';

export interface Arrow {
  from: Point;
  to: Point;
  kind: ArrowKind;
  /** 곡률(-1~1). 양수면 진행 방향 기준 오른쪽으로 휨 */
  curve?: number;
  /** 행위 주체 선수 id (ADR-001, optional) */
  subjectId?: string;
}

/**
 * 애니메이션 시퀀스 단계 (ADR-002, v1.1에서 동결).
 * 각 단계는 직전 상태에 대한 부분 덮어쓰기 — 명시하지 않은 선수는 자리를 유지한다.
 */
export interface Step {
  /** 단계 설명 캡션 (재생 UI에 표시) */
  caption: string;
  /** 이 단계에서 이동하는 선수: 보드 선수 id → 새 좌표 */
  positions?: Record<string, Point>;
  /** 이 단계 동안 표시할 화살표 (기본 보드 화살표를 대체) */
  arrows?: Arrow[];
  ball?: Point;
}

export interface Board {
  players: PlayerPos[];
  opponents?: PlayerPos[];
  arrows?: Arrow[];
  ball?: Point;
  /**
   * 애니메이션 시퀀스 (optional, ADR-002).
   * 없으면 기존과 동일한 정적 보드 — "1단계짜리 시퀀스"로 해석된다.
   */
  steps?: Step[];
}

export interface Tactic {
  id: string;
  name: string;
  nameEn: string;
  category: Category;
  difficulty: Difficulty;
  summary: string;
  description: string[];
  strengths: string[];
  weaknesses: string[];
  keyPoints: string[];
  /** 이 전술을 상대하는 카운터 전술 (tactic id 참조) */
  counters: string[];
  famousTeams: string[];
  tags: string[];
  board: Board;
}
