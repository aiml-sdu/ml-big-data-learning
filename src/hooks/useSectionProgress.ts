import { useCallback, useSyncExternalStore } from 'react';

const KEY_PREFIX = 'visited-';

function getKey(topicId: string, sectionId: string) {
  return `${KEY_PREFIX}${topicId}-${sectionId}`;
}

let listeners: (() => void)[] = [];
let version = 0;
function emitChange() {
  version++;
  for (const l of listeners) l();
}

export function getVersion() {
  return version;
}

export function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function useSectionProgress(topicId: string, sectionIds: string[]) {
  // Compute a snapshot bitmask so useSyncExternalStore detects changes
  const snapshot = useSyncExternalStore(subscribe, () => {
    let v = 0;
    for (let i = 0; i < sectionIds.length; i++) {
      if (localStorage.getItem(getKey(topicId, sectionIds[i]))) v += 1 << i;
    }
    return v;
  });

  const visitedSections = new Set<string>();
  for (let i = 0; i < sectionIds.length; i++) {
    if (snapshot & (1 << i)) visitedSections.add(sectionIds[i]);
  }

  const markVisited = useCallback(
    (sectionId: string) => {
      const key = getKey(topicId, sectionId);
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, '1');
        emitChange();
      }
    },
    [topicId],
  );

  return { visitedSections, markVisited };
}
