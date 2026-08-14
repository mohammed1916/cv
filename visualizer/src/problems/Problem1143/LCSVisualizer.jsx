import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './LCSVisualizer.css'

const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'def longestCommonSubsequence(text1, text2):' },
    { line: 2, text: '    m, n = len(text1), len(text2)' },
    { line: 3, text: '    dp = [[0]*(n+1) for _ in range(m+1)]' },
    { line: 4, text: '    for i in range(1, m+1):' },
    { line: 5, text: '        for j in range(1, n+1):' },
    { line: 6, text: '            if text1[i-1] == text2[j-1]:' },
    { line: 7, text: '                dp[i][j] = dp[i-1][j-1] + 1' },
    { line: 8, text: '            else:' },
    { line: 9, text: '                dp[i][j] = max(dp[i-1][j], dp[i][j-1])' },
    { line: 10, text: '    return dp[m][n]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(text1, text2) {
    const m = text1.length
    const n = text2.length
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
    const steps = []

    steps.push({
        phase: 'init', activeLine: 3, dpRef: dp,
        activeI: -1, activeJ: -1, match: null, message: 'DP table initialised (all zeros)',
    })

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const isMatch = text1[i - 1] === text2[j - 1]
            steps.push({
                phase: 'compare', activeLine: 6, dpRef: dp,
                activeI: i, activeJ: j, match: isMatch,
                message: `Compare text1[${i - 1}]='${text1[i - 1]}' vs text2[${j - 1}]='${text2[j - 1]}' → ${isMatch ? 'MATCH' : 'no match'}`,
            })
            if (isMatch) {
                dp[i][j] = dp[i - 1][j - 1] + 1
                steps.push({
                    phase: 'match', activeLine: 7, dpRef: dp,
                    activeI: i, activeJ: j, match: true,
                    message: `Match! dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
                })
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
                steps.push({
                    phase: 'no-match', activeLine: 9, dpRef: dp,
                    activeI: i, activeJ: j, match: false,
                    message: `No match. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}`,
                })
            }
        }
    }

    steps.push({
        phase: 'done', activeLine: 10, dpRef: dp,
        activeI: m, activeJ: n, match: null,
        message: `LCS length = dp[${m}][${n}] = ${dp[m][n]}`,
    })

    return steps
}

const EXAMPLES = getExamples('lcs')

const MAX_LEN = 10

// 2-D DP Table Panel Component
function DPTablePanel({ EXAMPLES, t1, t2, dp, step, stepIndex, steps, CELL, applyExample, handleReset, setText1, setText2, MAX_LEN, text1, text2 }) {
    return (
        <div className="lcs-body">
            <div className="lcs-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="lcs-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <div className="lcs-inputs">
                <label>text1 <input className="lcs-input" value={text1} onChange={(e) => { setText1(e.target.value.slice(0, MAX_LEN)); handleReset() }} /></label>
                <label>text2 <input className="lcs-input" value={text2} onChange={(e) => { setText2(e.target.value.slice(0, MAX_LEN)); handleReset() }} /></label>
            </div>
            <div className="lcs-table-wrap">
                <table className="lcs-table" style={{ '--cell': CELL + 'px' }}>
                    <thead>
                        <tr>
                            <th />
                            <th className="lcs-th-label">ε</th>
                            {t2.split('').map((c, j) => (
                                <th key={j} className={`lcs-th-label ${step?.activeJ === j + 1 ? 'active-col' : ''}`}>{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dp.map((row, i) => (
                            <tr key={i}>
                                <td className={`lcs-th-label ${step?.activeI === i ? 'active-row' : ''}`}>
                                    {i === 0 ? 'ε' : t1[i - 1]}
                                </td>
                                {row.map((val, j) => {
                                    const isActive = step?.activeI === i && step?.activeJ === j
                                    const isMatch = isActive && step?.match
                                    const isNoMatch = isActive && step?.match === false
                                    return (
                                        <motion.td
                                            key={j}
                                            className={`lcs-cell ${isActive ? 'active' : ''} ${isMatch ? 'match' : ''} ${isNoMatch ? 'no-match' : ''}`}
                                            animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                                        >
                                            {val}
                                        </motion.td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Current Cell Info Panel Component
function CurrentCellPanel({ step, t1, t2, dp }) {
    return (
        <div className="lcs-body">
            <div className="lcs-info-row"><span className="lcs-label">i</span><strong className="lcs-val">{step?.activeI ?? '—'}</strong></div>
            <div className="lcs-info-row"><span className="lcs-label">j</span><strong className="lcs-val">{step?.activeJ ?? '—'}</strong></div>
            <div className="lcs-info-row">
                <span className="lcs-label">chars</span>
                <strong className={`lcs-val ${step?.match === true ? 'match-ok' : step?.match === false ? 'match-fail' : ''}`}>
                    {step && step.activeI > 0 && step.activeJ > 0
                        ? `'${t1[step.activeI - 1]}' vs '${t2[step.activeJ - 1]}'`
                        : '—'}
                </strong>
            </div>
            <div className="lcs-info-row">
                <span className="lcs-label">dp[i][j]</span>
                <strong className="lcs-val accent">
                    {step && step.activeI >= 0 && step.activeJ >= 0
                        ? dp[step.activeI]?.[step.activeJ] ?? '—'
                        : '—'}
                </strong>
            </div>
            <div className={`lcs-result ${step?.phase === 'done' ? 'done' : ''}`}>
                {step?.phase === 'done' ? `LCS = ${dp[t1.length][t2.length]}` : 'Computing…'}
            </div>
        </div>
    )
}

export default function LCSVisualizer() {
    const [text1, setText1] = useState('abcde')
    const [text2, setText2] = useState('ace')

    const t1 = text1.slice(0, MAX_LEN)
    const t2 = text2.slice(0, MAX_LEN)

    const steps = useMemo(() => generateSteps(t1, t2), [t1, t2])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const applyExample = useCallback((ex) => {
        setText1(ex.t1)
        setText2(ex.t2)
        handleReset()
    }, [handleReset])

    const dp = step?.dpRef ?? Array.from({ length: t1.length + 1 }, () => Array(t2.length + 1).fill(0))

    const CELL = useMemo(() => {
      return Math.min(44, Math.floor(380 / (t2.length + 2)))
    }, [t2.length])

    const tablePanel = (
        <DPTablePanel EXAMPLES={EXAMPLES} t1={t1} t2={t2} dp={dp} step={step} stepIndex={stepIndex} steps={steps} CELL={CELL} applyExample={applyExample} handleReset={handleReset} setText1={setText1} setText2={setText2} MAX_LEN={MAX_LEN} text1={text1} text2={text2} />
    )

    const cellInfoPanel = (
        <CurrentCellPanel step={step} t1={t1} t2={t2} dp={dp} />
    )

    const codePanel = (
        <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
        />
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(() => [
        { id: 'table', title: '2-D DP Table' },
        { id: 'cell-info', title: 'Current Cell', dockMode: 'split-right' },
        { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
    ], [])
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="problem-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.table && createPortal(tablePanel, panelDivs.table)}
                    {panelDivs['cell-info'] && createPortal(cellInfoPanel, panelDivs['cell-info'])}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}

            {createPortal(
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
                        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                        showPatternOverlay={showPatternOverlay}
                        onShowPatternOverlayChange={setShowPatternOverlay}
                        patternOverlayLabel="Show pattern overlay"
                        showPatternOverlayToggle
                        autoScroll={autoScrollCode}
                        onAutoScrollChange={setAutoScrollCode}
                        autoScrollLabel="Auto-scroll code"
                        showAutoScroll
                    />
                </FloatingPanel>,
                document.body
            )}

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
