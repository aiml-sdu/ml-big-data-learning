import { useState, useCallback } from 'react';

interface EnvProperty {
  name: string;
  labelA: string;
  labelB: string;
}

const ENV_PROPERTIES: EnvProperty[] = [
  { name: 'observable', labelA: 'Fully observable', labelB: 'Partially observable' },
  { name: 'deterministic', labelA: 'Deterministic', labelB: 'Stochastic' },
  { name: 'episodic', labelA: 'Episodic', labelB: 'Sequential' },
  { name: 'static', labelA: 'Static', labelB: 'Dynamic' },
  { name: 'discrete', labelA: 'Discrete', labelB: 'Continuous' },
  { name: 'agents', labelA: 'Single-agent', labelB: 'Multi-agent' },
];

// Correct answers: 0 = labelA, 1 = labelB
const ENV_ANSWERS: Record<string, Record<string, number>> = {
  Chess: { observable: 0, deterministic: 0, episodic: 1, static: 1, discrete: 0, agents: 1 },
  Poker: { observable: 1, deterministic: 1, episodic: 1, static: 1, discrete: 0, agents: 1 },
  'Self-driving car': { observable: 1, deterministic: 1, episodic: 1, static: 1, discrete: 1, agents: 1 },
  'Medical diagnosis': { observable: 1, deterministic: 1, episodic: 1, static: 1, discrete: 1, agents: 0 },
};

const ENV_EXPLANATIONS: Record<string, string> = {
  Chess: 'Chess is fully observable (you see the whole board), deterministic (moves have predictable outcomes), sequential (current moves affect future), semi-dynamic (clock), discrete (finite states), and multi-agent (opponent).',
  Poker: 'Poker is partially observable (hidden cards), stochastic (random deals), sequential (betting rounds matter), static (nothing changes while you decide), discrete (finite card combinations), and multi-agent (other players).',
  'Self-driving car': 'A self-driving car faces the hardest environment: partially observable (blind spots, hidden intentions), stochastic (unpredictable behavior), sequential (every action has consequences), dynamic (world changes while deciding), continuous (smooth motion/angles), multi-agent (other drivers, pedestrians).',
  'Medical diagnosis': 'Medical diagnosis is partially observable (can\'t see all internal states), stochastic (treatments have uncertain outcomes), sequential (test results inform next steps), dynamic (patient condition changes), continuous (vital signs are continuous), but typically single-agent (one diagnosing system).',
};

const envScenarios = Object.keys(ENV_ANSWERS);

export default function EnvironmentClassifier() {
  const [selectedScenario, setSelectedScenario] = useState(envScenarios[0]);
  const [toggles, setToggles] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const p of ENV_PROPERTIES) init[p.name] = -1;
    return init;
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [results, setResults] = useState<Record<string, 'correct' | 'wrong' | 'unselected'>>({});
  const [score, setScore] = useState(0);

  const handleScenarioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScenario(e.target.value);
    const init: Record<string, number> = {};
    for (const p of ENV_PROPERTIES) init[p.name] = -1;
    setToggles(init);
    setShowFeedback(false);
    setResults({});
  }, []);

  const handleToggle = useCallback((propName: string, value: number) => {
    setToggles((prev) => ({ ...prev, [propName]: value }));
    setShowFeedback(false);
  }, []);

  const handleCheck = useCallback(() => {
    const answers = ENV_ANSWERS[selectedScenario];
    const newResults: Record<string, 'correct' | 'wrong' | 'unselected'> = {};
    let correct = 0;
    for (const prop of ENV_PROPERTIES) {
      const expected = answers[prop.name];
      const selected = toggles[prop.name];
      if (selected === -1) {
        newResults[prop.name] = 'unselected';
      } else if (selected === expected) {
        newResults[prop.name] = 'correct';
        correct++;
      } else {
        newResults[prop.name] = 'wrong';
      }
    }
    setResults(newResults);
    setScore(correct);
    setShowFeedback(true);
  }, [selectedScenario, toggles]);

  const answers = ENV_ANSWERS[selectedScenario];

  return (
    <div className="rounded-lg border bg-card p-4 my-6 overflow-hidden">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 14, color: 'var(--foreground)' }}>
          <strong>Scenario:</strong>
        </label>
        <select
          value={selectedScenario}
          onChange={handleScenarioChange}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: 6,
          }}
        >
          {envScenarios.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {ENV_PROPERTIES.map((prop) => {
        const selected = toggles[prop.name];
        const result = results[prop.name];
        return (
          <div
            key={prop.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <span>
              <strong
                style={{
                  minWidth: 110,
                  display: 'inline-block',
                  fontSize: 13,
                  color: 'var(--muted-foreground)',
                }}
              >
                {prop.name.charAt(0).toUpperCase() + prop.name.slice(1)}:
              </strong>
            </span>
            <button
              className={selected === 0 ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              type="button"
              onClick={() => handleToggle(prop.name, 0)}
            >
              {prop.labelA}
            </button>
            <button
              className={selected === 1 ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              type="button"
              onClick={() => handleToggle(prop.name, 1)}
            >
              {prop.labelB}
            </button>
            {showFeedback && result && (
              <span
                style={{
                  fontSize: 12,
                  marginLeft: 8,
                  color:
                    result === 'correct'
                      ? 'var(--color-success, #10b981)'
                      : result === 'unselected'
                        ? 'var(--color-warning, #f59e0b)'
                        : 'var(--color-error, #ef4444)',
                }}
              >
                {result === 'correct'
                  ? 'Correct'
                  : result === 'unselected'
                    ? 'Not selected'
                    : answers[prop.name] === 0
                      ? `Answer: ${prop.labelA}`
                      : `Answer: ${prop.labelB}`}
              </span>
            )}
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" type="button" onClick={handleCheck}>
          Check Answers
        </button>
      </div>

      {showFeedback && (
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.6,
            padding: 12,
            background: 'var(--muted)',
            borderRadius: 8,
            color: 'var(--foreground)',
          }}
        >
          <strong>{score}/6 correct.</strong> {ENV_EXPLANATIONS[selectedScenario]}
        </div>
      )}
    </div>
  );
}
