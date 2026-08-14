import { renderHook, act } from '@testing-library/react';
import { useQuizState, type QuizQuestion } from '@/hooks/useQuizState';

const questions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is 1+1?',
    options: ['1', '2', '3'],
    correctIndex: 1,
    explanation: 'Basic math.',
  },
  {
    id: 'q2',
    question: 'What is 2+2?',
    options: ['3', '4', '5'],
    correctIndex: 1,
    explanation: 'Basic math.',
  },
];

describe('useQuizState', () => {
  test('initial state: all questions unselected, not submitted', () => {
    const { result } = renderHook(() => useQuizState(questions));
    expect(result.current.states[0].selected).toBeNull();
    expect(result.current.states[0].submitted).toBe(false);
    expect(result.current.states[1].selected).toBeNull();
  });

  test('select(0, 2) → states[0].selected === 2', () => {
    const { result } = renderHook(() => useQuizState(questions));
    act(() => result.current.select(0, 2));
    expect(result.current.states[0].selected).toBe(2);
  });

  test('submit persists to localStorage and calls onResult', () => {
    const onResult = vi.fn();
    const { result } = renderHook(() => useQuizState(questions, onResult));
    act(() => result.current.select(0, 1));
    act(() => result.current.submit(0));
    expect(localStorage.getItem('quiz-q1')).toBe('1');
    expect(onResult).toHaveBeenCalledWith(true);
  });

  test('cannot select after submit', () => {
    const { result } = renderHook(() => useQuizState(questions));
    act(() => result.current.select(0, 1));
    act(() => result.current.submit(0));
    act(() => result.current.select(0, 2));
    expect(result.current.states[0].selected).toBe(1);
  });
});
