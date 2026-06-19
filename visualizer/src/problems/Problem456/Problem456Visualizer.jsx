import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE = [
  { line: 1, text: 'def nthUglyNumber(n):' },
  { line: 2, text: '    dp = [0] * n' },
  { line: 3, text: '    dp[0] = 1' },
  { line: 4, text: '    i2 = i3 = i5 = 0' },
  { line: 5, text: '    next2, next3, next5 = 2, 3, 5' },
  { line: 6, text: '    for i in range(1, n):' },
  { line: 7, text: '        next_ugly = min(next2, next3, next5)' },
  { line: 8, text: '        dp[i] = next_ugly' },
  { line: 9, text: '        if next_ugly == next2:' },
  { line: 10, text: '            i2 += 1' },
  { line: 11, text: '            next2 = dp[i2] * 2' },
  { line: 12, text: '        if next_ugly == next3:' },
  { line: 13, text: '            i3 += 1' },
  { line: 14, text: '            next3 = dp[i3] * 3' },
  { line: 15, text: '        if next_ugly == next5:' },
  { line: 16, text: '            i5 += 1' },
  { line: 17, text: '            next5 = dp[i5] * 5' },
  { line: 18, text: '    return dp[n-1]' },
]

const EXAMPLES = getExamples('ugly-number-ii') || [
  { label: 'Example 1', n: 10, expected: 12 },
  { label: 'Example 2', n: 1, expected: 1 },
  { label: 'Example 3', n: 15, expected: 24 },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [2, 3, 4, 5] },
  { id: 'loop', label: 'DP Loop', lines: [6, 7, 8] },
  { id: 'update', label: 'Update Pointers', lines: [9, 10, 11, 12, 13, 14, 15, 16, 17] },
  { id: 'return', label: 'Return', lines: [18] },
]

function generateSteps(n) {
  const steps = []

  if (n <= 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      dp: [],
      stepNum: 0,
      message: 'Invalid n.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    dp: [],
    stepNum: 0,
    message: `Finding ${n}th ugly number`,
  })

  const dp = new Array(n)
  dp[0] = 1
  let i2 = 0, i3 = 0, i5 = 0
  let next2 = 2, next3 = 3, next5 = 5
  let stepNum = 1

  steps.push({
    phase: 'initialized',
    activeLine: 4,
    dp: [1],
    i2, i3, i5,
    next2, next3, next5,
    stepNum,
    message: `Three pointers initialized: i2=${i2}, i3=${i3}, i5=${i5}`,
  })
  stepNum++

  for (let i = 1; i < n; i++) {
    steps.push({
      phase: 'comparing',
      activeLine: 7,
      dp: [...dp.slice(0, i)],
      i2, i3, i5,
      next2, next3, next5,
      stepNum,
      message: `Comparing: next2=${next2}, next3=${next3}, next5=${next5}`,
    })
    stepNum++

    const nextUgly = Math.min(next2, next3, next5)

    steps.push({
      phase: 'selected',
      activeLine: 8,
      dp: [...dp.slice(0, i)],
      i2, i3, i5,
      next2, next3, next5,
      nextUgly,
      stepNum,
      message: `Selected minimum: ${nextUgly}`,
    })
    stepNum++

    dp[i] = nextUgly

    if (nextUgly === next2) {
      i2++
      next2 = dp[i2] * 2

      steps.push({
        phase: 'updated_2',
        activeLine: 9,
        dp: [...dp.slice(0, i + 1)],
        i2, i3, i5,
        next2, next3, next5,
        stepNum,
        message: `Updated i2: dp[${i2}] * 2 = ${next2}`,
      })
      stepNum++
    }

    if (nextUgly === next3) {
      i3++
      next3 = dp[i3] * 3

      steps.push({
        phase: 'updated_3',
        activeLine: 12,
        dp: [...dp.slice(0, i + 1)],
        i2, i3, i5,
        next2, next3, next5,
        stepNum,
        message: `Updated i3: dp[${i3}] * 3 = ${next3}`,
      })
      stepNum++
    }

    if (nextUgly === next5) {
      i5++
      next5 = dp[i5] * 5

      steps.push({
        phase: 'updated_5',
        activeLine: 15,
        dp: [...dp.slice(0, i + 1)],
        i2, i3, i5,
        next2, next3, next5,
        stepNum,
        message: `Updated i5: dp[${i5}] * 5 = ${next5}`,
      })
      stepNum++
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 18,
    dp: dp,
    stepNum,
    message: `Found! ${n}th ugly number is ${dp[n - 1]}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'initialized') return 'init'
  if (phase === 'comparing' || phase === 'selected') return 'loop'
  if (phase === 'updated_2' || phase === 'updated_3' || phase === 'updated_5') return 'update'
  if (phase === 'done') return 'return'
  return 'init'
}

function DPVisualization({ step }) {
  const dp = step?.dp || []
  const nextUgly = step?.nextUgly
  const next2 = step?.next2
  const next3 = step?.next3
  const next5 = step?.next5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          DP Array (Ugly Numbers)
        </header>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
          {dp.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#dbeafe',
                border: '2px solid #3b82f6',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#1e40af',
              }}
            >
              {val}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{
          padding: 12,
          backgroundColor: nextUgly === next2 ? '#fef08a' : '#f3f4f6',
          borderRadius: 4,
          border: `2px solid ${nextUgly === next2 ? '#eab308' : '#d1d5db'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#713f12', marginBottom: 4 }}>next2</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#713f12' }}>{next2}</div>
        </div>

        <div style={{
          padding: 12,
          backgroundColor: nextUgly === next3 ? '#fef08a' : '#f3f4f6',
          borderRadius: 4,
          border: `2px solid ${nextUgly === next3 ? '#eab308' : '#d1d5db'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#713f12', marginBottom: 4 }}>next3</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#713f12' }}>{next3}</div>
        </div>

        <div style={{
          padding: 12,
          backgroundColor: nextUgly === next5 ? '#fef08a' : '#f3f4f6',
          borderRadius: 4,
          border: `2px solid ${nextUgly === next5 ? '#eab308' : '#d1d5db'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#713f12', marginBottom: 4 }}>next5</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#713f12' }}>{next5}</div>
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, n, EXAMPLES, handleExampleClick, nInput, setNInput, handleReset }) {
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
          N (find Nth ugly number)
        </label>
        <input
          value={nInput}
          onChange={(e) => { setNInput(e.target.value); handleReset() }}
          placeholder="e.g., 10"
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

      <DPVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Ugly Number Strategy
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Ugly numbers = products of 2, 3, 5. Use three pointers to generate in order.
        </div>
      </div>
    </section>
  )
}

export default function Problem456Visualizer() {
  const [nInput, setNInput] = useState('10')

  const n = useMemo(() => {
    const val = parseInt(nInput.trim())
    return isNaN(val) || val < 1 ? 1 : Math.min(val, 30)
  }, [nInput])

  const steps = useMemo(
    () => generateSteps(n).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [n],
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

  const SOLUTION_CODE_WITH_CONNECTIVITY = useSolutionCode('ugly-number-ii') || SOLUTION_CODE

  const handleExampleClick = useCallback((ex) => {
    setNInput(String(ex.n))
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
          n={n}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          nInput={nInput}
          setNInput={setNInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    n,
    nInput,
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
