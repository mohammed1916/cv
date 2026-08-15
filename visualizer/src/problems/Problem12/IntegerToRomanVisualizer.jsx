import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './IntegerToRoman.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const I2R_PATTERNS = ['init', 'check', 'loop', 'append', 'subtract', 'done']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',   // def intToRoman(num: int) -> str:
  2: 'init',   // values = [1000,900,...]
  3: 'init',   // symbols = ["M","CM",...]
  4: 'init',   // result = ""
  5: 'check',  // for i, val in enumerate(values):
  6: 'loop',   // while num >= val:
  7: 'append', // result += symbols[i]
  8: 'subtract', // num -= val
  9: 'done',   // return result
}

const SOLUTION_CODE = [
  { line: 1, text: 'def intToRoman(num: int) -> str:' },
  { line: 2, text: '    values = [1000,900,500,400,100,90,50,40,10,9,5,4,1]' },
  { line: 3, text: '    symbols = ["M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"]' },
  { line: 4, text: '    result = ""' },
  { line: 5, text: '    for i, val in enumerate(values):' },
  { line: 6, text: '        while num >= val:' },
  { line: 7, text: '            result += symbols[i]' },
  { line: 8, text: '            num -= val' },
  { line: 9, text: '    return result' },
]

const EXAMPLES = [
  {
    label: '3',
    num: 3,
    note: 'Simple: III',
  },
  {
    label: '58',
    num: 58,
    note: 'Mixed: LVIII',
  },
  {
    label: '1994',
    num: 1994,
    note: 'Complex: MCMXCIV',
  },
]

const VALUE_SYMBOL_PAIRS = [
  { value: 1000, symbol: 'M' },
  { value: 900, symbol: 'CM' },
  { value: 500, symbol: 'D' },
  { value: 400, symbol: 'CD' },
  { value: 100, symbol: 'C' },
  { value: 90, symbol: 'XC' },
  { value: 50, symbol: 'L' },
  { value: 40, symbol: 'XL' },
  { value: 10, symbol: 'X' },
  { value: 9, symbol: 'IX' },
  { value: 5, symbol: 'V' },
  { value: 4, symbol: 'IV' },
  { value: 1, symbol: 'I' },
]

function generateSteps(num) {
  const steps = []

  steps.push({
    activeLine: 1,
    remainingNum: num,
    currentIdx: -1,
    currentVal: null,
    currentSymbol: null,
    result: '',
    message: `Start converting ${num} to Roman numerals.`,
  })

  steps.push({
    activeLine: 2,
    remainingNum: num,
    currentIdx: -1,
    currentVal: null,
    currentSymbol: null,
    result: '',
    message: 'Initialize value-symbol pairs in descending order.',
  })

  steps.push({
    activeLine: 4,
    remainingNum: num,
    currentIdx: -1,
    currentVal: null,
    currentSymbol: null,
    result: '',
    message: 'Initialize empty result string.',
  })

  let remaining = num
  let result = ''

  for (let i = 0; i < VALUE_SYMBOL_PAIRS.length; i++) {
    const { value, symbol } = VALUE_SYMBOL_PAIRS[i]

    steps.push({
      activeLine: 5,
      remainingNum: remaining,
      currentIdx: i,
      currentVal: value,
      currentSymbol: symbol,
      result,
      message: `Check value ${value} (${symbol}). Can we subtract it from ${remaining}?`,
    })

    while (remaining >= value) {
      steps.push({
        activeLine: 6,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `${remaining} >= ${value}. Enter while loop.`,
      })

      steps.push({
        activeLine: 7,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Append '${symbol}' to result.`,
      })

      result += symbol

      steps.push({
        activeLine: 7,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Result is now '${result}'.`,
      })

      steps.push({
        activeLine: 8,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Subtract ${value} from ${remaining}.`,
      })

      remaining -= value

      steps.push({
        activeLine: 8,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Remaining number is now ${remaining}.`,
      })

      steps.push({
        activeLine: 6,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Check again: ${remaining} >= ${value}? ${remaining >= value ? 'Yes' : 'No'}`,
      })
    }

    if (remaining === 0) {
      steps.push({
        activeLine: 9,
        remainingNum: remaining,
        currentIdx: i,
        currentVal: value,
        currentSymbol: symbol,
        result,
        message: `Complete! Return '${result}'.`,
      })
      break
    }
  }

  if (remaining > 0) {
    steps.push({
      activeLine: 9,
      remainingNum: remaining,
      currentIdx: VALUE_SYMBOL_PAIRS.length - 1,
      currentVal: 1,
      currentSymbol: 'I',
      result,
      message: `Complete! Return '${result}'.`,
    })
  }

  return steps
}

export default function IntegerToRomanVisualizer() {
  const [numInput, setNumInput] = useState(3)
  const [inputError, setInputError] = useState('')

  const num = useMemo(() => {
    const parsed = parseInt(numInput, 10)
    if (isNaN(parsed) || parsed < 1 || parsed > 3999) {
      setInputError('Please enter a number between 1 and 3999.')
      return null
    }
    setInputError('')
    return parsed
  }, [numInput])

  const steps = useMemo(() => (num !== null ? generateSteps(num) : []), [num])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((ex) => {
    setNumInput(ex.num)
    handleReset()
  }, [handleReset])

  // Step 2: Extract panels into consts
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
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.activeLine ? LINE_PATTERN_MAP[step.activeLine] : undefined}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const vizPanel = (
    <div className="i2r-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
        <ManualInputPanel
          fields={[{"key":"num","label":"num","type":"string"}]}
          values={{ num: numInput }}
          onChange={(k, v) => { if (k === 'num') setNumInput(v); handleReset() }}
          examples={EXAMPLES}
          applyExample={applyExample}
          inputError={inputError}
        />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => applyExample(ex)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: 12,
              backgroundColor: numInput === ex.num ? '#dbeafe' : 'var(--surface2)',
              fontWeight: numInput === ex.num ? 600 : 400,
            }}
            title={ex.note}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>num=</span>
        <input
          type="number"
          value={numInput}
          onChange={(e) => { setNumInput(parseInt(e.target.value, 10) || ''); handleReset() }}
          min="1"
          max="3999"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid var(--border)',
            fontFamily: 'monospace',
            fontSize: 13,
          }}
        />
      </div>

      {inputError && (
        <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 12 }}>
          {inputError}
        </div>
      )}

      {step && (
        <>
          <div style={{ padding: 12, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>Remaining</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#b45309', fontFamily: 'monospace' }}>
                {step.remainingNum}
              </div>
            </div>
            <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>Result</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>
                {step.result || '—'}
              </div>
            </div>
          </div>

          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Value-Symbol Pairs:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 6 }}>
              {VALUE_SYMBOL_PAIRS.map(({ value, symbol }, idx) => {
                const isActive = step.currentIdx === idx
                const isProcessed = step.currentIdx > idx
                return (
                  <motion.div
                    key={`${value}-${symbol}`}
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      backgroundColor: isActive ? '#0ea5e9' : isProcessed ? '#dcfce7' : 'var(--surface2)',
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: 4,
                      border: isActive ? '2px solid #0ea5e9' : '1px solid var(--border)',
                      textAlign: 'center',
                      fontSize: 11,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: isActive ? '#fff' : isProcessed ? '#166534' : 'var(--surface2)',
                      cursor: 'default',
                    }}
                  >
                    <div>{symbol}</div>
                    <div style={{ fontSize: 9, opacity: 0.8 }}>{value}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const statusPanel = (
    <div className="i2r-status" style={{ padding: 12, backgroundColor: 'var(--surface2)', fontSize: 12, borderTop: '1px solid var(--text)' }}>
      Status: Step {stepIndex + 1} of {steps.length}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.activeLine ? LINE_PATTERN_MAP[step.activeLine] : undefined} usedPatterns={I2R_PATTERNS} />
      )}
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
    </>
  )

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🔢 Roman Numeral Construction', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="i2r-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
