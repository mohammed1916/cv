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
import './Problem275Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def hIndex(citations):' },
    { line: 2, text: '    low, high = 0, len(citations) - 1' },
    { line: 3, text: '    while low <= high:' },
    { line: 4, text: '        middle = (low + high) // 2' },
    { line: 5, text: '        papers = len(citations) - middle' },
    { line: 6, text: '        if citations[middle] == papers: return papers' },
    { line: 7, text: '        if citations[middle] < papers: low = middle + 1' },
    { line: 8, text: '        else: high = middle - 1' },
    { line: 9, text: '    return len(citations) - low' },
]

function generateSteps(input) {
    const citations = (Array.isArray(input) ? input : []).map(Number); let low = 0, high = citations.length - 1; const steps = [{ phase: 'init', activeLine: 2, message: `Binary-search the sorted citations [${citations.join(', ')}].`, state: { citations, low, high, middle: null, output: null } }]
    while (low <= high) { const middle = Math.floor((low + high) / 2), papers = citations.length - middle; if (citations[middle] === papers) return [...steps, { phase: 'done', activeLine: 6, message: `${papers} papers have at least ${papers} citations.`, state: { citations, low, high, middle, output: papers } }]; if (citations[middle] < papers) { steps.push({ phase: 'process', activeLine: 7, message: `${citations[middle]} is below ${papers}; search right.`, state: { citations, low, high, middle, output: null } }); low = middle + 1 } else { steps.push({ phase: 'process', activeLine: 8, message: `${citations[middle]} exceeds ${papers}; search left.`, state: { citations, low, high, middle, output: null } }); high = middle - 1 } }
    const output = citations.length - low; steps.push({ phase: 'done', activeLine: 9, message: `H-index is ${output}.`, state: { citations, low, high, middle: null, output } }); return steps
}

export default function Problem275Visualizer() {
    const examples = useMemo(() => getExamplesOr('275', []), [])
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
<div className="problem275-visualizer-viz-panel">
                    <div className="problem275-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem275-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem275-visualizer-search">low {step.state.low} · mid {step.state.middle ?? '—'} · high {step.state.high}</div>
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
