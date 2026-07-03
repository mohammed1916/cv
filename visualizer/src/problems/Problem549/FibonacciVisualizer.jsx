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
import './FibonacciVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def fib(self, n: int) -> int:' },
  { line: 3, text: '        if n <= 1:' },
  { line: 4, text: '            return n' },
  { line: 5, text: '        ' },
  { line: 6, text: '        prev, curr = 0, 1' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for i in range(2, n + 1):' },
  { line: 9, text: '            prev, curr = curr, prev + curr' },
  { line: 10, text: '        ' },
  { line: 11, text: '        return curr' },
]

const PATTERNS = ['init', 'base_case', 'iterate', 'compute', 'done']
const LINE_PATTERN_MAP = {
  3: 'base_case',
  6: 'init',
  8: 'iterate',
  9: 'compute',
  11: 'done',
}

function generateSteps(n) {
  const steps = []
  const n_input = parseInt(n, 10)

  if (isNaN(n_input) || n_input < 0) {
    steps.push({
      phase: 'done',
      activeLine: 11,
      relatedLines: [11],
      message: 'Invalid input.',
      result: 0,
      done: true,
    })
    return steps
  }

  if (n_input <= 1) {
    steps.push({
      phase: 'base_case',
      activeLine: 3,
      relatedLines: [3, 4],
      message: `Base case: F(${n_input}) = ${n_input}`,
      result: n_input,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 6,
    relatedLines: [6],
    message: 'Initialize: prev=0, curr=1',
    prev: 0,
    curr: 1,
    sequence: [0, 1],
  })

  let prev = 0
  let curr = 1

  for (let i = 2; i <= n_input; i++) {
    steps.push({
      phase: 'iterate',
      activeLine: 8,
      relatedLines: [8],
      message: `Iteration ${i - 1}: Computing F(${i})`,
      prev,
      curr,
      i,
      sequence: [...Array(i - 1).fill(0).map((_, idx) => {
        if (idx === 0) return 0
        if (idx === 1) return 1
        let a = 0, b = 1
        for (let j = 2; j <= idx; j++) {
          [a, b] = [b, a + b]
        }
        return b
      }), curr],
    })

    const next = prev + curr
    steps.push({
      phase: 'compute',
      activeLine: 9,
      relatedLines: [9],
      message: `F(${i}) = ${prev} + ${curr} = ${next}`,
      prev: curr,
      curr: next,
      i,
      sequence: [...Array(i).fill(0).map((_, idx) => {
        if (idx === 0) return 0
        if (idx === 1) return 1
        let a = 0, b = 1
        for (let j = 2; j <= idx; j++) {
          [a, b] = [b, a + b]
        }
        return b
      })],
    })

    prev = curr
    curr = next
  }

  steps.push({
    phase: 'done',
    activeLine: 11,
    relatedLines: [11],
    message: `F(${n_input}) = ${curr}`,
    result: curr,
    sequence: Array(n_input + 1)
      .fill(0)
      .map((_, i) => {
        if (i === 0) return 0
        if (i === 1) return 1
        let a = 0, b = 1
        for (let j = 2; j <= i; j++) {
          [a, b] = [b, a + b]
        }
        return b
      }),
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.prev !== undefined && step?.curr !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Previous</div>
            <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>{step.prev}</div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Current</div>
            <div style={{ fontSize: 16, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>{step.curr}</div>
          </div>
        </div>
      )}

      {step?.sequence && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
            Sequence {step.done ? '(Complete)' : '(Building)'}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {step.sequence.map((val, idx) => (
                <motion.div
                  key={`${idx}-${val}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: '#334155',
                    borderColor: '#22c55e',
                    color: '#22c55e',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  F({idx})={val}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e' }}>{step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function FibonacciVisualizer() {
  const examples = useMemo(() => getExamples('fibonacci-number') || [], [])
  const [n, setN] = useState(4)

  const steps = useMemo(() => generateSteps(n), [n])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setN(ex.n || 4)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
      {
        id: 'viz',
        title: '🔢 Fibonacci',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>N</div>
              <input
                type="number"
                value={n}
                onChange={(e) => {
                  setN(Number(e.target.value))
                  handleReset()
                }}
                min={0}
                max={30}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              />
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, n, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
    </div>
  )
}
