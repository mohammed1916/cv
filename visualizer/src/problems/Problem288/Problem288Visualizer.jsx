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
import './Problem288Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'class ValidWordAbbr:' },
    { line: 2, text: '    def __init__(self, dictionary):' },
    { line: 3, text: '        self.words = defaultdict(set)' },
    { line: 4, text: '        for word in dictionary: self.words[abbr(word)].add(word)' },
    { line: 5, text: '    def isUnique(self, word):' },
    { line: 6, text: '        matches = self.words[abbr(word)]' },
    { line: 7, text: '        return not matches or matches == {word}' },
]

function generateSteps(input) {
    const [dictionary = [], queries = []] = Array.isArray(input) ? input : [], abbr = word => word.length <= 2 ? word : `${word[0]}${word.length - 2}${word.at(-1)}`, index = {}
    const steps = [{ phase: 'init', activeLine: 3, message: 'Create an abbreviation-to-words index.', state: { index: {}, query: null, output: null } }]
    ;(dictionary || []).forEach(word => { const key = abbr(word); (index[key] ||= new Set()).add(word); steps.push({ phase: 'process', activeLine: 4, message: `Index ${word} as ${key}.`, state: { index: Object.fromEntries(Object.entries(index).map(([k,v])=>[k,[...v]])), query: null, output: null } }) })
    const result = {}; (queries || []).forEach(word => { const matches = index[abbr(word)] || new Set(), unique = !matches.size || (matches.size === 1 && matches.has(word)); result[word] = unique; steps.push({ phase: 'process', activeLine: 7, message: `${word} → ${abbr(word)} is ${unique ? 'unique' : 'ambiguous'}.`, state: { index: Object.fromEntries(Object.entries(index).map(([k,v])=>[k,[...v]])), query: word, output: { ...result } } }) }); steps.push({ phase: 'done', activeLine: 7, message: 'All abbreviation queries are answered.', state: { index: Object.fromEntries(Object.entries(index).map(([k,v])=>[k,[...v]])), query: null, output: result } }); return steps
}

export default function Problem288Visualizer() {
    const examples = useMemo(() => getExamplesOr('288', []), [])
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
<div className="problem288-visualizer-viz-panel">
                    <div className="problem288-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem288-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem288-visualizer-index">{Object.entries(step.state.index || {}).map(([key, values]) => <span key={key}>{key}: {values.join('|')}</span>)}</div>
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
