import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import './Problem269Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def alienOrder(words):' },
    { line: 2, text: '    graph = {char: set() for word in words for char in word}' },
    { line: 3, text: '    for first, second in zip(words, words[1:]):' },
    { line: 4, text: '        for left, right in zip(first, second):' },
    { line: 5, text: '            if left != right: graph[left].add(right); break' },
    { line: 6, text: '    indegree = count_incoming_edges(graph)' },
    { line: 7, text: '    queue = zero_indegree_nodes(indegree)' },
    { line: 8, text: '    return topological_bfs(graph, indegree, queue)' },
]

function generateSteps(input) {
    const words = Array.isArray(input) ? input.map(String) : [], graph = {}, indegree = {}; words.forEach(word => [...word].forEach(char => { graph[char] ||= new Set(); indegree[char] ||= 0 }))
    const steps = [{ phase: 'init', activeLine: 2, message: `Collect ${Object.keys(graph).length} alphabet symbols.`, state: { graph: {}, indegree: { ...indegree }, order: '', output: null } }]
    for (let index = 1; index < words.length; index += 1) { const first = words[index - 1], second = words[index]; if (first.startsWith(second) && first.length > second.length) return [...steps, { phase: 'done', activeLine: 3, message: 'A longer word cannot precede its own prefix.', state: { graph: {}, indegree, order: '', output: '' } }]; for (let pos = 0; pos < Math.min(first.length, second.length); pos += 1) if (first[pos] !== second[pos]) { const left = first[pos], right = second[pos]; if (!graph[left].has(right)) { graph[left].add(right); indegree[right] += 1; steps.push({ phase: 'process', activeLine: 5, message: `${left} must precede ${right}.`, state: { graph: Object.fromEntries(Object.entries(graph).map(([k,v])=>[k,[...v]])), indegree: { ...indegree }, order: '', output: null } }) } break } }
    const queue = Object.keys(indegree).filter(char => indegree[char] === 0), order = []; while (queue.length) { const char = queue.shift(); order.push(char); graph[char].forEach(next => { indegree[next] -= 1; if (!indegree[next]) queue.push(next) }); steps.push({ phase: 'process', activeLine: 8, message: `Emit ${char} from the zero-indegree queue.`, state: { graph: Object.fromEntries(Object.entries(graph).map(([k,v])=>[k,[...v]])), indegree: { ...indegree }, order: order.join(''), output: null } }) }
    const output = order.length === Object.keys(graph).length ? order.join('') : ''; steps.push({ phase: 'done', activeLine: 8, message: output ? `Alien order: ${output}.` : 'A cycle prevents an alphabet order.', state: { graph: Object.fromEntries(Object.entries(graph).map(([k,v])=>[k,[...v]])), indegree, order: output, output } }); return steps
}

export default function Problem269Visualizer() {
    const examples = useMemo(() => getExamplesOr('269', []), [])
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

    const vizPanel = (
      <>
          <ManualInputPanel
            fields={[{"key":"input","label":"input","type":"string"}]}
            values={{ input: inputInput }}
            onChange={(k, v) => { if (k === 'input') setInputInput(v) }}
            examples={examples}
            activeLabel={examples[currentExample]?.label}
            applyExample={(e) => applyEx(examples.indexOf(e))}
            inputError={inputError}
          />
        <div className="problem269-visualizer-viz-panel">
            <div className="problem269-visualizer-canvas">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="problem269-visualizer-content"
                >
                    <p>{step.message}</p>
                    <div className="problem269-visualizer-order">order: {step.state.order || '—'}</div>
                </motion.div>
            </div>
        </div>
    
    </>)

    const codePanel = (
        <CodeTracePanel
            code={SOLUTION_CODE}
            activeLine={step.activeLine}
            onTogglePattern={togglePattern}
            patternActive={pattern}
        />
    )

    const playbackPanel = (
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
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'viz', title: 'Visualization' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="problem269-visualizer-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
                document.body
            )}
        </div>
    )
}
