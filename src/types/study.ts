export type TopicId = 'topic-01' | 'topic-02' | 'topic-03';
export type LeitnerBox = 1 | 2 | 3;

export interface Flashcard {
  id: string;
  topicId: TopicId;
  front: string;
  back: string;
}

export interface ClozeBlank {
  id: string;
  answer: string;
}

export interface ClozeTextExercise {
  id: string;
  topicId: TopicId;
  template: string;
  blanks: ClozeBlank[];
  distractors: string[];
}
