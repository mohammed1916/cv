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
import './Problem265Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def minCostII(costs):' },
    { line: 2, text: '    dp = costs[0][:]' },
    { line: 3, text: '    for house in costs[1:]:' },
    { line: 4, text: '        min1, min2 = two_smallest(dp)' },
    { line: 5, text: '        dp = [cost + (min2 if color == min1.index else min1.value) for color, cost in enumerate(house)]' },
    { line: 6, text: '    return min(dp)' },
]

function generateSteps(input) {
    const costs = Array.isArray(input?.[0]) ? input : (Array.isArray(input) ? input : [])
    if (!costs.length || !costs[0]?.length) return [{ phase: 'done', activeLine: 6, message: 'No houses to paint.', state: { dp: [], output: 0 } }]
    let dp = [...costs[0]]
    const steps = [{ phase: 'init', activeLine: 2, message: `Start with the first house costs: [${dp.join(', ')}].`, state: { dp: [...dp], row: 0, output: null } }]
    for (let row = 1; row < costs.length; row += 1) {
      const sorted = dp.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value)
      const previous = [...dp]
      dp = costs[row].map((cost, color) => cost + (color === sorted[0].index ? sorted[1].value : sorted[0].value))
      steps.push({ phase: 'process', activeLine: 5, message: `House ${row}: combine each color with the cheapest different previous color.`, state: { dp: [...dp], previous, row, min1: sorted[0], min2: sorted[1], output: null } })
    }
    steps.push({ phase: 'done', activeLine: 6, message: `Minimum total painting cost is ${Math.min(...dp)}.`, state: { dp, row: costs.length - 1, output: Math.min(...dp) } })
    return steps
}

export default function Problem265Visualizer() {
    const examples = useMemo(() => getExamplesOr('265', []), [])
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
<div className="problem265-visualizer-viz-panel">
                    <div className="problem265-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem265-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem265-visualizer-costs">{(step.state.dp || []).map((cost, color) => <span key={color}>c{color}: {cost}</span>)}</div>
                            {step.state.output !== null && <strong>minimum: {step.state.output}</strong>}
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
