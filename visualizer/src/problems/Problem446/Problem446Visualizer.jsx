import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['arithmetic', 'checking', 'done', 'start']
const LINE_PATTERN_MAP = {
  2: 'done',
  4: 'start',
  7: 'checking',
  9: 'arithmetic',
  10: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def numberOfArithmeticSlices(nums: list) -> int:' },
  { line: 2, text: '    if len(nums) < 3: return 0' },
  { line: 3, text: '    n = len(nums)' },
  { line: 4, text: '    dp = [0] * n' },
  { line: 5, text: '    count = 0' },
  { line: 6, text: '    for i in range(2, n):' },
  { line: 7, text: '        if nums[i] - nums[i-1] == nums[i-1] - nums[i-2]:' },
  { line: 8, text: '            dp[i] = dp[i-1] + 1' },
  { line: 9, text: '            count += dp[i]' },
  { line: 10, text: '    return count' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('arithmetic-slices-ii') || [
  { label: 'Example 1', nums: [1, 2, 3, 4], expected: 6 },
  { label: 'Example 2', nums: [1, 2, 3, 5, 7, 9], expected: 3 },
  { label: 'Example 3', nums: [1, 2, 3, 4, 5, 6], expected: 9 },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [1, 2, 3, 4, 5] },
  { id: 'loop', label: 'Check & Count', lines: [6, 7, 8, 9] },
  { id: 'return', label: 'Return', lines: [10] },
]

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length < 3) {
    return [{
      phase: 'done',
      activeLine: 2,
      nums: nums || [],
      dp: [],
      count: 0,
      stepNum: 0,
      message: nums && nums.length < 3 ? 'Need at least 3 elements' : 'Invalid input.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 4,
    nums: [...nums],
    dp: Array(nums.length).fill(0),
    count: 0,
    stepNum: 0,
    message: `Array: ${JSON.stringify(nums)}`,
  })

  let dp = Array(nums.length).fill(0)
  let count = 0
  let stepNum = 1

  for (let i = 2; i < nums.length; i++) {
    steps.push({
      phase: 'checking',
      activeLine: 7,
      nums: [...nums],
      dp: [...dp],
      count,
      currentIdx: i,
      diff1: nums[i - 1] - nums[i - 2],
      diff2: nums[i] - nums[i - 1],
      stepNum,
      message: `i=${i}: diff[${i-1},${i-2}]=${nums[i - 1] - nums[i - 2]}, diff[${i},${i-1}]=${nums[i] - nums[i - 1]}`,
    })
    stepNum++

    if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) {
      dp[i] = dp[i - 1] + 1
      count += dp[i]

      steps.push({
        phase: 'arithmetic',
        activeLine: 9,
        nums: [...nums],
        dp: [...dp],
        count,
        currentIdx: i,
        stepNum,
        message: `Match! dp[${i}]=${dp[i]}, count+=${dp[i]} -> ${count}`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 10,
    nums: [...nums],
    dp: [...dp],
    count,
    stepNum,
    message: `Total arithmetic subsequences: ${count}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'checking' || phase === 'arithmetic') return 'loop'
  if (phase === 'done') return 'return'
  return 'init'
}

function DPArray({ nums, dp, currentIdx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        DP Array (subsequence counts)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
        {dp.map((val, i) => {
          const isActive = i === currentIdx
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? '#fef08a' : '#e0e7ff',
                border: `2px solid ${isActive ? '#eab308' : '#818cf8'}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? '#713f12' : '#3730a3',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function InputArray({ nums, currentIdx, diff1, diff2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Input Array
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
        {nums.map((val, i) => {
          const isActive = i === currentIdx || i === currentIdx - 1 || i === currentIdx - 2
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isActive ? '#dbeafe' : '#f3f4f6',
                border: `2px solid ${isActive ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? '#1e40af' : '#6b7280',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>
      {diff1 !== undefined && (
        <div style={{ fontSize: 11, color: '#64748b', padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
          <div>Diff[i-1, i-2]: {diff1}</div>
          <div>Diff[i, i-1]: {diff2}</div>
        </div>
      )}
    </div>
  )
}

function VisualizationPanel({ step, nums, EXAMPLES, handleExampleClick, numsInput, setNumsInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          Array (comma-separated)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={numsInput}
            onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
            placeholder="e.g., 1,2,3,4"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleReset}
            style={{
              padding: '8px 10px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <InputArray
          nums={step?.nums || []}
          currentIdx={step?.currentIdx}
          diff1={step?.diff1}
          diff2={step?.diff2}
        />
        <DPArray nums={nums} dp={step?.dp || []} currentIdx={step?.currentIdx} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Count: {step?.count ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Counting subsequences where consecutive differences match, building on previous solutions.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem446Visualizer() {
  const [numsInput, setNumsInput] = useState('1,2,3,4')

  const nums = useMemo(() => {
    if (!numsInput || numsInput.trim() === '') return []
    return numsInput.split(',').map(s => {
      const n = parseInt(s.trim())
      return isNaN(n) ? 0 : n
    })
  }, [numsInput])

  const steps = useMemo(
    () => generateSteps(nums).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nums],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setNumsInput(ex.nums.join(','))
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          step={step}
          nums={nums}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          numsInput={numsInput}
          setNumsInput={setNumsInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    nums,
    numsInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
