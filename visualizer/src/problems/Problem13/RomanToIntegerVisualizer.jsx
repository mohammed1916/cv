import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './RomanToIntegerVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const R2I_PATTERNS = ['init', 'loop', 'check', 'subtract', 'add']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  6: 'init',    // res = 0
  7: 'loop',    // for i in range(len(s)):
  8: 'loop',    // curr_val = val_map[s[i]]
  9: 'loop',    // next_val = val_map[s[i+1]] if i+1 < len(s) else 0
  10: 'check',  // if curr_val < next_val:
  11: 'subtract', // res -= curr_val  # Subtractive case
  13: 'add',    // res += curr_val
  14: 'loop',   // return res
}

const SOLUTION_CODE = [
  { line: 1, text: 'def romanToInt(s: str) -> int:' },
  { line: 2, text: '    val_map = {' },
  { line: 3, text: '        "I": 1, "V": 5, "X": 10, "L": 50,' },
  { line: 4, text: '        "C": 100, "D": 500, "M": 1000' },
  { line: 5, text: '    }' },
  { line: 6, text: '    res = 0' },
  { line: 7, text: '    for i in range(len(s)):' },
  { line: 8, text: '        curr_val = val_map[s[i]]' },
  { line: 9, text: '        next_val = val_map[s[i+1]] if i+1 < len(s) else 0' },
  { line: 10, text: '        if curr_val < next_val:' },
  { line: 11, text: '            res -= curr_val  # Subtractive case (IV, IX, etc)' },
  { line: 12, text: '        else:' },
  { line: 13, text: '            res += curr_val' },
  { line: 14, text: '    return res' },
]

const VAL_MAP = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000,
}

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    steps.push({
      activeLine: 6,
      res: 0,
      index: 0,
      currChar: '',
      currVal: 0,
      nextVal: 0,
      operation: 'none',
      message: 'Empty string. Return 0.',
    })
    return steps
  }

  // Initialize
  steps.push({
    activeLine: 6,
    res: 0,
    index: -1,
    currChar: '',
    currVal: 0,
    nextVal: 0,
    operation: 'none',
    message: 'Initialize res = 0. Start loop.',
  })

  let res = 0
  for (let i = 0; i < s.length; i++) {
    const currChar = s[i]
    const currVal = VAL_MAP[currChar]
    const nextVal = i + 1 < s.length ? VAL_MAP[s[i + 1]] : 0

    // Current value step
    steps.push({
      activeLine: 8,
      res,
      index: i,
      currChar,
      currVal,
      nextVal,
      operation: 'none',
      message: `i=${i}: Current char='${currChar}', value=${currVal}`,
    })

    // Check next value
    steps.push({
      activeLine: 9,
      res,
      index: i,
      currChar,
      currVal,
      nextVal,
      operation: 'none',
      message: `i=${i}: Next char='${nextVal > 0 ? s[i + 1] : 'none'}', value=${nextVal}`,
    })

    // Check if subtractive
    let operation = 'add'
    let newRes = res
    if (currVal < nextVal) {
      steps.push({
        activeLine: 10,
        res,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'check',
        message: `i=${i}: ${currVal} < ${nextVal}? YES (subtractive case)`,
      })

      newRes = res - currVal
      operation = 'subtract'
      steps.push({
        activeLine: 11,
        res: newRes,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'subtract',
        message: `i=${i}: Subtract ${currVal}. res = ${res} - ${currVal} = ${newRes}`,
      })
    } else {
      steps.push({
        activeLine: 10,
        res,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'check',
        message: `i=${i}: ${currVal} < ${nextVal}? NO (normal case)`,
      })

      newRes = res + currVal
      steps.push({
        activeLine: 13,
        res: newRes,
        index: i,
        currChar,
        currVal,
        nextVal,
        operation: 'add',
        message: `i=${i}: Add ${currVal}. res = ${res} + ${currVal} = ${newRes}`,
      })
    }

    res = newRes
  }

  // Final step
  steps.push({
    activeLine: 14,
    res,
    index: s.length,
    currChar: '',
    currVal: 0,
    nextVal: 0,
    operation: 'done',
    message: `Loop complete. Return res = ${res}`,
  })

  return steps
}

const EXAMPLES = getExamples('roman-to-integer')

export default function RomanToIntegerVisualizer() {
  const [romanInput, setRomanInput] = useState('MCMXCIV')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { inputError } = useMemo(() => {
    try {
      if (!romanInput || romanInput.length === 0) {
        return { inputError: '' }
      }
      const valid = /^[IVXLCDM]+$/.test(romanInput)
      if (!valid) {
        return { inputError: 'Invalid roman numeral characters' }
      }
      return { inputError: '' }
    } catch {
      return { inputError: 'Invalid input' }
    }
  }, [romanInput])

  const steps = useMemo(
    () => generateSteps(romanInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [romanInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setRomanInput(ex.s || '')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

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

  const primaryPanel = (
    <div className="rti-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
        <ManualInputPanel
          fields={[{"key":"roman","label":"roman","type":"string"}]}
          values={{ roman: romanInput }}
          onChange={(k, v) => { if (k === 'roman') setRomanInput(v); handleReset() }}
          examples={EXAMPLES}
          applyExample={applyExample}
          inputError={inputError}
        />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map((e, i) => (
          <button
            key={i}
            onClick={() => applyExample(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: 12,
              backgroundColor: romanInput === (e.s || '') ? '#dbeafe' : '#f1f5f9',
              color: romanInput === (e.s || '') ? '#1e40af' : '#1e293b',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>Input:</span>
        <input
          value={romanInput}
          onChange={(e) => { setRomanInput(e.target.value.toUpperCase()); handleReset() }}
          placeholder="MCMXCIV"
          className="rti-input"
          style={{ flex: 1, margin: 0 }}
        />
        {inputError && <span style={{ color: '#f87171', fontSize: 12 }}>{inputError}</span>}
      </div>

      {step && (
        <>
          <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>{step.message}</div>
          </div>

          {/* String visualization */}
          <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase' }}>
              Roman String
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {romanInput.split('').map((char, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: step.index === i ? 1.2 : 1,
                    backgroundColor: step.index === i ? '#3b82f6' : '#ffffff',
                    color: step.index === i ? '#ffffff' : '#1e293b',
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: step.index === i ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'default',
                  }}
                >
                  {char}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Value mapping */}
          {step.currChar && (
            <div style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 8, textTransform: 'uppercase' }}>
                Current Character
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <motion.div
                  animate={{ scale: 1.1 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 6,
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {step.currChar}
                </motion.div>
                <div style={{ color: '#1e40af', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>Value: {step.currVal}</div>
                </div>
              </div>
            </div>
          )}

          {/* Next value preview */}
          {step.nextVal > 0 && step.index + 1 < romanInput.length && (
            <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 8, textTransform: 'uppercase' }}>
                Next Character (Look-ahead)
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <motion.div
                  animate={{ scale: 1.1 }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 6,
                    backgroundColor: '#f59e0b',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {romanInput[step.index + 1]}
                </motion.div>
                <div style={{ color: '#92400e', fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>Value: {step.nextVal}</div>
                </div>
              </div>
            </div>
          )}

          {/* Operation display */}
          {(step.operation === 'add' || step.operation === 'subtract') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: 12,
                backgroundColor: step.operation === 'add' ? '#dcfce7' : '#fee2e2',
                borderRadius: 6,
                border: `2px solid ${step.operation === 'add' ? '#22c55e' : '#ef4444'}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: step.operation === 'add' ? '#15803d' : '#991b1b', marginBottom: 6 }}>
                {step.operation === 'add' ? '➕ Addition' : '➖ Subtraction (Subtractive notation)'}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: step.operation === 'add' ? '#22c55e' : '#ef4444' }}>
                {step.res - (step.operation === 'add' ? -step.currVal : step.currVal)} {step.operation === 'add' ? '+' : '-'} {step.currVal} = {step.res}
              </div>
            </motion.div>
          )}

          {/* Result accumulator */}
          <div style={{ padding: 16, backgroundColor: '#f0f9ff', borderRadius: 6, border: '2px solid #0ea5e9' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#0369a1', marginBottom: 12, textTransform: 'uppercase' }}>
              Accumulated Result
            </div>
            <motion.div
              animate={{ scale: step.operation === 'add' || step.operation === 'subtract' ? 1.05 : 1 }}
              style={{
                padding: '16px',
                borderRadius: 6,
                backgroundColor: '#ffffff',
                border: '2px solid #0ea5e9',
                fontFamily: 'monospace',
                fontSize: 24,
                fontWeight: 700,
                color: '#0369a1',
                textAlign: 'center',
              }}
            >
              {step.res}
            </motion.div>
          </div>
        </>
      )}
    </div>
  )

  const statusPanel = (
    <div className="rti-status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 12, color: '#64748b' }}>
      Step {stepIndex + 1} / {steps.length}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.activeLine ? LINE_PATTERN_MAP[step.activeLine] : undefined} usedPatterns={R2I_PATTERNS} />
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

  // Step 3: Add state + panelConfigs
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'primary', title: '🔤 Roman String Parser', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="rti-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
