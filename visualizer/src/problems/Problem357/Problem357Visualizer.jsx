import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem357.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def countNumbersWithUniqueDigits(n):' },
  { line: 2, text: '    if n == 0: return 1' },
  { line: 3, text: '    count = 10  # 0-9' },
  { line: 4, text: '    uniqueDigits = 9' },
  { line: 5, text: '    availableNumbers = 9' },
  { line: 6, text: '    for i in range(2, n + 1):' },
  { line: 7, text: '        uniqueDigits *= availableNumbers' },
  { line: 8, text: '        count += uniqueDigits' },
  { line: 9, text: '        availableNumbers -= 1' },
  { line: 10, text: '    return count' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n) {
  const steps = []

  // Initialize
  steps.push({
    activeLine: 2,
    n,
    count: n === 0 ? 1 : 10,
    uniqueDigits: 9,
    availableNumbers: 9,
    currentLength: 1,
    numbers: Array.from({length: 10}, (_, i) => i),
    message: n === 0 ? 'Base case: n=0, return 1' : '1-digit numbers (0-9): count = 10',
  })

  if (n === 0) return steps

  let count = 10
  let uniqueDigits = 9
  let availableNumbers = 9
  const numbersByLength = {
    1: Array.from({length: 10}, (_, i) => i),
  }

  // Process each length from 2 to n
  for (let length = 2; length <= n; length++) {
    const firstDigitChoices = 9
    const remainingChoices = []
    let temp = availableNumbers

    for (let pos = 1; pos < length; pos++) {
      remainingChoices.push(temp)
      temp--
    }

    steps.push({
      activeLine: 6,
      n,
      count,
      uniqueDigits,
      availableNumbers,
      currentLength: length,
      numbers: numbersByLength[length - 1] || [],
      choicesPerPosition: [9, ...remainingChoices],
      message: `Processing ${length}-digit numbers: First digit has 9 choices (1-9)`,
    })

    uniqueDigits = 9
    for (let pos = 0; pos < length - 1; pos++) {
      uniqueDigits *= (9 - pos)
    }

    steps.push({
      activeLine: 7,
      n,
      count,
      uniqueDigits,
      availableNumbers,
      currentLength: length,
      numbers: numbersByLength[length - 1] || [],
      choicesPerPosition: [9, ...remainingChoices],
      calculation: `9 × ${remainingChoices.join(' × ')} = ${uniqueDigits}`,
      message: `${length}-digit numbers: ${uniqueDigits} combinations (permutation)`,
    })

    count += uniqueDigits
    availableNumbers--

    steps.push({
      activeLine: 8,
      n,
      count,
      uniqueDigits,
      availableNumbers,
      currentLength: length,
      numbers: numbersByLength[length - 1] || [],
      choicesPerPosition: [9, ...remainingChoices],
      message: `Add ${uniqueDigits} to count: total = ${count}`,
    })

    steps.push({
      activeLine: 9,
      n,
      count,
      uniqueDigits,
      availableNumbers,
      currentLength: length,
      numbers: numbersByLength[length - 1] || [],
      choicesPerPosition: [9, ...remainingChoices],
      message: `Available digits decreases: ${availableNumbers}`,
    })
  }

  steps.push({
    activeLine: 10,
    n,
    count,
    uniqueDigits,
    availableNumbers,
    currentLength: n + 1,
    numbers: [],
    message: `Final result: ${count} numbers with unique digits from 0 to 10^${n}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'n = 0',
    n: 0,
    description: 'Only 0',
  },
  {
    label: 'n = 1',
    n: 1,
    description: '0-9 (10 numbers)',
  },
  {
    label: 'n = 2',
    n: 2,
    description: '0-99: 1-digit (10) + 2-digit (81) = 91',
  },
]

function DigitChoiceTree({ length, choicesPerPosition }) {
  if (!choicesPerPosition) return null

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#475569' }}>
        Choices per position:
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {choicesPerPosition.map((choices, pos) => (
          <motion.div
            key={pos}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: pos * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#dbeafe',
                border: '2px solid #0ea5e9',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                color: '#1e40af',
                minWidth: 40,
                textAlign: 'center',
              }}
            >
              {choices}
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              Pos {pos}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#475569' }}>
        Product: {choicesPerPosition.reduce((a, b) => a * b, 1)} numbers
      </div>
    </div>
  )
}

function AvailableDigitsDisplay({ length, usedCount }) {
  const digits = Array.from({ length: 10 }, (_, i) => i)
  const availableCount = 10 - usedCount

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#475569' }}>
        Available digits for remaining positions:
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <AnimatePresence>
          {digits.map((digit) => {
            const isAvailable = digit >= usedCount
            return (
              <motion.div
                key={digit}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: isAvailable ? 1 : 0.3, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: isAvailable ? '#dcfce7' : '#f1f5f9',
                  border: isAvailable ? '2px solid #22c55e' : '1px solid #cbd5e1',
                  color: isAvailable ? '#16a34a' : '#94a3b8',
                  cursor: 'pointer',
                }}
              >
                {digit}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#475569' }}>
        {availableCount} digits available
      </div>
    </div>
  )
}

function NumbersByLengthDisplay({ n, count }) {
  const breakdown = []
  if (n >= 1) breakdown.push({ length: 1, count: 10, label: '0-9' })
  if (n >= 2) breakdown.push({ length: 2, count: 81, label: '10-99' })
  if (n >= 3) breakdown.push({ length: 3, count: 648, label: '100-999' })
  if (n >= 4) breakdown.push({ length: 4, count: 4536, label: '1000-9999' })
  if (n >= 5) breakdown.push({ length: 5, count: 27216, label: '10000-99999' })

  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#475569' }}>
        Numbers grouped by digit count:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <AnimatePresence>
          {breakdown.map((item, idx) => (
            <motion.div
              key={item.length}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: 4,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#1e40af' }}>
                {item.length}-digit ({item.label}):
              </span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.1 }}
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#0ea5e9',
                }}
              >
                {item.count} numbers
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          marginTop: 12,
          padding: '12px',
          backgroundColor: '#ecfdf5',
          border: '2px solid #22c55e',
          borderRadius: 4,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 10, color: '#059669', marginBottom: 4 }}>Total Count</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#16a34a' }}>
          {count}
        </div>
      </motion.div>
    </div>
  )
}

function CountAccumulator({ count, n }) {
  return (
    <div style={{ padding: '12px 0' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#475569' }}>
        Running count accumulator:
      </div>
      <motion.div
        animate={{ scale: 1 }}
        initial={{ scale: 0.95 }}
        style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: 6,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#92400e', marginBottom: 4 }}>
          Numbers with unique digits from 0 to 10^{n}:
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
          {count}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem357Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [nInput, setNInput] = useState(String(EXAMPLES[0]?.n ?? 0));
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: EXAMPLES[exIdx]?.n ?? '', inputError: e.message };
    }
  }, [nInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(n), [n])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNInput(String(EXAMPLES[i].n)); handleReset(); }, [handleReset]);

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
      title: '🔢 Permutation Puzzle',
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
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
              <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, borderLeft: '4px solid #0ea5e9' }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>
                  {step.message}
                </div>
                {step.calculation && (
                  <div style={{ marginTop: 6, fontSize: 11, color: '#475569', fontFamily: 'monospace', backgroundColor: '#ffffff', padding: 6, borderRadius: 4 }}>
                    {step.calculation}
                  </div>
                )}
              </div>

              <NumbersByLengthDisplay n={step.n} count={step.count} />

              {step.choicesPerPosition && (
                <DigitChoiceTree length={step.currentLength} choicesPerPosition={step.choicesPerPosition} />
              )}

              {step.currentLength > 1 && step.currentLength <= step.n && (
                <AvailableDigitsDisplay length={step.currentLength} usedCount={step.currentLength - 1} />
              )}

              <CountAccumulator count={step.count} n={step.n} />
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

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
