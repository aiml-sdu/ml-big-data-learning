import { useState, useCallback } from 'react';

interface PEASAnswer {
  performance: string;
  environment: string;
  actuators: string;
  sensors: string;
}

const PEAS_SCENARIOS: Record<string, PEASAnswer> = {
  'Self-Driving Taxi': {
    performance: 'Safe, fast, legal, comfortable ride; maximize profit',
    environment: 'Roads, other traffic, pedestrians, weather, passengers',
    actuators: 'Steering, accelerator, brake, signal, horn, display',
    sensors: 'Cameras, lidar, radar, GPS, speedometer, engine sensors, microphone',
  },
  'Chess Agent': {
    performance: 'Win the game (or maximize material/positional advantage)',
    environment: 'Chess board, opponent, chess clock',
    actuators: 'Moving pieces on the board (or screen output)',
    sensors: 'Camera / board state input (current positions of all pieces)',
  },
  'Medical Diagnosis': {
    performance: 'Correct diagnosis, minimize cost, minimize patient risk',
    environment: 'Patient, hospital, medical history, test results',
    actuators: 'Display diagnosis, order tests, prescribe treatment',
    sensors: 'Patient symptoms, lab results, medical records, imaging',
  },
  'Vacuum Cleaner': {
    performance: 'Clean floors, minimize energy use, minimize time',
    environment: 'Rooms, dirt, obstacles, floor type',
    actuators: 'Wheels (move), vacuum motor (suck), brushes',
    sensors: 'Dirt sensor, bump sensor, wall sensor, location sensor',
  },
};

const FIELDS = ['Performance', 'Environment', 'Actuators', 'Sensors'] as const;
type FieldKey = 'performance' | 'environment' | 'actuators' | 'sensors';

const scenarios = Object.keys(PEAS_SCENARIOS);

export default function PEASBuilder() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [values, setValues] = useState<Record<FieldKey, string>>({
    performance: '',
    environment: '',
    actuators: '',
    sensors: '',
  });
  const [showFeedback, setShowFeedback] = useState(false);

  const handleScenarioChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedScenario(e.target.value);
    setValues({ performance: '', environment: '', actuators: '', sensors: '' });
    setShowFeedback(false);
  }, []);

  const handleFieldChange = useCallback((field: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCheck = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const answers = PEAS_SCENARIOS[selectedScenario];

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
          {scenarios.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {FIELDS.map((field) => {
        const key = field.toLowerCase() as FieldKey;
        return (
          <div key={field} style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                color: 'var(--muted-foreground)',
                marginBottom: 4,
              }}
            >
              <strong>{field}:</strong>
            </label>
            <textarea
              rows={2}
              placeholder={`Describe the ${field.toLowerCase()}...`}
              value={values[key]}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
                background: 'var(--card)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
            {showFeedback && (
              <div style={{ fontSize: 13, marginTop: 4, color: 'var(--muted-foreground)' }}>
                <strong>Answer:</strong> {answers[key]}
              </div>
            )}
          </div>
        );
      })}

      <button className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors" type="button" onClick={handleCheck}>
        Check My Answer
      </button>
    </div>
  );
}
