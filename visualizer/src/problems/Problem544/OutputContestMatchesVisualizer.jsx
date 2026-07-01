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
import'./OutputContestMatchesVisualizer.css'
const PATTERNS = ['create_match', 'done', 'init', 'match']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'init',
  4: 'create_match',
  6: 'create_match'
}


const EXAMPLES=getExamples('output-contest-matches')
function generateSteps(n){const steps=[]
steps.push({activeLine:1,n,teams:Array.from({length:n},((_,i)=>String(i+1))),round:0,phase:'init',message:`Output contest matches for n=${n} teams`,relatedLines:[1]})
let teams=Array.from({length:n},(_,i)=>String(i+1))
let round=1
while(teams.length>1){steps.push({activeLine:3,n,teams:[...teams],round,phase:'match',message:`Round ${round}: ${teams.length} teams competing`,relatedLines:[3]})
const newTeams=[]
for(let i=0;i<teams.length/2;i++){const team1=teams[i]
const team2=teams[teams.length-1-i]
const match=`(${team1},${team2})`
newTeams.push(match)
steps.push({activeLine:4,n,teams:[...newTeams],round,i,team1,team2,match,phase:'create_match',message:`Match: ${team1} vs ${team2}`,relatedLines:[4]})}
teams=newTeams
round++}
steps.push({activeLine:6,n,teams,result:teams[0],phase:'done',message:`Final match: ${teams[0]}`,relatedLines:[6],done:true})
return steps}
function VisualizationPanel({n,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Output contest matches in elimination tournament bracket format.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div style={{padding:12,backgroundColor:'#f1f5f9',borderRadius:6,textAlign:'center'}}><div style={{fontSize:11,color:'#64748b',marginBottom:4}}>Number of Teams</div><div style={{fontSize:20,fontWeight:700,color:'#0284c7'}}>{n}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Current Matches</div><div style={{display:'flex',flexDirection:'column',gap:6}}>{step?.teams?.map((match,idx)=>(<motion.div key={`match-${idx}`}style={{padding:'10px 12px',borderRadius:6,border:'2px solid #cbd5e1',backgroundColor:'#f1f5f9',fontFamily:'monospace',fontSize:12,wordBreak:'break-all'}}initial={{opacity:0}}animate={{opacity:1}}>{match}</motion.div>))}</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Result</div><div style={{fontSize:13,fontFamily:'monospace',fontWeight:'bold',color:'#0284c7',wordBreak:'break-all'}}>{step?.result||'...'}</div></motion.div></div>)}
export default function OutputContestMatchesVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{n:2})
const steps=useMemo(()=>generateSteps(ex.n).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'🏆 Output Contest Matches',content:(<VisualizationPanel n={ex.n}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

