import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './BestTimeBuySellStockCooldownVisualizer.css'

const PATTERNS = ['init', 'process', 'done']

const LINE_PATTERN_MAP = {
  8: 'init',
  10: 'process',
  12: 'done'
}

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
    phase: 'init',
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
      phase: 'process',
      activeLine: 10,
      i,
      prices,
      hold: [...hold],
      sold: [...sold],
      message: `Day ${i}: Price = ${prices[i]}. hold[${i}] = ${hold[i]}, sold[${i}] = ${sold[i]}. (${action})`,
    })
  }

  steps.push({
    phase: 'done',
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
  const [inputText, setInputText] = useState(JSON.stringify(EXAMPLES[1].prices))
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { ex, inputError } = useMemo(() => { try { const prices = JSON.parse(inputText); if (!Array.isArray(prices) || prices.some(price => !Number.isFinite(Number(price)) || Number(price) < 0)) throw new Error('Enter a JSON array of non-negative prices.'); return { ex: { prices: prices.map(Number) }, inputError: '' } } catch (error) { return { ex: EXAMPLES[1], inputError: error.message } } }, [inputText])
  const steps = useMemo(
    () => generateSteps(ex.prices).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    setInputText(JSON.stringify(EXAMPLES[idx].prices))
    handleReset()
  }, [handleReset])

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map((e, i) => (
          <button
            key={i}
            onClick={() => applyExample(i)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontSize: 12,
              backgroundColor: exIdx === i ? '#dbeafe' : 'var(--surface2)',
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {step && (
        <>
          <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
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
                    color: i === step.i ? '#fff' : 'var(--surface2)',
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
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'input', title: 'Input' },
      { id: 'viz', title: '📈 DP State', dockMode: 'split-bottom' },
      { id: 'code', title: 'Code', dockMode: 'split-right' },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'prices', label: 'Prices (JSON)', type: 'array' }]} values={{ prices: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES.map(example => ({ ...example, input: example.prices }))} activeLabel={null} applyExample={(example) => { setInputText(JSON.stringify(example.input)); handleReset() }} inputError={inputError} />, panelDivs.input)}
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
            prevDisabled={stepIndex <= 0}
            nextDisabled={isDone}
            resetDisabled={stepIndex < 0}
            onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
