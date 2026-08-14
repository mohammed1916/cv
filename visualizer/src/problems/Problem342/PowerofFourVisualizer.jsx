import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './PowerofFourVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def isPowerOfFour(n: int) -> bool:' },
  { line: 2, text: '    if n <= 0:' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    # power of two -> exactly one set bit' },
  { line: 5, text: '    if n & (n - 1) != 0:' },
  { line: 6, text: '        return False' },
  { line: 7, text: '    # the single set bit must sit at an even index' },
  { line: 8, text: '    # 0x55555555 = 0101...0101 keeps even-index bits' },
  { line: 9, text: '    return (n & 0x55555555) != 0' },
]

// 0101...0101 -> bits set at even positions (0, 2, 4, ...)
const EVEN_MASK = 0x55555555

const COLORS = {
  text: '#e2e8f0',
  muted: '#94a3b8',
  setBit: '#38bdf8',
  pass: '#22c55e',
  fail: '#f87171',
  surface: '#1e293b',
  surface2: '#0f172a',
  border: '#334155',
}

function toBin(n, bits) {
  return (n >>> 0).toString(2).padStart(bits, '0').slice(-bits)
}

function numBits(n) {
  if (!Number.isFinite(n) || n <= 0) return 8
  let b = Math.floor(Math.log2(n)) + 1
  b = Math.max(8, b)
  if (b % 2 !== 0) b += 1 // keep an even count so parity reads cleanly
  return Math.min(b, 32)
}

// Position (from the least-significant bit) of the single set bit, or null.
function singleSetBitPos(n) {
  if (n <= 0) return null
  if ((n & (n - 1)) !== 0) return null
  return Math.round(Math.log2(n))
}

function generateSteps(n) {
  const steps = []
  const bits = numBits(n)
  const binStr = toBin(n, bits)
  const maskStr = toBin(EVEN_MASK, bits)
  const setBitPos = singleSetBitPos(n)
  // string index of the single set bit (index 0 = most-significant)
  const setBitIndex = setBitPos === null ? null : bits - 1 - setBitPos

  const base = {
    n,
    bits,
    binStr,
    maskStr,
    setBitPos,
    setBitIndex,
    checkPositive: null,
    checkPot: null,
    checkEven: null,
    showMask: false,
    result: null,
  }

  // 1. Introduce n and its binary form
  steps.push({
    ...base,
    phase: 'init',
    activeLine: 1,
    relatedLines: [1],
    message: `n = ${n}  ->  binary ${binStr}. A power of four is a power of two whose single set bit sits at an EVEN index.`,
  })

  // 2. Check n > 0
  const positive = n > 0
  steps.push({
    ...base,
    phase: 'check-positive',
    activeLine: 2,
    relatedLines: [2, 3],
    checkPositive: positive,
    message: positive
      ? `Check 1: n = ${n} > 0  ->  PASS.`
      : `Check 1: n = ${n} <= 0  ->  FAIL. Return False.`,
  })

  if (!positive) {
    steps.push({
      ...base,
      phase: 'result',
      activeLine: 3,
      relatedLines: [3],
      checkPositive: false,
      result: false,
      message: `Verdict: ${n} is NOT a power of four (n must be positive).`,
    })
    return steps
  }

  // 3. Check power of two: n & (n - 1) == 0
  const andVal = (n & (n - 1)) >>> 0
  const isPot = andVal === 0
  steps.push({
    ...base,
    phase: 'check-pot',
    activeLine: 5,
    relatedLines: [4, 5, 6],
    checkPositive: true,
    checkPot: isPot,
    message: isPot
      ? `Check 2: n & (n-1) = ${andVal} == 0  ->  exactly one set bit, PASS (power of two).`
      : `Check 2: n & (n-1) = ${andVal} != 0  ->  more than one set bit, FAIL.`,
  })

  if (!isPot) {
    steps.push({
      ...base,
      phase: 'result',
      activeLine: 6,
      relatedLines: [6],
      checkPositive: true,
      checkPot: false,
      result: false,
      message: `Verdict: ${n} is NOT a power of four (not even a power of two).`,
    })
    return steps
  }

  // 4. Check even-index bit: n & 0x55555555 != 0
  const evenVal = (n & EVEN_MASK) >>> 0
  const isEven = evenVal !== 0
  steps.push({
    ...base,
    phase: 'check-even',
    activeLine: 9,
    relatedLines: [7, 8, 9],
    checkPositive: true,
    checkPot: true,
    checkEven: isEven,
    showMask: true,
    message: isEven
      ? `Check 3: set bit at index ${setBitPos} is EVEN, so n & 0x55555555 = ${evenVal} != 0  ->  PASS.`
      : `Check 3: set bit at index ${setBitPos} is ODD, so n & 0x55555555 = ${evenVal} == 0  ->  FAIL.`,
  })

  // 5. Final verdict
  const result = positive && isPot && isEven
  steps.push({
    ...base,
    phase: 'result',
    activeLine: 9,
    relatedLines: [9],
    checkPositive: true,
    checkPot: true,
    checkEven: isEven,
    showMask: true,
    result,
    message: result
      ? `Verdict: ${n} = 4^${setBitPos / 2} is a power of four -> True.`
      : `Verdict: ${n} is a power of two but its bit is at an odd index -> NOT a power of four (False).`,
  })

  return steps
}

const REGISTRY_EXAMPLES = getExamples('power-of-four')
const FALLBACK_EXAMPLES = [
  { label: 'n = 16', n: 16, desc: '4² = 16 → true' },
  { label: 'n = 1', n: 1, desc: '4⁰ = 1 → true' },
  { label: 'n = 64', n: 64, desc: '4³ = 64 → true' },
  { label: 'n = 8', n: 8, desc: '2³, odd bit → false' },
  { label: 'n = 5', n: 5, desc: 'not power of 2 → false' },
  { label: 'n = 0', n: 0, desc: 'n ≤ 0 → false' },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : FALLBACK_EXAMPLES

function parseN(raw) {
  const trimmed = String(raw).trim()
  if (trimmed === '') return null
  const value = Number(trimmed)
  if (!Number.isFinite(value) || !Number.isInteger(value)) return null
  if (Math.abs(value) > 0x7fffffff) return null
  return value
}

function BitCell({ char, isSet, isEvenPos, highlight, dim }) {
  const active = char === '1'
  let background = COLORS.surface2
  let color = COLORS.muted
  let borderColor = COLORS.border
  if (active) {
    color = COLORS.text
    borderColor = COLORS.setBit
    background = 'rgba(56, 189, 248, 0.12)'
  }
  if (highlight) {
    background = isSet ? 'rgba(56, 189, 248, 0.35)' : COLORS.surface2
    borderColor = COLORS.setBit
    color = COLORS.text
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: dim ? 0.45 : 1 }}>
      <motion.div
        animate={highlight ? { scale: 1.18, y: -3 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
        style={{
          width: 26,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          border: `1px solid ${borderColor}`,
          background,
          color,
          fontFamily: 'monospace',
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        {char}
      </motion.div>
      <span
        style={{
          fontSize: 9,
          fontFamily: 'monospace',
          color: isEvenPos ? COLORS.setBit : COLORS.muted,
          fontWeight: isEvenPos ? 700 : 400,
        }}
      >
        {isEvenPos ? 'E' : 'o'}
      </span>
    </div>
  )
}

function CheckRow({ label, status }) {
  const pending = status === null || status === undefined
  const color = pending ? COLORS.muted : status ? COLORS.pass : COLORS.fail
  const symbol = pending ? '…' : status ? '✓' : '✗'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 12px',
        borderRadius: 8,
        border: `1px solid ${pending ? COLORS.border : color}`,
        background: COLORS.surface2,
      }}
    >
      <span style={{ color: COLORS.text, fontSize: 13 }}>{label}</span>
      <span style={{ color, fontWeight: 800, fontSize: 16, minWidth: 20, textAlign: 'center' }}>{symbol}</span>
    </div>
  )
}

export default function PowerofFourVisualizer() {
  const [inputValue, setInputValue] = useState('16')

  const n = useMemo(() => parseN(inputValue), [inputValue])
  const inputError = n === null ? 'Enter a valid 32-bit integer (e.g. 16).' : ''

  const steps = useMemo(() => (n === null ? [] : generateSteps(n)), [n])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  // Fall back to the first step's snapshot so the board is populated before playback.
  const view = step || steps[0] || null
  const bits = view?.bits ?? 8
  const binStr = view?.binStr ?? '00000000'
  const maskStr = view?.maskStr ?? toBin(EVEN_MASK, 8)
  const setBitIndex = view?.setBitIndex ?? null
  const showMask = step?.showMask ?? false
  const highlightBit = (step?.phase === 'check-even' || step?.phase === 'result') ? setBitIndex : null
  const result = step?.result ?? null

  return (
    <div className="powerof-four-shell">
      <div className="powerof-four-panel">
        <div className="powerof-four-panel-head">Input — n</div>
        <div className="powerof-four-panel-body">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="powerof-four-textarea"
            style={{ flex: 'none', height: 38 }}
            placeholder="Enter an integer, e.g. 16"
          />
          {inputError && <div className="powerof-four-error">{inputError}</div>}
        </div>
      </div>

      <div className="powerof-four-panel">
        <div className="powerof-four-panel-head">Visualization</div>
        <div className="powerof-four-panel-body">
          <div className="powerof-four-viz">
            <div className="powerof-four-step-info">
              <h3>{step?.message || 'Press play or step to test whether n is a power of four.'}</h3>
            </div>

            {view && (
              <>
                {/* Binary representation of n */}
                <div>
                  <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6, fontFamily: 'monospace' }}>
                    n = {view.n} &nbsp;→&nbsp; {bits}-bit binary
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {binStr.split('').map((ch, i) => {
                      const posFromLsb = bits - 1 - i
                      return (
                        <BitCell
                          key={i}
                          char={ch}
                          isSet={i === setBitIndex}
                          isEvenPos={posFromLsb % 2 === 0}
                          highlight={highlightBit === i}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Even-index mask 0x55555555 */}
                <AnimatePresence>
                  {showMask && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div style={{ color: COLORS.muted, fontSize: 12, margin: '4px 0 6px', fontFamily: 'monospace' }}>
                        mask 0x55555555 &nbsp;→&nbsp; keeps even-index bits
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {maskStr.split('').map((ch, i) => {
                          const posFromLsb = bits - 1 - i
                          return (
                            <BitCell
                              key={i}
                              char={ch}
                              isSet={false}
                              isEvenPos={posFromLsb % 2 === 0}
                              highlight={highlightBit === i}
                              dim={highlightBit !== null && highlightBit !== i}
                            />
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, fontSize: 11, color: COLORS.muted, flexWrap: 'wrap' }}>
                  <span><b style={{ color: COLORS.setBit }}>E</b> = even index (power-of-four bits live here)</span>
                  <span><b>o</b> = odd index</span>
                </div>

                {/* Checks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <CheckRow label="1.  n > 0" status={step?.checkPositive} />
                  <CheckRow label="2.  power of two:  n & (n-1) == 0" status={step?.checkPot} />
                  <CheckRow label="3.  even-index bit:  n & 0x55555555 != 0" status={step?.checkEven} />
                </div>

                {/* Final verdict */}
                <AnimatePresence>
                  {result !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 16,
                        textAlign: 'center',
                        color: '#0f172a',
                        background: result ? COLORS.pass : COLORS.fail,
                      }}
                    >
                      {result ? `TRUE — ${view.n} is a power of four` : `FALSE — ${view.n} is not a power of four`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="powerof-four-panel">
        <div className="powerof-four-panel-head">Code</div>
        <div className="powerof-four-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="powerof-four-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className={`powerof-four-example-btn ${String(example.n) === inputValue ? 'active' : ''}`}
              onClick={() => { setInputValue(String(example.n)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
              {example.desc ? ` — ${example.desc}` : ''}
            </button>
          ))}
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
