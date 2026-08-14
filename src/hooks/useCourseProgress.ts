import { useSyncExternalStore } from 'react';
import { NAV_TOPICS } from '@/data/nav-topics';
import { subscribe } from './useSectionProgress';

export interface TopicProgress {
  visited: number;
  total: number;
  pct: number;
}

function getSnapshot(): Map<string, TopicProgress> {
  const map = new Map<string, TopicProgress>();
  for (const topic of NAV_TOPICS) {
    if (topic.locked || topic.sections.length === 0 || topic.countInProgress === false) continue;
    let visited = 0;
    for (const section of topic.sections) {
      if (localStorage.getItem(`visited-${topic.id}-${section.id}`)) visited++;
    }
    const total = topic.sections.length;
    map.set(topic.id, { visited, total, pct: total > 0 ? Math.round((visited / total) * 100) : 0 });
  }
  return map;
}

// Serialize for useSyncExternalStore equality check
function getSnapshotKey(): string {
  let key = '';
  for (const topic of NAV_TOPICS) {
    if (topic.locked || topic.sections.length === 0 || topic.countInProgress === false) continue;
    let visited = 0;
    for (const section of topic.sections) {
      if (localStorage.getItem(`visited-${topic.id}-${section.id}`)) visited++;
    }
    key += `${topic.id}:${visited},`;
  }
  return key;
}

export function useCourseProgress(): Map<string, TopicProgress> {
  // Use the key for change detection, but return the actual map
  useSyncExternalStore(subscribe, getSnapshotKey);
  return getSnapshot();
}

export function getTopicProgress(topicId: string): TopicProgress {
  const topic = NAV_TOPICS.find((t) => t.id === topicId);
  if (!topic || topic.sections.length === 0 || topic.countInProgress === false) return { visited: 0, total: 0, pct: 0 };
  let visited = 0;
  for (const section of topic.sections) {
    if (localStorage.getItem(`visited-${topic.id}-${section.id}`)) visited++;
  }
  const total = topic.sections.length;
  return { visited, total, pct: total > 0 ? Math.round((visited / total) * 100) : 0 };
}
