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
import './Problem251Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'class Vector2D:' },
    { line: 2, text: '    def __init__(self, vector): self.vector = vector; self.row = self.col = 0' },
    { line: 3, text: '    def advance(self):' },
    { line: 4, text: '        while self.row < len(self.vector) and self.col == len(self.vector[self.row]): self.row += 1; self.col = 0' },
    { line: 5, text: '    def next(self):' },
    { line: 6, text: '        self.advance(); value = self.vector[self.row][self.col]; self.col += 1; return value' },
    { line: 7, text: '    def hasNext(self): self.advance(); return self.row < len(self.vector)' },
]

function generateSteps(input) {
    const vector = (Array.isArray(input) ? input : []).filter(Array.isArray), output = [], steps = [{ phase: 'init', activeLine: 2, message: 'Start at row 0, column 0.', state: { vector, row: 0, col: 0, output: [], value: null } }]
    vector.forEach((row, r) => row.forEach((value, c) => { output.push(value); steps.push({ phase: 'process', activeLine: 6, message: `Emit ${value} at [${r}][${c}].`, state: { vector, row: r, col: c, output: [...output], value } }) }))
    steps.push({ phase: 'done', activeLine: 7, message: `Flattened output: [${output.join(', ')}].`, state: { vector, row: vector.length, col: 0, output, value: null } }); return steps
}

export default function Problem251Visualizer() {
    const examples = useMemo(() => getExamplesOr('251', []), [])
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
<div className="problem251-visualizer-viz-panel">
                    <div className="problem251-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem251-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem251-visualizer-output">output: {(step.state.output || []).join(', ') || '—'}</div>
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
            onReset={() => setCurrentStep(0)}
            onNext={() => setCurrentStep((current) => Math.min(steps.length - 1, current + 1))}
            onPrev={() => setCurrentStep((current) => Math.max(0, current - 1))}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            isPlaying={isPlaying}
            canNext={canNext}
            canPrev={canPrev}
          /></FloatingPanel>, document.body)}
        </>
    )
}
