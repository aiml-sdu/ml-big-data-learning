import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

export interface ChallengeItem {
  id: string;
  prompt: string;
  answer: string;
  explanation: string;
}

interface CategoryChallengeProps {
  title: string;
  introduction: string;
  categories: string[];
  items: ChallengeItem[];
  storageKey?: string;
  onComplete?: () => void;
}

interface ChallengeState {
  index: number;
  answers: Record<string, string>;
}

function getPersistenceKey(storageKey?: string) {
  return storageKey ? courseStorageKey('category-challenge', storageKey) : null;
}

function loadChallengeState(storageKey: string | undefined, items: ChallengeItem[], categories: string[]): ChallengeState {
  const key = getPersistenceKey(storageKey);
  if (!key) return { index: 0, answers: {} };

  const itemIds = new Set(items.map((item) => item.id));
  const categoryIds = new Set(categories);

  return readStorageJson(key, (value) => {
    if (!value || typeof value !== 'object') return null;
    const saved = value as { version?: unknown; index?: unknown; answers?: unknown };
    if (saved.version !== 1 || !Number.isInteger(saved.index) || !saved.answers || typeof saved.answers !== 'object') return null;

    const answers = Object.fromEntries(
      Object.entries(saved.answers).filter(([itemId, answer]) => itemIds.has(itemId) && typeof answer === 'string' && categoryIds.has(answer)),
    );
    const index = Math.min(Math.max(saved.index as number, 0), items.length);
    return { index, answers };
  }) ?? { index: 0, answers: {} };
}

export function CategoryChallenge({ title, introduction, categories, items, storageKey, onComplete }: CategoryChallengeProps) {
  const titleId = useId();
  const itemSignature = items.map((item) => item.id).join('\u001f');
  const categorySignature = categories.join('\u001f');
  const [state, setState] = useState<ChallengeState>(() => loadChallengeState(storageKey, items, categories));
  const completionReported = useRef(false);
  const complete = state.index >= items.length;
  const item = complete ? null : items[state.index];
  const selection = item ? state.answers[item.id] ?? null : null;
  const correct = item ? selection === item.answer : false;
  const answeredCount = items.filter((candidate) => state.answers[candidate.id] !== undefined).length;
  const score = items.filter((candidate) => state.answers[candidate.id] === candidate.answer).length;
  const progress = items.length === 0 ? 0 : Math.round((answeredCount / items.length) * 100);

  useEffect(() => {
    setState(loadChallengeState(storageKey, items, categories));
    completionReported.current = false;
  }, [categorySignature, itemSignature, storageKey]);

  useEffect(() => {
    const key = getPersistenceKey(storageKey);
    if (key) writeStorageJson(key, { version: 1, ...state });

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
    setState({ index: 0, answers: {} });
  };

  if (items.length === 0) {
    return <p className="challenge-empty">This practice activity has no cases yet.</p>;
  }

  if (complete) {
    return (
      <section className="challenge-card challenge-complete" aria-live="polite">
        <CheckCircle2 size={34} />
        <p className="eyebrow">Activity complete</p>
        <h3>{score} of {items.length} correct</h3>
        <p>Review any answer that surprised you, then explain the difference in your own words.</p>
        <div className="challenge-review-actions">
          <button className="button button-secondary" onClick={() => setState((current) => ({ ...current, index: 0 }))}>
            <ArrowLeft size={15} /> Review answers
          </button>
          <button className="button button-quiet" onClick={reset}><RotateCcw size={15} /> Reset activity</button>
        </div>
      </section>
    );
  }

  if (!item) return <p className="challenge-empty">This practice activity could not load its current case.</p>;

  return (
    <section className="challenge-card" aria-labelledby={titleId}>
      <div className="challenge-heading">
        <div>
          <p className="eyebrow">Interactive example</p>
          <h3 id={titleId}>{title}</h3>
        </div>
        <span className="challenge-count">{state.index + 1} / {items.length}</span>
      </div>
      <p>{introduction}</p>
      <div className="mini-progress" role="progressbar" aria-label="Cases answered" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={answeredCount}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="scenario">{item.prompt}</div>
      <div className="category-options">
        {categories.map((category) => (
          <button
            type="button"
            className={`category-button ${selection === category ? 'is-selected' : ''}`}
            key={category}
            disabled={selection !== null}
            aria-pressed={selection === category}
            onClick={() => setState((current) => ({
              ...current,
              answers: { ...current.answers, [item.id]: category },
            }))}
          >
            {category}
          </button>
        ))}
      </div>
      {selection && (
        <div className={`feedback ${correct ? 'feedback-correct' : 'feedback-incorrect'}`} role="status">
          <div>
            <strong>{correct ? 'Your choice follows the rule.' : `The stronger answer is “${item.answer}”.`}</strong>
            <p>{item.explanation}</p>
          </div>
        </div>
      )}
      <div className="challenge-navigation">
        <button
          type="button"
          className="button button-quiet"
          disabled={state.index === 0}
          onClick={() => setState((current) => ({ ...current, index: Math.max(0, current.index - 1) }))}
        >
          <ArrowLeft size={15} /> Previous case
        </button>
        <button
          type="button"
          className="button button-quiet"
          disabled={selection === null}
          onClick={() => setState((current) => ({ ...current, index: Math.min(items.length, current.index + 1) }))}
        >
          {state.index === items.length - 1 ? 'Finish activity' : 'Next case'} <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}
