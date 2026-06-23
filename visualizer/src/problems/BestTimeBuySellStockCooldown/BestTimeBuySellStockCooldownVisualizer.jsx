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

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def maxProfit(prices):' },
  { line: 2, text: '    n = len(prices)' },
  { line: 3, text: '    if n <= 1: return 0' },
  { line: 4, text: '    # hold[i]: max profit if holding at day i' },
  { line: 5, text: '    # sold[i]: max profit if sold at day i' },
  { line: 6, text: '    hold = [0] * n' },
  { line: 7, text: '    sold = [0] * n' },
  { line: 8, text: '    hold[0] = -prices[0]' },
  { line: 9, text: '    for i in range(1, n):' },
  { line: 10, text: '        hold[i] = max(hold[i-1], sold[i-2] - prices[i])' },
  { line: 11, text: '        sold[i] = max(sold[i-1], hold[i-1] + prices[i])' },
  { line: 12, text: '    return sold[-1]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(prices) {
  const steps = []
  const n = prices.length
  if (n <= 1) return steps

  const hold = Array(n).fill(0)
  const sold = Array(n).fill(0)
  hold[0] = -prices[0]

  steps.push({
    activeLine: 8,
    i: 0,
    prices,
    hold: [...hold],
    sold: [...sold],
    message: `Day 0: Buy at ${prices[0]}. hold[0] = ${hold[0]}.`,
  })

  for (let i = 1; i < n; i++) {
    hold[i] = Math.max(hold[i - 1], (sold[i - 2] ?? 0) - prices[i])
    sold[i] = Math.max(sold[i - 1], hold[i - 1] + prices[i])

    const action = hold[i] !== hold[i - 1] ? 'BUY' : sold[i] !== sold[i - 1] ? 'SELL' : 'HOLD'
    steps.push({
      activeLine: 10,
      i,
      prices,
      hold: [...hold],
      sold: [...sold],
      message: `Day ${i}: Price = ${prices[i]}. hold[${i}] = ${hold[i]}, sold[${i}] = ${sold[i]}. (${action})`,
    })
  }

  steps.push({
    activeLine: 12,
    i: n - 1,
    prices,
    hold: [...hold],
    sold: [...sold],
    message: `Max profit with cooldown = ${sold[n - 1]}.`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Ex1', prices: [3, 3] },
  { label: 'Ex2', prices: [3, 2, 6, 5, 0, 3] },
  { label: 'Ex3', prices: [1, 2, 3, 0, 2] },
]

export default function BestTimeBuySellStockCooldownVisualizer() {
  const [exIdx, setExIdx] = useState(1)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.prices), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
      title: '📈 DP State',
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
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {ex.prices.map((price, i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: i === step.i ? 1.2 : 1, y: i === step.i ? -4 : 0 }}
                      style={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: i === step.i ? '#0ea5e9' : '#dbeafe',
                        border: '1px solid #0ea5e9',
                        borderRadius: 4,
                        fontWeight: 'bold',
                        color: i === step.i ? '#fff' : '#1e293b',
                      }}
                    >
                      {price}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#991b1b' }}>hold (bought)</div>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {step.hold.map((val, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: i === step.i ? '#fca5a5' : '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: '#991b1b',
                        }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#15803d' }}>sold</div>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {step.sold.map((val, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: i === step.i ? '#86efac' : '#dcfce7',
                          border: '1px solid #86efac',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 'bold',
                          color: '#15803d',
                        }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, ex.prices])

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
