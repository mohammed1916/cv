import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { createPortal } from 'react-dom'
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

const DEFAULT_EX = EXAMPLES[0] || { label: 'Default', root: [5, 2, 13] }

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
function VisualizationPanel({step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Transform BST to greater tree via reverse inorder traversal.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'var(--surface2)',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid var(--border)',cursor:'pointer',fontSize:12,backgroundColor:'var(--surface2)'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'var(--surface2)',marginBottom:8}}>Reverse Inorder Sequence</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{step?.reversedSequence?.map((val,idx)=>(<motion.div key={`val-${idx}`}style={{padding:'10px 14px',borderRadius:6,border:'2px solid',fontFamily:'monospace',fontSize:13,fontWeight:600,backgroundColor:'#dbeafe',borderColor:'#0284c7',color:'#0c4a6e'}}animate={{scale:1}}>{val}</motion.div>))}</div></div><motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Accumulated Sum</div><div style={{fontSize:28,fontWeight:'bold',color:'#027bba'}}>{step?.accumulated||0}</div><div style={{fontSize:12,color:'#027bba',marginTop:8}}>{step?.message||''}</div></motion.div></div>)}
export default function ConvertBSTToGreaterTreeVisualizer(){
const [rootInput, setRootInput] = useState(JSON.stringify(DEFAULT_EX.root))
const [activeLabel, setActiveLabel] = useState(DEFAULT_EX.label)

const { root, inputError } = useMemo(() => {
  try {
    const parsed = JSON.parse(rootInput)
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('root must be a non-empty array, e.g. [5,2,13]')
    for (const v of parsed) {
      if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('root values must be numbers (level-order, no nulls)')
    }
    return { root: parsed, inputError: '' }
  } catch (e) {
    return { root: DEFAULT_EX.root, inputError: e.message }
  }
}, [rootInput])

const steps=useMemo(()=>generateSteps(root).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[root])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setRootInput(JSON.stringify(e.root));setActiveLabel(e.label);handleReset()},[handleReset])
const handleFieldChange=useCallback((key,text)=>{if(key==='root')setRootInput(text);setActiveLabel('');handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const panelConfigs = useMemo(() => [
  { id: 'code', title: 'Code' },
  { id: 'viz', title: '🌳 Convert BST to Greater Tree', dockMode: 'split-right' },
], [])
const panelContents = useMemo(() => ({
  code: (<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>),
  viz: (<>
    <ManualInputPanel
      fields={[{ key: 'root', label: 'root', type: 'array' }]}
      values={{ root: rootInput }}
      onChange={handleFieldChange}
      examples={EXAMPLES}
      activeLabel={activeLabel}
      applyExample={applyEx}
      inputError={inputError}
    />
    <VisualizationPanel step={step} applyEx={applyEx} />
  </>),
}), [step,connectivity,setActiveLineDom,rootInput,activeLabel,inputError,handleFieldChange,applyEx,showPatternOverlay,activeLineDom])
const [panelDivs, setPanelDivs] = useState(null)
const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
return(<div className="problem-shell"><>
  <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
  {panelDivs && (
    <>
      {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
      {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
    </>
  )}
</><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

