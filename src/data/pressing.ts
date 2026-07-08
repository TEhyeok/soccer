// 압박·전환 전술 데이터 (스키마 v2 — 선수 id 포함, ADR-001)
// 표기 규칙: docs/CONTENT_GUIDE.md — 데이터 일괄 변경은 scripts/ 코드젠으로만
import type { Tactic } from '../types';

export const PRESSING_TACTICS: Tactic[] = [
  {
    id: 'p-gegen',
    name: '게겐프레싱',
    nameEn: 'Gegenpressing / Counter-Press',
    category: 'pressing',
    difficulty: 3,
    summary: '공을 잃은 "그 순간"이 최고의 공격 기회. 5초 안에 되빼앗아 무방비 수비를 찌른다.',
    description: [
      '게겐프레싱(카운터 프레싱)은 공을 잃은 직후 물러나 정비하는 대신, 공 주변 선수들이 즉시 달려들어 되빼앗는 전술이다. 클롭은 이를 "세계 최고의 플레이메이커"라고 불렀다. 공을 막 빼앗은 상대는 대형이 흐트러져 있고 시야가 확보되지 않아, 이 순간 되빼앗으면 곧바로 최상급 찬스가 된다.',
      '발동 조건은 잃기 전의 대형이다. 공격 시 선수 간 거리를 좁게 유지(콤팩트)해야 잃는 순간 여러 명이 동시에 접근할 수 있다. 통상 5~6초간 전력 압박하고, 이 시간 안에 되빼앗지 못하면 미련 없이 블록 수비로 전환한다.',
      '방식은 팀마다 다르다. 클롭식은 공을 향해 직선 돌진(볼 지향), 투헬식은 상대의 패스 길을 몸으로 가리며 접근(패스길 지향)한다. 공통 전제는 압박에 가담하지 않는 후방 선수들의 라인 전진 — 전체 대형이 함께 밀어 올라가야 압박 뒤 공간이 생기지 않는다.',
    ],
    strengths: [
      '탈취 위치가 상대 골문과 가까워 찬스 퀄리티 최상',
      '상대에게 역습 기회 자체를 주지 않음',
      '별도의 플레이메이커 없이 찬스 생산 가능',
      '상대 빌드업 선수들에게 지속적 심리 압박',
    ],
    weaknesses: [
      '90분 유지 불가능한 극한의 체력 소모 — 로테이션 필수',
      '압박을 벗겨내는 기술 좋은 상대에게 대량 실점 위험',
      '롱볼로 압박 자체를 건너뛰는 상대에게 무력화',
      '공격 시 대형이 넓으면 발동 자체가 불가능',
    ],
    keyPoints: [
      '공격 시에도 선수 간 거리 10~15m 유지 (콤팩트한 공격 대형)',
      '상실 즉시 가장 가까운 3명이 공·패스길·리시버를 분담 압박',
      '5초 룰: 되빼앗기 실패 시 즉시 블록 수비 전환',
      '후방 라인도 함께 전진 — 압박과 라인업은 한 몸',
    ],
    counters: ['a-longball', 'f532', 'bu-switch'],
    famousTeams: ['도르트문트·리버풀 (클롭)', 'RB 라이프치히', '바이에른 뮌헨 (플릭)'],
    tags: ['압박', '전환', '카운터프레스', '5초룰'],
    board: {
      players: [
        {
          id: 'gk',
          x: 50,
          y: 8,
          role: 'GK',
        },
        {
          id: 'lb',
          x: 20,
          y: 36,
          role: 'LB',
        },
        {
          id: 'cb1',
          x: 40,
          y: 33,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 62,
          y: 33,
          role: 'CB',
        },
        {
          id: 'rb',
          x: 83,
          y: 36,
          role: 'RB',
        },
        {
          id: 'dm',
          x: 50,
          y: 52,
          role: 'DM',
        },
        {
          id: 'cm1',
          x: 33,
          y: 62,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 67,
          y: 62,
          role: 'CM',
        },
        {
          id: 'lw',
          x: 22,
          y: 76,
          role: 'LW',
        },
        {
          id: 'st',
          x: 52,
          y: 80,
          role: 'ST',
        },
        {
          id: 'rw',
          x: 82,
          y: 76,
          role: 'RW',
        },
      ],
      opponents: [
        {
          id: 'o-cm1',
          x: 45,
          y: 70,
          role: 'CM',
        },
        {
          id: 'o-cb',
          x: 28,
          y: 64,
          role: 'CB',
        },
        {
          id: 'o-cm2',
          x: 60,
          y: 58,
          role: 'CM',
        },
      ],
      arrows: [
        {
          from: {
            x: 52,
            y: 78,
          },
          to: {
            x: 47,
            y: 71,
          },
          kind: 'press',
          subjectId: 'st',
        },
        {
          from: {
            x: 33,
            y: 64,
          },
          to: {
            x: 42,
            y: 68,
          },
          kind: 'press',
          subjectId: 'cm1',
        },
        {
          from: {
            x: 22,
            y: 74,
          },
          to: {
            x: 30,
            y: 67,
          },
          kind: 'press',
          subjectId: 'lw',
        },
        {
          from: {
            x: 50,
            y: 54,
          },
          to: {
            x: 56,
            y: 60,
          },
          kind: 'press',
          subjectId: 'dm',
        },
        {
          from: {
            x: 40,
            y: 35,
          },
          to: {
            x: 40,
            y: 44,
          },
          kind: 'run',
          subjectId: 'cb1',
        },
        {
          from: {
            x: 62,
            y: 35,
          },
          to: {
            x: 62,
            y: 44,
          },
          kind: 'run',
          subjectId: 'cb2',
        },
      ],
      ball: {
        x: 45,
        y: 67,
      },
      steps: [
        {
          caption: '공을 잃은 순간 — 가장 가까운 3명이 공·패스길·리시버를 분담해 즉시 달려든다',
          positions: {
            st: {
              x: 48,
              y: 72,
            },
            cm1: {
              x: 41,
              y: 67,
            },
            lw: {
              x: 28,
              y: 68,
            },
          },
          arrows: [
            {
              from: {
                x: 52,
                y: 80,
              },
              to: {
                x: 48,
                y: 73,
              },
              kind: 'press',
              subjectId: 'st',
            },
            {
              from: {
                x: 33,
                y: 62,
              },
              to: {
                x: 40,
                y: 66,
              },
              kind: 'press',
              subjectId: 'cm1',
            },
            {
              from: {
                x: 22,
                y: 76,
              },
              to: {
                x: 28,
                y: 69,
              },
              kind: 'press',
              subjectId: 'lw',
            },
          ],
          ball: {
            x: 45,
            y: 67,
          },
        },
        {
          caption: '후방 라인도 함께 전진 — 압박과 라인업은 한 몸, 압박 뒤 공간을 없앤다',
          positions: {
            cb1: {
              x: 40,
              y: 42,
            },
            cb2: {
              x: 62,
              y: 42,
            },
            lb: {
              x: 22,
              y: 45,
            },
            rb: {
              x: 80,
              y: 45,
            },
            dm: {
              x: 50,
              y: 58,
            },
          },
          arrows: [
            {
              from: {
                x: 40,
                y: 33,
              },
              to: {
                x: 40,
                y: 41,
              },
              kind: 'run',
              subjectId: 'cb1',
            },
            {
              from: {
                x: 62,
                y: 33,
              },
              to: {
                x: 62,
                y: 41,
              },
              kind: 'run',
              subjectId: 'cb2',
            },
            {
              from: {
                x: 50,
                y: 52,
              },
              to: {
                x: 50,
                y: 57,
              },
              kind: 'run',
              subjectId: 'dm',
            },
          ],
        },
        {
          caption: '5초 안에 되빼앗았다 — 흐트러진 상대 수비를 곧바로 찌른다 (최상급 찬스)',
          positions: {
            st: {
              x: 50,
              y: 76,
            },
            rw: {
              x: 72,
              y: 86,
            },
          },
          arrows: [
            {
              from: {
                x: 82,
                y: 76,
              },
              to: {
                x: 73,
                y: 85,
              },
              kind: 'run',
              subjectId: 'rw',
            },
            {
              from: {
                x: 49,
                y: 74,
              },
              to: {
                x: 68,
                y: 84,
              },
              kind: 'pass',
              subjectId: 'st',
              curve: -0.15,
            },
          ],
          ball: {
            x: 49,
            y: 73,
          },
        },
      ],
    },
  },
  {
    id: 'p-highpress',
    name: '하이 프레스 (전방 압박)',
    nameEn: 'High Press',
    category: 'pressing',
    difficulty: 3,
    summary: '상대 골문 앞에서부터 빌드업을 봉쇄한다. 실수를 강요해 최전방에서 공을 훔치는 압박.',
    description: [
      '하이 프레스는 상대가 골키퍼·센터백부터 빌드업을 시작하는 단계에서부터 압박을 가해, 상대 진영 깊은 곳에서 공을 탈취하거나 부정확한 롱킥을 강요하는 수비 전술이다. 게겐프레싱이 "잃은 직후"의 재압박이라면, 하이 프레스는 상대 골킥·빌드업 상황에서의 조직적 압박이다.',
      '핵심은 숫자 맞추기와 방향 통제다. 상대 빌드업 인원에 아군 압박 인원을 1대1로 맞추되, 골키퍼까지 다 막을 수는 없으므로 "한쪽 측면으로 몰아넣는" 설계를 쓴다. 최전방 공격수가 한쪽 센터백을 등지고 접근해 반대쪽 패스를 차단하면, 공은 자연스럽게 계획된 측면으로 흘러가고 그곳에서 함정을 닫는다.',
      '과르디올라의 맨시티, 비엘사의 리즈가 대표적이며, 현대 축구에서 상위권 팀의 기본 소양이 됐다. 다만 압박 라인이 높은 만큼 뒷공간이 넓어, 한 번 벗겨지면 수비수와 골키퍼가 넓은 공간을 감당해야 한다.',
    ],
    strengths: [
      '상대 진영에서 탈취 → 즉시 결정적 찬스',
      '상대 빌드업 자체를 포기하게 만들어 주도권 장악',
      '롱킥을 강요해 소유권 회수율 상승',
      '팬과 팀 전체에 에너지를 불어넣는 적극적 축구',
    ],
    weaknesses: [
      '벗겨지는 순간 하이라인 뒷공간이 통째로 노출',
      '체력 소모가 커서 시즌 내내 유지 어려움',
      '빌드업 능력이 뛰어난 골키퍼·센터백에게 헛수고가 될 수 있음',
      '무더위·연전 일정에서 효율 급감',
    ],
    keyPoints: [
      '압박 방향 설계: 중앙 차단, 측면 유도 → 터치라인을 수비수처럼 활용',
      '1선 압박수는 커버 섀도로 패스길을 지우며 접근',
      '상대 골킥 = 압박 대형 세팅 신호',
      '벗겨졌을 때의 리커버리 스프린트 약속 (전원 후퇴 20초)',
    ],
    counters: ['a-longball', 'a-counter', 'bu-lavolpiana'],
    famousTeams: ['맨체스터 시티 (과르디올라)', '리즈 유나이티드 (비엘사)', '리버풀 (클롭)'],
    tags: ['전방압박', '빌드업차단', '측면함정', '주도권'],
    board: {
      players: [
        {
          id: 'st',
          x: 40,
          y: 60,
          role: 'ST',
        },
        {
          id: 'lw',
          x: 18,
          y: 56,
          role: 'LW',
        },
        {
          id: 'rw',
          x: 66,
          y: 62,
          role: 'RW',
        },
        {
          id: 'cm1',
          x: 35,
          y: 44,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 60,
          y: 46,
          role: 'CM',
        },
        {
          id: 'dm',
          x: 48,
          y: 34,
          role: 'DM',
        },
        {
          id: 'lb',
          x: 15,
          y: 30,
          role: 'LB',
        },
        {
          id: 'cb1',
          x: 38,
          y: 24,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 62,
          y: 24,
          role: 'CB',
        },
        {
          id: 'rb',
          x: 85,
          y: 30,
          role: 'RB',
        },
        {
          id: 'gk',
          x: 50,
          y: 8,
          role: 'GK',
        },
      ],
      opponents: [
        {
          id: 'o-gk',
          x: 50,
          y: 90,
          role: 'GK',
        },
        {
          id: 'o-cb1',
          x: 32,
          y: 76,
          role: 'CB',
        },
        {
          id: 'o-cb2',
          x: 66,
          y: 78,
          role: 'CB',
        },
        {
          id: 'o-lb',
          x: 12,
          y: 66,
          role: 'LB',
        },
        {
          id: 'o-dm',
          x: 55,
          y: 62,
          role: 'DM',
        },
      ],
      arrows: [
        {
          from: {
            x: 40,
            y: 62,
          },
          to: {
            x: 35,
            y: 72,
          },
          kind: 'press',
          curve: 0.15,
          subjectId: 'st',
        },
        {
          from: {
            x: 18,
            y: 58,
          },
          to: {
            x: 14,
            y: 64,
          },
          kind: 'press',
          subjectId: 'lw',
        },
        {
          from: {
            x: 66,
            y: 64,
          },
          to: {
            x: 63,
            y: 74,
          },
          kind: 'press',
          subjectId: 'rw',
        },
        {
          from: {
            x: 35,
            y: 46,
          },
          to: {
            x: 30,
            y: 54,
          },
          kind: 'press',
          subjectId: 'cm1',
        },
        {
          from: {
            x: 60,
            y: 48,
          },
          to: {
            x: 56,
            y: 58,
          },
          kind: 'press',
          subjectId: 'cm2',
        },
      ],
      ball: {
        x: 32,
        y: 73,
      },
      steps: [
        {
          caption: '압박 세팅 — ST가 커버 섀도로 앵커를 지우며 호(arc)를 그려 접근',
          positions: {
            st: {
              x: 36,
              y: 68,
            },
          },
          arrows: [
            {
              from: {
                x: 40,
                y: 60,
              },
              to: {
                x: 35,
                y: 68,
              },
              kind: 'press',
              subjectId: 'st',
              curve: 0.2,
            },
          ],
        },
        {
          caption: '측면 함정으로 유도 — 중앙이 막힌 공은 계획된 측면으로 흐른다',
          positions: {
            lw: {
              x: 14,
              y: 62,
            },
            cm1: {
              x: 28,
              y: 54,
            },
          },
          arrows: [
            {
              from: {
                x: 32,
                y: 73,
              },
              to: {
                x: 14,
                y: 68,
              },
              kind: 'pass',
              subjectId: 'o-cb1',
            },
            {
              from: {
                x: 18,
                y: 56,
              },
              to: {
                x: 14,
                y: 61,
              },
              kind: 'press',
              subjectId: 'lw',
            },
          ],
          ball: {
            x: 14,
            y: 67,
          },
        },
        {
          caption: '함정 닫기 — 터치라인을 수비수 삼아 3인 포위, 패스길은 모두 등 뒤로',
          positions: {
            st: {
              x: 24,
              y: 70,
            },
            cm1: {
              x: 20,
              y: 60,
            },
            dm: {
              x: 40,
              y: 48,
            },
            lw: {
              x: 13,
              y: 65,
            },
          },
          arrows: [
            {
              from: {
                x: 36,
                y: 68,
              },
              to: {
                x: 25,
                y: 70,
              },
              kind: 'press',
              subjectId: 'st',
            },
            {
              from: {
                x: 28,
                y: 54,
              },
              to: {
                x: 21,
                y: 60,
              },
              kind: 'press',
              subjectId: 'cm1',
            },
          ],
        },
        {
          caption: '상대 진영 탈취 — 골문까지 최단 거리, 즉시 결정적 찬스',
          positions: {
            rw: {
              x: 60,
              y: 78,
            },
            st: {
              x: 30,
              y: 76,
            },
          },
          arrows: [
            {
              from: {
                x: 66,
                y: 62,
              },
              to: {
                x: 60,
                y: 77,
              },
              kind: 'run',
              subjectId: 'rw',
            },
            {
              from: {
                x: 22,
                y: 70,
              },
              to: {
                x: 55,
                y: 80,
              },
              kind: 'pass',
              subjectId: 'st',
              curve: -0.15,
            },
          ],
          ball: {
            x: 22,
            y: 69,
          },
        },
      ],
    },
  },
  {
    id: 'p-trigger',
    name: '압박 트리거 & 커버 섀도',
    nameEn: 'Pressing Triggers & Cover Shadow',
    category: 'pressing',
    difficulty: 3,
    summary:
      '아무 때나 뛰지 않는다 — 백패스, 나쁜 터치, 등진 수비. 신호가 켜질 때만 함정을 닫는다.',
    description: [
      '조직적 압박의 성패는 "언제 뛰기 시작하느냐"에 달려 있다. 압박 트리거는 팀 전체가 동시에 압박을 발동하는 약속된 신호로, 대표적으로 ① 백패스·횡패스 ② 볼 소유자의 나쁜 퍼스트 터치 ③ 골문을 등지고 받는 순간 ④ 터치라인 근처에서 받는 순간 ⑤ 바운드 볼·느린 패스가 있다.',
      '커버 섀도는 압박하러 갈 때 "내 등 뒤 그림자로 패스길 하나를 지우면서" 접근하는 기술이다. 한 명이 두 명 몫(볼 소유자 압박 + 패스 옵션 차단)을 하게 되므로, 수적으로 불리한 전방 압박이 성립하는 비밀이 여기에 있다.',
      '트리거가 켜지면 전원이 함께 뛰고, 꺼져 있으면 아무도 뛰지 않는다 — 이 규율이 핵심이다. 한 명만 개인 판단으로 튀어나가면 그 뒤 공간이 그대로 통로가 된다. 훈련에서는 트리거 상황을 반복 재현해 팀 전체의 반응을 자동화한다.',
    ],
    strengths: [
      '체력을 아끼면서 압박 성공률은 극대화',
      '커버 섀도로 수적 열세 압박이 성립',
      '팀 전체가 같은 그림을 보게 되어 조직력 상승',
      '어떤 수비 블록(하이/미드/로우)과도 결합 가능',
    ],
    weaknesses: [
      '트리거 인지·판단을 전원이 공유하기까지 훈련량이 큼',
      '규율이 무너진 한 명이 전체 구조를 붕괴시킴',
      '기술이 매우 좋은 상대는 트리거 상황 자체를 안 만들어 줌',
    ],
    keyPoints: [
      '팀 공통 트리거 5가지를 명문화하고 반복 훈련',
      '압박 접근은 직선이 아닌 호(arc) — 패스길을 등으로 지우며',
      '트리거 오프 상태에서는 대형 유지가 최우선',
      '첫 압박수가 방향을 정하면 2·3선이 그 방향의 옵션을 선점',
    ],
    counters: ['a-longball'],
    famousTeams: ['리버풀 (클롭)', '맨체스터 시티', 'RB 라이프치히 (나겔스만)'],
    tags: ['트리거', '커버섀도', '조직압박', '규율'],
    board: {
      players: [
        {
          id: 'st',
          x: 45,
          y: 66,
          role: 'ST',
        },
        {
          id: 'lw',
          x: 20,
          y: 60,
          role: 'LW',
        },
        {
          id: 'rw',
          x: 72,
          y: 58,
          role: 'RW',
        },
        {
          id: 'cm1',
          x: 38,
          y: 48,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 62,
          y: 46,
          role: 'CM',
        },
        {
          id: 'dm',
          x: 50,
          y: 34,
          role: 'DM',
        },
        {
          id: 'cb1',
          x: 38,
          y: 22,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 62,
          y: 22,
          role: 'CB',
        },
      ],
      opponents: [
        {
          id: 'o-lb',
          x: 14,
          y: 70,
          role: 'LB',
        },
        {
          id: 'o-cb1',
          x: 35,
          y: 78,
          role: 'CB',
        },
        {
          id: 'o-cb2',
          x: 62,
          y: 76,
          role: 'CB',
        },
        {
          id: 'o-dm',
          x: 40,
          y: 60,
          role: 'DM',
        },
      ],
      arrows: [
        {
          from: {
            x: 62,
            y: 74,
          },
          to: {
            x: 37,
            y: 76,
          },
          kind: 'pass',
          subjectId: 'o-cb2',
        },
        {
          from: {
            x: 37,
            y: 76,
          },
          to: {
            x: 16,
            y: 69,
          },
          kind: 'pass',
          subjectId: 'o-cb1',
        },
        {
          from: {
            x: 20,
            y: 62,
          },
          to: {
            x: 15,
            y: 66,
          },
          kind: 'press',
          curve: 0.2,
          subjectId: 'lw',
        },
        {
          from: {
            x: 45,
            y: 68,
          },
          to: {
            x: 33,
            y: 74,
          },
          kind: 'press',
          curve: 0.15,
          subjectId: 'st',
        },
        {
          from: {
            x: 38,
            y: 50,
          },
          to: {
            x: 37,
            y: 58,
          },
          kind: 'press',
          subjectId: 'cm1',
        },
      ],
      ball: {
        x: 14,
        y: 67,
      },
    },
  },
];
