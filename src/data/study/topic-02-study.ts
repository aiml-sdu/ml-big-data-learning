import type { Flashcard, ClozeTextExercise } from '@/types/study';

export const TOPIC_02_FLASHCARDS: Flashcard[] = [
  { id: 'fc-t02-01', topicId: 'topic-02', front: 'What is an agent?', back: 'Anything that perceives its environment through sensors and acts upon it through actuators.' },
  { id: 'fc-t02-02', topicId: 'topic-02', front: 'Agent function vs. agent program', back: 'The agent function is the abstract mathematical mapping from percept sequences to actions: $f : P^* \\to A$. The agent program is the concrete implementation running on hardware.' },
  { id: 'fc-t02-03', topicId: 'topic-02', front: 'What does PEAS stand for?', back: 'Performance measure, Environment, Actuators, Sensors — a framework for fully specifying a task environment for an agent.' },
  { id: 'fc-t02-04', topicId: 'topic-02', front: 'What is rationality (for agents)?', back: 'Selecting the action that maximizes the expected value of the performance measure, given the percept sequence so far and the agent\'s built-in knowledge.' },
  { id: 'fc-t02-05', topicId: 'topic-02', front: 'Fully observable vs. partially observable', back: 'Fully observable: sensors give access to the complete state at each time step (e.g., chess). Partially observable: some aspects of the state are hidden (e.g., poker, driving in fog).' },
  { id: 'fc-t02-06', topicId: 'topic-02', front: 'Deterministic vs. stochastic', back: 'Deterministic: the next state is completely determined by the current state and action. Stochastic: there is randomness — the outcome of an action is uncertain.' },
  { id: 'fc-t02-07', topicId: 'topic-02', front: 'Episodic vs. sequential', back: 'Episodic: each decision is independent (e.g., classifying images). Sequential: current decisions affect future states (e.g., chess, navigation).' },
  { id: 'fc-t02-08', topicId: 'topic-02', front: 'Static vs. dynamic', back: 'Static: environment doesn\'t change while the agent deliberates (e.g., crossword). Dynamic: environment changes over time (e.g., driving). Semi-dynamic: environment is static but the agent\'s score changes with time.' },
  { id: 'fc-t02-09', topicId: 'topic-02', front: 'Discrete vs. continuous', back: 'Discrete: finite number of distinct states, percepts, and actions (e.g., chess). Continuous: infinite range of values (e.g., robot arm position, temperature).' },
  { id: 'fc-t02-10', topicId: 'topic-02', front: 'Single-agent vs. multi-agent', back: 'Single-agent: only one agent acts (e.g., solving a puzzle). Multi-agent: multiple agents interact — can be competitive (chess) or cooperative (autonomous cars in traffic).' },
  { id: 'fc-t02-11', topicId: 'topic-02', front: 'Simple reflex agent', back: 'Selects actions based only on the current percept using condition-action rules (if percept then action). Has no memory — fails in partially observable environments.' },
  { id: 'fc-t02-12', topicId: 'topic-02', front: 'Model-based reflex agent', back: 'Maintains an internal model of the world to handle partial observability. Updates its state estimate based on percept history and knowledge of how the world evolves.' },
  { id: 'fc-t02-13', topicId: 'topic-02', front: 'Goal-based agent', back: 'Uses a goal (desired state) in addition to the world model to choose actions. Can plan ahead — considers "what will happen if I do X" and "does that achieve my goal?"' },
  { id: 'fc-t02-14', topicId: 'topic-02', front: 'Utility-based agent', back: 'Uses a utility function that maps states to real numbers (happiness). Can handle trade-offs and uncertainty — picks the action that maximizes expected utility.' },
  { id: 'fc-t02-15', topicId: 'topic-02', front: 'Learning agent', back: 'Has four components: learning element (improves), performance element (selects actions), critic (gives feedback), and problem generator (suggests exploratory actions).' },
  { id: 'fc-t02-16', topicId: 'topic-02', front: 'What is a percept sequence?', back: 'The complete history of everything the agent has perceived up to the current moment. The agent function maps these sequences to actions: $f : P^* \\to A$.' },
  { id: 'fc-t02-17', topicId: 'topic-02', front: 'Omniscience vs. rationality', back: 'An omniscient agent knows the actual outcome of its actions (impossible in practice). A rational agent maximizes expected performance given what it knows — rationality ≠ omniscience.' },
  { id: 'fc-t02-18', topicId: 'topic-02', front: 'What is autonomy (for agents)?', back: 'The degree to which an agent\'s behavior depends on its own experience rather than built-in knowledge. A fully autonomous agent learns entirely from its percepts.' },
  { id: 'fc-t02-19', topicId: 'topic-02', front: 'Why is the vacuum world useful?', back: 'It is a simple 2-cell environment that illustrates core agent concepts: percepts, actions, performance measures, and the difference between reflex and model-based agents.' },
  { id: 'fc-t02-20', topicId: 'topic-02', front: 'Known vs. unknown environment', back: 'Known: the agent has full knowledge of the rules/physics of the environment. Unknown: the agent must learn how the environment works. Orthogonal to observability.' },
];

export const TOPIC_02_CLOZE: ClozeTextExercise[] = [
  {
    id: 'cz-t02-01',
    topicId: 'topic-02',
    template: 'An agent perceives its environment through {{b1}} and acts upon it through {{b2}}. The abstract mapping $f : P^* \\to A$ is called the {{b3}}, while its concrete implementation is the {{b4}}.',
    blanks: [
      { id: 'b1', answer: 'sensors' },
      { id: 'b2', answer: 'actuators' },
      { id: 'b3', answer: 'agent function' },
      { id: 'b4', answer: 'agent program' },
    ],
    distractors: ['effectors', 'utility function', 'policy'],
  },
  {
    id: 'cz-t02-02',
    topicId: 'topic-02',
    template: 'PEAS stands for {{b1}}, Environment, {{b2}}, and Sensors. A rational agent selects actions that maximize the expected value of the {{b3}} given the percept sequence so far.',
    blanks: [
      { id: 'b1', answer: 'Performance measure' },
      { id: 'b2', answer: 'Actuators' },
      { id: 'b3', answer: 'performance measure' },
    ],
    distractors: ['Percepts', 'Actions', 'utility function', 'reward'],
  },
  {
    id: 'cz-t02-03',
    topicId: 'topic-02',
    template: 'In a {{b1}} observable environment, the agent can see the complete state. In a {{b2}} environment, the next state is fully determined by the current state and action. A {{b3}} environment does not change while the agent is deliberating.',
    blanks: [
      { id: 'b1', answer: 'fully' },
      { id: 'b2', answer: 'deterministic' },
      { id: 'b3', answer: 'static' },
    ],
    distractors: ['partially', 'stochastic', 'dynamic', 'episodic'],
  },
  {
    id: 'cz-t02-04',
    topicId: 'topic-02',
    template: 'A {{b1}} reflex agent uses condition-action rules on the current percept only. A {{b2}} reflex agent maintains an internal state to handle partial observability. A {{b3}}-based agent also considers future consequences by using a desired state, while a {{b4}}-based agent assigns numerical happiness values to states.',
    blanks: [
      { id: 'b1', answer: 'simple' },
      { id: 'b2', answer: 'model-based' },
      { id: 'b3', answer: 'goal' },
      { id: 'b4', answer: 'utility' },
    ],
    distractors: ['learning', 'reflex', 'planning'],
  },
  {
    id: 'cz-t02-05',
    topicId: 'topic-02',
    template: 'A {{b1}} agent has four components: a learning element, a {{b2}} element that selects actions, a critic that provides feedback, and a {{b3}} that suggests exploratory actions to discover new things.',
    blanks: [
      { id: 'b1', answer: 'learning' },
      { id: 'b2', answer: 'performance' },
      { id: 'b3', answer: 'problem generator' },
    ],
    distractors: ['utility', 'planning', 'model', 'sensor'],
  },
];
