// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavorites, useHashRoute } from './hooks';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.location.hash = '';
  localStorage.clear();
});

function setHash(hash: string) {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

describe('useHashRoute (딥링크 라우팅)', () => {
  it("'#/t/f433' → ['t','f433'] 로 파싱한다", () => {
    window.location.hash = '#/t/f433';
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual(['t', 'f433']);
  });

  it("홈('#/', '', '#')은 빈 배열", () => {
    for (const h of ['#/', '#']) {
      window.location.hash = h;
      const { result } = renderHook(() => useHashRoute());
      expect(result.current).toEqual([]);
    }
  });

  it('hashchange 이벤트에 반응한다', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toEqual([]);
    act(() => setHash('#/t/p-gegen'));
    expect(result.current).toEqual(['t', 'p-gegen']);
  });
});

describe('useFavorites (localStorage 즐겨찾기)', () => {
  it('토글하면 추가되고 다시 토글하면 제거된다', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle('f433'));
    expect(result.current.favorites.has('f433')).toBe(true);
    act(() => result.current.toggle('f433'));
    expect(result.current.favorites.has('f433')).toBe(false);
  });

  it('localStorage에 저장되어 재마운트 후 복원된다 (PRD 스토리 5)', () => {
    const first = renderHook(() => useFavorites());
    act(() => first.result.current.toggle('p-gegen'));
    first.unmount();

    const second = renderHook(() => useFavorites());
    expect(second.result.current.favorites.has('p-gegen')).toBe(true);
  });

  it('손상된 저장 데이터는 빈 즐겨찾기로 폴백한다', () => {
    localStorage.setItem('tacticbook:favorites', '{{{not-json');
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.size).toBe(0);
  });
});
