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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem509Visualizer.css'

const EXAMPLES = getExamples('fibonacci-number') || [
  { label: 'Example 1', n: 2 },
  { label: 'Example 2', n: 4 },
]

function generateSteps(n) {
  const steps = []
  const memo = {}
  const sequence = []

  steps.push({
    activeLine: 1,
    n,
    sequence: [],
    memo: {},
    message: `Calculate Fibonacci(${n}) using memoization`,
    phase: 'Initialize'
  })

  function fib(num) {
    steps.push({
      activeLine: 2,
      n,
      sequence: [...sequence],
      memo: { ...memo },
      currentN: num,
      message: `fib(${num})`,
      phase: 'Calculate'
    })

    if (num in memo) {
      steps.push({
        activeLine: 3,
        n,
        sequence: [...sequence],
        memo: { ...memo },
        currentN: num,
        message: `fib(${num}) found in memo: ${memo[num]}`,
        phase: 'Memoization Hit'
      })
      return memo[num]
    }

    if (num <= 1) {
      memo[num] = num
      sequence.push(num)
      steps.push({
        activeLine: 4,
        n,
        sequence: [...sequence],
        memo: { ...memo },
        currentN: num,
        message: `Base case: fib(${num}) = ${num}`,
        phase: 'Base Case'
      })
      return num
    }

    const result = fib(num - 1) + fib(num - 2)
    memo[num] = result
    sequence.push(result)

    steps.push({
      activeLine: 5,
      n,
      sequence: [...sequence],
      memo: { ...memo },
      currentN: num,
      currentResult: result,
      message: `fib(${num}) = fib(${num - 1}) + fib(${num - 2}) = ${result}`,
      phase: 'Combine'
    })

    return result
  }

  const result = fib(n)

  steps.push({
    activeLine: 6,
    n,
    sequence,
    memo,
    result,
    done: true,
    message: `Fibonacci(${n}) = ${result}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ n, step }) {
  // Generate full fibonacci sequence up to n for visualization
  const fullSeq = [0, 1]
  for (let i = 2; i <= n; i++) {
    fullSeq.push(fullSeq[i - 1] + fullSeq[i - 2])
  }

  const maxVal = Math.max(...fullSeq)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#c7d2fe', borderRadius: 6, borderLeft: '4px solid #4f46e5' }}>
        <div style={{ fontSize: 12, color: '#3730a3', fontStyle: 'italic' }}>Calculate the nth Fibonacci number using dynamic programming.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0e7ff', borderRadius: 4, border: '1px solid #a5b4fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#3730a3' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, border: '1px solid #a5b4fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>Fibonacci Sequence (0 to {n})</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120 }}>
          {fullSeq.map((val, i) => (
            <motion.div
              key={i}
              style={{
                flex: 1,
                backgroundColor: i === n ? '#4f46e5' : step?.currentN === i ? '#818cf8' : '#e0e7ff',
                borderRadius: 4,
                border: i === n ? '2px solid #4f46e5' : step?.currentN === i ? '2px solid #6366f1' : '1px solid #a5b4fc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: 40,
                height: `${20 + (val / maxVal) * 80}%`,
                position: 'relative'
              }}
              animate={{
                backgroundColor: i === n ? '#4f46e5' : step?.currentN === i ? '#818cf8' : '#e0e7ff',
                borderColor: i === n ? '#4f46e5' : step?.currentN === i ? '#6366f1' : '#a5b4fc'
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 600, color: i === n || step?.currentN === i ? 'white' : '#3730a3', textAlign: 'center', marginBottom: 2 }}>{val}</div>
              <div style={{ fontSize: 8, fontWeight: 600, color: i === n || step?.currentN === i ? 'white' : '#6366f1', textAlign: 'center' }}>F({i})</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.memo && Object.keys(step.memo).length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>Memoization Cache</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {Object.entries(step.memo).map(([key, val], i) => (
              <motion.div
                key={i}
                style={{
                  padding: '4px 8px',
                  backgroundColor: step.currentN === Number(key) ? '#a855f7' : '#f3e8ff',
                  borderRadius: 4,
                  border: step.currentN === Number(key) ? '2px solid #9333ea' : '1px solid #d8b4fe',
                  fontSize: 11,
                  fontWeight: 600,
                  color: step.currentN === Number(key) ? 'white' : '#6b21a8'
                }}
                animate={{ backgroundColor: step.currentN === Number(key) ? '#a855f7' : '#f3e8ff' }}
              >
                F({key})={val}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>F({n}) = {step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem509Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('fibonacci-number')
  const steps = useMemo(() => generateSteps(ex.n).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔢 Fibonacci', content: (<VisualizationPanel n={ex.n} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
