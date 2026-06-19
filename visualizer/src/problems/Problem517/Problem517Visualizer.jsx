import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem517Visualizer.css'

const EXAMPLES = getExamples('super-washing-machines') || [
  { label: 'Example 1', machines: [1,0,5] },
  { label: 'Example 2', machines: [0,3,0] },
]

function generateSteps(machines) {
  const steps = []
  const n = machines.length
  const totalDresses = machines.reduce((a, b) => a + b, 0)
  const target = totalDresses / n

  steps.push({
    activeLine: 1,
    machines: [...machines],
    target,
    message: `Balance ${totalDresses} dresses across ${n} machines`,
    phase: 'Initialize'
  })

  if (totalDresses % n !== 0) {
    steps.push({
      activeLine: 2,
      machines,
      target,
      impossible: true,
      done: true,
      message: 'Impossible: total dresses not divisible by number of machines',
      phase: 'Validation'
    })
    return steps
  }

  let maxMoves = 0
  let leftBalance = 0

  for (let i = 0; i < n; i++) {
    leftBalance += machines[i] - target
    const rightBalance = -leftBalance
    const outgoing = Math.max(Math.abs(leftBalance), Math.abs(rightBalance))
    maxMoves = Math.max(maxMoves, outgoing + (machines[i] > target ? machines[i] - target : 0))

    steps.push({
      activeLine: 3,
      machines: [...machines],
      target,
      currentIdx: i,
      leftBalance,
      maxMoves,
      message: `Machine ${i}: left balance=${leftBalance}, max moves so far=${maxMoves}`,
      phase: 'Balancing'
    })
  }

  steps.push({
    activeLine: 4,
    machines,
    target,
    result: maxMoves,
    done: true,
    message: `Minimum moves: ${maxMoves}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ machines, step }) {
  const maxVal = Math.max(...machines, step?.target || 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6, borderLeft: '4px solid '#dc2626' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>Greedy: Find minimum moves to balance washing machines.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fef2f2', borderRadius: 4, border: '1px solid '#fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7f1d1d' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, border: '1px solid '#fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 12 }}>Machine States</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
          {machines.map((val, i) => (
            <motion.div
              key={i}
              style={{
                flex: 1,
                backgroundColor: step?.currentIdx === i ? '#dc2626' : '#fee2e2',
                borderRadius: 4,
                border: step?.currentIdx === i ? '2px solid '#991b1b' : '1px solid '#fecaca',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: 40,
                height: `${20 + (val / maxVal) * 80}%`,
                position: 'relative'
              }}
              animate={{ backgroundColor: step?.currentIdx === i ? '#dc2626' : '#fee2e2' }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: step?.currentIdx === i ? 'white' : '#7f1d1d', textAlign: 'center', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: step?.currentIdx === i ? 'rgba(255,255,255,0.8)' : '#a3462f', textAlign: 'center' }}>M{i}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.target !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>Target per machine: {step.target}</div>
        </motion.div>
      )}

      {step?.impossible && (
        <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, border: '2px solid '#dc2626' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d' }}>Cannot be balanced!</div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid '#10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Minimum Moves: {step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem517Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('super-washing-machines')
  const steps = useMemo(() => generateSteps(ex.machines).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🧺 Washing Machines', content: (<VisualizationPanel machines={ex.machines} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
