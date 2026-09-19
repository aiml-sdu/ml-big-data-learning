import { useMemo, useState, type CSSProperties } from 'react';
import { Check, ChevronRight, RotateCcw, X } from 'lucide-react';

const palette = ['#6ea8ff', '#d49bff', '#77e0c1', '#ffc86b', '#ff8190'];

function Range({ label, value, min, max, step = 1, onChange, suffix = '' }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void; suffix?: string }) {
  return <label className="range-control"><span>{label}<b>{value}{suffix}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

export function BigDataModel() {
  const [volume, setVolume] = useState(35);
  const [velocity, setVelocity] = useState(20);
  const [variety, setVariety] = useState(25);
  const architecture = velocity > 68 ? 'Streaming architecture' : volume > 68 || variety > 68 ? 'Distributed batch platform' : 'Conventional analytics stack';
  const description = velocity > 68 ? 'Events must be buffered and processed continuously.' : volume > 68 || variety > 68 ? 'Storage and computation need to scale across workers.' : 'One analytical database can still serve the workload.';
  return <section className="game-shell">
    <div className="activity-kicker">System consequence explorer</div>
    <h2>Big data is a systems problem</h2>
    <p className="activity-prompt">Change the workload. Watch when a familiar database stops being the natural choice.</p>
    <div className="system-explorer">
      <div className="control-panel">
        <Range label="Volume" value={volume} min={5} max={100} onChange={setVolume} />
        <Range label="Velocity" value={velocity} min={5} max={100} onChange={setVelocity} />
        <Range label="Variety" value={variety} min={5} max={100} onChange={setVariety} />
      </div>
      <div className="architecture-viz" aria-label={`Recommended system: ${architecture}`}>
        <div className="source-cloud">Sources <span>{variety > 68 ? 'logs · text · tables · sensors' : 'structured records'}</span></div>
        <ChevronRight />
        <div className={`system-block ${architecture.includes('Streaming') ? 'hot' : ''}`}><small>Best fit</small><strong>{architecture}</strong><span>{description}</span></div>
        <div className="load-meter"><span style={{ width: `${Math.round((volume + velocity + variety) / 3)}%` }} /></div>
      </div>
    </div>
    <div className="insight-line"><b>Notice:</b> “Big” depends on whether the current system can store, move, and process the workload in time.</div>
  </section>;
}

const pipelineStages = [
  { id: 'capture', label: 'Capture', detail: 'Kafka receives events' },
  { id: 'process', label: 'Process', detail: 'Spark transforms the stream' },
  { id: 'store', label: 'Store', detail: 'A scalable store keeps results' },
  { id: 'decide', label: 'Decide', detail: 'A dashboard or alert acts' },
];

export function PipelineChallenge() {
  const [chosen, setChosen] = useState<string[]>([]);
  const [wrong, setWrong] = useState(false);
  const expected = pipelineStages[chosen.length]?.id;
  const choose = (id: string) => {
    if (id === expected) { setChosen([...chosen, id]); setWrong(false); } else { setWrong(true); }
  };
  const reset = () => { setChosen([]); setWrong(false); };
  return <section className="game-shell">
    <div className="activity-kicker">Pipeline challenge</div><h2>Build a real-time decision path</h2>
    <p className="activity-prompt">A card transaction may be fraudulent. Select the components in the order data must travel.</p>
    <div className="pipeline-slots">{pipelineStages.map((stage, index) => { const filled = chosen[index] === stage.id; return <div className={filled ? 'filled' : ''} key={stage.id}><span>{index + 1}</span>{filled ? <><b>{stage.label}</b><small>{stage.detail}</small></> : <em>Choose stage</em>}</div>; })}</div>
    <div className="stage-bank">{[pipelineStages[2], pipelineStages[0], pipelineStages[3], pipelineStages[1]].map((stage) => <button key={stage.id} disabled={chosen.includes(stage.id)} onClick={() => choose(stage.id)}>{stage.label}</button>)}</div>
    {wrong && <div className="feedback try"><strong>That component cannot act yet.</strong><span>Ask what must exist before it can do its job.</span></div>}
    {chosen.length === 4 && <div className="completion"><Check /> The event can now become a low-latency decision. <button className="text-button" onClick={reset}><RotateCcw /> Reset</button></div>}
  </section>;
}

const workloadCases = [
  { text: 'Authorize one card payment and update its account balance.', answer: 'OLTP', why: 'A small, consistent transaction needs low latency.' },
  { text: 'Compare five years of sales across countries and product families.', answer: 'OLAP', why: 'The query scans and aggregates a large historical range.' },
  { text: 'Reserve the last available seat without selling it twice.', answer: 'OLTP', why: 'Concurrency and transactional consistency are essential.' },
  { text: 'Find seasonal patterns across billions of clickstream events.', answer: 'OLAP', why: 'This is a read-heavy analytical scan.' },
  { text: 'Record a customer changing their delivery address.', answer: 'OLTP', why: 'This is a targeted operational update.' },
];

export function OLTPOLAPGame() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const item = workloadCases[index];
  const correct = choice === item.answer;
  return <section className="game-shell">
    <div className="activity-kicker">Workload game</div><h2>Route the database request</h2>
    <p className="activity-prompt">Decide whether each request belongs in the operational system or the analytical system.</p>
    <div className="workload-card"><small>Request {index + 1} of {workloadCases.length}</small><strong>{item.text}</strong></div>
    <div className="two-choice"><button className={choice==='OLTP'?(correct?'correct':'wrong'):''} onClick={()=>setChoice('OLTP')} disabled={correct}><b>OLTP</b><span>Short transactions · current state · frequent writes</span></button><button className={choice==='OLAP'?(correct?'correct':'wrong'):''} onClick={()=>setChoice('OLAP')} disabled={correct}><b>OLAP</b><span>Historical scans · aggregation · read-heavy</span></button></div>
    {choice && <div className={`feedback ${correct?'good':'try'}`} role="status"><strong>{correct?`${item.answer} is the better fit.`:'Try the other workload.'}</strong><span>{correct?item.why:'Focus on access pattern, latency, and update behavior.'}</span></div>}
    {correct && <button className="primary-button" onClick={()=>{setIndex((index+1)%workloadCases.length);setChoice(null);}}>{index===workloadCases.length-1?'Review again':'Next request'} <ChevronRight/></button>}
  </section>;
}

export function ParallelismLab() {
  const [workers,setWorkers]=useState(4);
  const [serial,setSerial]=useState(15);
  const fraction=serial/100;
  const speedup=1/(fraction+(1-fraction)/workers);
  const runtime=100/speedup;
  return <section className="game-shell"><div className="activity-kicker">Scaling lab</div><h2>Add workers, then find the ceiling</h2><p className="activity-prompt">Amdahl’s law exposes the part of a job that extra workers cannot accelerate.</p>
    <div className="viz-grid"><div className="worker-visual" aria-label={`${workers} workers, runtime ${runtime.toFixed(1)} seconds`}><div className="runtime-bar"><span style={{width:`${runtime}%`}}><b>{runtime.toFixed(1)} s</b></span></div><div className="workers">{Array.from({length:workers},(_,i)=><span key={i}>{i+1}</span>)}</div><div className="baseline">One-worker baseline: 100 s</div></div><div className="control-panel"><Range label="Workers" value={workers} min={1} max={16} onChange={setWorkers}/><Range label="Serial work" value={serial} min={0} max={60} onChange={setSerial} suffix="%"/><div className="metric-pair"><div><small>Speedup</small><b>{speedup.toFixed(2)}×</b></div><div><small>Efficiency</small><b>{Math.round(speedup/workers*100)}%</b></div></div><p className="microcopy">With {serial}% serial work, infinite workers could never exceed {(1/fraction || 99).toFixed(1)}× speedup.</p></div></div>
  </section>;
}

type DataIssue = 'missing' | 'duplicate' | 'outlier';
const originalRows = [
  { id: 1, age: '24', spend: '410', issue: null },
  { id: 2, age: '—', spend: '520', issue: 'missing' as DataIssue },
  { id: 3, age: '31', spend: '480', issue: null },
  { id: 4, age: '31', spend: '480', issue: 'duplicate' as DataIssue },
  { id: 5, age: '28', spend: '9,800', issue: 'outlier' as DataIssue },
];

export function DirtyDataLab() {
  const [fixed, setFixed] = useState<Set<DataIssue>>(new Set());
  const fix = (issue: DataIssue) => setFixed(new Set([...fixed, issue]));
  const complete = fixed.size === 3;
  return <section className="game-shell">
    <div className="activity-kicker">Data quality lab</div><h2>Repair before you model</h2>
    <p className="activity-prompt">The target is monthly spend. Diagnose each warning, then choose a defensible treatment.</p>
    <div className="data-lab">
      <div className="data-table"><div className="data-row header"><span>ID</span><span>Age</span><span>Spend</span><span>Status</span></div>{originalRows.map((row) => { const repaired = row.issue && fixed.has(row.issue); return <div className={`data-row ${row.issue && !repaired ? 'flagged' : ''}`} key={row.id}><span>{row.id}</span><span>{row.issue === 'missing' && repaired ? '29*' : row.age}</span><span>{row.issue === 'outlier' && repaired ? '980*' : row.spend}</span><span>{!row.issue ? 'Valid' : repaired ? 'Treated' : row.issue}</span></div>; })}</div>
      <div className="repair-panel">
        <button className={fixed.has('missing') ? 'done' : ''} onClick={() => fix('missing')}><b>Missing age</b><span>Impute with a documented median</span></button>
        <button className={fixed.has('duplicate') ? 'done' : ''} onClick={() => fix('duplicate')}><b>Duplicate row</b><span>Remove after checking its key</span></button>
        <button className={fixed.has('outlier') ? 'done' : ''} onClick={() => fix('outlier')}><b>Extreme spend</b><span>Verify, then correct the entry error</span></button>
      </div>
    </div>
    <div className={`quality-meter ${complete ? 'complete' : ''}`}><span style={{ width: `${40 + fixed.size * 20}%` }} /><b>{40 + fixed.size * 20}% trustworthy</b></div>
    {complete && <div className="insight-line"><b>Principle:</b> cleaning decisions need a reason. “Delete every unusual row” can erase the signal you want to learn.</div>}
  </section>;
}

export function OutlierInfluenceLab(){
  const [included,setIncluded]=useState(true);
  const base=[18,20,21,22,23,24,25,27,28]; const values=included?[...base,78]:base;
  const mean=values.reduce((a,b)=>a+b,0)/values.length; const sorted=[...values].sort((a,b)=>a-b); const median=sorted[Math.floor(sorted.length/2)];
  return <section className="game-shell"><div className="activity-kicker">Influence lab</div><h2>Mean and median tell different stories</h2><p className="activity-prompt">Toggle the unusual value. Decide whether it is an error only after seeing how it changes the summary.</p>
    <div className="viz-grid"><div className="number-line" role="img" aria-label={`Values from 18 to ${included?78:28}`}><div className="number-axis"/>{values.map((value,i)=><span key={`${value}-${i}`} className={value>50?'outlier':''} style={{left:`${6+(value-15)/68*88}%`}}><i/>{value}</span>)}<div className="mean-marker" style={{left:`${6+(mean-15)/68*88}%`}}>mean</div><div className="median-marker" style={{left:`${6+(median-15)/68*88}%`}}>median</div></div><div className="control-panel"><button className={`toggle ${included?'on':''}`} onClick={()=>setIncluded(!included)}><span/> {included?'Outlier included':'Outlier excluded'}</button><div className="metric-pair"><div><small>Mean</small><b>{mean.toFixed(1)}</b></div><div><small>Median</small><b>{median.toFixed(1)}</b></div></div><p>The mean moves toward the extreme observation. The median remains anchored by rank.</p></div></div></section>;
}

export function ScalingGeometry() {
  const [scaled, setScaled] = useState(false);
  const raw = [{ name: 'A', x: 22, y: 22, color: palette[0] }, { name: 'B', x: 78, y: 70, color: palette[1] }, { name: '?', x: 62, y: 34, color: '#fff' }];
  const pts = scaled ? [{ ...raw[0], x: 28, y: 58 }, { ...raw[1], x: 72, y: 45 }, { ...raw[2], x: 57, y: 52 }] : raw;
  const dist = (a: typeof pts[number], b: typeof pts[number]) => Math.hypot(a.x - b.x, a.y - b.y);
  const nearest = dist(pts[2], pts[0]) < dist(pts[2], pts[1]) ? 'A' : 'B';
  return <section className="game-shell">
    <div className="activity-kicker">Geometry experiment</div><h2>Units silently choose the neighbor</h2>
    <p className="activity-prompt">Income spans thousands of kroner while age spans decades. Toggle standardization and watch the geometry change.</p>
    <div className="viz-grid">
      <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="Distance comparison before and after scaling">
        {[20,40,60,80].map((v) => <g key={v}><line x1={v} y1="8" x2={v} y2="90" /><line x1="10" y1={v} x2="94" y2={v} /></g>)}
        <line className="distance-line" x1={pts[2].x} y1={100-pts[2].y} x2={pts[0].x} y2={100-pts[0].y} />
        <line className="distance-line" x1={pts[2].x} y1={100-pts[2].y} x2={pts[1].x} y2={100-pts[1].y} />
        {pts.map((p) => <g key={p.name}><circle cx={p.x} cy={100-p.y} r={p.name === '?' ? 5 : 4} fill={p.color} /><text x={p.x+5} y={98-p.y}>{p.name}</text></g>)}
      </svg>
      <div className="explanation-panel"><button className={`toggle ${scaled ? 'on' : ''}`} onClick={() => setScaled(!scaled)}><span /> {scaled ? 'Standardized features' : 'Raw units'}</button><div className="nearest-result"><small>Nearest group</small><strong style={{ color: nearest === 'A' ? palette[0] : palette[1] }}>{nearest}</strong></div><p>{scaled ? 'Each feature now contributes in standard-deviation units.' : 'The large numerical range dominates Euclidean distance.'}</p></div>
    </div>
  </section>;
}

const skewValues=[1,1.2,1.5,1.8,2,2.4,3,4,6,10,18,38,80];
export function FeatureTransformLab(){const [mode,setMode]=useState<'raw'|'log'>('raw'); const shown=skewValues.map(v=>mode==='raw'?v:Math.log1p(v)); const max=Math.max(...shown); return <section className="game-shell"><div className="activity-kicker">Transform lab</div><h2>Open up a compressed distribution</h2><p className="activity-prompt">The values keep their order, but a log transform reduces the dominance of the long right tail.</p><div className="viz-grid"><div className="distribution-strip" role="img" aria-label={`${mode} transformed skewed values`}>{shown.map((v,i)=><span key={i} style={{left:`${4+v/max*92}%`}}><i/><small>{skewValues[i]}</small></span>)}<div className="distribution-axis"><b>{mode==='raw'?'Original value':'log(1 + value)'}</b></div></div><div className="control-panel"><div className="segmented"><button className={mode==='raw'?'active':''} onClick={()=>setMode('raw')}>Raw</button><button className={mode==='log'?'active':''} onClick={()=>setMode('log')}>Log transform</button></div><p>{mode==='raw'?'Most observations are squeezed into the left edge because 80 sets the scale.':'Small observations separate while the extreme tail contracts.'}</p><div className="insight-line"><b>Order preserved:</b> every larger raw value remains larger after the transform.</div></div></div></section>}

const pcaPoints = [[18,68],[25,61],[32,57],[39,49],[47,48],[53,39],[61,36],[69,27],[77,25],[84,17]];
export function PCAExplorer() {
  const [angle, setAngle] = useState(35);
  const theta = angle * Math.PI / 180;
  const center = [50, 45];
  const projections = pcaPoints.map(([x,y]) => (x-center[0])*Math.cos(theta) - (y-center[1])*Math.sin(theta));
  const mean = projections.reduce((a,b)=>a+b,0)/projections.length;
  const variance = projections.reduce((sum,v)=>sum+(v-mean)**2,0)/projections.length;
  const score = Math.min(100, Math.round(variance / 8));
  const dx = Math.cos(theta)*48, dy = -Math.sin(theta)*48;
  return <section className="game-shell">
    <div className="activity-kicker">Projection lab</div><h2>Find the direction that keeps the variation</h2>
    <p className="activity-prompt">Rotate the one-dimensional axis. PCA chooses the direction where the projected points spread out most.</p>
    <div className="viz-grid">
      <svg className="plot" viewBox="0 0 100 100" role="img" aria-label="PCA projection axis">
        {pcaPoints.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.2" fill="#77e0c1" />)}
        <line className="axis-line" x1={center[0]-dx} y1={center[1]-dy} x2={center[0]+dx} y2={center[1]+dy} />
        {pcaPoints.map(([x,y],i)=>{const t=(x-center[0])*Math.cos(theta)+(y-center[1])*(-Math.sin(theta)); const px=center[0]+t*Math.cos(theta), py=center[1]+t*(-Math.sin(theta)); return <g key={`p${i}`}><line className="projection-line" x1={x} y1={y} x2={px} y2={py}/><circle cx={px} cy={py} r="1.7" fill="#ffc86b"/></g>;})}
      </svg>
      <div className="control-panel"><Range label="Axis angle" value={angle} min={0} max={180} onChange={setAngle} suffix="°" /><div className="variance-card"><small>Retained variation</small><strong>{score}%</strong><div><span style={{width:`${score}%`}} /></div></div><p className="microcopy">The first principal component is the axis with maximum projected variance.</p></div>
    </div>
  </section>;
}

const clusterPoints = [[16,65],[21,72],[25,61],[29,69],[37,55],[43,51],[48,57],[52,45],[58,50],[66,30],[71,35],[77,25],[82,31],[86,22]];
function colorForK([x,y]: number[], k: number) { if(k===2) return x<53?palette[0]:palette[1]; if(k===3) return x<37?palette[0]:x<64?palette[1]:palette[2]; return x<30?palette[0]:x<51?palette[1]:x<72?palette[2]:palette[3]; }
export function AmbiguityGame() {
  const [k,setK]=useState(2);
  return <section className="game-shell"><div className="activity-kicker">Perception challenge</div><h2>The data do not announce one true K</h2><p className="activity-prompt">The same points support several defensible partitions. Compare them before choosing an algorithm.</p>
    <div className="viz-grid"><svg className="plot" viewBox="0 0 100 100">{clusterPoints.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="4" fill={colorForK(p,k)} />)}</svg><div className="control-panel"><div className="segmented">{[2,3,4].map(v=><button key={v} className={k===v?'active':''} onClick={()=>setK(v)}>{v} clusters</button>)}</div><p>{k===2?'A broad split emphasizes global separation.':k===3?'A middle group captures the transition region.':'A finer partition reveals local subgroups but may over-segment.'}</p><div className="insight-line"><b>Clustering is a modelling choice:</b> geometry, scale, density, and purpose all affect the answer.</div></div></div>
  </section>;
}

const kmPoints = [[18,72],[23,65],[28,76],[35,63],[61,31],[67,37],[73,27],[80,34],[55,73],[63,68],[70,78],[77,71]];
const startCenters = [[30,45],[58,55],[82,58]];
function iterateKMeans(iterations:number){let centers=startCenters.map(p=>[...p]); let assignments:number[]=[]; for(let step=0;step<=iterations;step++){assignments=kmPoints.map(p=>centers.reduce((best,c,i)=>Math.hypot(p[0]-c[0],p[1]-c[1])<Math.hypot(p[0]-centers[best][0],p[1]-centers[best][1])?i:best,0)); if(step<iterations) centers=centers.map((c,i)=>{const group=kmPoints.filter((_,j)=>assignments[j]===i); return group.length?[group.reduce((s,p)=>s+p[0],0)/group.length,group.reduce((s,p)=>s+p[1],0)/group.length]:c;});} return {centers,assignments};}
export function KMeansLab(){const [step,setStep]=useState(0); const {centers,assignments}=useMemo(()=>iterateKMeans(step),[step]); const sse=kmPoints.reduce((sum,p,i)=>sum+(p[0]-centers[assignments[i]][0])**2+(p[1]-centers[assignments[i]][1])**2,0); return <section className="game-shell"><div className="activity-kicker">Algorithm game</div><h2>Alternate assignment and update</h2><p className="activity-prompt">Advance the loop. Points choose their nearest centroid; centroids move to the mean of their assigned points.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 100 100">{kmPoints.map((p,i)=><g key={i}><line className="assignment-line" x1={p[0]} y1={p[1]} x2={centers[assignments[i]][0]} y2={centers[assignments[i]][1]}/><circle cx={p[0]} cy={p[1]} r="3.2" fill={palette[assignments[i]]}/></g>)}{centers.map((c,i)=><g key={`c${i}`}><circle cx={c[0]} cy={c[1]} r="6" fill="#ffffff" stroke={palette[i]} strokeWidth="2.5"/><text x={c[0]} y={c[1]+2} textAnchor="middle">×</text></g>)}</svg><div className="control-panel"><div className="step-label"><small>Iteration</small><strong>{step}</strong></div><div className="metric"><span>Within-cluster SSE</span><b>{Math.round(sse)}</b></div><button className="primary-button inline" onClick={()=>setStep(Math.min(4,step+1))} disabled={step===4}>{step===4?'Converged':'Run one iteration'} <ChevronRight /></button><button className="text-button" onClick={()=>setStep(0)}><RotateCcw/> Restart</button></div></div></section>;}

export function DendrogramCut(){const [cut,setCut]=useState(52); const groups=cut>72?1:cut>48?2:cut>28?3:5; const colors=groups===1?[0,0,0,0,0]:groups===2?[0,0,0,1,1]:groups===3?[0,0,1,2,2]:[0,1,2,3,4]; return <section className="game-shell"><div className="activity-kicker">Dendrogram lab</div><h2>One tree, several valid partitions</h2><p className="activity-prompt">Move the cut height. Every branch crossed by the cut becomes one cluster.</p><div className="viz-grid"><svg className="plot dendrogram" viewBox="0 0 100 100" role="img" aria-label={`Dendrogram cut into ${groups} clusters`}><g className="tree-lines"><path d="M12 88V62H25V88 M18.5 62V45H45 M35 88V72H48V88 M41.5 72V45 M31.5 45V22H75 M60 88V68H73V88 M66.5 68V48H88 M82 88V48 M77.25 48V22"/></g><line className="cut-line" x1="6" y1={100-cut} x2="94" y2={100-cut}/>{[12,25,35,48,60,73,82,88].map((x,i)=><circle key={x} cx={x} cy="88" r="3" fill={palette[colors[Math.min(i,4)]%palette.length]}/>)}</svg><div className="control-panel"><Range label="Cut height" value={cut} min={12} max={86} onChange={setCut}/><div className="nearest-result"><small>Clusters produced</small><strong>{groups}</strong></div><p>A lower cut keeps more small branches separate. A higher cut merges them into broader groups.</p></div></div></section>}

const dbPoints=[[15,70],[19,66],[22,73],[25,68],[28,75],[37,48],[41,53],[45,47],[49,52],[54,48],[67,27],[72,31],[76,25],[81,30],[86,22],[54,79],[91,68]];
function dbscan(eps:number,minPts:number){const labels=Array(dbPoints.length).fill(-2); let cluster=0; const neighbors=(i:number)=>dbPoints.map((p,j)=>Math.hypot(p[0]-dbPoints[i][0],p[1]-dbPoints[i][1])<=eps?j:-1).filter(j=>j>=0); for(let i=0;i<dbPoints.length;i++){if(labels[i]!==-2)continue; const near=neighbors(i); if(near.length<minPts){labels[i]=-1;continue;} labels[i]=cluster; const queue=[...near]; while(queue.length){const j=queue.shift()!; if(labels[j]===-1)labels[j]=cluster; if(labels[j]!==-2)continue; labels[j]=cluster; const n=neighbors(j); if(n.length>=minPts) for(const q of n) if(!queue.includes(q))queue.push(q);} cluster++;} return {labels,clusters:cluster,noise:labels.filter(v=>v===-1).length};}
export function DBSCANTuner(){const [eps,setEps]=useState(9); const [minPts,setMinPts]=useState(3); const result=useMemo(()=>dbscan(eps,minPts),[eps,minPts]); return <section className="game-shell"><div className="activity-kicker">Density lab</div><h2>Tune neighborhood and density together</h2><p className="activity-prompt">DBSCAN grows clusters through connected core points. Small parameter changes can join, split, or erase structure.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 100 100">{dbPoints.map((p,i)=><g key={i}><circle cx={p[0]} cy={p[1]} r="4" fill={result.labels[i]<0?'#687493':palette[result.labels[i]%palette.length]}/>{i===0&&<circle cx={p[0]} cy={p[1]} r={eps} fill="none" stroke="#34435a" strokeDasharray="2 2" opacity=".5"/>}</g>)}</svg><div className="control-panel"><Range label="ε neighborhood" value={eps} min={5} max={18} onChange={setEps}/><Range label="Minimum points" value={minPts} min={2} max={6} onChange={setMinPts}/><div className="metric-pair"><div><small>Clusters</small><b>{result.clusters}</b></div><div><small>Noise points</small><b>{result.noise}</b></div></div><p className="microcopy">The outlined radius shows ε around one point. Grey points are currently noise.</p></div></div></section>;}

export function SilhouetteExplorer(){const [separation,setSeparation]=useState(32); const overlap=Math.max(0,55-separation); const silhouette=Math.max(-.2,Math.min(.95,(separation-12)/55)); const left=clusterPoints.slice(0,7).map(([x,y])=>[x-overlap/3,y]); const right=clusterPoints.slice(7).map(([x,y])=>[x+separation-32+overlap/3,y]); return <section className="game-shell"><div className="activity-kicker">Validation lab</div><h2>Balance cohesion against separation</h2><p className="activity-prompt">Move the clusters. Silhouette improves when points stay close to their own cluster and far from the nearest alternative.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 120 100">{left.map((p,i)=><circle key={`l${i}`} cx={p[0]} cy={p[1]} r="4" fill={palette[0]}/>)}{right.map((p,i)=><circle key={`r${i}`} cx={p[0]} cy={p[1]} r="4" fill={palette[1]}/>)}</svg><div className="control-panel"><Range label="Cluster separation" value={separation} min={8} max={58} onChange={setSeparation}/><div className={`silhouette-score ${silhouette>.5?'good-score':''}`}><small>Approx. silhouette</small><strong>{silhouette.toFixed(2)}</strong><span>{silhouette>.7?'Strong separation':silhouette>.4?'Reasonable structure':silhouette>0?'Overlapping groups':'Likely misassignment'}</span></div><p className="microcopy">For a point i: s(i) compares its average distance within the cluster with its nearest other cluster.</p></div></div></section>}

const regressionPoints=[[12,25],[22,29],[30,41],[38,40],[48,55],[58,53],[68,70],[76,72],[86,83]];
const predict=(x:number,slope:number,intercept:number)=>intercept+slope*x;
const mse=(slope:number,intercept:number)=>regressionPoints.reduce((sum,[x,y])=>sum+(y-predict(x,slope,intercept))**2,0)/regressionPoints.length;
export function FitLineGame(){const [slope,setSlope]=useState(.45); const [intercept,setIntercept]=useState(22); const error=mse(slope,intercept); return <section className="game-shell"><div className="activity-kicker">Estimation game</div><h2>Fit the line before calculating it</h2><p className="activity-prompt">Adjust slope and intercept. Your goal is to minimize the average squared vertical error.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 100 100">{regressionPoints.map((p,i)=><circle key={i} cx={p[0]} cy={100-p[1]} r="3.5" fill="#ffc86b"/>)}<line className="regression-line" x1="5" y1={100-predict(5,slope,intercept)} x2="95" y2={100-predict(95,slope,intercept)}/></svg><div className="control-panel"><Range label="Slope" value={slope} min={0} max={1.2} step={.05} onChange={setSlope}/><Range label="Intercept" value={intercept} min={0} max={40} onChange={setIntercept}/><div className={`mse-score ${error<30?'great':''}`}><small>Mean squared error</small><strong>{error.toFixed(1)}</strong><span>{error<30?'Excellent fit':error<100?'Getting close':'Keep adjusting'}</span></div></div></div></section>;}

export function LossVisualizer(){const [slope,setSlope]=useState(.7); const [intercept,setIntercept]=useState(12); const errors=regressionPoints.map(([x,y])=>({x,y,p:predict(x,slope,intercept),sq:(y-predict(x,slope,intercept))**2})); return <section className="game-shell"><div className="activity-kicker">Error visualizer</div><h2>Squaring makes every miss positive</h2><p className="activity-prompt">Residuals are vertical distances. MSE squares them, so large misses carry disproportionate weight.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 100 100">{errors.map((e,i)=><g key={i}><line className="residual-line" x1={e.x} y1={100-e.y} x2={e.x} y2={100-e.p}/><circle cx={e.x} cy={100-e.y} r="3" fill="#ffc86b"/></g>)}<line className="regression-line" x1="5" y1={100-predict(5,slope,intercept)} x2="95" y2={100-predict(95,slope,intercept)}/></svg><div className="control-panel"><Range label="Slope" value={slope} min={0} max={1.2} step={.05} onChange={setSlope}/><Range label="Intercept" value={intercept} min={0} max={40} onChange={setIntercept}/><div className="error-bars">{errors.map((e,i)=><span key={i} style={{height:`${Math.min(100,e.sq/5)}%`}} title={`Squared error ${e.sq.toFixed(1)}`}/>)}</div><small>Squared error by point</small></div></div></section>;}

function fitOLS(points:number[][]){const mx=points.reduce((s,p)=>s+p[0],0)/points.length,my=points.reduce((s,p)=>s+p[1],0)/points.length;const slope=points.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/points.reduce((s,p)=>s+(p[0]-mx)**2,0);return {slope,intercept:my-slope*mx};}
export function RegressionOutlierLab(){const [included,setIncluded]=useState(false); const [height,setHeight]=useState(18); const points=included?[...regressionPoints,[94,height]]:regressionPoints; const fit=fitOLS(points); return <section className="game-shell"><div className="activity-kicker">Influence lab</div><h2>A distant x-value can rotate the model</h2><p className="activity-prompt">Add a high-leverage observation, then move its outcome. Watch the least-squares line respond.</p><div className="viz-grid"><svg className="plot" viewBox="0 0 105 100">{points.map((p,i)=><circle key={i} cx={p[0]} cy={100-p[1]} r={i===points.length-1&&included?5:3.4} fill={i===points.length-1&&included?'#ff8190':'#ffc86b'}/>) }<line className="regression-line" x1="5" y1={100-predict(5,fit.slope,fit.intercept)} x2="100" y2={100-predict(100,fit.slope,fit.intercept)}/></svg><div className="control-panel"><button className={`toggle ${included?'on':''}`} onClick={()=>setIncluded(!included)}><span/> {included?'Leverage point included':'Leverage point excluded'}</button>{included&&<Range label="Outlier outcome" value={height} min={5} max={95} onChange={setHeight}/>}<div className="metric-pair"><div><small>Slope</small><b>{fit.slope.toFixed(2)}</b></div><div><small>Intercept</small><b>{fit.intercept.toFixed(1)}</b></div></div><p>The far-right point has leverage because changing its y-value strongly changes the fitted slope.</p></div></div></section>}

export function SolverComparison(){const [rows,setRows]=useState(1000); const [features,setFeatures]=useState(12); const directCost=features**3/1e4+rows*features**2/1e5; const gradientCost=rows*features/2e4; const recommendation=features>120||rows>30000?'Gradient descent':'Closed-form solution'; return <section className="game-shell"><div className="activity-kicker">Solver comparison</div><h2>Same objective, different route</h2><p className="activity-prompt">Change dataset shape. Direct matrix inversion becomes expensive as the feature count grows.</p><div className="viz-grid"><div className="solver-race"><div><b>Closed form</b><span style={{width:`${Math.min(100,directCost)}%`}}/><small>One exact matrix solve</small></div><div><b>Gradient descent</b><span style={{width:`${Math.min(100,gradientCost)}%`}}/><small>Many cheap iterative updates</small></div></div><div className="control-panel"><Range label="Rows" value={rows} min={1000} max={100000} step={1000} onChange={setRows}/><Range label="Features" value={features} min={2} max={300} step={2} onChange={setFeatures}/><div className="recommendation"><small>Practical choice here</small><strong>{recommendation}</strong></div><p>Closed form is attractive for modest feature spaces. Iterative optimization avoids a large matrix inverse and scales to larger problems.</p></div></div></section>}

function gradientStep(slope:number,intercept:number,rate:number){let ds=0,di=0; for(const [x,y] of regressionPoints){const err=predict(x,slope,intercept)-y; ds+=2*err*x/regressionPoints.length; di+=2*err/regressionPoints.length;} return {slope:slope-rate*ds/100,intercept:intercept-rate*di};}
export function GradientDescentLab(){const [rate,setRate]=useState(.3); const [state,setState]=useState({slope:.05,intercept:8,steps:0}); const history=useMemo(()=>{let s={slope:.05,intercept:8}; const h=[{...s,error:mse(s.slope,s.intercept)}]; for(let i=0;i<24;i++){s=gradientStep(s.slope,s.intercept,rate);h.push({...s,error:mse(s.slope,s.intercept)});}return h;},[rate]); const run=()=>{const next=history[Math.min(24,state.steps+1)];setState({slope:next.slope,intercept:next.intercept,steps:Math.min(24,state.steps+1)});}; const maxErr=Math.max(...history.map(h=>h.error)); return <section className="game-shell"><div className="activity-kicker">Optimization lab</div><h2>Choose a step size that learns steadily</h2><p className="activity-prompt">Gradient descent follows the local downhill direction. Too small crawls; too large can overshoot.</p><div className="viz-grid"><svg className="plot loss-chart" viewBox="0 0 100 100"><polyline points={history.map((h,i)=>`${8+i*3.5},${90-h.error/maxErr*72}`).join(' ')} fill="none" stroke="#6ea8ff" strokeWidth="2"/><circle cx={8+state.steps*3.5} cy={90-history[state.steps].error/maxErr*72} r="4" fill="#ffc86b"/><text x="8" y="97">step 0</text><text x="76" y="97">step 24</text></svg><div className="control-panel"><Range label="Learning rate" value={rate} min={.05} max={1.2} step={.05} onChange={(value)=>{setRate(value);setState({slope:.05,intercept:8,steps:0});}}/><div className="metric-pair"><div><small>Step</small><b>{state.steps}</b></div><div><small>MSE</small><b>{mse(state.slope,state.intercept).toFixed(0)}</b></div></div><button className="primary-button inline" onClick={run} disabled={state.steps===24}>Take one gradient step <ChevronRight/></button><button className="text-button" onClick={()=>setState({slope:.05,intercept:8,steps:0})}><RotateCcw/> Restart</button></div></div></section>;}

type Question={q:string;options:string[];correct:number;why:string};
const quizzes:Record<string,Question[]>={
  'practice-1':[
    {q:'A retailer discovers shopper segments without segment labels. Which learning signal is available?',options:['Known targets','Hidden structure only','Rewards over time','Masked tokens'],correct:1,why:'Clustering searches for structure without provided labels.'},
    {q:'Which workload characteristic most directly creates the need for stream processing?',options:['Volume','Velocity','Veracity','Dimensionality'],correct:1,why:'Velocity creates a time constraint: the system must process events as they arrive.'},
    {q:'Why separate OLTP and OLAP workloads?',options:['They use different programming languages','Analytical scans can interfere with low-latency transactions','OLTP cannot store numbers','OLAP requires labels'],correct:1,why:'Their access patterns and latency requirements conflict.'},
    {q:'A workload makes many small writes and must avoid conflicting updates. Which system is the natural fit?',options:['OLAP warehouse','OLTP database','PCA pipeline','Batch-only file archive'],correct:1,why:'OLTP systems are designed for short, concurrent, consistent transactions.'},
    {q:'Why does adding workers eventually give little extra speedup?',options:['Workers become less intelligent','Serial work and coordination remain','Data labels disappear','Storage becomes supervised'],correct:1,why:'The non-parallel fraction becomes the runtime bottleneck as worker count grows.'},
    {q:'What is the role of a message broker in a streaming architecture?',options:['Train every model','Buffer and distribute incoming events','Replace all databases','Normalize features'],correct:1,why:'A broker decouples producers from consumers and absorbs bursts of incoming events.'},
  ],
  'practice-2':[
    {q:'Why can standardization change a nearest-neighbor result?',options:['It removes rows','It changes feature contributions to distance','It creates labels','It guarantees normality'],correct:1,why:'Distance depends on scale, so large numerical ranges dominate without scaling.'},
    {q:'What does the first principal component maximize?',options:['Class accuracy','Projected variance','Number of features','Mean value'],correct:1,why:'PCA finds the direction that retains the greatest variance.'},
    {q:'A value is extreme but valid. What is the best first action?',options:['Delete it','Replace it with zero','Investigate its cause and modelling impact','Duplicate it'],correct:2,why:'Outliers may be errors or valuable rare cases; treatment requires context.'},
    {q:'Which summary is usually more resistant to one extreme value?',options:['Mean','Median','Variance','Range'],correct:1,why:'The median depends on rank, so one extreme magnitude moves it much less.'},
    {q:'What does a log transform usually do to a long right tail?',options:['Reverses the order','Expands the tail','Compresses large values while preserving order','Creates class labels'],correct:2,why:'The logarithm grows slowly, reducing relative spacing among very large values.'},
    {q:'Why should preprocessing be learned only from the training split?',options:['To prevent information leakage from validation or test data','To make plots brighter','To increase the row count','To guarantee linearity'],correct:0,why:'Fitting preprocessing on held-out data leaks information into model development.'},
  ],
  'practice-3':[
    {q:'What happens during the K-means update step?',options:['Points become centroids','Centroids move to assigned-point means','K increases','Noise is removed'],correct:1,why:'Assignment and centroid-update steps alternate until stable.'},
    {q:'Which method naturally marks isolated points as noise?',options:['K-means','PCA','DBSCAN','Linear regression'],correct:2,why:'DBSCAN distinguishes core, border, and noise points through density.'},
    {q:'Why can two sensible clusterings disagree?',options:['One must contain a bug','Clusters depend on representation, scale, parameters, and purpose','All clustering is random','Only labels define clusters'],correct:1,why:'Clustering structure is not independent of modelling choices.'},
    {q:'What does cutting a dendrogram at a lower height usually produce?',options:['Fewer broader clusters','More smaller clusters','More features','A regression line'],correct:1,why:'A lower cut intersects more unmerged branches.'},
    {q:'A silhouette value near 1 suggests:',options:['Strong cohesion and separation','Random labels','A very large learning rate','No variance'],correct:0,why:'The point is much closer to its own cluster than to the nearest alternative.'},
    {q:'Why can K-means struggle with crescent-shaped clusters?',options:['It requires text data','Its squared-distance objective favors compact centroid-based groups','It cannot compute means','It always finds noise'],correct:1,why:'A single centroid does not represent a curved non-convex region well.'},
  ],
  'practice-4':[
    {q:'A residual is:',options:['The predicted value','Observed minus predicted value','The slope','The learning rate'],correct:1,why:'A residual is the vertical prediction error for one observation.'},
    {q:'Why does MSE emphasize large errors?',options:['It takes their square','It removes their sign only','It divides by the slope','It ranks points'],correct:0,why:'Squaring makes a residual twice as large contribute four times as much.'},
    {q:'A learning rate is far too large. What is likely?',options:['The loss always reaches zero','Updates overshoot and may diverge','The intercept disappears','Features standardize themselves'],correct:1,why:'Large steps can repeatedly jump across the minimum or move outward.'},
    {q:'Why does a far-away x-value have high leverage?',options:['It is far from the mean of the inputs','Its residual is always zero','It has a missing target','It removes the intercept'],correct:0,why:'A point far from the center of x can strongly affect the fitted slope.'},
    {q:'When is the closed-form solution especially attractive?',options:['A modest number of features and a manageable matrix solve','An infinite feature space','Streaming data that never ends','Only when labels are missing'],correct:0,why:'Direct linear algebra is simple and exact when the feature matrix is not too large.'},
    {q:'If every residual doubles, what happens to its squared contribution?',options:['It doubles','It halves','It quadruples','It stays equal'],correct:2,why:'Squaring turns (2e)² into 4e².'},
  ],
};

type TutorialTask = {
  title: string;
  outcome: string;
  prompt: string;
  starter: string;
  hint: string;
  question: string;
  options: string[];
  correct: number;
  why: string;
};

type TutorialLabDefinition = {
  title: string;
  source: string;
  dataset: string;
  duration: string;
  tasks: TutorialTask[];
};

const tutorialLabs: Record<number, TutorialLabDefinition> = {
  1: {
    title: 'From Python values to a data question',
    source: 'Week 1 · 00_python_introduction.ipynb',
    dataset: 'Movie metadata + small NumPy arrays',
    duration: '45–60 min',
    tasks: [
      { title: 'Transform a sequence', outcome: 'Use a function and list comprehension deliberately.', prompt: 'Write a function that squares each number and keeps only odd results. Before running it, predict the output for [1, 2, 3, 4, 5].', starter: 'def odd_squares(values):\n    squared = [___ for x in values]\n    return [x for x in squared if ___]\n\nodd_squares([1, 2, 3, 4, 5])', hint: 'Square with x ** 2. An integer is odd when x % 2 == 1.', question: 'What should the function return?', options: ['[1, 3, 5]', '[1, 9, 25]', '[4, 16]', '[1, 4, 9, 16, 25]'], correct: 1, why: 'Squaring preserves odd/even parity, then the second comprehension keeps the odd squared values.' },
      { title: 'Build a distance view', outcome: 'Connect an array calculation to a visualization.', prompt: 'Create two small 2D point clusters, stack them, and compute every pairwise Euclidean distance. Display the resulting matrix as a heatmap.', starter: 'X = np.vstack([cluster_a, cluster_b])\nD = np.sqrt(((X[:, None, :] - X[None, :, :]) ** 2).sum(axis=___))\nplt.imshow(D, cmap="viridis")', hint: 'After broadcasting, the last axis holds the squared coordinate differences for each point pair.', question: 'What pattern indicates two well-separated clusters?', options: ['A random checkerboard', 'Two dark diagonal blocks and brighter off-blocks', 'One uniformly bright square', 'Only the main diagonal is visible'], correct: 1, why: 'Distances are small within each cluster and larger across clusters, creating block structure.' },
      { title: 'Query the movie table', outcome: 'Translate a plain-language question into Pandas operations.', prompt: 'Load moviemetadata.csv, keep Action films, sort by IMDb score, and inspect the ten highest-rated titles.', starter: 'movies = pd.read_csv("moviemetadata.csv")\naction = movies[movies["genres"].str.contains("Action", na=False)]\ntop10 = action.sort_values("imdb_score", ascending=___).head(10)', hint: 'Highest scores should appear first, so the sort direction must be descending.', question: 'Which setting places the highest IMDb scores first?', options: ['ascending=True', 'ascending=False', 'dropna=False', 'axis=1'], correct: 1, why: 'Descending order places large scores at the top before head(10) selects the first rows.' },
      { title: 'Make behavior reusable', outcome: 'Encapsulate data and behavior in a small class.', prompt: 'Complete a Point class whose distance method calculates Euclidean distance to another Point.', starter: 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def distance(self, other):\n        return np.sqrt((self.x - other.x)**2 + ___)', hint: 'The y-coordinate contributes another squared difference.', question: 'What is the distance from Point(0, 0) to Point(3, 4)?', options: ['3', '4', '5', '7'], correct: 2, why: 'The distance is √(3² + 4²) = 5.' },
    ],
  },
  2: {
    title: 'Diagnose, explore, and prepare real data',
    source: 'Week 2 · data_exploration.ipynb + data_preprocessing.ipynb',
    dataset: 'Chicago Crime 2017 + Spotify 2024',
    duration: '60–75 min',
    tasks: [
      { title: 'Turn timestamps into features', outcome: 'Extract model-ready temporal signals.', prompt: 'Parse the Chicago Crime Date column and derive month, weekday, and hour. Compare the hourly distribution of incidents.', starter: 'crime["Date"] = pd.to_datetime(crime["Date"])\ncrime["month"] = crime["Date"].dt.___\ncrime["weekday"] = crime["Date"].dt.day_name()\ncrime["hour"] = crime["Date"].dt.hour', hint: 'The datetime accessor provides month as a direct property.', question: 'Why retain hour and weekday rather than the raw string alone?', options: ['They remove all seasonality', 'They expose recurring temporal patterns', 'They guarantee causal conclusions', 'They eliminate missing values'], correct: 1, why: 'Derived calendar features make daily and weekly patterns directly available for grouping and modelling.' },
      { title: 'Audit the Spotify table', outcome: 'Measure problems before choosing a repair.', prompt: 'Inspect dtypes, calculate missing-value percentages, and count duplicated rows. Identify numeric columns that were parsed as text.', starter: 'missing_pct = spotify.isna().mean().mul(100).sort_values(ascending=False)\nduplicates = spotify.duplicated().sum()\nspotify.info()', hint: 'Commas, percent signs, or other symbols can cause a numeric-looking column to be parsed as object.', question: 'What should determine whether a missing column is dropped or imputed?', options: ['The shortest code', 'Its missingness mechanism and analytical role', 'Alphabetical order', 'Whether it is the first column'], correct: 1, why: 'The treatment encodes an assumption, so it must reflect why values are missing and how the feature will be used.' },
      { title: 'Rank artists two ways', outcome: 'See how the aggregation defines “top”.', prompt: 'Group by artist. Rank once by number of tracks and once by total Spotify streams, then compare who moves.', starter: 'by_artist = spotify.groupby("Artist").agg(\n    tracks=("Track", "count"),\n    streams=("Spotify Streams", "sum")\n)\nby_artist.sort_values("streams", ascending=False).head(10)', hint: 'Track count measures output frequency; summed streams measure accumulated audience.', question: 'Why can the two top-artist lists disagree?', options: ['groupby randomizes rows', 'Popularity per track and release count differ', 'sum always ignores artists', 'Sorting changes the dataset values'], correct: 1, why: 'An artist can release many modest tracks or a few exceptionally popular ones.' },
      { title: 'Project platform signals', outcome: 'Prepare comparable features before PCA.', prompt: 'Select Spotify streams, YouTube views, and TikTok views; impute if justified, standardize, then project the three features into two principal components.', starter: 'X = spotify[features].copy()\nX_scaled = StandardScaler().fit_transform(X)\ncoords = PCA(n_components=___).fit_transform(X_scaled)', hint: 'The tutorial asks for a two-dimensional visualization.', question: 'Why standardize before this PCA?', options: ['To create more rows', 'To stop the largest numerical scale dominating variance', 'To label the components automatically', 'To remove every outlier'], correct: 1, why: 'PCA follows variance; standardization prevents units and raw magnitude from deciding the projection by themselves.' },
    ],
  },
  3: {
    title: 'Design owl delivery regions',
    source: 'Week 3 · 03_clustering.ipynb',
    dataset: 'GeoNames world cities',
    duration: '60–90 min',
    tasks: [
      { title: 'Represent the globe', outcome: 'Choose geometry that respects geographic position.', prompt: 'Convert latitude and longitude to 3D unit-sphere coordinates before measuring straight-line proximity.', starter: 'lat, lon = np.radians(latitude), np.radians(longitude)\nx = np.cos(lat) * np.cos(lon)\ny = np.cos(lat) * np.sin(lon)\nz = np.___(lat)', hint: 'On a unit sphere, vertical position is the sine of latitude.', question: 'Why is raw longitude distance especially misleading?', options: ['Longitude is always missing', 'The scale of a longitude degree changes with latitude and wraps at ±180°', 'Longitude has no units', 'K-means cannot use negative values'], correct: 1, why: 'The same longitude difference represents different surface distances and the date line makes nearby points numerically far apart.' },
      { title: 'Compress before comparing', outcome: 'Use MiniBatchKMeans as a scalable summary.', prompt: 'Reduce the full city collection to 2,048 weighted representative centers before running several slower clustering algorithms.', starter: 'compressor = MiniBatchKMeans(n_clusters=2048, batch_size=4096, random_state=42)\nlabels = compressor.fit_predict(city_xyz, sample_weight=population)\ncenters = compressor.___', hint: 'Fitted K-means estimators store their center coordinates in an attribute ending with an underscore.', question: 'What is the main purpose of this first clustering stage?', options: ['Prove 2,048 is the true number of regions', 'Make later algorithm comparisons computationally manageable', 'Remove all small cities', 'Convert supervised labels'], correct: 1, why: 'The centers summarize a much larger point cloud so expensive clustering methods can be compared on a tractable input.' },
      { title: 'Tune K-means regions', outcome: 'Connect K to operational granularity.', prompt: 'Fit K-means for several K values. Map the regions and record inertia and run time; describe what changes for an owl delivery network.', starter: 'for k in [8, 16, 32, 64]:\n    model = KMeans(n_clusters=k, random_state=42, n_init="auto")\n    labels = model.fit_predict(centers)\n    print(k, model.inertia_)', hint: 'More clusters almost always lower inertia, so usefulness cannot be judged by inertia alone.', question: 'What happens to K-means inertia as K increases?', options: ['It cannot increase', 'It must double', 'It becomes negative', 'It is unrelated to K'], correct: 0, why: 'Extra centroids give points at least as many assignment choices, so the optimum within-cluster squared distance cannot worsen.' },
      { title: 'Match method to shape', outcome: 'Compare assumptions, not just colored maps.', prompt: 'Compare K-means, Gaussian mixtures, spectral, agglomerative, DBSCAN, and Mean Shift. Record parameters, run time, number of regions, and noise handling.', starter: 'results = []\n# algorithm, parameters, runtime, n_clusters, n_noise\nresults.append({"algorithm": name, "runtime": elapsed, ...})', hint: 'Ask whether the method needs K, supports irregular shapes, produces soft membership, or explicitly marks noise.', question: 'Which method explicitly labels sufficiently isolated cities as noise?', options: ['K-means', 'Gaussian mixture', 'DBSCAN', 'Ward agglomeration'], correct: 2, why: 'DBSCAN grows connected dense regions and assigns points outside them a noise label.' },
    ],
  },
  4: {
    title: 'Recover one line in four ways',
    source: 'Week 4 · 04_linear_regression.ipynb',
    dataset: 'Synthetic linear observations',
    duration: '60–75 min',
    tasks: [
      { title: 'Generate a known relationship', outcome: 'Create data with a ground truth for verification.', prompt: 'Generate x values, add an intercept and slope, then inject zero-mean Gaussian noise. Plot the observations and true line.', starter: 'rng = np.random.default_rng(42)\nx = np.linspace(0, 10, 100)\ny = intercept + slope * x + rng.normal(0, ___, size=x.size)', hint: 'The missing value is the noise standard deviation; try 0.5, 2, and 5 to see uncertainty grow.', question: 'What changes when noise variance increases?', options: ['The true slope changes automatically', 'Points spread farther around the line', 'x becomes categorical', 'The intercept is deleted'], correct: 1, why: 'Noise affects dispersion around the same underlying relationship, not the parameters used to create the true line.' },
      { title: 'Fit and interpret', outcome: 'Read inferential output alongside predictions.', prompt: 'Fit the relationship with SciPy and statsmodels. Compare estimated slope/intercept, R², the slope p-value, and residual plot.', starter: 'slope_hat, intercept_hat, r, p, stderr = stats.linregress(x, y)\nmodel = sm.OLS(y, sm.add_constant(x)).fit()\nprint(model.summary())', hint: 'R² describes explained sample variation; the p-value addresses evidence against a zero slope under model assumptions.', question: 'What does a high R² mean here?', options: ['The slope is causal', 'The fitted line explains much of the observed y variation', 'Every prediction is exact', 'The residuals must be normally distributed'], correct: 1, why: 'R² is an in-sample variance summary; it does not establish causality or validate every assumption.' },
      { title: 'Solve with matrix algebra', outcome: 'Connect the normal equation to the fitted line.', prompt: 'Add a column of ones to x and solve for intercept and slope using a stable linear-algebra routine.', starter: 'X = np.column_stack([np.ones_like(x), x])\nbeta = np.linalg.solve(X.T @ X, X.T @ y)\nintercept_hat, slope_hat = beta', hint: 'The ones column lets the matrix multiplication include a free intercept.', question: 'What would omitting the ones column impose?', options: ['A line forced through the origin', 'A quadratic curve', 'A second target variable', 'Automatic standardization'], correct: 0, why: 'Without a constant feature, the model has no independent intercept parameter.' },
      { title: 'Learn with gradient steps', outcome: 'Implement the same objective in PyTorch.', prompt: 'Train a one-input linear layer with mean squared error and SGD. Track loss and compare its learned parameters with the closed-form estimates.', starter: 'model = torch.nn.Linear(1, 1)\noptimizer = torch.optim.SGD(model.parameters(), lr=0.01)\nfor epoch in range(500):\n    optimizer.zero_grad()\n    loss = torch.nn.functional.mse_loss(model(x_tensor), y_tensor)\n    loss.___()\n    optimizer.step()', hint: 'PyTorch must propagate the loss gradient backward through the computation graph before the optimizer updates parameters.', question: 'What is the correct order inside the training loop?', options: ['step → backward → zero_grad', 'zero_grad → loss → backward → step', 'backward → data → model', 'loss → step → zero_grad → backward'], correct: 1, why: 'Clear old gradients, compute the current loss, backpropagate, then update the parameters.' },
    ],
  },
};

export function TutorialLab({ lecture }: { lecture: number }) {
  const lab = tutorialLabs[lecture];
  const [taskIndex, setTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(lab.tasks.map(() => null));
  const [checked, setChecked] = useState<boolean[]>(lab.tasks.map(() => false));
  const [hints, setHints] = useState<boolean[]>(lab.tasks.map(() => false));
  const task = lab.tasks[taskIndex];
  const correct = checked[taskIndex] && answers[taskIndex] === task.correct;
  const completed = checked.filter((value, index) => value && answers[index] === lab.tasks[index].correct).length;
  const updateAt = <T,>(values: T[], index: number, value: T) => values.map((item, i) => i === index ? value : item);
  const reset = () => { setTaskIndex(0); setAnswers(lab.tasks.map(() => null)); setChecked(lab.tasks.map(() => false)); setHints(lab.tasks.map(() => false)); };

  return <section className="game-shell tutorial-lab">
    <div className="activity-kicker">Tutorial-based lab</div>
    <h2>{lab.title}</h2>
    <p className="activity-prompt">Work beside the course notebook. Complete each code task, predict the result, then use the check to test your reasoning.</p>
    <div className="lab-meta"><span><small>Source</small><b>{lab.source}</b></span><span><small>Data</small><b>{lab.dataset}</b></span><span><small>Suggested time</small><b>{lab.duration}</b></span></div>
    <div className="lab-stepper" aria-label="Lab task progress">
      {lab.tasks.map((item, index) => <button key={item.title} className={`${index === taskIndex ? 'active' : ''} ${checked[index] && answers[index] === item.correct ? 'done' : ''}`} onClick={() => setTaskIndex(index)}><span>{checked[index] && answers[index] === item.correct ? <Check /> : index + 1}</span><b>{item.title}</b></button>)}
    </div>
    <div className="lab-workspace">
      <div className="lab-instructions">
        <div className="lab-task-count">Task {taskIndex + 1} of {lab.tasks.length}</div>
        <h3>{task.title}</h3>
        <p>{task.prompt}</p>
        <div className="lab-outcome"><small>Learning outcome</small><span>{task.outcome}</span></div>
        <button className="text-button lab-hint-button" onClick={() => setHints(updateAt(hints, taskIndex, !hints[taskIndex]))}>{hints[taskIndex] ? 'Hide hint' : 'Reveal a hint'}</button>
        {hints[taskIndex] && <div className="lab-hint">{task.hint}</div>}
      </div>
      <div className="code-card"><div className="code-card-top"><span/><span/><span/><b>starter.py</b></div><pre><code>{task.starter}</code></pre></div>
    </div>
    <div className="lab-check">
      <div><small>Self-check</small><h3>{task.question}</h3></div>
      <div className="lab-check-options">{task.options.map((option, index) => {
        const selected = answers[taskIndex] === index;
        const state = checked[taskIndex] ? (index === task.correct ? 'correct' : selected ? 'wrong' : '') : selected ? 'selected' : '';
        return <button key={option} className={state} disabled={checked[taskIndex]} onClick={() => setAnswers(updateAt(answers, taskIndex, index))}>{option}{checked[taskIndex] && index === task.correct && <Check />}{checked[taskIndex] && selected && index !== task.correct && <X />}</button>;
      })}</div>
      {!checked[taskIndex] && <button className="primary-button lab-check-button" disabled={answers[taskIndex] === null} onClick={() => setChecked(updateAt(checked, taskIndex, true))}>Check reasoning</button>}
      {checked[taskIndex] && <div className={`lab-feedback ${correct ? 'correct' : 'wrong'}`}><b>{correct ? 'Ready to continue.' : 'Try this task again.'}</b><span>{task.why}</span>{!correct && <button className="text-button" onClick={() => { setChecked(updateAt(checked, taskIndex, false)); setAnswers(updateAt(answers, taskIndex, null)); }}>Revise answer</button>}</div>}
      {correct && taskIndex < lab.tasks.length - 1 && <button className="primary-button lab-next" onClick={() => setTaskIndex(taskIndex + 1)}>Next lab task <ChevronRight /></button>}
    </div>
    <div className={`lab-summary ${completed === lab.tasks.length ? 'complete' : ''}`}><div><small>Lab progress</small><strong>{completed} / {lab.tasks.length} tasks checked</strong><span>{completed === lab.tasks.length ? 'Lab complete. You have connected the tutorial code to the lecture concepts.' : 'Use the checks as gates, then reproduce each task in the notebook.'}</span></div><div className="lab-progress-ring" style={{ '--lab-progress': `${completed / lab.tasks.length * 100}%` } as CSSProperties}><b>{Math.round(completed / lab.tasks.length * 100)}%</b></div>{completed === lab.tasks.length && <button className="text-button" onClick={reset}><RotateCcw /> Repeat lab</button>}</div>
  </section>;
}

export function PracticeQuiz({id}:{id:string}){const questions=quizzes[id]; const [answers,setAnswers]=useState<(number|null)[]>(questions.map(()=>null)); const [submitted,setSubmitted]=useState(false); const complete=answers.every(v=>v!==null); const score=answers.filter((v,i)=>v===questions[i].correct).length; return <section className="game-shell"><div className="activity-kicker">Independent practice</div><h2>Check the mental model</h2><p className="activity-prompt">The visual scaffolds are gone. Choose an answer, then inspect the reasoning.</p><div className="quiz-list">{questions.map((question,qi)=><div className="quiz-question" key={question.q}><h3><span>{qi+1}</span>{question.q}</h3><div className="quiz-options">{question.options.map((option,oi)=>{const selected=answers[qi]===oi; const state=submitted?(oi===question.correct?'correct':selected?'wrong':''):selected?'selected':'';return <button className={state} key={option} disabled={submitted} onClick={()=>setAnswers(answers.map((v,i)=>i===qi?oi:v))}>{option}{submitted&&oi===question.correct&&<Check/>}{submitted&&selected&&oi!==question.correct&&<X/>}</button>;})}</div>{submitted&&<p className="quiz-why"><b>{answers[qi]===question.correct?'Correct.':'Reconsider.'}</b> {question.why}</p>}</div>)}</div>{!submitted?<button className="primary-button" disabled={!complete} onClick={()=>setSubmitted(true)}>Check answers</button>:<div className="quiz-result"><strong>{score} / {questions.length}</strong><span>{score===questions.length?'The core ideas are secure.':'Review the explanations, then try again without them.'}</span><button className="text-button" onClick={()=>{setAnswers(questions.map(()=>null));setSubmitted(false);}}><RotateCcw/> Try again</button></div>}</section>;}
