import '@testing-library/jest-dom/vitest';

// Node 25 ships an experimental localStorage with incomplete API (no getItem/setItem/clear).
// Polyfill a spec-compliant Storage on globalThis so hooks and tests work correctly.
if (typeof globalThis.localStorage.getItem !== 'function') {
  const store = new Map<string, string>();
  const storage: Storage = {
    get length() { return store.size; },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key: string) { return store.get(key) ?? null; },
    setItem(key: string, value: string) { store.set(key, String(value)); },
    removeItem(key: string) { store.delete(key); },
    clear() { store.clear(); },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, writable: true, configurable: true });
}

beforeEach(() => {
  localStorage.clear();
});
