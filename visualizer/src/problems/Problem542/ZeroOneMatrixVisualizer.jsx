import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import DockableWorkspace from'../../components/shared/DockableWorkspace'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import{useCodeVisualConnectivity}from'../../hooks/useCodeVisualConnectivity'
import{usePatternOverlay}from'../../hooks/usePatternOverlay'
import{getExamples}from'../../config/examplesRegistry'
import'./ZeroOneMatrixVisualizer.css'
const PATTERNS = ['done', 'init', 'init_queue', 'processing', 'update']
const LINE_PATTERN_MAP = {
  1: 'init',
  6: 'init',
  14: 'update',
  15: 'update',
  17: 'update'
}


const EXAMPLES=getExamples('01-matrix')
function generateSteps(mat){const steps=[]
const rows=mat.length,cols=mat[0].length
steps.push({activeLine:1,mat:mat.map(r=>[...r]),phase:'init',message:'Initialize BFS from all zeros',relatedLines:[1]})
const queue=[]
const result=mat.map(r=>r.map(x=>x===0?0:Infinity))
for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){if(result[r][c]===0)queue.push([r,c])}}
steps.push({activeLine:6,mat,result,queue,phase:'init_queue',message:`Queue initialized with ${queue.length} zeros`,relatedLines:[6]})
const directions=[[0,1],[1,0],[0,-1],[-1,0]]
let processed=0
while(queue.length>0){const[r,c]=queue.shift();processed++
for(const[dr,dc]of directions){const nr=r+dr,nc=c+dc
if(nr>=0&&nr<rows&&nc>=0&&nc<cols){if(result[nr][nc]>result[r][c]+1){result[nr][nc]=result[r][c]+1
queue.push([nr,nc])
steps.push({activeLine:14,mat,result:[result.map(row=>[...row])],r:nr,c:nc,dist:result[nr][nc],phase:'update',message:`Update [${nr}, ${nc}] = ${result[nr][nc]}`,relatedLines:[14]})}}}
if(processed%Math.ceil((rows*cols)/5)===0){steps.push({activeLine:15,mat,result:result.map(row=>[...row]),processed,phase:'processing',message:`Processed ${processed}/${rows*cols} cells`,relatedLines:[15]})}}
steps.push({activeLine:17,mat,result:result.map(row=>[...row]),phase:'done',message:'BFS complete - all distances calculated',relatedLines:[17],done:true})
return steps}
function VisualizationPanel({mat,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Find nearest 0 distance for every cell using multi-source BFS.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Matrix</div><div style={{display:'grid',gridTemplateColumns:`repeat(${step?.mat[0]?.length||3},1fr)`,gap:3}}>{step?.mat?.map((row,r)=>row.map((cell,c)=>(<motion.div key={`cell-${r}-${c}`}style={{width:50,height:50,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:4,border:'2px solid',fontFamily:'monospace',fontSize:13,fontWeight:600,backgroundColor:cell===0?'#f87171':'#dbeafe',borderColor:step?.r===r&&step?.c===c?'#10b981':'#0284c7',color:'#0c4a6e'}}animate={{scale:step?.r===r&&step?.c===c?1.15:1}}>{cell===Infinity?'∞':cell}</motion.div>)))}
</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>BFS Status</div><div style={{fontSize:12,color:'#0284c7'}}>{step?.message||''}</div></motion.div></div>)}
export default function ZeroOneMatrixVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{mat:[[0,0,0],[0,1,0],[1,1,1]]})
const steps=useMemo(()=>generateSteps(ex.mat).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'📊 0-1 Matrix',content:(<VisualizationPanel mat={ex.mat}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

