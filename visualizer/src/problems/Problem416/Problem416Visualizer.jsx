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
import './Problem416Visualizer.css'

const EXAMPLES = [
  { label: 'Can Partition', nums: [1, 5, 11, 5], expected: true },
  { label: 'Cannot Partition', nums: [2, 2, 1, 1], expected: false },
  { label: 'All Same', nums: [1, 1, 1, 1], expected: true },
]

function generateSteps(nums) {
  const steps = []

  const total = nums.reduce((a, b) => a + b, 0)

  steps.push({
    activeLine: 1,
    message: `Check if array can be partitioned. Array: [${nums.join(', ')}], Total: ${total}`,
    phase: 'init',
    result: null,
    canPartition: null,
    target: null,
    dp: [],
    nums,
  })

  if (total % 2 !== 0) {
    steps.push({
      activeLine: 2,
      message: `Total sum ${total} is odd. Cannot partition into equal subsets.`,
      phase: 'done',
      result: false,
      canPartition: false,
      target: null,
      dp: [],
      nums,
    })
    return steps
  }

  const target = total / 2

  steps.push({
    activeLine: 3,
    message: `Total is even. Target sum for each subset: ${target}`,
    phase: 'set_target',
    result: null,
    canPartition: null,
    target,
    dp: Array(target + 1).fill(false),
    nums,
  })

  const dp = Array(target + 1).fill(false)
  dp[0] = true

  steps.push({
    activeLine: 4,
    message: `Initialize DP: dp[0] = true (empty subset has sum 0)`,
    phase: 'init_dp',
    result: null,
    canPartition: null,
    target,
    dp: [...dp],
    nums,
  })

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 5,
      message: `Process nums[${i}] = ${num}`,
      phase: 'process_num',
      result: null,
      canPartition: null,
      target,
      dp: [...dp],
      currentNum: num,
      currentI: i,
      nums,
    })

    for (let j = target; j >= num; j--) {
      steps.push({
        activeLine: 6,
        message: `Check sum j=${j}. dp[${j}] = dp[${j}] || dp[${j - num}] = ${dp[j]} || ${dp[j - num]}`,
        phase: 'update_dp',
        result: null,
        canPartition: null,
        target,
        currentJ: j,
        currentNum: num,
        currentI: i,
        dp: [...dp],
        nums,
      })

      if (dp[j - num]) {
        dp[j] = true

        steps.push({
          activeLine: 7,
          message: `Sum ${j} is possible now.`,
          phase: 'sum_found',
          result: null,
          canPartition: null,
          target,
          currentJ: j,
          currentNum: num,
          currentI: i,
          dp: [...dp],
          nums,
        })
      }
    }
  }

  const canPartition = dp[target]

  steps.push({
    activeLine: 8,
    message: `Complete. Can partition into equal subsets: ${canPartition}`,
    phase: 'done',
    result: canPartition,
    canPartition,
    target,
    dp: [...dp],
    nums,
  })

  return steps
}

function PartitionVisualization({ nums, step }) {
  const result = step?.result ?? null
  const target = step?.target
  const dp = step?.dp || []
  const total = nums.reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Partition Equal Subset Sum</div>

      {/* Input array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Input Array (Total: {total})</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((val, idx) => {
            const isCurrent = step?.currentI === idx
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isCurrent ? '#c7d2fe' : '#f1f5f9',
                  borderRadius: 6,
                  border: `2px solid ${isCurrent ? '#8b5cf6' : '#cbd5e1'}`,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: isCurrent ? '#6d28d9' : '#334155',
                  minWidth: 50,
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Target info */}
      {target !== null && (
        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 4 }}>Target</div>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#8b5cf6', fontFamily: 'monospace' }}>
            Each subset must sum to {target}
          </div>
        </div>
      )}

      {/* DP visualization */}
      {dp.length > 0 && target !== null && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
            DP Table (achievable sums: 0 to {target})
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(target + 1, 15)}, minmax(40px, 1fr))`,
            gap: 4,
            maxHeight: 150,
            overflowY: 'auto',
            padding: 8,
            backgroundColor: '#f1f5f9',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
          }}>
            {dp.map((val, idx) => {
              const isCurrent = step?.currentJ === idx
              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '4px',
                    backgroundColor: val ? '#10b981' : '#f1f5f9',
                    borderRadius: 3,
                    border: `1px solid ${isCurrent ? '#8b5cf6' : val ? '#059669' : '#cbd5e1'}`,
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: val ? '#ffffff' : '#94a3b8',
                    minWidth: 35,
                  }}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                    boxShadow: isCurrent ? '0 0 8px rgba(139,92,246,0.5)' : 'none',
                  }}
                >
                  {idx}
                </motion.div>
              )
            })}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
            Green = achievable sum, White = not achievable
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{
        padding: 12,
        backgroundColor: result ? '#f0fdf4' : '#fee2e2',
        borderRadius: 6,
        border: `2px solid ${result ? '#10b981' : '#ef4444'}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: result ? '#065f46' : '#7f1d1d', marginBottom: 4 }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: result ? '#10b981' : '#ef4444' }}>
          {result === null ? '—' : result ? 'Can Partition' : 'Cannot Partition'}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem416Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

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
      title: '🎯 Partition Equal Sum',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#f3e8ff' : '#f1f5f9',
                    color: exIdx === idx ? '#6b21a8' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <PartitionVisualization nums={example.nums} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

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
