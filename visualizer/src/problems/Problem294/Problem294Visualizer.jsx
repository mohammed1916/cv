import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem294Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: '# Flip Game II Solution' },
    { line: 2, text: 'def can_win(state, memo={}):' },
    { line: 3, text: '    for i in range(len(state) - 1):' },
    { line: 4, text: '        if state[i:i+2] == "++" and not can_win(state[:i]+"--"+state[i+2:]): return True' },
    { line: 5, text: '    return False' },
]

function generateSteps(input) {
 const state=String(Array.isArray(input)?input[0]??'':input??''),memo=new Map(),steps=[];const win=s=>{if(memo.has(s))return memo.get(s);for(let i=0;i<s.length-1;i++)if(s.slice(i,i+2)==='++'){const next=s.slice(0,i)+'--'+s.slice(i+2);steps.push({activeLine:4,message:`Flip positions ${i} and ${i+1}: ${s} → ${next}.`,state:{state:s,next,i}});if(!win(next)){memo.set(s,true);return true}}memo.set(s,false);return false};const result=win(state);steps.push({activeLine:5,message:result?'A move can force a win.':'Every move lets the opponent win.',state:{state,result,done:true}});return steps
}

export default function Problem294Visualizer() {
    const examples = useMemo(() => getExamplesOr('294', []), [])
    const [currentExample, setCurrentExample] = useState(0)
  const [inputInput, setInputInput] = useState(JSON.stringify(examples[0]?.input ?? []));
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = JSON.parse(inputInput); if (!Array.isArray(parsedInput)) throw new Error('input must be an array');
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: examples[currentExample]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[currentExample] || { input: [], output: [] }
const applyEx = useCallback((i) => { setCurrentExample(i); setInputInput(JSON.stringify(examples[i].input)); setCurrentStep(0); }, [setCurrentStep]);
      const steps = useMemo(() => generateSteps(input), [input])
    const step = steps[currentStep] || steps[0]

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    const panelConfigs = useMemo(() => [
      { id: 'main', title: "Visualization" },
      { id: 'bottom', title: "Code Trace", dockMode: 'split-bottom' },
    ], [])
    const panelContents = {
      main: (<>
<ManualInputPanel
          fields={[{"key":"input","label":"input","type":"string"}]}
          values={{ input: inputInput }}
          onChange={(k, v) => { if (k === 'input') setInputInput(v) }}
          examples={examples}
          activeLabel={examples[currentExample]?.label}
          applyExample={(e) => applyEx(examples.indexOf(e))}
          inputError={inputError}
        />
<div className="problem294-visualizer-viz-panel">
                    <div className="problem294-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem294-visualizer-content"
                        >
                            <p>{step.message}</p><div className="problem294-board">{[...(step.state.next || step.state.state || '')].map((value,index)=><span key={index} className={value==='+'?'on':'off'}>{value}</span>)}</div>{step.state.done && <strong>{step.state.result ? 'Winning state' : 'Losing state'}</strong>}
                        </motion.div>
                    </div>
                </div>
</>),
      bottom: (<CodeTracePanel
                    code={SOLUTION_CODE}
                    activeLine={step.activeLine}
                    onTogglePattern={togglePattern}
                    patternActive={pattern}
                />),
    }
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
          {panelDivs && (
            <>
              {panelDivs.main && createPortal(panelContents.main, panelDivs.main)}
              {panelDivs.bottom && createPortal(panelContents.bottom, panelDivs.bottom)}
            </>
          )}
          {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls onReset={() => setCurrentStep(0)} onNext={() => setCurrentStep((current) => Math.min(steps.length - 1, current + 1))} onPrev={() => setCurrentStep((current) => Math.max(0, current - 1))} onPlayToggle={() => setIsPlaying(!isPlaying)} isPlaying={isPlaying} canNext={canNext} canPrev={canPrev} /></FloatingPanel>, document.body)}
        </>
    )
}
