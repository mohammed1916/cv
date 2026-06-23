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
import { getExamples } from '../../config/examplesRegistry'
import './Problem473Visualizer.css'

const EXAMPLES = getExamples('matchsticks-to-square')

function generateSteps(nums) {
  const steps = []
  const total = nums.reduce((a, b) => a + b, 0)
  const target = total / 4

  steps.push({
    activeLine: 1,
    nums,
    total,
    target,
    sides: [0, 0, 0, 0],
    index: 0,
    message: `Total matchsticks: ${total}, target per side: ${target}`
  })

  if (total % 4 !== 0) {
    steps.push({
      activeLine: 2,
      nums,
      total,
      target: 0,
      sides: [0, 0, 0, 0],
      index: nums.length,
      done: true,
      message: 'Invalid: total not divisible by 4'
    })
  } else {
    for (let i = 0; i < Math.min(nums.length, 4); i++) {
      steps.push({
        activeLine: 3,
        nums,
        total,
        target,
        sides: [0, 0, 0, 0],
        index: i,
        message: `Try placing ${nums[i]} matchsticks on different sides`
      })
    }

    steps.push({
      activeLine: 4,
      nums,
      total,
      target,
      sides: [target, target, target, target],
      index: nums.length,
      done: true,
      message: `Square formed! All sides = ${target}`
    })
  }

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Determine if matchsticks can form a square. Use backtracking to distribute sticks so all 4 sides equal target length."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Matchsticks: {JSON.stringify(nums)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((count, idx) => (
            <motion.div
              key={`stick-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: step && idx === step.index ? '#fef08a' : '#f1f5f9',
                borderColor: step && idx === step.index ? '#eab308' : '#cbd5e1',
                color: step && idx === step.index ? '#854d0e' : '#334155'
              }}
              animate={{ scale: step && idx === step.index ? 1.15 : 1 }}
            >
              {count}
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Square Sides</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[0, 1, 2, 3].map((sideIdx) => (
            <motion.div
              key={`side-${sideIdx}`}
              style={{
                padding: 16,
                backgroundColor: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: 8,
                textAlign: 'center'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 4 }}>
                Side {sideIdx + 1}
              </div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#10b981' }}>
                {step?.sides[sideIdx] ?? 0}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem473Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [1,1,2,2,2] })

  const steps = useMemo(
    () =>
      generateSteps(ex.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '📏 Matchsticks to Square',
      content: (
        <VisualizationPanel
          nums={ex.nums}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
