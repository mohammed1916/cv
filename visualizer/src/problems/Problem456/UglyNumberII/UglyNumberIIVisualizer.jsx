import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './UglyNumberIIVisualizer.css'

const EXAMPLES = getExamples('ugly-number-ii')

function generateSteps(n) {
  const steps = []
  const dp = [1]
  let i2 = 0, i3 = 0, i5 = 0

  steps.push({
    activeLine: 1,
    dp: [...dp],
    i2,
    i3,
    i5,
    next2: null,
    next3: null,
    next5: null,
    nextUgly: null,
    message: 'Initialize: dp=[1], three pointers at 0'
  })

  while (dp.length < n) {
    const next2 = dp[i2] * 2
    const next3 = dp[i3] * 3
    const next5 = dp[i5] * 5

    steps.push({
      activeLine: 3,
      dp: [...dp],
      i2,
      i3,
      i5,
      next2,
      next3,
      next5,
      nextUgly: null,
      message: `Calculate candidates: dp[${i2}]*2=${next2}, dp[${i3}]*3=${next3}, dp[${i5}]*5=${next5}`
    })

    const nextUgly = Math.min(next2, next3, next5)

    steps.push({
      activeLine: 4,
      dp: [...dp],
      i2,
      i3,
      i5,
      next2,
      next3,
      next5,
      nextUgly,
      message: `Minimum is ${nextUgly}`
    })

    dp.push(nextUgly)

    steps.push({
      activeLine: 5,
      dp: [...dp],
      i2,
      i3,
      i5,
      next2,
      next3,
      next5,
      nextUgly,
      message: `Append ${nextUgly} to dp`
    })

    if (next2 === nextUgly) i2++
    if (next3 === nextUgly) i3++
    if (next5 === nextUgly) i5++

    steps.push({
      activeLine: 6,
      dp: [...dp],
      i2,
      i3,
      i5,
      next2,
      next3,
      next5,
      nextUgly,
      message: `Update pointers: i2=${i2}, i3=${i3}, i5=${i5}`
    })
  }

  steps.push({
    activeLine: 7,
    dp: [...dp],
    i2,
    i3,
    i5,
    next2: null,
    next3: null,
    next5: null,
    nextUgly: null,
    done: true,
    message: `Found ${n}th ugly number: ${dp[n - 1]}`
  })

  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          "Numbers that can only be divided by 2, 3, or 5 are called ugly numbers. Find the nth ugly number! Use dynamic programming with three pointers to efficiently generate the sequence."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target */}
      <div style={{
        padding: 12,
        backgroundColor: '#f0f9ff',
        borderRadius: 6,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 11, color: '#0c4a6e' }}>Finding the</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7' }}>{n}th</div>
        <div style={{ fontSize: 11, color: '#0c4a6e' }}>ugly number</div>
      </div>

      {/* DP Array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          DP Array (Ugly Numbers Generated)
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          maxHeight: 120,
          overflowY: 'auto',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          alignContent: 'flex-start'
        }}>
          {step?.dp?.map((num, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: idx === step?.dp.length - 1 ? '#dcfce7' : '#e0e7ff',
                borderColor: idx === step?.dp.length - 1 ? '#22c55e' : '#818cf8',
                color: idx === step?.dp.length - 1 ? '#16a34a' : '#3730a3'
              }}
              animate={{ scale: idx === step?.dp.length - 1 ? 1.1 : 1 }}
            >
              [{idx}] {num}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pointers */}
      {step && (step.next2 !== null || step.next3 !== null || step.next5 !== null) && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f8f4ff',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 12 }}>
            Three Pointer Strategy
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            {/* i2 */}
            <div style={{
              padding: 10,
              backgroundColor: '#dbeafe',
              borderRadius: 4,
              border: '2px solid #0284c7'
            }}>
              <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>i2 = {step?.i2}</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#0c4a6e', marginTop: 4 }}>
                {step?.dp?.[step?.i2]} × 2
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
                = {step?.next2}
              </div>
            </div>

            {/* i3 */}
            <div style={{
              padding: 10,
              backgroundColor: '#fcd34d22',
              borderRadius: 4,
              border: '2px solid #f59e0b'
            }}>
              <div style={{ fontSize: 11, color: '#b45309', fontWeight: 600 }}>i3 = {step?.i3}</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#92400e', marginTop: 4 }}>
                {step?.dp?.[step?.i3]} × 3
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                = {step?.next3}
              </div>
            </div>

            {/* i5 */}
            <div style={{
              padding: 10,
              backgroundColor: '#ef444422',
              borderRadius: 4,
              border: '2px solid #ef4444'
            }}>
              <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>i5 = {step?.i5}</div>
              <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#7f1d1d', marginTop: 4 }}>
                {step?.dp?.[step?.i5]} × 5
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                = {step?.next5}
              </div>
            </div>
          </div>

          {step?.nextUgly !== null && (
            <div style={{
              padding: 10,
              backgroundColor: '#d1fae5',
              borderRadius: 4,
              border: '2px solid #10b981',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>Next Ugly Number</div>
              <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                min({step?.next2}, {step?.next3}, {step?.next5}) = {step?.nextUgly}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#b45309', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#92400e' }}>
          Generated {step?.dp?.length || 1} / {n} ugly numbers
        </div>
        <div style={{ fontSize: 12, color: '#92400e', marginTop: 8 }}>
          {step?.message || ''}
        </div>
        {step?.done && (
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f59e0b', marginTop: 12 }}>
            Answer: {step?.dp?.[n - 1]}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function UglyNumberIIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 10 })

  const steps = useMemo(
    () =>
      generateSteps(ex.n).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🔢 Ugly Numbers',
      content: (
        <VisualizationPanel
          n={ex.n}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
