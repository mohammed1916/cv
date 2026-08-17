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
import './Problem261Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def validTree(n, edges):' },
    { line: 2, text: '    if len(edges) != n - 1: return False' },
    { line: 3, text: '    parent = list(range(n))' },
    { line: 4, text: '    for left, right in edges:' },
    { line: 5, text: '        if find(left) == find(right): return False' },
    { line: 6, text: '        parent[find(left)] = find(right)' },
    { line: 7, text: '    return True' },
]

function generateSteps(input) {
    const n = Number(Array.isArray(input) ? input[0] : input?.n) || 0, edges = Array.isArray(input?.[1]) ? input[1] : (input?.edges || [])
    const parent = Array.from({ length: n }, (_, index) => index), find = node => { while (parent[node] !== node) { parent[node] = parent[parent[node]]; node = parent[node] } return node }
    const steps = [{ phase: 'init', activeLine: 3, message: `Start ${n} separate components.`, state: { parent: [...parent], edge: null, output: null } }]
    if (edges.length !== n - 1) return [...steps, { phase: 'done', activeLine: 2, message: `A tree with ${n} nodes needs exactly ${n - 1} edges.`, state: { parent, edge: null, output: false } }]
    for (const edge of edges) { const [left, right] = edge, a = find(left), b = find(right); if (a === b) return [...steps, { phase: 'done', activeLine: 5, message: `Edge ${left}–${right} closes a cycle.`, state: { parent: [...parent], edge, output: false } }]; parent[a] = b; steps.push({ phase: 'process', activeLine: 6, message: `Union components through edge ${left}–${right}.`, state: { parent: [...parent], edge, output: null } }) }
    steps.push({ phase: 'done', activeLine: 7, message: 'Correct edge count and no cycle means this graph is a tree.', state: { parent, edge: null, output: true } }); return steps
}

export default function Problem261Visualizer() {
    const examples = useMemo(() => getExamplesOr('261', []), [])
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
        <div className="problem261-visualizer-viz-panel">
            <div className="problem261-visualizer-canvas">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="problem261-visualizer-content"
                >
                    <p>{step.message}</p>
                    <div className="problem261-visualizer-parents">parents: {(step.state.parent || []).join(', ')}</div>
                    {step.state.output !== null && <strong>valid tree: {String(step.state.output)}</strong>}
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
        <div className="problem261-visualizer-shell">
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
