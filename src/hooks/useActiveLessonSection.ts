import { useSyncExternalStore } from 'react';

const KEY = 'lesson-active-section';

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

function getSnapshot() {
  return localStorage.getItem(KEY) ?? '';
}

export function setActiveLessonSection(sectionId: string) {
  const current = localStorage.getItem(KEY);
  if (current !== sectionId) {
    localStorage.setItem(KEY, sectionId);
    emitChange();
  }
}

export function clearActiveLessonSection() {
  if (localStorage.getItem(KEY)) {
    localStorage.removeItem(KEY);
    emitChange();
  }
}

export function useActiveLessonSection() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
