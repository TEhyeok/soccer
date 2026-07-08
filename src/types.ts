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

export interface Board {
  players: PlayerPos[];
  opponents?: PlayerPos[];
  arrows?: Arrow[];
  ball?: Point;
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
