import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ComplexNumberMultiplicationVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def complexNumberMultiply(self, num1: str, num2: str) -> str:' },
  { line: 3, text: '        a, b = map(int, num1.replace("i", "").split("+"))' },
  { line: 4, text: '        c, d = map(int, num2.replace("i", "").split("+"))' },
  { line: 5, text: '        ' },
  { line: 6, text: '        real = a * c - b * d' },
  { line: 7, text: '        imag = a * d + b * c' },
  { line: 8, text: '        ' },
  { line: 9, text: '        return f"{real}+{imag}i"' },
]

const PATTERNS = ['init', 'parse', 'calc_real', 'calc_imag', 'done']
const LINE_PATTERN_MAP = {
  3: 'parse',
  4: 'parse',
  6: 'calc_real',
  7: 'calc_imag',
  9: 'done',
}

function generateSteps(num1Str, num2Str) {
  const steps = []

  if (!num1Str || !num2Str) {
    steps.push({
      phase: 'done',
      activeLine: 9,
      relatedLines: [9],
      message: 'Invalid input.',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 2,
    relatedLines: [2],
    message: `Multiply ${num1Str} and ${num2Str} using FOIL formula.`,
  })

  // Parse the input
  let a, b, c, d
  try {
    const parts1 = num1Str.replace('i', '').split('+')
    a = parseInt(parts1[0], 10)
    b = parseInt(parts1[1], 10)

    const parts2 = num2Str.replace('i', '').split('+')
    c = parseInt(parts2[0], 10)
    d = parseInt(parts2[1], 10)
  } catch {
    steps.push({
      phase: 'done',
      activeLine: 3,
      relatedLines: [3, 4],
      message: 'Parse error.',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'parse',
    activeLine: 4,
    relatedLines: [3, 4],
    message: `Parse: num1 = ${a}+${b}i, num2 = ${c}+${d}i`,
    a,
    b,
    c,
    d,
  })

  // Calculate real part: ac - bd
  const real = a * c - b * d
  steps.push({
    phase: 'calc_real',
    activeLine: 6,
    relatedLines: [6],
    message: `Real part: (${a})(${c}) - (${b})(${d}) = ${a * c} - ${b * d} = ${real}`,
    a,
    b,
    c,
    d,
    real,
  })

  // Calculate imaginary part: ad + bc
  const imag = a * d + b * c
  steps.push({
    phase: 'calc_imag',
    activeLine: 7,
    relatedLines: [7],
    message: `Imaginary part: (${a})(${d}) + (${b})(${c}) = ${a * d} + ${b * c} = ${imag}`,
    a,
    b,
    c,
    d,
    real,
    imag,
  })

  // Final result
  const result = `${real}+${imag}i`
  steps.push({
    phase: 'done',
    activeLine: 9,
    relatedLines: [9],
    message: `Result: ${result}`,
    real,
    imag,
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ num1, num2, step, applyExample, examples }) {
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
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>num1</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#38bdf8',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {num1}
          </div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>num2</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#38bdf8',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {num2}
          </div>
        </div>
      </div>

      {step?.phase === 'parse' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Parsed Values</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
            <div>a = {step.a}</div>
            <div>b = {step.b}</div>
            <div>c = {step.c}</div>
            <div>d = {step.d}</div>
          </div>
        </div>
      )}

      {step?.phase === 'calc_real' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Real Part</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', marginBottom: 6 }}>
            <span style={{ color: '#22c55e' }}>{step.a * step.c}</span>
            {' '}- <span style={{ color: '#22c55e' }}>{step.b * step.d}</span>
            {' '}= <span style={{ color: '#f59e0b', fontWeight: 600 }}>{step.real}</span>
          </div>
        </div>
      )}

      {step?.phase === 'calc_imag' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Imaginary Part</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', marginBottom: 6 }}>
            <span style={{ color: '#22c55e' }}>{step.a * step.d}</span>
            {' '} + <span style={{ color: '#22c55e' }}>{step.b * step.c}</span>
            {' '}= <span style={{ color: '#f59e0b', fontWeight: 600 }}>{step.imag}</span>
          </div>
        </div>
      )}

      {step?.result && (
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
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e', fontFamily: 'monospace' }}>
            {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ComplexNumberMultiplicationVisualizer() {
  const examples = useMemo(() => getExamples('complex-number-multiplication') || [], [])
  const [num1, setNum1] = useState('1+1i')
  const [num2, setNum2] = useState('1+1i')

  const steps = useMemo(() => generateSteps(num1, num2), [num1, num2])

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
      setNum1(ex.num1)
      setNum2(ex.num2)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
          </div>
        ),
      },
      {
        id: 'viz',
        title: '✖ Complex Multiplication',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  value={num1}
                  onChange={(e) => {
                    setNum1(e.target.value)
                    handleReset()
                  }}
                  placeholder="1+1i"
                  style={{
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
                <input
                  type="text"
                  value={num2}
                  onChange={(e) => {
                    setNum2(e.target.value)
                    handleReset()
                  }}
                  placeholder="1+1i"
                  style={{
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
            <VisualizationPanel num1={num1} num2={num2} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, num1, num2, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
