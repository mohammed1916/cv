import{useState,useMemo,useCallback}from'react'
import{motion}from'framer-motion'
import DockableWorkspace from'../../components/shared/DockableWorkspace'
import FloatingPanel from'../../components/shared/FloatingPanel'
import CodeTracePanel from'../../components/CodeTracePanel'
import PlaybackControls from'../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('complex-number-multiplication')
import{useCodeVisualConnectivity}from'../../hooks/useCodeVisualConnectivity'
import{usePatternOverlay}from'../../hooks/usePatternOverlay'
import{getExamples}from'../../config/examplesRegistry'
import'./ComplexNumberMultiplicationVisualizer.css'
const PATTERNS = ['calc_imag', 'calc_real', 'done', 'init', 'parse']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  4: 'init',
  5: 'parse',
  6: 'calc_real'
}


const EXAMPLES=getExamples('complex-number-multiplication')
function generateSteps(num1,num2){const steps=[]
steps.push({activeLine:1,num1,num2,phase:'init',message:`Multiply ${num1} and ${num2}`,relatedLines:[1]})
const[a,b]=num1.replace('i','').split('+').map(Number)
const[c,d]=num2.replace('i','').split('+').map(Number)
steps.push({activeLine:2,num1,num2,a,b,c,d,phase:'parse',message:`Parse: num1=(${a}+${b}i), num2=(${c}+${d}i)`,relatedLines:[2]})
const real=a*c-b*d
steps.push({activeLine:4,a,b,c,d,real,phase:'calc_real',message:`Real: ${a}*${c} - ${b}*${d} = ${real}`,relatedLines:[4]})
const imag=a*d+b*c
steps.push({activeLine:5,a,b,c,d,real,imag,phase:'calc_imag',message:`Imaginary: ${a}*${d} + ${b}*${c} = ${imag}`,relatedLines:[5]})
const result=`${real}+${imag}i`
steps.push({activeLine:6,result,phase:'done',message:`Result: ${result}`,relatedLines:[6],done:true})
return steps}
function VisualizationPanel({num1,num2,step,applyEx}){return(<div style={{display:'flex',flexDirection:'column',gap:20,padding:16}}><div style={{padding:12,backgroundColor:'#f0f9ff',borderRadius:6,borderLeft:'4px solid #0284c7'}}><div style={{fontSize:12,color:'#075985',fontStyle:'italic'}}>Multiply complex numbers using FOIL formula.</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Examples</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{EXAMPLES.map(e=>(<button key={e.label}onClick={()=>applyEx(e)}style={{padding:'6px 12px',borderRadius:4,border:'1px solid #cbd5e1',cursor:'pointer',fontSize:12,backgroundColor:'#f1f5f9'}}>{e.label}</button>))}</div></div><div><div style={{fontSize:13,fontWeight:600,color:'#1e293b',marginBottom:8}}>Complex Numbers</div><div style={{display:'flex',gap:12}}><div style={{padding:12,backgroundColor:'#dbeafe',borderRadius:6,flex:1,fontFamily:'monospace',textAlign:'center'}}><div style={{fontSize:11,color:'#0284c7',marginBottom:4}}>num1</div><div style={{fontSize:16,fontWeight:700,color:'#0284c7'}}>{num1}</div></div><div style={{padding:12,backgroundColor:'#dbeafe',borderRadius:6,flex:1,fontFamily:'monospace',textAlign:'center'}}><div style={{fontSize:11,color:'#0284c7',marginBottom:4}}>num2</div><div style={{fontSize:16,fontWeight:700,color:'#0284c7'}}>{num2}</div></div></div></div>{step?.phase==='calc_real'&&(<div style={{padding:12,backgroundColor:'#fef3c7',borderRadius:6,border:'1px solid #fbbf24'}}><div style={{color:'#92400e',marginBottom:8,fontWeight:600}}>Real Calculation</div><div style={{color:'#b45309',fontFamily:'monospace',fontSize:11}}>{step.a}*{step.c} - {step.b}*{step.d} = {step.real}</div></div>)}{step?.phase==='calc_imag'&&(<div style={{padding:12,backgroundColor:'#fef3c7',borderRadius:6,border:'1px solid #fbbf24'}}><div style={{color:'#92400e',marginBottom:8,fontWeight:600}}>Imaginary Calculation</div><div style={{color:'#b45309',fontFamily:'monospace',fontSize:11}}>{step.a}*{step.d} + {step.b}*{step.c} = {step.imag}</div></div>)}<motion.div style={{padding:16,backgroundColor:'#f0f9ff',borderRadius:6,border:'2px solid #0284c7',textAlign:'center'}}initial={{opacity:0}}animate={{opacity:1}}><div style={{fontSize:13,fontWeight:600,color:'#0c4a6e',marginBottom:8}}>Result</div><div style={{fontSize:20,fontWeight:'bold',color:'#0284c7'}}>{step?.result||'...'}</div></motion.div></div>)}
export default function ComplexNumberMultiplicationVisualizer(){const[ex,setEx]=useState(EXAMPLES[0]||{num1:'1+1i',num2:'1+1i'})
const steps=useMemo(()=>generateSteps(ex.num1,ex.num2).map(c=>({...c,relatedLines:c.relatedLines??(c.activeLine!=null?[c.activeLine]:[])})),[ex])
const{stepIndex,setStepIndex,stepForward,stepBack,togglePlay,handleReset,isPlaying,speed,setSpeed,isDone}=usePlaybackState(steps.length)
const step=stepIndex>=0?steps[stepIndex]:null
const applyEx=useCallback(e=>{setEx(e);handleReset()},[handleReset])
const connectivity=useCodeVisualConnectivity({steps,stepIndex,onStepJump:setStepIndex})
const{showPatternOverlay,setShowPatternOverlay,activeLineDom,setActiveLineDom}=usePatternOverlay()
const dockPanels=useMemo(()=>[{id:'code',title:'Code',content:(<div style={{ position: 'relative' }}><CodeTracePanel step={step}codeLines={SOLUTION_CODE}highlightedLines={connectivity.highlightedLines}onLineSelect={connectivity.handleLineSelect}onActiveLineDomChange={setActiveLineDom}/>{showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}</div>)},{id:'viz',title:'✖ Complex Multiplication',content:(<VisualizationPanel num1={ex.num1}num2={ex.num2}step={step}applyEx={applyEx}/>)}],[step,SOLUTION_CODE,connectivity,setActiveLineDom,ex,applyEx])
return(<div className="problem-shell"><DockableWorkspace panels={dockPanels}initialLayout={{rows:[['code','viz']],minimized:[]}}/><FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls isPlaying={isPlaying}isDone={isDone}speed={speed}onPlayToggle={togglePlay}onPrev={stepBack}onNext={stepForward}onReset={handleReset}prevDisabled={stepIndex<0}nextDisabled={isDone}resetDisabled={stepIndex<0}onSpeedChange={e=>setSpeed(Number(e.target.value))}showPatternOverlay={showPatternOverlay}onShowPatternOverlayChange={setShowPatternOverlay}patternOverlayLabel="Show pattern overlay"showPatternOverlayToggle/>
      </FloatingPanel></div>)}

