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
import './Problem252Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def canAttendMeetings(intervals):' },
    { line: 2, text: '    intervals.sort(key=lambda interval: interval[0])' },
    { line: 3, text: '    for index in range(1, len(intervals)):' },
    { line: 4, text: '        previous, current = intervals[index - 1], intervals[index]' },
    { line: 5, text: '        if current[0] < previous[1]: return False' },
    { line: 6, text: '    return True' },
]

function generateSteps(input) {
    const intervals = (Array.isArray(input) ? input : []).filter(item => Array.isArray(item) && item.length >= 2).map(([start, end]) => [Number(start), Number(end)]).sort((a, b) => a[0] - b[0])
    const steps = [{ phase: 'init', activeLine: 2, message: `Sort meetings by start: ${intervals.map(x => `[${x}]`).join(' ')}.`, state: { intervals, index: null, output: null } }]
    for (let index = 1; index < intervals.length; index += 1) { const overlaps = intervals[index][0] < intervals[index - 1][1]; steps.push({ phase: overlaps ? 'done' : 'process', activeLine: overlaps ? 5 : 4, message: overlaps ? `${intervals[index].join('–')} overlaps ${intervals[index - 1].join('–')}.` : `${intervals[index].join('–')} starts after the prior meeting ends.`, state: { intervals, index, output: overlaps ? false : null } }); if (overlaps) return steps }
    steps.push({ phase: 'done', activeLine: 6, message: 'No adjacent sorted meetings overlap.', state: { intervals, index: null, output: true } }); return steps
}

export default function Problem252Visualizer() {
    const examples = useMemo(() => getExamplesOr('252', []), [])
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
        <div className="problem252-visualizer-viz-panel">
            <div className="problem252-visualizer-canvas">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="problem252-visualizer-content"
                >
                    <p>{step.message}</p>
                    <div className="problem252-visualizer-intervals">{(step.state.intervals || []).map((interval, index) => <span className={step.state.index === index || step.state.index - 1 === index ? 'active' : ''} key={index}>{interval[0]}–{interval[1]}</span>)}</div>
                    {step.state.output !== null && <strong>attend all: {String(step.state.output)}</strong>}
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
        <div className="problem252-visualizer-shell">
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
