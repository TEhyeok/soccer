/**
 * 보드 렌더 스냅샷 기준선 (M0 게이트 ③).
 * 20종 전체의 SVG 마크업을 고정한다 — v1.1 애니메이션 리팩터 때
 * "steps 미보유 전술의 렌더가 v1.0과 동일함"을 증명하는 안전망.
 * 의도적 시각 변경 시에만 `vitest -u`로 갱신하고 PR에서 diff를 확인한다.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TACTICS } from '../data';
import PitchBoard from './PitchBoard';

describe('PitchBoard 렌더 스냅샷 기준선', () => {
  for (const tactic of TACTICS) {
    it(`${tactic.id} (${tactic.name}) 풀 보드`, () => {
      const svg = renderToStaticMarkup(<PitchBoard board={tactic.board} title={tactic.name} />);
      expect(svg).toMatchSnapshot();
    });
  }

  it('미니 보드 변형 (카드용)', () => {
    const svg = renderToStaticMarkup(<PitchBoard board={TACTICS[0].board} mini />);
    expect(svg).toMatchSnapshot();
  });
});
