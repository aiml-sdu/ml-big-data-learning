import { fireEvent, render, screen } from '@testing-library/react';
import { FlashcardDeck, type Flashcard } from './FlashcardDeck';

const cards: Flashcard[] = [
  { id: 'term-a', prompt: 'Prompt A', answer: 'Answer A', explanation: 'Reason A.' },
  { id: 'term-b', prompt: 'Prompt B', answer: 'Answer B', explanation: 'Reason B.' },
];

describe('FlashcardDeck', () => {
  beforeEach(() => localStorage.clear());

  it('requires recall before reveal and rating before continuation', () => {
    render(<FlashcardDeck title="Key terms" cards={cards} storageKey="deck-test" />);

    expect(screen.queryByText('Answer A')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next card/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    expect(screen.getByText('Answer A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next card/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /I recalled it/ }));
    expect(screen.getByText('Answer A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next card/ })).toBeEnabled();
  });

  it('restores resolved cards when learners move back or revisit', () => {
    const props = { title: 'Key terms', cards, storageKey: 'restore-deck' };
    const { unmount } = render(<FlashcardDeck {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    fireEvent.click(screen.getByRole('button', { name: /I recalled it/ }));
    fireEvent.click(screen.getByRole('button', { name: /Next card/ }));
    unmount();
    render(<FlashcardDeck {...props} />);

    expect(screen.getByText('Prompt B')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Answer A')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /I recalled it/ })).toHaveAttribute('aria-pressed', 'true');
  });
});
