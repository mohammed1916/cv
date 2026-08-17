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
import './Problem293Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def generatePossibleNextMoves(state):' },
    { line: 2, text: '    answer = []' },
    { line: 3, text: '    for index in range(len(state) - 1):' },
    { line: 4, text: '        if state[index:index + 2] == "++":' },
    { line: 5, text: '            answer.append(state[:index] + "--" + state[index + 2:])' },
    { line: 6, text: '    return answer' },
]

function generateSteps(input) {
    const value = String(Array.isArray(input) ? input[0] ?? '' : input ?? ''), output = [], steps = [{ phase: 'init', activeLine: 2, message: `Scan “${value}” for consecutive plus signs.`, state: { value, index: null, output: [], result: null } }]
    for (let index = 0; index < value.length - 1; index += 1) if (value.slice(index, index + 2) === '++') { const next = `${value.slice(0,index)}--${value.slice(index+2)}`; output.push(next); steps.push({ phase: 'process', activeLine: 5, message: `Flip positions ${index} and ${index + 1}: ${next}.`, state: { value, index, output: [...output], result: null } }) }
    steps.push({ phase: 'done', activeLine: 6, message: `${output.length} possible next state(s).`, state: { value, index: null, output, result: output } }); return steps
}

export default function Problem293Visualizer() {
    const examples = useMemo(() => getExamplesOr('293', []), [])
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
<div className="problem293-visualizer-viz-panel">
                    <div className="problem293-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem293-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem293-visualizer-states">{(step.state.output || []).map(state => <span key={state}>{state}</span>)}</div>
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
