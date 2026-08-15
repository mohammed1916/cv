import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './Problem372Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('super-power')

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []

const EXAMPLES = getExamples('super-power')
const DEFAULT_EX = EXAMPLES[0] || { label: '2^3', base: 2, exponents: [3] }

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

function VisualizationPanel({ base, exponents, step, inputPanel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      {inputPanel}

      <SuperPowerVisualization base={base} exponents={exponents} step={step} />
    </div>
  )
}

export default function Problem372Visualizer() {
  const [activeLabel, setActiveLabel] = useState(DEFAULT_EX.label ?? '')
  const [baseInput, setBaseInput] = useState(String(DEFAULT_EX.base))
  const [exponentsInput, setExponentsInput] = useState(JSON.stringify(DEFAULT_EX.exponents))

  const { base, exponents, inputError } = useMemo(() => {
    try {
      const parsedBase = Number(baseInput)
      if (!Number.isInteger(parsedBase) || parsedBase < 1) {
        throw new Error('base must be a positive integer')
      }
      const parsedExponents = JSON.parse(exponentsInput)
      if (!Array.isArray(parsedExponents) || parsedExponents.length === 0) {
        throw new Error('exponents must be a non-empty array of digits')
      }
      if (parsedExponents.length > 12) {
        throw new Error('exponents is limited to 12 digits in this visualizer')
      }
      parsedExponents.forEach((d) => {
        if (!Number.isInteger(d) || d < 0 || d > 9) {
          throw new Error('each exponent entry must be a single digit 0-9')
        }
      })
      return { base: parsedBase, exponents: parsedExponents, inputError: '' }
    } catch (e) {
      return { base: 2, exponents: [3], inputError: e.message }
    }
  }, [baseInput, exponentsInput])

  const steps = useMemo(
    () =>
      generateSteps(base, exponents).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [base, exponents]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    if (!e) return
    setActiveLabel(e.label)
    setBaseInput(String(e.base))
    setExponentsInput(JSON.stringify(e.exponents))
    handleReset()
  }, [handleReset])

  const handleInputChange = useCallback((key, text) => {
    if (key === 'base') setBaseInput(text)
    if (key === 'exponents') setExponentsInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const inputPanel = (
    <ManualInputPanel
      fields={[
        { key: 'base', label: 'a (base)', type: 'number' },
        { key: 'exponents', label: 'b (digits)', type: 'array' },
      ]}
      values={{ base: baseInput, exponents: exponentsInput }}
      onChange={handleInputChange}
      examples={EXAMPLES}
      activeLabel={activeLabel}
      applyExample={applyEx}
      inputError={inputError}
    />
  )

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⚡ Modular Exponentiation', dockMode: 'split-right' },
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
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>),
    viz: (<VisualizationPanel
          base={base}
          exponents={exponents}
          step={step}
          inputPanel={inputPanel}
        />),
  }), [step, connectivity, setActiveLineDom, base, exponents, inputPanel])
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
