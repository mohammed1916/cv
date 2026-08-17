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
import './Problem273Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def numberToWords(num):' },
    { line: 2, text: '    if num == 0: return "Zero"' },
    { line: 3, text: '    groups = [(1_000_000_000, "Billion"), (1_000_000, "Million"), (1_000, "Thousand"), (1, "")]' },
    { line: 4, text: '    for scale, name in groups:' },
    { line: 5, text: '        if num >= scale: append_words_under_thousand(num // scale); num %= scale' },
    { line: 6, text: '    return " ".join(words)' },
]

function generateSteps(input) {
    const small = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'], tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']; const underThousand = n => n >= 100 ? `${small[Math.floor(n/100)]} Hundred${n%100 ? ` ${underThousand(n%100)}` : ''}` : n >= 20 ? `${tens[Math.floor(n/10)]}${n%10 ? ` ${small[n%10]}` : ''}` : small[n]
    let value = Math.max(0, Math.floor(Number(Array.isArray(input) ? input[0] : input) || 0)); if (!value) return [{ phase: 'done', activeLine: 2, message: 'Zero is the only special case.', state: { groups: [], output: 'Zero' } }]
    const groups = [[1_000_000_000,'Billion'],[1_000_000,'Million'],[1000,'Thousand'],[1,'']], words = [], steps = [{ phase: 'init', activeLine: 3, message: `Split ${value} into groups of three digits.`, state: { groups: [], output: null } }]
    groups.forEach(([scale, name]) => { const part = Math.floor(value / scale); if (part) { const phrase = `${underThousand(part)}${name ? ` ${name}` : ''}`; words.push(phrase); value %= scale; steps.push({ phase: 'process', activeLine: 5, message: `Convert ${part} in the ${name || 'ones'} group: ${phrase}.`, state: { groups: [...words], output: null } }) } })
    const output = words.join(' '); steps.push({ phase: 'done', activeLine: 6, message: output, state: { groups: words, output } }); return steps
}

export default function Problem273Visualizer() {
    const examples = useMemo(() => getExamplesOr('273', []), [])
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
<div className="problem273-visualizer-viz-panel">
                    <div className="problem273-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem273-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem273-visualizer-groups">{(step.state.groups || []).map(group => <span key={group}>{group}</span>)}</div>
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
