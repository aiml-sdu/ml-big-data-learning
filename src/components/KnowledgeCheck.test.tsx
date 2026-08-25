import { fireEvent, render, screen } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { KnowledgeCheck } from './KnowledgeCheck';

describe('KnowledgeCheck', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no answer selected when persistence is empty or malformed', () => {
    localStorage.setItem(courseStorageKey('knowledge-check', 'fresh-check'), '0');

    render(
      <KnowledgeCheck
        storageKey="fresh-check"
        question="Choose one"
        options={[
          { id: 'first', label: 'First', feedback: 'Try again.' },
          { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
        ]}
      />,
    );

    expect(screen.getAllByRole<HTMLInputElement>('radio').every((radio) => !radio.checked)).toBe(true);
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('reveals targeted feedback after an answer is checked', () => {
    render(
      <KnowledgeCheck
        question="Which answer is correct?"
        options={[
          { id: 'first', label: 'First', feedback: 'Try again.' },
          { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText('This rule fits.')).toBeInTheDocument();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('restores a submitted answer and its explanation', () => {
    const props = {
      question: 'Which answer is correct?',
      storageKey: 'persistent-check',
      options: [
        { id: 'first', label: 'First', feedback: 'Try again.' },
        { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
      ],
    };
    const { unmount } = render(<KnowledgeCheck {...props} />);

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    unmount();
    render(<KnowledgeCheck {...props} />);

    expect(screen.getByText('This rule fits.')).toBeInTheDocument();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('restores by stable option id when options are reordered', () => {
    const question = 'Which answer is correct?';
    const first = { id: 'first', label: 'First', feedback: 'Try again.' };
    const second = { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' };
    const { unmount } = render(
      <KnowledgeCheck question={question} storageKey="reordered-check" options={[first, second]} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    unmount();
    render(<KnowledgeCheck question={question} storageKey="reordered-check" options={[second, first]} />);

    expect(screen.getByRole('radio', { name: /Second/ })).toBeChecked();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('clears the persisted answer before a retry', () => {
    const props = {
      question: 'Which answer is correct?',
      storageKey: 'retry-check',
      options: [
        { id: 'first', label: 'First', feedback: 'Try again.' },
        { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
      ],
    };
    const { unmount } = render(<KnowledgeCheck {...props} />);

    fireEvent.click(screen.getByRole('radio', { name: /First/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    unmount();
    render(<KnowledgeCheck {...props} />);

    expect(screen.getAllByRole<HTMLInputElement>('radio').every((radio) => !radio.checked)).toBe(true);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
