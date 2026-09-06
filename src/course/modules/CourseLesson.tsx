import { Check, Trophy, Zap } from 'lucide-react';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { KnowledgeCheck } from '@/components/KnowledgeCheck';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import type { ModulePageProps } from '../types';
import { lessons, type Lesson } from './lessonContent';
import { CourseActivity } from './CourseActivities';
import { useActivityState } from './useActivityState';
import { lectureTopics } from './index';

function TopicRound({lesson,onFinish}:{lesson:Lesson;onFinish:()=>void}){
  const steps:LearningFlowStep[]=[
    {id:'investigate',title:lesson.lab?'Your lab challenge':'Experiment first',sectionLabel:'Challenge round',render:({completeStep})=><CourseActivity key={lesson.slug} kind={lesson.activity} onComplete={completeStep}/>},
    ...lesson.sections.map(section=>({id:section.id,title:section.title,sectionLabel:'Discover the mechanism',autoComplete:true,render:()=> <>{section.paragraphs.map(p=><p key={p}>{p}</p>)}{section.code&&<pre className="course-code"><code>{section.code}</code></pre>}{section.table&&<div className="data-table-wrap"><table className="data-table"><thead><tr>{section.table[0].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{section.table.slice(1).map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}</>})),
    {id:'transfer',title:'Final challenge',sectionLabel:'Apply it to a new case',render:({completeStep})=><KnowledgeCheck storageKey={`${lesson.slug}-transfer`} {...lesson.check} onCorrect={completeStep}/>},
  ];
  return <LearningFlow storageKey={`${lesson.slug}-game-v2`} steps={steps} onFinish={onFinish}/>;
}
export default function CourseLesson({module}:ModulePageProps){
  const topics=lectureTopics[module.slug];
  const {completedSlugs,setCompleted}=useCourseProgress();
  const [selected,setSelected]=useActivityState(`${module.slug}-selected-topic`,topics[0],(v):v is string=>typeof v==='string'&&topics.includes(v));
  const [finished,setFinished]=useActivityState<string[]>(`${module.slug}-finished-topics`,[],(v):v is string[]=>Array.isArray(v)&&new Set(v).size===v.length&&v.every(s=>typeof s==='string'&&topics.includes(s)));
  const lesson=lessons.find(l=>l.slug===selected)!;
  const finish=()=>{const next=Array.from(new Set([...finished,selected]));setFinished(next);if(next.length===topics.length&&!completedSlugs.includes(module.slug))setCompleted(module.slug,true);};
  return <LearningModuleLayout module={module} manualCompletion={false}>
    <div className="lecture-score"><span><Zap size={18}/> <strong>{finished.length*50} XP</strong> earned</span><span>{finished.length} / {topics.length} rounds complete</span><span>50 XP per completed round</span></div>
    <div className="topic-selector" role="group" aria-label="Lecture challenge rounds">{topics.map((slug,i)=><button key={slug} className={`topic-button ${slug===selected?'is-selected':''}`} aria-pressed={slug===selected} onClick={()=>setSelected(slug)}><span>{finished.includes(slug)?<Check size={18}/>:String(i+1).padStart(2,'0')}</span>{lessons.find(l=>l.slug===slug)!.title}</button>)}</div>
    <div className="round-heading"><p className="eyebrow">Round {topics.indexOf(selected)+1} · {lesson.minutes} min</p><h2>{lesson.title}</h2><p>{lesson.summary}</p></div>
    {lesson.lab && import.meta.env.DEV && <p className="lab-download"><a className="button button-secondary" download href={`/__lab-notebook/${lesson.slug==='exploration-lab'?'Exercise2_data_exploration.ipynb':'Exercise3_clustering.ipynb'}`}>Download lab notebook</a><span> Run in Jupyter with the course dataset.</span></p>}
    <TopicRound key={selected} lesson={lesson} onFinish={finish}/>
    {finished.includes(selected)&&<div className="round-success" role="status"><Trophy size={30}/><div><h3>Round complete · 50 XP earned</h3><p>Your answers and explanations are saved. Replay for practice, or choose your next round.</p></div>{topics.indexOf(selected)<topics.length-1&&<button className="button button-primary" onClick={()=>setSelected(topics[topics.indexOf(selected)+1])}>Next round</button>}</div>}
    <p className="local-progress-note">XP records completed practice in this browser. It is not a grade or a measure of mastery.</p>
  </LearningModuleLayout>;
}
