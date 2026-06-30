import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem375Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['arrange_start', 'arranging', 'complete', 'find_median', 'median_found', 'partition_complete', 'partition_start', 'verify_start', 'verifying']
const LINE_PATTERN_MAP = {
  1: 'find_median',
  2: 'median_found',
  3: 'partition_start',
  4: 'partition_complete',
  5: 'arrange_start',
  6: 'arranging',
  7: 'verify_start',
  8: 'verifying',
  9: 'complete'
}


const EXAMPLES = getExamples('wiggle-sort-ii')

function findMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.floor((sorted.length - 1) / 2)]
}

function partition(arr, median) {
  const small = []
  const equal = []
  const large = []

  for (const num of arr) {
    if (num < median) small.push(num)
    else if (num === median) equal.push(num)
    else large.push(num)
  }

  return { small, equal, large }
}

function generateSteps(nums) {
  const steps = []
  const original = [...nums]

  // Step 1: Find median
  steps.push({
    phase: 'find_median',
    activeLine: 1,
    array: [...original],
    median: null,
    message: 'Step 1: Initialize - find the median value',
  })

  const median = findMedian(original)
  steps.push({
    phase: 'median_found',
    activeLine: 2,
    array: [...original],
    median,
    sorted: [...original].sort((a, b) => a - b),
    message: `Median found: ${median}`,
  })

  // Step 2: Partition into small, equal, large
  steps.push({
    phase: 'partition_start',
    activeLine: 3,
    array: [...original],
    median,
    small: [],
    equal: [],
    large: [],
    message: 'Step 2: Partition array into three groups',
  })

  const { small, equal, large } = partition(original, median)
  const allPartitioned = [...small, ...equal, ...large]

  steps.push({
    phase: 'partition_complete',
    activeLine: 4,
    array: allPartitioned,
    median,
    small,
    equal,
    large,
    message: `Partitioned: small=[${small.join(',')}], equal=[${equal.join(',')}], large=[${large.join(',')}]`,
  })

  // Step 3: Place elements in alternating pattern
  steps.push({
    phase: 'arrange_start',
    activeLine: 5,
    array: allPartitioned,
    median,
    small,
    equal,
    large,
    message: 'Step 3: Arrange elements alternating large-small pattern',
  })

  const result = []
  const smallRev = [...small].reverse()
  const largeRev = [...large].reverse()

  let smallIdx = 0
  let equalIdx = 0
  let largeIdx = 0

  // Reverse order: place large values at positions 1, 3, 5... and small at 0, 2, 4...
  // This ensures the wiggle property: small < large > small < large...
  for (let i = 0; i < original.length; i++) {
    if (i % 2 === 1) {
      // Odd index: place large
      result[i] = largeRev[largeIdx++]
    } else {
      // Even index: place small
      if (smallIdx < smallRev.length) {
        result[i] = smallRev[smallIdx++]
      } else if (equalIdx < equal.length) {
        result[i] = equal[equalIdx++]
      } else {
        result[i] = largeRev[largeIdx++]
      }
    }
  }

  // Show arrangement steps
  let current = []
  for (let i = 0; i < result.length; i++) {
    if (current.length <= i) current[i] = result[i]

    steps.push({
      phase: 'arranging',
      activeLine: 6,
      array: [...current],
      result,
      median,
      placedIndex: i,
      message: `Placing element at index ${i}: ${result[i]}`,
    })
  }

  // Step 4: Verify wiggle property
  steps.push({
    phase: 'verify_start',
    activeLine: 7,
    array: result,
    result,
    median,
    message: 'Step 4: Verify zigzag pattern (checking ups and downs)',
  })

  let isValid = true
  for (let i = 1; i < result.length; i++) {
    const check = i % 2 === 1 ? result[i] > result[i - 1] : result[i] < result[i - 1]
    if (!check) isValid = false

    steps.push({
      phase: 'verifying',
      activeLine: 8,
      array: result,
      result,
      checkIndex: i,
      isCheck: i % 2 === 1 ? `${result[i]} > ${result[i - 1]}` : `${result[i]} < ${result[i - 1]}`,
      valid: check,
      message: check
        ? `✓ Index ${i}: ${result[i]} ${i % 2 === 1 ? '>' : '<'} ${result[i - 1]} (valid)`
        : `✗ Index ${i}: ${result[i]} ${i % 2 === 1 ? '>' : '<'} ${result[i - 1]} (failed)`,
    })
  }

  // Final step
  steps.push({
    phase: 'complete',
    activeLine: 9,
    array: result,
    result,
    message: `Done! Wiggle pattern ${isValid ? 'verified ✓' : 'invalid ✗'}: ${result.join(' < ')}`,
    done: true,
  })

  return steps
}

function ArrayVisualization({ originalArray, step }) {
  const array = step?.array || []
  const result = step?.result
  const median = step?.median
  const small = step?.small || []
  const equal = step?.equal || []
  const large = step?.large || []
  const placedIndex = step?.placedIndex ?? -1
  const checkIndex = step?.checkIndex ?? -1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Original array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Original Array</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {originalArray.map((num, idx) => (
            <motion.div
              key={`orig-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid #cbd5e1',
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                color: '#334155',
              }}
              animate={{ scale: 1 }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Median information */}
      {median !== null && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>
            Median: {median}
          </div>
        </motion.div>
      )}

      {/* Partitioned groups */}
      {small.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, marginBottom: 6 }}>Small (&lt; median)</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {small.map((num, idx) => (
                <div key={`small-${idx}`} style={{
                  padding: '4px 8px',
                  backgroundColor: '#0c4a6e',
                  color: '#dbeafe',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {num}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#ddd6fe', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: '#4c1d95', fontWeight: 600, marginBottom: 6 }}>Equal</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {equal.map((num, idx) => (
                <div key={`equal-${idx}`} style={{
                  padding: '4px 8px',
                  backgroundColor: '#4c1d95',
                  color: '#ddd6fe',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {num}
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600, marginBottom: 6 }}>&gt; median</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {large.map((num, idx) => (
                <div key={`large-${idx}`} style={{
                  padding: '4px 8px',
                  backgroundColor: '#7f1d1d',
                  color: '#fee2e2',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Current result array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          {step?.phase === 'complete' ? 'Final Wiggle Array ✓' : 'Building Result'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {array.map((num, idx) => {
            const isPlaced = idx <= placedIndex && placedIndex >= 0
            const isCurrent = idx === checkIndex && checkIndex >= 0
            const isCheck = idx > 0 && idx === checkIndex

            return (
              <motion.div
                key={`res-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#fca5a5' : isPlaced ? '#d1fae5' : '#f3f4f6',
                  borderColor: isCurrent ? '#dc2626' : isCheck ? '#10b981' : '#d1d5db',
                  color: isCurrent ? '#7f1d1d' : isCheck ? '#047857' : '#374151',
                }}
                animate={{ scale: isCurrent ? 1.05 : 1 }}
              >
                {num}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Zigzag visualization */}
      {array.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginBottom: 10 }}>Zigzag Pattern</div>
          <svg width="100%" height="80" style={{ minHeight: 80 }}>
            {array.map((_, idx) => {
              const x = (idx / (array.length - 1 || 1)) * 100 + '%'
              const isDown = idx % 2 === 0
              const y = isDown ? 60 : 20
              return (
                <motion.circle
                  key={`zig-${idx}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#15803d"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )
            })}
            {array.map((_, idx) => {
              if (idx === array.length - 1) return null
              const x1 = (idx / (array.length - 1)) * 100 + '%'
              const x2 = ((idx + 1) / (array.length - 1)) * 100 + '%'
              const isDown = idx % 2 === 0
              const y1 = isDown ? 60 : 20
              const y2 = isDown ? 20 : 60
              return (
                <motion.line
                  key={`zig-line-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#15803d"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              )
            })}
          </svg>
        </div>
      )}

      {/* Verification info */}
      {step?.checkIndex !== undefined && step.checkIndex >= 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.valid ? '#d1fae5' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${step.valid ? '#10b981' : '#dc2626'}`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, color: step.valid ? '#047857' : '#991b1b', fontWeight: 600 }}>
            {step.isCheck}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
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
                backgroundColor: '#f1f5f9',
                fontWeight: 500,
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <ArrayVisualization nums={nums} originalArray={nums} step={step} />
    </div>
  )
}

export default function Problem375Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [5, 7, 4, 3, 1] })

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
      title: '⬆⬇ Wiggle Sort',
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
