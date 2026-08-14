import { ArrowRight, BarChart3, Database, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const lectures = [
  { number: '01', title: 'Thinking at Data Scale', subtitle: 'ML tasks, big-data dimensions, analytical workloads, and distributed abstractions', to: '/lecture-1', icon: BarChart3, color: 'from-indigo-500 to-cyan-500' },
  { number: '02', title: 'From Messy Data to Signal', subtitle: 'Explore, clean, transform, reduce, and understand PCA by manipulating data', to: '/lecture-2', icon: Database, color: 'from-emerald-500 to-teal-500' },
];

export default function CourseHome() {
  return <div>
    <section className="relative overflow-hidden border-b">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(59,130,246,.16),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,.13),transparent_35%)]" />
      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:py-28">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-primary shadow-sm"><Sparkles className="size-3.5" /> Learn by predicting, manipulating, and explaining</div>
        <h1 className="max-w-4xl text-5xl font-black tracking-[-0.04em] sm:text-7xl">See the idea.<br /><span className="text-primary">Then make it move.</span></h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">An interactive companion to Machine Learning and Big Data Analytics. Each lesson starts with intuition, lets you experiment, and ends with an independent challenge.</p>
        <Link to="/lecture-1" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground no-underline shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">Start Lecture 01 <ArrowRight className="size-4" /></Link>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">Pilot release</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Two complete learning journeys</h2></div><p className="hidden max-w-sm text-right text-sm text-muted-foreground sm:block">Progress is stored on this device. No sign-in is required.</p></div>
      <div className="grid gap-5 md:grid-cols-2">{lectures.map((lecture) => <Link key={lecture.number} to={lecture.to} className="group overflow-hidden rounded-3xl border bg-card no-underline shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className={`h-2 bg-gradient-to-r ${lecture.color}`} /><div className="p-7"><div className="flex items-center justify-between"><span className="text-sm font-black tracking-[.2em] text-muted-foreground">LECTURE {lecture.number}</span><lecture.icon className="size-6 text-primary" /></div><h3 className="mt-8 text-2xl font-bold tracking-tight">{lecture.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{lecture.subtitle}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">Explore lesson <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></div>
      </Link>)}</div>
    </section>
  </div>;
}
