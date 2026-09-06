import { useEffect, useState } from 'react';
import { courseStorageKey, readStorageJson, writeStorageJson } from '@/lib/courseStorage';
export function useActivityState<T>(id:string,initial:T,validate:(value:unknown)=>value is T) {
  const key=courseStorageKey('course-activity',id);
  const [state,setState]=useState<T>(()=>readStorageJson(key,value=>{
    if(!value||typeof value!=='object')return null;
    const saved=value as {version?:unknown;state?:unknown};
    return saved.version===1&&validate(saved.state)?saved.state:null;
  })??initial);
  useEffect(()=>{writeStorageJson(key,{version:1,state});},[key,state]);
  return [state,setState] as const;
}
export const numberIn=(min:number,max:number)=>(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
