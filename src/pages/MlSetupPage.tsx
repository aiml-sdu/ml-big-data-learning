import { useCallback, useState, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import CodeBlock from '@/components/CodeBlock';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CARDS, QUIZ_SETUP, SECTIONS } from '@/data/ml-setup-cards';

interface SetupChoiceOption {
  id: string;
  label: string;
  detail?: string;
  correct: boolean;
  explanation: string;
}

interface SetupChoiceExerciseProps {
  prompt: string;
  options: SetupChoiceOption[];
  onComplete: () => void;
  reveal?: ReactNode;
}

function SetupChoiceExercise({ prompt, options, onComplete, reveal }: SetupChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const choice = options.find((option) => option.id === selected);
  const correct = !!choice?.correct;

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    if (correct) {
      setTimeout(onComplete, 350);
    }
  };

  return (
    <div className="space-y-4">
      <p>{prompt}</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => !submitted && setSelected(option.id)}
            disabled={submitted}
            className={cn(
              'rounded-xl border p-4 text-left transition-colors',
              selected === option.id && !submitted && 'border-primary bg-primary/5',
              submitted && option.correct && 'border-green-500 bg-green-500/10',
              submitted && selected === option.id && !option.correct && 'border-red-500 bg-red-500/10',
              !submitted && selected !== option.id && 'hover:bg-muted/50',
            )}
          >
            <div className="font-mono text-sm font-medium">{option.label}</div>
            {option.detail && (
              <div className="mt-1 text-sm text-muted-foreground">{option.detail}</div>
            )}
          </button>
        ))}
      </div>
      {!submitted ? (
        <Button size="sm" onClick={handleSubmit} disabled={!selected}>
          Check
        </Button>
      ) : (
        <div className="space-y-2">
          <div
            className={cn(
              'rounded-lg px-3 py-2 text-sm',
              correct
                ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 text-red-700 dark:text-red-300',
            )}
          >
            {choice?.explanation}
          </div>
          {correct && reveal}
          {!correct && (
            <Button size="sm" variant="outline" onClick={() => setSubmitted(false)}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MlSetupPage() {
  const renderCard = useCallback((index: number, onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
      case 'SetupIntro':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              This page is only for getting an <strong>ML notebook</strong> running cleanly on your own machine.
              The goal is simple: create one isolated environment, install the notebook tools once, and open the right kernel.
            </p>
            <CalloutBox type="info" title="Before You Start">
              <p>
                If students do not already have the <strong>`conda`</strong> command, they should install a lightweight Conda distribution first, such as <strong>Miniforge</strong> or <strong>Miniconda</strong>, before continuing with the steps below.
              </p>
            </CalloutBox>
            <CalloutBox type="key-idea" title="Why Conda Here?">
              <p>
                Conda keeps the notebook dependencies separated from your base Python setup, so you can experiment without breaking other projects.
              </p>
            </CalloutBox>
            <CalloutBox type="info" title="Colab First">
              <p>
                If students are using Google Colab, they can skip this page. This setup is only for running the notebook locally.
              </p>
            </CalloutBox>
            <p>
              If you want a short shell refresher first, the best external reference here is
              {' '}
              <a href="https://missing.csail.mit.edu" target="_blank" rel="noreferrer">
                Missing Semester
              </a>
              . Stay focused on the environment workflow only.
            </p>
          </LessonCard>
        );

      case 'ChooseSafeSetup':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SetupChoiceExercise
              prompt="Where should you install the notebook dependencies?"
              options={[
                {
                  id: 'new-env',
                  label: 'A new conda environment',
                  detail: 'Keeps the notebook isolated from other Python work',
                  correct: true,
                  explanation: 'Correct. A dedicated environment is the clean, reversible setup for this notebook.',
                },
                {
                  id: 'base',
                  label: 'The base conda environment',
                  detail: 'Mixes lab packages into your default Python',
                  correct: false,
                  explanation: 'Base is convenient in the short term, but it creates dependency drift across projects.',
                },
                {
                  id: 'system',
                  label: 'Your system Python',
                  detail: 'Least isolated and hardest to debug later',
                  correct: false,
                  explanation: 'System Python is the least controlled option. It is exactly what conda environments help you avoid.',
                },
              ]}
              onComplete={onComplete}
            />
          </LessonCard>
        );

      case 'CreateEnvCommand':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SetupChoiceExercise
              prompt="Which command creates the dedicated environment for this notebook?"
              options={[
                {
                  id: 'create',
                  label: 'conda create -n ai101-ml python=3.12 -y',
                  correct: true,
                  explanation: 'Correct. This creates a fresh environment named `ai101-ml` with Python 3.12, which matches the notebook setup cell.',
                },
                {
                  id: 'activate',
                  label: 'conda activate ai101-ml',
                  correct: false,
                  explanation: 'That activates an environment after it exists. It does not create one.',
                },
                {
                  id: 'install',
                  label: 'conda install ai101-ml python=3.12',
                  correct: false,
                  explanation: 'That is not the conda command for creating a named environment.',
                },
              ]}
              onComplete={onComplete}
              reveal={<CodeBlock language="bash" code="conda create -n ai101-ml python=3.12 -y" />}
            />
          </LessonCard>
        );

      case 'ActivateEnvCommand':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SetupChoiceExercise
              prompt="After creation, how do you enter the environment?"
              options={[
                {
                  id: 'activate',
                  label: 'conda activate ai101-ml',
                  correct: true,
                  explanation: 'Correct. Activation switches your shell into the environment so installs and notebook kernels land in the right place.',
                },
                {
                  id: 'open',
                  label: 'conda open ai101-ml',
                  correct: false,
                  explanation: 'There is no `conda open` command for environments.',
                },
                {
                  id: 'run',
                  label: 'python ai101-ml',
                  correct: false,
                  explanation: 'That does not activate an environment. You need `conda activate`.',
                },
              ]}
              onComplete={onComplete}
              reveal={<CodeBlock language="bash" code="conda activate ai101-ml" />}
            />
          </LessonCard>
        );

      case 'InstallToolsCommand':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SetupChoiceExercise
              prompt="Which command installs the notebook stack inside the active environment?"
              options={[
                {
                  id: 'install-tools',
                  label: 'conda install jupyterlab ipykernel numpy pandas matplotlib seaborn scikit-learn',
                  correct: true,
                  explanation: 'Correct. That covers the core packages used in the course ML notebooks.',
                },
                {
                  id: 'python-run',
                  label: 'python lab1_classification_handout.ipynb',
                  correct: false,
                  explanation: 'That tries to execute the notebook file directly, which is not how Jupyter notebooks are launched.',
                },
                {
                  id: 'clone-env',
                  label: 'conda clone ai101-ml jupyterlab',
                  correct: false,
                  explanation: 'Cloning is unrelated here. You just need to install the required packages into the active environment.',
                },
              ]}
              onComplete={onComplete}
              reveal={
                <CodeBlock
                  language="bash"
                  code="conda install jupyterlab ipykernel numpy pandas matplotlib seaborn scikit-learn"
                />
              }
            />
          </LessonCard>
        );

      case 'KernelRegistration':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <p>
              Register the environment as a notebook kernel once, then Jupyter can find it by name every time.
            </p>
            <CodeBlock
              language="bash"
              code={'python -m ipykernel install --user --name ai101-ml --display-name "Python (ai101-ml)"'}
            />
            <CalloutBox type="tip" title="Keep the Name Human-Readable">
              <p>
                The display name is what students click in Jupyter. Use something obvious like <strong>Python (ai101-ml)</strong> so there is no ambiguity.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'LaunchNotebook':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <SetupChoiceExercise
              prompt="After activation and installation, what is the right next step?"
              options={[
                {
                  id: 'launch',
                  label: 'cd ai101-ml/lab1-classification && jupyter lab',
                  correct: true,
                  explanation: 'Correct. Open JupyterLab from the lab folder, then choose the `Python (ai101-ml)` kernel for the notebook.',
                },
                {
                  id: 'wrong-kernel',
                  label: 'Open the notebook in base and hope the packages match',
                  correct: false,
                  explanation: 'That defeats the point of isolating the lab environment.',
                },
                {
                  id: 'direct-python',
                  label: 'python lab1_classification_handout.ipynb',
                  correct: false,
                  explanation: 'Notebooks should be opened through Jupyter, not run as plain Python scripts.',
                },
              ]}
              onComplete={onComplete}
              reveal={<CodeBlock language="bash" code={'cd ai101-ml/lab1-classification\njupyter lab'} />}
            />
          </LessonCard>
        );

      case 'SetupQuiz':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_SETUP} onComplete={onComplete} />
          </LessonCard>
        );

      default:
        return null;
    }
  }, []);

  return (
    <LessonStepper
      cards={CARDS}
      sections={SECTIONS}
      storagePrefix="lesson-ml-setup"
      renderCard={renderCard}
      enforceRequiredCompletion={false}
    />
  );
}
