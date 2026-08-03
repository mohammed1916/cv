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
import './MultiplyStrings.css'

const MULTIPLYSTRINGS_PATTERNS = ['add_to_result', 'create_result_array', 'done', 'init', 'multiply', 'trim_zeros', 'update_cells']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'create_result_array',
  7: 'multiply',
  9: 'add_to_result',
  10: 'update_cells',
  12: 'trim_zeros',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def multiply(num1: str, num2: str) -> str:' },
  { line: 2, text: '    if num1 == "0" or num2 == "0": return "0"' },
  { line: 3, text: '    m, n = len(num1), len(num2)' },
  { line: 4, text: '    result = [0] * (m + n)' },
  { line: 5, text: '    for i in range(m - 1, -1, -1):' },
  { line: 6, text: '        for j in range(n - 1, -1, -1):' },
  { line: 7, text: '            mul = int(num1[i]) * int(num2[j])' },
  { line: 8, text: '            p1, p2 = i + j, i + j + 1' },
  { line: 9, text: '            total = mul + result[p2]' },
  { line: 10, text: '            result[p2] = total % 10' },
  { line: 11, text: '            result[p1] += total // 10' },
  { line: 12, text: '    return "".join(map(str, result)).lstrip("0") or "0"' },
]

function generateSteps(num1, num2) {
  const steps = []

  if (!num1 || !num2) {
    steps.push({
      activeLine: 2,
      result: [],
      message: 'Invalid input',
      state: {},
    })
    return steps
  }

  if (num1 === '0' || num2 === '0') {
    steps.push({
      activeLine: 2,
      result: [0],
      message: 'One of the numbers is 0, return "0"',
      state: { phase: 'zero-check' },
    })
    return steps
  }

  const m = num1.length
  const n = num2.length
  const result = new Array(m + n).fill(0)

  steps.push({
    activeLine: 3,
    result: [...result],
    message: `Initialize lengths: m=${m}, n=${n}`,
    state: { phase: 'init', m, n },
  })

  steps.push({
    activeLine: 4,
    result: [...result],
    message: `Create result array of size ${m + n}`,
    state: { phase: 'create_result_array' },
  })

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      const digit1 = parseInt(num1[i])
      const digit2 = parseInt(num2[j])
      const mul = digit1 * digit2

      steps.push({
        activeLine: 7,
        result: [...result],
        message: `num1[${m - 1 - i}]=${digit1} × num2[${n - 1 - j}]=${digit2} = ${mul}`,
        state: { phase: 'multiply', i, j, mul, currentI: m - 1 - i, currentJ: n - 1 - j },
      })

      const p1 = i + j
      const p2 = i + j + 1
      const total = mul + result[p2]

      steps.push({
        activeLine: 9,
        result: [...result],
        message: `total = ${mul} + result[${p2}] = ${total}`,
        state: { phase: 'add_to_result', i, j, p1, p2, total, mul, carry: Math.floor(total / 10) },
      })

      result[p2] = total % 10
      result[p1] += Math.floor(total / 10)

      steps.push({
        activeLine: 10,
        result: [...result],
        message: `result[${p2}] = ${result[p2]}, result[${p1}] += ${Math.floor(total / 10)} (carry)`,
        state: { phase: 'update_cells', p1, p2, i, j, carry: Math.floor(total / 10) },
      })
    }
  }

  steps.push({
    activeLine: 12,
    result: [...result],
    message: 'Convert result array to string and trim leading zeros',
    state: { phase: 'trim_zeros' },
  })

  const resultStr = result
    .map(String)
    .join('')
    .replace(/^0+/, '') || '0'

  steps.push({
    activeLine: 12,
    result: [...result],
    message: `Final result: ${resultStr}`,
    state: { phase: 'done', resultStr },
  })

  return steps
}

const EXAMPLES = [
  { label: '2 × 3', num1: '2', num2: '3' },
  { label: '123 × 456', num1: '123', num2: '456' },
  { label: '9 × 9', num1: '9', num2: '9' },
  { label: '0 × 5', num1: '0', num2: '5' },
]

export default function MultiplyStringsVisualizer() {
  const [num1Input, setNum1Input] = useState('123')
  const [num2Input, setNum2Input] = useState('456')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { num1, num2, inputError } = useMemo(() => {
    try {
      const n1 = num1Input.trim()
      const n2 = num2Input.trim()
      if (!n1 || !n2) throw new Error('Both inputs required')
      if (!/^\d+$/.test(n1) || !/^\d+$/.test(n2)) throw new Error('Must be non-negative integers')
      return { num1: n1, num2: n2, inputError: '' }
    } catch (e) {
      return { num1: null, num2: null, inputError: e.message }
    }
  }, [num1Input, num2Input])

  const steps = useMemo(() => (num1 && num2 ? generateSteps(num1, num2) : []), [num1, num2])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback(
    (num1, num2) => {
      setNum1Input(num1)
      setNum2Input(num2)
      handleReset()
    },
    [handleReset]
  )

  // Step 3: Extract panels into consts
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
          currentPhase={step?.state?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const vizPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyExample(e.num1, e.num2)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              fontSize: 12,
              backgroundColor:
                num1 === e.num1 && num2 === e.num2 ? '#dbeafe' : '#f1f5f9',
              fontWeight: num1 === e.num1 && num2 === e.num2 ? 600 : 400,
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {inputError && (
        <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6, color: '#991b1b', fontSize: 12 }}>
          {inputError}
        </div>
      )}

      {step && num1 && num2 && (
        <>
          <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 11 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Input Numbers:</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>num1</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {num1.split('').map((d, i) => (
                    <motion.div
                      key={`n1-${i}`}
                      animate={{
                        scale: step.state?.currentI === i ? 1.15 : 1,
                        backgroundColor: step.state?.currentI === i ? '#0ea5e9' : '#e0f2fe',
                        color: step.state?.currentI === i ? '#fff' : '#1e40af',
                      }}
                      style={{
                        padding: 6,
                        minWidth: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        border: '1px solid #0ea5e9',
                        fontWeight: 600,
                      }}
                    >
                      {d}
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>num2</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {num2.split('').map((d, i) => (
                    <motion.div
                      key={`n2-${i}`}
                      animate={{
                        scale: step.state?.currentJ === i ? 1.15 : 1,
                        backgroundColor: step.state?.currentJ === i ? '#10b981' : '#ecfdf5',
                        color: step.state?.currentJ === i ? '#fff' : '#065f46',
                      }}
                      style={{
                        padding: 6,
                        minWidth: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        border: '1px solid #10b981',
                        fontWeight: 600,
                      }}
                    >
                      {d}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>Algorithm Trace:</div>
            <div style={{ color: '#78350f', lineHeight: 1.5 }}>{step.message}</div>
            {step.state?.mul !== undefined && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #fcd34d', color: '#78350f' }}>
                Multiplication: {step.state.mul}
              </div>
            )}
            {step.state?.total !== undefined && (
              <div style={{ marginTop: 4, color: '#78350f' }}>Total: {step.state.total}</div>
            )}
            {step.state?.carry > 0 && (
              <div style={{ marginTop: 4, color: '#78350f' }}>Carry: {step.state.carry}</div>
            )}
            {step.state?.resultStr && (
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #fcd34d', fontWeight: 600, color: '#78350f' }}>
                Result: {step.state.resultStr}
              </div>
            )}
          </div>

          <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, fontSize: 11 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#6b21a8' }}>Result Array:</div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {step.result.map((val, idx) => (
                <motion.div
                  key={`result-${idx}`}
                  animate={{
                    scale: step.state?.p1 === idx || step.state?.p2 === idx ? 1.15 : 1,
                    backgroundColor:
                      step.state?.p1 === idx || step.state?.p2 === idx ? '#c084fc' : '#ede9fe',
                    color: step.state?.p1 === idx || step.state?.p2 === idx ? '#fff' : '#6b21a8',
                  }}
                  style={{
                    padding: 6,
                    minWidth: 30,
                    height: 30,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    border: '1px solid #c084fc',
                    fontWeight: 600,
                    fontSize: 10,
                  }}
                >
                  {val}
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, color: '#6b21a8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {step.result.map((_, idx) => (
                <span key={`idx-${idx}`}>{idx}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const statusPanel = (
    <div className="ms-status" style={{ padding: 8, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center', overflow: 'auto' }}>
      {step && <span>Step {stepIndex + 1} of {steps.length}</span>}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.state?.phase} usedPatterns={MULTIPLYSTRINGS_PATTERNS} />
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

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🔢 Multiplication Grid', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 5: Replace return block
  return (
    <div className="ms-shell">
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
