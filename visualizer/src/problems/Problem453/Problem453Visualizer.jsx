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

const PATTERNS = ['calculating', 'done', 'found_min', 'start', 'updated']
const LINE_PATTERN_MAP = {
  1: 'done',
  4: 'start',
  7: 'calculating',
  8: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def minMoves(nums: list) -> int:' },
  { line: 2, text: '    # Each move: increment all except one' },
  { line: 3, text: '    # Equivalent to: decrement one' },
  { line: 4, text: '    min_val = min(nums)' },
  { line: 5, text: '    moves = 0' },
  { line: 6, text: '    for num in nums:' },
  { line: 7, text: '        moves += num - min_val' },
  { line: 8, text: '    return moves' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('minimum-moves-to-equal-array-elements') || [
  { label: 'Example 1', nums: [1, 0, 0, 8, 6], expected: 14 },
  { label: 'Example 2', nums: [1, 2, 3], expected: 3 },
  { label: 'Example 3', nums: [5, 5, 5], expected: 0 },
]

const SNIPPETS = [
  { id: 'init', label: 'Find Minimum', lines: [1, 2, 3, 4, 5] },
  { id: 'count', label: 'Calculate Moves', lines: [6, 7] },
  { id: 'return', label: 'Return', lines: [8] },
]

function generateSteps(nums) {
  const steps = []

  if (!Array.isArray(nums) || nums.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      nums: [],
      minVal: 0,
      moves: 0,
      stepNum: 0,
      message: 'Empty array.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 4,
    nums: [...nums],
    minVal: null,
    moves: 0,
    stepNum: 0,
    message: `Array: ${JSON.stringify(nums)}`,
  })

  const minVal = Math.min(...nums)

  steps.push({
    phase: 'found_min',
    activeLine: 4,
    nums: [...nums],
    minVal,
    moves: 0,
    stepNum: 1,
    message: `Minimum value: ${minVal}`,
  })

  let moves = 0
  let stepNum = 2

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    const diff = num - minVal

    steps.push({
      phase: 'calculating',
      activeLine: 7,
      nums: [...nums],
      minVal,
      moves,
      currentIdx: i,
      currentNum: num,
      diff,
      stepNum,
      message: `nums[${i}]=${num}: ${num} - ${minVal} = ${diff} moves needed`,
    })
    stepNum++

    moves += diff

    steps.push({
      phase: 'updated',
      activeLine: 7,
      nums: [...nums],
      minVal,
      moves,
      currentIdx: i,
      currentNum: num,
      diff,
      stepNum,
      message: `Total moves: ${moves}`,
    })
    stepNum++
  }

  steps.push({
    phase: 'done',
    activeLine: 8,
    nums: [...nums],
    minVal,
    moves,
    stepNum,
    message: `Total moves needed: ${moves}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'found_min') return 'init'
  if (phase === 'calculating' || phase === 'updated') return 'count'
  if (phase === 'done') return 'return'
  return 'init'
}

function ArrayDisplay({ nums, minVal, currentIdx, currentNum, diff }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Array Elements
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {nums.map((num, idx) => {
          const isCurrent = idx === currentIdx
          const isMin = num === minVal
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isCurrent ? 1.15 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 60,
                height: 70,
                backgroundColor: isCurrent ? '#fef08a' : isMin ? '#dcfce7' : '#dbeafe',
                border: `2px solid ${isCurrent ? '#eab308' : isMin ? '#22c55e' : '#3b82f6'}`,
                borderRadius: 6,
              }}
            >
              <span style={{
                fontSize: 14,
                fontWeight: 700,
                color: isCurrent ? '#713f12' : isMin ? '#15803d' : '#1e40af',
              }}>
                {num}
              </span>
              {isCurrent && diff !== undefined && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#713f12',
                  marginTop: 4,
                }}>
                  -{diff}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function MoveCounter({ moves, minVal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Total Moves
      </header>
      <div style={{
        padding: 16,
        backgroundColor: '#f0fdf4',
        borderRadius: 4,
        border: '2px solid #22c55e',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: 700,
          color: '#15803d',
          marginBottom: 8,
        }}>
          {moves}
        </div>
        {minVal !== null && minVal !== undefined && (
          <div style={{
            fontSize: 11,
            color: '#166534',
            fontWeight: 600,
          }}>
            Target: {minVal} for all elements
          </div>
        )}
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
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={numsInput}
            onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
            placeholder="e.g., 1,0,0,8,6"
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, flex: 1 }}>
        <ArrayDisplay
          nums={step?.nums || []}
          minVal={step?.minVal}
          currentIdx={step?.currentIdx}
          currentNum={step?.currentNum}
          diff={step?.diff}
        />
        <MoveCounter moves={step?.moves ?? 0} minVal={step?.minVal} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Level Everyone Up (or Down)
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Each move increments all but one (= decrements one). Bring all to minimum in fewest moves.
        </div>
      </div>
    </section>
  )
}

export default function Problem453Visualizer() {
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
