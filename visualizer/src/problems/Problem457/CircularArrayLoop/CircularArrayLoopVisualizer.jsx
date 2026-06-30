import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './CircularArrayLoopVisualizer.css'
const EXAMPLES = getExamples('circular-array-loop')

function generateSteps(nums) {
  const steps = []
  const n = nums.length
  const visited = new Set()

  steps.push({
    activeLine: 1,
    nums,
    visited: new Set(),
    currentIdx: -1,
    slowIdx: -1,
    fastIdx: -1,
    path: [],
    hasCycle: false,
    message: 'Initialize: Check each position for cycle'
  })

  for (let i = 0; i < Math.min(n, 3); i++) {
    steps.push({
      activeLine: 2,
      nums,
      visited: new Set(visited),
      currentIdx: i,
      slowIdx: -1,
      fastIdx: -1,
      path: [],
      hasCycle: false,
      message: `Start from index ${i}: value=${nums[i]}`
    })

    let slow = i, fast = i
    const pathTrace = [i]

    for (let count = 0; count < n * 2; count++) {
      slow = (slow + nums[slow]) % n
      if (slow < 0) slow += n

      pathTrace.push(slow)
      steps.push({
        activeLine: 3,
        nums,
        visited: new Set(visited),
        currentIdx: i,
        slowIdx: slow,
        fastIdx: fast,
        path: pathTrace.slice(-5),
        hasCycle: false,
        message: `Slow moves to ${slow}`
      })

      fast = (fast + nums[fast]) % n
      if (fast < 0) fast += n
      fast = (fast + nums[fast]) % n
      if (fast < 0) fast += n

      steps.push({
        activeLine: 4,
        nums,
        visited: new Set(visited),
        currentIdx: i,
        slowIdx: slow,
        fastIdx: fast,
        path: pathTrace.slice(-5),
        hasCycle: false,
        message: `Fast moves to ${fast}`
      })

      if (slow === fast && slow !== i) {
        steps.push({
          activeLine: 5,
          nums,
          visited: new Set(visited),
          currentIdx: i,
          slowIdx: slow,
          fastIdx: fast,
          path: pathTrace.slice(-5),
          hasCycle: true,
          message: `CYCLE DETECTED at index ${slow}!`
        })
        visited.add(i)
        break
      }

      if (count === n * 2 - 1) {
        steps.push({
          activeLine: 6,
          nums,
          visited: new Set(visited),
          currentIdx: i,
          slowIdx: slow,
          fastIdx: fast,
          path: pathTrace.slice(-5),
          hasCycle: false,
          message: `No cycle from index ${i}`
        })
      }
    }
  }

  steps.push({
    activeLine: 7,
    nums,
    visited: new Set(visited),
    currentIdx: -1,
    slowIdx: -1,
    fastIdx: -1,
    path: [],
    hasCycle: visited.size > 0,
    done: true,
    message: visited.size > 0 ? `CYCLE EXISTS!` : 'NO CYCLE FOUND'
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          "Follow the pointers in a circular array! If nums[i] is positive, move right; negative, move left. Can you detect if there's an infinite loop? Use the tortoise and hare algorithm!"
        </div>
      </div>

      {/* Examples */}
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

      {/* Array with pointers */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Circular Array
        </div>
        <div style={{
          padding: 16,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {nums.map((val, idx) => {
            const isSlow = step && idx === step.slowIdx
            const isFast = step && idx === step.fastIdx
            const inPath = step && step.path?.includes(idx)

            return (
              <motion.div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isSlow ? '#bfdbfe' : isFast ? '#fed7aa' : inPath ? '#e0e7ff' : '#f1f5f9',
                  borderColor: isSlow ? '#0284c7' : isFast ? '#f97316' : inPath ? '#818cf8' : '#cbd5e1',
                  color: isSlow ? '#0c4a6e' : isFast ? '#7c2d12' : inPath ? '#3730a3' : '#334155',
                  position: 'relative'
                }}
                animate={{
                  scale: isSlow || isFast ? 1.15 : 1,
                  boxShadow: isSlow ? '0 0 20px rgba(2, 132, 199, 0.5)' : isFast ? '0 0 20px rgba(249, 115, 22, 0.5)' : 'none'
                }}
              >
                [{idx}] {val}
                {isSlow && <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 'bold', color: '#0284c7' }}>🐢 slow</div>}
                {isFast && <div style={{ position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 'bold', color: '#f97316' }}>🐇 fast</div>}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: step?.hasCycle ? '#fee2e2' : '#f0fdf4',
          borderRadius: 6,
          border: `2px solid ${step?.hasCycle ? '#ef4444' : '#22c55e'}`,
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{
          fontSize: 16,
          fontWeight: 'bold',
          color: step?.hasCycle ? '#991b1b' : '#16a34a'
        }}>
          {step?.hasCycle ? '🔄 CYCLE DETECTED' : '✓ NO CYCLE'}
        </div>
        <div style={{ fontSize: 12, color: step?.hasCycle ? '#7f1d1d' : '#15803d', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function CircularArrayLoopVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [2, -1, 1, 2, 2] })

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
      title: '🔄 Cycle Detection',
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

