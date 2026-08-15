import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './CoinChange2Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['init', 'loop']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop'
}


const EXAMPLES = getExamples('coin-change-2')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def change(amount, coins):' },
  { line: 2, text: '    dp = [0] * (amount + 1)' },
  { line: 3, text: '    dp[0] = 1' },
  { line: 4, text: '    for coin in coins:' },
  { line: 5, text: '        for amt in range(coin, amount + 1):' },
  { line: 6, text: '            dp[amt] += dp[amt - coin]' },
  { line: 7, text: '    return dp[amount]' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(amount, coins) {
  const steps = []

  steps.push({
    activeLine: 1,
    amount,
    coins: [...coins],
    dp: new Array(amount + 1).fill(0),
    coinIdx: -1,
    amountIdx: -1,
    message: `Find combinations to make ${amount} using coins [${coins.join(', ')}]`,
    relatedLines: [1]
  })

  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1

  steps.push({
    activeLine: 2,
    amount,
    coins: [...coins],
    dp: [...dp],
    coinIdx: -1,
    amountIdx: 0,
    message: 'Base case: 1 way to make 0 (use no coins)',
    relatedLines: [2]
  })

  for (let coin of coins) {
    const coinIdx = coins.indexOf(coin)

    steps.push({
      activeLine: 3,
      amount,
      coins,
      dp: [...dp],
      coinIdx,
      amountIdx: -1,
      message: `Process coin ${coin}`,
      relatedLines: [3]
    })

    for (let i = coin; i <= amount; i++) {
      const oldVal = dp[i]
      dp[i] += dp[i - coin]

      steps.push({
        activeLine: 4,
        amount,
        coins,
        dp: [...dp],
        coinIdx,
        amountIdx: i,
        message: `dp[${i}] = ${oldVal} + dp[${i - coin}] = ${dp[i]}`,
        relatedLines: [4]
      })
    }
  }

  steps.push({
    activeLine: 5,
    amount,
    coins,
    dp,
    done: true,
    result: dp[amount],
    message: `Total combinations: ${dp[amount]}`,
    relatedLines: [5]
  })

  return steps
}

function VisualizationPanel({ amount, coins, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Count different combinations that add up to the target amount using the given coin denominations."
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

      {/* Coins */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Coins: {coins.join(', ')}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {coins.map((coin, idx) => {
            const isActive = step && idx === step.coinIdx
            return (
              <motion.div
                key={`coin-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                  borderColor: isActive ? '#0284c7' : '#cbd5e1',
                  color: isActive ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                ${coin}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* DP Array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>DP Array</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', overflowX: 'auto', paddingBottom: 8 }}>
          {step?.dp?.map((val, idx) => {
            const isActive = step && idx === step.amountIdx && step.amountIdx !== -1
            return (
              <motion.div
                key={`dp-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  minWidth: 60,
                  textAlign: 'center',
                  backgroundColor: isActive ? '#dbeafe' : '#f1f5f9',
                  borderColor: isActive ? '#0284c7' : '#cbd5e1',
                  color: isActive ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 11, color: '#6b7280' }}>dp({idx})</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{val}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Combinations</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function CoinChange2Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [amountInput, setAmountInput] = useState(5);
  const [coinsInput, setCoinsInput] = useState("[1,2,5]");
  const { amount, coins, inputError } = useMemo(() => {
    try {
      const parsedAmount = Number(amountInput); if (isNaN(parsedAmount)) throw new Error('amount must be a number');
      const parsedCoins = JSON.parse(coinsInput); if (!Array.isArray(parsedCoins)) throw new Error('coins must be an array');
      return { amount: parsedAmount, coins: parsedCoins, inputError: '' };
    } catch (e) {
      return { amount: 5, coins: "[1,2,5]", inputError: e.message };
    }
  }, [amountInput, coinsInput]);

  const steps = useMemo(
    () =>
      generateSteps(amount, coins).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [amount, coins]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setAmountInput(String(e.amount)); setCoinsInput(JSON.stringify(e.coins)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const codePanel = (
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
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"amount","label":"amount","type":"number"},{"key":"coins","label":"coins","type":"array"}]}
        values={{ amount: amountInput, coins: coinsInput }}
        onChange={(k, v) => { if (k === 'amount') setAmountInput(v); if (k === 'coins') setCoinsInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <VisualizationPanel
      amount={amount}
      coins={coins}
      step={step}
      applyEx={applyEx}
    />
  
    </>)

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code' },
      { id: 'viz', title: '$ Coin Change 2', dockMode: 'split-right' },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
            prevDisabled={stepIndex < 0}
            nextDisabled={isDone}
            resetDisabled={stepIndex < 0}
            onSpeedChange={e => setSpeed(Number(e.target.value))}
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
          />
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
