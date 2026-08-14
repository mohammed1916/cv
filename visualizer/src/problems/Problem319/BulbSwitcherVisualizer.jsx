import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './BulbSwitcherVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def bulbSwitcher(n):' },
  { line: 2, text: '    ans = 0' },
  { line: 3, text: '    i = 1' },
  { line: 4, text: '    while i * i <= n:' },
  { line: 5, text: '        ans += 1        # i*i is a perfect square <= n' },
  { line: 6, text: '        i += 1' },
  { line: 7, text: '    return ans          # == floor(sqrt(n))' },
]

const MAX_DISPLAY = 40

// Trace the perfect-square counting algorithm. A bulb ends ON iff its number
// is a perfect square (it has an odd number of divisors). So the count of ON
// bulbs equals the number of perfect squares in 1..n, i.e. floor(sqrt(n)).
function generateSteps(n) {
  const steps = []
  const squares = [] // perfect squares discovered so far (<= n)

  steps.push({
    phase: 'init',
    activeLine: 2,
    relatedLines: [1, 2, 3],
    message: `Start with n = ${n}. ans = 0, i = 1. All bulbs begin OFF; we count how many end ON.`,
    n,
    i: null,
    iSquared: null,
    ans: 0,
    squares: [],
    testing: null,
  })

  let ans = 0
  let i = 1
  while (i * i <= n) {
    const iSquared = i * i
    // Enter loop: condition i*i <= n is true.
    steps.push({
      phase: 'check',
      activeLine: 4,
      relatedLines: [4, 5],
      message: `Check: i*i = ${i}*${i} = ${iSquared} <= ${n} is true. Bulb ${iSquared} is a perfect square, so it stays ON.`,
      n,
      i,
      iSquared,
      ans,
      squares: [...squares],
      testing: iSquared,
    })

    ans += 1
    squares.push(iSquared)
    steps.push({
      phase: 'count',
      activeLine: 5,
      relatedLines: [5, 6],
      message: `Count it: ans = ${ans}. Then advance i to ${i + 1}.`,
      n,
      i,
      iSquared,
      ans,
      squares: [...squares],
      testing: iSquared,
    })

    i += 1
  }

  // Loop exit: i*i > n.
  const finalISquared = i * i
  steps.push({
    phase: 'exit',
    activeLine: 4,
    relatedLines: [4, 7],
    message: `Check: i*i = ${i}*${i} = ${finalISquared} <= ${n} is false. Loop ends.`,
    n,
    i,
    iSquared: finalISquared,
    ans,
    squares: [...squares],
    testing: null,
  })

  steps.push({
    phase: 'done',
    activeLine: 7,
    relatedLines: [7],
    message: `Done. ${ans} bulb${ans === 1 ? '' : 's'} stay ON (the perfect squares ${squares.join(', ') || 'none'}). Answer = floor(sqrt(${n})) = ${ans}.`,
    n,
    i,
    iSquared: finalISquared,
    ans,
    squares: [...squares],
    testing: null,
  })

  return steps
}

const EXAMPLES = getExamplesOr('bulb-switcher', [])
const DEFAULT_N = 10

export default function BulbSwitcherVisualizer() {
  const [inputValue, setInputValue] = useState(String(DEFAULT_N))

  const { n, inputError } = useMemo(() => {
    const trimmed = inputValue.trim()
    if (trimmed === '') return { n: null, inputError: 'Enter a number for n.' }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      return { n: null, inputError: 'n must be a whole number.' }
    }
    if (parsed < 0) return { n: null, inputError: 'n must be 0 or greater.' }
    if (parsed > 1e9) return { n: null, inputError: 'Keep n <= 1,000,000,000.' }
    return { n: parsed, inputError: '' }
  }, [inputValue])

  const steps = useMemo(() => {
    if (n === null) return []
    return generateSteps(n).map((s) => ({
      ...s,
      relatedLines: s.relatedLines || [s.activeLine],
    }))
  }, [n])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  // Derived viz state from the current step (fall back to a resting view).
  const view = step || (steps.length > 0 ? steps[0] : null)
  const squareSet = useMemo(() => new Set(view?.squares || []), [view])
  const displayN = view ? Math.min(view.n, MAX_DISPLAY) : 0
  const bulbs = useMemo(
    () => Array.from({ length: displayN }, (_, idx) => idx + 1),
    [displayN],
  )
  const truncated = view ? view.n > MAX_DISPLAY : false

  return (
    <div className="bulb-switcher-shell">
      <div className="bulb-switcher-panel">
        <div className="bulb-switcher-panel-head">Input</div>
        <div className="bulb-switcher-panel-body">
          <label className="bulb-switcher-input-label" htmlFor="bulb-switcher-n">
            Number of bulbs (n)
          </label>
          <input
            id="bulb-switcher-n"
            type="number"
            min="0"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="bulb-switcher-input"
            placeholder="Enter n..."
          />
          {inputError && <div className="bulb-switcher-error">{inputError}</div>}
          <div className="bulb-switcher-hint">
            Each round i toggles every i-th bulb. A bulb ends ON only if its
            number is a perfect square (odd divisor count), so the answer is
            floor(sqrt(n)).
          </div>
        </div>
      </div>

      <div className="bulb-switcher-panel">
        <div className="bulb-switcher-panel-head">Visualization</div>
        <div className="bulb-switcher-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="bulb-switcher-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bulb-switcher-step-info">
                <h3>{step?.message || 'Press play (or step forward) to begin.'}</h3>
              </div>

              {view && (
                  <div className="bulb-switcher-readout">
                    <div className="bulb-switcher-stat">
                      <span className="bulb-switcher-stat-label">i</span>
                      <span className="bulb-switcher-stat-value">
                        {view.i ?? '-'}
                      </span>
                    </div>
                    <div className="bulb-switcher-stat">
                      <span className="bulb-switcher-stat-label">i * i</span>
                      <span className="bulb-switcher-stat-value">
                        {view.iSquared ?? '-'}
                      </span>
                    </div>
                    <div className="bulb-switcher-stat">
                      <span className="bulb-switcher-stat-label">n</span>
                      <span className="bulb-switcher-stat-value">{view.n}</span>
                    </div>
                    <div className="bulb-switcher-stat bulb-switcher-stat-ans">
                      <span className="bulb-switcher-stat-label">ans (ON)</span>
                      <span className="bulb-switcher-stat-value">{view.ans}</span>
                    </div>
                  </div>

                  <div className="bulb-switcher-bulbs">
                    {bulbs.map((num) => {
                      const isOn = squareSet.has(num)
                      const isTesting = view.testing === num
                      return (
                        <motion.div
                          key={num}
                          className={
                            'bulb-switcher-bulb'
                            + (isOn ? ' is-on' : '')
                            + (isTesting ? ' is-testing' : '')
                          }
                          animate={{
                            scale: isTesting ? 1.12 : 1,
                          }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        >
                          <span className="bulb-switcher-bulb-glyph" aria-hidden="true">
                            {isOn ? '●' : '○'}
                          </span>
                          <span className="bulb-switcher-bulb-num">{num}</span>
                        </motion.div>
                      )
                    })}
                  </div>

                  {truncated && (
                    <div className="bulb-switcher-hint">
                      Showing bulbs 1..{MAX_DISPLAY} of {view.n}. The algorithm
                      still computes the full answer ({view.ans}).
                    </div>
                  )}

                  <div className="bulb-switcher-legend">
                    <span className="bulb-switcher-legend-item">
                      <span className="bulb-switcher-swatch is-on" /> ON (perfect square)
                    </span>
                    <span className="bulb-switcher-legend-item">
                      <span className="bulb-switcher-swatch" /> OFF
                    </span>
                    <span className="bulb-switcher-legend-item">
                      <span className="bulb-switcher-swatch is-testing" /> current i*i
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="bulb-switcher-panel">
        <div className="bulb-switcher-panel-head">Code</div>
        <div className="bulb-switcher-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="bulb-switcher-examples">
          {EXAMPLES.map((example, i) => (
            <button
              key={i}
              className="bulb-switcher-example-btn"
              onClick={() => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }}
            >
              {example.label || `Example ${i + 1}`}
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
