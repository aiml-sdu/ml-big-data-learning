import { useSyncExternalStore } from 'react';

const XP_KEY = 'gam-xp';
const STREAK_KEY = 'gam-streak';
const MAX_STREAK_KEY = 'gam-max-streak';

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

function readNum(key: string): number {
  return Number(localStorage.getItem(key) ?? '0');
}

function getSnapshot() {
  return `${readNum(XP_KEY)},${readNum(STREAK_KEY)},${readNum(MAX_STREAK_KEY)}`;
}

export function getXp(): number {
  return readNum(XP_KEY);
}

export function useGamification() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const [xp, streak, maxStreak] = snap.split(',').map(Number);

  function recordCorrect() {
    const newXp = readNum(XP_KEY) + 1;
    const newStreak = readNum(STREAK_KEY) + 1;
    const newMax = Math.max(newStreak, readNum(MAX_STREAK_KEY));
    localStorage.setItem(XP_KEY, String(newXp));
    localStorage.setItem(STREAK_KEY, String(newStreak));
    localStorage.setItem(MAX_STREAK_KEY, String(newMax));
    emitChange();
  }

  function recordWrong() {
    localStorage.setItem(STREAK_KEY, '0');
    emitChange();
  }

  return { xp, streak, maxStreak, recordCorrect, recordWrong };
}
