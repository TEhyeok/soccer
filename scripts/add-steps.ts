/**
 * v1.1-E1: 애니메이션 시퀀스 6종 주입 (일회성 코드젠).
 * 대상: p-gegen, a-tikitaka, a-counter, d-offside, s-corner-near, p-highpress
 * 실행: npx tsx scripts/add-steps.ts  → 카테고리 파일 재생성 (id·기존 데이터 보존)
 */
import { writeFileSync } from 'node:fs';
import { TACTICS } from '../src/data';
import type { Category, Step, Tactic } from '../src/types';

const SEQUENCES: Record<string, Step[]> = {
  'p-gegen': [
    {
      caption: '공을 잃은 순간 — 가장 가까운 3명이 공·패스길·리시버를 분담해 즉시 달려든다',
      positions: {
        st: { x: 48, y: 72 },
        cm1: { x: 41, y: 67 },
        lw: { x: 28, y: 68 },
      },
      arrows: [
        { from: { x: 52, y: 80 }, to: { x: 48, y: 73 }, kind: 'press', subjectId: 'st' },
        { from: { x: 33, y: 62 }, to: { x: 40, y: 66 }, kind: 'press', subjectId: 'cm1' },
        { from: { x: 22, y: 76 }, to: { x: 28, y: 69 }, kind: 'press', subjectId: 'lw' },
      ],
      ball: { x: 45, y: 67 },
    },
    {
      caption: '후방 라인도 함께 전진 — 압박과 라인업은 한 몸, 압박 뒤 공간을 없앤다',
      positions: {
        cb1: { x: 40, y: 42 },
        cb2: { x: 62, y: 42 },
        lb: { x: 22, y: 45 },
        rb: { x: 80, y: 45 },
        dm: { x: 50, y: 58 },
      },
      arrows: [
        { from: { x: 40, y: 33 }, to: { x: 40, y: 41 }, kind: 'run', subjectId: 'cb1' },
        { from: { x: 62, y: 33 }, to: { x: 62, y: 41 }, kind: 'run', subjectId: 'cb2' },
        { from: { x: 50, y: 52 }, to: { x: 50, y: 57 }, kind: 'run', subjectId: 'dm' },
      ],
    },
    {
      caption: '5초 안에 되빼앗았다 — 흐트러진 상대 수비를 곧바로 찌른다 (최상급 찬스)',
      positions: {
        st: { x: 50, y: 76 },
        rw: { x: 72, y: 86 },
      },
      arrows: [
        { from: { x: 82, y: 76 }, to: { x: 73, y: 85 }, kind: 'run', subjectId: 'rw' },
        {
          from: { x: 49, y: 74 },
          to: { x: 68, y: 84 },
          kind: 'pass',
          subjectId: 'st',
          curve: -0.15,
        },
      ],
      ball: { x: 49, y: 73 },
    },
  ],

  'a-tikitaka': [
    {
      caption: '후방 삼각형 — 골키퍼까지 참여해 상대 1선 압박을 유인한다',
      positions: { dm: { x: 47, y: 34 } },
      arrows: [
        { from: { x: 30, y: 24 }, to: { x: 45, y: 32 }, kind: 'pass', subjectId: 'cb1' },
        { from: { x: 30, y: 22 }, to: { x: 14, y: 36 }, kind: 'pass', subjectId: 'cb1' },
      ],
      ball: { x: 47, y: 33 },
    },
    {
      caption: '왼쪽 과부하 — 짧은 패스로 상대 블록을 한쪽으로 모은다',
      positions: {
        lb: { x: 12, y: 48 },
        lw: { x: 18, y: 60 },
        cm1: { x: 28, y: 52 },
      },
      arrows: [
        { from: { x: 47, y: 34 }, to: { x: 29, y: 51 }, kind: 'pass', subjectId: 'dm' },
        { from: { x: 28, y: 52 }, to: { x: 13, y: 47 }, kind: 'pass', subjectId: 'cm1' },
      ],
      ball: { x: 14, y: 47 },
    },
    {
      caption: '스위칭 — 상대가 쏠린 순간 반대편으로 크게 전환, 오른쪽 1대1 상황',
      positions: {
        rw: { x: 86, y: 72 },
        rb: { x: 88, y: 55 },
      },
      arrows: [
        {
          from: { x: 14, y: 48 },
          to: { x: 84, y: 70 },
          kind: 'pass',
          subjectId: 'lb',
          curve: -0.2,
        },
        { from: { x: 88, y: 38 }, to: { x: 88, y: 54 }, kind: 'run', subjectId: 'rb' },
      ],
      ball: { x: 85, y: 70 },
    },
    {
      caption: '라인 사이를 부수는 마지막 패스 — 컷백으로 마무리',
      positions: {
        st: { x: 56, y: 84 },
        cm2: { x: 62, y: 62 },
        rw: { x: 90, y: 88 },
      },
      arrows: [
        { from: { x: 86, y: 74 }, to: { x: 89, y: 86 }, kind: 'run', subjectId: 'rw' },
        {
          from: { x: 90, y: 89 },
          to: { x: 60, y: 86 },
          kind: 'pass',
          subjectId: 'rw',
          curve: -0.2,
        },
        { from: { x: 50, y: 72 }, to: { x: 56, y: 83 }, kind: 'run', subjectId: 'st' },
      ],
      ball: { x: 89, y: 87 },
    },
  ],

  'a-counter': [
    {
      caption: '탈취 — 첫 패스는 무조건 전방, 아웃렛 스트라이커에게',
      positions: { st1: { x: 42, y: 54 } },
      arrows: [{ from: { x: 38, y: 33 }, to: { x: 42, y: 52 }, kind: 'pass', subjectId: 'cm1' }],
      ball: { x: 42, y: 52 },
    },
    {
      caption: '3인 유닛 발진 — 운반 1명 + 침투 2명, 상대 센터백은 후퇴 중',
      positions: {
        st1: { x: 48, y: 64 },
        st2: { x: 72, y: 78 },
        rm: { x: 82, y: 60 },
        'o-cb1': { x: 44, y: 62 },
        'o-cb2': { x: 68, y: 64 },
      },
      arrows: [
        { from: { x: 42, y: 54 }, to: { x: 48, y: 63 }, kind: 'run', subjectId: 'st1' },
        {
          from: { x: 60, y: 52 },
          to: { x: 72, y: 77 },
          kind: 'run',
          subjectId: 'st2',
          curve: -0.15,
        },
        { from: { x: 86, y: 34 }, to: { x: 82, y: 58 }, kind: 'run', subjectId: 'rm' },
      ],
      ball: { x: 48, y: 62 },
    },
    {
      caption: '10초 안에 슈팅까지 — 뒷공간 스루패스, 골키퍼와 1대1',
      positions: { st2: { x: 74, y: 86 } },
      arrows: [
        {
          from: { x: 48, y: 64 },
          to: { x: 72, y: 84 },
          kind: 'pass',
          subjectId: 'st1',
          curve: -0.1,
        },
        { from: { x: 74, y: 87 }, to: { x: 55, y: 96 }, kind: 'pass', subjectId: 'st2' },
      ],
      ball: { x: 73, y: 85 },
    },
  ],

  'd-offside': [
    {
      caption: '트랩 신호 — 패서가 고개를 숙이고 킥 모션, 라인 컨트롤러가 스텝업 콜',
      arrows: [
        {
          from: { x: 50, y: 64 },
          to: { x: 60, y: 45 },
          kind: 'pass',
          subjectId: 'o-cm',
          curve: 0.1,
        },
      ],
    },
    {
      caption: '백4 동시 스텝업 — 한 걸음에 공격수 둘이 오프사이드 위치에 갇힌다',
      positions: {
        lb: { x: 18, y: 54 },
        cb1: { x: 39, y: 54 },
        cb2: { x: 61, y: 54 },
        rb: { x: 82, y: 54 },
      },
      arrows: [
        { from: { x: 18, y: 46 }, to: { x: 18, y: 53 }, kind: 'run', subjectId: 'lb' },
        { from: { x: 39, y: 46 }, to: { x: 39, y: 53 }, kind: 'run', subjectId: 'cb1' },
        { from: { x: 61, y: 46 }, to: { x: 61, y: 53 }, kind: 'run', subjectId: 'cb2' },
        { from: { x: 82, y: 46 }, to: { x: 82, y: 53 }, kind: 'run', subjectId: 'rb' },
      ],
    },
    {
      caption: '패스가 나와도 무효 — 공격수는 이미 오프사이드, 스위퍼 키퍼가 뒷정리',
      positions: {
        'o-st2': { x: 65, y: 42 },
        gk: { x: 50, y: 24 },
      },
      arrows: [
        { from: { x: 70, y: 50 }, to: { x: 66, y: 43 }, kind: 'run', subjectId: 'o-st2' },
        { from: { x: 50, y: 14 }, to: { x: 50, y: 23 }, kind: 'run', subjectId: 'gk' },
      ],
      ball: { x: 58, y: 40 },
    },
  ],

  's-corner-near': [
    {
      caption: '스크린 — C가 니어 지역 마크맨의 길목을 정지 동작으로 차지한다',
      positions: {
        c: { x: 50, y: 88 },
        b: { x: 46, y: 88 },
      },
      arrows: [{ from: { x: 38, y: 86 }, to: { x: 49, y: 88 }, kind: 'run', subjectId: 'c' }],
    },
    {
      caption: '니어 쇄도 — A가 스크린 뒤 공간으로 파고든다',
      positions: {
        a: { x: 60, y: 93 },
        d: { x: 64, y: 95 },
      },
      arrows: [
        { from: { x: 55, y: 82 }, to: { x: 59, y: 92 }, kind: 'run', subjectId: 'a', curve: -0.15 },
      ],
    },
    {
      caption: '인스윙 킥 — 니어포스트 상단을 향해 빠르고 낮게',
      arrows: [
        {
          from: { x: 96, y: 97 },
          to: { x: 62, y: 94 },
          kind: 'pass',
          subjectId: 'k',
          curve: -0.25,
        },
      ],
      ball: { x: 61, y: 94 },
    },
    {
      caption: '플릭 — 살짝 스친 헤더가 파포스트로, B가 마무리',
      positions: {
        b: { x: 43, y: 93 },
        e: { x: 49, y: 82 },
      },
      arrows: [
        { from: { x: 61, y: 94 }, to: { x: 45, y: 95 }, kind: 'pass', subjectId: 'a' },
        { from: { x: 46, y: 88 }, to: { x: 43, y: 92 }, kind: 'run', subjectId: 'b' },
      ],
      ball: { x: 44, y: 94 },
    },
  ],

  'p-highpress': [
    {
      caption: '압박 세팅 — ST가 커버 섀도로 앵커를 지우며 호(arc)를 그려 접근',
      positions: { st: { x: 36, y: 68 } },
      arrows: [
        {
          from: { x: 40, y: 60 },
          to: { x: 35, y: 68 },
          kind: 'press',
          subjectId: 'st',
          curve: 0.2,
        },
      ],
    },
    {
      caption: '측면 함정으로 유도 — 중앙이 막힌 공은 계획된 측면으로 흐른다',
      positions: {
        lw: { x: 14, y: 62 },
        cm1: { x: 28, y: 54 },
      },
      arrows: [
        { from: { x: 32, y: 73 }, to: { x: 14, y: 68 }, kind: 'pass', subjectId: 'o-cb1' },
        { from: { x: 18, y: 56 }, to: { x: 14, y: 61 }, kind: 'press', subjectId: 'lw' },
      ],
      ball: { x: 14, y: 67 },
    },
    {
      caption: '함정 닫기 — 터치라인을 수비수 삼아 3인 포위, 패스길은 모두 등 뒤로',
      positions: {
        st: { x: 24, y: 70 },
        cm1: { x: 20, y: 60 },
        dm: { x: 40, y: 48 },
        lw: { x: 13, y: 65 },
      },
      arrows: [
        { from: { x: 36, y: 68 }, to: { x: 25, y: 70 }, kind: 'press', subjectId: 'st' },
        { from: { x: 28, y: 54 }, to: { x: 21, y: 60 }, kind: 'press', subjectId: 'cm1' },
      ],
    },
    {
      caption: '상대 진영 탈취 — 골문까지 최단 거리, 즉시 결정적 찬스',
      positions: {
        rw: { x: 60, y: 78 },
        st: { x: 30, y: 76 },
      },
      arrows: [
        { from: { x: 66, y: 62 }, to: { x: 60, y: 77 }, kind: 'run', subjectId: 'rw' },
        {
          from: { x: 22, y: 70 },
          to: { x: 55, y: 80 },
          kind: 'pass',
          subjectId: 'st',
          curve: -0.15,
        },
      ],
      ball: { x: 22, y: 69 },
    },
  ],
};

const FILES: Record<Category, { file: string; constName: string; label: string }> = {
  formation: { file: 'formations.ts', constName: 'FORMATION_TACTICS', label: '포메이션' },
  buildup: { file: 'buildup.ts', constName: 'BUILDUP_TACTICS', label: '빌드업·전개' },
  attack: { file: 'attack.ts', constName: 'ATTACK_TACTICS', label: '공격 전술' },
  defense: { file: 'defense.ts', constName: 'DEFENSE_TACTICS', label: '수비 전술' },
  pressing: { file: 'pressing.ts', constName: 'PRESSING_TACTICS', label: '압박·전환' },
  setpiece: { file: 'setpieces.ts', constName: 'SETPIECE_TACTICS', label: '세트피스' },
};

const updated: Tactic[] = TACTICS.map((t) =>
  SEQUENCES[t.id] ? { ...t, board: { ...t.board, steps: SEQUENCES[t.id] } } : t
);

for (const [category, meta] of Object.entries(FILES) as [Category, (typeof FILES)[Category]][]) {
  const items = updated.filter((t) => t.category === category);
  const body = items.map((t) => JSON.stringify(t, null, 2)).join(',\n');
  const src = `// ${meta.label} 전술 데이터 (스키마 v2 — 선수 id 포함, ADR-001)
// 초기 버전은 scripts/migrate-board-ids.ts 로 생성. 이후 이 파일을 직접 편집한다.
// 표기 규칙: docs/CONTENT_GUIDE.md
import type { Tactic } from '../types';

export const ${meta.constName}: Tactic[] = [
${body}
];
`;
  writeFileSync(`src/data/${meta.file}`, src);
}

const withSteps = updated.filter((t) => t.board.steps?.length);
console.log(
  `✓ 시퀀스 주입 완료: ${withSteps.map((t) => `${t.id}(${t.board.steps!.length}단계)`).join(', ')}`
);
