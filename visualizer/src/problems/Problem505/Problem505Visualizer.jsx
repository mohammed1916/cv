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
import './Problem505Visualizer.css'

const EXAMPLES = getExamples('distribute-candies') || [
  { label: 'Example 1', children: [1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0] },
  { label: 'Example 2', children: [1, 1] },
]

function generateSteps(children) {
  const steps = []
  const n = children.length
  const candies = new Array(n).fill(1)

  steps.push({
    activeLine: 1,
    children,
    candies: [...candies],
    message: 'Initialize each child with 1 candy',
    distribution: 'Initialize'
  })

  // Left to right pass
  for (let i = 1; i < n; i++) {
    if (children[i] > children[i - 1]) {
      candies[i] = candies[i - 1] + 1
      steps.push({
        activeLine: 2,
        children,
        candies: [...candies],
        currentIdx: i,
        message: `Child ${i} (${children[i]}) > Child ${i-1} (${children[i-1]}), increase candy to ${candies[i]}`,
        distribution: 'Left-to-Right'
      })
    }
  }

  // Right to left pass
  for (let i = n - 2; i >= 0; i--) {
    if (children[i] > children[i + 1] && candies[i] <= candies[i + 1]) {
      candies[i] = candies[i + 1] + 1
      steps.push({
        activeLine: 3,
        children,
        candies: [...candies],
        currentIdx: i,
        message: `Child ${i} (${children[i]}) > Child ${i+1} (${children[i+1]}), increase candy to ${candies[i]}`,
        distribution: 'Right-to-Left'
      })
    }
  }

  const total = candies.reduce((a, b) => a + b, 0)
  steps.push({
    activeLine: 4,
    children,
    candies,
    total,
    done: true,
    message: `Minimum candies needed: ${total}`
  })

  return steps
}

function VisualizationPanel({ children, step }) {
  const maxCandy = step?.candies ? Math.max(...step.candies) : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef08a', borderRadius: 6, borderLeft: '4px solid #eab308' }}>
        <div style={{ fontSize: 12, color: '#713f12', fontStyle: 'italic' }}>Distribute candies so each child gets at least 1, and gets more if rating is higher than neighbors.</div>
      </div>

      <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 12 }}>Child Ratings</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
          {children.map((rating, i) => (
            <motion.div
              key={i}
              style={{
                flex: 1,
                backgroundColor: step?.currentIdx === i ? '#f59e0b' : '#dbeafe',
                borderRadius: 4,
                border: step?.currentIdx === i ? '2px solid #f59e0b' : '1px solid #93c5fd',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: 40,
                height: `${20 + rating * 40}%`,
                position: 'relative'
              }}
              animate={{ height: `${20 + rating * 40}%` }}
            >
              <div style={{ fontSize: 10, fontWeight: 600, color: '#1e293b', textAlign: 'center', marginBottom: 4 }}>{rating}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.candies && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #93c5fd' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 12 }}>Candies Distributed</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {step.candies.map((candy, i) => (
              <motion.div
                key={i}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  backgroundColor: step?.currentIdx === i ? '#60a5fa' : '#e0f2fe',
                  borderRadius: 4,
                  border: step?.currentIdx === i ? '2px solid #3b82f6' : '1px solid #7dd3fc',
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  color: step?.currentIdx === i ? 'white' : '#0c4a6e'
                }}
                animate={{ backgroundColor: step?.currentIdx === i ? '#60a5fa' : '#e0f2fe' }}
              >
                {candy}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.total !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#bbf7d0', borderRadius: 6, border: '2px solid #34d399' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Total Candies: {step.total}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem505Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('distribute-candies')
  const steps = useMemo(() => generateSteps(ex.children).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🍬 Distribute Candies', content: (<VisualizationPanel children={ex.children} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
