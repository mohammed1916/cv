import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './IntegerBreakVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def integerBreak(self, n: int) -> int:' },
  { line: 3, text: '        dp = [0] * (n + 1)' },
  { line: 4, text: '        dp[1] = 1' },
  { line: 5, text: '        for i in range(2, n + 1):' },
  { line: 6, text: '            for j in range(1, i):' },
  { line: 7, text: '                cand = max(j, dp[j]) * max(i - j, dp[i - j])' },
  { line: 8, text: '                dp[i] = max(dp[i], cand)' },
  { line: 9, text: '        return dp[n]' },
]

const MAX_N = 20

function makeInitialDp(n) {
  const dp = new Array(n + 1).fill(0)
  if (n >= 1) dp[1] = 1
  return dp
}

function generateSteps(n) {
  const steps = []
  const dp = makeInitialDp(n)

  steps.push({
    phase: 'init',
    activeLine: 4,
    relatedLines: [3, 4],
    message: `Initialize dp[] of size ${n + 1} with zeros, then set the base case dp[1] = 1.`,
    i: null, j: null,
    factorA: null, factorB: null, candidate: null, best: null,
    improved: false,
    dp: [...dp],
    answer: null,
  })

  for (let i = 2; i <= n; i++) {
    steps.push({
      phase: 'outer',
      activeLine: 5,
      relatedLines: [5],
      message: `Compute dp[${i}] — the maximum product obtainable by breaking ${i} into at least two positive parts.`,
      i, j: null,
      factorA: null, factorB: null, candidate: null, best: dp[i],
      improved: false,
      dp: [...dp],
      answer: null,
    })

    for (let j = 1; j < i; j++) {
      const factorA = Math.max(j, dp[j])
      const factorB = Math.max(i - j, dp[i - j])
      const candidate = factorA * factorB

      steps.push({
        phase: 'try',
        activeLine: 7,
        relatedLines: [6, 7],
        message: `Split ${i} = ${j} + ${i - j}. cand = max(${j}, dp[${j}]=${dp[j]}) × max(${i - j}, dp[${i - j}]=${dp[i - j]}) = ${factorA} × ${factorB} = ${candidate}.`,
        i, j,
        factorA, factorB, candidate, best: dp[i],
        improved: false,
        dp: [...dp],
        answer: null,
      })

      const before = dp[i]
      const improved = candidate > before
      if (improved) dp[i] = candidate

      steps.push({
        phase: 'update',
        activeLine: 8,
        relatedLines: [8],
        message: improved
          ? `${candidate} > ${before}: new best. dp[${i}] = ${dp[i]}.`
          : `${candidate} ≤ ${before}: keep current best. dp[${i}] = ${dp[i]}.`,
        i, j,
        factorA, factorB, candidate, best: dp[i],
        improved,
        dp: [...dp],
        answer: null,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 9,
    relatedLines: [9],
    message: `Done. dp[${n}] = ${dp[n]} is the maximum product for n = ${n}.`,
    i: n, j: null,
    factorA: null, factorB: null, candidate: null, best: dp[n],
    improved: false,
    dp: [...dp],
    answer: dp[n],
  })

  return steps
}

const REGISTRY_EXAMPLES = getExamplesOr('integer-break', [])
const DEFAULT_EXAMPLES = [
  { label: 'n = 2', n: 2 },
  { label: 'n = 4', n: 4 },
  { label: 'n = 7', n: 7 },
  { label: 'n = 10', n: 10 },
  { label: 'n = 15', n: 15 },
  { label: 'n = 20', n: 20 },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : DEFAULT_EXAMPLES

const COLORS = {
  text: 'var(--text)',
  dim: 'var(--text-muted)',
  current: '#f59e0b',
  filled: '#22c55e',
  operand: '#38bdf8',
  surface: 'var(--surface2)',
  border: 'var(--border)',
}

function cellStyle(idx, value, step) {
  const base = {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'monospace',
    background: COLORS.surface,
    border: `2px solid ${COLORS.border}`,
    color: COLORS.dim,
    transition: 'all 0.2s ease',
  }

  if (!step) {
    if (idx >= 1 && value > 0) return { ...base, color: COLORS.filled, border: `2px solid ${COLORS.filled}` }
    return base
  }

  const isCurrent = step.i != null && idx === step.i
  const isOperand = step.j != null && (idx === step.j || idx === step.i - step.j)

  if (isCurrent) {
    return {
      ...base,
      background: '#f59e0b22',
      border: `2px solid ${COLORS.current}`,
      color: COLORS.current,
      boxShadow: '0 0 0 3px #f59e0b33',
    }
  }
  if (isOperand) {
    return {
      ...base,
      background: '#38bdf822',
      border: `2px solid ${COLORS.operand}`,
      color: COLORS.operand,
    }
  }
  if (idx >= 1 && value > 0) {
    return { ...base, color: COLORS.filled, border: `2px solid ${COLORS.filled}` }
  }
  return base
}

export default function IntegerBreakVisualizer() {
  const [nInput, setNInput] = useState('10')

  const { n, inputError } = useMemo(() => {
    const raw = nInput.trim()
    const parsed = Number(raw)
    if (raw === '' || !Number.isFinite(parsed)) return { n: 10, inputError: 'Enter a whole number n.' }
    if (!Number.isInteger(parsed)) return { n: 10, inputError: 'n must be an integer.' }
    if (parsed < 2) return { n: 10, inputError: 'n must be ≥ 2 (break into at least two parts).' }
    if (parsed > MAX_N) return { n: MAX_N, inputError: `Clamped to n ≤ ${MAX_N} for a clear visualization.` }
    return { n: parsed, inputError: '' }
  }, [nInput])

  const steps = useMemo(() => generateSteps(n), [n])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const dpArr = step?.dp ?? makeInitialDp(n)

  return (
    <div className="integer-break-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"string"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
          showExamples={false}
          inputError={inputError}
        />
      <div className="integer-break-panel">
        <div className="integer-break-panel-head">Input — Integer Break (n)</div>
        <div className="integer-break-panel-body">
          <label style={{ fontSize: 12, color: COLORS.dim }}>n (2 … {MAX_N})</label>
          <input
            type="number"
            value={nInput}
            onChange={(e) => { setNInput(e.target.value); handleReset() }}
            className="integer-break-textarea"
            style={{ flex: 'none', height: 40 }}
            placeholder="Enter n, e.g. 10"
          />
          {inputError && <div className="integer-break-error">{inputError}</div>}
          <div style={{ fontSize: 12, color: COLORS.dim }}>
            Effective n = <strong style={{ color: COLORS.text }}>{n}</strong>. Break n into a sum of
            at least two positive integers and maximize their product.
          </div>
        </div>
      </div>

      <div className="integer-break-panel">
        <div className="integer-break-panel-head">Visualization — dp[i] = max(dp[i], max(j, dp[j]) × max(i−j, dp[i−j]))</div>
        <div className="integer-break-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="integer-break-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="integer-break-step-info">
                <h3>{step?.message || 'Press Play or Step to begin filling the dp table.'}</h3>
              </div>

              {/* Current computation card */}
              {step && step.i != null && step.phase !== 'done' && (
                <div style={{
                  padding: 14,
                  borderRadius: 8,
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ fontSize: 13 }}>
                    Computing <strong style={{ color: COLORS.current }}>dp[{step.i}]</strong>
                  </div>

                  {step.j != null ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontFamily: 'monospace' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 6,
                          border: `2px solid ${COLORS.operand}`, color: COLORS.operand,
                        }}>{step.j}</span>
                        <span style={{ color: COLORS.dim }}>+</span>
                        <span style={{
                          padding: '4px 10px', borderRadius: 6,
                          border: `2px solid ${COLORS.operand}`, color: COLORS.operand,
                        }}>{step.i - step.j}</span>
                        <span style={{ color: COLORS.dim }}>=</span>
                        <span style={{
                          padding: '4px 10px', borderRadius: 6,
                          border: `2px solid ${COLORS.current}`, color: COLORS.current,
                        }}>{step.i}</span>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                        candidate = {step.factorA} × {step.factorB} ={' '}
                        <strong style={{ color: COLORS.text }}>{step.candidate}</strong>
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
                        best dp[{step.i}] ={' '}
                        <strong style={{ color: step.improved && step.phase === 'update' ? COLORS.filled : COLORS.text }}>
                          {step.best}
                        </strong>
                        {step.phase === 'update' && step.improved && (
                          <span style={{ color: COLORS.filled, marginLeft: 8 }}>updated ↑</span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: COLORS.dim }}>
                      Trying all splits j = 1 … {step.i - 1}
                    </div>
                  )}
                </div>
              )}

              {/* dp array */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, color: COLORS.dim }}>dp[] array</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {dpArr.map((val, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={cellStyle(idx, val, step)}>{val}</div>
                      <span style={{ fontSize: 11, color: COLORS.dim, fontFamily: 'monospace' }}>{idx}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 11, color: COLORS.dim }}>
                <span><span style={{ color: COLORS.current }}>■</span> current dp[i]</span>
                <span><span style={{ color: COLORS.operand }}>■</span> split operands</span>
                <span><span style={{ color: COLORS.filled }}>■</span> filled</span>
              </div>

              {/* Answer */}
              <AnimatePresence>
                {step?.phase === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: '#22c55e22',
                      border: `2px solid ${COLORS.filled}`,
                      color: COLORS.filled,
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    Answer: maximum product for n = {n} is {step.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="integer-break-panel">
        <div className="integer-break-panel-head">Code</div>
        <div className="integer-break-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="integer-break-examples">
          {EXAMPLES.map((example, i) => {
            const exN = example.n ?? example.inputs?.n
            return (
              <button
                key={i}
                className={`integer-break-example-btn${exN === n ? ' active' : ''}`}
                onClick={() => { setNInput(String(exN)); handleReset() }}
              >
                {example.label || `Example ${i + 1}`}
              </button>
            )
          })}
        </div>
      )}

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        />
      </FloatingPanel>
    </div>
  )
}
