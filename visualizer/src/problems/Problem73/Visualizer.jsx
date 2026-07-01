import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './SetMatrixZeroesVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def setZeroes(matrix):' },
    { line: 2, text: '    rows, cols = set(), set()' },
    { line: 3, text: '    for i in range(len(matrix)):' },
    { line: 4, text: '        for j in range(len(matrix[0])):' },
    { line: 5, text: '            if matrix[i][j] == 0:' },
    { line: 6, text: '                rows.add(i); cols.add(j)' },
    { line: 7, text: '    for i in range(len(matrix)):' },
    { line: 8, text: '        for j in range(len(matrix[0])):' },
    { line: 9, text: '            if i in rows or j in cols:' },
    { line: 10, text: '                matrix[i][j] = 0' },
]

function generateSteps(initial) {
    const steps = []
    const matrix = initial.map((r) => [...r])
    const rows = new Set(), cols = new Set()

    steps.push({
        activeLine: 2,
        matrix,
        hi: -1,
        hj: -1,
        rows: new Set(),
        cols: new Set(),
        phase: 'scan',
        message: 'Scan for zeros — record their rows & cols.',
    })

    // Scan
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            steps.push({
                activeLine: 5,
                matrix: matrix.map((r) => [...r]),
                hi: i,
                hj: j,
                rows: new Set(rows),
                cols: new Set(cols),
                phase: 'scan',
                message: `Check [${i}][${j}] = ${matrix[i][j]}`,
            })
            if (matrix[i][j] === 0) {
                rows.add(i)
                cols.add(j)
                steps.push({
                    activeLine: 6,
                    matrix: matrix.map((r) => [...r]),
                    hi: i,
                    hj: j,
                    rows: new Set(rows),
                    cols: new Set(cols),
                    phase: 'mark',
                    message: `Zero found! Mark row ${i}, col ${j}`,
                })
            }
        }
    }

    steps.push({
        activeLine: 7,
        matrix: matrix.map((r) => [...r]),
        hi: -1,
        hj: -1,
        rows: new Set(rows),
        cols: new Set(cols),
        phase: 'zero',
        message: `Fill zeros for rows=[${[...rows]}], cols=[${[...cols]}]`,
    })

    // Fill
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[0].length; j++) {
            if (rows.has(i) || cols.has(j)) {
                matrix[i][j] = 0
                steps.push({
                    activeLine: 10,
                    matrix: matrix.map((r) => [...r]),
                    hi: i,
                    hj: j,
                    rows: new Set(rows),
                    cols: new Set(cols),
                    phase: 'fill',
                    message: `Set [${i}][${j}] = 0 (row ${i} or col ${j} flagged)`,
                })
            }
        }
    }

    steps.push({
        activeLine: 10,
        matrix: matrix.map((r) => [...r]),
        hi: -1,
        hj: -1,
        rows: new Set(rows),
        cols: new Set(cols),
        phase: 'done',
        message: 'Done!',
    })
    return steps
}

const EXAMPLES = getExamples('set-matrix-zeroes')

function VisualizationPanel({ EXAMPLES, applyExample, selected, handleReset, step }) {
    const initial = EXAMPLES[selected]?.matrix ?? [[]]
    const matrix = step?.matrix ?? initial
    const cols = matrix[0]?.length ?? 0
    const rows = step?.rows ?? new Set()
    const markedCols = step?.cols ?? new Set()

    return (
        <div className="smz-viz-panel">
            <div className="smz-top">
                <section className="smz-panel main">
                    <header className="smz-head">
                        <span>Set Matrix Zeroes</span>
                    </header>
                    <div className="smz-body">
                        <div className="smz-examples">
                            {EXAMPLES.map((ex, i) => (
                                <button
                                    key={ex.label}
                                    className={`smz-chip ${selected === EXAMPLES.indexOf(ex) ? 'active' : ''}`}
                                    onClick={() => applyExample(EXAMPLES.indexOf(ex))}
                                >
                                    {ex.label}
                                </button>
                            ))}
                        </div>

                        {/* Row/col sets */}
                        <div className="smz-sets-row">
                            <div className="smz-set-box">
                                <span className="smz-set-label">rows</span>
                                <span className="smz-set-val">{'{' + [...rows].join(',') + '}'}</span>
                            </div>
                            <div className="smz-set-box">
                                <span className="smz-set-label">cols</span>
                                <span className="smz-set-val">{'{' + [...markedCols].join(',') + '}'}</span>
                            </div>
                        </div>

                        <div className="smz-panel-label">Matrix</div>
                        <div className="smz-grid" style={{ gridTemplateColumns: `repeat(${cols}, 52px)` }}>
                            {matrix.map((row, i) =>
                                row.map((val, j) => {
                                    const isActive = step?.hi === i && step?.hj === j
                                    const isZeroRow = rows.has(i)
                                    const isZeroCol = markedCols.has(j)
                                    const isFilled = val === 0 && step?.phase === 'fill' && isActive
                                    return (
                                        <motion.div
                                            key={`${i}-${j}`}
                                            className={`smz-cell ${isActive ? 'active' : ''} ${isFilled ? 'filled' : ''} ${val === 0 && step?.phase !== 'scan' ? 'zero' : ''}`}
                                            style={{
                                                outline:
                                                    isZeroRow || isZeroCol
                                                        ? '2px dashed #f9e2af55'
                                                        : undefined,
                                            }}
                                            animate={{ scale: isActive ? 1.1 : 1 }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 380,
                                                damping: 20,
                                            }}
                                        >
                                            {val}
                                        </motion.div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </section>
            </div>
            <div className="smz-status">{step?.message ?? 'Press Play to begin.'}</div>
        </div>
    )
}

export default function SetMatrixZeroesVisualizer() {
    const [selected, setSelected] = useState(0)
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const initial = EXAMPLES[selected]?.matrix ?? [[]]
    const steps = useMemo(() => generateSteps(initial), [initial])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback(
        (idx) => {
            setSelected(idx)
            handleReset()
        },
        [handleReset]
    )

    const dockPanels = useMemo(
        () => [
            {
                id: 'viz',
                title: 'Visualization',
                content: (
                    <VisualizationPanel
                        EXAMPLES={EXAMPLES}
                        applyExample={applyExample}
                        selected={selected}
                        handleReset={handleReset}
                        step={step}
                    />
                ),
            },
            {
                id: 'code',
                title: 'Code',
                content: (
                    <div style={{ position: "relative" }}>
                        <CodeTracePanel
                            step={step}
                            codeLines={SOLUTION_CODE}
                            onActiveLineDomChange={setActiveLineDom}
                            autoScroll={autoScrollCode}
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
                ),
            },
        ],
        [step, autoScrollCode, selected]
    )

    return (
        <div className="problem-shell">
            <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['viz', 'code']], minimized: [] }} />
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
                    autoScroll={autoScrollCode}
                    onAutoScrollChange={setAutoScrollCode}
                    showAutoScroll
                    showPatternOverlay={showPatternOverlay}
                    onShowPatternOverlayChange={setShowPatternOverlay}
                    patternOverlayLabel="Show pattern overlay"
                    showPatternOverlayToggle
                />
            </FloatingPanel>
        </div>
    )
}
