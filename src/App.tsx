import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { BrainCircuit, Check, ChevronRight, Database, Home, Layers3, LineChart, Lock, Menu, Play, Sparkles, X } from 'lucide-react';
import { AmbiguityGame, BigDataModel, DBSCANTuner, DendrogramCut, DirtyDataLab, FeatureTransformLab, FitLineGame, GradientDescentLab, KMeansLab, LossVisualizer, OLTPOLAPGame, OutlierInfluenceLab, ParallelismLab, PCAExplorer, PipelineChallenge, PracticeQuiz, RegressionOutlierLab, ScalingGeometry, SilhouetteExplorer, SolverComparison, TutorialLab } from './LearningActivities';

type Unit = { id: string; title: string; eyebrow: string };
type Lecture = { id: string; number: string; title: string; color: string; icon: typeof Database; units: Unit[]; locked?: boolean; description?: string };

const lectures: Lecture[] = [
  {
    id: 'foundations', number: '01', title: 'Big Data & ML Foundations', color: '#6ea8ff', icon: Database, description: 'Learning paradigms, big-data systems, and analytical architectures',
    units: [
      { id: 'paradigms', title: 'How does the machine learn?', eyebrow: 'Concept game' },
      { id: 'big-data', title: 'When data changes the system', eyebrow: 'Visual model' },
      { id: 'oltp-olap', title: 'Transactions or analytics?', eyebrow: 'Workload game' },
      { id: 'parallelism', title: 'Where parallel speedup stops', eyebrow: 'Scaling lab' },
      { id: 'architecture', title: 'From event to decision', eyebrow: 'Pipeline challenge' },
      { id: 'lab-1', title: 'Python data foundations lab', eyebrow: 'Tutorial lab' },
      { id: 'practice-1', title: 'Lecture practice', eyebrow: 'Independent check' },
    ],
  },
  {
    id: 'preprocessing', number: '02', title: 'Preprocessing & Features', color: '#77e0c1', icon: Layers3, description: 'Data quality, transformations, scaling, and dimensionality reduction',
    units: [
      { id: 'dirty-data', title: 'Diagnose a broken dataset', eyebrow: 'Data lab' },
      { id: 'outliers', title: 'When one point changes the story', eyebrow: 'Influence lab' },
      { id: 'scaling', title: 'Why scale changes distance', eyebrow: 'Geometry game' },
      { id: 'feature-shape', title: 'Reshape a skewed feature', eyebrow: 'Transform lab' },
      { id: 'pca', title: 'Compress without losing the story', eyebrow: 'Projection lab' },
      { id: 'lab-2', title: 'Explore and prepare real data', eyebrow: 'Tutorial lab' },
      { id: 'practice-2', title: 'Lecture practice', eyebrow: 'Independent check' },
    ],
  },
  {
    id: 'clustering', number: '03', title: 'Clustering', color: '#d49bff', icon: BrainCircuit, description: 'K-means, hierarchies, density, and cluster validation',
    units: [
      { id: 'ambiguity', title: 'How many clusters do you see?', eyebrow: 'Perception challenge' },
      { id: 'kmeans', title: 'Think like K-means', eyebrow: 'Algorithm game' },
      { id: 'hierarchical', title: 'Cut a hierarchy into groups', eyebrow: 'Dendrogram lab' },
      { id: 'dbscan', title: 'Find shape with density', eyebrow: 'Parameter lab' },
      { id: 'validation', title: 'Measure cohesion and separation', eyebrow: 'Validation lab' },
      { id: 'lab-3', title: 'Cluster the world’s cities', eyebrow: 'Tutorial lab' },
      { id: 'practice-3', title: 'Lecture practice', eyebrow: 'Independent check' },
    ],
  },
  {
    id: 'regression', number: '04', title: 'Linear Regression', color: '#ffc86b', icon: LineChart, description: 'Lines, loss functions, closed-form solutions, and gradient descent',
    units: [
      { id: 'fit-line', title: 'Fit the line by eye', eyebrow: 'Estimation game' },
      { id: 'loss', title: 'See what MSE measures', eyebrow: 'Error visualizer' },
      { id: 'outlier-leverage', title: 'Watch one point pull the line', eyebrow: 'Influence lab' },
      { id: 'normal-equation', title: 'Closed form or gradient steps?', eyebrow: 'Solver comparison' },
      { id: 'gradient', title: 'Descend the loss surface', eyebrow: 'Optimization lab' },
      { id: 'lab-4', title: 'Build regression four ways', eyebrow: 'Tutorial lab' },
      { id: 'practice-4', title: 'Lecture practice', eyebrow: 'Independent check' },
    ],
  },
  { id: 'classification', number: '05', title: 'Fundamental Classification Algorithms', color: '#ff8f70', icon: BrainCircuit, units: [], locked: true, description: 'Core methods for assigning observations to discrete classes' },
  { id: 'neural-networks', number: '06', title: 'Artificial Neural Networks', color: '#9b8cff', icon: BrainCircuit, units: [], locked: true, description: 'Neurons, multilayer networks, and learning by backpropagation' },
  { id: 'ensembles', number: '07', title: 'Ensemble Methods & Model Evaluation', color: '#49b9a2', icon: Layers3, units: [], locked: true, description: 'Combine models and evaluate generalization reliably' },
  { id: 'hadoop', number: '08', title: 'Hadoop Fundamentals & MapReduce', color: '#edaa43', icon: Database, units: [], locked: true, description: 'Distributed storage and batch computation across clusters' },
  { id: 'spark', number: '09', title: 'Apache Spark Essentials & Scala', color: '#e879a7', icon: Database, units: [], locked: true, description: 'Distributed data processing with Spark and Scala' },
  { id: 'mllib', number: '10', title: 'Machine Learning with MLlib', color: '#4ca6dd', icon: LineChart, units: [], locked: true, description: 'Scalable machine-learning pipelines on Apache Spark' },
  { id: 'nosql', number: '11', title: 'NoSQL & Distributed Data Storage', color: '#7c9bdf', icon: Database, units: [], locked: true, description: 'Non-relational models, partitioning, and distributed storage' },
  { id: 'streaming', number: '12', title: 'Data Streaming & Fast Data', color: '#34ad8b', icon: Layers3, units: [], locked: true, description: 'Continuous event processing and low-latency analytics' },
];

const scenarios = [
  { text: 'Predict tomorrow’s electricity demand from years of paired weather and demand records.', answer: 'Supervised' },
  { text: 'Discover natural customer groups without being given any group labels.', answer: 'Unsupervised' },
  { text: 'Learn to steer a warehouse robot through rewards for safe, fast deliveries.', answer: 'Reinforcement' },
  { text: 'Hide words in millions of sentences and learn to reconstruct them.', answer: 'Self-supervised' },
];

const unitCopy: Record<string, { lead: string; key: string }> = {
  paradigms: { lead: 'Before naming the method, identify the information that teaches it. The source of the learning signal separates the major machine-learning paradigms.', key: 'A model can learn from explicit targets, hidden structure, consequences, or targets created from the data itself.' },
  'big-data': { lead: 'A dataset becomes “big” when its volume, speed, or complexity overwhelms the system and decision window available to us.', key: 'The three Vs are operational pressures. They matter because they change storage, computation, and latency choices.' },
  'oltp-olap': { lead: 'Operational and analytical systems answer different questions. One protects fast transactions; the other scans history to find patterns.', key: 'Workload shape, not database fashion, determines whether OLTP or OLAP is the better fit.' },
  parallelism: { lead: 'Adding workers can shorten independent computation, but coordination, communication, and serial work remain.', key: 'Parallel speedup has a ceiling: the non-parallel fraction eventually dominates total runtime.' },
  architecture: { lead: 'Analytics is a journey from raw events to a useful decision. Each component exists because the next one needs a reliable input.', key: 'Separate capture, processing, storage, and serving concerns so each can scale and fail independently.' },
  'lab-1': { lead: 'Turn the Week 1 Python tutorial into a small analysis workflow: transform values, reason about arrays, compute distances, and query movie data.', key: 'Code becomes reliable when you can predict its output, choose the right representation, and verify the result.' },
  'practice-1': { lead: 'Retrieve the ideas without the original diagrams. These questions mix learning paradigms and data-system choices.', key: 'Independent recall reveals whether you can choose a concept, not merely recognize its explanation.' },
  'dirty-data': { lead: 'Models faithfully learn the patterns we give them, including entry errors, duplicated records, missingness, and accidental shortcuts.', key: 'Cleaning is not a fixed recipe. Every treatment encodes an assumption that should be defensible.' },
  outliers: { lead: 'An unusual observation may be an error, a rare valid case, or the most important signal in the dataset.', key: 'Inspect influence before removing a point; deletion changes the question the model answers.' },
  scaling: { lead: 'Distance-based methods interpret numerical magnitude as geometry. A feature measured in thousands can drown out one measured in tens.', key: 'Scaling changes the question from “which raw numbers differ most?” to “which relative deviations differ most?”' },
  'feature-shape': { lead: 'Strongly skewed features compress most observations into a narrow region and give a few large values excessive geometric influence.', key: 'A monotonic transform can reveal relative differences while preserving order.' },
  pca: { lead: 'PCA replaces many correlated coordinates with a smaller set of directions that retain as much variation as possible.', key: 'The first principal component is the direction of maximum projected variance, not necessarily the most interpretable feature.' },
  'lab-2': { lead: 'Recreate the Week 2 exploration pipeline on the Chicago Crime and Spotify 2024 datasets, from diagnosis to a two-dimensional PCA view.', key: 'Every preprocessing step should answer a concrete data-quality or analytical question.' },
  'practice-2': { lead: 'Choose preprocessing operations from their consequences rather than from a memorized checklist.', key: 'Data quality, scale, and representation directly change what the later model can discover.' },
  ambiguity: { lead: 'Clusters are not labels waiting inside a dataset. Different notions of similarity can reveal different, equally useful partitions.', key: 'A clustering result is meaningful only relative to representation, distance, parameters, and purpose.' },
  kmeans: { lead: 'K-means repeatedly assigns each point to a nearest centroid, then moves each centroid to the mean of its assigned points.', key: 'The algorithm minimizes within-cluster squared distance, which favors compact, roughly spherical groups.' },
  hierarchical: { lead: 'Agglomerative clustering records a sequence of merges rather than committing immediately to one number of groups.', key: 'A horizontal dendrogram cut turns a nested hierarchy into a partition; linkage decides which clusters merge.' },
  dbscan: { lead: 'DBSCAN defines clusters as connected dense regions and treats isolated points as noise, so it can follow non-spherical shapes.', key: 'ε defines the neighborhood scale; MinPts defines how much local evidence counts as density.' },
  validation: { lead: 'A clustering can look plausible while mixing distant points or splitting coherent groups. Validation makes those trade-offs inspectable.', key: 'Silhouette compares within-cluster cohesion with separation from the nearest alternative cluster.' },
  'lab-3': { lead: 'Use the Week 3 owl-delivery scenario to turn geographic coordinates into candidate delivery regions and compare clustering assumptions.', key: 'Representation and algorithm choice determine which geographic structure a clustering method can see.' },
  'practice-3': { lead: 'Compare algorithms by the structures they assume and the failure modes those assumptions create.', key: 'No clustering method is universally best; match its inductive bias to the data and the analytical purpose.' },
  'fit-line': { lead: 'Linear regression chooses a line that summarizes how an expected outcome changes with an input.', key: 'Slope controls change; intercept anchors the prediction; the loss decides which line counts as best.' },
  loss: { lead: 'A residual is the vertical gap between an observation and its prediction. Mean squared error aggregates those gaps into one objective.', key: 'Squaring prevents cancellation and makes large misses influence the fit more strongly.' },
  'outlier-leverage': { lead: 'Points far from the center of the input range can rotate a fitted line substantially because they have high leverage.', key: 'Residual size and leverage are different: an influential point can have a modest final residual after pulling the model toward itself.' },
  'normal-equation': { lead: 'Linear regression can be solved directly with matrix algebra or iteratively by optimizing the same objective.', key: 'Closed form trades matrix computation for an exact answer; gradient descent trades iterations for scalability.' },
  gradient: { lead: 'Gradient descent repeatedly measures the local slope of the loss and steps in the opposite direction.', key: 'The learning rate controls step size: too small wastes iterations; too large can overshoot the minimum.' },
  'lab-4': { lead: 'Follow the Week 4 notebook from synthetic data to SciPy, statsmodels, a NumPy closed form, and a trainable PyTorch model.', key: 'Different implementations should recover the same linear relationship when they optimize the same objective.' },
  'practice-4': { lead: 'Reason from the geometry of a line, its residuals, and the optimization process.', key: 'A fitted model, its objective, and its optimizer are different parts of the same learning system.' },
};

function ParadigmGame() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const item = scenarios[index];
  const correct = choice === item.answer;
  const finished = index === scenarios.length - 1 && correct;

  return (
    <section className="game-shell" aria-labelledby="challenge-title">
      <div className="game-topline">
        <span>Scenario {index + 1} of {scenarios.length}</span>
        <div className="mini-progress"><span style={{ width: `${((index + (correct ? 1 : 0)) / scenarios.length) * 100}%` }} /></div>
      </div>
      <div className="scenario-visual" aria-hidden="true">
        <div className="data-stack"><i /><i /><i /><i /></div>
        <ChevronRight />
        <div className="model-orb"><Sparkles /></div>
        <ChevronRight />
        <div className="output-tile">?</div>
      </div>
      <h2 id="challenge-title">Name the learning setup</h2>
      <p className="scenario-copy">{item.text}</p>
      <div className="choice-grid">
        {['Supervised', 'Unsupervised', 'Reinforcement', 'Self-supervised'].map((option) => {
          const isPicked = choice === option;
          const state = isPicked ? (correct ? 'correct' : 'wrong') : '';
          return <button className={`choice ${state}`} key={option} onClick={() => setChoice(option)} disabled={correct}>{option}{isPicked && (correct ? <Check /> : <X />)}</button>;
        })}
      </div>
      {choice && (
        <div className={`feedback ${correct ? 'good' : 'try'}`} role="status">
          <strong>{correct ? 'That model fits.' : 'Look at where the learning signal comes from.'}</strong>
          <span>{correct ? `${item.answer} learning describes this setup.` : 'Are there labels, naturally occurring targets, or rewards?'}</span>
        </div>
      )}
      {correct && !finished && <button className="primary-button" onClick={() => { setIndex(index + 1); setChoice(null); }}>Next scenario <ChevronRight /></button>}
      {finished && <div className="completion"><Check /> You can now distinguish the four learning signals.</div>}
    </section>
  );
}

function Activity({ id }: { id: string }): ReactNode {
  const activities: Record<string, ReactNode> = {
    paradigms: <ParadigmGame />, 'big-data': <BigDataModel />, architecture: <PipelineChallenge />, 'lab-1': <TutorialLab lecture={1} />, 'practice-1': <PracticeQuiz id="practice-1" />,
    'oltp-olap': <OLTPOLAPGame />, parallelism: <ParallelismLab />,
    'dirty-data': <DirtyDataLab />, outliers: <OutlierInfluenceLab />, scaling: <ScalingGeometry />, 'feature-shape': <FeatureTransformLab />, pca: <PCAExplorer />, 'lab-2': <TutorialLab lecture={2} />, 'practice-2': <PracticeQuiz id="practice-2" />,
    ambiguity: <AmbiguityGame />, kmeans: <KMeansLab />, hierarchical: <DendrogramCut />, dbscan: <DBSCANTuner />, validation: <SilhouetteExplorer />, 'lab-3': <TutorialLab lecture={3} />, 'practice-3': <PracticeQuiz id="practice-3" />,
    'fit-line': <FitLineGame />, loss: <LossVisualizer />, 'outlier-leverage': <RegressionOutlierLab />, 'normal-equation': <SolverComparison />, gradient: <GradientDescentLab />, 'lab-4': <TutorialLab lecture={4} />, 'practice-4': <PracticeQuiz id="practice-4" />,
  };
  return activities[id];
}

function WelcomePage({ onOpenLecture }: { onOpenLecture: (lecture: Lecture) => void }) {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const showLocked = (id: string) => {
    setLockedNotice(id);
    window.setTimeout(() => setLockedNotice((current) => current === id ? null : current), 1600);
  };

  return <main className="welcome-page">
    <section className="welcome-hero">
      <span className="welcome-kicker">Syddansk Universitet · Master course</span>
      <h1>ML &amp; Big Data Course</h1>
      <p>Learn the intuition first, experiment with interactive models, then consolidate each lecture through a guided lab and independent review.</p>
      <div className="welcome-stats"><span><b>12</b> lectures planned</span><span><b>4</b> available now</span><span><b>28</b> activities and labs</span></div>
      <button className="welcome-start" onClick={() => onOpenLecture(lectures[0])}><Play /> Start Lecture 1</button>
    </section>

    <section className="course-journey" aria-labelledby="journey-title">
      <div className="journey-heading"><div><span>Course journey</span><h2 id="journey-title">Build from data foundations to fast analytics</h2></div><p>Follow the path in order. Later lectures are visible now and will unlock as their interactive content is created.</p></div>
      <div className="journey-path">
        <svg className="journey-line" viewBox="0 0 400 1840" preserveAspectRatio="none" aria-hidden="true"><path d="M200 35 C200 110 315 115 315 190 S85 270 85 350 S315 430 315 510 S85 590 85 670 S315 750 315 830 S85 910 85 990 S315 1070 315 1150 S85 1230 85 1310 S315 1390 315 1470 S85 1550 85 1630 S200 1740 200 1805" /></svg>
        {lectures.map((lecture, index) => {
          const right = index % 4 === 1;
          const center = index % 4 === 0 || index % 4 === 2;
          return <div className={`journey-row ${right ? 'right' : center ? 'center' : 'left'}`} key={lecture.id}>
            <div className={`journey-node ${lecture.locked ? 'locked' : 'open'}`}>
              <button onClick={() => lecture.locked ? showLocked(lecture.id) : onOpenLecture(lecture)} aria-label={`${lecture.locked ? 'Locked: ' : 'Open '}${lecture.title}`}>
                {lecture.locked ? <Lock /> : <span>{Number(lecture.number)}</span>}
              </button>
              <div className="journey-copy"><small>Lecture {lecture.number}{lecture.locked ? ' · Coming later' : ' · Available'}</small><h3>{lecture.title}</h3><p>{lecture.description}</p></div>
              {lockedNotice === lecture.id && <div className="lock-notice" role="status">Content will be generated later</div>}
            </div>
          </div>;
        })}
      </div>
    </section>
  </main>;
}

export default function App() {
  const [view, setView] = useState<'welcome' | 'lecture'>('welcome');
  const [lectureId, setLectureId] = useState('foundations');
  const [unitId, setUnitId] = useState('paradigms');
  const [navOpen, setNavOpen] = useState(false);
  const lecture = useMemo(() => lectures.find((item) => item.id === lectureId)!, [lectureId]);
  const unit = lecture.units.find((item) => item.id === unitId) ?? lecture.units[0];
  const copy = unitCopy[unit.id];

  const selectLecture = (next: Lecture) => {
    if (next.locked || next.units.length === 0) return;
    setLectureId(next.id);
    setUnitId(next.units[0].id);
    setView('lecture');
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const showWelcome = () => { setView('welcome'); setNavOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="menu-button" aria-label="Open course navigation" onClick={() => setNavOpen(true)}><Menu /></button>
        <button className="brand" onClick={showWelcome}><span className="brand-mark"><BrainCircuit /></span><span>ML &amp; Big Data <b>Course</b></span></button>
        <div className="course-label">SDU · Interactive master course</div>
      </header>

      <aside className={`sidebar ${navOpen ? 'open' : ''}`}>
        <button className="close-nav" aria-label="Close course navigation" onClick={() => setNavOpen(false)}><X /></button>
        <div className="sidebar-heading"><span>Course map</span><small>4 of 12 available</small></div>
        <nav>
          <button className={`welcome-nav ${view === 'welcome' ? 'current' : ''}`} onClick={showWelcome}><Home /><span>Welcome</span></button>
          {lectures.map((item) => {
            const Icon = item.icon;
            const active = view === 'lecture' && item.id === lectureId;
            return (
              <div className={`lecture-nav ${active ? 'active' : ''} ${item.locked ? 'locked' : ''}`} key={item.id} style={{ '--lecture-color': item.color } as CSSProperties}>
                <button className="lecture-button" onClick={() => selectLecture(item)} disabled={item.locked} aria-label={`${item.locked ? 'Locked: ' : ''}Lecture ${item.number}, ${item.title}`}>
                  <span className="lecture-number">{item.number}</span><Icon /><span>{item.title}</span>{item.locked ? <Lock className="lock-icon" /> : <ChevronRight className="chevron" />}
                </button>
                {active && <div className="unit-list">{item.units.map((entry, i) => <button className={entry.id === unit.id ? 'current' : ''} onClick={() => { setUnitId(entry.id); setNavOpen(false); }} key={entry.id}><span>{i + 1}</span>{entry.title}</button>)}</div>}
              </div>
            );
          })}
        </nav>
      </aside>

      {navOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}

      {view === 'welcome' ? <WelcomePage onOpenLecture={selectLecture} /> : <main className="main-content" style={{ '--lecture-color': lecture.color } as CSSProperties}>
        <div className="lesson-header">
          <div><span className="eyebrow">Lecture {lecture.number} · {unit.eyebrow}</span><h1>{unit.title}</h1></div>
          <span className="unit-count">{lecture.units.findIndex((entry) => entry.id === unit.id) + 1} / {lecture.units.length}</span>
        </div>
        <div className="lesson-progress" style={{ '--unit-count': lecture.units.length } as CSSProperties}>{lecture.units.map((entry) => <span key={entry.id} className={entry.id === unit.id ? 'active' : ''} />)}</div>
        <div className="concept-intro">
          <p className="lead">{copy.lead}</p>
          <div className="key-idea"><span>Key idea</span><p>{copy.key}</p></div>
        </div>
        <Activity id={unit.id} />
      </main>}
    </div>
  );
}
