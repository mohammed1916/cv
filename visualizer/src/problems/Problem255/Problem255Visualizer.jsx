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
import './Problem255Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def verifyPreorder(preorder):' },
    { line: 2, text: '    lower_bound = float("-inf"); stack = []' },
    { line: 3, text: '    for value in preorder:' },
    { line: 4, text: '        if value < lower_bound: return False' },
    { line: 5, text: '        while stack and value > stack[-1]:' },
    { line: 6, text: '            lower_bound = stack.pop()' },
    { line: 7, text: '        stack.append(value)' },
    { line: 8, text: '    return True' },
]

function generateSteps(input) {
    const values = (Array.isArray(input) ? input : []).map(Number), stack = []; let lowerBound = -Infinity
    const steps = [{ phase: 'init', activeLine: 2, message: 'Start with no lower bound and an empty ancestor stack.', state: { stack: [], lowerBound, output: null } }]
    for (let index = 0; index < values.length; index += 1) { const value = values[index]; if (value < lowerBound) return [...steps, { phase: 'done', activeLine: 4, message: `${value} is below the required lower bound ${lowerBound}.`, state: { stack: [...stack], lowerBound, index, value, output: false } }]; while (stack.length && value > stack.at(-1)) lowerBound = stack.pop(); stack.push(value); steps.push({ phase: 'process', activeLine: 7, message: `Place ${value}; its allowed lower bound is ${lowerBound}.`, state: { stack: [...stack], lowerBound, index, value, output: null } }) }
    steps.push({ phase: 'done', activeLine: 8, message: 'Every value respects its ancestor bounds.', state: { stack, lowerBound, output: true } }); return steps
}

export default function Problem255Visualizer() {
    const examples = useMemo(() => getExamplesOr('255', []), [])
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
<div className="problem255-visualizer-viz-panel">
                    <div className="problem255-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem255-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem255-visualizer-stack">stack: {(step.state.stack || []).join(' → ') || 'empty'} · lower bound: {step.state.lowerBound}</div>
                            {step.state.output !== null && <strong>valid preorder: {String(step.state.output)}</strong>}
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
          {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls
            onReset={() => setCurrentStep(0)} onNext={() => setCurrentStep((current) => Math.min(steps.length - 1, current + 1))}
            onPrev={() => setCurrentStep((current) => Math.max(0, current - 1))} onPlayToggle={() => setIsPlaying(!isPlaying)}
            isPlaying={isPlaying} canNext={canNext} canPrev={canPrev}
          /></FloatingPanel>, document.body)}
        </>
    )
}
