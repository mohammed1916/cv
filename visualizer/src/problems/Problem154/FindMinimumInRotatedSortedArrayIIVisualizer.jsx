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
import './FindMinimumInRotatedSortedArrayIIVisualizer.css'

const EXAMPLES = getExamples('find-minimum-in-rotated-sorted-array-ii') || [
  { label: 'Example 1', nums: [1, 3, 5] },
  { label: 'Example 2', nums: [2, 2, 2, 0, 1] },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findMin(nums):' },
  { line: 2, text: '    left, right = 0, len(nums) - 1' },
  { line: 3, text: '    while left < right:' },
  { line: 4, text: '        mid = (left + right) // 2' },
  { line: 5, text: '        if nums[mid] > nums[right]:' },
  { line: 6, text: '            left = mid + 1' },
  { line: 7, text: '        elif nums[mid] < nums[right]:' },
  { line: 8, text: '            right = mid' },
  { line: 9, text: '        else:' },
  { line: 10, text: '            right -= 1  # duplicates' },
  { line: 11, text: '    return nums[left]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty array',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    nums,
    message: 'Find minimum in rotated sorted array with duplicates',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    nums,
    left: 0,
    right: nums.length - 1,
    message: `Initialize: left = 0, right = ${nums.length - 1}`,
    relatedLines: [2],
  })

  let left = 0
  let right = nums.length - 1
  let iteration = 0

  while (left < right && iteration < 20) {
    iteration++
    const mid = Math.floor((left + right) / 2)

    steps.push({
      activeLine: 4,
      nums,
      left,
      right,
      mid,
      message: `mid = ${mid}, nums[mid] = ${nums[mid]}, nums[right] = ${nums[right]}`,
      relatedLines: [4],
    })

    if (nums[mid] > nums[right]) {
      steps.push({
        activeLine: 5,
        nums,
        left,
        right,
        mid,
        message: `${nums[mid]} > ${nums[right]}: min is in right half`,
        relatedLines: [5, 6],
      })

      left = mid + 1

      steps.push({
        activeLine: 6,
        nums,
        left,
        right,
        mid,
        message: `left = ${left}`,
        relatedLines: [6],
      })
    } else if (nums[mid] < nums[right]) {
      steps.push({
        activeLine: 7,
        nums,
        left,
        right,
        mid,
        message: `${nums[mid]} < ${nums[right]}: min is in left half (or mid)`,
        relatedLines: [7, 8],
      })

      right = mid

      steps.push({
        activeLine: 8,
        nums,
        left,
        right,
        mid,
        message: `right = ${right}`,
        relatedLines: [8],
      })
    } else {
      steps.push({
        activeLine: 9,
        nums,
        left,
        right,
        mid,
        message: `${nums[mid]} == ${nums[right]}: duplicates, shrink right`,
        relatedLines: [9, 10],
      })

      right -= 1

      steps.push({
        activeLine: 10,
        nums,
        left,
        right,
        mid,
        message: `right = ${right}`,
        relatedLines: [10],
      })
    }
  }

  steps.push({
    activeLine: 11,
    nums,
    left,
    right,
    result: nums[left],
    done: true,
    message: `Minimum found: ${nums[left]}`,
    relatedLines: [11],
  })

  return steps
}

function ArrayVisualization({ nums, left, right, mid }) {
  if (!nums) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', padding: 12 }}>
      {nums.map((num, idx) => {
        const isLeft = idx === left
        const isRight = idx === right
        const isMid = idx === mid
        const isInRange = idx >= left && idx <= right

        return (
          <motion.div
            key={idx}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              backgroundColor: isMid ? '#fbbf24' : isInRange ? '#dbeafe' : '#e2e8f0',
              border: isLeft || isRight ? '3px solid #ef4444' : isMid ? '2px solid #f59e0b' : '1px solid #cbd5e1',
              fontSize: 12,
              fontWeight: 600,
              color: '#0f172a',
            }}
            animate={{ scale: isMid ? 1.15 : 1 }}
          >
            {num}
          </motion.div>
        )
      })}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6, borderLeft: '4px solid #ef4444' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>
          Binary search: handle mid vs right, shrink on duplicates.
        </div>
      </div>

      {step.nums && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Array
          </div>
          <ArrayVisualization
            nums={step.nums}
            left={step.left}
            right={step.right}
            mid={step.mid}
          />
        </motion.div>
      )}

      {step.left !== undefined && step.right !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Search Range
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#5b21b6' }}>
            <div>left: {step.left}</div>
            {step.mid !== undefined && <div>mid: {step.mid}</div>}
            <div>right: {step.right}</div>
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Minimum
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
            {step.result}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function FindMinimumInRotatedSortedArrayIIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.nums || [1, 3, 5])
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.nums); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🔍 Min Rotated II',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
