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
import './Problem267Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: '# Palindrome Permutation II Solution' },
    { line: 2, text: 'from collections import Counter' },
    { line: 3, text: 'def generate_palindromes(s):' },
    { line: 4, text: '    counts = Counter(s)' },
    { line: 5, text: '    odds = [ch for ch in counts if counts[ch] % 2]' },
    { line: 6, text: '    if len(odds) > 1: return []' },
    { line: 7, text: '    middle = odds[0] if odds else ""' },
    { line: 8, text: '    half = "".join(ch * (n // 2) for ch, n in counts.items())' },
    { line: 9, text: '    def backtrack(path, remaining):' },
    { line: 10, text: '        if not remaining: result.append(path + middle + path[::-1])' },
    { line: 11, text: '        for ch in set(remaining): backtrack(path + ch, remaining.replace(ch, "", 1))' },
    { line: 12, text: '    backtrack("", half); return result' },
]

function generateSteps(input) {
    const text = String(Array.isArray(input) ? (input[0] ?? '') : input ?? '')
    const counts = [...text].reduce((map, char) => ({ ...map, [char]: (map[char] || 0) + 1 }), {})
    const oddChars = Object.keys(counts).filter(char => counts[char] % 2)
    const base = { input: text, counts, half: '', middle: oddChars[0] || '', current: '', output: [] }
    const steps = [{ phase: 'init', activeLine: 4, message: `Count each character in “${text}”.`, state: base }]
    steps.push({ phase: 'check', activeLine: 5, message: `${oddChars.length} character${oddChars.length === 1 ? '' : 's'} have odd frequency.`, state: base })
    if (oddChars.length > 1) {
        steps.push({ phase: 'done', activeLine: 6, message: 'More than one odd count means no palindrome can be formed.', state: { ...base, invalid: true } })
        return steps
    }
    const half = Object.entries(counts).flatMap(([char, count]) => Array(Math.floor(count / 2)).fill(char)).join('')
    const middle = oddChars[0] || ''
    steps.push({ phase: 'prepare', activeLine: 8, message: `Permute only the left half “${half}”; mirror it around “${middle || '∅'}”.`, state: { ...base, half, middle } })
    const output = []
    const walk = (path, remaining) => {
        if (output.length >= 24) return
        if (!remaining) {
            const palindrome = path + middle + [...path].reverse().join('')
            output.push(palindrome)
            steps.push({ phase: 'found', activeLine: 10, message: `Mirror “${path}” to produce ${palindrome}.`, state: { ...base, half, middle, current: path, output: [...output] } })
            return
        }
        for (const char of [...new Set(remaining)]) {
            const next = remaining.replace(char, '')
            steps.push({ phase: 'choose', activeLine: 11, message: `Choose “${char}” for the left half.`, state: { ...base, half, middle, current: path + char, output: [...output] } })
            walk(path + char, next)
        }
    }
    walk('', half)
    steps.push({ phase: 'done', activeLine: 12, message: `Finished with ${output.length} unique palindrome${output.length === 1 ? '' : 's'}.`, state: { ...base, half, middle, output } })
    return steps
}

export default function Problem267Visualizer() {
    const examples = useMemo(() => getExamplesOr('267', []), [])
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
<div className="problem267-visualizer-viz-panel">
                    <div className="problem267-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem267-visualizer-content"
                        >
                            <div className="problem267-summary"><strong>{step.message}</strong><span>Counts: {Object.entries(step.state.counts).map(([char, count]) => `${char}:${count}`).join(' · ') || '∅'}</span></div>
                            <div className="problem267-build"><span>{step.state.current || '…'}</span><i>{step.state.middle || '∅'}</i><span>{step.state.current ? [...step.state.current].reverse().join('') : '…'}</span></div>
                            <div className="problem267-results">{step.state.output.length ? step.state.output.map((palindrome, index) => <motion.code initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} key={`${palindrome}-${index}`}>{palindrome}</motion.code>) : <em>{step.state.invalid ? 'No valid palindrome' : `Half to permute: ${step.state.half || '∅'}`}</em>}</div>
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
