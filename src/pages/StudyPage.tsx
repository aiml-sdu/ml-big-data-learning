import { useState, useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import FlashcardDeck from '@/components/FlashcardDeck';
import ClozeText from '@/components/ClozeText';
import { useLeitnerBox } from '@/hooks/useLeitnerBox';
import { TOPIC_01_FLASHCARDS, TOPIC_01_CLOZE } from '@/data/study/topic-01-study';
import { TOPIC_02_FLASHCARDS, TOPIC_02_CLOZE } from '@/data/study/topic-02-study';
import { TOPIC_03_FLASHCARDS, TOPIC_03_CLOZE } from '@/data/study/topic-03-study';
import type { TopicId, Flashcard, ClozeTextExercise } from '@/types/study';

const ALL_FLASHCARDS: Flashcard[] = [
  ...TOPIC_01_FLASHCARDS,
  ...TOPIC_02_FLASHCARDS,
  ...TOPIC_03_FLASHCARDS,
];

const ALL_CLOZE: ClozeTextExercise[] = [
  ...TOPIC_01_CLOZE,
  ...TOPIC_02_CLOZE,
  ...TOPIC_03_CLOZE,
];

const TOPICS: { id: TopicId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Topics' },
  { id: 'topic-01', label: 'T1: Intro to AI' },
  { id: 'topic-02', label: 'T2: Agents' },
  { id: 'topic-03', label: 'T3: Uninformed' },
];

type Mode = 'flashcards' | 'cloze';

export default function StudyPage() {
  const [topicFilter, setTopicFilter] = useState<TopicId | 'all'>('all');
  const [mode, setMode] = useState<Mode>('flashcards');

  const { getProgress } = useLeitnerBox(ALL_FLASHCARDS);

  const filteredCards = useMemo(
    () => topicFilter === 'all' ? ALL_FLASHCARDS : ALL_FLASHCARDS.filter((c) => c.topicId === topicFilter),
    [topicFilter],
  );

  const filteredCloze = useMemo(
    () => topicFilter === 'all' ? ALL_CLOZE : ALL_CLOZE.filter((c) => c.topicId === topicFilter),
    [topicFilter],
  );

  return (
    <div className="prose">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="size-6 text-primary" />
        <h1 className="mb-0">Study Hub</h1>
      </div>
      <p className="lead">Master AI concepts for your exam with flashcards and fill-in-the-blank exercises.</p>

      {/* Progress Overview */}
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        {(['topic-01', 'topic-02', 'topic-03'] as TopicId[]).map((tid) => {
          const p = getProgress(tid);
          const label = tid === 'topic-01' ? 'Intro to AI' : tid === 'topic-02' ? 'Agents' : 'Uninformed Search';
          const pct = p.total ? (p.mastered / p.total) * 100 : 0;
          return (
            <Card key={tid} className="p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Topic {tid.slice(-1)}</p>
              <p className="text-sm font-semibold truncate">{label}</p>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-muted mt-2">
                {p.learning > 0 && <div className="bg-red-400" style={{ width: `${(p.learning / p.total) * 100}%` }} />}
                {p.reviewing > 0 && <div className="bg-amber-400" style={{ width: `${(p.reviewing / p.total) * 100}%` }} />}
                {p.mastered > 0 && <div className="bg-green-500" style={{ width: `${(p.mastered / p.total) * 100}%` }} />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{p.mastered}/{p.total} mastered ({Math.round(pct)}%)</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="not-prose space-y-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <Button
              key={t.id}
              variant={topicFilter === t.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTopicFilter(t.id)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'flashcards' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('flashcards')}
          >
            Flashcards
          </Button>
          <Button
            variant={mode === 'cloze' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('cloze')}
          >
            Fill in the Blanks
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="not-prose">
        {mode === 'flashcards' && (
          <FlashcardDeck
            cards={filteredCards}
            topicId={topicFilter === 'all' ? undefined : topicFilter}
          />
        )}
        {mode === 'cloze' && (
          filteredCloze.length > 0 ? (
            filteredCloze.map((ex) => <ClozeText key={ex.id} exercise={ex} />)
          ) : (
            <Card className="my-6">
              <CardContent className="py-8 text-center text-muted-foreground">
                No cloze exercises for this filter.
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
