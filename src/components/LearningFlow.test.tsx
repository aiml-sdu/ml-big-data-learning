import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LearningFlow, type LearningFlowStep } from './LearningFlow';

const steps: LearningFlowStep[] = [
  {
    id: 'notice',
    title: 'Notice the pattern',
    autoComplete: true,
    render: () => <p>Look closely.</p>,
  },
  {
    id: 'try',
    title: 'Try the rule',
    render: ({ completeStep, isComplete }) => (
      <div>
        <button onClick={completeStep}>Solve</button>
        {isComplete && <p>The explanation stays visible.</p>}
      </div>
    ),
  },
];

describe('LearningFlow', () => {
  beforeEach(() => localStorage.clear());

  test('requires explicit continuation and restores completion', async () => {
    const { unmount } = render(<LearningFlow storageKey="flow-test" steps={steps} />);

    await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled();

    unmount();
    render(<LearningFlow storageKey="flow-test" steps={steps} />);
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
  });
});
