import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import type { LearningModule } from '@/course/types';
import { LearningModuleLayout } from './LearningModuleLayout';

vi.mock('@/hooks/useCourseProgress', () => ({
  useCourseProgress: () => ({
    completedSlugs: [],
    isCompleted: () => false,
    setCompleted: vi.fn(),
  }),
}));

const currentModule: LearningModule = {
  slug: 'current',
  number: 2,
  title: 'Current module',
  summary: 'A module used to verify the shared sequence navigation.',
  estimatedMinutes: 10,
  objectives: ['use the shared navigation'],
  sourceRefs: [],
  status: 'draft',
  Component: () => null,
};

describe('LearningModuleLayout', () => {
  it('renders previous and next links supplied by the ordered registry', () => {
    render(
      <MemoryRouter>
        <ModuleSequenceProvider
          previous={{ slug: 'introduction', number: 1, title: 'Introduction' }}
          next={{ slug: 'application', number: 3, title: 'Application' }}
        >
          <LearningModuleLayout module={currentModule}>
            <section>Lesson content</section>
          </LearningModuleLayout>
        </ModuleSequenceProvider>
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Module sequence' });
    expect(within(navigation).getByRole('link', { name: /previous module introduction/i }))
      .toHaveAttribute('href', '/modules/introduction');
    expect(within(navigation).getByRole('link', { name: /next module application/i }))
      .toHaveAttribute('href', '/modules/application');
  });
});
