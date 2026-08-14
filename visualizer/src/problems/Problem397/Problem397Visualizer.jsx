import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem397Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['apply', 'check', 'complete', 'init']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'check',
  6: 'check',
  11: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def integerReplacement(n: int) -> int:' },
  { line: 2, text: '    steps = 0' },
  { line: 3, text: '    while n != 1:' },
  { line: 4, text: '        if n % 2 == 0:' },
  { line: 5, text: '            n //= 2  # Even: divide by 2' },
  { line: 6, text: '        elif n == 3 or (n & 3) == 1:' },
  { line: 7, text: '            n -= 1  # Subtract 1' },
  { line: 8, text: '        else:' },
  { line: 9, text: '            n += 1  # Add 1' },
  { line: 10, text: '        steps += 1' },
  { line: 11, text: '    return steps' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n) {
  const steps = []
  let current = n
  let stepCount = 0
  const path = [current]

  steps.push({
    activeLine: 1,
    phase: 'init',
    current,
    stepCount,
    path: [...path],
    message: `Initialize. Find minimum steps to reach 1 from ${n}`,
  })

  while (current !== 1) {
    let operation = ''
    let nextValue = 0
    let nextLine = 0

    if (current % 2 === 0) {
      // Even: divide by 2
      operation = `Divide ${current} by 2`
      nextValue = current / 2
      nextLine = 5
      steps.push({
        activeLine: 4,
        phase: 'check',
        current,
        stepCount,
        path: [...path],
        isEven: true,
        message: `${current} is even. Option: divide by 2 → ${nextValue}`,
      })
    } else {
      // Odd: check which greedy choice is better
      const minusOne = current - 1
      const plusOne = current + 1

      let choice = ''
      if (current === 3) {
        choice = '-1'
        nextValue = minusOne
        nextLine = 7
        steps.push({
          activeLine: 6,
          phase: 'check',
          current,
          stepCount,
          path: [...path],
          isOdd: true,
          option1: `-1 → ${minusOne}`,
          option2: `+1 → ${plusOne}`,
          chosen: choice,
          message: `${current} is odd (and equals 3). Choose -1 → ${minusOne}`,
        })
      } else if ((current & 3) === 1) {
        // n % 4 === 1: subtract 1
        choice = '-1'
        nextValue = minusOne
        nextLine = 7
        steps.push({
          activeLine: 6,
          phase: 'check',
          current,
          stepCount,
          path: [...path],
          isOdd: true,
          option1: `-1 → ${minusOne}`,
          option2: `+1 → ${plusOne}`,
          chosen: choice,
          message: `${current} is odd (n%4==1). Choose -1 → ${minusOne}`,
        })
      } else {
        // n % 4 === 3: add 1
        choice = '+1'
        nextValue = plusOne
        nextLine = 9
        steps.push({
          activeLine: 6,
          phase: 'check',
          current,
          stepCount,
          path: [...path],
          isOdd: true,
          option1: `-1 → ${minusOne}`,
          option2: `+1 → ${plusOne}`,
          chosen: choice,
          message: `${current} is odd (n%4==3). Choose +1 → ${plusOne}`,
        })
      }

      operation = `${choice} from ${current}`
    }

    current = nextValue
    stepCount += 1
    path.push(current)

    steps.push({
      activeLine: nextLine,
      phase: 'apply',
      current,
      stepCount,
      path: [...path],
      operation,
      message: `Applied: ${operation}. Steps: ${stepCount}`,
    })
  }

  steps.push({
    activeLine: 11,
    phase: 'complete',
    current: 1,
    stepCount,
    path: [...path],
    result: stepCount,
    message: `Reached 1! Minimum steps: ${stepCount}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: n=8 (Power of 2)', n: 8 },
  { label: 'Example 2: n=7 (Tricky odd)', n: 7 },
  { label: 'Example 3: n=3 (Edge case)', n: 3 },
]

export default function Problem397Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [nInput, setNInput] = useState(String(EXAMPLES[0]?.n ?? 0));
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: EXAMPLES[exIdx]?.n ?? '', inputError: e.message };
    }
  }, [nInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(n).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNInput(String(EXAMPLES[i].n)); handleReset(); }, [handleReset]);

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
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
      title: '🎯 Integer Replacement Path',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
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
                  fontWeight: exIdx === i ? 600 : 400,
                  color: exIdx === i ? '#0c4a6e' : '#334155',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500, color: '#1e293b' }}>
                {step.message}
              </div>

              {/* Current Number Display */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.phase === 'complete' ? '#dcfce7' : '#eff6ff',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: step.phase === 'complete' ? '2px solid #10b981' : '2px solid #0284c7',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Current Number</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: step.phase === 'complete' ? '#047857' : '#0c4a6e' }}>
                    {step.current}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#fef3c7',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: '2px solid #f59e0b',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Steps Taken</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#92400e' }}>{step.stepCount}</div>
                </motion.div>
              </div>

              {/* Operation Info */}
              {step.phase === 'check' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                  }}
                >
                  {step.isEven && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                      ✓ Even number: Divide by 2 → {step.current / 2}
                    </div>
                  )}
                  {step.isOdd && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                        Odd number options:
                      </div>
                      <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
                        <div style={{
                          flex: 1,
                          padding: 8,
                          backgroundColor: step.chosen === '-1' ? '#dcfce7' : '#f1f5f9',
                          borderRadius: 4,
                          border: step.chosen === '-1' ? '2px solid #10b981' : '1px solid #cbd5e1',
                          fontWeight: 600,
                          color: step.chosen === '-1' ? '#047857' : '#334155',
                        }}>
                          {step.option1}
                        </div>
                        <div style={{
                          flex: 1,
                          padding: 8,
                          backgroundColor: step.chosen === '+1' ? '#dcfce7' : '#f1f5f9',
                          borderRadius: 4,
                          border: step.chosen === '+1' ? '2px solid #10b981' : '1px solid #cbd5e1',
                          fontWeight: 600,
                          color: step.chosen === '+1' ? '#047857' : '#334155',
                        }}>
                          {step.option2}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
                        Greedy: Choose operation leading to most divisions by 2
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Path taken */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                  Path Taken ({step.path.length} numbers)
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {step.path.map((num, idx) => (
                    <motion.div
                      key={`path-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        backgroundColor:
                          num === 1
                            ? '#dcfce7'
                            : idx === step.path.length - 1
                            ? '#dbeafe'
                            : '#f1f5f9',
                        border:
                          num === 1
                            ? '2px solid #10b981'
                            : idx === step.path.length - 1
                            ? '2px solid #0284c7'
                            : '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 600,
                        color:
                          num === 1
                            ? '#047857'
                            : idx === step.path.length - 1
                            ? '#0c4a6e'
                            : '#475569',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Algorithm explanation */}
              {step.phase === 'init' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Greedy Algorithm:</div>
                  <div style={{ lineHeight: '1.4' }}>
                    • If even: divide by 2<br/>
                    • If odd: choose +1 or -1 to maximize future divisions by 2<br/>
                    • For n=3 or n%4==1: subtract 1<br/>
                    • Otherwise: add 1
                  </div>
                </motion.div>
              )}

              {/* Completion */}
              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    padding: 14,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', marginBottom: 6 }}>
                    ✓ Reached 1 Successfully!
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>
                    Minimum Steps: {step.result}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
    </div>
  )
}
