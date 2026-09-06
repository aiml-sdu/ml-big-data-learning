import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {COURSE_MODULES} from './modules';
type Context={registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:{readOnlyHint:boolean};execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
export function useCourseTools(){
  const navigate=useNavigate();
  useEffect(()=>{
    const context=(document as Document&{modelContext?:Context}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    const tools=[
      {name:'get_course_outline',description:'Read the available lectures and their learning objectives.',inputSchema:{type:'object',additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>COURSE_MODULES.map(l=>({id:l.slug,title:l.title,objectives:l.objectives}))},
      {name:'open_lecture',description:'Navigate to a lecture. Does not answer questions, award XP, or mark work complete.',inputSchema:{type:'object',properties:{lectureId:{type:'string',enum:COURSE_MODULES.map(l=>l.slug)}},required:['lectureId'],additionalProperties:false},annotations:{readOnlyHint:false},execute:(input:unknown)=>{
        const id=input&&typeof input==='object'?(input as {lectureId?:unknown}).lectureId:null;
        if(typeof id!=='string'||!COURSE_MODULES.some(l=>l.slug===id))throw new Error('Choose a lecture ID from the course outline.');
        navigate(`/lectures/${id}`);return {lectureId:id,status:'navigation requested'};
      }},
    ];
    for(const tool of tools)try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser API; normal navigation remains available. */}
    return ()=>lifecycle.abort();
  },[navigate]);
}
