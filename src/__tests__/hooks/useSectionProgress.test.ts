import { renderHook, act } from '@testing-library/react';
import { useSectionProgress, getVersion } from '@/hooks/useSectionProgress';

describe('useSectionProgress', () => {
  test('initial state: visitedSections is empty', () => {
    const { result } = renderHook(() => useSectionProgress('topic-01', ['intro', 'main']));
    expect(result.current.visitedSections.size).toBe(0);
  });

  test('markVisited sets localStorage key', () => {
    const { result } = renderHook(() => useSectionProgress('topic-01', ['intro', 'main']));
    act(() => result.current.markVisited('intro'));
    expect(localStorage.getItem('visited-topic-01-intro')).toBe('1');
  });

  test('after markVisited, visitedSections contains the section', () => {
    const { result } = renderHook(() => useSectionProgress('topic-01', ['intro', 'main']));
    act(() => result.current.markVisited('intro'));
    expect(result.current.visitedSections.has('intro')).toBe(true);
  });

  test('markVisited is idempotent', () => {
    const { result } = renderHook(() => useSectionProgress('topic-01', ['intro', 'main']));
    act(() => result.current.markVisited('intro'));
    act(() => result.current.markVisited('intro'));
    expect(result.current.visitedSections.size).toBe(1);
  });

  test('getVersion increments after markVisited', () => {
    const { result } = renderHook(() => useSectionProgress('topic-01', ['intro', 'main']));
    const v1 = getVersion();
    act(() => result.current.markVisited('main'));
    expect(getVersion()).toBeGreaterThan(v1);
  });
});
