import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Bit = 0 | 1;
const DEFAULT_P1: Bit[] = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
const DEFAULT_P2: Bit[] = [0, 1, 0, 0, 1, 1, 0, 1, 0, 0];
const NUM_BITS = 10;

function randomBits(): Bit[] {
  return Array.from({ length: NUM_BITS }, () => (Math.random() < 0.5 ? 0 : 1) as Bit);
}

function BitCell({ value, source, colored }: { value: Bit; source: 'p1' | 'p2'; colored: boolean }) {
  const colorClass = colored
    ? source === 'p1' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
    : source === 'p1' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 ring-1 ring-blue-500/40'
                      : 'bg-orange-500/20 text-orange-600 dark:text-orange-300 ring-1 ring-orange-500/40';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn('flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold font-mono select-none', colorClass)}
    >
      {value}
    </motion.div>
  );
}

function Divider({ position, active, onClick }: { position: number; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={`Crossover at position ${position}`}
      className="group relative flex h-10 w-4 flex-shrink-0 items-center justify-center transition-all hover:w-6">
      <span className={cn(
        'absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full transition-all',
        active ? 'bg-red-500 opacity-100' : 'bg-[var(--viz-border)] opacity-40 group-hover:bg-red-400 group-hover:opacity-80',
      )} />
    </button>
  );
}

export default function GACrossoverDiagramViz() {
  const [crossoverPoint, setCrossoverPoint] = useState(5);
  const [parents, setParents] = useState({ p1: DEFAULT_P1, p2: DEFAULT_P2 });

  const handleRandomize = useCallback(() => {
    setParents({ p1: randomBits(), p2: randomBits() });
  }, []);

  const k = crossoverPoint;
  const child1: Bit[] = [...parents.p1.slice(0, k), ...parents.p2.slice(k)];
  const child1Src: ('p1' | 'p2')[] = [...Array<'p1'>(k).fill('p1'), ...Array<'p2'>(NUM_BITS - k).fill('p2')];
  const child2: Bit[] = [...parents.p2.slice(0, k), ...parents.p1.slice(k)];
  const child2Src: ('p1' | 'p2')[] = [...Array<'p2'>(k).fill('p2'), ...Array<'p1'>(NUM_BITS - k).fill('p1')];

  const renderRow = (bits: Bit[], parentId: 'p1' | 'p2', withDividers: boolean) => (
    <div className="flex items-center">
      {bits.map((bit, i) => (
        <div key={i} className="flex items-center">
          <BitCell value={bit} source={parentId} colored={false} />
          {withDividers && i < NUM_BITS - 1 && (
            <Divider position={i + 1} active={crossoverPoint === i + 1} onClick={() => setCrossoverPoint(i + 1)} />
          )}
        </div>
      ))}
    </div>
  );

  const renderChildRow = (bits: Bit[], sources: ('p1' | 'p2')[]) => (
    <div className="flex items-center gap-1">
      <AnimatePresence mode="popLayout">
        {bits.map((bit, i) => (
          <BitCell key={`${sources[i]}-${i}-${bit}`} value={bit} source={sources[i]} colored />
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="rounded-lg border bg-[var(--viz-bg)] p-4 my-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Single-Point Crossover</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Click between bits to set the crossover point</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRandomize} className="gap-1.5 text-xs">
          <Shuffle className="size-3.5" /> Randomize
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-blue-500" /> Parent 1</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-sm bg-orange-500" /> Parent 2</span>
      </div>

      <div className="overflow-x-auto pb-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-18 flex-shrink-0 text-xs font-semibold text-blue-500">Parent 1</span>
          {renderRow(parents.p1, 'p1', true)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-18 flex-shrink-0 text-xs font-semibold text-orange-500">Parent 2</span>
          {renderRow(parents.p2, 'p2', true)}
        </div>

        <div className="flex items-center gap-2 py-1">
          <span className="w-18 flex-shrink-0" />
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-500 ring-1 ring-red-500/25">
            <Scissors className="size-3.5" /> Crossover at position {crossoverPoint}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="w-18 flex-shrink-0 text-xs font-semibold text-muted-foreground">Child 1</span>
          {renderChildRow(child1, child1Src)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-18 flex-shrink-0 text-xs font-semibold text-muted-foreground">Child 2</span>
          {renderChildRow(child2, child2Src)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="font-semibold mb-0.5">Child 1</p>
          <p className="text-muted-foreground"><span className="text-blue-500">P1[0–{k - 1}]</span> + <span className="text-orange-500">P2[{k}–9]</span></p>
        </div>
        <div className="rounded-md bg-muted/50 px-3 py-2">
          <p className="font-semibold mb-0.5">Child 2</p>
          <p className="text-muted-foreground"><span className="text-orange-500">P2[0–{k - 1}]</span> + <span className="text-blue-500">P1[{k}–9]</span></p>
        </div>
      </div>
    </div>
  );
}
