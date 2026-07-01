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
import'./SingleElementInSortedArrayVisualizer.css'
const PATTERNS = ['adjust', 'done', 'go_left', 'go_right', 'init', 'search']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'init',
  5: 'init',
  7: 'init',
  10: 'init'
}


const EXAMPLES=getExamples('single-element-in-sorted-array')
function generateSteps(nums){const steps=[]
steps.push({activeLine:1,nums,left:0,right:nums.length-1,phase:'init',message:'Binary search for single element',relatedLines:[1]})
let left=0,right=nums.length-1
while(left<right){let mid=Math.floor((left+right)/2);steps.push({activeLine:4,nums,left,right,mid,phase:'search',message:`mid=${mid}`,relatedLines:[4]})
if(mid%2===1){steps.push({activeLine:5,nums,left,right,mid,phase:'adjust',message:`mid=${mid} is odd, adjust to ${mid-1}`,relatedLines:[5]});mid=mid-1}
if(nums[mid]===nums[mid+1]){steps.push({activeLine:7,nums,left,right,mid,phase:'go_right',message:`nums[${mid}]===nums[${mid+1}], single is on right`,relatedLines:[7]});left=mid+2}else{steps.push({activeLine:9,nums,left,right,mid,phase:'go_left',message:`nums[${mid}]!==nums[${mid+1}], single is on left`,relatedLines:[9]});right=mid}}
steps.push({activeLine:10,nums,left,result:nums[left],phase:'done',message:`Found single element: ${nums[left]}`,relatedLines:[10],done:true,result:nums[left]})
return steps}
function VisualizationPanel({nums,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Find the single element in sorted array where every other element appears twice.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Array</div><div style={{display:'flex',gap:4,flexWrap:'wrap',maxHeight:150,overflowY:'auto'}}>{nums.map((n,idx)=>(<motion.div key={`num-${idx}`}style={{padding:'8px 10px',borderRadius:4,border:'2px solid',fontFamily:'monospace',fontSize:12,fontWeight:600,minWidth:40,textAlign:'center',backgroundColor:step?.left===idx?'#10b981':step?.right===idx?'#f59e0b':step?.mid===idx?'#dbeafe':'#f1f5f9',borderColor:step?.left===idx?'#10b981':step?.right===idx?'#f59e0b':step?.mid===idx?'#0284c7':'#cbd5e1',color:step?.left===idx?'#065f46':step?.right===idx?'#92400e':step?.mid===idx?'#0c4a6e':'#334155'}}animate={{scale:step?.left===idx||step?.right===idx||step?.mid===idx?1.15:1}}>{n}</motion.div>))}</div></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}><div style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6,border:'1px solid #cbd5e1'}}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>Left</div><div style={{fontSize:16,fontWeight:700,color:'#10b981'}}>{step?.left}</div></div><div style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6,border:'1px solid #cbd5e1'}}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>Mid</div><div style={{fontSize:16,fontWeight:700,color:'#0284c7'}}>{step?.mid!==undefined?step.mid:'-'}</div></div><div style={{padding:10,backgroundColor:'#f1f5f9',borderRadius:6,border:'1px solid #cbd5e1'}}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>Right</div><div style={{fontSize:16,fontWeight:700,color:'#f59e0b'}}>{step?.right}</div></div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Single Element</div><div style={{fontSize:28,fontWeight:'bold',color:'#0284c7'}}>{step?.result||'...'}</div></motion.div></div>)}
export default function SingleElementInSortedArrayVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{nums:[1,1,2,3,3,4,4,8,8]})
const steps=useMemo(()=>generateSteps(ex.nums).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'🔎 Single Element in Sorted Array',content:(<VisualizationPanel nums={ex.nums}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

