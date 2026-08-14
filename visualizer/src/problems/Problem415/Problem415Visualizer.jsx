import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem415Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('add-strings')

const PATTERNS = ['compute', 'done', 'get_digits', 'init', 'process']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'process',
  3: 'get_digits',
  4: 'compute',
  5: 'done'
}


const EXAMPLES = [
  { label: 'Small', num1: "11", num2: "123", expected: "134" },
  { label: 'Medium', num1: "456", num2: "77", expected: "533" },
  { label: 'Large', num1: "999", num2: "111", expected: "1110" },
]

function generateSteps(num1, num2) {
  const steps = []

  steps.push({
    activeLine: 1,
    message: `Add strings: "${num1}" + "${num2}"`,
    phase: 'init',
    result: '',
    carry: 0,
    num1,
    num2,
  })

  let result = ''
  let carry = 0
  let i = num1.length - 1
  let j = num2.length - 1

  while (i >= 0 || j >= 0 || carry > 0) {
    steps.push({
      activeLine: 2,
      message: `Process position i=${i}, j=${j}`,
      phase: 'process',
      result,
      carry,
      currentI: i,
      currentJ: j,
      num1,
      num2,
    })

    const digit1 = i >= 0 ? parseInt(num1[i]) : 0
    const digit2 = j >= 0 ? parseInt(num2[j]) : 0

    steps.push({
      activeLine: 3,
      message: `Digits: num1[${i}]=${digit1}, num2[${j}]=${digit2}, carry=${carry}`,
      phase: 'get_digits',
      result,
      carry,
      digit1,
      digit2,
      currentI: i,
      currentJ: j,
      num1,
      num2,
    })

    const sum = digit1 + digit2 + carry
    const resultDigit = sum % 10
    carry = Math.floor(sum / 10)

    steps.push({
      activeLine: 4,
      message: `Sum: ${digit1} + ${digit2} + ${step => step.carry} = ${sum}. Result digit: ${resultDigit}, new carry: ${carry}`,
      phase: 'compute',
      result: resultDigit + result,
      carry,
      digit1,
      digit2,
      sum,
      resultDigit,
      currentI: i,
      currentJ: j,
      num1,
      num2,
    })

    result = resultDigit + result
    i--
    j--
  }

  steps.push({
    activeLine: 5,
    message: `Complete. Sum: "${result}"`,
    phase: 'done',
    result,
    carry: 0,
    num1,
    num2,
  })

  return steps
}

function AddStringsVisualization({ num1, num2, step }) {
  const result = step?.result || ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>String Addition</div>

      {/* Input numbers */}
      <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Inputs</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, fontFamily: 'monospace' }}>
          <div style={{ color: '#1e293b' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>num1:</span> {num1}
          </div>
          <div style={{ color: '#1e293b' }}>
            <span style={{ fontWeight: 600, color: '#64748b' }}>num2:</span> {num2}
          </div>
        </div>
      </div>

      {/* Digit visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Processing</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>num1 digits</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {num1.split('').map((d, idx) => {
                const globalIdx = idx
                const isCurrent = step?.currentI === num1.length - 1 - globalIdx
                return (
                  <motion.div
                    key={idx}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: isCurrent ? '#c7d2fe' : '#f1f5f9',
                      borderRadius: 4,
                      border: `2px solid ${isCurrent ? '#6366f1' : '#cbd5e1'}`,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isCurrent ? '#4f46e5' : '#334155',
                      minWidth: 36,
                    }}
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                    }}
                  >
                    {d}
                  </motion.div>
                )
              })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>num2 digits</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {num2.split('').map((d, idx) => {
                const globalIdx = idx
                const isCurrent = step?.currentJ === num2.length - 1 - globalIdx
                return (
                  <motion.div
                    key={idx}
                    style={{
                      padding: '6px 8px',
                      backgroundColor: isCurrent ? '#c7d2fe' : '#f1f5f9',
                      borderRadius: 4,
                      border: `2px solid ${isCurrent ? '#6366f1' : '#cbd5e1'}`,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: isCurrent ? '#4f46e5' : '#334155',
                      minWidth: 36,
                    }}
                    animate={{
                      scale: isCurrent ? 1.15 : 1,
                    }}
                  >
                    {d}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current calculation */}
      {step?.digit1 !== undefined && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Current Calculation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>d1</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.digit1}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>d2</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.digit2}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>c</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.carry}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>=</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.sum}</div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fef3c7', borderRadius: 4, border: '2px solid #f59e0b' }}>
              <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600 }}>digit</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.resultDigit}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Result</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7', fontFamily: 'monospace' }}>
          "{result}"
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem415Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [num1Input, setNum1Input] = useState(JSON.stringify(EXAMPLES[0]?.num1 ?? []));
  const [num2Input, setNum2Input] = useState("");
  const { num1, num2, inputError } = useMemo(() => {
    try {
      const parsedNum1 = JSON.parse(num1Input); if (!Array.isArray(parsedNum1)) throw new Error('num1 must be an array');
      const parsedNum2 = JSON.parse(num2Input); if (!Array.isArray(parsedNum2)) throw new Error('num2 must be an array');
      return { num1: parsedNum1, num2: parsedNum2, inputError: '' };
    } catch (e) {
      return { num1: EXAMPLES[exIdx]?.num1 ?? '', num2: EXAMPLES[exIdx]?.num2 ?? '', inputError: e.message };
    }
  }, [num1Input, num2Input]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(num1, num2).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setNum1Input(JSON.stringify(EXAMPLES[i].num1)); setNum2Input(JSON.stringify(EXAMPLES[i].num2)); handleReset(); }, [handleReset]);

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
      title: '🎯 Add Strings',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #ec4899' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fce7f3' : '#f1f5f9',
                    color: exIdx === idx ? '#831843' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <AddStringsVisualization num1={num1} num2={num2} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

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
      
    </div>
  )
}
