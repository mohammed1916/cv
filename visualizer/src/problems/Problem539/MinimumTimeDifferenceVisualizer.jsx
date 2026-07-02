import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import DockableWorkspace from'../../components/shared/DockableWorkspace'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { usePlaybackState } from '../../hooks/usePlaybackState'
const SOLUTION_CODE = getSolutionCode('minimum-time-difference')
import{useCodeVisualConnectivity}from'../../hooks/useCodeVisualConnectivity'
import{usePatternOverlay}from'../../hooks/usePatternOverlay'
import{getExamples}from'../../config/examplesRegistry'
import'./MinimumTimeDifferenceVisualizer.css'
const PATTERNS = ['compare', 'done', 'init', 'sort', 'update', 'wrap']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  5: 'init',
  6: 'sort',
  7: 'compare'
}


const EXAMPLES=getExamples('minimum-time-difference')
function generateSteps(timePoints){const steps=[]
steps.push({activeLine:1,timePoints,times:[],minDiff:Infinity,phase:'init',message:'Find minimum time difference',relatedLines:[1]})
const times=timePoints.map(t=>{const[h,m]=t.split(':').map(Number);return h*60+m}).sort((a,b)=>a-b)
steps.push({activeLine:2,timePoints,times,minDiff:Infinity,phase:'sort',message:`Sorted times: ${times.join(', ')}`,relatedLines:[2]})
let minDiff=Infinity
for(let i=0;i<times.length-1;i++){const diff=times[i+1]-times[i];steps.push({activeLine:5,timePoints,times,i,diff,minDiff,phase:'compare',message:`${times[i+1]} - ${times[i]} = ${diff}`,relatedLines:[5]})
if(diff<minDiff){minDiff=diff;steps.push({activeLine:5,timePoints,times,i,diff,minDiff,phase:'update',message:`Update min to ${minDiff}`,relatedLines:[5]})}}
const wrapDiff=1440-times[times.length-1]+times[0]
steps.push({activeLine:6,timePoints,times,minDiff,wrapDiff,phase:'wrap',message:`Wrap-around: 1440 - ${times[times.length-1]} + ${times[0]} = ${wrapDiff}`,relatedLines:[6]})
minDiff=Math.min(minDiff,wrapDiff)
steps.push({activeLine:7,timePoints,times,minDiff,phase:'done',message:`Minimum difference: ${minDiff}`,relatedLines:[7],done:true,result:minDiff})
return steps}
function VisualizationPanel({timePoints,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Find the minimum time difference in a circular 24-hour format.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Times</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{timePoints.map((t,idx)=>(<div key={`time-${idx}`}style={{padding:'10px 12px',borderRadius:6,border:'2px solid #cbd5e1',backgroundColor:'#f1f5f9',fontFamily:'monospace',fontSize:12,fontWeight:600}}>{t}</div>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Sorted Times (minutes)</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{step?.times?.map((t,idx)=>(<div key={`sorted-${idx}`}style={{padding:'10px 12px',borderRadius:6,border:'2px solid',fontFamily:'monospace',fontSize:12,fontWeight:600,backgroundColor:step?.i===idx-1?'#dbeafe':'#f1f5f9',borderColor:step?.i===idx-1?'#0284c7':'#cbd5e1',color:step?.i===idx-1?'#0c4a6e':'#334155'}}>{t}</div>))}</div></div>{step?.phase==='compare'&&(<div style={{padding:12,backgroundColor:'#fef3c7',borderRadius:6,border:'1px solid #fbbf24'}}><div style={{color:'#92400e',marginBottom:8,fontWeight:600}}>Comparing Consecutive Times</div><div style={{color:'#b45309',fontFamily:'monospace',fontSize:11}}>{step.times[step.i+1]} - {step.times[step.i]} = {step.diff}</div></div>)}<motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Minimum Time Difference</div><div style={{fontSize:28,fontWeight:'bold',color:'#0284c7'}}>{step?.minDiff||0}</div><div style={{fontSize:12,color:'#0284c7',marginTop:8}}>{step?.message||''}</div></motion.div></div>)}
export default function MinimumTimeDifferenceVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{timePoints:['23:59','00:00']})
const steps=useMemo(()=>generateSteps(ex.timePoints).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'⏱ Minimum Time Difference',content:(<VisualizationPanel timePoints={ex.timePoints}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

