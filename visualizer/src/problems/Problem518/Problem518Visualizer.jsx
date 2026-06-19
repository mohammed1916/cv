import { useState, useMemo } from 'react'
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
import { getExamples } from '../../config/examplesRegistry'
import './Problem518Visualizer.css'

const EXAMPLES = getExamples('coin-change-2') || [
  { label: 'Example 1', amount: 5, coins: [1,2,5] },
  { label: 'Example 2', amount: 3, coins: [10] },
]

function generateSteps(amount, coins) {
  const steps = []
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1

  steps.push({
    activeLine: 1,
    amount,
    coins,
    dp: [...dp],
    message: `Find number of ways to make amount ${amount}`,
    phase: 'Initialize'
  })

  for (let coin of coins) {
    steps.push({
      activeLine: 2,
      amount,
      coins,
      dp: [...dp],
      currentCoin: coin,
      message: `Processing coin: ${coin}`,
      phase: 'Coin Selection'
    })

    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin]
      steps.push({
        activeLine: 3,
        amount,
        coins,
        dp: [...dp],
        currentCoin: coin,
        currentAmount: i,
        message: `dp[${i}] += dp[${i - coin}] = ${dp[i]}`,
        phase: 'DP Update'
      })
    }
  }

  steps.push({
    activeLine: 4,
    amount,
    coins,
    dp,
    result: dp[amount],
    done: true,
    message: `Number of ways to make ${amount}: ${dp[amount]}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ amount, coins, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef08a', borderRadius: 6, borderLeft: '4px solid '#eab308' }}>
        <div style={{ fontSize: 12, color: '#713f12', fontStyle: 'italic' }}>DP: Find number of combinations to make the amount.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 4, border: '1px solid '#fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#78350f' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid '#fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f' }}>Coins: {coins.join(', ')} | Target: {amount}</div>
      </motion.div>

      {step?.currentCoin && (
        <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, border: '1px solid '#fca5a5' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Current Coin: {step.currentCoin}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Array(3).fill(0).map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: '#fecaca',
                  border: '2px solid '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#7f1d1d'
                }}
              >
                {step.currentCoin}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.dp && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid '#7dd3fc', overflowX: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>DP Array (ways to make each amount)</div>
          <div style={{ display: 'flex', gap: 2 }}>
            {step.dp.map((ways, i) => (
              <motion.div
                key={i}
                style={{
                  minWidth: 40,
                  padding: '8px 4px',
                  backgroundColor: step?.currentAmount === i ? '#60a5fa' : ways > 0 ? '#e0f2fe' : '#f0f9ff',
                  borderRadius: 4,
                  border: step?.currentAmount === i ? '2px solid '#0284c7' : '1px solid '#7dd3fc',
                  textAlign: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  color: step?.currentAmount === i ? 'white' : '#0c4a6e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                animate={{ backgroundColor: step?.currentAmount === i ? '#60a5fa' : ways > 0 ? '#e0f2fe' : '#f0f9ff' }}
              >
                <div>{ways}</div>
                <div style={{ fontSize: 8, opacity: 0.7 }}>{i}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid '#10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Ways to make {amount}: {step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem518Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('coin-change-2')
  const steps = useMemo(() => generateSteps(ex.amount, ex.coins).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🪙 Coin Change 2', content: (<VisualizationPanel amount={ex.amount} coins={ex.coins} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
