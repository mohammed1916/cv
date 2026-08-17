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
import './Problem260Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def singleNumber(nums):' },
    { line: 2, text: '    xor_all = 0' },
    { line: 3, text: '    for value in nums: xor_all ^= value' },
    { line: 4, text: '    low_bit = xor_all & -xor_all' },
    { line: 5, text: '    first = second = 0' },
    { line: 6, text: '    for value in nums:' },
    { line: 7, text: '        if value & low_bit: first ^= value' },
    { line: 8, text: '        else: second ^= value' },
    { line: 9, text: '    return [first, second]' },
]

function generateSteps(input) {
    const nums = Array.isArray(input) ? input.map(Number) : []; let xorAll = 0
    const steps = [{ phase: 'init', activeLine: 2, message: 'XOR duplicates away to retain the two unique values combined.', state: { xorAll, lowBit: null, first: 0, second: 0, output: null } }]
    nums.forEach(value => { xorAll ^= value; steps.push({ phase: 'process', activeLine: 3, message: `xor_all ^= ${value} → ${xorAll}.`, state: { xorAll, lowBit: null, first: 0, second: 0, output: null } }) })
    const lowBit = xorAll & -xorAll; let first = 0, second = 0; steps.push({ phase: 'process', activeLine: 4, message: `Lowest distinguishing bit is ${lowBit}.`, state: { xorAll, lowBit, first, second, output: null } })
    nums.forEach(value => { if (value & lowBit) first ^= value; else second ^= value; steps.push({ phase: 'process', activeLine: value & lowBit ? 7 : 8, message: `Place ${value} in its bit partition.`, state: { xorAll, lowBit, first, second, output: null } }) })
    steps.push({ phase: 'done', activeLine: 9, message: `Unique values are ${first} and ${second}.`, state: { xorAll, lowBit, first, second, output: [first, second] } }); return steps
}

export default function Problem260Visualizer() {
    const examples = useMemo(() => getExamplesOr('260', []), [])
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
<div className="problem260-visualizer-viz-panel">
                    <div className="problem260-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem260-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem260-visualizer-xor">xor: {step.state.xorAll} · bit: {step.state.lowBit ?? '—'} · groups: {step.state.first}, {step.state.second}</div>
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
