import { useSyncExternalStore, useCallback } from 'react';
import { useGamification } from './useGamification.ts';
import type { Flashcard, LeitnerBox, TopicId } from '@/types/study';

const STORAGE_KEY = 'leitner-deck';

interface CardState {
  box: LeitnerBox;
  ts: number;
}

type DeckState = Record<string, CardState>;

// --- external-store plumbing (matches useGamification pattern) ---

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

function readDeck(): DeckState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.cards ?? {};
    }
  } catch { /* corrupted — start fresh */ }
  return {};
}

function writeDeck(deck: DeckState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ cards: deck }));
  emitChange();
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '{}';
}

// --- due-date logic ---

const DAY_MS = 86_400_000;
const BOX_INTERVALS: Record<LeitnerBox, number> = {
  1: 0,
  2: 1 * DAY_MS,
  3: 3 * DAY_MS,
};

function isDue(state: CardState | undefined): boolean {
  if (!state) return true; // new card → always due
  const elapsed = Date.now() - state.ts;
  return elapsed >= BOX_INTERVALS[state.box];
}

// --- hook ---

export function useLeitnerBox(allCards: Flashcard[]) {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const deck: DeckState = (() => {
    try {
      const parsed = JSON.parse(snap);
      return parsed.cards ?? {};
    } catch {
      return {};
    }
  })();

  const { recordCorrect: gamRecordCorrect } = useGamification();

  const getBox = useCallback(
    (cardId: string): LeitnerBox => deck[cardId]?.box ?? 1,
    [deck],
  );

  const getDueCards = useCallback(
    (topicId?: TopicId): Flashcard[] => {
      const subset = topicId ? allCards.filter((c) => c.topicId === topicId) : allCards;
      return subset.filter((c) => isDue(deck[c.id]));
    },
    [allCards, deck],
  );

  const markCorrect = useCallback(
    (cardId: string) => {
      const d = readDeck();
      const current = d[cardId]?.box ?? 1;
      const next: LeitnerBox = current < 3 ? ((current + 1) as LeitnerBox) : 3;
      d[cardId] = { box: next, ts: Date.now() };
      writeDeck(d);
      gamRecordCorrect();
    },
    [gamRecordCorrect],
  );

  const markWrong = useCallback(
    (cardId: string) => {
      const d = readDeck();
      d[cardId] = { box: 1, ts: Date.now() };
      writeDeck(d);
    },
    [],
  );

  const getProgress = useCallback(
    (topicId?: TopicId) => {
      const subset = topicId ? allCards.filter((c) => c.topicId === topicId) : allCards;
      let learning = 0;
      let reviewing = 0;
      let mastered = 0;
      for (const c of subset) {
        const box = deck[c.id]?.box ?? 1;
        if (box === 1) learning++;
        else if (box === 2) reviewing++;
        else mastered++;
      }
      return { learning, reviewing, mastered, total: subset.length };
    },
    [allCards, deck],
  );

  const reset = useCallback(
    (topicId?: TopicId) => {
      const d = readDeck();
      if (topicId) {
        const ids = new Set(allCards.filter((c) => c.topicId === topicId).map((c) => c.id));
        for (const id of ids) delete d[id];
      } else {
        for (const id of allCards.map((c) => c.id)) delete d[id];
      }
      writeDeck(d);
    },
    [allCards],
  );

  return { getBox, getDueCards, markCorrect, markWrong, getProgress, reset };
}
