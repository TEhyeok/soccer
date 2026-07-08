// 공격 전술 전술 데이터 (스키마 v2 — 선수 id 포함, ADR-001)
// 표기 규칙: docs/CONTENT_GUIDE.md — 데이터 일괄 변경은 scripts/ 코드젠으로만
import type { Tactic } from '../types';

export const ATTACK_TACTICS: Tactic[] = [
  {
    id: 'a-tikitaka',
    name: '티키타카 (점유 축구)',
    nameEn: 'Tiki-Taka / Positional Play',
    category: 'attack',
    difficulty: 3,
    summary: '짧은 패스와 삼각형 대형으로 공을 소유하며 상대를 움직여 균열을 만드는 점유 축구.',
    description: [
      '티키타카는 짧고 빠른 패스를 쉼 없이 연결해 공 소유권을 독점하고, 상대 수비가 공을 쫓아 움직이다 생기는 균열을 파고드는 공격 철학이다. 과르디올라의 바르셀로나(2008-12)와 스페인 대표팀이 이 축구로 세계를 지배했다.',
      '핵심 원리는 "공 주변에 항상 삼각형을 만든다"이다. 공을 가진 선수에게 최소 두 개의 패스 각이 항상 열려 있도록 주변 선수들이 위치를 잡고, 골키퍼까지 빌드업에 참여시켜 어느 지점에서든 수적 우위를 만든다. 패스 자체가 목적이 아니라, 패스로 상대 블록을 좌우로 흔들어 라인 사이 공간을 여는 것이 목적이다.',
      '요구 조건이 매우 높다. 전 포지션이 좁은 공간에서 볼을 다룰 수 있어야 하고, 공을 잃는 순간 즉시 되찾는 카운터프레스가 세트로 장착되어야 한다. 점유만 하고 전진하지 못하는 "불임 점유"에 빠지지 않으려면 라인 사이로 찔러주는 용기 있는 전진 패스가 필수다.',
    ],
    strengths: [
      '공을 소유하는 동안 상대는 공격 기회 자체가 없음',
      '상대 블록을 움직여 구조적으로 공간을 창출',
      '경기 템포를 스스로 통제 — 리드 상황 관리에 유리',
      '짧은 패스 거리라 공 잃은 직후 즉시 압박 전환이 쉬움',
    ],
    weaknesses: [
      '전 선수단의 기술 수준과 전술 이해도가 필요 — 장착에 수년',
      '내려선 밀집 수비(로우 블록) 상대로 침투 각이 잘 안 나옴',
      '높은 수비 라인 탓에 한 번의 패스 미스가 곧 실점 위기',
      '전진 없는 점유는 무득점 무승부로 끝나기 쉬움',
    ],
    keyPoints: [
      '공 주변 삼각형: 볼 소유자에게 항상 2개 이상의 패스 각 제공',
      '15번의 패스보다 라인을 부수는 1번의 전진 패스가 목적',
      '한쪽에 상대를 모은 뒤 반대편으로 스위칭해 1대1 상황 창출',
      '공 잃은 순간 5초 룰 — 가까운 3명이 즉시 재압박',
    ],
    counters: ['d-lowblock', 'a-counter'],
    famousTeams: ['바르셀로나 08-12 (과르디올라)', '스페인 대표팀 08-12', '맨체스터 시티'],
    tags: ['점유', '패스', '빌드업', '포지셔널플레이'],
    board: {
      players: [
        {
          id: 'gk',
          x: 50,
          y: 8,
          role: 'GK',
        },
        {
          id: 'cb1',
          x: 30,
          y: 20,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 70,
          y: 20,
          role: 'CB',
        },
        {
          id: 'lb',
          x: 12,
          y: 38,
          role: 'LB',
        },
        {
          id: 'rb',
          x: 88,
          y: 38,
          role: 'RB',
        },
        {
          id: 'dm',
          x: 50,
          y: 32,
          role: 'DM',
        },
        {
          id: 'cm1',
          x: 35,
          y: 48,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 65,
          y: 48,
          role: 'CM',
        },
        {
          id: 'lw',
          x: 15,
          y: 68,
          role: 'LW',
        },
        {
          id: 'st',
          x: 50,
          y: 72,
          role: 'ST',
        },
        {
          id: 'rw',
          x: 85,
          y: 68,
          role: 'RW',
        },
      ],
      arrows: [
        {
          from: {
            x: 50,
            y: 10,
          },
          to: {
            x: 32,
            y: 18,
          },
          kind: 'pass',
          subjectId: 'gk',
        },
        {
          from: {
            x: 30,
            y: 22,
          },
          to: {
            x: 47,
            y: 30,
          },
          kind: 'pass',
          subjectId: 'cb1',
        },
        {
          from: {
            x: 50,
            y: 34,
          },
          to: {
            x: 36,
            y: 45,
          },
          kind: 'pass',
          subjectId: 'dm',
        },
        {
          from: {
            x: 35,
            y: 50,
          },
          to: {
            x: 16,
            y: 65,
          },
          kind: 'pass',
          subjectId: 'cm1',
        },
        {
          from: {
            x: 35,
            y: 50,
          },
          to: {
            x: 62,
            y: 50,
          },
          kind: 'pass',
          curve: -0.15,
          subjectId: 'cm1',
        },
        {
          from: {
            x: 65,
            y: 50,
          },
          to: {
            x: 83,
            y: 66,
          },
          kind: 'pass',
          subjectId: 'cm2',
        },
      ],
      ball: {
        x: 30,
        y: 24,
      },
      steps: [
        {
          caption: '후방 삼각형 — 골키퍼까지 참여해 상대 1선 압박을 유인한다',
          positions: {
            dm: {
              x: 47,
              y: 34,
            },
          },
          arrows: [
            {
              from: {
                x: 30,
                y: 24,
              },
              to: {
                x: 45,
                y: 32,
              },
              kind: 'pass',
              subjectId: 'cb1',
            },
            {
              from: {
                x: 30,
                y: 22,
              },
              to: {
                x: 14,
                y: 36,
              },
              kind: 'pass',
              subjectId: 'cb1',
            },
          ],
          ball: {
            x: 47,
            y: 33,
          },
        },
        {
          caption: '왼쪽 과부하 — 짧은 패스로 상대 블록을 한쪽으로 모은다',
          positions: {
            lb: {
              x: 12,
              y: 48,
            },
            lw: {
              x: 18,
              y: 60,
            },
            cm1: {
              x: 28,
              y: 52,
            },
          },
          arrows: [
            {
              from: {
                x: 47,
                y: 34,
              },
              to: {
                x: 29,
                y: 51,
              },
              kind: 'pass',
              subjectId: 'dm',
            },
            {
              from: {
                x: 28,
                y: 52,
              },
              to: {
                x: 13,
                y: 47,
              },
              kind: 'pass',
              subjectId: 'cm1',
            },
          ],
          ball: {
            x: 14,
            y: 47,
          },
        },
        {
          caption: '스위칭 — 상대가 쏠린 순간 반대편으로 크게 전환, 오른쪽 1대1 상황',
          positions: {
            rw: {
              x: 86,
              y: 72,
            },
            rb: {
              x: 88,
              y: 55,
            },
          },
          arrows: [
            {
              from: {
                x: 14,
                y: 48,
              },
              to: {
                x: 84,
                y: 70,
              },
              kind: 'pass',
              subjectId: 'lb',
              curve: -0.2,
            },
            {
              from: {
                x: 88,
                y: 38,
              },
              to: {
                x: 88,
                y: 54,
              },
              kind: 'run',
              subjectId: 'rb',
            },
          ],
          ball: {
            x: 85,
            y: 70,
          },
        },
        {
          caption: '라인 사이를 부수는 마지막 패스 — 컷백으로 마무리',
          positions: {
            st: {
              x: 56,
              y: 84,
            },
            cm2: {
              x: 62,
              y: 62,
            },
            rw: {
              x: 90,
              y: 88,
            },
          },
          arrows: [
            {
              from: {
                x: 86,
                y: 74,
              },
              to: {
                x: 89,
                y: 86,
              },
              kind: 'run',
              subjectId: 'rw',
            },
            {
              from: {
                x: 90,
                y: 89,
              },
              to: {
                x: 60,
                y: 86,
              },
              kind: 'pass',
              subjectId: 'rw',
              curve: -0.2,
            },
            {
              from: {
                x: 50,
                y: 72,
              },
              to: {
                x: 56,
                y: 83,
              },
              kind: 'run',
              subjectId: 'st',
            },
          ],
          ball: {
            x: 89,
            y: 87,
          },
        },
      ],
    },
  },
  {
    id: 'a-counter',
    name: '역습 (카운터 어택)',
    nameEn: 'Counter Attack',
    category: 'attack',
    difficulty: 2,
    summary: '내려서서 상대를 유인한 뒤, 공을 빼앗는 순간 3~4번의 패스로 골문까지 직행한다.',
    description: [
      '역습은 의도적으로 낮은 블록을 형성해 상대를 전진하게 유인한 뒤, 공을 탈취하는 순간 상대 수비 뒤에 열린 광활한 공간으로 최소한의 패스만으로 침투하는 공격 방식이다. 점유율은 낮아도 만들어내는 찬스의 질은 오히려 높다.',
      '성립 조건은 세 가지다. 첫째, 공을 빼앗는 순간 즉시 전방을 보는 첫 패스(아웃렛 패스). 둘째, 상대 수비보다 빠른 스프린터의 뒷공간 침투. 셋째, 공격 종료까지 10초 이내의 템포. 레스터 시티 15-16의 캉테(탈취)-마레즈(운반)-바디(침투) 삼각편대가 교과서다.',
      '역습팀의 숙제는 "상대가 안 올라올 때"다. 상대가 전진을 자제하고 공을 돌리기만 하면 역습의 전제 자체가 사라지므로, 플랜 B(세트피스, 측면 크로스 등)를 반드시 함께 준비해야 한다.',
    ],
    strengths: [
      '상대가 전진한 뒤의 넓은 공간을 공략 — 찬스 퀄리티가 높음',
      '점유·빌드업 능력이 부족한 팀도 구사 가능',
      '체력 소모가 점유 축구 대비 적음',
      '강팀 상대일수록 오히려 잘 작동',
    ],
    weaknesses: [
      '상대가 올라오지 않으면 공격 루트 자체가 소멸',
      '전방 스프린터에 대한 의존도가 절대적',
      '장시간 수비로 집중력 저하 시 한 번에 붕괴',
      '리드를 먼저 내주면 전술 전제가 무너짐',
    ],
    keyPoints: [
      '탈취 후 첫 패스는 무조건 전방 — 백패스는 역습의 사망 선고',
      '공 운반자 1명 + 침투 주자 2명의 3인 유닛 약속',
      '상대 풀백 뒷공간(하프 스페이스)이 1차 침투 목표',
      '10초 안에 슈팅까지 — 늦으면 지공으로 전환 판단',
    ],
    counters: ['f532', 'd-midblock'],
    famousTeams: ['레스터 시티 15-16', '레알 마드리드 (무리뉴)', '프랑스 대표팀 2018'],
    tags: ['역습', '속도', '뒷공간', '실리'],
    board: {
      players: [
        {
          id: 'gk',
          x: 50,
          y: 6,
          role: 'GK',
        },
        {
          id: 'lb',
          x: 15,
          y: 18,
          role: 'LB',
        },
        {
          id: 'cb1',
          x: 37,
          y: 15,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 63,
          y: 15,
          role: 'CB',
        },
        {
          id: 'rb',
          x: 85,
          y: 18,
          role: 'RB',
        },
        {
          id: 'lm',
          x: 14,
          y: 34,
          role: 'LM',
        },
        {
          id: 'cm1',
          x: 38,
          y: 30,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 62,
          y: 30,
          role: 'CM',
        },
        {
          id: 'rm',
          x: 86,
          y: 34,
          role: 'RM',
        },
        {
          id: 'st1',
          x: 40,
          y: 52,
          role: 'ST',
        },
        {
          id: 'st2',
          x: 60,
          y: 52,
          role: 'ST',
        },
      ],
      opponents: [
        {
          id: 'o-cm1',
          x: 30,
          y: 42,
          role: 'CM',
        },
        {
          id: 'o-cm2',
          x: 65,
          y: 45,
          role: 'CM',
        },
        {
          id: 'o-cb1',
          x: 40,
          y: 68,
          role: 'CB',
        },
        {
          id: 'o-cb2',
          x: 66,
          y: 70,
          role: 'CB',
        },
      ],
      arrows: [
        {
          from: {
            x: 38,
            y: 32,
          },
          to: {
            x: 42,
            y: 50,
          },
          kind: 'pass',
          subjectId: 'cm1',
        },
        {
          from: {
            x: 40,
            y: 54,
          },
          to: {
            x: 28,
            y: 84,
          },
          kind: 'run',
          curve: 0.15,
          subjectId: 'st1',
        },
        {
          from: {
            x: 60,
            y: 54,
          },
          to: {
            x: 74,
            y: 84,
          },
          kind: 'run',
          curve: -0.15,
          subjectId: 'st2',
        },
        {
          from: {
            x: 42,
            y: 52,
          },
          to: {
            x: 70,
            y: 80,
          },
          kind: 'pass',
          curve: -0.2,
          subjectId: 'st1',
        },
        {
          from: {
            x: 86,
            y: 36,
          },
          to: {
            x: 84,
            y: 62,
          },
          kind: 'run',
          subjectId: 'rm',
        },
      ],
      ball: {
        x: 38,
        y: 33,
      },
      steps: [
        {
          caption: '탈취 — 첫 패스는 무조건 전방, 아웃렛 스트라이커에게',
          positions: {
            st1: {
              x: 42,
              y: 54,
            },
          },
          arrows: [
            {
              from: {
                x: 38,
                y: 33,
              },
              to: {
                x: 42,
                y: 52,
              },
              kind: 'pass',
              subjectId: 'cm1',
            },
          ],
          ball: {
            x: 42,
            y: 52,
          },
        },
        {
          caption: '3인 유닛 발진 — 운반 1명 + 침투 2명, 상대 센터백은 후퇴 중',
          positions: {
            st1: {
              x: 48,
              y: 64,
            },
            st2: {
              x: 72,
              y: 78,
            },
            rm: {
              x: 82,
              y: 60,
            },
            'o-cb1': {
              x: 44,
              y: 62,
            },
            'o-cb2': {
              x: 68,
              y: 64,
            },
          },
          arrows: [
            {
              from: {
                x: 42,
                y: 54,
              },
              to: {
                x: 48,
                y: 63,
              },
              kind: 'run',
              subjectId: 'st1',
            },
            {
              from: {
                x: 60,
                y: 52,
              },
              to: {
                x: 72,
                y: 77,
              },
              kind: 'run',
              subjectId: 'st2',
              curve: -0.15,
            },
            {
              from: {
                x: 86,
                y: 34,
              },
              to: {
                x: 82,
                y: 58,
              },
              kind: 'run',
              subjectId: 'rm',
            },
          ],
          ball: {
            x: 48,
            y: 62,
          },
        },
        {
          caption: '10초 안에 슈팅까지 — 뒷공간 스루패스, 골키퍼와 1대1',
          positions: {
            st2: {
              x: 74,
              y: 86,
            },
          },
          arrows: [
            {
              from: {
                x: 48,
                y: 64,
              },
              to: {
                x: 72,
                y: 84,
              },
              kind: 'pass',
              subjectId: 'st1',
              curve: -0.1,
            },
            {
              from: {
                x: 74,
                y: 87,
              },
              to: {
                x: 55,
                y: 96,
              },
              kind: 'pass',
              subjectId: 'st2',
            },
          ],
          ball: {
            x: 73,
            y: 85,
          },
        },
      ],
    },
  },
  {
    id: 'a-wing',
    name: '측면 공격 & 크로스',
    nameEn: 'Wing Play & Crossing',
    category: 'attack',
    difficulty: 1,
    summary: '측면에서 수적 우위를 만들어 크로스로 마무리. 밀집 수비를 옆에서 여는 고전적 해법.',
    description: [
      '측면 공격은 상대 수비가 가장 두꺼운 중앙 대신, 상대적으로 열려 있는 터치라인 쪽에서 우위를 만들어 크로스나 컷백으로 마무리하는 공격 방식이다. 중앙이 잠긴 밀집 수비를 상대할 때 가장 검증된 해법이다.',
      '측면 우위를 만드는 방법은 두 가지다. 윙어의 1대1 돌파, 그리고 풀백 오버래핑을 통한 2대1 과부하. 크로스는 골키퍼와 수비 라인 사이(니어), 페널티 스팟 부근(중앙), 파포스트 세 지점을 노리며, 최근에는 골라인 근처까지 파고든 뒤 뒤로 돌려주는 컷백의 기대득점이 가장 높다고 평가된다.',
      '박스 안에 크로스를 받을 선수가 부족하면 아무리 좋은 크로스도 무의미하다. 크로스 타이밍에 니어/파/중앙(페널티 스팟) 세 지점 침투를 약속해두는 것이 핵심이며, 크로스가 걷어내진 뒤의 세컨드볼 회수 위치까지 설계해야 한다.',
    ],
    strengths: [
      '밀집 수비 중앙을 피해 열린 측면을 공략',
      '장신 공격수 보유 시 기대 효율 극대화',
      '컷백은 축구에서 기대득점이 가장 높은 패턴 중 하나',
      '전술 이해가 직관적이라 아마추어 팀도 즉시 적용 가능',
    ],
    weaknesses: [
      '크로스 성공률 자체는 낮음 — 양으로 승부해야 함',
      '5백 등 박스 안 수비 숫자가 많은 상대에게 효율 급감',
      '풀백 전진 후 뒷공간이 역습에 노출',
      '타깃형 공격수가 없으면 위력 반감',
    ],
    keyPoints: [
      '박스 침투 3지점 약속: 니어포스트 / 페널티 스팟 / 파포스트',
      '골라인까지 파고든 뒤 컷백이 1순위 옵션',
      '크로스 순간 반대편 윙어는 파포스트로 반드시 침투',
      '박스 바깥 세컨드볼 회수 담당(미드필더 1명) 지정',
    ],
    counters: ['f532', 'd-lowblock'],
    famousTeams: [
      '맨체스터 유나이티드 (퍼거슨, 긱스-베컴)',
      '리버풀 (아놀드-로버트슨)',
      '토트넘 (손흥민-페리시치)',
    ],
    tags: ['크로스', '컷백', '오버래핑', '측면'],
    board: {
      players: [
        {
          id: 'gk',
          x: 50,
          y: 8,
          role: 'GK',
        },
        {
          id: 'cb1',
          x: 37,
          y: 22,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 63,
          y: 22,
          role: 'CB',
        },
        {
          id: 'lb',
          x: 20,
          y: 40,
          role: 'LB',
        },
        {
          id: 'dm',
          x: 50,
          y: 40,
          role: 'DM',
        },
        {
          id: 'cm1',
          x: 35,
          y: 56,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 65,
          y: 56,
          role: 'CM',
        },
        {
          id: 'rb',
          x: 88,
          y: 66,
          role: 'RB',
        },
        {
          id: 'rw',
          x: 82,
          y: 82,
          role: 'RW',
        },
        {
          id: 'st',
          x: 48,
          y: 82,
          role: 'ST',
        },
        {
          id: 'lw',
          x: 20,
          y: 76,
          role: 'LW',
        },
      ],
      opponents: [
        {
          id: 'o-cb1',
          x: 40,
          y: 88,
          role: 'CB',
        },
        {
          id: 'o-cb2',
          x: 58,
          y: 88,
          role: 'CB',
        },
        {
          id: 'o-lb',
          x: 74,
          y: 86,
          role: 'LB',
        },
      ],
      arrows: [
        {
          from: {
            x: 88,
            y: 68,
          },
          to: {
            x: 92,
            y: 82,
          },
          kind: 'run',
          subjectId: 'rb',
        },
        {
          from: {
            x: 82,
            y: 85,
          },
          to: {
            x: 90,
            y: 93,
          },
          kind: 'run',
          curve: -0.2,
          subjectId: 'rw',
        },
        {
          from: {
            x: 90,
            y: 94,
          },
          to: {
            x: 52,
            y: 90,
          },
          kind: 'pass',
          curve: -0.25,
        },
        {
          from: {
            x: 48,
            y: 84,
          },
          to: {
            x: 45,
            y: 92,
          },
          kind: 'run',
          subjectId: 'st',
        },
        {
          from: {
            x: 20,
            y: 78,
          },
          to: {
            x: 34,
            y: 90,
          },
          kind: 'run',
          curve: 0.2,
          subjectId: 'lw',
        },
        {
          from: {
            x: 65,
            y: 58,
          },
          to: {
            x: 62,
            y: 74,
          },
          kind: 'run',
          subjectId: 'cm2',
        },
      ],
      ball: {
        x: 82,
        y: 85,
      },
    },
  },
  {
    id: 'a-longball',
    name: '롱볼 & 다이렉트 축구',
    nameEn: 'Long Ball / Direct Play',
    category: 'attack',
    difficulty: 1,
    summary:
      '중원 생략, 타깃맨을 향한 긴 패스와 세컨드볼 사냥. 가장 원초적이고 여전히 유효한 무기.',
    description: [
      '롱볼 축구는 후방에서 짧게 빌드업하는 대신 전방 타깃맨을 향해 긴 패스를 곧바로 보내고, 타깃맨의 포스트 플레이(헤더 낙하, 가슴 트래핑)와 주변의 세컨드볼 회수로 공격을 전개하는 방식이다.',
      '상대의 전방 압박을 원천 무효화한다는 점이 최대 장점이다. 압박이 강한 상대일수록 후방 빌드업의 리스크가 커지는데, 롱볼은 그 위험 구간을 아예 건너뛴다. 또한 상대 수비를 자기 골문 쪽으로 계속 돌아서게 만들어 심리적으로도 피로를 누적시킨다.',
      '단순해 보이지만 설계가 필요하다. 타깃맨이 경합하는 지점 주변 10m 안에 세컨드볼 사냥꾼 2~3명이 미리 자리 잡아야 하며, 낙하 지점은 상대 센터백 중 약한 쪽 또는 풀백 뒤 채널을 지정해서 노린다. 다이치의 번리는 이 원칙만으로 프리미어리그에서 수년간 생존했다.',
    ],
    strengths: [
      '상대 전방 압박을 원천 무효화',
      '빌드업 실수로 인한 실점 위험 제거',
      '적은 훈련으로도 즉시 가동 가능',
      '타깃맨 경합 → 파울 유도 → 세트피스 획득의 부가 루트',
    ],
    weaknesses: [
      '점유율을 포기 — 경기 주도권을 상대에게 헌납',
      '타깃맨의 경합 승률에 절대적으로 의존',
      '공중볼에 강한 센터백을 만나면 공격이 통째로 막힘',
      '세컨드볼을 회수하지 못하면 단순 소유권 상납',
    ],
    keyPoints: [
      '낙하 지점 지정: 상대 약한 센터백 쪽 또는 풀백 뒤 채널',
      '타깃맨 반경 10m에 세컨드볼 헌터 2~3명 선배치',
      '무작정 걷어차기 금지 — 킥의 목적지가 항상 있어야 함',
      '획득한 스로인·프리킥·코너킥을 득점 루트로 연결(세트피스 세트)',
    ],
    counters: ['f352', 'd-midblock'],
    famousTeams: ['번리 (다이치)', '스토크 시티 (풀리스)', '아일랜드 대표팀'],
    tags: ['롱볼', '타깃맨', '세컨드볼', '다이렉트'],
    board: {
      players: [
        {
          id: 'gk',
          x: 50,
          y: 6,
          role: 'GK',
        },
        {
          id: 'lb',
          x: 15,
          y: 20,
          role: 'LB',
        },
        {
          id: 'cb1',
          x: 37,
          y: 16,
          role: 'CB',
        },
        {
          id: 'cb2',
          x: 63,
          y: 16,
          role: 'CB',
        },
        {
          id: 'rb',
          x: 85,
          y: 20,
          role: 'RB',
        },
        {
          id: 'lm',
          x: 14,
          y: 44,
          role: 'LM',
        },
        {
          id: 'cm1',
          x: 38,
          y: 40,
          role: 'CM',
        },
        {
          id: 'cm2',
          x: 62,
          y: 40,
          role: 'CM',
        },
        {
          id: 'rm',
          x: 86,
          y: 44,
          role: 'RM',
        },
        {
          id: 'st1',
          x: 55,
          y: 68,
          role: 'ST',
        },
        {
          id: 'st2',
          x: 40,
          y: 62,
          role: 'ST',
        },
      ],
      opponents: [
        {
          id: 'o-cb1',
          x: 45,
          y: 74,
          role: 'CB',
        },
        {
          id: 'o-cb2',
          x: 66,
          y: 74,
          role: 'CB',
        },
      ],
      arrows: [
        {
          from: {
            x: 50,
            y: 10,
          },
          to: {
            x: 55,
            y: 65,
          },
          kind: 'pass',
          curve: -0.12,
          subjectId: 'gk',
        },
        {
          from: {
            x: 40,
            y: 64,
          },
          to: {
            x: 48,
            y: 76,
          },
          kind: 'run',
          curve: 0.15,
          subjectId: 'st2',
        },
        {
          from: {
            x: 38,
            y: 42,
          },
          to: {
            x: 46,
            y: 58,
          },
          kind: 'run',
          subjectId: 'cm1',
        },
        {
          from: {
            x: 62,
            y: 42,
          },
          to: {
            x: 62,
            y: 58,
          },
          kind: 'run',
          subjectId: 'cm2',
        },
        {
          from: {
            x: 86,
            y: 46,
          },
          to: {
            x: 80,
            y: 62,
          },
          kind: 'run',
          subjectId: 'rm',
        },
      ],
      ball: {
        x: 50,
        y: 9,
      },
    },
  },
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
        {
          id: 'gk',
          role: 'GK',
          x: 50,
          y: 6,
        },
        {
          id: 'lb',
          role: 'LB',
          x: 15,
          y: 30,
        },
        {
          id: 'cb1',
          role: 'CB',
          x: 37,
          y: 20,
        },
        {
          id: 'cb2',
          role: 'CB',
          x: 63,
          y: 20,
        },
        {
          id: 'rb',
          role: 'RB',
          x: 85,
          y: 30,
        },
        {
          id: 'dm',
          role: 'DM',
          x: 50,
          y: 38,
        },
        {
          id: 'cm1',
          role: 'CM',
          x: 35,
          y: 52,
        },
        {
          id: 'cm2',
          role: 'CM',
          x: 65,
          y: 52,
        },
        {
          id: 'lw',
          role: 'LW',
          x: 18,
          y: 78,
        },
        {
          id: 'st',
          role: 'ST',
          x: 50,
          y: 62,
        },
        {
          id: 'rw',
          role: 'RW',
          x: 82,
          y: 78,
        },
      ],
      opponents: [
        {
          id: 'o-cb1',
          role: 'CB',
          x: 42,
          y: 82,
        },
        {
          id: 'o-cb2',
          role: 'CB',
          x: 58,
          y: 82,
        },
        {
          id: 'o-dm',
          role: 'DM',
          x: 50,
          y: 55,
        },
      ],
      ball: {
        x: 50,
        y: 64,
      },
      arrows: [
        {
          from: {
            x: 50,
            y: 74,
          },
          to: {
            x: 50,
            y: 64,
          },
          kind: 'run',
          subjectId: 'st',
        },
        {
          from: {
            x: 42,
            y: 82,
          },
          to: {
            x: 46,
            y: 72,
          },
          kind: 'run',
          subjectId: 'o-cb1',
        },
        {
          from: {
            x: 18,
            y: 78,
          },
          to: {
            x: 36,
            y: 88,
          },
          kind: 'run',
          subjectId: 'lw',
          curve: 0.2,
        },
        {
          from: {
            x: 82,
            y: 78,
          },
          to: {
            x: 64,
            y: 88,
          },
          kind: 'run',
          subjectId: 'rw',
          curve: -0.2,
        },
        {
          from: {
            x: 50,
            y: 63,
          },
          to: {
            x: 38,
            y: 86,
          },
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
        {
          id: 'gk',
          role: 'GK',
          x: 50,
          y: 6,
        },
        {
          id: 'lb',
          role: 'LB',
          x: 20,
          y: 30,
        },
        {
          id: 'cb1',
          role: 'CB',
          x: 37,
          y: 16,
        },
        {
          id: 'cb2',
          role: 'CB',
          x: 63,
          y: 16,
        },
        {
          id: 'rb',
          role: 'RB',
          x: 88,
          y: 45,
        },
        {
          id: 'dm',
          role: 'DM',
          x: 50,
          y: 36,
        },
        {
          id: 'cm1',
          role: 'CM',
          x: 58,
          y: 50,
        },
        {
          id: 'cm2',
          role: 'CM',
          x: 70,
          y: 54,
        },
        {
          id: 'rw',
          role: 'RW',
          x: 84,
          y: 64,
        },
        {
          id: 'st',
          role: 'ST',
          x: 60,
          y: 74,
        },
        {
          id: 'lw',
          role: 'LW',
          x: 12,
          y: 74,
        },
      ],
      opponents: [
        {
          id: 'o-cm1',
          role: 'CM',
          x: 62,
          y: 58,
        },
        {
          id: 'o-cm2',
          role: 'CM',
          x: 72,
          y: 60,
        },
        {
          id: 'o-lb',
          role: 'LB',
          x: 80,
          y: 70,
        },
        {
          id: 'o-rb',
          role: 'RB',
          x: 22,
          y: 80,
        },
      ],
      ball: {
        x: 70,
        y: 57,
      },
      arrows: [
        {
          from: {
            x: 70,
            y: 56,
          },
          to: {
            x: 59,
            y: 51,
          },
          kind: 'pass',
          subjectId: 'cm2',
        },
        {
          from: {
            x: 58,
            y: 52,
          },
          to: {
            x: 14,
            y: 72,
          },
          kind: 'pass',
          subjectId: 'cm1',
          curve: 0.25,
        },
        {
          from: {
            x: 12,
            y: 76,
          },
          to: {
            x: 17,
            y: 88,
          },
          kind: 'run',
          subjectId: 'lw',
        },
      ],
    },
  },
];
