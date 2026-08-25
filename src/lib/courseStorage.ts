import { COURSE } from '@/course/course.config';

const memoryFallback = new Map<string, string>();

export function courseStorageKey(scope: string, id: string) {
  return `interactive-learning:${COURSE.storageNamespace}:v1:${scope}:${id}`;
}

export function readStorageValue(key: string) {
  if (typeof window === 'undefined') return memoryFallback.get(key) ?? null;

  try {
    return window.localStorage.getItem(key) ?? memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeStorageValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    memoryFallback.set(key, value);
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    memoryFallback.delete(key);
    return true;
  } catch {
    memoryFallback.set(key, value);
    return false;
  }
}

export function removeStorageValue(key: string) {
  memoryFallback.delete(key);
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // The in-memory state is already clear. Storage failures must not break learning.
  }
}

export function readStorageJson<T>(key: string, parse: (value: unknown) => T | null) {
  const raw = readStorageValue(key);
  if (raw === null) return null;

  try {
    return parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStorageJson(key: string, value: unknown) {
  return writeStorageValue(key, JSON.stringify(value));
}
