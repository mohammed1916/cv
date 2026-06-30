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
import './Problem410Visualizer.css'

const EXAMPLES = [
  { label: 'Ex1', nums: [1,2,3,4,5], m: 2, expected: 9 },
  { label: 'Ex2', nums: [1,4,4], m: 3, expected: 4 },
]

function canSplit(nums, m, maxSum) {
  let count = 1
  let sum = 0
  for (let num of nums) {
    if (sum + num > maxSum) {
      count++
      sum = num
      if (count > m) return false
    } else {
      sum += num
    }
  }
  return true
}

function generateSteps(nums, m) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty array. Return 0.',
      phase: 'done',
      left: 0,
      right: 0,
      mid: null,
      canSplit: null,
      result: 0,
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Split array into ${m} subarrays. Target: minimize largest sum.`,
    phase: 'init',
    left: Math.max(...nums),
    right: nums.reduce((a, b) => a + b, 0),
    mid: null,
    canSplit: null,
    result: null,
    nums,
    m,
  })

  let left = Math.max(...nums) // minimum possible max sum
  let right = nums.reduce((a, b) => a + b, 0) // maximum possible max sum

  steps.push({
    activeLine: 2,
    message: `Binary search range: [${left}, ${right}]. Left = max element, Right = total sum.`,
    phase: 'init_range',
    left,
    right,
    mid: null,
    canSplit: null,
    result: null,
    nums,
    m,
  })

  let stepCount = 0

  while (left < right && stepCount < 15) {
    stepCount++
    const mid = Math.floor(left + (right - left) / 2)
    const canDo = canSplit(nums, m, mid)

    steps.push({
      activeLine: 3,
      message: `Check if can split with max sum = ${mid}`,
      phase: 'check_mid',
      left,
      right,
      mid,
      canSplit: null,
      result: null,
      checkSum: mid,
      nums,
      m,
    })

    steps.push({
      activeLine: 4,
      message: `Can split with max ${mid}: ${canDo ? 'YES' : 'NO'}`,
      phase: 'split_result',
      left,
      right,
      mid,
      canSplit: canDo,
      result: null,
      checkSum: mid,
      nums,
      m,
    })

    if (canDo) {
      right = mid

      steps.push({
        activeLine: 5,
        message: `Possible to split. Try smaller max sum. Move right = ${mid}`,
        phase: 'adjust_right',
        left,
        right: mid,
        mid,
        canSplit: true,
        result: null,
        checkSum: mid,
        nums,
        m,
      })
    } else {
      left = mid + 1

      steps.push({
        activeLine: 6,
        message: `Cannot split with ${mid}. Need larger max sum. Move left = ${mid + 1}`,
        phase: 'adjust_left',
        left: mid + 1,
        right,
        mid,
        canSplit: false,
        result: null,
        checkSum: mid,
        nums,
        m,
      })
    }
  }

  steps.push({
    activeLine: 7,
    message: `Binary search complete. Result: ${left}`,
    phase: 'done',
    left,
    right,
    mid: null,
    canSplit: null,
    result: left,
    nums,
    m,
  })

  return steps
}

function SplitArrayVisualization({ nums, m, step }) {
  const maxSum = Math.max(...nums)
  const totalSum = nums.reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Binary Search for Min Max Sum</div>

      {/* Array visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Array: {JSON.stringify(nums)}</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 100, padding: 8, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
          {nums.map((num, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${(num / maxSum) * 80}px`,
                backgroundColor: '#8b5cf6',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 4,
                fontSize: 11,
                fontWeight: 'bold',
                color: '#ffffff',
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Binary search state */}
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Binary Search State</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#065f46' }}>Left (min)</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{step?.left ?? maxSum}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#065f46' }}>Mid</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{step?.mid ?? '—'}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#065f46' }}>Right (max)</div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{step?.right ?? totalSum}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
            <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Can Split?</div>
            <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0284c7' }}>
              {step?.canSplit === null ? '—' : step.canSplit ? '✓' : '✗'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Range visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Search Range</div>
        <div style={{
          position: 'relative',
          height: 40,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
          overflow: 'hidden',
        }}>
          {/* Left marker */}
          <motion.div
            style={{
              position: 'absolute',
              left: '0%',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#dc2626',
            }}
            animate={{ left: `${((step?.left || maxSum) / totalSum) * 100}%` }}
          />

          {/* Mid marker */}
          {step?.mid && (
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: '#0284c7',
              }}
              animate={{ left: `${(step.mid / totalSum) * 100}%` }}
            />
          )}

          {/* Right marker */}
          <motion.div
            style={{
              position: 'absolute',
              right: '0%',
              top: 0,
              bottom: 0,
              width: '2px',
              backgroundColor: '#10b981',
            }}
            animate={{ right: '0%' }}
          />

          {/* Labels */}
          <div style={{ position: 'absolute', left: 4, top: 2, fontSize: 9, color: '#dc2626', fontWeight: 'bold' }}>L</div>
          {step?.mid && <div style={{ position: 'absolute', left: `${((step.mid) / totalSum) * 100}%`, top: 2, transform: 'translateX(-50%)', fontSize: 9, color: '#0284c7', fontWeight: 'bold' }}>M</div>}
          <div style={{ position: 'absolute', right: 4, top: 2, fontSize: 9, color: '#10b981', fontWeight: 'bold' }}>R</div>
        </div>
      </div>

      {/* Info boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#7f1d1d', fontWeight: 600 }}>Min Possible</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#991b1b' }}>{maxSum}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600 }}>Max Possible</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f' }}>{totalSum}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>Subarray Limit</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{m}</div>
        </div>
      </div>

      {step?.result && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Result</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7' }}>Minimum Max Sum: {step.result}</div>
        </motion.div>
      )}

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem410Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.nums, example.m).map((current) => ({
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
        <div style={{ position: "relative" }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />

        {showPatternOverlay && (
          <CodePatternAnnotations
            linePatterns={LINE_PATTERN_MAP}
            currentPhase={step?.phase}
            activeLineDom={activeLineDom}
            activeLine={step?.activeLine}
          />
        )}
      </div>
      ),
    },
    {
      id: 'viz',
      title: '📊 Split Array',
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
                    border: exIdx === idx ? '2px solid #a855f7' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#f3e8ff' : '#f1f5f9',
                    color: exIdx === idx ? '#6d28d9' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <SplitArrayVisualization nums={example.nums} m={example.m} step={step} />
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
    </div>
  )
}
