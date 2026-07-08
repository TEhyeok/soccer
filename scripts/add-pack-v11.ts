/**
 * v1.1-E2: 콘텐츠 팩 "참조 완성" 10종 (20→30종) — 일회성 코드젠.
 * 신규 카테고리 'buildup'(빌드업·전개) + 기존 전술 역링크 통합 포함.
 * 실행: npx tsx scripts/add-pack-v11.ts
 */
import { writeFileSync } from 'node:fs';
import { TACTICS } from '../src/data';
import type { Category, Tactic } from '../src/types';

const NEW_TACTICS: Tactic[] = [
  // ─────────────── 빌드업·전개 ───────────────
  {
    id: 'bu-lavolpiana',
    name: '3자 빌드업 (살리다 라볼피아나)',
    nameEn: 'Salida Lavolpiana / 3-Man Build-up',
    category: 'buildup',
    difficulty: 3,
    summary: '수비형 미드필더가 센터백 사이로 내려가 3대2 수적 우위로 상대 압박을 벗겨내는 빌드업.',
    description: [
      '살리다 라볼피아나는 수비형 미드필더가 두 센터백 사이(또는 옆)로 내려가 일시적인 3백을 만드는 빌드업 방식이다. 멕시코의 리카르도 라 볼페 감독이 정립했고, 과르디올라가 바르셀로나에서 부스케츠로 세계화했다.',
      '원리는 숫자 싸움이다. 상대가 투톱으로 압박하면 후방 2(센터백)대2로는 빌드업이 막히지만, 미드필더가 내려와 3대2가 되는 순간 반드시 한 명이 자유로워진다. 동시에 양 풀백은 미드필더 높이까지 전진해 폭을 만들고, 중원에 새로 생긴 공간은 중앙 미드필더들이 내려와 받는다.',
      '핵심은 내려간 미드필더의 첫 터치 방향이다. 자유로운 상태에서 전방을 향해 서서 받아야 라인을 부수는 전진 패스가 나온다. 상대가 3명으로 압박 숫자를 맞추면 후방이 다시 막히는데, 이때는 골키퍼가 +1이 되어 4대3을 만든다.',
    ],
    strengths: [
      '투톱 압박을 구조적으로 무력화 — 항상 한 명이 자유로움',
      '풀백을 높이 올려 측면 공격 자원으로 전환',
      '전진 패스 각이 다양해짐 (3개의 출발점)',
      '압박을 유인한 뒤 벗겨내면 중원이 즉시 수적 우위',
    ],
    weaknesses: [
      '내려가는 미드필더의 볼 키핑이 약하면 골문 앞에서 탈취당함',
      '상대가 3명으로 맞추면 효과 반감 — 플랜B(골키퍼 +1) 필수',
      '풀백 전진 후 측면 뒷공간이 역습에 노출',
      '숙련까지 훈련량이 많음 — 위치·타이밍 약속이 정교해야 함',
    ],
    keyPoints: [
      '앵커는 상대 투톱 사이가 아니라 센터백 "사이"로 내려간다',
      '센터백은 페널티 박스 모서리까지 과감하게 벌린다',
      '내려간 앵커는 전방을 보고 받는 것이 제1원칙',
      '상대가 3명으로 맞추면 골키퍼를 +1로 활용 (4대3)',
    ],
    counters: ['p-highpress', 'p-trigger'],
    famousTeams: [
      '바르셀로나 (과르디올라, 부스케츠)',
      '맨체스터 시티 (로드리)',
      '멕시코 대표팀 2006 (라 볼페)',
    ],
    tags: ['빌드업', '3백변환', '수적우위', '라볼피아나'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 8 },
        { id: 'cb1', role: 'CB', x: 24, y: 16 },
        { id: 'cb2', role: 'CB', x: 76, y: 16 },
        { id: 'dm', role: 'DM', x: 50, y: 20 },
        { id: 'lb', role: 'LB', x: 12, y: 45 },
        { id: 'rb', role: 'RB', x: 88, y: 45 },
        { id: 'cm1', role: 'CM', x: 36, y: 42 },
        { id: 'cm2', role: 'CM', x: 64, y: 42 },
        { id: 'lw', role: 'LW', x: 18, y: 68 },
        { id: 'st', role: 'ST', x: 50, y: 72 },
        { id: 'rw', role: 'RW', x: 82, y: 68 },
      ],
      opponents: [
        { id: 'o-st1', role: 'ST', x: 38, y: 26 },
        { id: 'o-st2', role: 'ST', x: 62, y: 26 },
      ],
      ball: { x: 50, y: 11 },
      arrows: [
        { from: { x: 50, y: 30 }, to: { x: 50, y: 22 }, kind: 'run', subjectId: 'dm' },
        { from: { x: 12, y: 34 }, to: { x: 12, y: 44 }, kind: 'run', subjectId: 'lb' },
        { from: { x: 88, y: 34 }, to: { x: 88, y: 44 }, kind: 'run', subjectId: 'rb' },
        { from: { x: 50, y: 10 }, to: { x: 27, y: 15 }, kind: 'pass', subjectId: 'gk' },
      ],
    },
  },
  {
    id: 'bu-inverted-fb',
    name: '인버티드 풀백',
    nameEn: 'Inverted Full-back',
    category: 'buildup',
    difficulty: 3,
    summary:
      '풀백이 터치라인 대신 중앙 미드필더 자리로 들어와 중원 수적 우위와 역습 보험을 동시에 챙긴다.',
    description: [
      '인버티드 풀백은 빌드업 시 풀백이 측면을 따라 오버래핑하는 대신 안쪽 중앙 미드필더 옆자리(하프 스페이스)로 들어오는 움직임이다. 과르디올라가 바이에른에서 필립 람으로 실험했고, 맨시티에서 표준 전술로 만들었다.',
      '효과는 세 가지다. 첫째, 중원이 2명에서 3명으로 늘어 점유 싸움에서 우위를 갖는다. 둘째, 공을 잃었을 때 중앙에 이미 서 있으므로 상대 역습의 중앙 통로를 즉시 차단한다(역습 보험). 셋째, 측면 공간을 윙어가 독점하게 되어 윙어의 1대1 아이솔레이션이 살아난다.',
      '요구 조건이 특수하다. 풀백이 사실상 중앙 미드필더의 발밑·시야·판단을 가져야 하므로 아무나 소화할 수 없다. 또 풀백이 비운 측면 뒷공간은 구조적 약점으로 남는다 — 윙어가 수비 시 그 자리를 메워주는 약속이 세트로 필요하다.',
    ],
    strengths: [
      '중원 3대2 수적 우위 — 점유·전진 패스 각 증가',
      '상실 즉시 중앙 역습 통로 차단 (rest defence)',
      '윙어가 측면을 독점 — 1대1 돌파 상황 극대화',
      '상대 윙어가 수비 위치를 잡기 어려워짐 (따라 들어올 것인가?)',
    ],
    weaknesses: [
      '중앙 미드필더급 기술을 가진 풀백이 필요 — 자원 희소',
      '비운 측면 뒷공간이 스위칭 한 방에 노출',
      '윙어의 수비 가담 약속이 깨지면 측면이 통째로 열림',
    ],
    keyPoints: [
      '인버트 타이밍: 공이 반대편 센터백에 있을 때 미리 들어온다',
      '윙어는 터치라인에 최대 폭으로 고정 (풀백과 레인 중복 금지)',
      '상실 시 인버티드 풀백이 1차 카운터프레스 축',
      '상대가 측면 뒷공간을 노리면 즉시 정상 풀백 위치로 복귀 판단',
    ],
    counters: ['a-counter', 'a-wing'],
    famousTeams: ['맨체스터 시티 (과르디올라)', '바이에른 뮌헨 (람)', '아스널 (진첸코)'],
    tags: ['풀백', '중원과부하', '레스트디펜스', '하프스페이스'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 8 },
        { id: 'lb', role: 'LB', x: 14, y: 30 },
        { id: 'cb1', role: 'CB', x: 37, y: 18 },
        { id: 'cb2', role: 'CB', x: 63, y: 18 },
        { id: 'rb', role: 'RB', x: 60, y: 38 },
        { id: 'dm', role: 'DM', x: 42, y: 38 },
        { id: 'cm1', role: 'CM', x: 32, y: 54 },
        { id: 'cm2', role: 'CM', x: 68, y: 54 },
        { id: 'lw', role: 'LW', x: 14, y: 70 },
        { id: 'st', role: 'ST', x: 50, y: 74 },
        { id: 'rw', role: 'RW', x: 88, y: 70 },
      ],
      ball: { x: 63, y: 22 },
      arrows: [
        { from: { x: 85, y: 28 }, to: { x: 63, y: 37 }, kind: 'run', subjectId: 'rb', curve: -0.2 },
        { from: { x: 63, y: 20 }, to: { x: 60, y: 35 }, kind: 'pass', subjectId: 'cb2' },
        { from: { x: 88, y: 60 }, to: { x: 88, y: 69 }, kind: 'run', subjectId: 'rw' },
      ],
    },
  },
  {
    id: 'bu-halfspace',
    name: '하프 스페이스 공략',
    nameEn: 'Half-space Exploitation',
    category: 'buildup',
    difficulty: 3,
    summary:
      '측면과 중앙 사이의 회색 지대에서 공을 받아 수비 구조를 비트는 현대 공격 전개의 핵심 개념.',
    description: [
      '하프 스페이스는 경기장을 세로로 5등분했을 때 중앙과 측면 사이의 두 레인이다. 이 지역이 위력적인 이유는 수비의 책임 소재가 모호하기 때문이다 — 풀백이 나가면 뒷공간이, 센터백이 나가면 중앙이, 미드필더가 내려오면 그 앞 공간이 열린다.',
      '하프 스페이스에서 공을 잡은 선수는 세 가지를 동시에 할 수 있다: 골문을 향한 대각 슈팅, 측면 뒷공간으로 스루패스, 반대편으로 스위칭. 측면(각도 제한)이나 중앙(밀도 높음)보다 선택지가 많다. 데 브라위너의 어시스트 대부분이 오른쪽 하프 스페이스에서 나온다.',
      '팀 차원의 설계는 "누가 그 레인에 서느냐"다. 인버티드 윙어, 공격형 미드필더, 인버티드 풀백, 내려오는 스트라이커까지 — 포메이션과 무관하게 하프 스페이스 점유를 약속하는 것이 현대 포지셔널 플레이의 골자다.',
    ],
    strengths: [
      '수비 책임 소재가 모호한 지역 — 누가 나와도 다른 공간이 열림',
      '슈팅·스루패스·스위칭 세 선택지가 모두 열린 각도',
      '컷백과 대각 침투 패스의 최적 출발점',
      '어느 포메이션에도 얹을 수 있는 개념형 전술',
    ],
    weaknesses: [
      '선수의 수용 능력(스캔·퍼스트터치·판단)에 크게 의존',
      '밀집 로우 블록은 하프 스페이스까지 막아버림',
      '점유가 전제 — 공을 오래 못 가지면 개념 자체가 무의미',
    ],
    keyPoints: [
      '레인 규율: 같은 세로 레인에 두 명이 서지 않는다',
      '하프 스페이스 수령자는 몸을 열고(전방+측면 시야) 받는다',
      '풀백이 나오면 뒷공간 침투, 센터백이 나오면 중앙 슛 — 수비 반응을 읽고 결정',
      '반대편 하프 스페이스에도 한 명 상주 — 스위칭 후 즉시 재공략',
    ],
    counters: ['d-lowblock', 'f532'],
    famousTeams: ['맨체스터 시티 (데 브라위너)', '바이에른 뮌헨 (뮐러 — 라움도이터)', '리버풀'],
    tags: ['하프스페이스', '포지셔널플레이', '컷백', '레인'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 6 },
        { id: 'lb', role: 'LB', x: 15, y: 28 },
        { id: 'cb1', role: 'CB', x: 37, y: 18 },
        { id: 'cb2', role: 'CB', x: 63, y: 18 },
        { id: 'rb', role: 'RB', x: 85, y: 28 },
        { id: 'dm1', role: 'DM', x: 40, y: 40 },
        { id: 'dm2', role: 'DM', x: 60, y: 40 },
        { id: 'am', role: 'AM', x: 64, y: 62 },
        { id: 'lw', role: 'LW', x: 14, y: 66 },
        { id: 'st', role: 'ST', x: 48, y: 78 },
        { id: 'rw', role: 'RW', x: 88, y: 70 },
      ],
      opponents: [
        { id: 'o-lb', role: 'LB', x: 78, y: 74 },
        { id: 'o-cb1', role: 'CB', x: 46, y: 82 },
        { id: 'o-cb2', role: 'CB', x: 60, y: 82 },
        { id: 'o-dm', role: 'DM', x: 54, y: 58 },
      ],
      ball: { x: 60, y: 43 },
      arrows: [
        { from: { x: 60, y: 42 }, to: { x: 63, y: 59 }, kind: 'pass', subjectId: 'dm2' },
        {
          from: { x: 64, y: 64 },
          to: { x: 74, y: 86 },
          kind: 'pass',
          subjectId: 'am',
          curve: -0.15,
        },
        {
          from: { x: 88, y: 72 },
          to: { x: 76, y: 87 },
          kind: 'run',
          subjectId: 'rw',
          curve: -0.15,
        },
        { from: { x: 48, y: 80 }, to: { x: 42, y: 85 }, kind: 'run', subjectId: 'st' },
      ],
    },
  },
  {
    id: 'bu-switch',
    name: '스위칭 플레이 (사이드 체인지)',
    nameEn: 'Switch of Play',
    category: 'buildup',
    difficulty: 2,
    summary:
      '한쪽에 상대를 모아놓고 반대편의 열린 공간으로 한 번에 옮긴다 — 블록을 찢는 가장 큰 칼.',
    description: [
      '스위칭 플레이는 의도적으로 한쪽 측면에서 점유하며 상대 수비 블록을 그쪽으로 끌어당긴 뒤, 긴 대각 패스 한 번으로 반대편의 열린 측면에 공을 옮기는 전개다. 수비 블록은 공을 따라 좌우로 슬라이드하는데, 블록의 이동 속도보다 공의 이동 속도가 빠르다는 물리적 사실을 무기로 삼는다.',
      '성공 조건은 두 가지다. 첫째, 반대편 선수(주로 윙어)가 스위칭이 오기 전까지 최대 폭을 유지하며 "숨어" 있어야 한다 — 미리 안쪽으로 좁혀버리면 도착해도 공간이 없다. 둘째, 패스의 질 — 바운드 없이 한 번에 도달하는 45~60m 대각 패스 또는 두 번의 빠른 중계 패스.',
      '스위칭 직후 5초가 승부처다. 상대 블록이 재정렬하기 전에 1대1 돌파, 컷백, 얼리 크로스로 마무리까지 가야 한다. 재정렬을 허용하면 같은 작업을 반대편에서 반복한다 — 이 반복 자체가 상대 체력과 집중력을 갉아먹는다.',
    ],
    strengths: [
      '공은 블록보다 빠르다 — 구조적으로 항상 유효한 원리',
      '밀집 수비를 정면 돌파 없이 옆으로 벗겨냄',
      '반대편 윙어에게 1대1 상황을 배달',
      '반복될수록 상대 블록의 슬라이드가 느려짐 (체력 소모)',
    ],
    weaknesses: [
      '대각 장거리 패스의 정확도에 의존 — 실패 시 소유권 상납',
      '스위칭 후 5초 안에 마무리 못 하면 원점',
      '반대편 윙어가 미리 좁혀버리면 받을 공간이 없음',
    ],
    keyPoints: [
      '반대편 윙어는 스위칭 전까지 터치라인에서 대기 (폭 유지가 생명)',
      '킥은 받는 사람의 전진 발 쪽으로 — 트래핑 즉시 돌파 가능하게',
      '장거리 킥이 안 되면 중계 2패스(측면→중앙→반대측면)로 대체',
      '스위칭 직후 가까운 풀백·미드필더가 즉시 지원 (2대1 형성)',
    ],
    counters: ['d-midblock'],
    famousTeams: ['리버풀 (아놀드의 대각 스위칭)', '맨체스터 시티', '레알 마드리드 (크로스)'],
    tags: ['스위칭', '사이드체인지', '대각패스', '폭활용'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 6 },
        { id: 'lb', role: 'LB', x: 10, y: 50 },
        { id: 'cb1', role: 'CB', x: 32, y: 20 },
        { id: 'cb2', role: 'CB', x: 60, y: 18 },
        { id: 'rb', role: 'RB', x: 82, y: 30 },
        { id: 'dm', role: 'DM', x: 38, y: 38 },
        { id: 'cm1', role: 'CM', x: 22, y: 52 },
        { id: 'cm2', role: 'CM', x: 48, y: 48 },
        { id: 'lw', role: 'LW', x: 12, y: 68 },
        { id: 'st', role: 'ST', x: 42, y: 70 },
        { id: 'rw', role: 'RW', x: 88, y: 66 },
      ],
      opponents: [
        { id: 'o-dm', role: 'DM', x: 30, y: 60 },
        { id: 'o-cm1', role: 'CM', x: 25, y: 50 },
        { id: 'o-cm2', role: 'CM', x: 40, y: 55 },
      ],
      ball: { x: 22, y: 55 },
      arrows: [
        { from: { x: 12, y: 66 }, to: { x: 20, y: 54 }, kind: 'pass', subjectId: 'lw' },
        {
          from: { x: 22, y: 54 },
          to: { x: 85, y: 64 },
          kind: 'pass',
          subjectId: 'cm1',
          curve: -0.25,
        },
        { from: { x: 88, y: 68 }, to: { x: 84, y: 80 }, kind: 'run', subjectId: 'rw' },
        { from: { x: 82, y: 32 }, to: { x: 86, y: 52 }, kind: 'run', subjectId: 'rb' },
      ],
    },
  },

  // ─────────────── 공격 전술 ───────────────
  {
    id: 'a-false9',
    name: '가짜 9번 (False 9)',
    nameEn: 'False Nine',
    category: 'attack',
    difficulty: 3,
    summary: '스트라이커가 중원으로 내려와 센터백을 딜레마에 빠뜨리고, 빈 공간은 윙어가 침투한다.',
    description: [
      '가짜 9번은 명목상 최전방 공격수가 골문 앞에 머물지 않고 미드필더 지역으로 내려와 플레이메이커처럼 움직이는 역할이다. 메시(과르디올라 바르셀로나, 2009 엘 클라시코 6-2)가 현대적 정의를 완성했다.',
      '위력은 센터백의 딜레마에서 나온다. 내려가는 9번을 따라가면 수비 라인 중앙에 거대한 구멍이 생기고, 그 공간으로 양 윙어가 대각 침투한다. 따라가지 않으면 9번이 라인 사이에서 자유롭게 공을 받아 마지막 패스를 배급한다. 어느 쪽을 선택해도 공격이 이득을 본다.',
      '전제 조건은 세 가지다. 내려와서 미드필더 수준의 연계를 할 수 있는 9번, 뒷공간을 찌를 수 있는 빠른 윙어 2명, 그리고 9번이 비운 박스를 채우는 2선 침투. 셋 중 하나라도 없으면 그냥 최전방에 아무도 없는 팀이 된다.',
    ],
    strengths: [
      '센터백을 구조적 딜레마에 빠뜨림 — 어떤 선택도 손해',
      '라인 사이에서 창의적인 선수가 자유를 얻음',
      '윙어의 대각 침투가 최대 위력을 발휘',
      '상대 수비형 미드필더 주변에 수적 우위 형성',
    ],
    weaknesses: [
      '박스 안 타깃이 없어 크로스 공격이 무력화',
      '연계형 9번 + 침투형 윙어 조합이 없으면 성립 불가',
      '깊게 내려앉은 수비에는 딜레마 자체가 발생하지 않음',
      '9번의 수비 가담 부족 시 중원 압박 구조가 깨짐',
    ],
    keyPoints: [
      '9번이 내려가는 타이밍 = 공이 하프라인을 넘는 순간',
      '윙어 침투는 9번과 교차 — 9번이 내려가면 윙어는 안쪽 뒷공간으로',
      '박스 필러 지정: 9번이 비운 박스는 반대편 윙어나 8번이 채운다',
      '센터백이 따라나오면 1터치 리턴으로 뒷공간 즉시 공략',
    ],
    counters: ['d-marking', 'f532'],
    famousTeams: ['바르셀로나 (메시)', '스페인 유로 2012 (파브레가스)', '로마 (토티)'],
    tags: ['가짜9번', '라인사이', '딜레마', '침투교차'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 6 },
        { id: 'lb', role: 'LB', x: 15, y: 30 },
        { id: 'cb1', role: 'CB', x: 37, y: 20 },
        { id: 'cb2', role: 'CB', x: 63, y: 20 },
        { id: 'rb', role: 'RB', x: 85, y: 30 },
        { id: 'dm', role: 'DM', x: 50, y: 38 },
        { id: 'cm1', role: 'CM', x: 35, y: 52 },
        { id: 'cm2', role: 'CM', x: 65, y: 52 },
        { id: 'lw', role: 'LW', x: 18, y: 78 },
        { id: 'st', role: 'ST', x: 50, y: 62 },
        { id: 'rw', role: 'RW', x: 82, y: 78 },
      ],
      opponents: [
        { id: 'o-cb1', role: 'CB', x: 42, y: 82 },
        { id: 'o-cb2', role: 'CB', x: 58, y: 82 },
        { id: 'o-dm', role: 'DM', x: 50, y: 55 },
      ],
      ball: { x: 50, y: 64 },
      arrows: [
        { from: { x: 50, y: 74 }, to: { x: 50, y: 64 }, kind: 'run', subjectId: 'st' },
        { from: { x: 42, y: 82 }, to: { x: 46, y: 72 }, kind: 'run', subjectId: 'o-cb1' },
        { from: { x: 18, y: 78 }, to: { x: 36, y: 88 }, kind: 'run', subjectId: 'lw', curve: 0.2 },
        { from: { x: 82, y: 78 }, to: { x: 64, y: 88 }, kind: 'run', subjectId: 'rw', curve: -0.2 },
        {
          from: { x: 50, y: 63 },
          to: { x: 38, y: 86 },
          kind: 'pass',
          subjectId: 'st',
          curve: 0.15,
        },
      ],
    },
  },
  {
    id: 'a-overload-iso',
    name: '오버로드 투 아이솔레이트',
    nameEn: 'Overload to Isolate',
    category: 'attack',
    difficulty: 3,
    summary: '한쪽에 숫자를 몰아 상대를 끌어모으고, 반대편 에이스에게 1대1을 만들어 바치는 설계.',
    description: [
      '오버로드 투 아이솔레이트는 스위칭 플레이의 목적을 한 단계 구체화한 개념이다. 한쪽 측면에 의도적으로 5~6명을 배치해 상대 수비를 그쪽으로 끌어모으고(오버로드), 반대편에는 팀 최고의 드리블러 한 명만 남긴다(아이솔레이트). 그리고 공을 그에게 배달한다 — 이제 그는 풀백과 단둘이다.',
      '과르디올라 맨시티의 시그니처다. 왼쪽에서 데 브라위네·귄도안·실바가 공을 돌리는 동안 오른쪽 터치라인에 마흐레즈가 홀로 서 있고, 스위칭이 도착하는 순간 리그 최고의 1대1 드리블러가 커버 없는 풀백을 상대한다.',
      '이 전술은 "우리 에이스가 1대1에서 이길 확률 > 팀이 밀집 블록을 뚫을 확률"이라는 계산에 기반한다. 따라서 반대편에 세울 위닝 카드가 없다면 성립하지 않으며, 오버로드 쪽 점유가 불안하면 스위칭 전에 공을 잃는다.',
    ],
    strengths: [
      '팀 전술로 에이스의 1대1 능력을 극대화',
      '상대 협력 수비(더블팀)를 구조적으로 차단',
      '오버로드 쪽에서 뚫려도 그 자체로 득점 루트',
      '수비 블록의 좌우 슬라이드를 강제해 체력 소모 유발',
    ],
    weaknesses: [
      '1대1을 이겨줄 위닝 카드가 없으면 무의미',
      '아이솔레이트된 에이스가 봉쇄되면 공격이 단조로워짐',
      '오버로드 쪽 탈취당하면 반대편이 텅 빈 채 역습 허용',
    ],
    keyPoints: [
      '에이스는 스위칭 도착 전까지 절대 안쪽으로 좁히지 않는다',
      '오버로드는 진짜 위협이어야 한다 — 시늉만 내면 상대가 안 쏠림',
      '스위칭 도착 즉시 근처 풀백이 언더랩 옵션 제공 (수비 선택지 분산)',
      '1대1 실패 시 리사이클 — 다시 오버로드로 돌아가 반복',
    ],
    counters: ['f532', 'd-lowblock'],
    famousTeams: ['맨체스터 시티 (마흐레즈·도쿠)', '바이에른 뮌헨 (로번 시대)', 'PSG (음바페)'],
    tags: ['오버로드', '아이솔레이션', '1대1', '에이스활용'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 6 },
        { id: 'lb', role: 'LB', x: 20, y: 30 },
        { id: 'cb1', role: 'CB', x: 37, y: 16 },
        { id: 'cb2', role: 'CB', x: 63, y: 16 },
        { id: 'rb', role: 'RB', x: 88, y: 45 },
        { id: 'dm', role: 'DM', x: 50, y: 36 },
        { id: 'cm1', role: 'CM', x: 58, y: 50 },
        { id: 'cm2', role: 'CM', x: 70, y: 54 },
        { id: 'rw', role: 'RW', x: 84, y: 64 },
        { id: 'st', role: 'ST', x: 60, y: 74 },
        { id: 'lw', role: 'LW', x: 12, y: 74 },
      ],
      opponents: [
        { id: 'o-cm1', role: 'CM', x: 62, y: 58 },
        { id: 'o-cm2', role: 'CM', x: 72, y: 60 },
        { id: 'o-lb', role: 'LB', x: 80, y: 70 },
        { id: 'o-rb', role: 'RB', x: 22, y: 80 },
      ],
      ball: { x: 70, y: 57 },
      arrows: [
        { from: { x: 70, y: 56 }, to: { x: 59, y: 51 }, kind: 'pass', subjectId: 'cm2' },
        {
          from: { x: 58, y: 52 },
          to: { x: 14, y: 72 },
          kind: 'pass',
          subjectId: 'cm1',
          curve: 0.25,
        },
        { from: { x: 12, y: 76 }, to: { x: 17, y: 88 }, kind: 'run', subjectId: 'lw' },
      ],
    },
  },

  // ─────────────── 수비 전술 ───────────────
  {
    id: 'd-marking',
    name: '대인방어 vs 지역방어',
    nameEn: 'Man-marking vs Zonal Marking',
    category: 'defense',
    difficulty: 2,
    summary: '사람을 잡을 것인가, 공간을 지킬 것인가 — 두 방어 철학의 원리와 현대식 혼합 해법.',
    description: [
      '대인방어는 각 수비수가 특정 상대를 전담해 따라다니는 방식이고, 지역방어는 각자 맡은 공간을 지키다가 그 공간에 들어온 상대를 상대하는 방식이다. 현대 축구의 오픈 플레이 수비는 대부분 지역방어가 기본이지만, 상황과 지역에 따라 대인 원칙을 섞는다.',
      '대인방어의 강점은 책임의 명확함이다 — "네 사람은 네가 막는다". 그러나 상대의 움직임에 수비 대형이 통째로 끌려다니는 치명적 약점이 있다. 가짜 9번이 대인방어를 부수는 대표적 무기인 이유다. 지역방어는 대형을 유지하지만, 지역 경계에서 마크를 주고받는 순간(핸드오버)에 구멍이 생긴다.',
      '실전 해법은 혼합이다. 블록 바깥에서는 지역 원칙으로 대형을 유지하고, 블록 안에 들어온 상대에게는 대인 전환으로 밀착한다. 압박이 강한 팀들은 중원에서 사람 지향(man-oriented) 압박을 쓰되, 최종 수비 라인은 지역 원칙으로 뒷공간을 보호한다.',
    ],
    strengths: [
      '(대인) 책임 소재가 명확 — 개인 집중력 극대화',
      '(지역) 수비 대형이 유지되어 공간 헌납이 없음',
      '(혼합) 상황별 장점만 취하는 현대식 표준',
      '상대 핵심 선수를 지우는 스페셜 마킹 옵션',
    ],
    weaknesses: [
      '(대인) 상대 무브먼트에 대형이 끌려다님 — 가짜 9번에 취약',
      '(지역) 지역 경계 핸드오버 순간에 프리맨 발생',
      '(혼합) 전환 기준이 모호하면 둘 다 놓침 — 훈련량 필요',
    ],
    keyPoints: [
      '기본 원칙: 블록 밖 = 지역, 블록 안 = 대인 전환',
      '핸드오버 콜 약속: "넘긴다/받는다" 소통을 명문화',
      '최종 라인은 지역 우선 — 사람 따라 라인을 깨지 않는다',
      '상대 에이스 1명만 스페셜 대인 마킹(그림자 수비)으로 지정 가능',
    ],
    counters: ['a-false9', 's-corner-near'],
    famousTeams: [
      '아탈란타 (가스페리니 — 전면 대인)',
      '리즈 (비엘사 — 대인)',
      '대부분의 현대 팀 (혼합)',
    ],
    tags: ['대인방어', '지역방어', '핸드오버', '수비원칙'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 5 },
        { id: 'lb', role: 'LB', x: 18, y: 20 },
        { id: 'cb1', role: 'CB', x: 39, y: 20 },
        { id: 'cb2', role: 'CB', x: 61, y: 20 },
        { id: 'rb', role: 'RB', x: 82, y: 20 },
        { id: 'dm', role: 'DM', x: 50, y: 32 },
        { id: 'cm1', role: 'CM', x: 34, y: 42 },
        { id: 'cm2', role: 'CM', x: 62, y: 43 },
        { id: 'lm', role: 'LM', x: 15, y: 44 },
        { id: 'rm', role: 'RM', x: 85, y: 44 },
        { id: 'st', role: 'ST', x: 50, y: 60 },
      ],
      opponents: [
        { id: 'o-am1', role: 'AM', x: 32, y: 46 },
        { id: 'o-am2', role: 'AM', x: 58, y: 47 },
        { id: 'o-cm', role: 'CM', x: 50, y: 55 },
      ],
      ball: { x: 50, y: 58 },
      arrows: [
        { from: { x: 34, y: 43 }, to: { x: 32, y: 45 }, kind: 'press', subjectId: 'cm1' },
        { from: { x: 62, y: 44 }, to: { x: 59, y: 46 }, kind: 'press', subjectId: 'cm2' },
        { from: { x: 18, y: 21 }, to: { x: 26, y: 21 }, kind: 'run', subjectId: 'lb' },
        { from: { x: 82, y: 21 }, to: { x: 74, y: 21 }, kind: 'run', subjectId: 'rb' },
      ],
    },
  },
  {
    id: 'd-recovery',
    name: '수비 전환 (리커버리 런)',
    nameEn: 'Defensive Transition / Recovery Runs',
    category: 'defense',
    difficulty: 2,
    summary: '공을 잃은 직후의 6초 — 가까운 자는 지연하고, 나머지는 골문 쪽으로 전력 질주한다.',
    description: [
      '수비 전환은 공격하다 공을 잃은 순간부터 수비 대형을 회복할 때까지의 국면이다. 현대 축구에서 실점의 가장 큰 비중이 이 국면에서 나온다 — 대형이 무너진 채로 상대 역습을 맞기 때문이다.',
      '원칙은 역할 분담이다. 공에서 가장 가까운 1~2명은 탈취가 아니라 "지연"이 목표다 — 정면 태클 대신 앞을 막아서며 상대의 전진 속도를 늦춘다(재킹). 그동안 나머지 전원은 공이 아니라 자기 골문 방향으로 최단 경로 전력 질주(리커버리 런)해서 골문과 공 사이에 몸을 세운다.',
      '리커버리 런의 목적지는 "공 뒤"가 아니라 "골문 쪽(goal-side)"이다. 공을 쫓아 뛰면 영원히 따라잡지 못한다 — 상대보다 먼저 위험 지역에 도착해 수비 블록을 재건하는 것이 목표다. 6초 안에 블록이 서면 역습은 지공으로 강등된다.',
    ],
    strengths: [
      '실점 확률이 가장 높은 국면을 직접 관리',
      '개인 스피드보다 약속(지연+골사이드)으로 해결 — 훈련으로 확보 가능',
      '게겐프레싱 실패 시의 안전망 역할',
      '상대 역습을 지공으로 강등시키면 심리적 타격도 큼',
    ],
    weaknesses: [
      '전원 공격 상황(코너킥 등)에서는 물리적으로 회복 불가',
      '지연 담당이 무리한 태클로 제껴지면 도미노 붕괴',
      '반복되는 전력 질주 — 후반 체력 저하 시 규율 유지 어려움',
    ],
    keyPoints: [
      '가장 가까운 1명: 태클 금지, 지연(재킹)이 임무 — 5초를 벌어라',
      '나머지: 공이 아닌 골문 방향으로 최단 경로 스프린트',
      '목적지는 골사이드 — 상대와 골문 사이에 먼저 도착',
      '중앙 통로 우선 복구 — 측면은 내주더라도 중앙은 막는다',
    ],
    counters: ['a-counter'],
    famousTeams: [
      '리버풀 (클롭)',
      '레알 마드리드 (챔피언스리그 노하우)',
      '모든 상위권 팀의 기본기',
    ],
    tags: ['수비전환', '리커버리런', '지연', '골사이드'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 6 },
        { id: 'cb1', role: 'CB', x: 40, y: 40 },
        { id: 'cb2', role: 'CB', x: 62, y: 42 },
        { id: 'lb', role: 'LB', x: 18, y: 60 },
        { id: 'rb', role: 'RB', x: 84, y: 58 },
        { id: 'dm', role: 'DM', x: 50, y: 52 },
        { id: 'cm1', role: 'CM', x: 35, y: 65 },
        { id: 'cm2', role: 'CM', x: 65, y: 66 },
        { id: 'lw', role: 'LW', x: 20, y: 80 },
        { id: 'rw', role: 'RW', x: 80, y: 80 },
        { id: 'st', role: 'ST', x: 50, y: 85 },
      ],
      opponents: [
        { id: 'o-st', role: 'ST', x: 55, y: 45 },
        { id: 'o-w', role: 'RW', x: 75, y: 50 },
      ],
      ball: { x: 55, y: 47 },
      arrows: [
        { from: { x: 40, y: 41 }, to: { x: 50, y: 44 }, kind: 'press', subjectId: 'cb1' },
        { from: { x: 50, y: 52 }, to: { x: 50, y: 38 }, kind: 'run', subjectId: 'dm' },
        { from: { x: 35, y: 65 }, to: { x: 40, y: 44 }, kind: 'run', subjectId: 'cm1', curve: 0.1 },
        { from: { x: 18, y: 60 }, to: { x: 30, y: 36 }, kind: 'run', subjectId: 'lb', curve: 0.1 },
        { from: { x: 84, y: 58 }, to: { x: 74, y: 40 }, kind: 'run', subjectId: 'rb', curve: -0.1 },
      ],
    },
  },

  // ─────────────── 세트피스 ───────────────
  {
    id: 's-throwin',
    name: '스로인 루틴',
    nameEn: 'Throw-in Routines',
    category: 'setpiece',
    difficulty: 1,
    summary:
      '경기당 40회 넘게 나오는 가장 흔한 세트피스 — 롱 스로와 3인 삼각 루틴으로 무기가 된다.',
    description: [
      '스로인은 경기당 평균 40~50회 발생하지만 대부분의 팀이 설계 없이 대충 처리한다. 리버풀이 스로인 전담 코치(토마스 그뢰네마르크)를 고용해 스로인 유지율을 리그 최하위권에서 최상위권으로 끌어올린 뒤, 상위 팀들이 잇달아 루틴을 도입했다.',
      '공격 지역에서는 롱 스로가 코너킥급 무기가 된다. 페널티 박스로 던지는 긴 스로인은 오프사이드가 없다는 결정적 이점이 있고, 니어 지역에서 살짝 스치는 플릭 한 번이면 골문 앞 혼전이 만들어진다. 들라프(스토크)의 롱 스로는 한 시즌 리그 최다 어시스트급 생산성을 기록했다.',
      '일반 지역에서는 3인 삼각 루틴이 기본이다. 던지는 사람 근처에 두 명이 삼각형을 만들고, 한 명이 마크맨을 끌고 빠지면(디코이) 다른 한 명이 그 공간으로 들어와 받는다. 원칙은 "받는 사람이 전방을 보고 받게 하라" — 터치라인에 등을 진 채 받으면 즉시 압박에 갇힌다.',
    ],
    strengths: [
      '경기당 40회+ — 개선 효과가 누적되는 최대 빈도 세트피스',
      '롱 스로는 오프사이드가 없는 박스 폭격',
      '루틴 몇 개만 익혀도 소유권 유지율이 즉시 상승',
      '아마추어 수준에서 가장 가성비 높은 훈련 항목',
    ],
    weaknesses: [
      '롱 스로는 전담 자원(어깨)이 필요',
      '루틴 없이 던지면 소유권 상납 1순위 상황',
      '상대가 스로인 압박을 설계해오면 후방 리턴 옵션 필수',
    ],
    keyPoints: [
      '기본 삼각형: 디코이가 마크맨을 끌고 나가면 빈 공간으로 두 번째가 진입',
      '받는 사람은 전방을 보고 — 등지고 받으면 즉시 리턴',
      '공격 3분의1 지역에선 롱 스로 = 코너킥 루틴과 동일 취급',
      '던진 사람은 던진 직후 필드로 들어와 +1이 된다 (잊기 쉬운 규칙)',
    ],
    counters: [],
    famousTeams: ['리버풀 (그뢰네마르크 코치)', '스토크 시티 (들라프)', '브렌트포드'],
    tags: ['스로인', '롱스로', '삼각루틴', '디코이'],
    board: {
      players: [
        { id: 't', role: 'T', x: 97, y: 80 },
        { id: 'tg', role: 'TG', x: 80, y: 88 },
        { id: 'a', role: 'A', x: 70, y: 92 },
        { id: 'b', role: 'B', x: 60, y: 88 },
        { id: 's', role: 'S', x: 86, y: 74 },
        { id: 'r1', role: 'R', x: 68, y: 65 },
        { id: 'r2', role: 'R', x: 45, y: 60 },
      ],
      opponents: [
        { id: 'o-x1', role: '', x: 78, y: 90 },
        { id: 'o-x2', role: '', x: 66, y: 90 },
        { id: 'o-x3', role: '', x: 58, y: 92 },
        { id: 'o-gk', role: 'GK', x: 50, y: 97 },
      ],
      ball: { x: 96, y: 79 },
      arrows: [
        { from: { x: 96, y: 80 }, to: { x: 81, y: 88 }, kind: 'pass', subjectId: 't', curve: -0.1 },
        { from: { x: 80, y: 89 }, to: { x: 66, y: 93 }, kind: 'pass', subjectId: 'tg' },
        { from: { x: 70, y: 92 }, to: { x: 66, y: 94 }, kind: 'run', subjectId: 'a' },
        { from: { x: 86, y: 76 }, to: { x: 90, y: 82 }, kind: 'run', subjectId: 's' },
      ],
    },
  },
  {
    id: 's-corner-zonal',
    name: '지역방어 코너 수비',
    nameEn: 'Zonal Corner Defence',
    category: 'setpiece',
    difficulty: 2,
    summary:
      '골문 앞 위험 존에 키 큰 수비수를 고정 배치 — 사람이 아니라 공이 떨어질 공간을 지킨다.',
    description: [
      '지역방어 코너 수비는 상대 공격수를 따라다니는 대신, 실점 확률이 높은 존(니어포스트 앞, 골에어리어 경계, 페널티 스팟)에 공중볼 강한 수비수들을 고정 배치하는 방식이다. 공이 어디로 오든 그 존의 담당자가 먼저 걷어낸다.',
      '대인방어 코너 수비의 약점 — 스크린과 교차 이동에 마크가 벗겨지는 문제 — 를 원천 차단한다는 것이 핵심 논리다. 지역방어에서 수비수는 상대의 움직임에 반응할 필요 없이 공만 보고 최단 거리로 공격하면 된다. 전담 수비수의 제공권이 뛰어날수록 위력이 커진다.',
      '반면 도움닫기의 물리학이 약점이다. 정지 상태로 존을 지키는 수비수보다 달려 들어오는 공격수의 점프가 더 높다. 그래서 현대 팀 대부분은 혼합형을 쓴다 — 핵심 존 4~5개는 지역으로, 상대의 최고 헤더 1~2명에게는 대인 마커를 붙인다.',
    ],
    strengths: [
      '스크린·교차 이동 등 마크 벗기기 루틴을 무력화',
      '수비수가 공만 보고 판단 — 역할이 단순명료',
      '제공권 좋은 선수를 항상 최고 위험 지역에 배치',
      '걷어낸 뒤 역습 전환 대형이 이미 갖춰져 있음',
    ],
    weaknesses: [
      '정지 점프 vs 도움닫기 점프 — 물리적으로 불리한 경합',
      '존 사이 경계(특히 니어존과 중앙존 사이)가 급소',
      '상대가 특정 존에 2~3명을 겹쳐 과부하시키면 붕괴',
      '실점 시 책임 소재가 모호해 개선 논의가 어려움',
    ],
    keyPoints: [
      '존 우선순위: 니어포스트 앞 > 골에어리어 경계 > 페널티 스팟',
      '존 담당자는 공이 뜨는 순간 정지 상태를 풀고 전진 점프',
      '상대 최고 헤더 1~2명에게만 대인 마커 추가 (혼합형)',
      '박스 바깥 세컨드볼 존과 역습 아웃렛 2명을 잊지 말 것',
    ],
    counters: ['s-corner-near'],
    famousTeams: ['리버풀 (지역 기반 혼합)', '맨체스터 시티', '아틀레티코 마드리드'],
    tags: ['코너수비', '지역방어', '존마킹', '제공권'],
    board: {
      players: [
        { id: 'gk', role: 'GK', x: 50, y: 4 },
        { id: 'z1', role: 'Z', x: 41, y: 6 },
        { id: 'z2', role: 'Z', x: 50, y: 8 },
        { id: 'z3', role: 'Z', x: 59, y: 6 },
        { id: 'z4', role: 'Z', x: 44, y: 12 },
        { id: 'z5', role: 'Z', x: 56, y: 12 },
        { id: 'm1', role: 'M', x: 36, y: 10 },
        { id: 'm2', role: 'M', x: 63, y: 15 },
        { id: 'e', role: 'E', x: 50, y: 20 },
        { id: 'o1', role: 'O', x: 25, y: 35 },
        { id: 'o2', role: 'O', x: 65, y: 38 },
      ],
      opponents: [
        { id: 'o-k', role: 'K', x: 3, y: 2 },
        { id: 'o-a', role: '', x: 38, y: 12 },
        { id: 'o-b', role: '', x: 52, y: 14 },
        { id: 'o-c', role: '', x: 62, y: 17 },
      ],
      ball: { x: 4, y: 3 },
      arrows: [
        { from: { x: 4, y: 3 }, to: { x: 44, y: 8 }, kind: 'pass', subjectId: 'o-k', curve: 0.2 },
        { from: { x: 41, y: 7 }, to: { x: 43, y: 9 }, kind: 'run', subjectId: 'z1' },
        { from: { x: 44, y: 9 }, to: { x: 27, y: 33 }, kind: 'pass', subjectId: 'z1', curve: 0.15 },
      ],
    },
  },
];

/** 기존 전술 역링크 통합: 새 전술이 기존 전술의 카운터가 되는 관계 */
const BACKLINKS: Record<string, string[]> = {
  'p-highpress': ['bu-lavolpiana'],
  'p-gegen': ['bu-switch'],
  'd-lowblock': ['bu-halfspace'],
  'd-midblock': ['bu-switch'],
  f442: ['a-false9'],
};

const FILES: Record<Category, { file: string; constName: string; label: string }> = {
  formation: { file: 'formations.ts', constName: 'FORMATION_TACTICS', label: '포메이션' },
  buildup: { file: 'buildup.ts', constName: 'BUILDUP_TACTICS', label: '빌드업·전개' },
  attack: { file: 'attack.ts', constName: 'ATTACK_TACTICS', label: '공격 전술' },
  defense: { file: 'defense.ts', constName: 'DEFENSE_TACTICS', label: '수비 전술' },
  pressing: { file: 'pressing.ts', constName: 'PRESSING_TACTICS', label: '압박·전환' },
  setpiece: { file: 'setpieces.ts', constName: 'SETPIECE_TACTICS', label: '세트피스' },
};

const merged: Tactic[] = [
  ...TACTICS.map((t) =>
    BACKLINKS[t.id] ? { ...t, counters: [...t.counters, ...BACKLINKS[t.id]] } : t
  ),
  ...NEW_TACTICS,
];

for (const [category, meta] of Object.entries(FILES) as [Category, (typeof FILES)[Category]][]) {
  const items = merged.filter((t) => t.category === category);
  const body = items.map((t) => JSON.stringify(t, null, 2)).join(',\n');
  const src = `// ${meta.label} 전술 데이터 (스키마 v2 — 선수 id 포함, ADR-001)
// 표기 규칙: docs/CONTENT_GUIDE.md — 데이터 일괄 변경은 scripts/ 코드젠으로만
import type { Tactic } from '../types';

export const ${meta.constName}: Tactic[] = [
${body}
];
`;
  writeFileSync(`src/data/${meta.file}`, src);
  console.log(`✓ src/data/${meta.file} — ${items.length}종`);
}
console.log(`총 ${merged.length}종 (기존 ${TACTICS.length} + 신규 ${NEW_TACTICS.length})`);
