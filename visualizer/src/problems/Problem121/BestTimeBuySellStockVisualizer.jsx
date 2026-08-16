import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './BestTimeBuySellStockVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def maxProfit(self, prices: List[int]) -> int:' },
    { line: 3, text: '        minPrice = float("inf")' },
    { line: 4, text: '        maxProfit = 0' },
    { line: 5, text: '        for price in prices:' },
    { line: 6, text: '            if price < minPrice:' },
    { line: 7, text: '                minPrice = price' },
    { line: 8, text: '            elif price - minPrice > maxProfit:' },
    { line: 9, text: '                maxProfit = price - minPrice' },
    { line: 10, text: '        return maxProfit' },
]

function generateSteps(prices) {
    const steps = []
    const n = prices.length

    if (n < 2) {
        steps.push({
            phase: 'done', activeLine: 10, prices, i: -1,
            minPrice: Infinity, maxProfit: 0, minIdx: -1, sellIdx: -1,
            bestBuy: -1, bestSell: -1,
            message: 'Need at least 2 prices.',
        })
        return steps
    }

    let minPrice = Infinity
    let maxProfit = 0
    let minIdx = -1
    let bestBuy = -1
    let bestSell = -1

    steps.push({
        phase: 'init', activeLine: 3, prices, i: -1,
        minPrice, maxProfit, minIdx, sellIdx: -1,
        bestBuy, bestSell,
        message: 'Initialize minPrice = ∞, maxProfit = 0.',
    })

    for (let i = 0; i < n; i++) {
        const price = prices[i]

        steps.push({
            phase: 'scan', activeLine: 5, prices, i,
            minPrice, maxProfit, minIdx, sellIdx: -1,
            bestBuy, bestSell,
            message: `Visit prices[${i}] = ${price}.`,
        })

        if (price < minPrice) {
            minPrice = price
            minIdx = i
            steps.push({
                phase: 'new_min', activeLine: 7, prices, i,
                minPrice, maxProfit, minIdx, sellIdx: -1,
                bestBuy, bestSell,
                message: `New minimum! minPrice = ${price} at index ${i}.`,
            })
        } else {
            const profit = price - minPrice
            steps.push({
                phase: 'calc', activeLine: 8, prices, i,
                minPrice, maxProfit, minIdx, sellIdx: i,
                bestBuy, bestSell,
                profit,
                message: `profit if sell here = ${price} - ${minPrice} = ${profit}.`,
            })

            if (profit > maxProfit) {
                maxProfit = profit
                bestBuy = minIdx
                bestSell = i
                steps.push({
                    phase: 'new_max', activeLine: 9, prices, i,
                    minPrice, maxProfit, minIdx, sellIdx: i,
                    bestBuy, bestSell,
                    profit,
                    message: `New best profit! Buy at ${minIdx} (${minPrice}), sell at ${i} (${price}) = ${profit}.`,
                })
            }
        }
    }

    steps.push({
        phase: 'done', activeLine: 10, prices, i: n,
        minPrice, maxProfit, minIdx, sellIdx: -1,
        bestBuy, bestSell,
        message: `Done. Max profit = ${maxProfit}${bestBuy >= 0 ? ` (buy day ${bestBuy}, sell day ${bestSell})` : ''}.`,
    })

    return steps
}

const EXAMPLES = getExamples('best-time-buy-sell-stock')

export default function BestTimeBuySellStockVisualizer() {
    const [pricesInput, setPricesInput] = useState('[7,1,5,3,6,4]')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { prices, inputError } = useMemo(() => {
        try {
            const p = JSON.parse(pricesInput)
            if (!Array.isArray(p) || !p.every(Number.isFinite)) throw new Error('Must be array of numbers')
            if (p.length > 16) throw new Error('Max 16 prices for clarity')
            return { prices: p, inputError: '' }
        } catch (e) {
            return { prices: [7, 1, 5, 3, 6, 4], inputError: e.message || 'Invalid input' }
        }
    }, [pricesInput])

    const steps = useMemo(
        () => generateSteps(prices).map((current) => ({
            ...current,
            relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
        })),
        [prices],
    )

    const {
        stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
        handleReset, isPlaying, speed, setSpeed, isDone,
    } = usePlaybackState(steps.length)

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setPricesInput(JSON.stringify(ex.prices))
        handleReset()
    }, [handleReset])

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        onStepJump: setStepIndex,
    })

    const displayPrices = step?.prices ?? prices
    const maxVal = Math.max(...displayPrices, 1)
    const minPrice = step?.minPrice ?? Infinity
    const maxProfit = step?.maxProfit ?? 0
    const currI = step?.i ?? -1
    const bestBuy = step?.bestBuy ?? -1
    const bestSell = step?.bestSell ?? -1
    const sellIdx = step?.sellIdx ?? -1
    const minIdx = step?.minIdx ?? -1

    const barH = (val) => Math.max(4, (val / maxVal) * 160)

    // Step 3: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"prices","label":"prices","type":"array"}]}
        values={{ prices: pricesInput }}
        onChange={(k, v) => { if (k === 'prices') setPricesInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

        <section className="btbs-panel">
            <header className="btbs-head">
                <span>Best Time to Buy and Sell Stock · Greedy One Pass</span>
                {inputError && <span className="btbs-error">{inputError}</span>}
            </header>
            <div className="btbs-body">
                <div className="btbs-top-row">
                    <div className="btbs-examples">
                        {EXAMPLES.map((ex) => (
                            <button key={ex.label} className="btbs-chip" onClick={() => applyExample(ex)}>
                                {ex.label}
                            </button>
                        ))}
                    </div>
                    <input
                        className="btbs-input"
                        value={pricesInput}
                        onChange={(e) => { setPricesInput(e.target.value); handleReset() }}
                        placeholder="[7,1,5,3,6,4]"
                    />
                </div>

                {/* Stats bar */}
                <div className="btbs-stats">
                    <div className="btbs-stat">
                        <span className="btbs-stat-label">minPrice</span>
                        <span className="btbs-stat-val mono">{minPrice === Infinity ? '∞' : minPrice}</span>
                    </div>
                    <div className="btbs-stat">
                        <span className="btbs-stat-label">maxProfit</span>
                        <span className={`btbs-stat-val mono${maxProfit > 0 ? ' profit' : ''}`}>{maxProfit}</span>
                    </div>
                    {bestBuy >= 0 && (
                        <div className="btbs-stat best">
                            <span className="btbs-stat-label">best trade</span>
                            <span className="btbs-stat-val mono">
                                buy [{bestBuy}]={prices[bestBuy]} → sell [{bestSell}]={prices[bestSell]}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bar chart */}
                <div className="btbs-chart">
                    {displayPrices.map((price, idx) => {
                        const isCurr = currI === idx
                        const isMinIdx = minIdx === idx
                        const isSellIdx = sellIdx === idx
                        const isBestBuy = step?.phase === 'done' && bestBuy === idx
                        const isBestSell = step?.phase === 'done' && bestSell === idx
                        const h = barH(price)
                        return (
                            <div key={idx} className="btbs-bar-wrap">
                                <span className="btbs-price-label mono">{price}</span>
                                <motion.div
                                    className={`btbs-bar${isCurr ? ' curr' : ''}${isMinIdx && !isCurr ? ' minbar' : ''}${isSellIdx ? ' sellbar' : ''}${isBestBuy ? ' bestbuy' : ''}${isBestSell ? ' bestsell' : ''}`}
                                    animate={{ height: h, scale: isCurr ? 1.1 : 1 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                                />
                                <span className="btbs-day">{idx}</span>
                                <div className="btbs-bar-ptrs">
                                    {isMinIdx && <span className="btbs-ptr buy-ptr">buy</span>}
                                    {isSellIdx && <span className="btbs-ptr sell-ptr">sell?</span>}
                                    {isBestBuy && <span className="btbs-ptr bestbuy-ptr">BUY★</span>}
                                    {isBestSell && <span className="btbs-ptr bestsell-ptr">SELL★</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Profit line annotation */}
                {step?.profit != null && (
                    <div className={`btbs-profit-box${step.phase === 'new_max' ? ' improved' : ''}`}>
                        <span>prices[{currI}] − minPrice = {prices[currI]} − {minPrice} =</span>
                        <span className={`btbs-profit-num${step.profit > 0 ? ' pos' : ''}`}>{step.profit}</span>
                        {step.profit > maxProfit && <span className="btbs-new-best">← new best!</span>}
                    </div>
                )}
            </div>
        </section>
    
    </>)

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
            {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} />}
        </div>
    )

    const statusPanel = (
        <div className={`btbs-status${step?.phase === 'done' ? (maxProfit > 0 ? ' ok' : ' zero') : ''}`}>
            {step?.message ?? 'Press Play or Step to begin.'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && <PatternLegend />}
            <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward}
                onReset={handleReset} prevDisabled={stepIndex < 0}
                nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    )

    // Step 4: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Best Time to Buy and Sell Stock', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 5: Replace return with portals
    return (
        <div className="btbs-shell">
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
