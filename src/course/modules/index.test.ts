import { COURSE_MODULES } from './index';

describe('course module registry', () => {
  it('has unique slugs and module numbers', () => {
    const slugs = COURSE_MODULES.map((module) => module.slug);
    const numbers = COURSE_MODULES.map((module) => module.number);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('keeps source paths inside the repository', () => {
    for (const module of COURSE_MODULES) {
      for (const source of module.sourceRefs) {
        expect(source.path.startsWith('/')).toBe(false);
        expect(source.path.includes('..')).toBe(false);
      }
    }
  });

  it('keeps module metadata suitable for the shared course map', () => {
    for (const module of COURSE_MODULES) {
      expect(module.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(module.number).toBeGreaterThan(0);
      expect(module.estimatedMinutes).toBeGreaterThan(0);
      expect(module.objectives.length).toBeGreaterThanOrEqual(2);
      expect(module.objectives.length).toBeLessThanOrEqual(4);
    }
  });
});
