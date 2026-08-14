import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LessonCardProps {
  title: string;
  sectionLabel?: string;
  children: ReactNode;
}

export default function LessonCard({ title, sectionLabel, children }: LessonCardProps) {
  return (
    <motion.div
      data-lesson-card
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col gap-4 scroll-mt-20"
    >
      {sectionLabel && (
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sectionLabel}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="prose dark:prose-invert max-w-none">{children}</div>
    </motion.div>
  );
}
