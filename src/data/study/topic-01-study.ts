import type { Flashcard, ClozeTextExercise } from '@/types/study';

export const TOPIC_01_FLASHCARDS: Flashcard[] = [
  { id: 'fc-t01-01', topicId: 'topic-01', front: 'What is the Turing Test?', back: 'A test proposed by Alan Turing in 1950: a machine is intelligent if a human interrogator cannot reliably distinguish it from a human based on text conversation.' },
  { id: 'fc-t01-02', topicId: 'topic-01', front: 'What is the Chinese Room argument?', back: 'John Searle\'s thought experiment arguing that a system can manipulate symbols (syntax) without understanding meaning (semantics), challenging the claim that passing the Turing Test implies true understanding.' },
  { id: 'fc-t01-03', topicId: 'topic-01', front: 'What is a rational agent?', back: 'An entity that perceives its environment through sensors and acts through actuators to maximize its expected performance measure.' },
  { id: 'fc-t01-04', topicId: 'topic-01', front: 'Narrow AI vs. General AI (AGI)', back: 'Narrow AI excels at a single task (e.g., chess, image recognition). AGI would match or exceed human-level intelligence across all cognitive domains — it does not yet exist.' },
  { id: 'fc-t01-05', topicId: 'topic-01', front: 'What was the first "AI Winter"?', back: 'A period in the 1970s when funding and interest in AI dropped sharply after early systems failed to scale beyond toy problems, leading to disillusionment.' },
  { id: 'fc-t01-06', topicId: 'topic-01', front: 'What is ELIZA?', back: 'An early (1966) chatbot by Joseph Weizenbaum that used pattern-matching rules to simulate a Rogerian therapist. It demonstrated the "ELIZA effect" — people attributing intelligence to simple programs.' },
  { id: 'fc-t01-07', topicId: 'topic-01', front: 'Name the four approaches to AI', back: '1) Thinking Humanly (cognitive modeling), 2) Thinking Rationally (laws of thought), 3) Acting Humanly (Turing Test), 4) Acting Rationally (rational agent).' },
  { id: 'fc-t01-08', topicId: 'topic-01', front: 'What is the "Acting Rationally" approach?', back: 'Building agents that act to achieve the best expected outcome. This is the approach modern AI courses (including this one) adopt — it doesn\'t require perfect rationality, just best-effort given resources.' },
  { id: 'fc-t01-09', topicId: 'topic-01', front: 'What is machine learning?', back: 'A subfield of AI where systems learn patterns from data instead of being explicitly programmed, improving performance on a task through experience.' },
  { id: 'fc-t01-10', topicId: 'topic-01', front: 'What sparked the deep learning revolution (~2012)?', back: 'AlexNet\'s decisive victory in the ImageNet competition, enabled by GPUs, large datasets, and deep convolutional neural networks.' },
  { id: 'fc-t01-11', topicId: 'topic-01', front: 'What is the "Thinking Humanly" approach?', back: 'Building systems that think like humans — uses cognitive science to model human reasoning. Example: GPS (General Problem Solver).' },
  { id: 'fc-t01-12', topicId: 'topic-01', front: 'What is the "Thinking Rationally" approach?', back: 'Building systems that think using formal logic (the "laws of thought"). Challenge: not all knowledge is easily formalized, and logical inference is computationally expensive.' },
  { id: 'fc-t01-13', topicId: 'topic-01', front: 'What was the Dartmouth Conference (1956)?', back: 'The summer workshop where the term "Artificial Intelligence" was coined. McCarthy, Minsky, Shannon, and Rochester proposed that "every aspect of learning or any other feature of intelligence can be so precisely described that a machine can be made to simulate it."' },
  { id: 'fc-t01-14', topicId: 'topic-01', front: 'What is the knowledge representation problem?', back: 'The challenge of encoding real-world knowledge in a form that a computer can use for reasoning — a core requirement for intelligent behavior.' },
  { id: 'fc-t01-15', topicId: 'topic-01', front: 'What is an expert system?', back: 'A 1980s AI system that encodes domain expert knowledge as if-then rules. Examples: MYCIN (medical diagnosis), R1/XCON (computer configuration). Led to a brief commercial AI boom.' },
  { id: 'fc-t01-16', topicId: 'topic-01', front: 'What is the "Total Turing Test"?', back: 'An extension of the Turing Test that also requires computer vision (to perceive objects) and robotics (to manipulate objects), testing physical as well as linguistic intelligence.' },
  { id: 'fc-t01-17', topicId: 'topic-01', front: 'Weak AI vs. Strong AI', back: 'Weak AI: machines simulate intelligence (useful tools). Strong AI: machines actually possess minds, consciousness, and understanding. The Chinese Room argues against Strong AI.' },
  { id: 'fc-t01-18', topicId: 'topic-01', front: 'What caused the second AI Winter (~late 1980s)?', back: 'The collapse of the expert systems market — maintaining hand-coded rules was expensive, brittle, and didn\'t scale. Combined with the fall of specialized AI hardware (Lisp machines).' },
  { id: 'fc-t01-19', topicId: 'topic-01', front: 'What is natural language processing (NLP)?', back: 'The subfield of AI concerned with enabling computers to understand, interpret, and generate human language.' },
  { id: 'fc-t01-20', topicId: 'topic-01', front: 'Why does this course focus on the rational agent approach?', back: 'It is more general than the other three approaches: it doesn\'t depend on human behavior as a benchmark, avoids the brittleness of pure logic, and provides a clear performance metric.' },
];

export const TOPIC_01_CLOZE: ClozeTextExercise[] = [
  {
    id: 'cz-t01-01',
    topicId: 'topic-01',
    template: 'The {{b1}} proposed that a machine is intelligent if a human cannot distinguish it from another human in a text-based conversation. John Searle\'s {{b2}} argument challenges this by showing a system can manipulate {{b3}} without genuine understanding.',
    blanks: [
      { id: 'b1', answer: 'Turing Test' },
      { id: 'b2', answer: 'Chinese Room' },
      { id: 'b3', answer: 'symbols' },
    ],
    distractors: ['ELIZA effect', 'neurons', 'logic'],
  },
  {
    id: 'cz-t01-02',
    topicId: 'topic-01',
    template: 'The four approaches to AI are organized along two axes: {{b1}} vs. acting, and humanly vs. {{b2}}. This course follows the {{b3}} approach — building agents that act to maximize expected {{b4}}.',
    blanks: [
      { id: 'b1', answer: 'thinking' },
      { id: 'b2', answer: 'rationally' },
      { id: 'b3', answer: 'rational agent' },
      { id: 'b4', answer: 'performance' },
    ],
    distractors: ['learning', 'logically', 'speed'],
  },
  {
    id: 'cz-t01-03',
    topicId: 'topic-01',
    template: 'The term "Artificial Intelligence" was coined at the {{b1}} in 1956. The first AI winter occurred in the {{b2}} when early systems failed to scale beyond {{b3}} problems.',
    blanks: [
      { id: 'b1', answer: 'Dartmouth Conference' },
      { id: 'b2', answer: '1970s' },
      { id: 'b3', answer: 'toy' },
    ],
    distractors: ['MIT Symposium', '1960s', 'logic', '1990s'],
  },
  {
    id: 'cz-t01-04',
    topicId: 'topic-01',
    template: '{{b1}} AI excels at a single specific task, while {{b2}} would match human-level intelligence across all domains. Today\'s most capable AI systems — including large language models — are still classified as {{b3}} AI.',
    blanks: [
      { id: 'b1', answer: 'Narrow' },
      { id: 'b2', answer: 'AGI' },
      { id: 'b3', answer: 'Narrow' },
    ],
    distractors: ['Strong', 'Weak', 'General'],
  },
  {
    id: 'cz-t01-05',
    topicId: 'topic-01',
    template: 'In the 1980s, {{b1}} encoded domain knowledge as if-then rules and were commercially successful until their {{b2}} nature made them expensive to maintain. The deep learning revolution was sparked around 2012 by {{b3}} winning the ImageNet competition.',
    blanks: [
      { id: 'b1', answer: 'expert systems' },
      { id: 'b2', answer: 'brittle' },
      { id: 'b3', answer: 'AlexNet' },
    ],
    distractors: ['neural networks', 'flexible', 'GPT', 'ELIZA'],
  },
];
