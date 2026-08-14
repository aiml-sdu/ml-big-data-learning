import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LessonHero({ number, title, subtitle, minutes, color }: { number:string; title:string; subtitle:string; minutes:number; color:string }) {
  return <section className={`relative overflow-hidden border-b bg-gradient-to-br ${color}`}><div className="mx-auto max-w-5xl px-5 py-14 sm:py-20"><p className="text-xs font-black uppercase tracking-[.24em] text-white/75">Lecture {number}</p><h1 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.035em] text-white sm:text-6xl">{title}</h1><p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{subtitle}</p><p className="mt-6 inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1.5 text-sm font-semibold text-white"><Clock3 className="size-4" /> {minutes} min interactive lesson</p></div></section>;
}

export function LessonSection({ id, kicker, title, children }: { id:string; kicker:string; title:string; children:ReactNode }) {
  return <section id={id} className="scroll-mt-24 border-b"><div className="mx-auto max-w-3xl px-5 py-12 sm:py-16"><p className="text-xs font-black uppercase tracking-[.2em] text-primary">{kicker}</p><h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2><div className="prose mt-6 max-w-none text-[1.05rem]">{children}</div></div></section>;
}

export function LessonNav({ previous, next }: { previous?:{to:string;label:string}; next?:{to:string;label:string} }) {
  return <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-10">{previous?<Link to={previous.to} className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold no-underline hover:bg-muted"><ArrowLeft className="size-4"/>{previous.label}</Link>:<span/>}{next&&<Link to={next.to} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground no-underline">{next.label}<ArrowRight className="size-4"/></Link>}</div>;
}

export function Insight({ children }: { children:ReactNode }) { return <div className="not-prose my-6 rounded-xl border-l-4 border-primary bg-primary/5 p-4 text-sm leading-relaxed"><strong className="mr-1 text-primary">Hold onto this:</strong>{children}</div>; }

