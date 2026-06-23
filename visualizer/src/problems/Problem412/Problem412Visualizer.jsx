import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem412Visualizer.css'

const EXAMPLES = [
  { label: 'Small', n: 3, expected: ['1', '2', 'Fizz'] },
  { label: 'Medium', n: 5, expected: ['1', '2', 'Fizz', '4', 'Buzz'] },
  { label: 'Large', n: 15, expected: ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz'] },
]

function generateSteps(n) {
  const steps = []

  if (n <= 0) {
    steps.push({
      activeLine: 1,
      message: 'n <= 0. Return empty result.',
      phase: 'done',
      result: [],
      current: null,
      currentNum: 0,
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Generate FizzBuzz sequence for n=${n}`,
    phase: 'init',
    result: [],
    current: null,
    currentNum: 0,
    n,
  })

  const result = []

  for (let i = 1; i <= n; i++) {
    steps.push({
      activeLine: 2,
      message: `Process i=${i}. Check divisibility.`,
      phase: 'check_i',
      result: [...result],
      current: null,
      currentNum: i,
      n,
      i,
    })

    let val = ''
    const div3 = i % 3 === 0
    const div5 = i % 5 === 0

    steps.push({
      activeLine: 3,
      message: `i=${i}: divisible by 3? ${div3}, divisible by 5? ${div5}`,
      phase: 'check_div',
      result: [...result],
      current: null,
      currentNum: i,
      div3,
      div5,
      n,
      i,
    })

    if (div3 && div5) {
      val = 'FizzBuzz'

      steps.push({
        activeLine: 4,
        message: `i=${i} is divisible by both 3 and 5. Append "FizzBuzz".`,
        phase: 'fizzbuzz',
        result: [...result, 'FizzBuzz'],
        current: 'FizzBuzz',
        currentNum: i,
        n,
        i,
      })
    } else if (div3) {
      val = 'Fizz'

      steps.push({
        activeLine: 5,
        message: `i=${i} is divisible by 3. Append "Fizz".`,
        phase: 'fizz',
        result: [...result, 'Fizz'],
        current: 'Fizz',
        currentNum: i,
        n,
        i,
      })
    } else if (div5) {
      val = 'Buzz'

      steps.push({
        activeLine: 6,
        message: `i=${i} is divisible by 5. Append "Buzz".`,
        phase: 'buzz',
        result: [...result, 'Buzz'],
        current: 'Buzz',
        currentNum: i,
        n,
        i,
      })
    } else {
      val = String(i)

      steps.push({
        activeLine: 7,
        message: `i=${i} is not divisible by 3 or 5. Append "${i}".`,
        phase: 'number',
        result: [...result, String(i)],
        current: String(i),
        currentNum: i,
        n,
        i,
      })
    }

    result.push(val)
  }

  steps.push({
    activeLine: 8,
    message: `Complete. Result: [${result.join(', ')}]`,
    phase: 'done',
    result,
    current: null,
    currentNum: 0,
    n,
  })

  return steps
}

function FizzBuzzVisualization({ n, step }) {
  const result = step?.result || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>FizzBuzz Sequence</div>

      {/* Parameter */}
      <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
          n = <span style={{ fontFamily: 'monospace', color: '#1e293b' }}>{n}</span>
        </div>
      </div>

      {/* Current processing info */}
      {step?.currentNum > 0 && step.currentNum <= n && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Current: i={step.currentNum}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#065f46' }}>÷3?</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: step.div3 ? '#047857' : '#94a3b8' }}>
                {step.div3 ? '✓' : '✗'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#065f46' }}>÷5?</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: step.div5 ? '#047857' : '#94a3b8' }}>
                {step.div5 ? '✓' : '✗'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
              <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Output</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#0284c7', fontFamily: 'monospace' }}>
                "{step.current}"
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result grid */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
          Output ({result.length} items)
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
          gap: 6,
          maxHeight: 300,
          overflow: 'auto',
          padding: 12,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
        }}>
          {result.map((item, idx) => {
            const num = idx + 1
            const isFizz = item === 'Fizz'
            const isBuzz = item === 'Buzz'
            const isFizzBuzz = item === 'FizzBuzz'
            const isCurrent = step?.currentNum === num

            let bgColor = '#f1f5f9'
            let borderColor = '#cbd5e1'
            let textColor = '#334155'

            if (isFizzBuzz) {
              bgColor = '#fce7f3'
              borderColor = '#be185d'
              textColor = '#be185d'
            } else if (isFizz) {
              bgColor = '#dbeafe'
              borderColor = '#0284c7'
              textColor = '#0284c7'
            } else if (isBuzz) {
              bgColor = '#fef3c7'
              borderColor = '#f59e0b'
              textColor = '#f59e0b'
            }

            if (isCurrent) {
              bgColor = '#c7d2fe'
              borderColor = '#6366f1'
              textColor = '#4f46e5'
            }

            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 6px',
                  backgroundColor: bgColor,
                  borderRadius: 4,
                  border: `2px solid ${borderColor}`,
                  textAlign: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: textColor,
                  fontFamily: isFizz || isBuzz || isFizzBuzz ? 'inherit' : 'monospace',
                  cursor: 'default',
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  boxShadow: isCurrent ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                }}
              >
                {item}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pattern legend */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Pattern Legend</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
            <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>÷3: Fizz</div>
            <div style={{ fontSize: 11, color: '#0c4a6e' }}>3, 6, 9, 12...</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4, border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: 10, color: '#92400e', fontWeight: 600 }}>÷5: Buzz</div>
            <div style={{ fontSize: 11, color: '#92400e' }}>5, 10, 20...</div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fce7f3', borderRadius: 4, border: '2px solid #be185d', gridColumn: 'span 2' }}>
            <div style={{ fontSize: 10, color: '#831843', fontWeight: 600 }}>÷15: FizzBuzz</div>
            <div style={{ fontSize: 11, color: '#831843' }}>15, 30, 45...</div>
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem412Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

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
      title: '🎯 Fizz Buzz',
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
                    border: exIdx === idx ? '2px solid #14b8a6' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#ccfbf1' : '#f1f5f9',
                    color: exIdx === idx ? '#0f766e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label} (n={e.n})
                </button>
              ))}
            </div>
          </div>
          <FizzBuzzVisualization n={example.n} step={step} />
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
