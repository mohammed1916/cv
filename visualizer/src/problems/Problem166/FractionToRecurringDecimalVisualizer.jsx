import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './FractionToRecurringDecimalVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('fraction-to-recurring-decimal', [
  { label: 'Example 1', numerator: 1, denominator: 2 },
  { label: 'Example 2', numerator: 1, denominator: 6 },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def fractionToDecimal(num, denom):' },
  { line: 2, text: '    result = ""' },
  { line: 3, text: '    if (num < 0) ^ (denom < 0):' },
  { line: 4, text: '        result += "-"' },
  { line: 5, text: '    num, denom = abs(num), abs(denom)' },
  { line: 6, text: '    result += str(num // denom)' },
  { line: 7, text: '    if num % denom == 0: return result' },
  { line: 8, text: '    result += "."' },
  { line: 9, text: '    seen = {}'},
  { line: 10, text: '    remainder = num % denom' },
  { line: 11, text: '    while remainder != 0:' },
  { line: 12, text: '        if remainder in seen:' },
  { line: 13, text: '            result.insert(seen[remainder], "(")' },
  { line: 14, text: '            result += ")"' },
  { line: 15, text: '            return result' },
  { line: 16, text: '        seen[remainder] = len(result)' },
  { line: 17, text: '        remainder *= 10' },
  { line: 18, text: '        result += str(remainder // denom)' },
  { line: 19, text: '        remainder %= denom' },
  { line: 20, text: '    return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(numerator, denominator) {
const applyInput = useCallback((e) => { setInput(e); setNumeratorInput(String(e.numerator)); setDenominatorInput(String(e.denominator)); handleReset(); }, [handleReset]);
    const steps = []

  steps.push({
    activeLine: 1,
    numerator,
    denominator,
    message: `Convert ${numerator}/${denominator} to decimal`,
    relatedLines: [1],
  })

  let result = ''
  const isNegative = (numerator < 0) ^ (denominator < 0)

  steps.push({
    activeLine: 3,
    numerator,
    denominator,
    isNegative,
    message: `Check sign: ${isNegative ? 'negative' : 'positive'}`,
    relatedLines: [3, 4],
  })

  if (isNegative) {
    result = '-'
  }

  const num = Math.abs(numerator)
  const denom = Math.abs(denominator)

  steps.push({
    activeLine: 5,
    num,
    denom,
    message: `Use absolute values: ${num}/${denom}`,
    relatedLines: [5],
  })

  const intPart = Math.floor(num / denom)
  result += intPart

  steps.push({
    activeLine: 6,
    result,
    intPart,
    message: `Integer part: ${intPart}, result = "${result}"`,
    relatedLines: [6],
  })

  if (num % denom === 0) {
    steps.push({
      activeLine: 7,
      result,
      done: true,
      message: `No remainder: return "${result}"`,
      relatedLines: [7],
    })
    return steps
  }

  result += '.'

  steps.push({
    activeLine: 8,
    result,
    message: `Add decimal point, result = "${result}"`,
    relatedLines: [8],
  })

  const seen = {}
  let remainder = num % denom
  const decimalDigits = []

  steps.push({
    activeLine: 9,
    result,
    remainder,
    message: `Start decimal digits. Initial remainder: ${remainder}`,
    relatedLines: [9, 10],
  })

  let iteration = 0
  while (remainder !== 0 && iteration < 20) {
    iteration++

    if (remainder in seen) {
      steps.push({
        activeLine: 12,
        result,
        remainder,
        seen: { ...seen },
        foundAt: seen[remainder],
        message: `Remainder ${remainder} seen before at position ${seen[remainder]}`,
        relatedLines: [12],
      })

      const insertPos = seen[remainder]
      result = result.slice(0, insertPos) + '(' + result.slice(insertPos) + ')'

      steps.push({
        activeLine: 15,
        result,
        done: true,
        message: `Insert parentheses: "${result}"`,
        relatedLines: [13, 14, 15],
      })

      return steps
    }

    seen[remainder] = result.length

    steps.push({
      activeLine: 16,
      result,
      remainder,
      seen: { ...seen },
      message: `Record remainder ${remainder} at position ${result.length}`,
      relatedLines: [16],
    })

    remainder *= 10
    const digit = Math.floor(remainder / denom)
    result += digit
    remainder %= denom

    decimalDigits.push(digit)

    steps.push({
      activeLine: 17,
      result,
      remainder,
      digit,
      message: `Digit: ${digit}, remainder: ${remainder}, result = "${result}"`,
      relatedLines: [17, 18, 19],
    })
  }

  steps.push({
    activeLine: 20,
    result,
    done: true,
    message: `No recurrence: return "${result}"`,
    relatedLines: [20],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Long division: track remainders, detect cycle with hash map.
        </div>
      </div>

      {step.numerator !== undefined && step.denominator !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Fraction
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#0c4a6e', fontWeight: 600 }}>
            {step.numerator} / {step.denominator}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Result
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#5b21b6', fontWeight: 600, wordBreak: 'break-all' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}

      {step.remainder !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Current Remainder
          </div>
          <div style={{ fontSize: 13, color: '#065f46', fontFamily: 'monospace', fontWeight: 600 }}>
            {step.remainder}
          </div>
        </motion.div>
      )}

      {step.seen && Object.keys(step.seen).length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Seen Remainders
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11 }}>
            {Object.entries(step.seen).slice(0, 8).map(([rem, pos]) => (
              <div key={rem} style={{ color: '#065f46', fontFamily: 'monospace' }}>
                {rem} @ {pos}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.foundAt !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 4 }}>
            Cycle Detected!
          </div>
          <div style={{ fontSize: 12, color: '#7f1d1d' }}>
            Remainder repeats from position {step.foundAt}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function FractionToRecurringDecimalVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [numeratorInput, setNumeratorInput] = useState(1);
  const [denominatorInput, setDenominatorInput] = useState(2);
  const { numerator, denominator, inputError } = useMemo(() => {
    try {
      const parsedNumerator = Number(numeratorInput); if (isNaN(parsedNumerator)) throw new Error('numerator must be a number');
      const parsedDenominator = Number(denominatorInput); if (isNaN(parsedDenominator)) throw new Error('denominator must be a number');
      return { numerator: parsedNumerator, denominator: parsedDenominator, inputError: '' };
    } catch (e) {
      return { numerator: 1, denominator: 2, inputError: e.message };
    }
  }, [numeratorInput, denominatorInput]);
  const steps = useMemo(
    () =>
      generateSteps(numerator, denominator).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [numerator, denominator]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels into consts
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )
  const primaryPanel = <VisualizationPanel step={step} />
  const statusPanel = (
    <div className="ftrd-status" style={{ padding: 8, fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8 }}>
      {step ? `Step ${stepIndex + 1} of ${steps.length}` : 'Ready'}
    </div>
  )
  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} linePatternMap={LINE_PATTERN_MAP} />}
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
    </>
  )

  // Setup panel configuration and ready handler
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🔢 Recurring Decimal', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="ftrd-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
