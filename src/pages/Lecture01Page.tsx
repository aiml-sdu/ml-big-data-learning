import QuizCard, { type QuizQuestion } from '@/components/QuizCard';
import { FourVLab, TaskClassifier, WorkloadChallenge } from '@/components/PilotInteractives';
import { Insight, LessonHero, LessonNav, LessonSection } from '@/components/PilotLesson';

const quiz: QuizQuestion[] = [
  { id:'mlbd-l1-q1', question:'A hospital learns patient subgroups from records that have no diagnosis labels. What is the learning setup?', options:['Supervised classification','Unsupervised learning','Reinforcement learning','OLTP'], correctIndex:1, explanation:'The groups are latent structure discovered without target labels.' },
  { id:'mlbd-l1-q2', question:'A retailer must recommend an offer within 100 ms using the customer's latest click. Which pressure is most decisive?', options:['Volume','Velocity','Variety','Veracity'], correctIndex:1, explanation:'The value of the decision depends on processing and responding to fresh data quickly.' },
  { id:'mlbd-l1-q3', question:'Why are OLTP and OLAP workloads commonly separated?', options:['They require different programming languages','They have conflicting access patterns and latency goals','OLAP cannot use relational data','OLTP is always cloud-hosted'], correctIndex:1, explanation:'Small concurrent updates and large analytical scans compete for memory, I/O, and predictable latency.' },
  { id:'mlbd-l1-q4', question:'What is the main benefit of a distributed execution framework?', options:['It makes every algorithm accurate','It hides coordination and fault-handling details behind a computation abstraction','It removes the need for data cleaning','It guarantees zero network communication'], correctIndex:1, explanation:'The programmer expresses what computation is needed; the runtime coordinates workers, data, retries, and aggregation.' },
  { id:'mlbd-l1-q5', question:'A pipeline needs both complete historical recomputation and low-latency views of new events. Which design matches?', options:['OLTP only','Batch-only warehouse','Lambda-style batch and speed layers','Single desktop database'], correctIndex:2, explanation:'A lambda-style architecture combines authoritative batch views with a speed layer for recent data.' },
];

export default function Lecture01Page() {
  return <>
    <LessonHero number="01" title="Thinking at Data Scale" subtitle="Start with the decision, identify the learning signal, then choose an architecture that respects the shape and speed of the data." minutes={35} color="from-indigo-700 via-blue-700 to-cyan-600" />
    <LessonSection id="learning-signal" kicker="Predict first" title="Where does the learning signal come from?">
      <p>Before choosing a model, ask what kind of experience can teach it. Labels, hidden structure, and rewards create three fundamentally different learning problems.</p>
      <TaskClassifier />
      <Insight>The same application may combine all three. A recommender can learn representations without labels, predict clicks from labeled history, and optimize a policy from long-term rewards.</Insight>
    </LessonSection>
    <LessonSection id="big-data" kicker="Manipulate the constraints" title="Big data is not just 'a lot' of data">
      <p>A dataset becomes architecturally difficult when its volume, velocity, variety, or veracity exceeds what a simple workflow can handle. Move the four controls and watch which pressure dominates.</p>
      <FourVLab />
      <p>These dimensions are diagnostic questions, not a certification. They help explain why a workload needs distributed storage, streaming computation, flexible schemas, or stronger quality controls.</p>
    </LessonSection>
    <LessonSection id="workloads" kicker="Choose the workload" title="One database is rarely optimal for every job">
      <p>Transactional systems optimize small, concurrent reads and writes. Analytical systems optimize scans and aggregations. Streaming systems optimize continuous decisions over fresh events.</p>
      <WorkloadChallenge />
      <Insight>ETL connects operational data to analytical systems: extract from sources, transform into a consistent analytical form, and load it where large queries can run efficiently.</Insight>
    </LessonSection>
    <LessonSection id="distributed" kicker="Change the abstraction" title="The datacenter becomes the computer">
      <p>At cluster scale, manually coordinating workers creates races, deadlocks, partial failure, and difficult recovery. A distributed runtime separates <strong>what</strong> computation should happen from <strong>how</strong> it is scheduled.</p>
      <div className="not-prose my-7 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border bg-card p-4"><strong className="text-primary">1 - Express</strong><p className="mt-2 text-sm text-muted-foreground">Define transformations and aggregations.</p></div><div className="rounded-xl border bg-card p-4"><strong className="text-primary">2 - Distribute</strong><p className="mt-2 text-sm text-muted-foreground">Partition work close to the data.</p></div><div className="rounded-xl border bg-card p-4"><strong className="text-primary">3 - Recover</strong><p className="mt-2 text-sm text-muted-foreground">Retry failed work and combine results.</p></div></div>
      <p>Cloud infrastructure adds elasticity: capacity can be provisioned on demand instead of purchased for peak load.</p>
    </LessonSection>
    <LessonSection id="checkpoint" kicker="Scaffolding off" title="Independent checkpoint">
      <p>No diagrams or hints now. Diagnose each scenario from the underlying learning or systems constraint.</p>
      <QuizCard questions={quiz} />
    </LessonSection>
    <LessonNav previous={{to:'/welcome',label:'Course map'}} next={{to:'/lecture-2',label:'Continue to Lecture 02'}} />
  </>;
}


