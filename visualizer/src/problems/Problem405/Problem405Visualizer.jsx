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
import './Problem405Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('convert-number-to-hex')

const PATTERNS = []
const LINE_PATTERN_MAP = {}

const EXAMPLES = [
  { label: 'Ex1', num: 26, expected: '1a' },
  { label: 'Ex2', num: -1, expected: 'ffffffff' },
  { label: 'Zero', num: 0, expected: '0' },
]

const HEX_CHARS = '0123456789abcdef'

function generateSteps(num) {
  const steps = []

  if (num === 0) {
    steps.push({
      activeLine: 1,
      message: 'Input is 0. Return "0".',
      phase: 'done',
      num,
      result: '0',
      binary: '0',
      remainder: null,
      digit: null,
    })
    return steps
  }

  let n = num
  let result = []
  let stepCount = 0

  steps.push({
    activeLine: 1,
    message: `Convert ${num} to hexadecimal. Input: ${num}, Binary: ${Math.abs(num).toString(2)}`,
    phase: 'init',
    num,
    result: '',
    binary: Math.abs(num).toString(2),
    remainder: null,
    digit: null,
  })

  // Handle negative numbers (two's complement)
  if (num < 0) {
    // For negative, use 32-bit representation
    n = 0xFFFFFFFF + num + 1

    steps.push({
      activeLine: 2,
      message: `Negative number detected. Using 32-bit two's complement: ${n.toString(16)}`,
      phase: 'negative_handling',
      num,
      result: '',
      binary: n.toString(2).padStart(32, '0'),
      remainder: null,
      digit: null,
    })
  }

  // Extract hex digits
  while (n > 0 && stepCount < 20) {
    stepCount++
    const remainder = n & 0xF // Get last 4 bits (last hex digit)
    const digit = HEX_CHARS[remainder]

    result.unshift(digit)

    steps.push({
      activeLine: 3,
      message: `Extract: n & 0xF = ${n & 0xF}. Hex digit: '${digit}'. Result so far: "${result.join('')}"`,
      phase: 'extract_digit',
      num,
      result: result.join(''),
      binary: n.toString(2).padStart(8, '0'),
      remainder,
      digit,
      n,
    })

    n >>>= 4 // Right shift by 4 bits

    steps.push({
      activeLine: 4,
      message: `Right shift by 4 bits: n = ${n}. Continue if n > 0.`,
      phase: 'shift',
      num,
      result: result.join(''),
      binary: n.toString(2).padStart(8, '0'),
      remainder: null,
      digit: null,
      n,
    })
  }

  if (result.length === 0) result.push('0')

  steps.push({
    activeLine: 5,
    message: `Conversion complete. Result: "${result.join('')}"`,
    phase: 'done',
    num,
    result: result.join(''),
    binary: n.toString(2),
    remainder: null,
    digit: null,
  })

  return steps
}

function HexConversionVisualization({ num, step }) {
  const decimalBits = Math.abs(num).toString(2).padStart(16, '0')
  const hexResult = step?.result || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)' }}>Number: {num}</div>

      {/* Binary representation */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Binary Representation</div>
        <div style={{
          padding: 12,
          backgroundColor: 'var(--surface2)',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 13,
          color: 'var(--border)',
          wordBreak: 'break-all',
          border: '2px solid var(--border)',
        }}>
          {step?.binary ? step.binary.split('').map((bit, idx) => (
            <span
              key={idx}
              style={{
                display: 'inline-block',
                padding: '4px 6px',
                backgroundColor: step.remainder !== null && idx >= step.binary.length - 4 ? '#dbeafe' : 'transparent',
                borderRadius: 3,
                margin: '2px',
              }}
            >
              {bit}
            </span>
          )) : decimalBits}
        </div>
      </div>

      {/* Current operation */}
      {step?.remainder !== null && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Current Extraction</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: 'var(--surface)', borderRadius: 4, border: '1px solid #f59e0b' }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>Last 4 Bits</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f', fontFamily: 'monospace' }}>
                {step.remainder.toString(2).padStart(4, '0')}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: 'var(--surface)', borderRadius: 4, border: '1px solid #f59e0b' }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>Decimal</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f' }}>{step.remainder}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
              <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Hex Digit</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#027bba', fontFamily: 'monospace' }}>{step.digit}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hex digit table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Hex Digit Mapping</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{
                padding: 8,
                backgroundColor: step?.digit === HEX_CHARS[i] ? '#dbeafe' : 'var(--surface2)',
                borderRadius: 4,
                textAlign: 'center',
                fontSize: 11,
                border: step?.digit === HEX_CHARS[i] ? '2px solid #0284c7' : '1px solid var(--border)',
              }}
            >
              <div style={{ color: 'var(--text-muted)', fontSize: 9 }}>{i}</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--surface2)' }}>{HEX_CHARS[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Hexadecimal Result</div>
        <div style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          borderRadius: 6,
          border: '2px solid #0284c7',
          fontFamily: 'monospace',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#026da5',
          textAlign: 'center',
          letterSpacing: 2,
        }}>
          {hexResult || '(building...)'}
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem405Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [numInput, setNumInput] = useState(String(EXAMPLES[0]?.num ?? 0));
  const { num, inputError } = useMemo(() => {
    try {
      const parsedNum = Number(numInput); if (isNaN(parsedNum)) throw new Error('num must be a number');
      return { num: parsedNum, inputError: '' };
    } catch (e) {
      return { num: EXAMPLES[exIdx]?.num ?? '', inputError: e.message };
    }
  }, [numInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(num).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setNumInput(String(EXAMPLES[i].num)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔢 Hex Conversion', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #8b5cf6' : '1px solid var(--border)',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#ede9fe' : 'var(--surface2)',
                    color: exIdx === idx ? '#6d28d9' : 'var(--border)',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <HexConversionVisualization num={num} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"num","label":"num","type":"number"}]}
          values={{ num: numInput }}
          onChange={(k, v) => { if (k === 'num') setNumInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
