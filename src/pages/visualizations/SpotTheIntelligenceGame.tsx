import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Timer, Trophy, RotateCcw } from 'lucide-react';

type Verdict = 'ai' | 'not-ai' | 'ambiguous';

interface GameCard {
  description: string;
  answer: Verdict;
  explanation: string;
}

const CARDS: GameCard[] = [
  { description: 'A spam filter that learns which emails you mark as junk', answer: 'ai', explanation: 'It learns from your feedback to improve classification — a textbook ML system.' },
  { description: 'A washing machine with preset cycles (delicate, heavy, quick)', answer: 'not-ai', explanation: 'Preset cycles follow fixed rules with no perception or adaptation.' },
  { description: 'A thermostat that maintains a set temperature', answer: 'ambiguous', explanation: 'A simple thermostat just reacts (not AI), but a smart thermostat that learns your schedule could be. It depends on your definition!' },
  { description: 'A voice assistant that answers your questions', answer: 'ai', explanation: 'It uses NLP and knowledge retrieval — core AI capabilities.' },
  { description: 'A calculator app on your phone', answer: 'not-ai', explanation: 'It applies fixed mathematical rules with no learning or perception.' },
  { description: 'A recommendation engine suggesting your next TV show', answer: 'ai', explanation: 'It analyzes your viewing patterns and predicts preferences — machine learning at work.' },
  { description: 'A traffic light on a fixed timer', answer: 'not-ai', explanation: 'Fixed-timer lights follow a predetermined sequence with no sensing or adaptation.' },
  { description: 'A self-driving car navigating city streets', answer: 'ai', explanation: 'It perceives the environment (cameras, lidar) and makes complex driving decisions.' },
  { description: 'A chess engine that evaluates millions of positions per second', answer: 'ai', explanation: 'It searches through a game tree and evaluates positions — the acting rationally approach.' },
  { description: 'An elevator that goes to the floor you press', answer: 'not-ai', explanation: 'It simply responds to button presses with no learning or intelligent decision-making.' },
  { description: 'A chatbot that passes the Turing Test', answer: 'ai', explanation: 'Fooling a human evaluator requires NLP, knowledge, reasoning, and learning.' },
  { description: 'Autocomplete that predicts your next word as you type', answer: 'ai', explanation: 'It uses language models to predict probable next words — a core NLP task.' },
  { description: 'A vending machine that dispenses the item you select', answer: 'not-ai', explanation: 'It maps button presses to mechanical actions with no intelligence.' },
  { description: 'A robot vacuum that maps your house and avoids obstacles', answer: 'ai', explanation: 'It perceives its environment (sensors) and plans paths — a rational agent.' },
  { description: 'A spreadsheet formula that computes a sum', answer: 'not-ai', explanation: 'Formulas are fixed computations — no learning, perception, or decision-making.' },
  { description: 'A fraud detection system at your bank', answer: 'ai', explanation: 'It learns patterns of legitimate vs. fraudulent transactions and flags anomalies.' },
  { description: 'A search engine ranking results for your query', answer: 'ai', explanation: 'It uses ML models to understand queries and rank billions of pages by relevance.' },
  { description: 'A digital alarm clock that beeps at 7 AM', answer: 'not-ai', explanation: 'It follows a single fixed rule — beep at the set time. No intelligence involved.' },
  { description: 'A medical system that reads X-rays and flags potential tumors', answer: 'ai', explanation: 'It perceives images and makes diagnostic judgments — AI in healthcare.' },
  { description: 'A Roomba that randomly bounces off walls', answer: 'ambiguous', explanation: 'Random movement with simple bump sensors is barely intelligent. But it does perceive and act! Depends on where you draw the line.' },
  { description: 'An expert system that diagnoses car engine problems using if-then rules', answer: 'ambiguous', explanation: 'It reasons logically (thinking rationally) but uses hand-coded rules with no learning. Some say AI, some say just software.' },
  { description: 'A face recognition system that unlocks your phone', answer: 'ai', explanation: 'It uses computer vision and pattern recognition — perceives faces and acts.' },
  { description: 'A music player that shuffles songs randomly', answer: 'not-ai', explanation: 'Random shuffling requires no intelligence — just a random number generator.' },
  { description: 'A GPS that recalculates your route when you miss a turn', answer: 'ambiguous', explanation: 'It perceives (location) and acts (reroutes), using search algorithms. But is pathfinding really "intelligence"? Many argue yes, some say it\'s just computation.' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'splash' | 'playing' | 'results';

const GAME_DURATION = 60;

export default function SpotTheIntelligenceGame() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [deck, setDeck] = useState<GameCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [, setMistakes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'ambiguous'; explanation: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCard = deck[currentIndex] ?? null;
  const total = currentIndex;

  const startGame = useCallback(() => {
    setDeck(shuffle(CARDS));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setMistakes(0);
    setTimeLeft(GAME_DURATION);
    setFeedback(null);
    setPhase('playing');
  }, []);

  // Timer
  useEffect(() => {
    if (phase !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('results');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('results');
  }, []);

  const advanceCard = useCallback(() => {
    setFeedback(null);
    setCurrentIndex((i) => {
      if (i + 1 >= deck.length) {
        endGame();
        return i;
      }
      return i + 1;
    });
  }, [deck.length, endGame]);

  const handleAnswer = useCallback((playerSays: 'ai' | 'not-ai') => {
    if (!currentCard || feedback) return;

    if (currentCard.answer === 'ambiguous') {
      // Ambiguous cards are always "correct"
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setFeedback({ type: 'ambiguous', explanation: currentCard.explanation });
    } else if (playerSays === currentCard.answer) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setFeedback({ type: 'correct', explanation: currentCard.explanation });
    } else {
      setMistakes((m) => m + 1);
      setStreak(0);
      setFeedback({ type: 'wrong', explanation: currentCard.explanation });
    }

    // Auto-advance after showing feedback
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    const delay = currentCard.answer === 'ambiguous' ? 2000 : 1200;
    feedbackTimeoutRef.current = setTimeout(advanceCard, delay);
  }, [currentCard, feedback, advanceCard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // Confetti on results with high score
  useEffect(() => {
    if (phase === 'results' && total > 0 && score / total >= 0.8) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }, [phase, score, total]);

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Speed indicator based on streak
  const cardSpeed = streak >= 6 ? 'fast' : streak >= 3 ? 'medium' : 'normal';

  return (
    <div className="not-prose my-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Spot the Intelligence
        </h3>
        {phase !== 'splash' && (
          <button
            onClick={() => { setPhase('splash'); if (timerRef.current) clearInterval(timerRef.current); }}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Splash screen */}
      {phase === 'splash' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <p className="text-center text-muted-foreground max-w-md">
            Cards will describe different systems. Classify each as <strong>AI</strong> or{' '}
            <strong>Not AI</strong> before time runs out. Some cards are deliberately
            ambiguous — that&rsquo;s the point!
          </p>
          <p className="text-sm text-muted-foreground">
            <Timer size={14} className="inline mr-1" />
            60 seconds &bull; Speed increases with streaks
          </p>
          <button
            onClick={startGame}
            className="rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            GO!
          </button>
        </div>
      )}

      {/* Playing */}
      {phase === 'playing' && currentCard && (
        <div>
          {/* Timer bar */}
          <div className="mb-3 flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Timer size={14} />
              <span className={timeLeft <= 10 ? 'text-red-500 font-semibold' : ''}>
                {timeLeft}s
              </span>
            </div>
            <span>Score: {score}</span>
            <span>Streak: {streak}</span>
            {cardSpeed !== 'normal' && (
              <span className={cardSpeed === 'fast' ? 'text-red-500 font-semibold' : 'text-yellow-500'}>
                {cardSpeed === 'fast' ? 'FAST!' : 'Speeding up...'}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4 h-1.5 w-full rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${(timeLeft / GAME_DURATION) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="mb-4 rounded-lg border border-border bg-muted/30 p-6 text-center"
            >
              <p className="text-lg font-medium text-foreground">
                {currentCard.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-3 rounded-md border px-3 py-2 text-sm ${
                  feedback.type === 'correct'
                    ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                    : feedback.type === 'ambiguous'
                      ? 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200'
                      : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                }`}
              >
                {feedback.type === 'correct' && '✓ Correct! '}
                {feedback.type === 'wrong' && '✗ Not quite! '}
                {feedback.type === 'ambiguous' && '⚡ Depends on your definition! '}
                {feedback.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleAnswer('ai')}
              disabled={!!feedback}
              className="flex-1 rounded-lg border-2 border-blue-400 bg-blue-50 px-4 py-3 text-lg font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
            >
              AI
            </button>
            <button
              onClick={() => handleAnswer('not-ai')}
              disabled={!!feedback}
              className="flex-1 rounded-lg border-2 border-gray-400 bg-gray-50 px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Not AI
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {phase === 'results' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
            <Trophy size={20} />
            <span>Time&rsquo;s up!</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-4">
            <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{score}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{maxStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{total}</div>
              <div className="text-xs text-muted-foreground">Cards Seen</div>
            </div>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <strong>Key insight:</strong> Some systems are clearly AI, others clearly aren&rsquo;t —
            but the boundary is fuzzy. Even experts disagree! That&rsquo;s why the textbook defines
            four different approaches: thinking humanly, thinking rationally, acting humanly, and
            acting rationally.
          </div>

          <button
            onClick={startGame}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
