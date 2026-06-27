import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import './SumOfTwoIntegers.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def getSum(a: int, b: int) -> int:' },
  { line: 2, text: '    mask = 0xFFFFFFFF' },
  { line: 3, text: '    while b != 0:' },
  { line: 4, text: '        carry = ((a & b) << 1) & mask' },
  { line: 5, text: '        a = (a ^ b) & mask' },
  { line: 6, text: '        b = carry' },
  { line: 7, text: '    return a if a <= 0x7FFFFFFF else ~(a ^ mask)' },
]

function generateSteps(a, b) {
  const steps = []
  const mask = 0xFFFFFFFF

  const toBinary = (n) => {
    const binary = Math.abs(n).toString(2).padStart(32, '0')
    return n < 0 ? binary : binary
  }

  steps.push({
    activeLine: 1,
    a,
    b,
    carry: 0,
    iteration: 0,
    message: `Initialize with a = ${a}, b = ${b}. Start bitwise addition loop.`,
  })

  steps.push({
    activeLine: 2,
    a,
    b,
    carry: 0,
    iteration: 0,
    message: `Set 32-bit mask to handle overflow: mask = 0xFFFFFFFF.`,
  })

  let currentA = a
  let currentB = b
  let iteration = 0
  const maxIterations = 32

  steps.push({
    activeLine: 3,
    a: currentA,
    b: currentB,
    carry: 0,
    iteration,
    message: `Check while b ≠ 0. b = ${currentB}, continue = ${currentB !== 0}.`,
  })

  while (currentB !== 0 && iteration < maxIterations) {
    iteration++

    const andResult = currentA & currentB
    steps.push({
      activeLine: 4,
      a: currentA,
      b: currentB,
      carry: andResult,
      iteration,
      operation: 'and',
      message: `Calculate carry: (a & b) = ${andResult}. These are positions where both bits are 1.`,
    })

    const xorResult = currentA ^ currentB
    steps.push({
      activeLine: 5,
      a: xorResult,
      b: currentB,
      carry: andResult,
      iteration,
      operation: 'xor',
      message: `XOR for sum bits: (a ^ b) = ${xorResult}. Sum without carry.`,
    })

    currentA = xorResult & mask
    currentB = (andResult << 1) & mask

    steps.push({
      activeLine: 6,
      a: currentA,
      b: currentB,
      carry: currentB >> 1,
      iteration,
      operation: 'shift',
      message: `Shift carry left: carry << 1 = ${currentB}. Update b for next iteration.`,
    })

    steps.push({
      activeLine: 3,
      a: currentA,
      b: currentB,
      carry: currentB >> 1,
      iteration,
      message: `Check while b ≠ 0. b = ${currentB}, continue = ${currentB !== 0}.`,
    })
  }

  const finalA = currentA <= 0x7FFFFFFF ? currentA : ~(currentA ^ mask)

  steps.push({
    activeLine: 7,
    a: currentA,
    b: 0,
    carry: 0,
    iteration,
    result: finalA,
    message: `Loop done (b = 0). Final result: ${finalA}. Return the sum.`,
  })

  return steps
}

const EXAMPLES = [
  { label: '1 + 1 = 2', a: 1, b: 1 },
  { label: '5 + 7 = 12', a: 5, b: 7 },
  { label: '-1 + 1 = 0', a: -1, b: 1 },
  { label: '15 + 8 = 23', a: 15, b: 8 },
]

export default function SumOfTwoIntegersVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.a, ex.b), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const toBinary32 = (n) => {
    if (n >= 0) {
      return n.toString(2).padStart(32, '0')
    } else {
      return (0x100000000 + n).toString(2)
    }
  }

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
      title: '🔢 Bitwise Computation',
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
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12 }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>{step.message}</div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>a (current sum)</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>
                    {step.a}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#1e40af', wordBreak: 'break-all', lineHeight: '1.6' }}>
                    {toBinary32(step.a).match(/.{1,8}/g)?.join(' ')}
                  </div>
                </div>

                <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fde68a' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>b (carry)</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 6 }}>
                    {step.b}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'monospace', color: '#92400e', wordBreak: 'break-all', lineHeight: '1.6' }}>
                    {toBinary32(step.b).match(/.{1,8}/g)?.join(' ')}
                  </div>
                </div>
              </div>

              {step.operation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: 12, backgroundColor: '#f0fdfa', borderRadius: 6, border: '1px solid #99f6e4' }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0d9488', marginBottom: 6 }}>
                    Operation: {step.operation?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: '#0f766e', fontFamily: 'monospace' }}>
                    {step.operation === 'and' && `(a & b) = ${step.carry} — finds carry positions`}
                    {step.operation === 'xor' && `(a ^ b) = ${step.a} — sum without carry`}
                    {step.operation === 'shift' && `carry << 1 = ${step.b} — shifts carry left for next iteration`}
                  </div>
                </motion.div>
              )}

              {step.result !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Final Result</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                    {ex.a} + {ex.b} = {step.result}
                  </div>
                </motion.div>
              )}

              {step.iteration > 0 && (
                <div style={{ fontSize: 11, color: '#64748b', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
                  Iteration {step.iteration} / ~32 bits
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex])

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
