import { lazy, Suspense, useCallback, type ReactNode } from 'react';
import LessonStepper from '@/components/LessonStepper';
import LessonCard from '@/components/LessonCard';
import QuizCard from '@/components/QuizCard';
import CalloutBox from '@/components/CalloutBox';
import { CARDS, QUIZ_121, QUIZ_122, QUIZ_123, SECTIONS } from '@/data/topic-12-cards';

const ClusterAmbiguityGame = lazy(() => import('./visualizations/clustering/ClusterAmbiguityGame'));
const ClusteringFamiliesGame = lazy(() => import('./visualizations/clustering/ClusteringFamiliesGame'));
const KMeansClusterGame = lazy(() => import('./visualizations/clustering/KMeansClusterGame'));
const KMeansKChallenge = lazy(() => import('./visualizations/clustering/KMeansKChallenge'));
const KMeansInitializationChallenge = lazy(() => import('./visualizations/clustering/KMeansInitializationChallenge'));
const DendrogramBuilder = lazy(() => import('./visualizations/clustering/DendrogramBuilder'));
const DendrogramCutChallenge = lazy(() => import('./visualizations/clustering/DendrogramCutChallenge'));
const DBSCANTuner = lazy(() => import('./visualizations/clustering/DBSCANTuner'));
const DBSCANFailureLab = lazy(() => import('./visualizations/clustering/DBSCANFailureLab'));
const ClusterValidityChallenge = lazy(() => import('./visualizations/clustering/ClusterValidityChallenge'));

function VizLoading() {
  return (
    <div className="flex h-72 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground animate-pulse">
      Loading interaction...
    </div>
  );
}

function BrilliantFrame({
  children,
  prompt,
}: {
  children: ReactNode;
  prompt?: string;
}) {
  return (
    <div className="space-y-5">
      {prompt && <p className="text-lg leading-8">{prompt}</p>}
      <Suspense fallback={<VizLoading />}>{children}</Suspense>
    </div>
  );
}

export default function Topic12ClusteringPage() {
  const renderCard = useCallback((index: number, onComplete: () => void): ReactNode => {
    const card = CARDS[index];
    const section = SECTIONS.find((item) => item.id === card.sectionId);

    switch (card.component) {
      case 'ClusterAmbiguity':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <ClusterAmbiguityGame onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'ClusteringFamilies':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <ClusteringFamiliesGame onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'QuizSeeing':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_121} onComplete={onComplete} />
          </LessonCard>
        );

      case 'KMeansLoop':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <KMeansClusterGame onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'ChooseK':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <KMeansKChallenge onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'Initialization':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <KMeansInitializationChallenge onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'QuizKMeans':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_122} onComplete={onComplete} />
          </LessonCard>
        );

      case 'DendrogramBuilder':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <DendrogramBuilder onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'DendrogramCut':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <DendrogramCutChallenge onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'DBSCANTuner':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <DBSCANTuner onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'DBSCANFailure':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <DBSCANFailureLab onComplete={onComplete} />
            </BrilliantFrame>
          </LessonCard>
        );

      case 'ClusterValidity':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <BrilliantFrame>
              <ClusterValidityChallenge onComplete={onComplete} />
            </BrilliantFrame>
            <CalloutBox type="info" title="Why this is the final skill">
              <p>
                Cluster analysis is exploratory. Validity checks are how you avoid turning random structure into a confident story.
              </p>
            </CalloutBox>
          </LessonCard>
        );

      case 'QuizFinal':
        return (
          <LessonCard title={card.title} sectionLabel={section?.label}>
            <QuizCard questions={QUIZ_123} onComplete={onComplete} />
          </LessonCard>
        );

      default:
        return null;
    }
  }, []);

  return (
    <LessonStepper
      cards={CARDS}
      sections={SECTIONS}
      storagePrefix="lesson-t12-clustering"
      renderCard={renderCard}
      enforceRequiredCompletion
    />
  );
}
