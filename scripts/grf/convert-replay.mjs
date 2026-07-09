/**
 * GRF 궤적(trajectory.json) → 택틱북 리플레이 JSON (R&D 스파이크).
 * 출력은 앱 '내 전술 > JSON 가져오기'와 호환되는 envelope — 그대로 임포트해 재생 가능.
 * 사용: node scripts/grf/convert-replay.mjs [샘플간격=8]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SAMPLE = Number(process.argv[2] ?? 8); // 스텝 간격 (1스텝 ≈ 0.1초)
const HERE = new URL('.', import.meta.url).pathname;

// 시나리오 AddPlayer 순서와 1:1 (scenario_tacticbook_counter.py)
const LEFT = [
  ['gk', 'GK'], ['lb', 'LB'], ['cb1', 'CB'], ['cb2', 'CB'], ['rb', 'RB'],
  ['lm', 'LM'], ['cm1', 'CM'], ['cm2', 'CM'], ['rm', 'RM'], ['st1', 'ST'], ['st2', 'ST'],
];
const RIGHT = [
  ['o-gk', 'GK'], ['o-cb1', 'CB'], ['o-cb2', 'CB'], ['o-cm1', 'CM'], ['o-cm2', 'CM'],
];

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n * 10) / 10));
/** GRF 절대좌표 → 우리 논리좌표 (관측값은 양 팀 모두 절대좌표) */
const toLogical = ([gx, gy]) => ({
  x: clamp(((gy + 0.42) / 0.84) * 100),
  y: clamp(((gx + 1) / 2) * 100),
});

const { frames } = JSON.parse(readFileSync(HERE + 'trajectory.json', 'utf-8'));
console.log(`프레임 ${frames.length}개 로드 (게임시간 ~${(frames.length * 0.1).toFixed(1)}초)`);

const f0 = frames[0];
const players = LEFT.map(([id, role], i) => ({ id, role, ...toLogical(f0.left[i]) }));
const opponents = RIGHT.map(([id, role], i) => ({ id, role, ...toLogical(f0.right[i]) }));

const steps = [];
for (let k = SAMPLE; k < frames.length; k += SAMPLE) {
  const fr = frames[k];
  const positions = {};
  LEFT.forEach(([id], i) => (positions[id] = toLogical(fr.left[i])));
  RIGHT.forEach(([id], i) => (positions[id] = toLogical(fr.right[i])));
  steps.push({
    caption: `시뮬레이션 t=${(k * 0.1).toFixed(1)}s — GRF 물리 엔진 궤적`,
    positions,
    ball: toLogical(fr.ball),
  });
}
// 마지막 프레임도 포함 (득점 순간 등)
const lastIdx = frames.length - 1;
if (lastIdx % SAMPLE !== 0) {
  const fr = frames[lastIdx];
  const positions = {};
  LEFT.forEach(([id], i) => (positions[id] = toLogical(fr.left[i])));
  RIGHT.forEach(([id], i) => (positions[id] = toLogical(fr.right[i])));
  steps.push({
    caption: `시뮬레이션 종료 (스코어 ${fr.score.join(':')})`,
    positions,
    ball: toLogical(fr.ball),
  });
}

const envelope = {
  version: 1,
  items: [
    {
      id: 'c-grf-counter',
      name: '[시뮬레이션] 역습 리플레이',
      updatedAt: 0, // 임포트 시점 기준으로 표시됨
      board: { players, opponents, ball: toLogical(f0.ball), steps },
      source: { id: 'a-counter', name: '역습 (카운터 어택)' },
    },
  ],
};

const out = HERE + 'replay-custom.json';
writeFileSync(out, JSON.stringify(envelope, null, 2));
console.log(`✓ ${out} — 선수 ${players.length}+${opponents.length}명, ${steps.length}단계 리플레이`);
