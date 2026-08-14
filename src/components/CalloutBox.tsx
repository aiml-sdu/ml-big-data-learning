import type { ReactNode } from 'react';
import { Info, AlertTriangle, Lightbulb, KeyRound } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

type CalloutType = 'info' | 'warning' | 'tip' | 'key-idea';

const ICONS: Record<CalloutType, ReactNode> = {
  info: <Info className="size-5" />,
  warning: <AlertTriangle className="size-5" />,
  tip: <Lightbulb className="size-5" />,
  'key-idea': <KeyRound className="size-5" />,
};

const DEFAULT_TITLES: Record<CalloutType, string> = {
  info: 'Note',
  warning: 'Warning',
  tip: 'Tip',
  'key-idea': 'Key Idea',
};

const STYLES: Record<CalloutType, string> = {
  info: 'border-[var(--color-info)] bg-[var(--color-info-light)] [&>svg]:text-[var(--color-info)]',
  warning: 'border-[var(--color-warning)] bg-[var(--color-warning-light)] [&>svg]:text-[var(--color-warning)]',
  tip: 'border-[var(--color-success)] bg-[var(--color-success-light)] [&>svg]:text-[var(--color-success)]',
  'key-idea': 'border-[var(--color-key-idea)] bg-[var(--color-key-idea-light)] [&>svg]:text-[var(--color-key-idea)]',
};

const TITLE_STYLES: Record<CalloutType, string> = {
  info: 'text-[var(--color-info-dark)]',
  warning: 'text-[var(--color-warning-dark)]',
  tip: 'text-[var(--color-success-dark)]',
  'key-idea': 'text-[var(--color-key-idea-dark)]',
};

interface CalloutBoxProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export default function CalloutBox({ type = 'info', title, children }: CalloutBoxProps) {
  return (
    <Alert className={cn('my-4 border-l-4', STYLES[type])}>
      {ICONS[type]}
      <AlertTitle className={cn('font-semibold', TITLE_STYLES[type])}>
        {title ?? DEFAULT_TITLES[type]}
      </AlertTitle>
      <AlertDescription className="mt-1 text-sm [&>p]:mb-2 [&>p:last-child]:mb-0">
        {children}
      </AlertDescription>
    </Alert>
  );
}
