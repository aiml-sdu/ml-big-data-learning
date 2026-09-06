export type Point = { x: number; y: number };
export const squaredDistance = (a: Point, b: Point) => (a.x-b.x)**2 + (a.y-b.y)**2;
export const mean = (values: number[]) => values.reduce((a,b) => a+b,0)/values.length;
export const normalize = (value:number, min:number, max:number) => max === min ? 0 : (value-min)/(max-min);
export const silhouette = (a:number,b:number) => Math.max(a,b) === 0 ? 0 : (b-a)/Math.max(a,b);
export const samplePoints: Point[] = [
  ...Array.from({length:12},(_,i)=>({x:2+Math.sin(i*2.4)*(.3+i%4*.18),y:2+Math.cos(i*1.7)*(.3+i%3*.2)})),
  ...Array.from({length:12},(_,i)=>({x:7+Math.sin(i*2.1)*(.4+i%4*.18),y:3+Math.cos(i*1.9)*(.4+i%3*.2)})),
  ...Array.from({length:12},(_,i)=>({x:5+Math.sin(i*2.5)*(.4+i%4*.2),y:7+Math.cos(i*1.6)*(.4+i%3*.2)})),
  {x:1,y:8.5},{x:9,y:8},{x:9,y:1},
];
export function kmeansTrace(points:Point[],k:number,cycles:number) {
  let centers = Array.from({length:k},(_,i)=>({...points[Math.floor(i*points.length/k)]}));
  const assign = () => points.map(p => centers.reduce((best,c,i)=>squaredDistance(p,c)<squaredDistance(p,centers[best])?i:best,0));
  const states = [];
  for(let step=0;step<=cycles;step++) {
    const labels=assign();
    states.push({centers:centers.map(c=>({...c})),labels,sse:points.reduce((sum,p,i)=>sum+squaredDistance(p,centers[labels[i]]),0)});
    centers=centers.map((c,j)=>{const members=points.filter((_,i)=>labels[i]===j);return members.length?{x:mean(members.map(p=>p.x)),y:mean(members.map(p=>p.y))}:c;});
  }
  return states;
}
export function dbscan(points:Point[],eps:number,minPts:number) {
  const neighbors=points.map(p=>points.flatMap((q,j)=>squaredDistance(p,q)<=eps*eps?[j]:[]));
  const core=neighbors.map(n=>n.length>=minPts);
  const labels=points.map(()=>-1); let cluster=0;
  for(let i=0;i<points.length;i++) {
    if(!core[i]||labels[i]!==-1) continue;
    const queue=[i]; labels[i]=cluster;
    for(let cursor=0;cursor<queue.length;cursor++) {
      const p=queue[cursor];
      for(const j of neighbors[p]) if(labels[j]===-1){labels[j]=cluster;if(core[j])queue.push(j);}
    }
    cluster++;
  }
  return {labels,core,neighbors,clusters:cluster,types:labels.map((label,i)=>label===-1?'noise':core[i]?'core':'border')};
}
export const pcaPoints:Point[] = Array.from({length:15},(_,i)=>({x:(i-7)*.5,y:(i-7)*.42+Math.sin(i*2)*.55}));
export function projection(points:Point[],angle:number) {
  const center={x:mean(points.map(p=>p.x)),y:mean(points.map(p=>p.y))};
  const rad=angle*Math.PI/180, unit={x:Math.cos(rad),y:Math.sin(rad)};
  const projected=points.map(p=>{const t=(p.x-center.x)*unit.x+(p.y-center.y)*unit.y;return {x:center.x+t*unit.x,y:center.y+t*unit.y};});
  const total=points.reduce((sum,p)=>sum+squaredDistance(p,center),0);
  const error=points.reduce((sum,p,i)=>sum+squaredDistance(p,projected[i]),0);
  return {center,unit,projected,error,retained:total===0?1:1-error/total};
}
