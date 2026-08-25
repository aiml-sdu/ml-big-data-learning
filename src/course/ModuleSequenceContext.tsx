import { createContext, type PropsWithChildren, useContext } from 'react';
import type { LearningModule } from './types';

export type ModuleSequenceLink = Pick<LearningModule, 'slug' | 'number' | 'title'>;

interface ModuleSequenceValue {
  previous?: ModuleSequenceLink;
  next?: ModuleSequenceLink;
}

interface ModuleSequenceProviderProps extends PropsWithChildren, ModuleSequenceValue {}

const ModuleSequenceContext = createContext<ModuleSequenceValue>({});

export function ModuleSequenceProvider({ previous, next, children }: ModuleSequenceProviderProps) {
  return (
    <ModuleSequenceContext.Provider value={{ previous, next }}>
      {children}
    </ModuleSequenceContext.Provider>
  );
}

export function useModuleSequence() {
  return useContext(ModuleSequenceContext);
}
