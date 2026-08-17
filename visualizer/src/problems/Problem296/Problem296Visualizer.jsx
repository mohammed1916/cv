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
import './Problem296Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: '# Best Meeting Point Solution' },
    { line: 2, text: 'def min_total_distance(grid):' },
    { line: 3, text: '    rows, cols = homes_by_row(grid), homes_by_col(grid)' },
    { line: 4, text: '    row, col = rows[len(rows)//2], cols[len(cols)//2]' },
    { line: 5, text: '    return sum(abs(r-row)+abs(c-col) for r,c in homes)' },
]

function generateSteps(input) {
 const grid=Array.isArray(input?.[0])?input[0]:input,homes=[];(grid||[]).forEach((row,r)=>row.forEach((cell,c)=>{if(cell)homes.push([r,c])}));const rows=homes.map(x=>x[0]).sort((a,b)=>a-b),cols=homes.map(x=>x[1]).sort((a,b)=>a-b),point=[rows[Math.floor(rows.length/2)],cols[Math.floor(cols.length/2)]],steps=[{activeLine:3,message:`Collect ${homes.length} home coordinates.`,state:{grid,homes,point:null}}];steps.push({activeLine:4,message:`Medians choose meeting point (${point}).`,state:{grid,homes,point}});const distance=homes.reduce((sum,[r,c])=>sum+Math.abs(r-point[0])+Math.abs(c-point[1]),0);steps.push({activeLine:5,message:`Total Manhattan distance: ${distance}.`,state:{grid,homes,point,distance}});return steps
}

export default function Problem296Visualizer() {
    const examples = useMemo(() => getExamplesOr('296', []), [])
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
<div className="problem296-visualizer-viz-panel">
                    <div className="problem296-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem296-visualizer-content"
                        >
                            <p>{step.message}</p><div className="problem296-grid">{(step.state.grid || []).map((row,r)=><div key={r}>{row.map((cell,c)=><span key={c} className={step.state.point?.[0]===r && step.state.point?.[1]===c?'meeting':cell?'home':''}>{step.state.point?.[0]===r && step.state.point?.[1]===c?'★':cell?'●':'·'}</span>)}</div>)}</div>{step.state.distance !== undefined && <strong>distance: {step.state.distance}</strong>}
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
