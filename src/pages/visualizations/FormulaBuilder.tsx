import { useState, useCallback } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DragBlockProps {
  id: string;
  label: string;
  placed: boolean;
}

function DragBlock({ id, label, placed }: DragBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  if (placed) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'px-4 py-2 rounded-lg border-2 font-mono text-sm font-bold cursor-grab select-none transition-all',
        isDragging
          ? 'border-primary bg-primary/20 shadow-lg scale-105 z-50'
          : 'border-border bg-muted hover:border-primary/50',
      )}
    >
      {label}
    </div>
  );
}

function DropSlot({
  id,
  label,
  filled,
  filledLabel,
}: {
  id: string;
  label: string;
  filled: boolean;
  filledLabel?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-24 h-12 rounded-lg border-2 border-dashed flex items-center justify-center font-mono text-sm font-bold transition-all',
        filled && 'border-solid border-green-500 bg-green-500/10 text-green-700 dark:text-green-400',
        !filled && isOver && 'border-primary bg-primary/10',
        !filled && !isOver && 'border-muted-foreground/30 text-muted-foreground',
      )}
    >
      {filled ? filledLabel : label}
    </div>
  );
}

export default function FormulaBuilder() {
  const [slots, setSlots] = useState<{ left: string | null; right: string | null }>({
    left: null,
    right: null,
  });
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(false);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const blockId = active.id as string;
    const slotId = over.id as string;

    if (slotId !== 'left' && slotId !== 'right') return;

    setSlots((prev) => {
      const next = { ...prev };
      next[slotId] = blockId;

      // Check if formula is correct: f(n) = g(n) + h(n)
      if (next.left && next.right) {
        if (next.left === 'g' && next.right === 'h') {
          setCompleted(true);
          setError(false);
        } else {
          setError(true);
          // Reset after showing error
          setTimeout(() => {
            setSlots({ left: null, right: null });
            setError(false);
          }, 1200);
        }
      }

      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSlots({ left: null, right: null });
    setCompleted(false);
    setError(false);
  }, []);

  const blocks = [
    { id: 'g', label: 'g(n)' },
    { id: 'h', label: 'h(n)' },
  ];

  return (
    <div className="rounded-lg border bg-card p-6 my-4">
      <div className="text-sm font-medium mb-4">
        Build the A* evaluation function by dragging the components into the formula:
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        {/* Formula display */}
        <div className="flex items-center justify-center gap-3 mb-6 text-lg font-mono font-bold">
          <span>f(n)</span>
          <span>=</span>
          <DropSlot
            id="left"
            label="?"
            filled={!!slots.left}
            filledLabel={slots.left === 'g' ? 'g(n)' : slots.left === 'h' ? 'h(n)' : '?'}
          />
          <span>+</span>
          <DropSlot
            id="right"
            label="?"
            filled={!!slots.right}
            filledLabel={slots.right === 'g' ? 'g(n)' : slots.right === 'h' ? 'h(n)' : '?'}
          />
        </div>

        {/* Drag blocks */}
        {!completed && (
          <div className="flex items-center justify-center gap-4">
            {blocks.map((b) => (
              <DragBlock
                key={b.id}
                id={b.id}
                label={b.label}
                placed={slots.left === b.id || slots.right === b.id}
              />
            ))}
          </div>
        )}
      </DndContext>

      {error && (
        <div className="text-center text-red-600 dark:text-red-400 text-sm mt-3 font-medium">
          Not quite! Remember: g(n) is the cost so far, h(n) is the estimated remaining cost.
        </div>
      )}

      {completed && (
        <div className="text-center mt-3">
          <div className="text-green-600 dark:text-green-400 font-bold">
            Correct! f(n) = g(n) + h(n)
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            The total estimated cost through n = actual cost so far + estimated remaining cost.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-primary underline mt-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
