import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem372Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []

const EXAMPLES = getExamples('super-power')

function generateSteps(base, exponents) {
  const steps = []
  const MOD = 1337

  // Initialize
  let result = 1
  const expDigits = exponents.map(Number)

  steps.push({
    activeLine: 1,
    result,
    base,
    expDigits,
    currentIdx: null,
    currentDigit: null,
    digitPower: null,
    computations: [],
    moduloReduction: null,
    message: `Initialize: base=${base}, exponents=[${expDigits.join(', ')}], MOD=1337, result=1`
  })

  // Process digits from right to left (using a loop-like approach)
  for (let i = expDigits.length - 1; i >= 0; i--) {
    const digit = expDigits[i]

    steps.push({
      activeLine: 2,
      result,
      base,
      expDigits,
      currentIdx: i,
      currentDigit: digit,
      digitPower: null,
      computations: [],
      moduloReduction: null,
      message: `Process digit at index ${i}: exponents[${i}]=${digit}`
    })

    // Calculate base^digit for current position
    let digitPower = 1
    for (let j = 0; j < digit; j++) {
      digitPower *= base
      digitPower %= MOD

      steps.push({
        activeLine: 3,
        result,
        base,
        expDigits,
        currentIdx: i,
        currentDigit: digit,
        digitPower,
        computations: [],
        moduloReduction: digitPower,
        message: `Apply mod: base^${j + 1} = ${digitPower} (after mod ${MOD})`
      })
    }

    // Accumulate base^digit into result
    let newResult = result
    for (let j = 0; j < 10; j++) {
      newResult *= base
      newResult %= MOD
    }

    steps.push({
      activeLine: 4,
      result,
      base,
      expDigits,
      currentIdx: i,
      currentDigit: digit,
      digitPower,
      computations: [{ power: digitPower, text: `Prepare: base^digit mod ${MOD} = ${digitPower}` }],
      moduloReduction: null,
      message: `Prepare base for next decimal position: multiply by base 10 times`
    })

    // Multiply result with digitPower
    const oldResult = result
    result = (result * digitPower) % MOD

    steps.push({
      activeLine: 5,
      result,
      base,
      expDigits,
      currentIdx: i,
      currentDigit: digit,
      digitPower,
      computations: [{ power: digitPower, text: `Multiply: ${oldResult} × ${digitPower} = ${oldResult * digitPower} ≡ ${result} (mod ${MOD})` }],
      moduloReduction: result,
      message: `Accumulate: result = ${oldResult} × ${digitPower} mod ${MOD} = ${result}`
    })

    // Update base to base^10 for next digit position
    if (i > 0) {
      let nextBase = base
      for (let j = 0; j < 9; j++) {
        nextBase = (nextBase * base) % MOD
      }
      base = nextBase

      steps.push({
        activeLine: 3,
        result,
        base,
        expDigits,
        currentIdx: i - 1,
        currentDigit: null,
        digitPower: null,
        computations: [{ power: base, text: `Prepare next: base^10 mod ${MOD} = ${base}` }],
        moduloReduction: null,
        message: `Move to next digit position: base = base^10 mod ${MOD} = ${base}`
      })
    }
  }

  steps.push({
    activeLine: 6,
    result,
    base,
    expDigits,
    currentIdx: null,
    currentDigit: null,
    digitPower: null,
    computations: [],
    moduloReduction: null,
    done: true,
    message: `Return final result: ${result}`
  })

  return steps
}

function SuperPowerVisualization({ base, exponents, step }) {
  const MOD = 1337
  const expDigits = exponents.map(Number)
  const result = step?.result ?? 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Exponent digits breakdown */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Exponent Digits</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {expDigits.map((digit, idx) => {
            const isCurrent = idx === step?.currentIdx && step && !step.done
            const isProcessed = idx > step?.currentIdx && step
            return (
              <motion.div
                key={`digit-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#dbeafe' : isProcessed ? '#d1fae5' : '#f1f5f9',
                  borderColor: isCurrent ? '#0284c7' : isProcessed ? '#10b981' : '#cbd5e1',
                  color: isCurrent ? '#0c4a6e' : isProcessed ? '#047857' : '#334155'
                }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
              >
                {digit}
              </motion.div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
          Exponents = [{expDigits.join(', ')}], processing right to left
        </div>
      </div>

      {/* Base power calculations */}
      {step && step.currentDigit !== null && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '2px solid #3b82f6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Base Power Calculation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#1e40af' }}>Base</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0c4a6e' }}>{base}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fce7f3', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#831843' }}>Digit</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#be185d' }}>{step.currentDigit}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#15803d' }}>Power</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#166534' }}>{step.digitPower ?? '—'}</div>
            </div>
          </div>
          {step.moduloReduction !== null && (
            <div style={{ fontSize: 12, color: '#475569', fontFamily: 'monospace' }}>
              Calculated base^{step.currentDigit} mod {MOD} = {step.digitPower}
            </div>
          )}
        </motion.div>
      )}

      {/* Modulo reduction visualization */}
      {step && step.moduloReduction !== null && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Modulo Application</div>
          <div style={{ fontSize: 12, color: '#78350f', fontFamily: 'monospace' }}>
            Result: {step.moduloReduction} (mod {MOD})
          </div>
        </motion.div>
      )}

      {/* Accumulation visualization */}
      {step && step.computations && step.computations.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>Accumulation</div>
          {step.computations.map((comp, idx) => (
            <div key={idx} style={{ fontSize: 12, color: '#166534', fontFamily: 'monospace', marginBottom: 6 }}>
              {comp.text}
            </div>
          ))}
        </motion.div>
      )}

      {/* Final result */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Result</div>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#ecfdf5',
            borderRadius: 6,
            border: '2px solid #10b981',
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#047857',
            textAlign: 'center',
            letterSpacing: 2
          }}
          animate={{ scale: step?.done ? 1.05 : 1 }}
        >
          {result}
        </motion.div>
      </div>

      {/* Status message */}
      {step && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#e0e7ff',
            borderRadius: 6,
            border: '1px solid #818cf8',
            fontSize: 12,
            color: '#3730a3',
            fontFamily: 'monospace'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

function VisualizationPanel({ base, exponents, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
                fontWeight: 500
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <SuperPowerVisualization base={base} exponents={exponents} step={step} />
    </div>
  )
}

export default function Problem372Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { base: 2, exponents: [3] })

  const steps = useMemo(
    () =>
      generateSteps(ex.base, ex.exponents).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
      title: '⚡ Modular Exponentiation',
      content: (
        <VisualizationPanel
          base={ex.base}
          exponents={ex.exponents}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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
