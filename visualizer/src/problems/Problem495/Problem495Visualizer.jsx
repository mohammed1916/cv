import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem495Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('teemo-attacking')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'done',


}

const EXAMPLES = getExamplesOr('teemo-attacking', [
  { label: 'Example 1', timeSeries: [1,4], duration: 2 },
  { label: 'Example 2', timeSeries: [1,2], duration: 2 },
])

function generateSteps(timeSeries, duration) {
  const steps = []
  let totalDamage = duration
  steps.push({ activeLine: 1, timeSeries, duration, totalDamage, idx: 0, message: 'Initialize: total damage = duration' })
  for (let i = 1; i < timeSeries.length; i++) {
    const gap = timeSeries[i] - timeSeries[i-1]
    const damage = gap < duration ? gap : duration
    totalDamage += damage
    steps.push({ activeLine: 2, timeSeries, duration, totalDamage, idx: i, gap, damage, message: `Gap=${gap}, damage=${damage}, total=${totalDamage}` })
  }
  steps.push({ activeLine: 3, timeSeries, duration, totalDamage, done: true, message: `Total damage: ${totalDamage}` })
  return steps
}

function VisualizationPanel({ timeSeries, duration, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#ccfbf1', borderRadius: 6, borderLeft: '4px solid #14b8a6' }}>
        <div style={{ fontSize: 12, color: '#134e4a', fontStyle: 'italic' }}>Teemo deals 1 damage per second for {duration}s after attack, then cooldown starts.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Attack Times: [{timeSeries.join(', ')}]</div></div>
      <motion.div style={{ padding: 16, backgroundColor: '#ccfbf1', borderRadius: 6, border: '2px solid #14b8a6', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#134e4a' }}>Total Damage</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#0e8477' }}>{step?.totalDamage ?? 0}</div>
        <div style={{ fontSize: 12, color: '#0e8477', marginTop: 8 }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem495Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [timeSeriesInput, setTimeSeriesInput] = useState(JSON.stringify(EXAMPLES[0].timeSeries));
  const [durationInput, setDurationInput] = useState(String(EXAMPLES[0].duration));
  const { timeSeries, duration, inputError } = useMemo(() => {
    try {
      const parsedTimeSeries = JSON.parse(timeSeriesInput); if (!Array.isArray(parsedTimeSeries)) throw new Error('timeSeries must be an array');
      const parsedDuration = Number(durationInput); if (isNaN(parsedDuration)) throw new Error('duration must be a number');
      return { timeSeries: parsedTimeSeries, duration: parsedDuration, inputError: '' };
    } catch (e) {
      return { timeSeries: EXAMPLES[0].timeSeries, duration: EXAMPLES[0].duration, inputError: e.message };
    }
  }, [timeSeriesInput, durationInput]);
  const steps = useMemo(() => generateSteps(timeSeries, duration).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [timeSeries, duration])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setTimeSeriesInput(JSON.stringify(e.timeSeries)); setDurationInput(String(e.duration)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⚔️ Teemo', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel timeSeries={timeSeries} duration={duration} step={step} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, timeSeries, duration])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (<div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"timeSeries","label":"timeSeries","type":"string"},{"key":"duration","label":"duration","type":"number"}]}
          values={{ timeSeries: timeSeriesInput, duration: durationInput }}
          onChange={(k, v) => { if (k === 'timeSeries') setTimeSeriesInput(v); if (k === 'duration') setDurationInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </><FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}

