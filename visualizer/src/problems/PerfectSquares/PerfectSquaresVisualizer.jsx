import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './PerfectSquares.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def numSquares(n):' },
  { line: 2, text: '    dp = [float("inf")] * (n + 1)' },
  { line: 3, text: '    dp[0] = 0' },
  { line: 4, text: '    for i in range(1, n + 1):' },
  { line: 5, text: '        j = 1' },
  { line: 6, text: '        while j * j <= i:' },
  { line: 7, text: '            dp[i] = min(dp[i], dp[i - j*j] + 1)' },
  { line: 8, text: '            j += 1' },
  { line: 9, text: '    return dp[n]' },
]

function generateSteps(n) {
  const steps = []
  const dp = new Array(n + 1).fill(Infinity)
  dp[0] = 0

  // Initial state
  steps.push({
    activeLine: 2,
    dp: [...dp],
    currentIdx: 0,
    currentSquare: 0,
    message: `Initialize dp array of size ${n + 1}, dp[0] = 0 (base case).`,
  })

  // Main DP loop
  for (let i = 1; i <= n; i++) {
    let j = 1
    const dpStepStart = [...dp]

    steps.push({
      activeLine: 4,
      dp: dpStepStart,
      currentIdx: i,
      currentSquare: 0,
      message: `Processing position i = ${i}: try all perfect squares ≤ ${i}.`,
    })

    while (j * j <= i) {
      const square = j * j
      const newDpValue = dp[i - square] + 1

      if (newDpValue < dp[i]) {
        dp[i] = newDpValue
        steps.push({
          activeLine: 7,
          dp: [...dp],
          currentIdx: i,
          currentSquare: square,
          previousIdx: i - square,
          message: `At i=${i}, j=${j}: dp[${i}] = min(dp[${i}], dp[${i - square}] + 1) = ${dp[i]} (found ${square}).`,
        })
      } else {
        steps.push({
          activeLine: 6,
          dp: [...dp],
          currentIdx: i,
          currentSquare: square,
          previousIdx: i - square,
          message: `At i=${i}, j=${j}: dp[${i}] remains ${dp[i]} (${square} not better).`,
        })
      }

      j++
    }
  }

  steps.push({
    activeLine: 9,
    dp: [...dp],
    currentIdx: n,
    currentSquare: 0,
    message: `Complete! Minimum perfect squares for ${n} = ${dp[n]}.`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'n = 7', value: 7 },
  { label: 'n = 12', value: 12 },
  { label: 'n = 15', value: 15 },
]

export default function PerfectSquaresVisualizer() {
  const [n, setN] = useState(7)
  const SOLUTION_CODE_HOOK = useSolutionCode('perfect-squares')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const steps = useMemo(() => generateSteps(n), [n])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((value) => {
    setN(value)
    handleReset()
  }, [handleReset])

  const perfectSquares = []
  for (let i = 1; i * i <= n; i++) {
    perfectSquares.push(i * i)
  }

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
      title: '🔢 DP Array Visualization',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e) => (
              <button
                key={e.value}
                onClick={() => applyExample(e.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: n === e.value ? '#dbeafe' : '#f1f5f9',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 8, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 11 }}>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>Perfect Squares ≤ {n}:</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {perfectSquares.map((sq) => (
                <span
                  key={sq}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dbeafe',
                    border: '1px solid #0ea5e9',
                    borderRadius: 3,
                    color: '#1e40af',
                    fontWeight: 600,
                  }}
                >
                  {sq}
                </span>
              ))}
            </div>
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>{step.message}</div>
              </div>

              <div style={{ fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>DP Array:</div>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {step.dp.map((val, i) => {
                    const isCurrent = i === step.currentIdx
                    const isPrevious = i === step.previousIdx
                    const height = val === Infinity ? 20 : Math.max(20, val * 15)
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          scale: isCurrent ? 1.2 : 1,
                          opacity: isCurrent ? 1 : 0.7,
                        }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: height,
                            backgroundColor: isCurrent ? '#ef4444' : isPrevious ? '#3b82f6' : '#d1d5db',
                            borderRadius: 2,
                            border: isCurrent ? '2px solid #dc2626' : '1px solid #9ca3af',
                          }}
                        />
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isCurrent ? '#ef4444' : '#1e293b',
                          }}
                        >
                          {i}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: isCurrent ? '#ef4444' : '#1e293b',
                            height: 14,
                          }}
                        >
                          {val === Infinity ? '∞' : val}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {step.currentSquare > 0 && (
                <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>Current Operation:</div>
                  <div style={{ color: '#1e40af' }}>
                    Trying square: <strong>{step.currentSquare}</strong>
                  </div>
                  <div style={{ color: '#1e40af', marginTop: 4 }}>
                    dp[{step.currentIdx}] = min(dp[{step.currentIdx}], dp[{step.previousIdx}] + 1)
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, n, connectivity, setActiveLineDom, perfectSquares, applyExample])

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
