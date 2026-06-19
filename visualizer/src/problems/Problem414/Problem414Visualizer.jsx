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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem414Visualizer.css'

const EXAMPLES = [
  { label: 'Small', nums: [3, 2, 1], expected: 1 },
  { label: 'Medium', nums: [1, 2, -2147483648], expected: -2147483648 },
  { label: 'Large', nums: [2, 1, 0, -1], expected: -1 },
]

function generateSteps(nums) {
  const steps = []

  const sorted = [...new Set(nums)].sort((a, b) => b - a)

  steps.push({
    activeLine: 1,
    message: `Find third maximum. Array: [${nums.join(', ')}]`,
    phase: 'init',
    result: null,
    first: null,
    second: null,
    third: null,
    distinct: sorted,
    nums,
  })

  let first = null, second = null, third = null

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 2,
      message: `Process nums[${i}]=${num}`,
      phase: 'process',
      result: third !== null ? third : (second !== null ? second : (first !== null ? first : null)),
      first,
      second,
      third,
      currentNum: num,
      distinct: sorted,
      nums,
    })

    if (first === null || num > first) {
      third = second
      second = first
      first = num

      steps.push({
        activeLine: 3,
        message: `${num} is new max. Shift: third=${third}, second=${second}, first=${first}`,
        phase: 'update_first',
        result: third !== null ? third : (second !== null ? second : (first !== null ? first : null)),
        first,
        second,
        third,
        currentNum: num,
        distinct: sorted,
        nums,
      })
    } else if (second === null || num > second) {
      third = second
      second = num

      steps.push({
        activeLine: 4,
        message: `${num} is new second max. Shift: third=${third}, second=${second}`,
        phase: 'update_second',
        result: third !== null ? third : (second !== null ? second : (first !== null ? first : null)),
        first,
        second,
        third,
        currentNum: num,
        distinct: sorted,
        nums,
      })
    } else if (third === null || (num < second && num > third)) {
      third = num

      steps.push({
        activeLine: 5,
        message: `${num} is new third max. third=${third}`,
        phase: 'update_third',
        result: third !== null ? third : (second !== null ? second : (first !== null ? first : null)),
        first,
        second,
        third,
        currentNum: num,
        distinct: sorted,
        nums,
      })
    }
  }

  const result = third !== null ? third : (second !== null ? second : first)

  steps.push({
    activeLine: 6,
    message: `Complete. Third max (or max if <3 distinct): ${result}`,
    phase: 'done',
    result,
    first,
    second,
    third,
    distinct: sorted,
    nums,
  })

  return steps
}

function ThirdMaxVisualization({ nums, step }) {
  const result = step?.result ?? null
  const first = step?.first
  const second = step?.second
  const third = step?.third

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Third Maximum Number</div>

      {/* Input array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Input Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((val, idx) => {
            const isCurrent = val === step?.currentNum
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isCurrent ? '#c7d2fe' : '#f1f5f9',
                  borderRadius: 6,
                  border: `2px solid ${isCurrent ? '#6366f1' : '#cbd5e1'}`,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: isCurrent ? '#4f46e5' : '#334155',
                  minWidth: 50,
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  boxShadow: isCurrent ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Ranking display */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Current Rankings</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{
            padding: 12,
            backgroundColor: first !== null ? '#dbeafe' : '#f1f5f9',
            borderRadius: 6,
            border: `2px solid ${first !== null ? '#0284c7' : '#cbd5e1'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: first !== null ? '#0c4a6e' : '#64748b' }}>1st Max</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: first !== null ? '#0284c7' : '#cbd5e1', fontFamily: 'monospace', marginTop: 6 }}>
              {first !== null ? first : '—'}
            </div>
          </div>
          <div style={{
            padding: 12,
            backgroundColor: second !== null ? '#fef3c7' : '#f1f5f9',
            borderRadius: 6,
            border: `2px solid ${second !== null ? '#f59e0b' : '#cbd5e1'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: second !== null ? '#92400e' : '#64748b' }}>2nd Max</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: second !== null ? '#f59e0b' : '#cbd5e1', fontFamily: 'monospace', marginTop: 6 }}>
              {second !== null ? second : '—'}
            </div>
          </div>
          <div style={{
            padding: 12,
            backgroundColor: third !== null ? '#f0fdf4' : '#f1f5f9',
            borderRadius: 6,
            border: `2px solid ${third !== null ? '#10b981' : '#cbd5e1'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: third !== null ? '#065f46' : '#64748b' }}>3rd Max</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: third !== null ? '#10b981' : '#cbd5e1', fontFamily: 'monospace', marginTop: 6 }}>
              {third !== null ? third : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Distinct values */}
      {step?.distinct && step.distinct.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Distinct Values (Sorted)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.distinct.map((val, idx) => (
              <div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, border: '2px solid #be185d' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#831843', marginBottom: 4 }}>Result</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#be185d', fontFamily: 'monospace' }}>
          {result !== null ? result : '—'}
        </div>
        {step?.distinct && step.distinct.length < 3 && (
          <div style={{ fontSize: 11, color: '#831843', marginTop: 6 }}>
            Fewer than 3 distinct values. Returning maximum.
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem414Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]
  const SOLUTION_CODE = useSolutionCode('third-maximum-number')

  const steps = useMemo(
    () =>
      generateSteps(example.nums).map((current) => ({
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
      title: '🎯 Third Maximum',
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
                    border: exIdx === idx ? '2px solid #6366f1' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#e0e7ff' : '#f1f5f9',
                    color: exIdx === idx ? '#3730a3' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <ThirdMaxVisualization nums={example.nums} step={step} />
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
