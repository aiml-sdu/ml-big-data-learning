import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS, type Transform } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ---- Types ----

export interface ClozeLineStatic {
  type: 'static';
  content: string;
}

export interface ClozeLineBlank {
  type: 'blank';
  id: string;
  answer: string;
}

export type ClozeLine = ClozeLineStatic | ClozeLineBlank;

interface ClozeCodeExerciseProps {
  title: string;
  lines: ClozeLine[];
}

// ---- Draggable chip ----

function DraggableChip({
  id,
  label,
  disabled,
}: {
  id: string;
  label: string;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform as Transform) : undefined,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      className={cn(
        'inline-flex cursor-grab items-center rounded-md border bg-secondary px-3 py-1.5 font-mono text-xs whitespace-nowrap',
        'select-none touch-none transition-shadow',
        'hover:shadow-md active:cursor-grabbing',
        disabled && 'invisible',
      )}
      {...listeners}
      {...attributes}
    >
      {label}
    </span>
  );
}

// ---- Droppable slot ----

function DroppableSlot({
  id,
  placedLabel,
  feedback,
}: {
  id: string;
  placedLabel: string | null;
  feedback?: 'correct' | 'wrong' | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <span
      ref={setNodeRef}
      className={cn(
        'inline-flex min-w-48 items-center rounded-md border-2 border-dashed px-3 py-1.5 font-mono text-xs transition-colors',
        isOver && 'border-primary bg-primary/10',
        !isOver && !placedLabel && 'border-muted-foreground/30 bg-muted/30',
        !isOver && placedLabel && 'border-muted-foreground/50 bg-secondary',
        feedback === 'correct' && 'border-green-500 bg-green-500/10',
        feedback === 'wrong' && 'border-red-500 bg-red-500/10',
      )}
    >
      {placedLabel || <span className="text-muted-foreground/50">drop here</span>}
    </span>
  );
}

// ---- Main component ----

export default function ClozeCodeExercise({ title, lines }: ClozeCodeExerciseProps) {
  const blanks = useMemo(() => lines.filter((l): l is ClozeLineBlank => l.type === 'blank'), [lines]);

  // Shuffle answer options (stable across re-renders unless lines change)
  const shuffledOptions = useMemo(() => {
    const opts = blanks.map((b) => ({ id: b.id, label: b.answer }));
    // Fisher-Yates
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [blanks]);

  // placements: slotId -> chipId (which option is placed in which slot)
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, 'correct' | 'wrong'> | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Derive which chips are placed (in any slot)
  const placedChipIds = useMemo(() => new Set(Object.values(placements)), [placements]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const chipId = active.id as string;
      const slotId = over.id as string;

      // Only allow dropping on blank slots
      if (!blanks.some((b) => b.id === slotId)) return;

      setFeedback(null); // Clear feedback on new interaction

      setPlacements((prev) => {
        const next = { ...prev };

        // Remove chip from its previous slot (if any)
        for (const [sid, cid] of Object.entries(next)) {
          if (cid === chipId) delete next[sid];
        }

        // If slot already has a chip, remove it (send back to bank)
        if (next[slotId]) {
          delete next[slotId];
        }

        // Place chip in slot
        next[slotId] = chipId;
        return next;
      });
    },
    [blanks],
  );

  const handleSubmit = useCallback(() => {
    const fb: Record<string, 'correct' | 'wrong'> = {};
    for (const blank of blanks) {
      const placedChipId = placements[blank.id];
      // Correct if the chip placed in this slot corresponds to this blank's answer
      fb[blank.id] = placedChipId === blank.id ? 'correct' : 'wrong';
    }
    setFeedback(fb);
  }, [blanks, placements]);

  const handleReset = useCallback(() => {
    setPlacements({});
    setFeedback(null);
  }, []);

  const allCorrect = feedback && Object.values(feedback).every((v) => v === 'correct');
  const allFilled = blanks.every((b) => placements[b.id]);
  const activeChip = shuffledOptions.find((o) => o.id === activeId);

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Code block with slots */}
          <div className="overflow-x-auto rounded-lg border bg-muted/30 p-4 font-mono text-sm leading-loose">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 shrink-0 select-none text-right text-xs text-muted-foreground/50">
                  {i + 1}
                </span>
                {line.type === 'static' ? (
                  <span className="whitespace-pre">{line.content}</span>
                ) : (
                  <DroppableSlot
                    id={line.id}
                    placedLabel={
                      placements[line.id]
                        ? shuffledOptions.find((o) => o.id === placements[line.id])?.label ?? null
                        : null
                    }
                    feedback={feedback?.[line.id] ?? null}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Chip bank */}
          <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto">
            {shuffledOptions.map((opt) => (
              <DraggableChip
                key={opt.id}
                id={opt.id}
                label={opt.label}
                disabled={placedChipIds.has(opt.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeChip ? (
              <span className="inline-flex cursor-grabbing items-center rounded-md border bg-secondary px-3 py-1.5 font-mono text-xs shadow-lg">
                {activeChip.label}
              </span>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Controls */}
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={handleSubmit} disabled={!allFilled || !!allCorrect} size="sm">
            Check
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset
          </Button>
          {allCorrect && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              All correct!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
