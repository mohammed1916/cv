import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './DivideTwoIntegersVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def divide(self, dividend: int, divisor: int) -> int:' },
  { line: 3, text: '        sign = -1 if (dividend < 0) ^ (divisor < 0) else 1' },
  { line: 4, text: '        dividend, divisor = abs(dividend), abs(divisor)' },
  { line: 5, text: '        quotient = 0' },
  { line: 6, text: '        ' },
  { line: 7, text: '        while dividend >= divisor:' },
  { line: 8, text: '            temp_divisor = divisor' },
  { line: 9, text: '            multiple = 1' },
  { line: 10, text: '            while temp_divisor << 1 <= dividend:' },
  { line: 11, text: '                temp_divisor <<= 1' },
  { line: 12, text: '                multiple <<= 1' },
  { line: 13, text: '            dividend -= temp_divisor' },
  { line: 14, text: '            quotient += multiple' },
  { line: 15, text: '        ' },
  { line: 16, text: '        result = sign * quotient' },
  { line: 17, text: '        return max(-2**31, min(2**31 - 1, result))' },
]

const PATTERNS = ['init', 'find_multiple', 'subtract', 'done']
const LINE_PATTERN_MAP = {
  4: 'init',
  10: 'find_multiple',
  13: 'subtract',
  17: 'done',
}

function generateSteps(dividend, divisor) {
  const steps = []

  if (divisor === 0) {
    steps.push({
      phase: 'done',
      activeLine: 17,
      relatedLines: [17],
      message: 'Division by zero.',
      done: true,
    })
    return steps
  }

  const sign = (dividend < 0) ^ (divisor < 0) ? -1 : 1
  let dividend_abs = Math.abs(dividend)
  const divisor_abs = Math.abs(divisor)

  steps.push({
    phase: 'init',
    activeLine: 4,
    relatedLines: [3, 4],
    message: `Sign: ${sign}, Abs: dividend=${dividend_abs}, divisor=${divisor_abs}`,
    dividend: dividend_abs,
    divisor: divisor_abs,
    sign,
    quotient: 0,
  })

  let quotient = 0

  while (dividend_abs >= divisor_abs) {
    let tempDivisor = divisor_abs
    let multiple = 1

    steps.push({
      phase: 'find_multiple',
      activeLine: 8,
      relatedLines: [7, 8, 9],
      message: `Finding largest multiple of ${divisor_abs} ≤ ${dividend_abs}`,
      dividend: dividend_abs,
      divisor: divisor_abs,
      tempDivisor,
      multiple,
      quotient,
    })

    while (tempDivisor <= dividend_abs / 2) {
      tempDivisor *= 2
      multiple *= 2

      steps.push({
        phase: 'find_multiple',
        activeLine: 11,
        relatedLines: [10, 11, 12],
        message: `Double: tempDivisor=${tempDivisor}, multiple=${multiple}`,
        dividend: dividend_abs,
        divisor: divisor_abs,
        tempDivisor,
        multiple,
        quotient,
      })
    }

    dividend_abs -= tempDivisor
    quotient += multiple

    steps.push({
      phase: 'subtract',
      activeLine: 13,
      relatedLines: [13, 14],
      message: `Subtract ${tempDivisor}, quotient += ${multiple} → quotient = ${quotient}, remainder = ${dividend_abs}`,
      dividend: dividend_abs,
      divisor: divisor_abs,
      tempDivisor,
      multiple,
      quotient,
    })
  }

  const result = Math.max(-Math.pow(2, 31), Math.min(Math.pow(2, 31) - 1, sign * quotient))

  steps.push({
    phase: 'done',
    activeLine: 17,
    relatedLines: [16, 17],
    message: `Result: ${sign} * ${quotient} = ${result}`,
    quotient,
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ dividend, divisor, step, applyExample, examples }) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Dividend</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>{dividend}</div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Divisor</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8' }}>{divisor}</div>
        </div>
      </div>

      {step?.quotient !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Quotient</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#c4b5fd' }}>{step.quotient}</div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Remainder</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#c4b5fd' }}>{step.dividend}</div>
          </div>
        </div>
      )}

      {step?.tempDivisor !== undefined && step.phase === 'find_multiple' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Finding Multiple</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
            Temp Divisor: <span style={{ color: '#22c55e', fontWeight: 600 }}>{step.tempDivisor}</span>
            {' '} | Multiple: <span style={{ color: '#22c55e', fontWeight: 600 }}>{step.multiple}</span>
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
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>{step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function DivideTwoIntegersVisualizer() {
  const examples = useMemo(() => getExamplesOr('divide-two-integers', []), [])
  const [dividend, setDividend] = useState(10)
  const [divisor, setDivisor] = useState(3)

  const steps = useMemo(() => generateSteps(dividend, divisor), [dividend, divisor])

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
      setDividend(ex.dividend || 10)
      setDivisor(ex.divisor || 3)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '÷ Divide Two Integers', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Dividend</div>
                <input
                  type="number"
                  value={dividend}
                  onChange={(e) => {
                    setDividend(parseInt(e.target.value, 10) || 0)
                    handleReset()
                  }}
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
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Divisor</div>
                <input
                  type="number"
                  value={divisor}
                  onChange={(e) => {
                    setDivisor(parseInt(e.target.value, 10) || 1)
                    handleReset()
                  }}
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
            </div>
            <VisualizationPanel dividend={dividend} divisor={divisor} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, dividend, divisor, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
