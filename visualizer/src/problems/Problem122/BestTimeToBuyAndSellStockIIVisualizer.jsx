import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './BestTimeToBuyAndSellStockIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('best-time-to-buy-and-sell-stock-ii', [
  { label: 'Example 1', prices: [7, 1, 5, 3, 6, 4] },
  { label: 'Example 2', prices: [1, 2, 3, 4, 5] },
  { label: 'Example 3', prices: [7, 6, 4, 3, 1] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def maxProfit(prices):' },
  { line: 2, text: '    profit = 0' },
  { line: 3, text: '    for i in range(1, len(prices)):' },
  { line: 4, text: '        if prices[i] > prices[i-1]:' },
  { line: 5, text: '            profit += prices[i] - prices[i-1]' },
  { line: 6, text: '    return profit' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(prices) {
  const steps = []

  if (!prices || prices.length < 2) {
    steps.push({
      activeLine: 1,
      prices,
      profit: 0,
      message: 'Need at least 2 prices',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    prices,
    profit: 0,
    message: `Maximize profit by capturing all upward movements`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    prices,
    profit: 0,
    message: 'Initialize profit = 0',
    relatedLines: [2],
  })

  let profit = 0
  const transactions = []

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1]

    steps.push({
      activeLine: 3,
      prices,
      currentIdx: i,
      profit,
      message: `Compare prices[${i}]=${prices[i]} vs prices[${i - 1}]=${prices[i - 1]}`,
      relatedLines: [3],
    })

    if (prices[i] > prices[i - 1]) {
      const gain = prices[i] - prices[i - 1]
      profit += gain
      transactions.push({ buy: i - 1, sell: i, gain })

      steps.push({
        activeLine: 5,
        prices,
        currentIdx: i,
        profit,
        transactions: [...transactions],
        gain,
        message: `✓ Upward! profit += ${gain} = ${profit}`,
        relatedLines: [5],
      })
    } else {
      steps.push({
        activeLine: 4,
        prices,
        currentIdx: i,
        profit,
        message: `✗ Down or flat, skip`,
        relatedLines: [4],
      })
    }
  }

  steps.push({
    activeLine: 6,
    prices,
    profit,
    transactions,
    done: true,
    message: `Final profit: ${profit} from ${transactions.length} transaction(s)`,
    relatedLines: [6],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#627794' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Greedy approach: capture every upward price movement as a profit transaction.
        </div>
      </div>

      {step.prices && step.prices.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Price Chart
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 120, borderBottom: '1px solid #0c4a6e' }}>
            {step.prices.map((price, idx) => {
              const maxPrice = Math.max(...step.prices)
              const height = (price / maxPrice) * 100
              const isUpward = step.currentIdx === idx && idx > 0 && step.prices[idx] > step.prices[idx - 1]

              return (
                <motion.div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    backgroundColor: isUpward ? '#10b981' : step.currentIdx === idx ? '#f59e0b' : '#cbd5e1',
                    borderRadius: '4px 4px 0 0',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#757575',
                  }}
                  animate={{ scale: step.currentIdx === idx ? 1.1 : 1 }}
                >
                  {price}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
          Profit: {step.profit}
        </div>
        {step.transactions && step.transactions.length > 0 && (
          <div style={{ fontSize: 11, color: '#5b21b6', fontFamily: 'monospace' }}>
            {step.transactions.map((t, i) => (
              <div key={i}>
                Buy @{step.prices[t.buy]} → Sell @{step.prices[t.sell]} : +{t.gain}
              </div>
            ))}
          </div>
        )}
      </div>

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function BestTimeToBuyAndSellStockIIVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","prices":[7,1,5,3,6,4]});
  const [pricesInput, setPricesInput] = useState("[7,1,5,3,6,4]");
  const { prices, inputError } = useMemo(() => {
    try {
      const parsedPrices = JSON.parse(pricesInput); if (!Array.isArray(parsedPrices)) throw new Error('prices must be an array');
      return { prices: parsedPrices, inputError: '' };
    } catch (e) {
      return { prices: [7,1,5,3,6,4], inputError: e.message };
    }
  }, [pricesInput]);  const steps = useMemo(
    () =>
      generateSteps(prices).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [prices]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setPricesInput(JSON.stringify(e.prices)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // ─── Step 2: Extract panels into consts ────────────────────────────────────
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const primaryPanel = <>
    <ManualInputPanel
      fields={[{"key":"prices","label":"prices","type":"array"}]}
      values={{ prices: pricesInput }}
      onChange={(k, v) => { if (k === 'prices') setPricesInput(v); handleReset() }}
      examples={EXAMPLES}
      applyExample={applyEx}
      inputError={inputError}
    />
    <VisualizationPanel step={step} />
  </>

  const statusPanel = (
    <div style={{ padding: 12, backgroundColor: '#1e293b', color: '#94a3b8', fontSize: 12, height: '100%', display: 'flex', alignItems: 'center', overflow: 'auto' }}>
      {step?.message || 'Ready'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  // ─── Step 3: Add state + config ────────────────────────────────────────────
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '📈 Max Profit', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // ─── Step 4: Replace return block ──────────────────────────────────────────
  return (
    <div className="btbass2-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
