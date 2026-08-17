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
import './Problem263Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def isUgly(n):' },
    { line: 2, text: '    if n <= 0: return False' },
    { line: 3, text: '    for factor in (2, 3, 5):' },
    { line: 4, text: '        while n % factor == 0:' },
    { line: 5, text: '            n //= factor' },
    { line: 6, text: '    return n == 1' },
]

function generateSteps(input) {
    let value = Number(Array.isArray(input) ? input[0] : input)
    const steps = [{ phase: 'init', activeLine: 1, message: `Try reducing ${value} by 2, 3, and 5.`, state: { value, factor: null, output: null } }]
    if (!Number.isInteger(value) || value <= 0) return [...steps, { phase: 'done', activeLine: 2, message: 'Only positive integers can be ugly.', state: { value, factor: null, output: false } }]
    for (const factor of [2, 3, 5]) while (value % factor === 0) { value /= factor; steps.push({ phase: 'process', activeLine: 5, message: `Divide by ${factor}; remainder is now ${value}.`, state: { value, factor, output: null } }) }
    steps.push({ phase: 'done', activeLine: 6, message: value === 1 ? 'All prime factors were 2, 3, or 5.' : `${value} is a remaining unsupported prime factor.`, state: { value, factor: null, output: value === 1 } })
    return steps
}

export default function Problem263Visualizer() {
    const examples = useMemo(() => getExamplesOr('263', []), [])
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
<div className="problem263-visualizer-viz-panel">
                    <div className="problem263-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem263-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem263-visualizer-factor-state">current value: <b>{step.state.value}</b>{step.state.factor && ` ÷ ${step.state.factor}`}</div>
                            {step.state.output !== null && <strong>ugly: {String(step.state.output)}</strong>}
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
