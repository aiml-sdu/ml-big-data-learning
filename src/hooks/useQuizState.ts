import { useState, useCallback } from 'react';

interface QuestionState {
  selected: number | null;
  submitted: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function loadState(questions: QuizQuestion[]): QuestionState[] {
  return questions.map((q) => {
    const saved = localStorage.getItem(`quiz-${q.id}`);
    if (saved !== null) {
      return { selected: Number(saved), submitted: true };
    }
    return { selected: null, submitted: false };
  });
}

export function useQuizState(
  questions: QuizQuestion[],
  onResult?: (correct: boolean) => void,
) {
  const [states, setStates] = useState<QuestionState[]>(() => loadState(questions));

  const select = useCallback((qi: number, oi: number) => {
    setStates((prev) => {
      const next = [...prev];
      if (!next[qi].submitted) {
        next[qi] = { ...next[qi], selected: oi };
      }
      return next;
    });
  }, []);

  const submit = useCallback((qi: number) => {
    const state = states[qi];
    if (!state || state.selected === null || state.submitted) return;

    const selected = state.selected;
    localStorage.setItem(`quiz-${questions[qi].id}`, String(selected));
    setStates((prev) => {
      const next = [...prev];
      next[qi] = { ...next[qi], submitted: true };
      return next;
    });
    onResult?.(selected === questions[qi].correctIndex);
  }, [questions, onResult, states]);

  return { states, select, submit };
}
