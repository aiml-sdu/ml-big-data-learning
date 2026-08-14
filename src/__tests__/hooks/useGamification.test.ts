import { renderHook, act } from '@testing-library/react';
import { useGamification } from '@/hooks/useGamification';

describe('useGamification', () => {
  test('initial state: xp=0, streak=0, maxStreak=0', () => {
    const { result } = renderHook(() => useGamification());
    expect(result.current.xp).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.maxStreak).toBe(0);
  });

  test('recordCorrect → xp=1, streak=1', () => {
    const { result } = renderHook(() => useGamification());
    act(() => result.current.recordCorrect());
    expect(result.current.xp).toBe(1);
    expect(result.current.streak).toBe(1);
  });

  test('recordWrong → streak=0, xp unchanged', () => {
    const { result } = renderHook(() => useGamification());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordWrong());
    expect(result.current.streak).toBe(0);
    expect(result.current.xp).toBe(1);
  });

  test('maxStreak tracks highest streak', () => {
    const { result } = renderHook(() => useGamification());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordCorrect());
    act(() => result.current.recordWrong());
    act(() => result.current.recordCorrect());
    expect(result.current.maxStreak).toBe(3);
    expect(result.current.streak).toBe(1);
  });
});
