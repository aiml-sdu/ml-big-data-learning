import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

export interface KnowledgeCheckOption {
  id: string;
  label: string;
  correct?: boolean;
  feedback: string;
}

interface KnowledgeCheckProps {
  question: string;
  options: KnowledgeCheckOption[];
  storageKey?: string;
  onCorrect?: () => void;
}

interface AnswerState {
  selectedId: string | null;
  submitted: boolean;
}

function getPersistenceKey(storageKey?: string) {
  return storageKey ? courseStorageKey('knowledge-check', storageKey) : null;
}

function loadSavedAnswer(storageKey: string | undefined, optionIds: Set<string>): AnswerState {
  const key = getPersistenceKey(storageKey);
  if (!key) return { selectedId: null, submitted: false };

  return readStorageJson(key, (value) => {
    if (!value || typeof value !== 'object') return null;
    const answer = value as { version?: unknown; optionId?: unknown };
    if (answer.version !== 1 || typeof answer.optionId !== 'string' || !optionIds.has(answer.optionId)) return null;
    return { selectedId: answer.optionId, submitted: true };
  }) ?? { selectedId: null, submitted: false };
}

export function KnowledgeCheck({ question, options, storageKey, onCorrect }: KnowledgeCheckProps) {
  const groupName = useId();
  const optionSignature = options.map((option) => option.id).join('\u001f');
  const optionIds = new Set(options.map((option) => option.id));
  const [answer, setAnswer] = useState<AnswerState>(() => loadSavedAnswer(storageKey, optionIds));
  const selectedOption = options.find((option) => option.id === answer.selectedId) ?? null;
  const reportedCorrect = useRef(false);

  useEffect(() => {
    setAnswer(loadSavedAnswer(storageKey, new Set(optionSignature.split('\u001f').filter(Boolean))));
    reportedCorrect.current = false;
  }, [optionSignature, storageKey]);

  useEffect(() => {
    if (!answer.submitted) {
      reportedCorrect.current = false;
      return;
    }
    if (selectedOption?.correct && !reportedCorrect.current) {
      reportedCorrect.current = true;
      onCorrect?.();
    }
  }, [answer.submitted, onCorrect, selectedOption]);

  return (
    <section className="knowledge-check" aria-labelledby={`${groupName}-title`}>
      <div className="eyebrow"><CircleHelp size={16} /> Knowledge check</div>
      <h3 id={`${groupName}-title`}>{question}</h3>
      <div className="option-list" role="radiogroup" aria-label={question}>
        {options.map((option, index) => {
          const active = answer.selectedId === option.id;
          const resultClass = answer.submitted && active ? (option.correct ? 'is-correct' : 'is-incorrect') : '';
          return (
            <label className={`quiz-option ${active ? 'is-selected' : ''} ${resultClass}`} key={option.id}>
              <input
                type="radio"
                name={groupName}
                checked={active}
                onChange={() => {
                  setAnswer({ selectedId: option.id, submitted: false });
                }}
              />
              <span className="option-marker" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      <div className="check-actions">
        <button
          className="button button-primary"
          disabled={answer.selectedId === null}
          onClick={() => {
            if (answer.selectedId === null) return;
            setAnswer((current) => ({ ...current, submitted: true }));
            const key = getPersistenceKey(storageKey);
            if (key) writeStorageJson(key, { version: 1, optionId: answer.selectedId });
          }}
        >
          Check answer
        </button>
        {answer.submitted && (
          <button className="button button-quiet" onClick={() => {
            setAnswer({ selectedId: null, submitted: false });
            const key = getPersistenceKey(storageKey);
            if (key) removeStorageValue(key);
          }}>
            <RotateCcw size={15} /> Try again
          </button>
        )}
      </div>
      {answer.submitted && selectedOption && (
        <div className={`feedback ${selectedOption.correct ? 'feedback-correct' : 'feedback-incorrect'}`} role="status">
          {selectedOption.correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <strong>{selectedOption.correct ? 'This rule fits.' : 'Check the rule again.'}</strong>
            <p>{selectedOption.feedback}</p>
          </div>
        </div>
      )}
    </section>
  );
}
