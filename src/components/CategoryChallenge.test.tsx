import { fireEvent, render, screen } from '@testing-library/react';
import { CategoryChallenge, type ChallengeItem } from './CategoryChallenge';

const items: ChallengeItem[] = [
  { id: 'case-a', prompt: 'Case A', answer: 'Thinking', explanation: 'A explanation.' },
  { id: 'case-b', prompt: 'Case B', answer: 'Exposure', explanation: 'B explanation.' },
];

const props = {
  title: 'Classify the cases',
  introduction: 'Choose the stronger description.',
  categories: ['Thinking', 'Exposure'],
  items,
  storageKey: 'category-test',
};

describe('CategoryChallenge', () => {
  beforeEach(() => localStorage.clear());

  it('keeps explanations available when moving back and forward', () => {
    render(<CategoryChallenge {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Thinking' }));
    expect(screen.getByText('A explanation.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next case' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exposure' }));
    expect(screen.getByText('B explanation.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous case' }));
    expect(screen.getByText('Case A')).toBeInTheDocument();
    expect(screen.getByText('A explanation.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thinking' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores the current case and its resolved answer', () => {
    const { unmount } = render(<CategoryChallenge {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Thinking' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next case' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exposure' }));
    unmount();

    render(<CategoryChallenge {...props} />);
    expect(screen.getByText('Case B')).toBeInTheDocument();
    expect(screen.getByText('B explanation.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exposure' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('allows a completed activity to be reviewed or reset', () => {
    render(<CategoryChallenge {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Thinking' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next case' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exposure' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish activity' }));

    expect(screen.getByRole('heading', { name: '2 of 2 correct' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Review answers' }));
    expect(screen.getByText('A explanation.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next case' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish activity' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset activity' }));
    expect(screen.getByText('Case A')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
