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
import './Problem519Visualizer.css'

const EXAMPLES = getExamples('random-flip-matrix') || [
  { label: 'Example 1', m_n: [3, 1] },
  { label: 'Example 2', m_n: [2, 2] },
]

function generateSteps(m, n) {
  const steps = []
  const total = m * n
  const flipped = new Set()

  steps.push({
    activeLine: 1,
    m,
    n,
    total,
    flipped: new Set(),
    message: `Initialize ${m}x${n} matrix (${total} cells)`,
    phase: 'Setup'
  })

  // Simulate several flip operations
  for (let op = 0; op < 3; op++) {
    const remaining = total - flipped.size
    const idx = Math.floor(Math.random() * remaining)
    let count = 0
    let flippedIdx = 0

    for (let i = 0; i < total; i++) {
      if (!flipped.has(i)) {
        if (count === idx) {
          flippedIdx = i
          break
        }
        count++
      }
    }

    flipped.add(flippedIdx)
    const row = Math.floor(flippedIdx / n)
    const col = flippedIdx % n

    steps.push({
      activeLine: 2,
      m,
      n,
      total,
      flipped: new Set(flipped),
      lastFlipped: { row, col, idx: flippedIdx },
      message: `Flip ${op + 1}: Cell [${row}, ${col}] (index ${flippedIdx})`,
      phase: 'Random Flip'
    })
  }

  steps.push({
    activeLine: 3,
    m,
    n,
    total,
    flipped,
    done: true,
    message: `${flipped.size} cells flipped out of ${total}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ m, n, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid '#a855f7' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>Random: Efficiently flip random cells in a matrix without storing flipped cells.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e9d5ff', borderRadius: 4, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>{m}x{n} Matrix Grid</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 4 }}>
          {Array(m * n).fill(0).map((_, idx) => {
            const row = Math.floor(idx / n)
            const col = idx % n
            const isFlipped = step?.flipped?.has(idx)
            const isLastFlipped = step?.lastFlipped?.idx === idx

            return (
              <motion.div
                key={idx}
                style={{
                  aspectRatio: '1',
                  borderRadius: 6,
                  backgroundColor: isLastFlipped ? '#a855f7' : isFlipped ? '#e9d5ff' : '#f3e8ff',
                  border: isLastFlipped ? '3px solid '#6b21a8' : isFlipped ? '2px solid '#d8b4fe' : '1px solid '#e9d5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  color: isLastFlipped ? 'white' : '#6b21a8',
                  cursor: 'pointer'
                }}
                animate={{
                  backgroundColor: isLastFlipped ? '#a855f7' : isFlipped ? '#e9d5ff' : '#f3e8ff',
                  scale: isLastFlipped ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
              >
                {isFlipped ? '✓' : idx}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {step?.lastFlipped && (
        <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, border: '1px solid '#fca5a5' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 4 }}>Last Flipped</div>
          <div style={{ fontSize: 11, color: '#7f1d1d', fontFamily: 'monospace' }}>
            Row: {step.lastFlipped.row}, Col: {step.lastFlipped.col} (Index: {step.lastFlipped.idx})
          </div>
        </motion.div>
      )}

      {step?.flipped && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>Flipped Cells: {step.flipped.size} / {step.total}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem519Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('random-flip-matrix')
  const steps = useMemo(() => generateSteps(ex.m_n[0], ex.m_n[1]).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🎲 Random Flip', content: (<VisualizationPanel m={ex.m_n[0]} n={ex.m_n[1]} step={step} />) },
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
