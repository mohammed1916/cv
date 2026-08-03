import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ReverseIntegerVisualizer.css'

const REVIN_PATTERNS = ['init', 'loop', 'pop', 'check_max', 'check_min', 'push']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',        // MIN, MAX = -2**31, 2**31 - 1
  4: 'init',        // res = 0
  6: 'loop',        // while x != 0:
  8: 'pop',         // digit = x % 10 if x > 0 else x % -10
  9: 'pop',         // x = int(x / 10)
  11: 'check_max',  // if res > MAX // 10 or (res == MAX // 10 and digit > 7):
  12: 'check_max',  // return 0
  13: 'check_min',  // if res < int(MIN / 10) or (res == int(MIN / 10) and digit < -8):
  14: 'check_min',  // return 0
  16: 'push',       // res = (res * 10) + digit
  18: 'loop',       // return res
}

const SOLUTION_CODE = [
  { line: 1,  text: 'class Solution:' },
  { line: 2,  text: '    def reverse(self, x: int) -> int:' },
  { line: 3,  text: '        MIN, MAX = -2**31, 2**31 - 1' },
  { line: 4,  text: '        res = 0' },
  { line: 5,  text: '        ' },
  { line: 6,  text: '        while x != 0:' },
  { line: 7,  text: '            # Math.trunc in JS handles negative division/modulo' },
  { line: 8,  text: '            digit = x % 10 if x > 0 else x % -10' },
  { line: 9,  text: '            x = int(x / 10)' },
  { line: 10, text: '            ' },
  { line: 11, text: '            if res > MAX // 10 or (res == MAX // 10 and digit > 7):' },
  { line: 12, text: '                return 0' },
  { line: 13, text: '            if res < int(MIN / 10) or (res == int(MIN / 10) and digit < -8):' },
  { line: 14, text: '                return 0' },
  { line: 15, text: '                ' },
  { line: 16, text: '            res = (res * 10) + digit' },
  { line: 17, text: '            ' },
  { line: 18, text: '        return res' },
]

function generateSteps(initialX) {
  const steps = []
  
  const MIN = -Math.pow(2, 31)
  const MAX = Math.pow(2, 31) - 1

  let x = initialX
  let res = 0

  steps.push({
    phase: 'init', x, res, digit: null, overflow: false,
    activeLine: 4, message: 'Initialize res = 0, MIN/MAX bounds set.'
  })

  while (x !== 0) {
    steps.push({
      phase: 'loop', x, res, digit: null, overflow: false,
      activeLine: 6, message: 'Is x != 0? Yes.'
    })

    const digit = x % 10
    const newX = Math.trunc(x / 10)

    steps.push({
      phase: 'pop', x: newX, res, digit, overflow: false, prevX: x,
      activeLine: 9, message: 'Pop digit = ' + digit + ', new x = ' + newX + '.'
    })
    
    x = newX

    steps.push({
      phase: 'check_max', x, res, digit, overflow: false,
      activeLine: 11, message: 'Check if res > MAX // 10.'
    })

    const maxDiv10 = Math.trunc(MAX / 10)
    if (res > maxDiv10 || (res === maxDiv10 && digit > 7)) {
        steps.push({
            phase: 'done', x, res: 0, digit, overflow: true,
            activeLine: 12, message: 'Positive overflow! Return 0.'
        })
        return steps
    }

    steps.push({
      phase: 'check_min', x, res, digit, overflow: false,
      activeLine: 13, message: 'Check if res < MIN // 10.'
    })

    const minDiv10 = Math.trunc(MIN / 10)
    if (res < minDiv10 || (res === minDiv10 && digit < -8)) {
        steps.push({
            phase: 'done', x, res: 0, digit, overflow: true,
            activeLine: 14, message: 'Negative overflow! Return 0.'
        })
        return steps
    }

    const newRes = (res * 10) + digit
    steps.push({
      phase: 'push', x, res: newRes, digit, overflow: false, prevRes: res,
      activeLine: 16, message: 'Push digit: res = res * 10 + digit = ' + newRes + '.'
    })

    res = newRes
  }

  steps.push({
    phase: 'done', x, res, digit: null, overflow: false,
    activeLine: 18, message: 'Loop finished. Return res = ' + res + '.'
  })

  return steps
}

const EXAMPLES = getExamples('reverse-integer')

export default function ReverseIntegerVisualizer() {
  const [xInput, setXInput] = useState('123')
  const [panelDivs, setPanelDivs] = useState(null)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { initialX, inputError } = useMemo(() => {
    try {
      const parsed = parseInt(xInput, 10)
      if (isNaN(parsed)) throw new Error()
      return { initialX: parsed, inputError: '' }
    } catch {
      return { initialX: 123, inputError: 'Invalid integer' }
    }
  }, [xInput])

  const steps = useMemo(
    () => generateSteps(initialX).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [initialX],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setXInput(String(ex.x))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const inputPanel = (
    <div className="revin-panel">
      <div className="revin-panel-head">
        Pop & Push Digits
        {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="revin-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="revin-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>x=</span>
          <input
            value={xInput}
            onChange={(e) => { setXInput(e.target.value); handleReset() }}
            placeholder="123"
            className="revin-input"
            style={{ flex: 1, margin: 0 }}
          />
        </div>

        <div className="revin-math-container">
            <div className="revin-math-box x-box">
                <span className="revin-math-title">Current X</span>
                <div className="revin-math-val x-val">
                    {step?.x ?? initialX}
                </div>
            </div>

            <div className="revin-pop-area">
                {step && step.digit !== null && step.phase !== 'init' && step.phase !== 'loop' && step.phase !== 'done' && (
                    <motion.div
                        className="revin-popped-digit"
                        initial={step.phase === 'pop' ? { y: -20, opacity: 0 } : false}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <span className="label">popped digit</span>
                        <span className="val">{step.digit}</span>
                    </motion.div>
                )}
            </div>

            <div className="revin-math-box res-box">
                <span className="revin-math-title">Current Result (res)</span>
                <div className="revin-math-val res-val">
                    {step?.res ?? 0}
                </div>
                {step?.phase === 'push' && (
                    <div className="revin-math-equation">
                        ({step.prevRes} × 10) + {step.digit}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  )

  const boundsPanel = (
    <div className="revin-panel">
      <div className="revin-panel-head">32-Bit Integer Bounds</div>
      <div className="revin-panel-body" style={{ gap: 16 }}>

        <div className="revin-bounds-box">
            <div className="revin-bound">
                <span className="label">MIN (-2³¹)</span>
                <span className="val">-2147483648</span>
            </div>
            <div className="revin-bound">
                <span className="label">MAX (2³¹ - 1)</span>
                <span className="val">2147483647</span>
            </div>
            <div className="revin-bound sub">
                <span className="label">MAX // 10</span>
                <span className="val">214748364</span>
            </div>
            <div className="revin-bound sub">
                <span className="label">MIN // 10</span>
                <span className="val">-214748364</span>
            </div>
        </div>

        {(step?.phase === 'check_max' || step?.phase === 'check_min') && (
            <div className="revin-check-box">
                <div className="revin-check-text">
                    Checking if res ({step.res}) {step.phase === 'check_max' ? '>' : '<'} {step.phase === 'check_max' ? '214748364' : '-214748364'}
                </div>
            </div>
        )}

        {step?.overflow && (
            <div className="revin-overflow-alert">
                ⚠️ 32-bit Integer Overflow Detected! Return 0.
            </div>
        )}

        {step?.phase === 'done' && !step?.overflow && (
            <div className="revin-success-alert">
                ✅ Result successfully reversed within bounds.
            </div>
        )}

      </div>
    </div>
  )

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

  const statusPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '12px 16px', minHeight: 0 }}>
      <div className={'revin-status ' + (step?.phase === 'done' ? (step?.overflow ? 'overflow' : 'success') : '')}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={REVIN_PATTERNS} />
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
    </div>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'input', title: 'Pop & Push Digits', dockMode: 'split-right' },
      { id: 'bounds', title: '32-Bit Bounds', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs)
  }, [])

  return (
    <div className="revin-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.bounds && createPortal(boundsPanel, panelDivs.bounds)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
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
