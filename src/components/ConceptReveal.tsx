import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ConceptCard {
  title: string;
  brief: string;
  detail: string;
  icon?: string;
}

interface ConceptRevealProps {
  cards: ConceptCard[];
}

export default function ConceptReveal({ cards }: ConceptRevealProps) {
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const toggle = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      {cards.map((card, i) => {
        const isRevealed = revealed.has(i);
        return (
          <motion.div key={i} whileTap={{ scale: 0.97 }}>
            <Card
              className={cn(
                'cursor-pointer p-4 transition-colors h-full',
                isRevealed ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50',
              )}
              role="button"
              tabIndex={0}
              aria-expanded={isRevealed}
              onClick={() => toggle(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(i); }
              }}
            >
              {!isRevealed ? (
                <div className="space-y-2">
                  {card.icon && <span className="text-2xl">{card.icon}</span>}
                  <h4 className="font-semibold">{card.title}</h4>
                  <p className="text-sm text-muted-foreground">{card.brief}</p>
                  <span className="text-xs text-primary font-medium">Click to reveal</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {card.icon && <span className="text-2xl">{card.icon}</span>}
                  <h4 className="font-semibold">{card.title}</h4>
                  <p className="text-sm">{card.detail}</p>
                </div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
