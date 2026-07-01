import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem495Visualizer.css'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'done',


}

const EXAMPLES = getExamples('teemo-attacking') || [
  { label: 'Example 1', timeSeries: [1,4], duration: 2 },
  { label: 'Example 2', timeSeries: [1,2], duration: 2 },
]

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
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#14b8a6' }}>{step?.totalDamage ?? 0}</div>
        <div style={{ fontSize: 12, color: '#14b8a6', marginTop: 8 }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem495Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(() => generateSteps(ex.timeSeries, ex.duration).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '⚔️ Teemo', content: (<VisualizationPanel timeSeries={ex.timeSeries} duration={ex.duration} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}

