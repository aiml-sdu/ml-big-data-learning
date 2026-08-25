import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { COURSE_MODULES } from '@/course/modules';
import { CourseJourney, getJourneyPosition } from './CourseJourney';

describe('CourseJourney', () => {
  it('repeats the reference snake without drifting farther from the centre', () => {
    expect(Array.from({ length: 8 }, (_, index) => getJourneyPosition(index))).toEqual([
      'center', 'right', 'center', 'left', 'center', 'right', 'center', 'left',
    ]);
  });

  it('renders every module as one labelled path stop', () => {
    const { container } = render(
      <MemoryRouter>
        <CourseJourney modules={COURSE_MODULES} completedSlugs={[COURSE_MODULES[0].slug]} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(COURSE_MODULES.length);
    for (const module of COURSE_MODULES) {
      expect(screen.getByRole('link', { name: new RegExp(module.title) })).toHaveAttribute(
        'href',
        `/modules/${module.slug}`,
      );
    }
    expect(container.querySelectorAll('.journey-connector')).toHaveLength(COURSE_MODULES.length - 1);
  });

  it('handles a course plan before its first module is ready', () => {
    render(
      <MemoryRouter>
        <CourseJourney modules={[]} completedSlugs={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No modules are ready yet.')).toBeInTheDocument();
  });
});
