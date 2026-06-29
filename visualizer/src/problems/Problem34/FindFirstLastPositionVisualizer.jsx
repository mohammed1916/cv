import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FindFirstLastPositionVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def searchRange(self, nums: List[int], target: int) -> List[int]:' },
  { line: 3, text: '        def findFirst(target):' },
  { line: 4, text: '            left, right = 0, len(nums) - 1' },
  { line: 5, text: '            res = -1' },
  { line: 6, text: '            while left <= right:' },
  { line: 7, text: '                mid = left + (right - left) // 2' },
  { line: 8, text: '                if nums[mid] == target:' },
  { line: 9, text: '                    res = mid' },
  { line: 10, text: '                    right = mid - 1  # keep searching left' },
  { line: 11, text: '                elif nums[mid] < target:' },
  { line: 12, text: '                    left = mid + 1' },
  { line: 13, text: '                else:' },
  { line: 14, text: '                    right = mid - 1' },
  { line: 15, text: '            return res' },
  { line: 16, text: '        ' },
  { line: 17, text: '        def findLast(target):' },
  { line: 18, text: '            left, right = 0, len(nums) - 1' },
  { line: 19, text: '            res = -1' },
  { line: 20, text: '            while left <= right:' },
  { line: 21, text: '                mid = left + (right - left) // 2' },
  { line: 22, text: '                if nums[mid] == target:' },
  { line: 23, text: '                    res = mid' },
  { line: 24, text: '                    left = mid + 1  # keep searching right' },
  { line: 25, text: '                elif nums[mid] < target:' },
  { line: 26, text: '                    left = mid + 1' },
  { line: 27, text: '                else:' },
  { line: 28, text: '                    right = mid - 1' },
  { line: 29, text: '            return res' },
  { line: 30, text: '        ' },
  { line: 31, text: '        return [findFirst(target), findLast(target)]' },
]

function generateSteps(nums, target) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      phase: 'done', left: 0, right: -1, mid: null, mode: 'init',
      activeLine: 31, message: 'Array is empty. Return [-1, -1].',
      firstPos: -1, lastPos: -1,
    })
    return steps
  }

  let left = 0
  let right = nums.length - 1
  let firstPos = -1

  // Find first position
  steps.push({
    phase: 'init_first', left, right, mid: null, mode: 'first',
    activeLine: 3, message: `Finding first occurrence of ${target}. Initialize left = 0, right = ${right}.`,
    firstPos: -1, lastPos: -1,
  })

  while (left <= right) {
    steps.push({
      phase: 'while_check_first', left, right, mid: null, mode: 'first',
      activeLine: 6, message: `Check if left (${left}) <= right (${right}). Yes, continue.`,
      firstPos: -1, lastPos: -1,
    })

    const mid = Math.floor(left + (right - left) / 2)
    steps.push({
      phase: 'calc_mid_first', left, right, mid, mode: 'first',
      activeLine: 7, message: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}.`,
      firstPos: -1, lastPos: -1,
    })

    steps.push({
      phase: 'check_target_first', left, right, mid, mode: 'first',
      activeLine: 8, message: `Is nums[${mid}] (${nums[mid]}) == target (${target})?`,
      firstPos: -1, lastPos: -1,
    })

    if (nums[mid] === target) {
      firstPos = mid
      steps.push({
        phase: 'found_target_first', left, right, mid, mode: 'first',
        activeLine: 9, message: `Target found at index ${mid}. Record it, then search left for earlier occurrence.`,
        firstPos: mid, lastPos: -1,
      })

      steps.push({
        phase: 'search_left_first', left, right: mid - 1, mid, mode: 'first',
        activeLine: 10, message: `Update right = ${mid} - 1 = ${mid - 1}. Continue searching left.`,
        firstPos: mid, lastPos: -1,
      })

      right = mid - 1
    } else if (nums[mid] < target) {
      steps.push({
        phase: 'check_less_first', left, right, mid, mode: 'first',
        activeLine: 11, message: `nums[${mid}] (${nums[mid]}) < target (${target}). Target must be to the right.`,
        firstPos: -1, lastPos: -1,
      })

      left = mid + 1
      steps.push({
        phase: 'update_left_first', left, right, mid, mode: 'first',
        activeLine: 12, message: `Update left = ${mid} + 1 = ${left}.`,
        firstPos: -1, lastPos: -1,
      })
    } else {
      steps.push({
        phase: 'check_greater_first', left, right, mid, mode: 'first',
        activeLine: 13, message: `nums[${mid}] (${nums[mid]}) > target (${target}). Target must be to the left.`,
        firstPos: -1, lastPos: -1,
      })

      right = mid - 1
      steps.push({
        phase: 'update_right_first', left, right, mid, mode: 'first',
        activeLine: 14, message: `Update right = ${mid} - 1 = ${right}.`,
        firstPos: -1, lastPos: -1,
      })
    }
  }

  steps.push({
    phase: 'done_first', left, right, mid: null, mode: 'first',
    activeLine: 15, message: `First search complete. First position = ${firstPos}.`,
    firstPos, lastPos: -1,
  })

  // Find last position
  left = 0
  right = nums.length - 1
  let lastPos = -1

  steps.push({
    phase: 'init_last', left, right, mid: null, mode: 'last',
    activeLine: 17, message: `Finding last occurrence of ${target}. Initialize left = 0, right = ${right}.`,
    firstPos, lastPos: -1,
  })

  while (left <= right) {
    steps.push({
      phase: 'while_check_last', left, right, mid: null, mode: 'last',
      activeLine: 20, message: `Check if left (${left}) <= right (${right}). Yes, continue.`,
      firstPos, lastPos: -1,
    })

    const mid = Math.floor(left + (right - left) / 2)
    steps.push({
      phase: 'calc_mid_last', left, right, mid, mode: 'last',
      activeLine: 21, message: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}.`,
      firstPos, lastPos: -1,
    })

    steps.push({
      phase: 'check_target_last', left, right, mid, mode: 'last',
      activeLine: 22, message: `Is nums[${mid}] (${nums[mid]}) == target (${target})?`,
      firstPos, lastPos: -1,
    })

    if (nums[mid] === target) {
      lastPos = mid
      steps.push({
        phase: 'found_target_last', left, right, mid, mode: 'last',
        activeLine: 23, message: `Target found at index ${mid}. Record it, then search right for later occurrence.`,
        firstPos, lastPos: mid,
      })

      steps.push({
        phase: 'search_right_last', left: mid + 1, right, mid, mode: 'last',
        activeLine: 24, message: `Update left = ${mid} + 1 = ${mid + 1}. Continue searching right.`,
        firstPos, lastPos: mid,
      })

      left = mid + 1
    } else if (nums[mid] < target) {
      steps.push({
        phase: 'check_less_last', left, right, mid, mode: 'last',
        activeLine: 25, message: `nums[${mid}] (${nums[mid]}) < target (${target}). Target must be to the right.`,
        firstPos, lastPos: -1,
      })

      left = mid + 1
      steps.push({
        phase: 'update_left_last', left, right, mid, mode: 'last',
        activeLine: 26, message: `Update left = ${mid} + 1 = ${left}.`,
        firstPos, lastPos: -1,
      })
    } else {
      steps.push({
        phase: 'check_greater_last', left, right, mid, mode: 'last',
        activeLine: 27, message: `nums[${mid}] (${nums[mid]}) > target (${target}). Target must be to the left.`,
        firstPos, lastPos: -1,
      })

      right = mid - 1
      steps.push({
        phase: 'update_right_last', left, right, mid, mode: 'last',
        activeLine: 28, message: `Update right = ${mid} - 1 = ${right}.`,
        firstPos, lastPos: -1,
      })
    }
  }

  steps.push({
    phase: 'done_last', left, right, mid: null, mode: 'last',
    activeLine: 31, message: `Last search complete. Result = [${firstPos}, ${lastPos}].`,
    firstPos, lastPos, result: [firstPos, lastPos],
  })

  return steps
}

const EXAMPLES = getExamples('find-first-last-position')

export default function FindFirstLastPositionVisualizer() {
  const [numsInput, setNumsInput] = useState('[5, 7, 7, 8, 8, 10]')
  const [targetInput, setTargetInput] = useState('8')

  const { nums, target, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      const t = Number(targetInput)
      if (!Array.isArray(n)) throw new Error('nums must be an array')
      if (isNaN(t)) throw new Error('target must be a number')

      const isSorted = n.every((val, i, arr) => !i || val >= arr[i - 1])
      if (!isSorted) {
        return { nums: [...n].sort((a, b) => a - b), target: t, inputError: 'Input array was automatically sorted.' }
      }
      return { nums: n, target: t, inputError: '' }
    } catch (e) {
      return { nums: [5, 7, 7, 8, 8, 10], target: 8, inputError: e.message || 'Invalid input' }
    }
  }, [numsInput, targetInput])

  const steps = useMemo(
    () => generateSteps(nums, target).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums, target],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    setTargetInput(String(ex.target))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div className="ffp-shell">
      <div className="ffp-top">
        <div className="ffp-panel" style={{ flex: 1 }}>
          <div className="ffp-panel-head">
            Sorted Array & Search Range
            {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
          </div>
          <div className="ffp-panel-body">
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  className="ffp-example-btn"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
              <input
                value={numsInput}
                onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
                placeholder="[5, 7, 7, 8, 8, 10]"
                className="ffp-input"
                style={{ flex: 1, margin: 0 }}
              />
              <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>target=</span>
              <input
                value={targetInput}
                onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
                placeholder="8"
                className="ffp-input"
                style={{ width: '60px', margin: 0, textAlign: 'center' }}
              />
            </div>

            <div className="ffp-pointers-legend">
              <div className="ffp-legend-item left"><div className="ffp-legend-swatch" /> Left</div>
              <div className="ffp-legend-item mid"><div className="ffp-legend-swatch" /> Mid</div>
              <div className="ffp-legend-item right"><div className="ffp-legend-swatch" /> Right</div>
              <div className="ffp-legend-item target"><div className="ffp-legend-swatch" /> Target</div>
            </div>

            <div className="ffp-array-container">
              {nums.map((num, i) => {
                const isLeft = step?.left === i
                const isRight = step?.right === i
                const isMid = step?.mid === i
                const isTarget = num === target
                const isOutOfBounds = step && (i < step.left || i > step.right)

                let cellClass = "ffp-cell "
                if (isLeft) cellClass += "left "
                if (isRight) cellClass += "right "
                if (isMid) cellClass += "mid "
                if (isOutOfBounds && !isMid) cellClass += "out-of-bounds "
                if (isTarget && !isMid && !isOutOfBounds) cellClass += "target "

                return (
                  <div key={i} className="ffp-cell-wrapper">
                    <div className="ffp-index">{i}</div>
                    <div className={cellClass}>
                      {num}
                    </div>
                    <div className="ffp-pointers">
                      {isLeft && <div className="ffp-ptr left">L</div>}
                      {isMid && <div className="ffp-ptr mid">M</div>}
                      {isRight && <div className="ffp-ptr right">R</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="ffp-stats">
              <div className="ffp-stat-box">
                <span className="ffp-stat-label">Search Mode</span>
                <span className="ffp-stat-val" style={{ color: step?.mode === 'first' ? '#06b6d4' : '#ec4899' }}>
                  {step?.mode === 'first' ? 'Finding First' : step?.mode === 'last' ? 'Finding Last' : 'Ready'}
                </span>
              </div>
              <div className="ffp-stat-box">
                <span className="ffp-stat-label">First Position</span>
                <span className="ffp-stat-val" style={{ color: '#06b6d4' }}>{step?.firstPos ?? '-'}</span>
              </div>
              <div className="ffp-stat-box">
                <span className="ffp-stat-label">Last Position</span>
                <span className="ffp-stat-val" style={{ color: '#ec4899' }}>{step?.lastPos ?? '-'}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="ffp-middle">
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      </div>

      <div className={`ffp-status \${step?.result ? 'success' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

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
