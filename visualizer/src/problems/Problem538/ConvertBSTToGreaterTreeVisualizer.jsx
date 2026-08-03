import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import DockableWorkspace from'../../components/shared/DockableWorkspace'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import{useCodeVisualConnectivity}from'../../hooks/useCodeVisualConnectivity'
import{usePatternOverlay}from'../../hooks/usePatternOverlay'
import{getExamples}from'../../config/examplesRegistry'
import'./ConvertBSTToGreaterTreeVisualizer.css'
const PATTERNS = ['done', 'init', 'visit']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'init',
  10: 'visit'
}


const EXAMPLES=getExamples('convert-bst-to-greater-tree')

const SOLUTION_CODE_INLINE=[
  {line:1,text:'def bstToGst(root):'},
  {line:2,text:'    accumulated=[0]'},
  {line:3,text:'    def reverse_inorder(node):'},
  {line:4,text:'        if not node: return'},
  {line:5,text:'        reverse_inorder(node.right)'},
  {line:6,text:'        accumulated[0]+=node.val'},
  {line:7,text:'        node.val=accumulated[0]'},
  {line:8,text:'        reverse_inorder(node.left)'},
  {line:9,text:'    reverse_inorder(root)'},
  {line:10,text:'    return root'},
]

const SOLUTION_CODE=SOLUTION_CODE_INLINE

function generateSteps(root){const steps=[];steps.push({activeLine:1,root,reversedSequence:[],accumulated:0,phase:'init',message:'Reverse inorder traversal of BST',relatedLines:[1]})
let acc=0;const seq=[]
function dfs(idx,depth=0){if(idx===null||idx>=root.length)return
const rightIdx=idx*2+2;if(rightIdx<root.length)dfs(rightIdx,depth+1)
const val=root[idx];seq.push(val);acc+=val;steps.push({activeLine:4,root,val,idx,reversedSequence:[...seq],accumulated:acc,phase:'visit',message:`Visit ${val}, accumulate to ${acc}`,relatedLines:[4],depth})
const leftIdx=idx*2+1;if(leftIdx<root.length)dfs(leftIdx,depth+1)}
dfs(0);steps.push({activeLine:10,root,reversedSequence:seq,accumulated:acc,phase:'done',message:`BST converted to greater tree. Accumulated sum: ${acc}`,relatedLines:[10],done:true,result:acc})
return steps}
function VisualizationPanel({root,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Transform BST to greater tree via reverse inorder traversal.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Reverse Inorder Sequence</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{step?.reversedSequence?.map((val,idx)=>(<motion.div key={`val-${idx}`}style={{padding:'10px 14px',borderRadius:6,border:'2px solid',fontFamily:'monospace',fontSize:13,fontWeight:600,backgroundColor:'#dbeafe',borderColor:'#0284c7',color:'#0c4a6e'}}animate={{scale:1}}>{val}</motion.div>))}</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Accumulated Sum</div><div style={{fontSize:28,fontWeight:'bold',color:'#0284c7'}}>{step?.accumulated||0}</div><div style={{fontSize:12,color:'#0284c7',marginTop:8}}>{step?.message||''}</div></motion.div></div>)}
export default function ConvertBSTToGreaterTreeVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{root:[5,2,13]})
const steps=useMemo(()=>generateSteps(ex.root).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'🌳 Convert BST to Greater Tree',content:(<VisualizationPanel root={ex.root}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

