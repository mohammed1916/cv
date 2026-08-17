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
import './Problem284Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'class PeekingIterator:' },
    { line: 2, text: '    def __init__(self, iterator): self.buffer = next(iterator, None)' },
    { line: 3, text: '    def peek(self): return self.buffer' },
    { line: 4, text: '    def next(self):' },
    { line: 5, text: '        value = self.buffer; self.buffer = next(self.iterator, None)' },
    { line: 6, text: '        return value' },
    { line: 7, text: '    def hasNext(self): return self.buffer is not None' },
]

function generateSteps(input) {
    const values = Array.isArray(input?.[0]) ? input[0] : (Array.isArray(input) ? input : []), operations = Array.isArray(input?.[1]) ? input[1] : values.map(() => 'next'); let index = 0, buffer = values[index++] ?? null; const output = []
    const steps = [{ phase: 'init', activeLine: 2, message: `Preload the first iterator value: ${buffer ?? 'empty'}.`, state: { buffer, index, output: [], operation: null } }]
    operations.forEach(operation => { if (operation === 'peek') { output.push(buffer); steps.push({ phase: 'process', activeLine: 3, message: `peek returns ${buffer} without consuming it.`, state: { buffer, index, output: [...output], operation } }) } else if (operation === 'next') { const value = buffer; buffer = values[index++] ?? null; output.push(value); steps.push({ phase: 'process', activeLine: 5, message: `next returns ${value}, then preloads ${buffer ?? 'end'}.`, state: { buffer, index, output: [...output], operation } }) } })
    steps.push({ phase: 'done', activeLine: 7, message: 'All requested iterator operations are complete.', state: { buffer, index, output, operation: null } }); return steps
}

export default function Problem284Visualizer() {
    const examples = useMemo(() => getExamplesOr('284', []), [])
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
<div className="problem284-visualizer-viz-panel">
                    <div className="problem284-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem284-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem284-visualizer-buffer">buffer: {String(step.state.buffer)} · output: {(step.state.output || []).join(', ')}</div>
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
