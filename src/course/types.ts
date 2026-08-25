import type { ComponentType } from 'react';

export interface SourceReference {
  label: string;
  path: string;
  locator?: string;
}

export interface ModulePageProps {
  module: LearningModule;
}

export interface CourseThemePalette {
  background: string;
  surface: string;
  surfaceSoft: string;
  surfaceMuted: string;
  text: string;
  bodyCopy: string;
  mutedText: string;
  line: string;
  accentText: string;
}

export interface CourseTheme {
  primary: string;
  accent: string;
  light: CourseThemePalette;
  dark: CourseThemePalette;
  typography: {
    body: string;
    heading: string;
  };
  geometry: 'soft' | 'balanced' | 'crisp';
  rationale: string;
  sourceRefs: SourceReference[];
}

export interface LearningModule {
  slug: string;
  number: number;
  kind?: 'lesson' | 'practice';
  title: string;
  summary: string;
  estimatedMinutes: number;
  objectives: string[];
  sourceRefs: SourceReference[];
  status: 'draft' | 'ready';
  Component: ComponentType<ModulePageProps>;
}

export interface CourseConfig {
  institution: string;
  code: string;
  title: string;
  shortTitle: string;
  term: string;
  description: string;
  contact?: string;
  storageNamespace: string;
  theme: CourseTheme;
}
