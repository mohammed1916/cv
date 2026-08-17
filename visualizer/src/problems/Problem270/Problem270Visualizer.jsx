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
import './Problem270Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: '# Closest Binary Search Tree Value Solution' },
    { line: 2, text: 'def closest_value(values, target):' },
    { line: 3, text: '    node, closest = 0, values[0]' },
    { line: 4, text: '    while node < len(values) and values[node] is not None:' },
    { line: 5, text: '        if abs(values[node] - target) < abs(closest - target): closest = values[node]' },
    { line: 6, text: '        node = 2 * node + (2 if target > values[node] else 1)' },
    { line: 7, text: '    return closest' },
]

function generateSteps(input) {
    const values = Array.isArray(input?.[0]) ? input[0] : (Array.isArray(input) ? input.filter(Number.isFinite) : [])
    const target = Number(Array.isArray(input) && !Array.isArray(input[0]) ? input.at(-1) : input?.[1])
    if (!values.length || !Number.isFinite(target)) return [{ activeLine: 1, message: 'Enter [levelOrderValues, target] to trace the BST search.', state: { values: [], target: '—', path: [], closest: '—' } }]
    let node = 0, closest = values[0]; const steps = [{ activeLine: 3, message: `Start at root ${closest}; target is ${target}.`, state: { values, target, path: [0], closest } }]
    while (node < values.length && values[node] != null) { const value = values[node]; if (Math.abs(value-target) < Math.abs(closest-target)) closest=value; steps.push({ activeLine: 5, message: `${value} is checked; closest is ${closest}.`, state: { values, target, path: [node], closest } }); node=2*node+(target>value?2:1) }
    steps.push({ activeLine: 7, message: `Search ends: ${closest} is closest to ${target}.`, state: { values, target, path: [], closest, done:true } }); return steps
}

export default function Problem270Visualizer() {
    const examples = useMemo(() => getExamplesOr('270', []), [])
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
<div className="problem270-visualizer-viz-panel">
                    <div className="problem270-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem270-visualizer-content"
                        >
                            <strong>{step.message}</strong><div className="problem270-tree">{step.state.values.map((value, index) => value != null && <span className={step.state.path.includes(index) ? 'active' : value === step.state.closest ? 'closest' : ''} key={index}>{value}</span>)}</div><p>target: <b>{step.state.target}</b> · closest: <b>{step.state.closest}</b></p>
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
