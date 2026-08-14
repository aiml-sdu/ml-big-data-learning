import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ExerciseCard from '@/components/ExerciseCard';
import StepChallenge, { type StepDef } from '@/components/StepChallenge';
import HintPanel from '@/components/HintPanel';

// ---------- Chat bubble component ----------

function ChatBubble({ role, text }: { role: 'judge' | 'subject'; text: string }) {
  const isJudge = role === 'judge';
  return (
    <div className={`flex ${isJudge ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`rounded-lg px-4 py-2.5 max-w-[80%] text-sm ${
        isJudge
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-foreground'
      }`}>
        <div className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">
          {isJudge ? 'Judge' : 'Subject'}
        </div>
        {text}
      </div>
    </div>
  );
}

// ---------- Shared judge step component ----------

interface Conversation {
  role: 'judge' | 'subject';
  text: string;
}

interface JudgeStepProps {
  conversation: Conversation[];
  correctIndex: number; // 0 = Human, 1 = Machine
  explanation: string;
  hints: { label: string; content: string }[];
  onComplete: () => void;
}

function JudgeStep({
  conversation,
  correctIndex,
  explanation,
  hints,
  onComplete,
}: JudgeStepProps) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const handleSubmit = useCallback(() => {
    if (answer === null) return;
    const isCorrect = answer === correctIndex;
    setSubmitted(true);
    setCorrect(isCorrect);
    if (isCorrect) {
      onComplete();
    } else {
      setWrongCount((c) => c + 1);
    }
  }, [answer, correctIndex, onComplete]);

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Read the conversation below and decide: is the subject a human or a machine?
      </p>

      <div className="rounded-lg border bg-background p-4 mb-4">
        {conversation.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} text={msg.text} />
        ))}
      </div>

      <p className="text-sm font-medium mb-2">Is the respondent a human or a machine?</p>

      <div className="flex gap-3 my-4">
        {['Human', 'Machine'].map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => { setAnswer(i); setSubmitted(false); }}
            disabled={correct}
            className={`flex-1 rounded-lg border px-4 py-3 text-sm font-semibold transition-all ${
              answer === i ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
            } ${correct && i === correctIndex ? 'border-green-500 bg-green-500/10' : ''}
              ${submitted && !correct && answer === i ? 'border-red-500 bg-red-500/10' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>

      <Button
        size="sm"
        className="h-8 text-xs"
        onClick={handleSubmit}
        disabled={answer === null || correct}
      >
        Check
      </Button>

      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${
            correct
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          }`}
        >
          {correct ? (
            <>
              <Check className="size-4" />
              Correct!
            </>
          ) : (
            <>
              <X className="size-4" />
              Not quite — try again.
            </>
          )}
        </motion.div>
      )}

      {correct && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="overflow-hidden"
        >
          <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm text-foreground leading-relaxed">
            {explanation}
          </div>
        </motion.div>
      )}

      {!correct && (
        <HintPanel hints={hints} failCount={wrongCount} />
      )}
    </div>
  );
}

// ---------- Step content components ----------

function Step1Content({ onComplete }: { onComplete: () => void }) {
  return (
    <JudgeStep
      conversation={[
        { role: 'judge', text: "What's your favorite childhood memory?" },
        { role: 'subject', text: 'I cherish the time my family went to the beach. The sound of waves was so peaceful.' },
        { role: 'judge', text: 'What did the sand feel like between your toes?' },
        { role: 'subject', text: 'Sand has a granular texture that varies based on mineral composition and moisture content.' },
      ]}
      correctIndex={1}
      explanation="Notice how the first answer sounds natural, but the follow-up question about sensory experience triggers a factual/encyclopedic response. A human would describe a feeling ('warm', 'gritty', 'ticklish'), not a textbook definition. This is a common giveaway — machines can mimic emotions in general but struggle with specific sensory details."
      hints={[
        { label: 'Nudge', content: 'Compare the tone of the first and second response.' },
        { label: 'Strategy', content: "The first answer is a plausible canned response. The second reveals the lack of actual experience — no one describes sand to a friend using 'mineral composition'." },
        { label: 'Answer', content: 'Machine — the encyclopedic response to a sensory question betrays the lack of genuine experience.' },
      ]}
      onComplete={onComplete}
    />
  );
}

function Step2Content({ onComplete }: { onComplete: () => void }) {
  return (
    <JudgeStep
      conversation={[
        { role: 'judge', text: 'Can you explain what gravity is?' },
        { role: 'subject', text: "Oh man, gravity... so basically things fall down right? Like I dropped my phone last week and cracked the screen, was so annoyed. But yeah it's like... the force that pulls stuff toward earth? Newton and the apple thing. I'm not a physicist though lol" },
        { role: 'judge', text: 'Is gravity the same on the Moon?' },
        { role: 'subject', text: "No it's way less! Like that's why astronauts bounce around. My kid loves watching those videos. I think it's like a sixth of Earth's? Something like that" },
      ]}
      correctIndex={0}
      explanation="This respondent's answers are messy, tangential, and full of personality — exactly how most humans actually talk. They reference personal anecdotes naturally (cracked phone, kid watching videos), hedge with uncertainty ('I think', 'something like that'), and use informal language ('lol', 'oh man'). Current AI tends to be more structured and informative, even when instructed to be casual."
      hints={[
        { label: 'Nudge', content: 'Would an AI typically volunteer a story about a cracked phone screen?' },
        { label: 'Strategy', content: 'Look for spontaneous tangents, genuine uncertainty, and casual imperfections.' },
        { label: 'Answer', content: 'Human — the natural tangents, personal anecdotes, and casual uncertainty are hallmarks of genuine human conversation.' },
      ]}
      onComplete={onComplete}
    />
  );
}

function Step3Content({ onComplete }: { onComplete: () => void }) {
  return (
    <JudgeStep
      conversation={[
        { role: 'judge', text: 'If you found a wallet on the street with $500 and an ID, what would you do?' },
        { role: 'subject', text: "I would return the wallet to its owner. It's the right thing to do. Honesty and integrity are important values that form the foundation of a functioning society." },
        { role: 'judge', text: 'Have you ever been tempted NOT to do the right thing?' },
        { role: 'subject', text: 'Yes, ethical dilemmas can be challenging. The tension between self-interest and moral obligation is a fundamental aspect of human experience. However, I believe that acting ethically ultimately leads to greater long-term satisfaction.' },
      ]}
      correctIndex={1}
      explanation="This is the Chinese Room in action. The subject produces perfectly 'correct' moral reasoning — but there's no person inside. Notice how it discusses 'the tension between self-interest and moral obligation' as an abstract concept rather than sharing a genuine moment of temptation. A human might say 'Honestly? When I was broke in college, I definitely hesitated...' The Chinese Room argument says: producing the right symbols doesn't mean understanding them. This subject manipulates ethical concepts flawlessly without any genuine moral experience."
      hints={[
        { label: 'Nudge', content: 'Does this person sound like they\'ve actually struggled with temptation?' },
        { label: 'Strategy', content: 'The answers are philosophically sophisticated but impersonal — they describe human experience from the outside, not the inside.' },
        { label: 'Answer', content: 'Machine — it describes ethics abstractly without genuine personal conflict, illustrating the Chinese Room: correct outputs without understanding.' },
      ]}
      onComplete={onComplete}
    />
  );
}

// ---------- Main export ----------

export default function Exercise3TuringJudge() {
  const steps: StepDef[] = [
    {
      id: 1,
      title: 'The Confident Deflector',
      content: (onComplete) => <Step1Content onComplete={onComplete} />,
    },
    {
      id: 2,
      title: 'The Rambling Storyteller',
      content: (onComplete) => <Step2Content onComplete={onComplete} />,
    },
    {
      id: 3,
      title: 'The Chinese Room Connection',
      content: (onComplete) => <Step3Content onComplete={onComplete} />,
    },
  ];

  return (
    <ExerciseCard exerciseId="lab-t01-ex3" number={3} title="Turing Test Judge" totalSteps={3}>
      <StepChallenge exerciseId="lab-t01-ex3" steps={steps} />
    </ExerciseCard>
  );
}
