/**
 * GRF 궤적(trajectory.json) → 택틱북 리플레이 JSON.
 * 출력은 앱 '내 전술 > JSON 가져오기'와 호환되는 envelope — 그대로 임포트해 재생 가능.
 * 궤적에 meta(execute_tactic.py 출력)가 있으면 선수 구성·이름을 그대로 사용한다.
 * 사용: node scripts/grf/convert-replay.mjs [샘플간격=8] [출력파일명]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const SAMPLE = Number(process.argv[2] ?? 8); // 스텝 간격 (1스텝 ≈ 0.1초)
const OUT_NAME = process.argv[3] ?? 'replay-custom.json';
const HERE = new URL('.', import.meta.url).pathname;

// 기본값: a-counter 스파이크 시나리오의 AddPlayer 순서 (meta 없는 구버전 궤적용)
const DEFAULT_LEFT = [
  ['gk', 'GK'],
  ['lb', 'LB'],
  ['cb1', 'CB'],
  ['cb2', 'CB'],
  ['rb', 'RB'],
  ['lm', 'LM'],
  ['cm1', 'CM'],
  ['cm2', 'CM'],
  ['rm', 'RM'],
  ['st1', 'ST'],
  ['st2', 'ST'],
];
const DEFAULT_RIGHT = [
  ['o-gk', 'GK'],
  ['o-cb1', 'CB'],
  ['o-cb2', 'CB'],
  ['o-cm1', 'CM'],
  ['o-cm2', 'CM'],
];

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n * 10) / 10));
/** GRF 절대좌표 → 우리 논리좌표 (관측값은 양 팀 모두 절대좌표) */
const toLogical = ([gx, gy]) => ({
  x: clamp(((gy + 0.42) / 0.84) * 100),
  y: clamp(((gx + 1) / 2) * 100),
});

const { frames, meta } = JSON.parse(readFileSync(HERE + 'trajectory.json', 'utf-8'));
const LEFT = meta ? meta.leftIds.map((id, i) => [id, meta.leftRoles[i]]) : DEFAULT_LEFT;
const RIGHT = meta ? meta.rightIds.map((id, i) => [id, meta.rightRoles[i]]) : DEFAULT_RIGHT;
console.log(
  `프레임 ${frames.length}개 로드 (게임시간 ~${(frames.length * 0.1).toFixed(1)}초)${meta ? ` — ${meta.name}` : ''}`
);

const f0 = frames[0];
const players = LEFT.map(([id, role], i) => ({ id, role, ...toLogical(f0.left[i]) }));
const opponents = RIGHT.map(([id, role], i) => ({ id, role, ...toLogical(f0.right[i]) }));

const stepAt = (fr, k, caption) => {
  const positions = {};
  LEFT.forEach(([id], i) => (positions[id] = toLogical(fr.left[i])));
  RIGHT.forEach(([id], i) => (positions[id] = toLogical(fr.right[i])));
  return { caption, positions, ball: toLogical(fr.ball) };
};

const steps = [];
for (let k = SAMPLE; k < frames.length; k += SAMPLE) {
  steps.push(stepAt(frames[k], k, `시뮬레이션 t=${(k * 0.1).toFixed(1)}s — GRF 물리 엔진 궤적`));
}
// 마지막 프레임도 포함 (득점 순간 등)
const lastIdx = frames.length - 1;
if (lastIdx % SAMPLE !== 0) {
  const fr = frames[lastIdx];
  const scored = fr.score[0] > 0;
  steps.push(
    stepAt(
      fr,
      lastIdx,
      scored
        ? `⚽ 골! (스코어 ${fr.score.join(':')})`
        : `시뮬레이션 종료 (스코어 ${fr.score.join(':')})`
    )
  );
}

const name =
  meta?.displayName ?? (meta ? `[전술 실행] ${meta.name}` : '[시뮬레이션] 역습 리플레이');
const envelope = {
  version: 1,
  items: [
    {
      id: meta ? `c-grf-exec-${meta.sourceId ?? 'tactic'}` : 'c-grf-counter',
      name,
      updatedAt: 0, // 임포트 시점 기준으로 표시됨
      board: { players, opponents, ball: toLogical(f0.ball), steps },
      source: meta?.sourceId
        ? { id: meta.sourceId, name: meta.name }
        : { id: 'a-counter', name: '역습 (카운터 어택)' },
    },
  ],
};

const out = HERE + OUT_NAME;
writeFileSync(out, JSON.stringify(envelope, null, 2));
console.log(
  `✓ ${out} — 선수 ${players.length}+${opponents.length}명, ${steps.length}단계 리플레이`
);
