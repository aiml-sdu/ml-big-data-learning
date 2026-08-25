import { useCallback, useEffect, useState } from 'react';
import { courseStorageKey, readStorageJson, writeStorageJson } from '@/lib/courseStorage';

const STORAGE_KEY = courseStorageKey('course', 'progress');
const PROGRESS_EVENT = 'interactive-course-progress-change';

function readProgress(): string[] {
  if (typeof window === 'undefined') return [];

  return readStorageJson(STORAGE_KEY, (value) => (
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : null
  )) ?? [];
}

export function useCourseProgress() {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>(readProgress);

  useEffect(() => {
    const refresh = () => setCompletedSlugs(readProgress());
    window.addEventListener('storage', refresh);
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(PROGRESS_EVENT, refresh);
    };
  }, []);

  const setCompleted = useCallback((slug: string, completed: boolean) => {
    const current = readProgress();
    const next = completed
      ? Array.from(new Set([...current, slug]))
      : current.filter((item) => item !== slug);

    writeStorageJson(STORAGE_KEY, next);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  return {
    completedSlugs,
    isCompleted: (slug: string) => completedSlugs.includes(slug),
    setCompleted,
  };
}
