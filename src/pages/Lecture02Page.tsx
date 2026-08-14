import QuizCard, { type QuizQuestion } from '@/components/QuizCard';
import { DirtyDataLab, PCAExplorer, ScalingLab } from '@/components/PilotInteractives';
import { Insight, LessonHero, LessonNav, LessonSection } from '@/components/PilotLesson';

const quiz: QuizQuestion[] = [
  { id:'mlbd-l2-q1', question:'A missing laboratory result is more common among severely ill patients. What is the safest first response?', options:['Replace every missing value with the global mean','Delete every affected patient','Investigate the missingness mechanism and its relation to the target','Encode missing as zero'], correctIndex:2, explanation:'If missingness is informative, naive deletion or imputation can bias the analysis.' },
  { id:'mlbd-l2-q2', question:'Why can the mean be misleading for strongly right-skewed income data?', options:['It ignores every low value','It is pulled toward the long high-value tail','It is always equal to the mode','It cannot be computed'], correctIndex:1, explanation:'Extreme values in the tail influence the mean more than the median.' },
  { id:'mlbd-l2-q3', question:'Which transformation makes a value interpretable as ?standard deviations from the mean??', options:['Min?max scaling','Decimal scaling','Z-score normalization','One-hot encoding'], correctIndex:2, explanation:'Z-scoring subtracts the mean and divides by the standard deviation.' },
  { id:'mlbd-l2-q4', question:'What is the key difference between feature selection and feature extraction?', options:['Selection keeps original features; extraction constructs a new representation','Extraction only removes missing values','Selection always uses PCA','There is no difference'], correctIndex:0, explanation:'Selection chooses a subset of existing variables, while extraction maps them into new features.' },
  { id:'mlbd-l2-q5', question:'What direction does the first principal component choose?', options:['The feature with the largest unit','The direction of maximum projected variance','The class boundary with zero error','The direction with the smallest eigenvalue'], correctIndex:1, explanation:'PC1 is the unit direction that captures the greatest variance in the centered data.' },
  { id:'mlbd-l2-q6', question:'Why must a preprocessing pipeline be fitted on training data only?', options:['To make code run faster','To prevent information from the test set leaking into model development','Because test data cannot contain numbers','To guarantee class balance'], correctIndex:1, explanation:'Using test-set statistics during preprocessing leaks future information and makes evaluation optimistic.' },
];

export default function Lecture02Page() {
  return <>
    <LessonHero number="02" title="From Messy Data to Signal" subtitle="Data quality decisions shape the model before training begins. Explore the evidence, repair carefully, and compress without erasing what matters." minutes={40} color="from-emerald-700 via-teal-700 to-cyan-700" />
    <LessonSection id="explore" kicker="Look before fixing" title="The dataset is already telling you a story">
      <p>Real data can be incomplete, noisy, inconsistent, duplicated, and sampled in ways that distort conclusions. Summary statistics alone can hide structure, so exploration combines distributions, relationships, and domain context.</p>
      <DirtyDataLab />
      <Insight>A suspicious value is a question, not automatically an error. Cleaning is an inference about how the data-generating process behaved.</Insight>
    </LessonSection>
    <LessonSection id="missing-noise" kicker="Choose a defensible repair" title="Missingness and noise are mechanisms">
      <p>Ignoring a row, imputing a mean, predicting a value, or preserving an explicit ?unknown? category each makes a different assumption. The right choice depends on why the value is absent and how the repaired field will be used.</p>
      <div className="not-prose my-7 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border bg-card p-5"><p className="font-bold">Missing completely at random</p><p className="mt-2 text-sm text-muted-foreground">Absence is unrelated to observed or unobserved values. Simple methods are less likely to bias the sample.</p></div><div className="rounded-xl border bg-card p-5"><p className="font-bold">Informative missingness</p><p className="mt-2 text-sm text-muted-foreground">Absence itself carries signal. Add indicators, model the mechanism, and validate sensitivity.</p></div></div>
      <p>For noise and outliers, distinguish measurement error from a rare but valid case. Binning, robust statistics, regression, and clustering can reveal patterns?but automatic removal can erase the phenomenon you need to understand.</p>
    </LessonSection>
    <LessonSection id="transform" kicker="Make scales comparable" title="Two normalizations answer different questions">
      <p>Min?max scaling describes position inside an observed range. Z-score normalization describes distance from a mean in standard-deviation units. Manipulate the same income value below.</p>
      <ScalingLab />
      <Insight>Fit transformation parameters on the training split, then reuse them unchanged on validation and test data. Otherwise evaluation information leaks into training.</Insight>
    </LessonSection>
    <LessonSection id="reduce" kicker="Preserve what matters" title="Less data can contain more usable signal">
      <p>The curse of dimensionality makes neighborhoods sparse and increases the examples needed to cover a feature space. Reduction can improve computation, generalization, and interpretability.</p>
      <ul><li><strong>Feature selection</strong> retains a subset of original variables.</li><li><strong>Feature extraction</strong> creates a lower-dimensional representation.</li><li><strong>Numerosity reduction</strong> represents many records using models, clusters, histograms, or samples.</li></ul>
      <p>PCA is a linear extraction method. Rotate the candidate projection axis. The best direction spreads the projected data as much as possible.</p>
      <PCAExplorer />
      <p>After centering the data, PCA finds orthogonal eigenvectors of the covariance matrix. Components are ordered by eigenvalue, which measures the variance explained along that direction.</p>
    </LessonSection>
    <LessonSection id="checkpoint" kicker="Scaffolding off" title="Independent checkpoint">
      <p>Reason from the data-generating process and the purpose of each transformation.</p>
      <QuizCard questions={quiz} />
    </LessonSection>
    <LessonNav previous={{to:'/lecture-1',label:'Back to Lecture 01'}} next={{to:'/welcome',label:'Return to course map'}} />
  </>;
}

