import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import DockableWorkspace from'../../components/shared/DockableWorkspace'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import PatternOverlay from'../../components/PatternOverlay'
import{usePlaybackState}from'../../hooks/usePlaybackState'
import{useCodeVisualConnectivity}from'../../hooks/useCodeVisualConnectivity'
import{usePatternOverlay}from'../../hooks/usePatternOverlay'
import{getExamples}from'../../config/examplesRegistry'
import'./ReverseStringIIVisualizer.css'
const EXAMPLES=getExamples('reverse-string-ii')
function generateSteps(s,k){const steps=[]
steps.push({activeLine:1,s,k,result:s,currentI:0,phase:'init',message:`Reverse every first k characters`,relatedLines:[1]})
const arr=s.split('')
for(let i=0;i<arr.length;i+=2*k){steps.push({activeLine:3,s,k,i,arr:[...arr],phase:'process',message:`Process segment starting at ${i}`,relatedLines:[3]})
const end=Math.min(i+k,arr.length)
const segment=arr.slice(i,end).reverse()
for(let j=0;j<segment.length;j++){arr[i+j]=segment[j]}
steps.push({activeLine:4,s,k,i,arr:[...arr],phase:'reverse',message:`Reverse segment [${i}, ${end-1}]`,relatedLines:[4]})}
const result=arr.join('')
steps.push({activeLine:5,s,k,result,phase:'done',message:`Result: ${result}`,relatedLines:[5],done:true})
return steps}
function VisualizationPanel({s,k,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Reverse every first k characters in the string, skipping k characters.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div style={{display:'flex',gap:12}}><div style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6,flex:1}}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>String</div><div style={{fontSize:14,fontFamily:'monospace',fontWeight:600}}>{s}</div></div><div style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6,flex:1}}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>k Value</div><div style={{fontSize:20,fontWeight:600,color:'#0284c7'}}>{k}</div></div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Current State</div><div style={{display:'flex',gap:2,flexWrap:'wrap'}}>{step?.arr?.map((char,idx)=>(<motion.div key={`char-${idx}`}style={{padding:'6px 8px',borderRadius:3,border:'1px solid',fontFamily:'monospace',fontSize:12,fontWeight:600,minWidth:28,textAlign:'center',backgroundColor:'#dbeafe',borderColor:'#0284c7',color:'#0c4a6e'}}animate={{scale:1}}>{char}</motion.div>))}</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Result</div><div style={{fontSize:16,fontFamily:'monospace',fontWeight:'bold',color:'#0284c7',wordBreak:'break-all'}}>{step?.result||''}</div></motion.div></div>)}
export default function ReverseStringIIVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{s:'abcdefg',k:2})
const steps=useMemo(()=>generateSteps(ex.s,ex.k).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>)},{id:'viz',title:'↔ Reverse String II',content:(<VisualizationPanel s={ex.s}k={ex.k}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/></FloatingPanel>{showPatternOverlay&&step&&<PatternOverlay step={step}activeLineDom={activeLineDom}/>}</div>)}
