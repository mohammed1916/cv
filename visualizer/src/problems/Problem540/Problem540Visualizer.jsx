import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem540Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def singleNonDuplicate(nums):' },
  { line: 2, text: '    left, right = 0, len(nums) - 1' },
  { line: 3, text: '    while left < right:' },
  { line: 4, text: '        mid = (left + right) // 2' },
  { line: 5, text: '        if mid % 2 == 1: mid -= 1' },
  { line: 6, text: '        if nums[mid] == nums[mid+1]:' },
  { line: 7, text: '            left = mid + 2' },
  { line: 8, text: '        else:' },
  { line: 9, text: '            right = mid' },
  { line: 10, text: '    return nums[left]' },
]

function generateSteps(nums) {
  const steps = []
  let left = 0
  let right = nums.length - 1

  steps.push({
    activeLine: 1,
    nums,
    left,
    right,
    message: 'Find single non-duplicate in sorted array using binary search.',
  })

  while (left < right) {
    let mid = Math.floor((left + right) / 2)

    steps.push({
      activeLine: 4,
      nums,
      left,
      right,
      mid,
      message: `mid = ${mid}`,
    })

    if (mid % 2 === 1) {
      mid -= 1
      steps.push({
        activeLine: 5,
        nums,
        left,
        right,
        mid,
        message: `Adjust mid to even: ${mid}`,
      })
    }

    steps.push({
      activeLine: 6,
      nums,
      left,
      right,
      mid,
      val1: nums[mid],
      val2: nums[mid + 1],
      message: `Compare nums[${mid}]=${nums[mid]} and nums[${mid + 1}]=${nums[mid + 1]}`,
    })

    if (nums[mid] === nums[mid + 1]) {
      left = mid + 2
      steps.push({
        activeLine: 7,
        nums,
        left,
        right,
        mid,
        message: `Pair found, move left to ${left}`,
      })
    } else {
      right = mid
      steps.push({
        activeLine: 9,
        nums,
        left,
        right,
        mid,
        message: `Pair not found, move right to ${mid}`,
      })
    }
  }

  steps.push({
    activeLine: 10,
    nums,
    left,
    right,
    result: nums[left],
    message: `Return nums[${left}] = ${nums[left]}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', nums: [1, 1, 2, 3, 3, 4, 4, 8, 8] },
  { label: 'Example 2', nums: [3, 3, 7, 7, 10, 11, 11] },
  { label: 'Example 3', nums: [1] },
]

export default function Problem540Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.nums), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '🔍 Binary Search',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Array visualization */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Array:</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {step.nums.map((num, i) => {
                        const isLeft = i === step.left
                        const isRight = i === step.right
                        const isMid = i === step.mid
                        const isPair = (i === step.mid || i === step.mid + 1) && step.val1 !== undefined

                        return (
                          <motion.div
                            key={i}
                            animate={{ scale: isLeft || isRight || isMid ? 1.15 : 1 }}
                            style={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              fontWeight: 600,
                              fontSize: 12,
                              border: `2px solid ${isMid ? '#0ea5e9' : isLeft ? '#10b981' : isRight ? '#ef4444' : '#cbd5e1'}`,
                              backgroundColor: isMid ? '#dbeafe' : isLeft ? '#dcfce7' : isRight ? '#fee2e2' : '#f1f5f9',
                              color: '#1e293b',
                            }}
                          >
                            {num}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Pointers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Left</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{step.left}</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fee2e2', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#b91c1c', fontWeight: 600 }}>Right</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>{step.right}</div>
                    </div>
                  </div>

                  {/* Result */}
                  {step.result !== undefined && (
                    <motion.div
                      animate={{ scale: 1.05 }}
                      style={{
                        marginTop: 12,
                        padding: 8,
                        backgroundColor: '#dcfce7',
                        border: '1px solid #10b981',
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 12,
                      }}
                    >
                      Result: {step.result}
                    </motion.div>
                  )}
              </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample]
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
          prevDisabled={stepIndex <= 0}
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
