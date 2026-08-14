import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { MathText } from '@/components/Math';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ClozeTextExercise, ClozeBlank } from '@/types/study';

interface ClozeTextProps {
  exercise: ClozeTextExercise;
  onComplete?: () => void;
}

interface ParsedSegment {
  type: 'text' | 'blank';
  content: string; // text content or blank id
}

function parseTemplate(template: string): ParsedSegment[] {
  const parts: ParsedSegment[] = [];
  const regex = /\{\{(\w+)\}\}/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: template.slice(last, match.index) });
    }
    parts.push({ type: 'blank', content: match[1] });
    last = match.index + match[0].length;
  }
  if (last < template.length) {
    parts.push({ type: 'text', content: template.slice(last) });
  }
  return parts;
}

function loadSavedState(exerciseId: string, blanks: ClozeBlank[]): Record<string, string> {
  try {
    const raw = localStorage.getItem(`cloze-${exerciseId}`);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return Object.fromEntries(blanks.map((b) => [b.id, '']));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ClozeText({ exercise, onComplete }: ClozeTextProps) {
  const { recordCorrect } = useGamification();
  const segments = useMemo(() => parseTemplate(exercise.template), [exercise.template]);
  const blankMap = useMemo(() => new Map(exercise.blanks.map((b) => [b.id, b])), [exercise.blanks]);

  const options = useMemo(
    () => shuffle([...exercise.blanks.map((b) => b.answer), ...exercise.distractors]),
    [exercise.blanks, exercise.distractors],
  );

  const [fills, setFills] = useState<Record<string, string>>(() => loadSavedState(exercise.id, exercise.blanks));
  const [checked, setChecked] = useState(false);
  const [activeBlank, setActiveBlank] = useState<string | null>(null);

  // Check if previously completed
  const [alreadyComplete] = useState(() => {
    const saved = loadSavedState(exercise.id, exercise.blanks);
    return exercise.blanks.every((b) => saved[b.id] === b.answer);
  });

  const selectOption = useCallback(
    (blankId: string, value: string) => {
      setFills((prev) => {
        const next = { ...prev, [blankId]: value };
        localStorage.setItem(`cloze-${exercise.id}`, JSON.stringify(next));
        return next;
      });
      setActiveBlank(null);
    },
    [exercise.id],
  );

  const checkAnswers = useCallback(() => {
    setChecked(true);
    const allCorrect = exercise.blanks.every((b) => fills[b.id] === b.answer);
    if (allCorrect) {
      recordCorrect();
      onComplete?.();
    }
  }, [exercise.blanks, fills, recordCorrect, onComplete]);

  const resetExercise = useCallback(() => {
    const empty = Object.fromEntries(exercise.blanks.map((b) => [b.id, '']));
    setFills(empty);
    setChecked(false);
    setActiveBlank(null);
    localStorage.removeItem(`cloze-${exercise.id}`);
  }, [exercise.blanks, exercise.id]);

  const allFilled = exercise.blanks.every((b) => fills[b.id] !== '');
  const allCorrect = checked && exercise.blanks.every((b) => fills[b.id] === b.answer);

  return (
    <Card className="my-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Fill in the blanks</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Prose with blanks */}
        <div className="text-base leading-relaxed mb-4">
          {segments.map((seg, i) => {
            if (seg.type === 'text') {
              return <span key={i}><MathText>{seg.content}</MathText></span>;
            }
            const blank = blankMap.get(seg.content)!;
            const value = fills[seg.content] ?? '';
            const isCorrect = checked && value === blank.answer;
            const isWrong = checked && value !== blank.answer;
            const isOpen = activeBlank === seg.content;

            return (
              <span key={i} className="relative inline-block mx-0.5">
                <button
                  type="button"
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium transition-colors min-w-[4rem] justify-center',
                    !value && 'border-2 border-dashed border-muted-foreground/40 text-muted-foreground',
                    value && !checked && 'bg-primary/10 border-2 border-primary/30 text-primary',
                    isCorrect && 'bg-green-500/10 border-2 border-green-500 text-green-700 dark:text-green-300',
                    isWrong && 'bg-red-500/10 border-2 border-red-500 text-red-700 dark:text-red-300',
                    !checked && 'cursor-pointer hover:bg-muted/50',
                    (checked || alreadyComplete) && 'cursor-default',
                  )}
                  onClick={() => {
                    if (!checked && !alreadyComplete) {
                      setActiveBlank(isOpen ? null : seg.content);
                    }
                  }}
                  disabled={checked || alreadyComplete}
                >
                  {value ? <MathText>{value}</MathText> : '\u00A0?\u00A0'}
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 top-full left-0 mt-1 bg-popover border rounded-lg shadow-lg p-1.5 min-w-[10rem] max-h-48 overflow-y-auto"
                  >
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={cn(
                          'w-full text-left px-3 py-1.5 rounded-md text-sm hover:bg-accent transition-colors',
                          fills[seg.content] === opt && 'bg-accent font-medium',
                        )}
                        onClick={() => selectOption(seg.content, opt)}
                      >
                        <MathText>{opt}</MathText>
                      </button>
                    ))}
                  </motion.div>
                )}
              </span>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!checked && !alreadyComplete && (
            <Button onClick={checkAnswers} disabled={!allFilled}>
              <Check className="size-4 mr-1" /> Check
            </Button>
          )}
          {(checked || alreadyComplete) && (
            <Button variant="outline" onClick={resetExercise}>
              <RotateCcw className="size-3.5 mr-1" /> Try again
            </Button>
          )}
        </div>

        {/* Feedback */}
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mt-3 rounded-lg p-3 text-sm',
              allCorrect
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {allCorrect
              ? <strong>All correct! Well done.</strong>
              : <><strong>Not quite.</strong> Red blanks are incorrect &mdash; try again!</>}
          </motion.div>
        )}

        {alreadyComplete && !checked && (
          <div className="mt-3 rounded-lg p-3 text-sm bg-green-500/10 text-green-700 dark:text-green-300">
            <strong>Previously completed!</strong> Click &ldquo;Try again&rdquo; to redo.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
