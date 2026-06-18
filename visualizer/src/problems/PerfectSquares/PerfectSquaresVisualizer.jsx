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
import { getExamples } from '../../config/examplesRegistry'
import './PerfectSquares.css'

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def numSquares(self, n: int) -> int:' },
    { line: 3, text: '        dp = [float("inf")] * (n + 1)' },
    { line: 4, text: '        dp[0] = 0' },
    { line: 5, text: '        ' },
    { line: 6, text: '        for i in range(1, n + 1):' },
    { line: 7, text: '            for sq in range(1, int(i**0.5) + 1):' },
    { line: 8, text: '                sq_val = sq * sq' },
    { line: 9, text: '                dp[i] = min(dp[i], dp[i - sq_val] + 1)' },
    { line: 10, text: '' },
    { line: 11, text: '        return dp[n]' },
]

const INF = Infinity

function generateSteps(n) {
    const steps = []

    if (n <= 0) {
        steps.push({
            phase: 'done', activeLine: 11, n, dp: [0],
            activeI: -1, activeSq: -1, sqVal: -1, result: 0,
            message: 'n is 0. Return 0.',
        })
        return steps
    }

    const dp = Array(n + 1).fill(INF)
    dp[0] = 0

    steps.push({
        phase: 'init', activeLine: 4, n, dp: [...dp],
        activeI: -1, activeSq: -1, sqVal: -1, result: null,
        message: 'Initialize dp[0] = 0; all other entries = ∞.',
    })

    for (let i = 1; i <= n; i++) {
        steps.push({
            phase: 'outer', activeLine: 6, n, dp: [...dp],
            activeI: i, activeSq: -1, sqVal: -1, result: null,
            message: `Compute dp[${i}] — minimum perfect squares that sum to ${i}.`,
        })

        const maxSq = Math.floor(Math.sqrt(i))

        for (let sq = 1; sq <= maxSq; sq++) {
            const sqVal = sq * sq

            steps.push({
                phase: 'sq_calc', activeLine: 8, n, dp: [...dp],
                activeI: i, activeSq: sq, sqVal, result: null,
                message: `Try perfect square: sq = ${sq}, sq² = ${sqVal}.`,
            })

            const prev = dp[i - sqVal]
            const candidate = prev === INF ? INF : prev + 1
            const before = dp[i]

            if (candidate < before) {
                dp[i] = candidate
            }

            steps.push({
                phase: 'update', activeLine: 9, n, dp: [...dp],
                activeI: i, activeSq: sq, sqVal, result: null,
                improved: candidate < before,
                message: `dp[${i}] = min(${before === INF ? '∞' : before}, dp[${i - sqVal}]+1) = min(${before === INF ? '∞' : before}, ${prev === INF ? '∞' : prev}+1) = ${dp[i] === INF ? '∞' : dp[i]}.`,
            })
        }
    }

    steps.push({
        phase: 'done', activeLine: 11, n, dp: [...dp],
        activeI: n, activeSq: -1, sqVal: -1, result: dp[n],
        message: `Final answer: dp[${n}] = ${dp[n]}. Minimum ${dp[n]} perfect squares sum to ${n}.`,
    })

    return steps
}

const EXAMPLES = getExamples('perfect-squares')

export default function PerfectSquaresVisualizer() {
    const [nInput, setNInput] = useState('7')

    const { n, inputError } = useMemo(() => {
        try {
            const num = Number(nInput)
            if (!Number.isInteger(num) || num < 0) throw new Error('n must be a non-negative integer')
            if (num > 100) throw new Error('Max n=100 for clarity')
            return { n: num, inputError: '' }
        } catch (e) {
            return { n: 7, inputError: e.message || 'Invalid input' }
        }
    }, [nInput])

    const steps = useMemo(() => generateSteps(n), [n])

    const {
        stepIndex, stepForward, stepBack, togglePlay,
        handleReset, isPlaying, speed, setSpeed, isDone,
    } = usePlaybackState(steps.length)

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setNInput(String(ex.n))
        handleReset()
    }, [handleReset])

    const dp = step?.dp ?? Array(n + 1).fill(INF).map((_, i) => (i === 0 ? 0 : INF))
    const activeI = step?.activeI ?? -1
    const activeSq = step?.activeSq ?? -1
    const sqVal = step?.sqVal ?? -1

    const displayCount = Math.min(dp.length, 41)
    const displayDp = dp.slice(0, displayCount)

    const dockPanels = useMemo(() => [
        {
            id: 'input',
            title: 'Input & Examples',
            subtitle: inputError ? 'Fix the input to resume playback.' : 'Choose example or enter n.',
            defaultZone: 'left',
            content: (
                <div className="ps-panel-body">
                    <div className="ps-examples">
                        {EXAMPLES.map((ex) => (
                            <button key={ex.label} className="ps-chip" onClick={() => applyExample(ex)}>
                                {ex.label}
                            </button>
                        ))}
                    </div>
                    <div className="ps-inputs">
                        <label className="ps-input-label">n</label>
                        <input
                            className="ps-input"
                            value={nInput}
                            onChange={(e) => { setNInput(e.target.value); handleReset() }}
                            placeholder="7"
                        />
                    </div>
                    {inputError && <div className="ps-error-box">{inputError}</div>}
                </div>
            ),
        },
        {
            id: 'state',
            title: 'Current State',
            subtitle: step ? `i: ${activeI}, sq: ${activeSq >= 0 ? activeSq : '—'}` : 'State values update during playback.',
            defaultZone: 'left',
            content: (
                <div className="ps-panel-body">
                    <div className="ps-state-row">
                        <span className="ps-state-label">i (target)</span>
                        <span className="ps-state-val mono">{activeI >= 0 ? activeI : '—'}</span>
                    </div>
                    <div className="ps-state-row">
                        <span className="ps-state-label">sq (square root)</span>
                        <span className="ps-state-val mono">{activeSq >= 0 ? activeSq : '—'}</span>
                    </div>
                    <div className="ps-state-row">
                        <span className="ps-state-label">sq²</span>
                        <span className="ps-state-val mono">{sqVal >= 0 ? sqVal : '—'}</span>
                    </div>
                    {activeI >= 0 && sqVal >= 0 && (
                        <div className="ps-state-row highlight">
                            <span className="ps-state-label">dp[{activeI} − {sqVal}]</span>
                            <span className="ps-state-val mono">
                                {dp[activeI - sqVal] === INF ? '∞' : dp[activeI - sqVal]}
                            </span>
                        </div>
                    )}
                    <div className="ps-state-row">
                        <span className="ps-state-label">dp[{activeI >= 0 ? activeI : 'i'}]</span>
                        <span className="ps-state-val mono">{activeI >= 0 ? (dp[activeI] === INF ? '∞' : dp[activeI]) : '—'}</span>
                    </div>
                    {step?.improved && (
                        <div className="ps-improved">Improved dp[{activeI}] ↓</div>
                    )}
                </div>
            ),
        },
        {
            id: 'code',
            title: 'Solution Trace',
            subtitle: step ? `Active line ${step.activeLine}` : 'Line-by-line solution view.',
            defaultZone: 'full',
            content: (
                <CodeTracePanel
                    step={step}
                    codeLines={SOLUTION_CODE}
                    autoScroll={true}
                    onActiveLineDomChange={setActiveLineDom}
                />
            ),
        },
        {
            id: 'visualization',
            title: 'DP Array Visualization',
            subtitle: step ? step.message : 'Press Play or Step to begin.',
            defaultZone: 'full',
            content: (
                <div className="ps-panel-body ps-viz-body">
                    <div className="ps-perfect-squares-row">
                        <span className="ps-squares-label">Perfect squares available:</span>
                        {Array.from({ length: Math.floor(Math.sqrt(n)) }, (_, i) => {
                            const sq = i + 1
                            return (
                                <motion.span
                                    key={sq}
                                    className={`ps-square-chip${activeSq === sq ? ' active' : ''}`}
                                    animate={{ scale: activeSq === sq ? 1.15 : 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                >
                                    {sq}² = {sq * sq}
                                </motion.span>
                            )
                        })}
                    </div>

                    <div className="ps-dp-wrap">
                        <div className="ps-dp-array">
                            {displayDp.map((val, i) => {
                                const isActive = activeI === i
                                const isFinal = step?.phase === 'done' && i === n
                                const reachable = val !== INF
                                return (
                                    <div key={i} className="ps-dp-col">
                                        <motion.div
                                            className={`ps-dp-cell${isActive ? ' active' : ''}${isFinal ? ' final' : ''}${!reachable ? ' inf' : ''}`}
                                            animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -6 : 0 }}
                                            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                                        >
                                            {val === INF ? '∞' : val}
                                        </motion.div>
                                        <span className="ps-dp-idx">{i}</span>
                                    </div>
                                )
                            })}
                            {dp.length > displayCount && (
                                <div className="ps-dp-col">
                                    <div className="ps-dp-cell trunc">…</div>
                                    <span className="ps-dp-idx">{dp.length - 1}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {step?.phase === 'done' && (
                            <motion.div
                                className="ps-result ok"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                {n === 0 ? 'n=0, return 0.' : `Minimum ${step.result} perfect square(s) sum to ${n}.`}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ),
        },
    ], [inputError, applyExample, nInput, handleReset, step, n, dp, activeI, activeSq, sqVal, displayCount, displayDp])

    return (
        <div className="ps-shell">
            <section className="ps-hero">
                <div className="ps-hero-copy">
                    <span className="ps-kicker">Perfect Squares · Dynamic Programming</span>
                    <h2>Find minimum number of perfect squares that sum to n.</h2>
                    <p>
                        Watch how the algorithm builds a DP array, exploring all possible perfect square combinations to find the minimum count needed.
                    </p>
                </div>
            </section>

            <DockableWorkspace
                title="Perfect Squares Workspace"
                panels={dockPanels}
                initialLayout={{
                    rows: [
                        ['input', 'state'],
                        ['visualization', 'code'],
                    ],
                    minimized: [],
                }}
            />

            <FloatingPanel title="Playback Controls">
                <PlaybackControls
                    onReset={handleReset}
                    onPrev={stepBack}
                    onPlayToggle={togglePlay}
                    onNext={stepForward}
                    resetDisabled={steps.length === 0}
                    prevDisabled={stepIndex <= 0}
                    nextDisabled={steps.length === 0 || isDone}
                    isPlaying={isPlaying}
                    isDone={isDone}
                    speed={speed}
                    onSpeedChange={(event) => setSpeed(Number(event.target.value))}
                    speedIndicator={`${speed}ms`}
                    autoScroll={true}
                    onAutoScrollChange={() => {}}
                    autoScrollLabel="Auto-scroll code"
                    showAutoScroll
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
