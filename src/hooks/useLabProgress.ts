import { useCallback, useSyncExternalStore } from 'react';

const KEY_PREFIX = 'lab-';

function getStepKey(stepId: string) {
  return KEY_PREFIX + stepId;
}

let listeners: (() => void)[] = [];
function emitChange() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function useLabProgress(exerciseId: string, totalSteps: number) {
  // Force re-render on localStorage changes
  const version = useSyncExternalStore(
    subscribe,
    () => {
      let v = 0;
      for (let i = 1; i <= totalSteps; i++) {
        if (localStorage.getItem(getStepKey(`${exerciseId}-step-${i}`))) v += (1 << i);
      }
      return v;
    },
    () => 0,
  );

  const isStepComplete = useCallback(
    (step: number) => {
      return localStorage.getItem(getStepKey(`${exerciseId}-step-${step}`)) === '1';
    },
    [exerciseId, version],
  );

  const markStepComplete = useCallback(
    (step: number) => {
      localStorage.setItem(getStepKey(`${exerciseId}-step-${step}`), '1');
      emitChange();
    },
    [exerciseId],
  );

  const getProgress = useCallback(() => {
    let completed = 0;
    for (let i = 1; i <= totalSteps; i++) {
      if (localStorage.getItem(getStepKey(`${exerciseId}-step-${i}`)) === '1') {
        completed++;
      }
    }
    return { completed, total: totalSteps };
  }, [exerciseId, totalSteps, version]);

  return { isStepComplete, markStepComplete, getProgress };
}

export function getExerciseProgress(exerciseId: string, totalSteps: number) {
  let completed = 0;
  for (let i = 1; i <= totalSteps; i++) {
    if (localStorage.getItem(getStepKey(`${exerciseId}-step-${i}`)) === '1') {
      completed++;
    }
  }
  return { completed, total: totalSteps };
}
