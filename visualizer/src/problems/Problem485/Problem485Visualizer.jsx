import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem485Visualizer.css'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamples('max-consecutive-ones') || [
  { label: 'Example 1', arr: [1, 0, 1, 1, 0] },
  { label: 'Example 2', arr: [1, 1, 1, 0, 1, 1, 1] },
  { label: 'Example 3', arr: [0, 0, 0, 1], flips: 1 },
]

function generateSteps(arr, flips = 1) {
  const steps = []
  let left = 0
  let right = 0
  let maxCount = 0
  let zeroCount = 0
  let bestLeft = 0
  let bestRight = -1

  steps.push({
    activeLine: 1,
    left: 0,
    right: 0,
    zeroCount: 0,
    maxCount: 0,
    maxLength: 0,
    arr,
    currentWindow: [],
    message: 'Initialize: two pointers and zero counter'
  })

  while (right < arr.length) {
    steps.push({
      activeLine: 2,
      left,
      right,
      zeroCount,
      maxCount: Math.max(maxCount, right - left - zeroCount),
      maxLength: maxCount,
      arr,
      currentWindow: arr.slice(left, right + 1),
      message: `Expand right pointer to index ${right}, element: ${arr[right]}`
    })

    if (arr[right] === 0) {
      zeroCount++
      steps.push({
        activeLine: 3,
        left,
        right,
        zeroCount,
        maxCount: Math.max(maxCount, right - left - zeroCount),
        maxLength: maxCount,
        arr,
        currentWindow: arr.slice(left, right + 1),
        message: `Found zero at index ${right}. Zero count: ${zeroCount}`
      })
    }

    if (zeroCount > flips) {
      steps.push({
        activeLine: 4,
        left,
        right,
        zeroCount,
        maxCount: Math.max(maxCount, right - left - zeroCount),
        maxLength: maxCount,
        arr,
        currentWindow: arr.slice(left, right + 1),
        message: `Too many zeros (${zeroCount} > ${flips}). Shrink window from left.`
      })

      if (arr[left] === 0) {
        zeroCount--
      }
      left++
    }

    maxCount = Math.max(maxCount, right - left - zeroCount)
    if (right - left - zeroCount > bestRight - bestLeft - (zeroCount > 0 ? 1 : 0)) {
      bestLeft = left
      bestRight = right
    }

    right++
  }

  steps.push({
    activeLine: 5,
    left: bestLeft,
    right: bestRight + 1,
    zeroCount: 0,
    maxCount,
    maxLength: maxCount,
    arr,
    currentWindow: arr.slice(bestLeft, bestRight + 1),
    done: true,
    message: `Maximum consecutive ones with ${flips} flip(s): ${maxCount}`
  })

  return steps
}

function VisualizationPanel({ arr, step, applyEx, flips }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fff7ed', borderRadius: 6, borderLeft: '4px solid #f97316' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Find the maximum length of consecutive 1's in a binary array. You can flip at most {flips} zero(s) to maximize the length.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {arr.map((bit, idx) => {
            const inWindow = step && idx >= step.left && idx < step.right
            const isPointer = step && (idx === step.left || idx === step.right - 1)
            return (
              <motion.div
                key={`bit-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor: bit === 1 ? '#d1fae5' : inWindow ? '#fef3c7' : '#f1f5f9',
                  borderColor: isPointer ? '#f97316' : bit === 1 ? '#10b981' : inWindow ? '#eab308' : '#cbd5e1',
                  color: bit === 1 ? '#047857' : inWindow ? '#a16207' : '#334155'
                }}
                animate={{ scale: isPointer ? 1.2 : 1 }}
              >
                {bit}
              </motion.div>
            )
          })}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f3e8ff',
            borderRadius: 6,
            border: '2px solid #a855f7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#581c87', marginBottom: 12 }}>
            Window State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#6b21a8', marginBottom: 4 }}>Left Pointer</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7' }}>{step.left}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b21a8', marginBottom: 4 }}>Right Pointer</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7' }}>{step.right - 1}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#6b21a8', marginBottom: 4 }}>Zero Count</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7' }}>{step.zeroCount}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f97316',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#a16207', marginBottom: 8 }}>Maximum Consecutive Ones</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f97316' }}>
          {step?.maxLength ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#f97316', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem485Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const [flips] = useState(1)

  const steps = useMemo(
    () =>
      generateSteps(ex.arr, flips).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex, flips]
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
          arr={ex.arr}
          step={step}
          applyEx={applyEx}
          flips={flips}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, flips])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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

