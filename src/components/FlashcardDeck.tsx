import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Undo2 } from 'lucide-react';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

export interface Flashcard {
  id: string;
  prompt: string;
  answer: string;
  explanation?: string;
}

interface FlashcardDeckProps {
  title: string;
  cards: Flashcard[];
  storageKey?: string;
  onComplete?: () => void;
}

type CardRating = 'again' | 'got-it';

interface DeckState {
  index: number;
  revealed: Set<string>;
  ratings: Record<string, CardRating>;
}

function getPersistenceKey(storageKey?: string) {
  return storageKey ? courseStorageKey('flashcard-deck', storageKey) : null;
}

function loadDeckState(storageKey: string | undefined, cards: Flashcard[]): DeckState {
  const key = getPersistenceKey(storageKey);
  const empty = { index: 0, revealed: new Set<string>(), ratings: {} };
  if (!key) return empty;
  const cardIds = new Set(cards.map((card) => card.id));

  return readStorageJson(key, (value) => {
    if (!value || typeof value !== 'object') return null;
    const saved = value as { version?: unknown; index?: unknown; revealedIds?: unknown; ratings?: unknown };
    if (saved.version !== 1 || !Number.isInteger(saved.index) || !Array.isArray(saved.revealedIds) || !saved.ratings || typeof saved.ratings !== 'object') return null;

    const revealed = new Set(saved.revealedIds.filter((id): id is string => typeof id === 'string' && cardIds.has(id)));
    const ratings = Object.fromEntries(Object.entries(saved.ratings).filter(([id, rating]) => (
      cardIds.has(id) && (rating === 'again' || rating === 'got-it')
    ))) as Record<string, CardRating>;
    return {
      index: Math.min(Math.max(saved.index as number, 0), cards.length),
      revealed,
      ratings,
    };
  }) ?? empty;
}

export function FlashcardDeck({ title, cards, storageKey, onComplete }: FlashcardDeckProps) {
  const titleId = useId();
  const cardSignature = cards.map((card) => card.id).join('\u001f');
  const [state, setState] = useState<DeckState>(() => loadDeckState(storageKey, cards));
  const completionReported = useRef(false);
  const complete = state.index >= cards.length;
  const current = complete ? null : cards[state.index];
  const revealed = current ? state.revealed.has(current.id) : false;
  const rating = current ? state.ratings[current.id] : undefined;
  const ratedCount = cards.filter((card) => state.ratings[card.id]).length;
  const gotItCount = cards.filter((card) => state.ratings[card.id] === 'got-it').length;

  useEffect(() => {
    setState(loadDeckState(storageKey, cards));
    completionReported.current = false;
  }, [cardSignature, storageKey]);

  useEffect(() => {
    const key = getPersistenceKey(storageKey);
    if (key) writeStorageJson(key, {
      version: 1,
      index: state.index,
      revealedIds: [...state.revealed],
      ratings: state.ratings,
    });

    if (!complete) {
      completionReported.current = false;
      return;
    }
    if (!completionReported.current) {
      completionReported.current = true;
      onComplete?.();
    }
  }, [complete, onComplete, state, storageKey]);

  const reset = () => {
    const key = getPersistenceKey(storageKey);
    if (key) removeStorageValue(key);
    setState({ index: 0, revealed: new Set(), ratings: {} });
  };

  if (cards.length === 0) {
    return <p className="flashcard-empty">This deck has no cards yet.</p>;
  }

  if (complete) {
    return (
      <section className="flashcard-deck flashcard-complete" aria-labelledby={titleId}>
        <p className="eyebrow">Deck complete</p>
        <h3 id={titleId}>{title}</h3>
        <p>You marked {gotItCount} of {cards.length} cards as recalled. A self-rating is a study signal, not a grade.</p>
        <div className="flashcard-actions">
          <button className="button button-secondary" onClick={() => setState((previous) => ({ ...previous, index: 0 }))}>
            <ArrowLeft size={15} /> Review cards
          </button>
          <button className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset deck</button>
        </div>
      </section>
    );
  }

  if (!current) return <p className="flashcard-empty">This deck could not load its current card.</p>;

  return (
    <section className="flashcard-deck" aria-labelledby={titleId}>
      <div className="flashcard-heading">
        <div><p className="eyebrow">Recall practice</p><h3 id={titleId}>{title}</h3></div>
        <span>{state.index + 1} / {cards.length}</span>
      </div>
      <div className="mini-progress" role="progressbar" aria-label="Cards rated" aria-valuemin={0} aria-valuemax={cards.length} aria-valuenow={ratedCount}>
        <span style={{ width: `${Math.round((ratedCount / cards.length) * 100)}%` }} />
      </div>
      <div className="flashcard" aria-live="polite">
        <p className="flashcard-label">Prompt</p>
        <p className="flashcard-prompt">{current.prompt}</p>
        {!revealed ? (
          <button
            type="button"
            className="button button-primary"
            onClick={() => setState((previous) => ({
              ...previous,
              revealed: new Set([...previous.revealed, current.id]),
            }))}
          >
            Show answer
          </button>
        ) : (
          <div className="flashcard-answer">
            <p className="flashcard-label">Answer</p>
            <strong>{current.answer}</strong>
            {current.explanation && <p>{current.explanation}</p>}
          </div>
        )}
      </div>
      {revealed && (
        <div className="flashcard-rating" aria-label="Rate your recall">
          <button
            type="button"
            className={`button button-secondary ${rating === 'again' ? 'is-selected' : ''}`}
            aria-pressed={rating === 'again'}
            onClick={() => setState((previous) => ({ ...previous, ratings: { ...previous.ratings, [current.id]: 'again' } }))}
          >
            <Undo2 size={15} /> Review again
          </button>
          <button
            type="button"
            className={`button button-secondary ${rating === 'got-it' ? 'is-selected' : ''}`}
            aria-pressed={rating === 'got-it'}
            onClick={() => setState((previous) => ({ ...previous, ratings: { ...previous.ratings, [current.id]: 'got-it' } }))}
          >
            <Check size={15} /> I recalled it
          </button>
        </div>
      )}
      <div className="flashcard-navigation">
        <button
          type="button"
          className="button button-quiet"
          disabled={state.index === 0}
          onClick={() => setState((previous) => ({ ...previous, index: Math.max(0, previous.index - 1) }))}
        >
          <ArrowLeft size={15} /> Previous
        </button>
        <button
          type="button"
          className="button button-primary"
          disabled={!rating}
          onClick={() => setState((previous) => ({ ...previous, index: Math.min(cards.length, previous.index + 1) }))}
        >
          {state.index === cards.length - 1 ? 'Finish deck' : 'Next card'} <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}
