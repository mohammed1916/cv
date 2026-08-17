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
import './Problem259Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def threeSumSmaller(nums, target):' },
    { line: 2, text: '    nums.sort(); count = 0' },
    { line: 3, text: '    for first in range(len(nums) - 2):' },
    { line: 4, text: '        left, right = first + 1, len(nums) - 1' },
    { line: 5, text: '        while left < right:' },
    { line: 6, text: '            if nums[first] + nums[left] + nums[right] < target:' },
    { line: 7, text: '                count += right - left; left += 1' },
    { line: 8, text: '            else: right -= 1' },
    { line: 9, text: '    return count' },
]

function generateSteps(input) {
    const nums = Array.isArray(input?.[0]) ? [...input[0]] : (Array.isArray(input) ? [...input] : []), target = Number(Array.isArray(input) ? input.at(-1) : 0)
    nums.sort((a, b) => a - b); let count = 0; const steps = [{ phase: 'init', activeLine: 2, message: `Sort values: [${nums.join(', ')}].`, state: { nums, target, count, pointers: [], output: null } }]
    for (let first = 0; first < nums.length - 2; first += 1) for (let left = first + 1, right = nums.length - 1; left < right;) { const sum = nums[first] + nums[left] + nums[right]; if (sum < target) { count += right - left; steps.push({ phase: 'process', activeLine: 7, message: `${sum} < ${target}, so ${right - left} choices of the third value work.`, state: { nums, target, count, pointers: [first, left, right], output: null } }); left += 1 } else { steps.push({ phase: 'process', activeLine: 8, message: `${sum} is too large; move the right pointer.`, state: { nums, target, count, pointers: [first, left, right], output: null } }); right -= 1 } }
    steps.push({ phase: 'done', activeLine: 9, message: `Counted ${count} valid triples.`, state: { nums, target, count, pointers: [], output: count } }); return steps
}

export default function Problem259Visualizer() {
    const examples = useMemo(() => getExamplesOr('259', []), [])
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
<div className="problem259-visualizer-viz-panel">
                    <div className="problem259-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem259-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem259-visualizer-array">{(step.state.nums || []).map((value, index) => <span className={(step.state.pointers || []).includes(index) ? 'active' : ''} key={index}>{value}</span>)}</div>
                            <strong>count: {step.state.count}</strong>
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
