import { useState, useMemo, useCallback } from 'react'
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
import './Problem478Visualizer.css'

const EXAMPLES = getExamples('generate-random-point-in-a-circle')

function generateSteps(radius) {
  const steps = []
  steps.push({ activeLine: 1, radius, x: 0, y: 0, distance: 0, message: 'Generate random point (x, y) inside circle of radius ' + radius })
  for (let i = 0; i < 3; i++) {
    const angle = Math.random() * 2 * Math.PI
    const r = Math.sqrt(Math.random()) * radius
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    const dist = Math.sqrt(x*x + y*y)
    steps.push({ activeLine: 2, radius, x, y, distance: dist, message: `Sample ${i+1}: angle=${angle.toFixed(2)}, r=${r.toFixed(2)}, point=({${x.toFixed(2)}, ${y.toFixed(2)}})` })
  }
  steps.push({ activeLine: 3, radius, x: 0, y: 0, distance: 0, done: true, message: 'Random point generation complete' })
  return steps
}

function VisualizationPanel({ radius, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>Generate uniformly random points inside a circle. Use sqrt(random) × radius for distance to ensure uniform distribution.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <svg width="100%" height="300" style={{ border: '1px solid #cbd5e1', borderRadius: 4, backgroundColor: '#f9fafb' }} viewBox="-150 -150 300 300">
        <circle cx="0" cy="0" r={radius * 50} fill="rgba(139, 92, 246, 0.1)" stroke="#8b5cf6" strokeWidth="2" />
        {step && step.x !== 0 && <circle cx={step.x * 50} cy={step.y * 50} r="4" fill="#fef08a" stroke="#1f2937" strokeWidth="2" />}
      </svg>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>X</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>{step?.x?.toFixed(2) ?? 0}</div>
        </motion.div>

        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', border: '2px solid #dc2626', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>Y</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#dc2626', marginTop: 4 }}>{step?.y?.toFixed(2) ?? 0}</div>
        </motion.div>

        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>Distance</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f59e0b', marginTop: 4 }}>{step?.distance?.toFixed(2) ?? 0}</div>
        </motion.div>
      </div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem478Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { radius: 1 })
  const SOLUTION_CODE = useSolutionCode('generate-random-point-in-a-circle')

  const steps = useMemo(() => generateSteps(ex.radius).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '🎯 Random Point in Circle', content: <VisualizationPanel radius={ex.radius} step={step} applyEx={applyEx} /> },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
