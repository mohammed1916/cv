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
import{useSolutionCode}from'../../hooks/useSolutionCode'
import{getExamples}from'../../config/examplesRegistry'
import'./DiameterOfBinaryTreeVisualizer.css'
const EXAMPLES=getExamples('diameter-of-binary-tree')
function generateSteps(root){const steps=[]
let maxDiameter=0
steps.push({activeLine:1,root,diameter:0,phase:'init',message:'Find diameter of binary tree',relatedLines:[1]})
function dfs(idx,depth=0){if(idx===null||idx>=root.length)return{height:0,diameter:0}
steps.push({activeLine:2,root,idx,phase:'visit',message:`Visit node ${idx}`,relatedLines:[2],depth})
const leftIdx=idx*2+1,rightIdx=idx*2+2
const left=leftIdx<root.length?dfs(leftIdx,depth+1):{height:0,diameter:0}
const right=rightIdx<root.length?dfs(rightIdx,depth+1):{height:0,diameter:0}
const leftH=left.height,rightH=right.height
const diameter=Math.max(left.diameter,right.diameter,leftH+rightH)
const height=1+Math.max(leftH,rightH)
steps.push({activeLine:6,root,idx,leftH,rightH,diameter,height,phase:'calculate',message:`Node ${idx}: diameter=${diameter}, height=${height}`,relatedLines:[6],depth})
if(diameter>maxDiameter)maxDiameter=diameter
return{height,diameter}}
dfs(0)
steps.push({activeLine:10,root,diameter:maxDiameter,phase:'done',message:`Tree diameter: ${maxDiameter}`,relatedLines:[10],done:true,result:maxDiameter})
return steps}
function VisualizationPanel({root,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Find the diameter (longest path) in a binary tree using DFS.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Tree Array</div><div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{root.map((n,i)=>(<div key={`node-${i}`}style={{padding:'8px 10px',borderRadius:4,border:'2px solid',fontFamily:'monospace',fontSize:12,fontWeight:600,backgroundColor:'#f1f5f9',borderColor:'#cbd5e1',color:'#334155'}}>{n}</div>))}</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Tree Diameter</div><div style={{fontSize:28,fontWeight:'bold',color:'#0284c7'}}>{step?.diameter||0}</div><div style={{fontSize:12,color:'#0284c7',marginTop:8}}>{step?.message||''}</div></motion.div></div>)}
export default function DiameterOfBinaryTreeVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{root:[1,2,3,4,5]})
const SOLUTION_CODE=useSolutionCode('diameter-of-binary-tree')
const steps=useMemo(()=>generateSteps(ex.root).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>)},{id:'viz',title:'📏 Diameter of Binary Tree',content:(<VisualizationPanel root={ex.root}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/></FloatingPanel>{showPatternOverlay&&step&&<PatternOverlay step={step}activeLineDom={activeLineDom}/>}</div>)}
