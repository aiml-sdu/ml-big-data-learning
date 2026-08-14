import { cn } from '@/lib/utils';
import type { LessonCardDef, CardSection } from '@/data/topic-04-cards';

interface LessonProgressBarProps {
  cards: LessonCardDef[];
  sections: CardSection[];
  currentIndex: number;
  completedSet: Set<string>;
  maxUnlockedIndex: number;
  onJump: (index: number) => void;
}

export default function LessonProgressBar({
  cards,
  sections,
  currentIndex,
  completedSet,
  maxUnlockedIndex,
  onJump,
}: LessonProgressBarProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap px-1 py-2">
      {sections.map((section, si) => (
        <div key={section.id} className="flex items-center gap-1">
          {si > 0 && <div className="w-px h-4 bg-border mx-0.5" />}
          <SectionGroup
            cards={cards}
            section={section}
            currentIndex={currentIndex}
            completedSet={completedSet}
            maxUnlockedIndex={maxUnlockedIndex}
            onJump={onJump}
          />
        </div>
      ))}
    </div>
  );
}

function SectionGroup({
  cards,
  section,
  currentIndex,
  completedSet,
  maxUnlockedIndex,
  onJump,
}: {
  cards: LessonCardDef[];
  section: CardSection;
  currentIndex: number;
  completedSet: Set<string>;
  maxUnlockedIndex: number;
  onJump: (index: number) => void;
}) {
  const [start, end] = section.cardRange;

  return (
    <div className="flex items-center gap-0.5" title={section.label}>
      {Array.from({ length: end - start + 1 }, (_, i) => {
        const cardIdx = start + i;
        const card = cards[cardIdx];
        const isCurrent = cardIdx === currentIndex;
        const isCompleted = completedSet.has(card.id);
        const isLocked = cardIdx > maxUnlockedIndex;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onJump(cardIdx)}
            disabled={isLocked}
            aria-label={`${card.title}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
            className={cn(
              'size-2.5 rounded-full transition-all duration-200',
              isCurrent && 'size-3 ring-2 ring-primary ring-offset-1 ring-offset-background',
              isCompleted && !isCurrent && 'bg-primary',
              !isCompleted && !isCurrent && 'bg-muted-foreground/25',
              isCurrent && isCompleted && 'bg-primary',
              isCurrent && !isCompleted && 'bg-primary animate-pulse',
              isLocked && 'cursor-not-allowed opacity-35',
            )}
          />
        );
      })}
    </div>
  );
}
