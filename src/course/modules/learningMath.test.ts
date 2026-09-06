import {dbscan,kmeansTrace,normalize,pcaPoints,projection,samplePoints,silhouette} from './learningMath';
describe('course calculations',()=>{
  it('reproduces the income example and handles a constant range',()=>{
    expect(normalize(73000,12000,98000)).toBeCloseTo(.7093023);
    expect(normalize(4,4,4)).toBe(0);
  });
  it('does not increase k-means SSE and assigns every observation',()=>{
    for(const k of [2,3,4,5]){
      const trace=kmeansTrace(samplePoints,k,12);
      trace.forEach((s,i)=>{
        expect(s.labels).toHaveLength(samplePoints.length);
        expect(s.labels.every(l=>l>=0&&l<k)).toBe(true);
        expect(s.centers.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true);
        if(i)expect(s.sse).toBeLessThanOrEqual(trace[i-1].sse+1e-9);
      });
    }
  });
  it('distinguishes a core, border and noise point with an inclusive neighborhood',()=>{
    const r=dbscan([{x:0,y:0},{x:.1,y:0},{x:.2,y:0},{x:.4,y:0},{x:3,y:0}],.21,3);
    expect(r.types).toEqual(['core','core','core','border','noise']);
    expect(r.clusters).toBe(1);
    expect(r.neighbors[0]).toContain(0);
    expect(r.labels[3]).toBe(r.labels[0]);
  });
  it('produces only noise for isolated observations at a high density threshold',()=>{
    const r=dbscan([{x:0,y:0},{x:10,y:10}],.2,2);
    expect(r.clusters).toBe(0);expect(r.types).toEqual(['noise','noise']);
  });
  it('connects a favorable PCA angle to retained variance and squared error',()=>{
    const good=projection(pcaPoints,40),bad=projection(pcaPoints,130);
    expect(good.retained).toBeGreaterThan(.95);
    expect(good.error).toBeLessThan(bad.error);
    for(const a of [0,40,90,130,180])expect(projection(pcaPoints,a).retained).toBeGreaterThanOrEqual(0);
  });
  it('handles positive, negative, boundary and degenerate silhouettes',()=>{
    expect(silhouette(1,5)).toBe(.8);expect(silhouette(4,2)).toBe(-.5);
    expect(silhouette(2,2)).toBe(0);expect(silhouette(0,0)).toBe(0);
  });
});
