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
import './Problem521Visualizer.css'

const EXAMPLES = getExamples('longest-uncommon-subsequence-i') || [
  { label: 'Example 1', a: "aba", b: "cdc" },
  { label: 'Example 2', a: "abc", b: "abc" },
]

function generateSteps(a, b) {
  const steps = []

  steps.push({
    activeLine: 1,
    a,
    b,
    message: `Find longest uncommon subsequence of "${a}" and "${b}"`,
    phase: 'Initialize'
  })

  steps.push({
    activeLine: 2,
    a,
    b,
    message: `If a === b, no uncommon subsequence exists`,
    phase: 'Check Equality'
  })

  if (a === b) {
    steps.push({
      activeLine: 3,
      a,
      b,
      result: -1,
      done: true,
      message: `Strings are identical, result: -1`,
      phase: 'Result'
    })
  } else {
    const maxLen = Math.max(a.length, b.length)
    steps.push({
      activeLine: 4,
      a,
      b,
      maxLen,
      message: `Strings are different, longer string is uncommon to the other`,
      phase: 'Different Strings'
    })

    steps.push({
      activeLine: 5,
      a,
      b,
      result: maxLen,
      done: true,
      message: `Length of longest uncommon subsequence: ${maxLen}`,
      phase: 'Result'
    })
  }

  return steps
}

function VisualizationPanel({ a, b, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid '#a855f7' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>Find the longest uncommon subsequence of two strings.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e9d5ff', borderRadius: 4, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>String A</div>
        <div style={{ padding: '8px', backgroundColor: '#f3e8ff', borderRadius: 4, fontSize: 14, fontWeight: 600, color: '#6b21a8' }}>"{a}"</div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>String B</div>
        <div style={{ padding: '8px', backgroundColor: '#f3e8ff', borderRadius: 4, fontSize: 14, fontWeight: 600, color: '#6b21a8' }}>"{b}"</div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Comparison</div>
        <div style={{ fontSize: 11, color: '#0c4a6e' }}>
          {a === b ? 'Strings are identical' : 'Strings are different'}
        </div>
      </motion.div>

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result === -1 ? '#fee2e2' : '#d1fae5',
            borderRadius: 6,
            border: step.result === -1 ? '2px solid '#dc2626' : '2px solid '#10b981'
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: step.result === -1 ? '#7f1d1d' : '#065f46', textAlign: 'center' }}>
            Result: {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem521Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('longest-uncommon-subsequence-i')
  const steps = useMemo(() => generateSteps(ex.a, ex.b).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔤 Uncommon I', content: (<VisualizationPanel a={ex.a} b={ex.b} step={step} />) },
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
