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
import './Problem286Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def wallsAndGates(rooms):' },
    { line: 2, text: '    queue = deque(all_gate_positions(rooms))' },
    { line: 3, text: '    while queue:' },
    { line: 4, text: '        row, col = queue.popleft()' },
    { line: 5, text: '        for next_row, next_col in four_neighbors(row, col):' },
    { line: 6, text: '            if rooms[next_row][next_col] == INF:' },
    { line: 7, text: '                rooms[next_row][next_col] = rooms[row][col] + 1' },
    { line: 8, text: '                queue.append((next_row, next_col))' },
]

function generateSteps(input) {
    const rooms = (Array.isArray(input?.[0]) ? input[0] : input || []).map(row => [...row]), queue = []; rooms.forEach((row, r) => row.forEach((value, c) => value === 0 && queue.push([r, c])))
    const steps = [{ phase: 'init', activeLine: 2, message: `Start BFS from ${queue.length} gate(s).`, state: { rooms: rooms.map(row => [...row]), queue: [...queue], active: null, output: null } }]
    for (let head = 0; head < queue.length; head += 1) { const [row, col] = queue[head]; for (const [nr, nc] of [[row-1,col],[row+1,col],[row,col-1],[row,col+1]]) if (rooms[nr]?.[nc] === 2147483647) { rooms[nr][nc] = rooms[row][col] + 1; queue.push([nr,nc]); steps.push({ phase: 'process', activeLine: 7, message: `Set (${nr}, ${nc}) to distance ${rooms[nr][nc]}.`, state: { rooms: rooms.map(item => [...item]), queue: queue.slice(head + 1), active: [nr,nc], output: null } }) } }
    steps.push({ phase: 'done', activeLine: 8, message: 'Every reachable room now has its nearest-gate distance.', state: { rooms, queue: [], active: null, output: rooms } }); return steps
}

export default function Problem286Visualizer() {
    const examples = useMemo(() => getExamplesOr('286', []), [])
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
        <div className="problem286-visualizer-viz-panel">
            <div className="problem286-visualizer-canvas">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="problem286-visualizer-content"
                >
                    <p>{step.message}</p>
                    <div className="problem286-visualizer-grid">{(step.state.rooms || []).map((row, r) => <span key={r}>[{row.join(', ')}]</span>)}</div>
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
        <div className="problem286-visualizer-shell">
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
