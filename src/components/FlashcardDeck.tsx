import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Check, X, BookOpen } from 'lucide-react';
import { useLeitnerBox } from '@/hooks/useLeitnerBox';
import { MathText } from '@/components/Math';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Flashcard, TopicId } from '@/types/study';

interface FlashcardDeckProps {
  cards: Flashcard[];
  topicId?: TopicId;
  compact?: boolean;
}

const BOX_LABELS: Record<1 | 2 | 3, string> = { 1: 'Learning', 2: 'Reviewing', 3: 'Mastered' };

export default function FlashcardDeck({ cards, topicId, compact }: FlashcardDeckProps) {
  const { getDueCards, markCorrect, markWrong, getProgress, getBox, reset } = useLeitnerBox(cards);

  const dueCards = getDueCards(topicId);
  const progress = getProgress(topicId);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (index >= dueCards.length && dueCards.length > 0) {
      setIndex(dueCards.length - 1);
    }
    if (dueCards.length === 0 && progress.total > 0) {
      setFinished(true);
    }
  }, [dueCards.length, index, progress.total]);

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const handleCorrect = useCallback(() => {
    if (!dueCards[index]) return;
    markCorrect(dueCards[index].id);
    setFlipped(false);
  }, [dueCards, index, markCorrect]);

  const handleWrong = useCallback(() => {
    if (!dueCards[index]) return;
    markWrong(dueCards[index].id);
    setFlipped(false);
  }, [dueCards, index, markWrong]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') { e.preventDefault(); flip(); }
      if (e.key === 'ArrowRight' && flipped) handleCorrect();
      if (e.key === 'ArrowLeft' && flipped) handleWrong();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flip, flipped, handleCorrect, handleWrong]);

  // Confetti when all mastered
  useEffect(() => {
    if (finished && progress.mastered === progress.total && progress.total > 0) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  }, [finished, progress.mastered, progress.total]);

  const pctLearning = progress.total ? (progress.learning / progress.total) * 100 : 0;
  const pctReviewing = progress.total ? (progress.reviewing / progress.total) * 100 : 0;
  const pctMastered = progress.total ? (progress.mastered / progress.total) * 100 : 0;

  const current = dueCards[index];
  const currentBox = current ? getBox(current.id) : 1;

  return (
    <Card className={cn('my-6 overflow-hidden', compact && 'my-4')}>
      {!compact && (
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-primary" />
            <span className="font-semibold text-sm">Flashcards</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { reset(topicId); setFinished(false); setIndex(0); }}>
            <RotateCcw className="size-3.5 mr-1" /> Reset
          </Button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mx-4 mb-3 flex h-2 rounded-full overflow-hidden bg-muted">
        {pctLearning > 0 && (
          <div className="bg-red-400 transition-all duration-300" style={{ width: `${pctLearning}%` }} title={`Learning: ${progress.learning}`} />
        )}
        {pctReviewing > 0 && (
          <div className="bg-amber-400 transition-all duration-300" style={{ width: `${pctReviewing}%` }} title={`Reviewing: ${progress.reviewing}`} />
        )}
        {pctMastered > 0 && (
          <div className="bg-green-500 transition-all duration-300" style={{ width: `${pctMastered}%` }} title={`Mastered: ${progress.mastered}`} />
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-400" /> Learning ({progress.learning})</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> Reviewing ({progress.reviewing})</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500" /> Mastered ({progress.mastered})</span>
        </div>

        {finished || dueCards.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            {progress.mastered === progress.total ? (
              <>
                <p className="text-2xl font-bold">All cards mastered!</p>
                <p className="text-sm text-muted-foreground">Come back later for spaced review.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">No cards due right now</p>
                <p className="text-sm text-muted-foreground">
                  {progress.reviewing} reviewing (due tomorrow) &middot; {progress.mastered} mastered (due in 3 days)
                </p>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => { reset(topicId); setFinished(false); setIndex(0); }}>
              <RotateCcw className="size-3.5 mr-1" /> Start Over
            </Button>
          </div>
        ) : current ? (
          <>
            {/* Card counter + box badge */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                Card {index + 1} of {dueCards.length} due
              </p>
              <span className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                currentBox === 1 && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
                currentBox === 2 && 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                currentBox === 3 && 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
              )}>
                {BOX_LABELS[currentBox]}
              </span>
            </div>

            {/* Flip card */}
            <div
              className="relative cursor-pointer select-none"
              style={{ perspective: 1000, minHeight: compact ? 180 : 220 }}
              onClick={flip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') flip(); }}
              aria-label={flipped ? 'Card back — click to flip' : 'Card front — click to flip'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={flipped ? 'back' : 'front'}
                  initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{
                    minHeight: compact ? 180 : 220,
                    backfaceVisibility: 'hidden',
                    transformStyle: 'preserve-3d',
                  }}
                  className={cn(
                    'rounded-xl p-6 flex flex-col items-center justify-center text-center',
                    !flipped && 'bg-gradient-to-br from-card to-muted/30 border-2 border-border shadow-sm',
                    flipped && 'bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 shadow-sm',
                  )}
                >
                  {!flipped ? (
                    <>
                      <p className="text-lg font-semibold leading-relaxed"><MathText>{current.front}</MathText></p>
                      <p className="text-[11px] text-muted-foreground mt-4 tracking-wide uppercase">
                        Tap to reveal &middot; Space
                      </p>
                    </>
                  ) : (
                    <p className="text-[15px] leading-relaxed"><MathText>{current.back}</MathText></p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Answer buttons — Anki-style */}
            {flipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex justify-center gap-3 mt-4"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWrong}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 px-5"
                >
                  <X className="size-3.5 mr-1.5" /> Again
                </Button>
                <Button
                  size="sm"
                  onClick={handleCorrect}
                  className="bg-green-600 hover:bg-green-700 text-white px-5"
                >
                  <Check className="size-3.5 mr-1.5" /> Good
                </Button>
              </motion.div>
            )}

            {/* Keyboard hint */}
            {flipped && (
              <p className="text-center text-[10px] text-muted-foreground mt-2">
                &larr; Again &middot; Good &rarr;
              </p>
            )}
          </>
        ) : null}
      </div>
    </Card>
  );
}
