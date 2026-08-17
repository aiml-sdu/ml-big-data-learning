import { useMemo, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';

const taskCases = [
  { prompt: 'Predict next month's electricity demand from historical examples', answer: 'Supervised', why: 'Training examples pair inputs with a known numerical target.' },
  { prompt: 'Discover customer groups without predefined labels', answer: 'Unsupervised', why: 'The structure must be discovered from unlabeled data.' },
  { prompt: 'Learn a warehouse-routing policy through rewards and exploration', answer: 'Reinforcement', why: 'Actions change the state and feedback arrives as rewards.' },
];

export function TaskClassifier() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  return <div className="not-prose my-6 space-y-3 rounded-2xl border bg-card p-4 sm:p-6">
    {taskCases.map((item, index) => <div key={item.prompt} className="rounded-xl border bg-background p-4"><p className="font-semibold">{item.prompt}</p><div className="mt-3 flex flex-wrap gap-2">{['Supervised','Unsupervised','Reinforcement'].map((choice) => <button key={choice} onClick={() => setAnswers({...answers,[index]:choice})} className={`rounded-lg border px-3 py-2 text-sm font-medium ${answers[index] === choice ? (choice === item.answer ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300') : 'hover:bg-muted'}`}>{choice}</button>)}</div>{answers[index] && <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">{answers[index] === item.answer ? <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : <X className="mt-0.5 size-4 shrink-0 text-red-500" />}{item.why}</p>}</div>)}
  </div>;
}

const dimensions = [
  ['Volume','How much data must be retained?'],['Velocity','How quickly must new data be acted on?'],['Variety','How many formats and structures must coexist?'],['Veracity','How uncertain or unreliable is the data?'],
];

export function FourVLab() {
  const [values, setValues] = useState([55,35,65,40]);
  const highest = dimensions[values.indexOf(Math.max(...values))][0];
  return <div className="not-prose my-6 rounded-2xl border bg-slate-950 p-5 text-white sm:p-7"><div className="grid gap-5 sm:grid-cols-2">{dimensions.map(([name,desc],i) => <label key={name} className="block"><span className="flex justify-between text-sm font-bold"><span>{name}</span><span className="text-cyan-300">{values[i]}%</span></span><input aria-label={name} type="range" min="0" max="100" value={values[i]} onChange={(e) => { const next=[...values]; next[i]=Number(e.target.value); setValues(next); }} className="mt-2 w-full accent-cyan-400" /><span className="mt-1 block text-xs text-slate-400">{desc}</span></label>)}</div><div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Design pressure</p><p className="mt-1 text-sm">Your dominant concern is <strong>{highest}</strong>. The architecture should optimize for this constraint without pretending the other three disappear.</p></div></div>;
}

const workloads = [
  { q: 'Approve a card payment in 80 ms', a: 'OLTP' },
  { q: 'Aggregate five years of sales by country and brand', a: 'OLAP' },
  { q: 'Alert when a turbine sensor crosses a threshold', a: 'Streaming' },
];
export function WorkloadChallenge() {
  const [answers,setAnswers]=useState<Record<number,string>>({});
  return <div className="not-prose my-6 grid gap-3">{workloads.map((w,i)=><div key={w.q} className="rounded-xl border bg-card p-4"><p className="font-semibold">{w.q}</p><div className="mt-3 flex gap-2">{['OLTP','OLAP','Streaming'].map(c=><button key={c} onClick={()=>setAnswers({...answers,[i]:c})} className={`rounded-lg border px-3 py-2 text-sm ${answers[i]===c ? (c===w.a?'border-emerald-500 bg-emerald-500/10':'border-red-500 bg-red-500/10'):'hover:bg-muted'}`}>{c}</button>)}</div>{answers[i]&&<p className="mt-2 text-xs text-muted-foreground">{answers[i]===w.a?'Exactly.':'Try again: focus on latency, access pattern, and update frequency.'}</p>}</div>)}</div>;
}

const rawRows = [
  ['A-104','42','\u20AC58,000','Active'],['A-105','','\u20AC61,500','Active'],['A-106','-7','\u20AC57,200','active'],['A-106','39','\u20AC57,200','Active'],
];
export function DirtyDataLab() {
  const [fixed,setFixed]=useState<string[]>([]);
  const issues=['missing age','impossible age','inconsistent category','duplicate identity'];
  return <div className="not-prose my-6 rounded-2xl border bg-card p-4 sm:p-6"><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="border-b text-muted-foreground">{['Customer','Age','Income','Status'].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rawRows.map((row,i)=><tr key={i} className="border-b last:border-0">{row.map((cell,j)=><td key={j} className={`p-3 ${((i===1&&j===1)||(i===2&&j===1)||(i===2&&j===3)||(i===3&&j===0))?'bg-amber-500/10 font-semibold text-amber-700 dark:text-amber-300':''}`}>{cell||'?'}</td>)}</tr>)}</tbody></table></div><p className="mt-5 text-sm font-semibold">Mark every quality issue you can justify:</p><div className="mt-3 flex flex-wrap gap-2">{issues.map(issue=><button key={issue} onClick={()=>setFixed(fixed.includes(issue)?fixed.filter(x=>x!==issue):[...fixed,issue])} className={`rounded-full border px-3 py-1.5 text-sm ${fixed.includes(issue)?'border-primary bg-primary text-primary-foreground':'hover:bg-muted'}`}>{issue}</button>)}</div><p className="mt-4 text-sm text-muted-foreground">{fixed.length}/4 issues identified. Cleaning decisions require context: 'missing' and 'duplicate' do not automatically mean 'delete'.</p></div>;
}

export function ScalingLab() {
  const [income,setIncome]=useState(73000);
  const minmax=(income-12000)/(98000-12000);
  const z=(income-54000)/16000;
  return <div className="not-prose my-6 rounded-2xl border bg-card p-5 sm:p-7"><label className="text-sm font-bold">Annual income: €{income.toLocaleString()}</label><input aria-label="Annual income" type="range" min="12000" max="98000" step="1000" value={income} onChange={e=>setIncome(Number(e.target.value))} className="mt-3 w-full accent-primary"/><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-indigo-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">Min-max [0,1]</p><p className="mt-2 text-3xl font-black">{minmax.toFixed(3)}</p><p className="mt-1 text-xs text-muted-foreground">Position inside the observed range</p></div><div className="rounded-xl bg-emerald-500/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">Z-score</p><p className="mt-2 text-3xl font-black">{z.toFixed(2)}σ</p><p className="mt-1 text-xs text-muted-foreground">Distance from the mean in standard deviations</p></div></div></div>;
}

const points=[[12,72],[20,65],[28,61],[37,52],[45,47],[53,42],[62,34],[69,31],[77,22],[84,18]];
export function PCAExplorer() {
  const [angle,setAngle]=useState(-35);
  const quality=useMemo(()=>Math.max(0,100-Math.abs(angle+38)*1.7),[angle]);
  return <div className="not-prose my-6 rounded-2xl border bg-card p-5 sm:p-7"><div className="relative h-72 overflow-hidden rounded-xl bg-slate-950" aria-label="Point cloud and adjustable projection axis">{points.map(([x,y],i)=><span key={i} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,.7)]" style={{left:`${x}%`,top:`${y}%`}} />)}<span className="absolute left-1/2 top-1/2 h-1 w-[120%] origin-center -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(253,224,71,.6)]" style={{transform:`translate(-50%,-50%) rotate(${angle}deg)`}} /></div><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><label className="flex-1 text-sm font-bold">Rotate projection axis<input aria-label="PCA projection angle" type="range" min="-90" max="90" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="mt-2 block w-full accent-amber-400"/></label><div className="min-w-40 rounded-xl bg-muted p-3 text-center"><p className="text-xs text-muted-foreground">Variance captured</p><p className="text-2xl font-black">{quality.toFixed(0)}%</p></div></div><button onClick={()=>setAngle(-35)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary"><RotateCcw className="size-4"/>Reset</button></div>;
}



