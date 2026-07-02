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

const PATTERNS = ['binary', 'checking_bit', 'done', 'extract_bit', 'increment_count', 'init_count', 'shift_right', 'start', 'xor_computed']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  3: 'init_count',
  4: 'checking_bit',
  5: 'extract_bit',
  6: 'shift_right',
  7: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def hammingDistance(x, y):' },
  { line: 2, text: '    xor = x ^ y' },
  { line: 3, text: '    count = 0' },
  { line: 4, text: '    while xor:' },
  { line: 5, text: '        count += xor & 1' },
  { line: 6, text: '        xor >>= 1' },
  { line: 7, text: '    return count' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('hamming-distance') || [
  { label: 'Example 1', x: 1, y: 4, expected: 2 },
  { label: 'Example 2', x: 3, y: 1, expected: 1 },
  { label: 'Example 3', x: 15, y: 8, expected: 2 },
]

const SNIPPETS = [
  { id: 'xor', label: 'XOR', lines: [2] },
  { id: 'init', label: 'Initialize', lines: [3] },
  { id: 'loop', label: 'Count Bits', lines: [4, 5, 6] },
  { id: 'return', label: 'Return', lines: [7] },
]

function generateSteps(x, y) {
  const steps = []

  if (x < 0 || y < 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      x, y,
      distance: 0,
      stepNum: 0,
      message: 'Invalid inputs.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    x, y,
    stepNum: 0,
    message: `Computing Hamming distance between ${x} and ${y}`,
  })

  const xBinary = x.toString(2).padStart(8, '0')
  const yBinary = y.toString(2).padStart(8, '0')

  steps.push({
    phase: 'binary',
    activeLine: 2,
    x, y,
    xBinary,
    yBinary,
    stepNum: 1,
    message: `x = ${xBinary} (${x}), y = ${yBinary} (${y})`,
  })

  let xor = x ^ y
  const xorBinary = xor.toString(2).padStart(8, '0')

  steps.push({
    phase: 'xor_computed',
    activeLine: 2,
    x, y,
    xBinary,
    yBinary,
    xor,
    xorBinary,
    stepNum: 2,
    message: `XOR result: ${xorBinary} (${xor})`,
  })

  let count = 0
  let stepNum = 3

  steps.push({
    phase: 'init_count',
    activeLine: 3,
    x, y,
    xor,
    xorBinary,
    count,
    stepNum,
    message: 'Counting set bits in XOR result',
  })
  stepNum++

  let tempXor = xor
  let iteration = 0

  while (tempXor) {
    steps.push({
      phase: 'checking_bit',
      activeLine: 4,
      x, y,
      xor: tempXor,
      count,
      stepNum,
      iteration,
      message: `Iteration ${iteration + 1}: xor = ${tempXor} (${tempXor.toString(2)})`,
    })
    stepNum++

    const lsb = tempXor & 1

    steps.push({
      phase: 'extract_bit',
      activeLine: 5,
      x, y,
      xor: tempXor,
      count,
      lsb,
      stepNum,
      iteration,
      message: `Least significant bit: ${lsb}`,
    })
    stepNum++

    if (lsb) {
      count++
      steps.push({
        phase: 'increment_count',
        activeLine: 5,
        x, y,
        xor: tempXor,
        count,
        stepNum,
        iteration,
        message: `Bit is 1, count = ${count}`,
      })
      stepNum++
    }

    tempXor >>= 1

    steps.push({
      phase: 'shift_right',
      activeLine: 6,
      x, y,
      xor: tempXor,
      count,
      stepNum,
      iteration,
      message: `Right shift: xor = ${tempXor}`,
    })
    stepNum++

    iteration++
  }

  steps.push({
    phase: 'done',
    activeLine: 7,
    x, y,
    count,
    stepNum,
    message: `Hamming distance: ${count}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'binary' || phase === 'xor_computed') return 'xor'
  if (phase === 'init_count') return 'init'
  if (phase === 'checking_bit' || phase === 'extract_bit' || phase === 'increment_count' || phase === 'shift_right') return 'loop'
  if (phase === 'done') return 'return'
  return 'xor'
}

function BitVisualization({ step }) {
  const x = step?.x ?? 0
  const y = step?.y ?? 0
  const xBinary = step?.xBinary || ''
  const yBinary = step?.yBinary || ''
  const xorBinary = step?.xorBinary || ''
  const count = step?.count ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Binary Representation
        </header>

        <div style={{
          padding: 12,
          backgroundColor: '#dbeafe',
          borderRadius: 4,
          border: '2px solid #3b82f6',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>x</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#1e40af' }}>
            {xBinary} ({x})
          </div>
        </div>

        <div style={{
          padding: 12,
          backgroundColor: '#fecdd3',
          borderRadius: 4,
          border: '2px solid #f87171',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>y</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#dc2626' }}>
            {yBinary} ({y})
          </div>
        </div>

        {xorBinary && (
          <div style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 4,
            border: '2px solid #fcd34d',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>x ^ y (XOR)</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#92400e' }}>
              {xorBinary}
            </div>
          </div>
        )}
      </div>

      <div style={{
        padding: 12,
        backgroundColor: '#d1fae5',
        borderRadius: 4,
        border: '2px solid #10b981',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#047857', marginBottom: 4 }}>
          Hamming Distance (Set Bits in XOR)
        </div>
        <motion.div
          key={count}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{ fontSize: 28, fontWeight: 700, color: '#047857' }}
        >
          {count}
        </motion.div>
      </div>

      {xorBinary && (
        <div style={{ display: 'flex', gap: 4 }}>
          {xorBinary.split('').reverse().map((bit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              style={{
                minWidth: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bit === '1' ? '#d1fae5' : '#f3f4f6',
                border: `2px solid ${bit === '1' ? '#10b981' : '#d1d5db'}`,
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                color: bit === '1' ? '#047857' : '#1f2937',
              }}
            >
              {bit}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function VisualizationPanel({ step, x, y, EXAMPLES, handleExampleClick, xInput, yInput, setXInput, setYInput, handleReset }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            x
          </label>
          <input
            value={xInput}
            onChange={(e) => { setXInput(e.target.value); handleReset() }}
            placeholder="e.g., 1"
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

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            y
          </label>
          <input
            value={yInput}
            onChange={(e) => { setYInput(e.target.value); handleReset() }}
            placeholder="e.g., 4"
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

      <BitVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          XOR Strategy
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          XOR two numbers to highlight differing bits. Count set bits in result.
        </div>
      </div>
    </section>
  )
}

export default function Problem461Visualizer() {
  const [xInput, setXInput] = useState('1')
  const [yInput, setYInput] = useState('4')

  const { x, y } = useMemo(() => {
    const xVal = parseInt(xInput.trim())
    const yVal = parseInt(yInput.trim())

    return {
      x: isNaN(xVal) || xVal < 0 ? 0 : xVal,
      y: isNaN(yVal) || yVal < 0 ? 0 : yVal,
    }
  }, [xInput, yInput])

  const steps = useMemo(
    () => generateSteps(x, y).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [x, y],
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
    setXInput(String(ex.x))
    setYInput(String(ex.y))
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
          x={x}
          y={y}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          xInput={xInput}
          yInput={yInput}
          setXInput={setXInput}
          setYInput={setYInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    x,
    y,
    xInput,
    yInput,
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
