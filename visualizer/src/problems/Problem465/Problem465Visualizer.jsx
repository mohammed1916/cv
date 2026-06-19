import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './Problem465Visualizer.css'

const EXAMPLES = getExamples('max-consecutive-ones')

function generateSteps(nums) {
  const steps = []

  steps.push({
    activeLine: 1,
    nums,
    maxCount: 0,
    currentCount: 0,
    index: -1,
    message: 'Initialize: maxCount = 0, currentCount = 0'
  })

  let maxCount = 0
  let currentCount = 0

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      activeLine: 2,
      nums,
      maxCount,
      currentCount,
      index: i,
      message: `Check nums[${i}] = ${nums[i]}`
    })

    if (nums[i] === 1) {
      currentCount++
      steps.push({
        activeLine: 3,
        nums,
        maxCount,
        currentCount,
        index: i,
        message: `Found 1: increment currentCount to ${currentCount}`
      })
    } else {
      steps.push({
        activeLine: 5,
        nums,
        maxCount,
        currentCount,
        index: i,
        message: `Found 0: update maxCount = max(${maxCount}, ${currentCount}) = ${Math.max(maxCount, currentCount)}`
      })
      maxCount = Math.max(maxCount, currentCount)
      currentCount = 0
    }
  }

  steps.push({
    activeLine: 7,
    nums,
    maxCount: Math.max(maxCount, currentCount),
    currentCount: 0,
    index: nums.length,
    done: true,
    message: `Final: maxCount = max(${maxCount}, ${currentCount}) = ${Math.max(maxCount, currentCount)}`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Count the maximum consecutive 1&apos;s in a binary array. Track the current run of consecutive 1&apos;s and update the maximum whenever we encounter a 0."
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
          Binary Array: {JSON.stringify(nums)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((bit, idx) => {
            const isActive = step && idx === step.index && !step.done
            const isProcessed = step && idx < step.index
            return (
              <motion.div
                key={`bit-${idx}`}
                style={{
                  width: 45,
                  height: 45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 18,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fef08a' : isProcessed && bit === 1 ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#eab308' : isProcessed && bit === 1 ? '#10b981' : '#cbd5e1',
                  color: isActive ? '#854d0e' : isProcessed && bit === 1 ? '#047857' : '#334155'
                }}
                animate={{ scale: isActive ? 1.2 : 1 }}
              >
                {bit}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          animate={{ scale: 1 }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current Count</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>
            {step?.currentCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#059669', marginTop: 4 }}>Consecutive 1&apos;s in current run</div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
          animate={{ scale: 1 }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Max Count</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#f59e0b' }}>
            {step?.maxCount ?? 0}
          </div>
          <div style={{ fontSize: 11, color: '#b45309', marginTop: 4 }}>Maximum consecutive 1&apos;s found</div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem465Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [1, 1, 0, 1, 1, 1] })
  const SOLUTION_CODE = useSolutionCode('max-consecutive-ones')

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
      title: '📊 Max Consecutive Ones',
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
