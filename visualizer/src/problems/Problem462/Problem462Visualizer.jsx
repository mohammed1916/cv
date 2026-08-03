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

const PATTERNS = ['add_move', 'calculating', 'done', 'init_moves', 'median_found', 'sorted', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  3: 'median_found',
  4: 'init_moves',
  5: 'calculating',
  6: 'add_move',
  7: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def minMoves2(nums):' },
  { line: 2, text: '    nums.sort()' },
  { line: 3, text: '    median = nums[len(nums) // 2]' },
  { line: 4, text: '    moves = 0' },
  { line: 5, text: '    for num in nums:' },
  { line: 6, text: '        moves += abs(num - median)' },
  { line: 7, text: '    return moves' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('minimum-moves-to-equal-array-elements-ii') || [
  { label: 'Example 1', nums: [1, 0, 0, 8, 6], expected: 14 },
  { label: 'Example 2', nums: [1, 2, 3], expected: 2 },
  { label: 'Example 3', nums: [1, 1, 1, 1], expected: 0 },
]

const SNIPPETS = [
  { id: 'sort', label: 'Sort', lines: [2] },
  { id: 'median', label: 'Find Median', lines: [3] },
  { id: 'calc', label: 'Calculate Moves', lines: [4, 5, 6] },
  { id: 'return', label: 'Return', lines: [7] },
]

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums: [],
      moves: 0,
      stepNum: 0,
      message: 'Empty array.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    nums: [...nums],
    stepNum: 0,
    message: `Finding minimum moves to equalize ${nums.length} elements`,
  })

  const sorted = [...nums].sort((a, b) => a - b)

  steps.push({
    phase: 'sorted',
    activeLine: 2,
    nums: sorted,
    stepNum: 1,
    message: `Sorted: ${sorted.join(', ')}`,
  })

  const medianIdx = Math.floor(sorted.length / 2)
  const median = sorted[medianIdx]

  steps.push({
    phase: 'median_found',
    activeLine: 3,
    nums: sorted,
    medianIdx,
    median,
    stepNum: 2,
    message: `Median at index ${medianIdx}: ${median}`,
  })

  let moves = 0
  let stepNum = 3

  steps.push({
    phase: 'init_moves',
    activeLine: 4,
    nums: sorted,
    median,
    moves,
    stepNum,
    message: `Starting to calculate moves`,
  })
  stepNum++

  for (let i = 0; i < sorted.length; i++) {
    const diff = Math.abs(sorted[i] - median)

    steps.push({
      phase: 'calculating',
      activeLine: 5,
      nums: sorted,
      median,
      moves,
      currentIdx: i,
      currentVal: sorted[i],
      diff,
      stepNum,
      message: `|${sorted[i]} - ${median}| = ${diff}`,
    })
    stepNum++

    moves += diff

    steps.push({
      phase: 'add_move',
      activeLine: 6,
      nums: sorted,
      median,
      moves,
      currentIdx: i,
      currentVal: sorted[i],
      diff,
      stepNum,
      message: `Total moves: ${moves}`,
    })
    stepNum++
  }

  steps.push({
    phase: 'done',
    activeLine: 7,
    nums: sorted,
    median,
    moves,
    stepNum,
    message: `Minimum moves: ${moves}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'sorted') return 'sort'
  if (phase === 'median_found') return 'median'
  if (phase === 'init_moves' || phase === 'calculating' || phase === 'add_move') return 'calc'
  if (phase === 'done') return 'return'
  return 'sort'
}

function ArrayVisualization({ step }) {
  const nums = step?.nums || []
  const median = step?.median ?? -1
  const currentIdx = step?.currentIdx ?? -1
  const moves = step?.moves ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Array Elements
        </header>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
          {nums.map((val, idx) => {
            const isCurrent = idx === currentIdx
            const isMedian = val === median
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: isCurrent ? 1.15 : 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                style={{
                  minWidth: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isCurrent ? '#fef08a' : isMedian ? '#d1fae5' : '#dbeafe',
                  border: `2px solid ${isCurrent ? '#eab308' : isMedian ? '#10b981' : '#3b82f6'}`,
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isCurrent ? '#713f12' : isMedian ? '#047857' : '#1e40af',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#d1fae5',
            borderRadius: 4,
            border: '2px solid #10b981',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#047857', marginBottom: 4 }}>
            Target Median
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#047857' }}>
            {median >= 0 ? median : '?'}
          </div>
        </motion.div>

        <motion.div
          key={moves}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            padding: 16,
            backgroundColor: '#fecdd3',
            borderRadius: 4,
            border: '2px solid #f87171',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
            Total Moves
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
            {moves}
          </div>
        </motion.div>
      </div>
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
        <input
          value={numsInput}
          onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
          placeholder="e.g., 1,0,0,8,6"
          style={{
            width: '100%',
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

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

      <ArrayVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Median Strategy
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          The median minimizes sum of absolute differences. Sort and find median, then sum distances.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem462Visualizer() {
  const [numsInput, setNumsInput] = useState('1,0,0,8,6')

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
