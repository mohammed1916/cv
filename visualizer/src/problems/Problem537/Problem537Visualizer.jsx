import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem537Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def complexNumberMultiply(a, b):' },
  { line: 2, text: '    a_real, a_imag = map(int, a.replace("i","").split("+"))' },
  { line: 3, text: '    b_real, b_imag = map(int, b.replace("i","").split("+"))' },
  { line: 4, text: '    real = a_real * b_real - a_imag * b_imag' },
  { line: 5, text: '    imag = a_real * b_imag + a_imag * b_real' },
  { line: 6, text: '    return f"{real}+{imag}i"' },
]

function generateSteps(a, b) {
  const steps = []

  steps.push({
    activeLine: 1,
    a,
    b,
    message: `Multiply complex numbers: (${a}) * (${b})`,
  })

  // Parse first number
  const a_parts = a.replace('i', '').split('+')
  const a_real = parseInt(a_parts[0])
  const a_imag = parseInt(a_parts[1])

  steps.push({
    activeLine: 2,
    a,
    b,
    a_real,
    a_imag,
    message: `Parse first: ${a_real} + ${a_imag}i`,
  })

  // Parse second number
  const b_parts = b.replace('i', '').split('+')
  const b_real = parseInt(b_parts[0])
  const b_imag = parseInt(b_parts[1])

  steps.push({
    activeLine: 3,
    a,
    b,
    a_real,
    a_imag,
    b_real,
    b_imag,
    message: `Parse second: ${b_real} + ${b_imag}i`,
  })

  const real = a_real * b_real - a_imag * b_imag
  const imag = a_real * b_imag + a_imag * b_real

  steps.push({
    activeLine: 4,
    a,
    b,
    a_real,
    a_imag,
    b_real,
    b_imag,
    real,
    imag,
    message: `Real: ${a_real}*${b_real} - ${a_imag}*${b_imag} = ${real}`,
  })

  steps.push({
    activeLine: 5,
    a,
    b,
    a_real,
    a_imag,
    b_real,
    b_imag,
    real,
    imag,
    message: `Imag: ${a_real}*${b_imag} + ${a_imag}*${b_real} = ${imag}`,
  })

  const result = `${real}+${imag}i`

  steps.push({
    activeLine: 6,
    a,
    b,
    a_real,
    a_imag,
    b_real,
    b_imag,
    real,
    imag,
    result,
    message: `Result: ${result}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', a: '1+1i', b: '1+1i' },
  { label: 'Example 2', a: '1+-1i', b: '1+-1i' },
]

export default function Problem537Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.a, ex.b), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '✖️ Complex Number Multiplication',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Input numbers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>First</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', fontFamily: 'monospace' }}>
                        {step.a}
                      </div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Second</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', fontFamily: 'monospace' }}>
                        {step.b}
                      </div>
                    </div>
                  </div>

                  {/* Parsed values */}
                  {step.a_real !== undefined && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>a_real</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.a_real}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>a_imag</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.a_imag}</div>
                      </div>
                      {step.b_real !== undefined && (
                        <>
                          <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                            <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>b_real</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.b_real}</div>
                          </div>
                          <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                            <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>b_imag</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.b_imag}</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Result */}
                  {step.result && (
                    <motion.div
                      animate={{ scale: 1.02 }}
                      style={{
                        padding: 8,
                        backgroundColor: '#dcfce7',
                        border: '1px solid #10b981',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Result: {step.result}
                    </motion.div>
                  )}
              </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
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
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
