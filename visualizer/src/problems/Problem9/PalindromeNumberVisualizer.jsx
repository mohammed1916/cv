import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './PalindromeNumberVisualizer.css'

const PN_PATTERNS = ['init', 'negative', 'trailing_zero', 'state', 'check', 'extract', 'build', 'advance', 'compare']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',          // if x < 0 or (x % 10 == 0 and x != 0):
  3: 'init',          // return False
  4: 'state',         // rev = 0
  5: 'check',         // while x > rev:
  6: 'extract',       // rev = rev * 10 + x % 10
  6: 'build',         // rev = rev * 10 + x % 10
  7: 'advance',       // x //= 10
  8: 'compare',       // return x == rev or x == rev // 10
}

const SOLUTION_CODE = [
  { line: 1, text: 'def isPalindrome(x: int) -> bool:' },
  { line: 2, text: '    if x < 0 or (x % 10 == 0 and x != 0):' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    rev = 0' },
  { line: 5, text: '    while x > rev:' },
  { line: 6, text: '        rev = rev * 10 + x % 10' },
  { line: 7, text: '        x //= 10' },
  { line: 8, text: '    return x == rev or x == rev // 10' },
]

function digitsFrom(value) {
  return String(Math.abs(value)).split('')
}

function stepDigits(value) {
  return digitsFrom(value).map((digit, index) => ({ digit, index }))
}

function generateSteps(num) {
  const steps = []

  if (!Number.isSafeInteger(num)) {
    steps.push({
      phase: 'invalid',
      activeLine: 2,
      x: null,
      rev: 0,
      orig: null,
      result: null,
      message: 'Enter a valid whole number in the safe integer range.',
      relatedLines: [2],
    })
    return steps
  }

  const orig = num
  const initialDigits = stepDigits(orig)
  const isNegative = orig < 0
  const hasTrailingZero = orig !== 0 && orig % 10 === 0

  steps.push({
    phase: 'init',
    activeLine: 2,
    x: orig,
    rev: 0,
    orig,
    iteration: 0,
    digit: null,
    nextX: null,
    nextRev: null,
    xDigits: initialDigits,
    revDigits: ['0'],
    result: null,
    message: orig < 0 ? 'Input is negative. Stop before extracting digits.' : 'Start with rev = 0 and process digits from the right.',
    relatedLines: [2],
  })

  if (isNegative) {
    steps.push({
      phase: 'negative',
      activeLine: 3,
      x: orig,
      rev: 0,
      orig,
      iteration: 0,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: initialDigits,
      revDigits: ['0'],
      edgeCase: 'negative',
      result: false,
      message: 'Negative numbers cannot be palindromes.',
      relatedLines: [3],
    })
    steps.push({
      phase: 'done',
      activeLine: 3,
      x: orig,
      rev: 0,
      orig,
      iteration: 0,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: initialDigits,
      revDigits: ['0'],
      edgeCase: 'negative',
      result: false,
      message: 'Return false immediately for a negative number.',
      relatedLines: [3],
    })
    return steps
  }

  if (hasTrailingZero) {
    steps.push({
      phase: 'trailing-zero',
      activeLine: 2,
      x: orig,
      rev: 0,
      orig,
      iteration: 0,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: initialDigits,
      revDigits: ['0'],
      edgeCase: 'trailing-zero',
      result: false,
      message: 'Trailing zero detected. A non-zero number ending in 0 cannot be a palindrome.',
      relatedLines: [2],
    })
    steps.push({
      phase: 'done',
      activeLine: 3,
      x: orig,
      rev: 0,
      orig,
      iteration: 0,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: initialDigits,
      revDigits: ['0'],
      edgeCase: 'trailing-zero',
      result: false,
      message: 'Return false because the last digit is 0 and the number is not 0.',
      relatedLines: [3],
    })
    return steps
  }

  let x = orig
  let rev = 0
  let iteration = 0

  steps.push({
    phase: 'state',
    activeLine: 4,
    x,
    rev,
    orig,
    iteration,
    digit: null,
    nextX: null,
    nextRev: null,
    xDigits: stepDigits(x),
    revDigits: stepDigits(rev),
    result: null,
    message: 'Initialize rev = 0. Now the loop starts with the rightmost digit of x.',
    relatedLines: [4],
  })

  if (x === 0) {
    steps.push({
      phase: 'compare',
      activeLine: 8,
      x,
      rev,
      orig,
      iteration,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: stepDigits(x),
      revDigits: stepDigits(rev),
      result: true,
      compareMode: 'zero',
      message: 'x is 0, so x equals rev. 0 is a palindrome.',
      relatedLines: [8],
    })
    steps.push({
      phase: 'done',
      activeLine: 8,
      x,
      rev,
      orig,
      iteration,
      digit: null,
      nextX: null,
      nextRev: null,
      xDigits: stepDigits(x),
      revDigits: stepDigits(rev),
      result: true,
      compareMode: 'zero',
      message: 'Return true.',
      relatedLines: [8],
    })
    return steps
  }

  while (x > rev) {
    const currentX = x
    const currentRev = rev
    const digit = currentX % 10
    const nextRev = currentRev * 10 + digit
    const nextX = Math.floor(currentX / 10)

    steps.push({
      phase: 'check',
      activeLine: 5,
      x: currentX,
      rev: currentRev,
      orig,
      iteration,
      digit,
      nextX,
      nextRev,
      xDigits: stepDigits(currentX),
      revDigits: stepDigits(currentRev),
      result: null,
      message: `Iteration ${iteration + 1}: check while x > rev (${currentX} > ${currentRev}).`,
      relatedLines: [5],
    })

    steps.push({
      phase: 'extract',
      activeLine: 6,
      x: currentX,
      rev: currentRev,
      orig,
      iteration,
      digit,
      nextX,
      nextRev,
      xDigits: stepDigits(currentX),
      revDigits: stepDigits(currentRev),
      result: null,
      message: `Extract the rightmost digit: digit = x % 10 = ${currentX} % 10 = ${digit}.`,
      relatedLines: [6],
    })

    steps.push({
      phase: 'build',
      activeLine: 6,
      x: currentX,
      rev: currentRev,
      orig,
      iteration,
      digit,
      nextX,
      nextRev,
      xDigits: stepDigits(currentX),
      revDigits: stepDigits(currentRev),
      previewRevDigits: stepDigits(nextRev),
      result: null,
      message: `Move digit into rev: rev = ${currentRev} * 10 + ${digit} = ${nextRev}.`,
      relatedLines: [6],
    })

    x = nextX
    rev = nextRev
    iteration += 1

    steps.push({
      phase: 'advance',
      activeLine: 7,
      x,
      rev,
      orig,
      iteration,
      digit,
      nextX: null,
      nextRev: null,
      xDigits: stepDigits(x),
      revDigits: stepDigits(rev),
      result: null,
      message: `Drop the extracted digit from x: x = ${x}. Now rev = ${rev}.`,
      relatedLines: [7],
    })
  }

  const evenMatch = x === rev
  const oddMatch = x === Math.floor(rev / 10)
  const isPalindrome = evenMatch || oddMatch

  steps.push({
    phase: 'compare',
    activeLine: 8,
    x,
    rev,
    orig,
    iteration,
    digit: null,
    nextX: null,
    nextRev: null,
    xDigits: stepDigits(x),
    revDigits: stepDigits(rev),
    compareMode: evenMatch ? 'even' : 'odd',
    evenMatch,
    oddMatch,
    result: isPalindrome,
    message: evenMatch ? `Even-length compare: x == rev (${x} == ${rev}).` : `Odd-length compare: x == rev // 10 (${x} == ${Math.floor(rev / 10)}).`,
    relatedLines: [8],
  })

  steps.push({
    phase: 'done',
    activeLine: 8,
    x,
    rev,
    orig,
    iteration,
    digit: null,
    nextX: null,
    nextRev: null,
    xDigits: stepDigits(x),
    revDigits: stepDigits(rev),
    compareMode: evenMatch ? 'even' : 'odd',
    evenMatch,
    oddMatch,
    result: isPalindrome,
    message: isPalindrome ? 'Return true.' : 'Return false.',
    relatedLines: [8],
  })

  return steps
}

function DigitTape({ label, value, digits, pointerLabel, pointerIndex, tone = 'neutral', note }) {
  const isEmpty = !digits || digits.length === 0
  const sign = value < 0 ? '-' : ''

  return (
    <div className="pn-tape-card pn-panel-surface">
      <div className="pn-tape-head">
        <span>{label}</span>
        <span className={`pn-tape-value ${tone}`}>{note || String(value)}</span>
      </div>
      <div className="pn-tape-meta">
        <span className="pn-meta-key">value</span>
        <span className="pn-meta-val">{String(value)}</span>
      </div>
      <div className={`pn-tape ${isEmpty ? 'empty' : ''}`}>
        {sign && <div className="pn-sign">-</div>}
        {isEmpty ? (
          <div className="pn-empty">∅</div>
        ) : (
          digits.map((entry, index) => {
            const active = pointerIndex === index
            return (
              <motion.div
                key={`${label}-${index}-${entry.digit}`}
                layout
                className={`pn-digit-cell ${active ? 'active' : ''}`}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              >
                {active && pointerLabel && <div className="pn-pointer">{pointerLabel}</div>}
                <span className="pn-digit-val">{entry.digit}</span>
                <span className="pn-digit-index">{entry.index}</span>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function StateCard({ label, value, accent }) {
  return (
    <div className="pn-state-card">
      <div className="pn-state-label">{label}</div>
      <div className={`pn-state-value ${accent || ''}`}>{value}</div>
    </div>
  )
}

const EXAMPLES = getExamples('palindrome-number')

const EDGE_CASES = [
  { key: 'negative', label: 'Negative numbers', note: 'Immediately false, because the minus sign cannot mirror itself.' },
  { key: 'trailing-zero', label: 'Trailing zero', note: 'False unless the value is exactly 0. Example: 10 is not a palindrome.' },
  { key: 'zero', label: 'Zero', note: '0 is a palindrome by itself.' },
  { key: 'single', label: 'Single digit', note: 'Any single digit is a palindrome.' },
  { key: 'odd', label: 'Odd length', note: 'Compare x with rev // 10 to ignore the middle digit.' },
  { key: 'even', label: 'Even length', note: 'Compare x directly with rev.' },
]

export default function PalindromeNumberVisualizer() {
  const [input, setInput] = useState('121')

  const { num, inputError } = useMemo(() => {
    const trimmed = input.trim()
    if (!trimmed) return { num: NaN, inputError: 'Enter an integer.' }
    if (!/^[+-]?\d+$/.test(trimmed)) return { num: NaN, inputError: 'Only whole numbers are allowed.' }
    const parsed = Number(trimmed)
    if (!Number.isSafeInteger(parsed)) return { num: NaN, inputError: 'Use a smaller integer within the safe range.' }
    return { num: parsed, inputError: '' }
  }, [input])

  const steps = useMemo(() => generateSteps(num), [num])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const currentEdgeCase = useMemo(() => {
    if (!step) return 'single'
    if (step.edgeCase) return step.edgeCase
    if (step.phase === 'compare' || step.phase === 'done') {
      if (step.compareMode === 'odd') return 'odd'
      if (step.compareMode === 'even') return 'even'
      if (step.compareMode === 'zero') return 'zero'
    }
    if (step.x !== null && Math.abs(step.x) < 10) return 'single'
    return null
  }, [step])

  const applyExample = useCallback((ex) => {
    setInput(ex.value)
    handleReset()
  }, [handleReset])

  const activeIteration = step?.phase === 'advance' ? step.iteration : Math.max((step?.iteration ?? 0) - 1, 0)

  const history = useMemo(() => {
    const seen = []
    for (let i = 0; i <= stepIndex; i += 1) {
      const s = steps[i]
      if (s?.phase === 'advance') seen.push(s)
    }
    return seen
  }, [steps, stepIndex])

  const [panelDivs, setPanelDivs] = useState(null)

  const codePanel = (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const mainPanel = (
    <div className="pn-viz-container">
      <div className="pn-state-grid">
        <StateCard label="Original" value={step?.orig ?? '—'} accent="primary" />
        <StateCard label="Current rev" value={step?.rev ?? 0} accent="success" />
        <StateCard label="Current x" value={step?.x ?? '—'} accent="cyan" />
        <StateCard label="Iteration" value={step?.phase === 'advance' || step?.phase === 'compare' || step?.phase === 'done' ? activeIteration : 0} accent="amber" />
      </div>
      <div className="pn-flow-visual">
        <DigitTape
          label="x tape"
          value={step?.x ?? num ?? 0}
          digits={step?.xDigits || stepDigits(num || 0)}
          pointerLabel="x"
          pointerIndex={step?.xDigits ? step.xDigits.length - 1 : 0}
          tone="cyan"
          note={step?.phase === 'negative' ? 'stop' : step?.phase === 'trailing-zero' ? 'early exit' : undefined}
        />
        <div className="pn-connector">
          <div className="pn-connector-line" />
          <AnimatePresence mode="wait">
            <motion.div
              key={`${step?.phase || 'idle'}-${step?.digit ?? 'none'}`}
              className="pn-digit-bubble"
              initial={{ scale: 0.7, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {step?.digit ?? '•'}
            </motion.div>
          </AnimatePresence>
          <div className="pn-connector-label">extract rightmost digit</div>
        </div>
        <DigitTape
          label="rev tape"
          value={step?.phase === 'build' ? (step?.nextRev ?? step?.rev ?? 0) : (step?.rev ?? 0)}
          digits={step?.phase === 'build' && step?.previewRevDigits ? step.previewRevDigits : (step?.revDigits || stepDigits(0))}
          pointerLabel="rev"
          pointerIndex={step?.phase === 'build' && step?.previewRevDigits ? step.previewRevDigits.length - 1 : (step?.revDigits ? step.revDigits.length - 1 : 0)}
          tone="green"
          note={step?.phase === 'compare' ? 'final compare' : step?.phase === 'done' ? 'answer' : undefined}
        />
      </div>
    </div>
  )

  const statusPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 16px', minHeight: 0 }}>
      <div className={`pn-status ${step?.result === true ? 'success' : step?.result === false ? 'danger' : ''}`}>
        {step?.message || 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'main', title: 'Visualizer', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs)
  }, [])

  return (
    <div className="pn-shell" style={{ height: 'calc(100vh - 200px)', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
      <FloatingPanel title="Input & Examples" className="pn-input-panel">
        <div className="pn-example-row">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="pn-example-btn" onClick={() => applyExample(ex)}>
              {ex.label}
            </button>
          ))}
        </div>
        <div className="pn-input-row">
          <span className="pn-input-prefix">x =</span>
          <input className="pn-input" value={input} onChange={(e) => { setInput(e.target.value); handleReset() }} placeholder="121" inputMode="numeric" />
        </div>
        {inputError && <span className="pn-error-pill">{inputError}</span>}
        <div className="pn-note-box">
          <div className="pn-note-title">What the algorithm does</div>
          <div className="pn-note-text">
            It peels the last digit from <code>x</code>, appends it to <code>rev</code>, and stops when the left side is no longer longer than the reversed side.
          </div>
        </div>
      </FloatingPanel>

      <FloatingPanel title="Result & Edge Cases" className="pn-result-panel">
        <div className="pn-result-box">
          <div className="pn-result-title">Current verdict</div>
          <div className={`pn-result-value ${step?.result === true ? 'success' : step?.result === false ? 'danger' : 'neutral'}`}>
            {step?.result == null ? 'In progress' : step.result ? 'Palindrome' : 'Not palindrome'}
          </div>
          <div className="pn-result-subtext">
            {step?.phase === 'compare'
              ? 'The loop stopped when the left side was no longer larger than the reversed side.'
              : step?.phase === 'negative'
                ? 'Stopped early because the sign is not mirrored.'
                : step?.phase === 'trailing-zero'
                  ? 'Stopped early because a non-zero number cannot end with 0 and still be a palindrome.'
                  : 'Watch the rightmost digit move from x into rev.'}
          </div>
        </div>
        <div className="pn-edge-list">
          {EDGE_CASES.map((item) => {
            const active = item.key === currentEdgeCase
            return (
              <div key={item.key} className={`pn-edge-card ${active ? 'active' : ''}`}>
                <div className="pn-edge-label">{item.label}</div>
                <div className="pn-edge-note">{item.note}</div>
              </div>
            )
          })}
        </div>
        <div className="pn-history">
          <div className="pn-history-title">Iteration history</div>
          {history.length === 0 ? (
            <div className="pn-history-empty">No iterations yet.</div>
          ) : (
            history.map((item) => (
              <div key={`${item.iteration}-${item.nextRev}`} className="pn-history-row">
                <span className="pn-history-step">#{item.iteration}</span>
                <span className="pn-history-text">
                  digit {item.digit} → x = {item.x}, rev = {item.rev}
                </span>
              </div>
            ))
          )}
        </div>
      </FloatingPanel>

      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.main && createPortal(mainPanel, panelDivs.main)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
          {showPatternOverlay && (
            <PatternLegend currentPhase={step?.phase} usedPatterns={PN_PATTERNS} />
          )}
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
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
