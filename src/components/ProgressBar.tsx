import { useEffect, useState, type RefObject } from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export default function ProgressBar({ scrollContainerRef }: ProgressBarProps) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const max = scrollHeight - clientHeight;
      setPct(max > 0 ? (scrollTop / max) * 100 : 0);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef]);

  return <Progress value={pct} className="h-1 rounded-none" />;
}
