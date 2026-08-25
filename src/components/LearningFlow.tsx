import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { courseStorageKey, readStorageJson, writeStorageJson } from '@/lib/courseStorage';

export interface LearningFlowStepContext {
  completeStep: () => void;
  isComplete: boolean;
}

export interface LearningFlowStep {
  id: string;
  title: string;
  sectionLabel?: string;
  autoComplete?: boolean;
  render: (context: LearningFlowStepContext) => ReactNode;
}

interface LearningFlowProps {
  storageKey: string;
  steps: LearningFlowStep[];
  onFinish?: () => void;
}

interface FlowState {
  currentIndex: number;
  completed: Set<string>;
}

function getPersistenceKey(storageKey: string) {
  return courseStorageKey('learning-flow', storageKey);
}

function loadFlowState(storageKey: string, steps: LearningFlowStep[]): FlowState {
  const stepIds = new Set(steps.map((step) => step.id));
  const empty = { currentIndex: 0, completed: new Set<string>() };

  return readStorageJson(getPersistenceKey(storageKey), (value) => {
    if (!value || typeof value !== 'object') return null;
    const saved = value as { version?: unknown; currentStepId?: unknown; completedStepIds?: unknown };
    if (saved.version !== 1 || typeof saved.currentStepId !== 'string' || !Array.isArray(saved.completedStepIds)) return null;

    const completed = new Set(saved.completedStepIds.filter((id): id is string => typeof id === 'string' && stepIds.has(id)));
    const requestedIndex = steps.findIndex((step) => step.id === saved.currentStepId);
    const firstIncomplete = steps.findIndex((step) => !completed.has(step.id));
    const furthestAccessible = firstIncomplete === -1 ? Math.max(steps.length - 1, 0) : firstIncomplete;
    const currentIndex = requestedIndex < 0 ? 0 : Math.min(requestedIndex, furthestAccessible);
    return { currentIndex, completed };
  }) ?? empty;
}

export function LearningFlow({ storageKey, steps, onFinish }: LearningFlowProps) {
  const stepSignature = steps.map((step) => step.id).join('\u001f');
  const [state, setState] = useState<FlowState>(() => loadFlowState(storageKey, steps));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const initialRender = useRef(true);
  const current = steps[state.currentIndex];
  const currentComplete = current ? state.completed.has(current.id) : false;

  const firstIncomplete = useMemo(() => {
    const index = steps.findIndex((step) => !state.completed.has(step.id));
    return index === -1 ? Math.max(steps.length - 1, 0) : index;
  }, [state.completed, steps]);

  useEffect(() => {
    setState(loadFlowState(storageKey, steps));
    initialRender.current = true;
  }, [stepSignature, storageKey]);

  useEffect(() => {
    if (!current) return;
    writeStorageJson(getPersistenceKey(storageKey), {
      version: 1,
      currentStepId: current.id,
      completedStepIds: [...state.completed],
    });
  }, [current, state.completed, storageKey]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [state.currentIndex]);

  const completeStep = useCallback(() => {
    if (!current) return;
    setState((previous) => {
      if (previous.completed.has(current.id)) return previous;
      const completed = new Set(previous.completed);
      completed.add(current.id);
      return { ...previous, completed };
    });
  }, [current]);

  useEffect(() => {
    if (current?.autoComplete) completeStep();
  }, [completeStep, current?.autoComplete]);

  if (!current) {
    return <p className="learning-flow-empty">This learning flow has no steps yet.</p>;
  }

  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === steps.length - 1;

  return (
    <section className="learning-flow" aria-labelledby={`${storageKey}-step-title`}>
      <div className="learning-flow-progress" aria-label="Lesson progress">
        {steps.map((step, index) => {
          const done = state.completed.has(step.id);
          const active = index === state.currentIndex;
          const locked = index > firstIncomplete;
          return (
            <button
              type="button"
              key={step.id}
              disabled={locked}
              aria-current={active ? 'step' : undefined}
              aria-label={`${step.title}${active ? ', current step' : ''}${done ? ', completed' : ''}`}
              className={`learning-flow-dot ${active ? 'is-active' : ''} ${done ? 'is-complete' : ''}`}
              onClick={() => setState((previous) => ({ ...previous, currentIndex: index }))}
            >
              {done ? <Check size={13} strokeWidth={3} /> : index + 1}
            </button>
          );
        })}
      </div>

      <div className="learning-flow-counter">
        <span>{current.sectionLabel ?? 'Learning step'}</span>
        <span>{state.currentIndex + 1} / {steps.length}</span>
      </div>

      <div className="learning-flow-card">
        <h2 id={`${storageKey}-step-title`} ref={titleRef} tabIndex={-1}>{current.title}</h2>
        {current.render({ completeStep, isComplete: currentComplete })}
      </div>

      <div className="learning-flow-navigation">
        <button
          type="button"
          className="button button-quiet"
          disabled={isFirst}
          onClick={() => setState((previous) => ({ ...previous, currentIndex: Math.max(0, previous.currentIndex - 1) }))}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          className="button button-primary"
          disabled={!currentComplete}
          onClick={() => {
            if (isLast) onFinish?.();
            else setState((previous) => ({ ...previous, currentIndex: Math.min(steps.length - 1, previous.currentIndex + 1) }));
          }}
        >
          {isLast ? 'Finish' : 'Continue'} {!isLast && <ArrowRight size={16} />}
        </button>
      </div>
      {!currentComplete && <p className="learning-flow-hint">Complete this step to continue.</p>}
    </section>
  );
}
