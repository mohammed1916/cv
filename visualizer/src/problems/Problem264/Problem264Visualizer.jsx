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
import './Problem264Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def nthUglyNumber(n):' },
    { line: 2, text: '    ugly = [1]; i2 = i3 = i5 = 0' },
    { line: 3, text: '    while len(ugly) < n:' },
    { line: 4, text: '        next_value = min(2*ugly[i2], 3*ugly[i3], 5*ugly[i5])' },
    { line: 5, text: '        ugly.append(next_value)' },
    { line: 6, text: '        if next_value == 2*ugly[i2]: i2 += 1' },
    { line: 7, text: '        if next_value == 3*ugly[i3]: i3 += 1' },
    { line: 8, text: '        if next_value == 5*ugly[i5]: i5 += 1' },
    { line: 9, text: '    return ugly[-1]' },
]

function generateSteps(input) {
    const n = Math.max(1, Number(Array.isArray(input) ? input[0] : input) || 1)
    const ugly = [1], pointers = [0, 0, 0], factors = [2, 3, 5]
    const steps = [{ phase: 'init', activeLine: 2, message: 'Seed the sequence with 1 and three factor pointers.', state: { ugly: [...ugly], pointers: [...pointers], output: null } }]
    while (ugly.length < n) {
      const candidates = factors.map((factor, index) => factor * ugly[pointers[index]])
      const next = Math.min(...candidates); ugly.push(next)
      steps.push({ phase: 'process', activeLine: 5, message: `Append the smallest candidate, ${next}.`, state: { ugly: [...ugly], pointers: [...pointers], candidates, output: null } })
      candidates.forEach((candidate, index) => { if (candidate === next) pointers[index] += 1 })
      steps.push({ phase: 'process', activeLine: 6, message: `Advance every pointer that produced ${next}.`, state: { ugly: [...ugly], pointers: [...pointers], candidates, output: null } })
    }
    steps.push({ phase: 'done', activeLine: 9, message: `The ${n}th ugly number is ${ugly.at(-1)}.`, state: { ugly, pointers, output: ugly.at(-1) } })
    return steps
}

export default function Problem264Visualizer() {
    const examples = useMemo(() => getExamplesOr('264', []), [])
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
<div className="problem264-visualizer-viz-panel">
                    <div className="problem264-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem264-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem264-visualizer-sequence">{(step.state.ugly || []).map((value, index) => <span key={index}>{value}</span>)}</div>
                            <small>pointers: {(step.state.pointers || []).join(', ')}</small>
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
