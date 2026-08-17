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
import './Problem262Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def cancellationRate(trips, users):' },
    { line: 2, text: '    banned = {user.id for user in users if user.banned}' },
    { line: 3, text: '    daily = defaultdict(lambda: [0, 0])' },
    { line: 4, text: '    for trip in trips:' },
    { line: 5, text: '        if trip.client_id in banned or trip.driver_id in banned: continue' },
    { line: 6, text: '        daily[trip.day][0] += 1' },
    { line: 7, text: '        daily[trip.day][1] += trip.status != "completed"' },
    { line: 8, text: '    return {day: cancelled / total for day, (total, cancelled) in daily.items()}' },
]

function generateSteps(input) {
    const [trips = [], users = []] = Array.isArray(input) ? input : []
    const banned = new Set((users || []).filter(user => user.banned === 'Yes' || user.banned === true).map(user => user.id ?? user.users_id))
    const daily = {}, steps = [{ phase: 'init', activeLine: 2, message: `Load ${banned.size} banned user(s).`, state: { banned: [...banned], daily: {}, output: null } }]
    ;(trips || []).forEach((trip, index) => { const client = trip.client_id ?? trip.clientId, driver = trip.driver_id ?? trip.driverId, day = trip.request_at ?? trip.day, cancelled = (trip.status || '').toLowerCase() !== 'completed'; if (banned.has(client) || banned.has(driver)) { steps.push({ phase: 'process', activeLine: 5, message: `Skip trip ${index}: it involves a banned user.`, state: { banned: [...banned], daily: { ...daily }, output: null } }); return } const entry = daily[day] ||= { total: 0, cancelled: 0 }; entry.total += 1; entry.cancelled += Number(cancelled); steps.push({ phase: 'process', activeLine: 7, message: `Count ${cancelled ? 'a cancellation' : 'a completed trip'} on ${day}.`, state: { banned: [...banned], daily: JSON.parse(JSON.stringify(daily)), output: null } }) })
    const output = Object.fromEntries(Object.entries(daily).map(([day, value]) => [day, value.total ? +(value.cancelled / value.total).toFixed(2) : 0])); steps.push({ phase: 'done', activeLine: 8, message: 'Compute each day’s cancellation rate.', state: { banned: [...banned], daily, output } }); return steps
}

export default function Problem262Visualizer() {
    const examples = useMemo(() => getExamplesOr('262', []), [])
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
<div className="problem262-visualizer-viz-panel">
                    <div className="problem262-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem262-visualizer-content"
                        >
                            <p>{step.message}</p>
                            <div className="problem262-visualizer-daily">{Object.entries(step.state.daily || {}).map(([day, value]) => <span key={day}>{day}: {value.cancelled}/{value.total}</span>)}</div>
                            {step.state.output !== null && <strong>{JSON.stringify(step.state.output)}</strong>}
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
