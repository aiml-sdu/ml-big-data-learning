import { renderHook, act } from '@testing-library/react';
import { useLabProgress, getExerciseProgress } from '@/hooks/useLabProgress';

describe('getExerciseProgress', () => {
  test('empty localStorage → completed: 0', () => {
    const progress = getExerciseProgress('ex1', 3);
    expect(progress).toEqual({ completed: 0, total: 3 });
  });

  test('after setting localStorage keys → completed count is correct', () => {
    localStorage.setItem('lab-ex1-step-1', '1');
    localStorage.setItem('lab-ex1-step-3', '1');
    const progress = getExerciseProgress('ex1', 3);
    expect(progress).toEqual({ completed: 2, total: 3 });
  });
});

describe('useLabProgress', () => {
  test('markStepComplete → isStepComplete returns true', () => {
    const { result } = renderHook(() => useLabProgress('ex1', 3));
    expect(result.current.isStepComplete(1)).toBe(false);
    act(() => result.current.markStepComplete(1));
    expect(result.current.isStepComplete(1)).toBe(true);
  });

  test('getProgress reflects completed steps', () => {
    const { result } = renderHook(() => useLabProgress('ex1', 3));
    act(() => result.current.markStepComplete(1));
    act(() => result.current.markStepComplete(2));
    expect(result.current.getProgress()).toEqual({ completed: 2, total: 3 });
  });
});
