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
import './Problem258Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def addDigits(num):' },
    { line: 2, text: '    while num >= 10:' },
    { line: 3, text: '        total = 0' },
    { line: 4, text: '        for digit in str(num): total += int(digit)' },
    { line: 5, text: '        num = total' },
    { line: 6, text: '    return num' },
]

function generateSteps(input) {
    let value = Math.abs(Math.floor(Number(Array.isArray(input) ? input[0] : input) || 0)); const steps = [{ phase: 'init', activeLine: 1, message: `Reduce ${value} by repeated digit sums.`, state: { value, digits: String(value).split(''), output: null } }]
    while (value >= 10) { const digits = String(value).split('').map(Number), total = digits.reduce((sum, digit) => sum + digit, 0); steps.push({ phase: 'process', activeLine: 5, message: `${digits.join(' + ')} = ${total}.`, state: { value: total, digits, output: null } }); value = total }
    steps.push({ phase: 'done', activeLine: 6, message: `Single-digit result: ${value}.`, state: { value, digits: [value], output: value } }); return steps
}

export default function Problem258Visualizer() {
    const examples = useMemo(() => getExamplesOr('258', []), [])
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
<div className="problem258-visualizer-viz-panel">
                    <div className="problem258-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem258-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem258-visualizer-digits">{(step.state.digits || []).join(' + ')} = {step.state.value}</div>
                        </motion.div>
                    </div>
                    <PlaybackControls
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        onNext={() => setCurrentStep(c => c + 1)}
                        onPrev={() => setCurrentStep(c => c - 1)}
                        onPlayToggle={() => setIsPlaying(!isPlaying)}
                        isPlaying={isPlaying}
                        canNext={canNext}
                        canPrev={canPrev}
                    />
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
        </>
    )
}
