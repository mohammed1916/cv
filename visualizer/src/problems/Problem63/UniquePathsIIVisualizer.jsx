import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './UniquePathsIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def uniquePathsWithObstacles(self, obstacleGrid: List[List[int]]) -> int:' },
    { line: 3, text: '        m, n = len(obstacleGrid), len(obstacleGrid[0])' },
    { line: 4, text: '        if obstacleGrid[0][0] == 1 or obstacleGrid[m-1][n-1] == 1:' },
    { line: 5, text: '            return 0' },
    { line: 6, text: '        dp = [[0] * n for _ in range(m)]' },
    { line: 7, text: '        dp[0][0] = 1' },
    { line: 8, text: '' },
    { line: 9, text: '        for r in range(m):' },
    { line: 10, text: '            for c in range(n):' },
    { line: 11, text: '                if obstacleGrid[r][c] == 1:' },
    { line: 12, text: '                    dp[r][c] = 0' },
    { line: 13, text: '                elif r > 0 or c > 0:' },
    { line: 14, text: '                    dp[r][c] = dp[r-1][c] + dp[r][c-1]' },
    { line: 15, text: '' },
    { line: 16, text: '        return dp[m-1][n-1]' },
]

const UNIQUEPATHSII_PATTERNS = ['blocked', 'done', 'fill', 'fill_first_col', 'fill_first_row', 'init']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'blocked',
  5: 'blocked',
  7: 'init',
  14: 'fill_first_row',
  16: 'done',
}

function generateSteps(m, n, obstacleGrid) {
    const steps = []

    // Check start and end
    if (obstacleGrid[0][0] === 1) {
        steps.push({
            phase: 'blocked',
            activeLine: 4,
            dp: [],
            r: 0,
            c: 0,
            result: 0,
            message: 'Start blocked. No paths possible.',
        })
        return steps
    }

    if (obstacleGrid[m - 1][n - 1] === 1) {
        steps.push({
            phase: 'blocked',
            activeLine: 5,
            dp: [],
            r: m - 1,
            c: n - 1,
            result: 0,
            message: 'End blocked. No paths possible.',
        })
        return steps
    }

    // Initialize dp
    const dp = Array.from({ length: m }, () => Array(n).fill(0))
    dp[0][0] = 1

    steps.push({
        phase: 'init',
        activeLine: 7,
        dp: dp.map(r => [...r]),
        r: 0,
        c: 0,
        result: null,
        message: `Initialize dp[0][0] = 1. Obstacles marked; all other cells = 0.`,
    })

    // Fill first row
    for (let c = 1; c < n; c++) {
        if (obstacleGrid[0][c] === 1) {
            dp[0][c] = 0
        } else {
            dp[0][c] = dp[0][c - 1]
        }
        steps.push({
            phase: 'fill_first_row',
            activeLine: 14,
            dp: dp.map(r => [...r]),
            r: 0,
            c,
            result: null,
            from_above: 0,
            from_left: dp[0][c - 1],
            message: `dp[0][${c}] = ${obstacleGrid[0][c] === 1 ? '0 (obstacle)' : `${dp[0][c]}`}`,
        })
    }

    // Fill first column
    for (let r = 1; r < m; r++) {
        if (obstacleGrid[r][0] === 1) {
            dp[r][0] = 0
        } else {
            dp[r][0] = dp[r - 1][0]
        }
        steps.push({
            phase: 'fill_first_col',
            activeLine: 14,
            dp: dp.map(r => [...r]),
            r,
            c: 0,
            result: null,
            from_above: dp[r - 1][0],
            from_left: 0,
            message: `dp[${r}][0] = ${obstacleGrid[r][0] === 1 ? '0 (obstacle)' : `${dp[r][0]}`}`,
        })
    }

    // Fill rest
    for (let r = 1; r < m; r++) {
        for (let c = 1; c < n; c++) {
            if (obstacleGrid[r][c] === 1) {
                dp[r][c] = 0
            } else {
                const above = dp[r - 1][c]
                const left = dp[r][c - 1]
                dp[r][c] = above + left
            }

            steps.push({
                phase: 'fill',
                activeLine: 14,
                dp: dp.map(r => [...r]),
                r,
                c,
                result: null,
                from_above: dp[r - 1][c],
                from_left: dp[r][c - 1],
                message: obstacleGrid[r][c] === 1
                    ? `dp[${r}][${c}] = 0 (obstacle)`
                    : `dp[${r}][${c}] = dp[${r - 1}][${c}](${dp[r - 1][c]}) + dp[${r}][${c - 1}](${dp[r][c - 1]}) = ${dp[r][c]}`,
            })
        }
    }

    steps.push({
        phase: 'done',
        activeLine: 16,
        dp: dp.map(r => [...r]),
        r: m - 1,
        c: n - 1,
        result: dp[m - 1][n - 1],
        message: `dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]}. There are ${dp[m - 1][n - 1]} unique paths.`,
    })

    return steps
}

const DEFAULT_EXAMPLES = [
    {
        label: '3×3 (clear)',
        m: 3,
        n: 3,
        obstacleGrid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]],
    },
    {
        label: '3×3 (1 obstacle)',
        m: 3,
        n: 3,
        obstacleGrid: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
    },
    {
        label: '2×2 (corner)',
        m: 2,
        n: 2,
        obstacleGrid: [[0, 1], [0, 0]],
    },
    {
        label: '4×4 (varied)',
        m: 4,
        n: 4,
        obstacleGrid: [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 0, 0]],
    },
]

function UniquePathsIIVisualization({ m, n, obstacleGrid, step, onApplyExample, mInput, nInput, setMInput, setNInput, obstacleGridInput, setObstacleGridInput, handleReset }) {
    const dp = step?.dp ?? []
    const currR = step?.r ?? -1
    const currC = step?.c ?? -1
    const displayGrid = dp.length > 0 ? dp : Array.from({ length: m }, () => Array(n).fill(0))

    const toggleObstacle = (r, c) => {
        const newGrid = obstacleGridInput.map(row => [...row])
        newGrid[r][c] = newGrid[r][c] === 1 ? 0 : 1
        setObstacleGridInput(newGrid)
        handleReset()
    }

    return (
        <section className="upii-viz-section">
                <div className="upii-top-row">
                    <div className="upii-examples">
                        {DEFAULT_EXAMPLES.map((ex) => (
                            <button key={ex.label} className="upii-chip" onClick={() => onApplyExample(ex)}>{ex.label}</button>
                        ))}
                    </div>
                    <div className="upii-inputs">
                        <label className="upii-input-label">
                            m (rows):
                            <input className="upii-input-num" type="number" min={1} max={6} value={mInput}
                                onChange={(e) => { setMInput(Number(e.target.value));

 handleReset() }} />
                        </label>
                        <label className="upii-input-label">
                            n (cols):
                            <input className="upii-input-num" type="number" min={1} max={6} value={nInput}
                                onChange={(e) => { setNInput(Number(e.target.value)); handleReset() }} />
                        </label>
                    </div>
                </div>

                {/* Input Grid - for editing obstacles */}
                <div className="upii-section">
                    <div className="upii-section-label">Obstacle Grid (click to toggle):</div>
                    <div className="upii-grid-wrap">
                        <div
                            className="upii-input-grid"
                            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                        >
                            {obstacleGridInput.map((row, r) =>
                                row.map((val, c) => (
                                    <button
                                        key={`input-${r}-${c}`}
                                        className={`upii-input-cell ${val === 1 ? 'obstacle' : 'empty'}`}
                                        onClick={() => toggleObstacle(r, c)}
                                        title={`${val === 1 ? 'Obstacle' : 'Empty'}`}
                                    >
                                        {val === 1 ? '●' : '·'}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* DP Grid - visualization */}
                <div className="upii-section">
                    <div className="upii-section-label">DP Grid (path count):</div>
                    <div className="upii-grid-wrap">
                        <div
                            className="upii-grid"
                            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
                        >
                            {displayGrid.map((row, r) =>
                                row.map((val, c) => {
                                    const isCurr = r === currR && c === currC
                                    const isAbove = r === currR - 1 && c === currC
                                    const isLeft = r === currR && c === currC - 1
                                    const isDone = step?.phase === 'done'
                                    const isResult = isDone && r === m - 1 && c === n - 1
                                    const isObstacle = obstacleGrid[r] && obstacleGrid[r][c] === 1
                                    const isStart = r === 0 && c === 0
                                    const isEnd = r === m - 1 && c === n - 1

                                    return (
                                        <motion.div
                                            key={`${r}-${c}`}
                                            className={[
                                                'upii-cell',
                                                isCurr ? 'curr' : '',
                                                isAbove ? 'above' : '',
                                                isLeft ? 'left' : '',
                                                isResult ? 'result' : '',
                                                isObstacle ? 'obstacle-cell' : '',
                                                isStart && !isObstacle ? 'start' : '',
                                                isEnd && !isObstacle && !isResult ? 'end-cell' : '',
                                            ].filter(Boolean).join(' ')}
                                            animate={{ scale: isCurr || isResult ? 1.08 : 1 }}
                                            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                                        >
                                            {isObstacle ? '✕' : val}
                                            {isStart && !isObstacle && <span className="upii-corner-label">S</span>}
                                            {isEnd && !isObstacle && <span className="upii-corner-label">E</span>}
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Source arrows */}
                {currR >= 1 && currC >= 1 && (step?.phase === 'fill' || step?.phase === 'fill_first_row' || step?.phase === 'fill_first_col') && !obstacleGrid[currR][currC] && (
                    <div className="upii-arrows">
                        <span className="upii-arrow above-arrow">↓ from above: {step.from_above}</span>
                        <span className="upii-plus">+</span>
                        <span className="upii-arrow left-arrow">→ from left: {step.from_left}</span>
                        <span className="upii-plus">=</span>
                        <span className="upii-arrow curr-arrow">dp[{currR}][{currC}] = {displayGrid[currR][currC]}</span>
                    </div>
                )}

                <AnimatePresence>
                    {step?.phase === 'done' && (
                        <motion.div
                            className="upii-result"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            {step.result} unique path{step.result !== 1 ? 's' : ''} from top-left to bottom-right
                        </motion.div>
                    )}
                    {step?.phase === 'blocked' && (
                        <motion.div
                            className="upii-result blocked"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                        >
                            ✕ {step.message}
                        </motion.div>
                    )}
                </AnimatePresence>
        </section>
    )
}

export default function UniquePathsIIVisualizer() {
    const [mInput, setMInput] = useState(3)
    const [nInput, setNInput] = useState(3)
    const [obstacleGridInput, setObstacleGridInput] = useState([
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
    ])

    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { m, n } = useMemo(() => ({
        m: Math.min(Math.max(1, mInput), 6),
        n: Math.min(Math.max(1, nInput), 6),
    }), [mInput, nInput])

    // Ensure obstacleGrid matches m x n dimensions
    const obstacleGrid = useMemo(() => {
        const newGrid = Array.from({ length: m }, (_, r) =>
            Array.from({ length: n }, (_, c) => obstacleGridInput[r]?.[c] ?? 0)
        )
        return newGrid
    }, [m, n, obstacleGridInput])

    const steps = useMemo(() => generateSteps(m, n, obstacleGrid), [m, n, obstacleGrid])

    const {
        stepIndex, stepForward, stepBack, togglePlay,
        handleReset, isPlaying, speed, setSpeed, isDone,
    } = usePlaybackState(steps.length)

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setMInput(ex.m)
        setNInput(ex.n)
        setObstacleGridInput(ex.obstacleGrid)
        handleReset()
    }, [handleReset])

    // Step 2: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"m","label":"m","type":"string"},{"key":"n","label":"n","type":"string"},{"key":"obstacleGrid","label":"obstacleGrid","type":"string"}]}
        values={{ m: mInput, n: nInput, obstacleGrid: obstacleGridInput }}
        onChange={(k, v) => { if (k === 'm') setMInput(v); if (k === 'n') setNInput(v); if (k === 'obstacleGrid') setObstacleGridInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        
      />

        <div className="upii-panel">
            <header className="upii-head"><span>Unique Paths II · 2D DP with Obstacles</span></header>
            <div className="upii-body">
                <UniquePathsIIVisualization
                    m={m} n={n} obstacleGrid={obstacleGrid} step={step}
                    onApplyExample={applyExample}
                    mInput={mInput} nInput={nInput}
                    setMInput={setMInput} setNInput={setNInput}
                    obstacleGridInput={obstacleGridInput} setObstacleGridInput={setObstacleGridInput}
                    handleReset={handleReset}
                />
            </div>
        </div>
    
    </>)

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                autoScroll={autoScrollCode}
                disableResizer
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

    const statusPanel = (
        <div className="upii-status">
            {step?.message ?? 'Press Play or Step to begin.'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={UNIQUEPATHSII_PATTERNS} />
            )}
            <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward}
                onReset={handleReset} prevDisabled={stepIndex < 0}
                nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                autoScroll={autoScrollCode} onAutoScrollChange={setAutoScrollCode} showAutoScroll
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    )

    // Step 3: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Unique Paths II', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="upii-shell">
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
