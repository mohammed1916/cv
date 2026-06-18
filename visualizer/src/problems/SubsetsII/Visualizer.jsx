import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def subsetsWithDup(nums):' },
    { line: 2, text: '    nums.sort()' },
    { line: 3, text: '    res = []' },
    { line: 4, text: '    def backtrack(start, path):' },
    { line: 5, text: '        res.append(path[:])' },
    { line: 6, text: '        for i in range(start, len(nums)):' },
    { line: 7, text: '            if i > start and nums[i] == nums[i-1]:' },
    { line: 8, text: '                continue  # Skip duplicates' },
    { line: 9, text: '            path.append(nums[i])' },
    { line: 10, text: '            backtrack(i + 1, path)' },
    { line: 11, text: '            path.pop()' },
    { line: 12, text: '    backtrack(0, [])' },
    { line: 13, text: '    return res' },
]

function generateSteps(nums) {
    const steps = []
    const res = []
    const sortedNums = [...nums].sort((a, b) => a - b)

    steps.push({
        phase: 'sort', activeLine: 2,
        path: [], start: 0, res: [],
        message: `Sort nums: [${sortedNums.join(', ')}]`,
        sortedNums,
    })

    function backtrack(start, path) {
        res.push([...path])
        steps.push({
            phase: 'record', activeLine: 5,
            path: [...path], start, res: [...res],
            message: `Record subset [${path.join(', ')}]`,
            sortedNums,
        })

        for (let i = start; i < sortedNums.length; i++) {
            // Check for duplicates at the same level
            if (i > start && sortedNums[i] === sortedNums[i - 1]) {
                steps.push({
                    phase: 'skip_dup', activeLine: 8,
                    path: [...path], start, i, res: [...res],
                    message: `Skip duplicate nums[${i}]=${sortedNums[i]}`,
                    sortedNums,
                })
                continue
            }

            path.push(sortedNums[i])
            steps.push({
                phase: 'choose', activeLine: 9,
                path: [...path], start: i, res: [...res],
                message: `Choose nums[${i}]=${sortedNums[i]}, path=[${path.join(', ')}]`,
                sortedNums,
            })

            steps.push({
                phase: 'recurse', activeLine: 10,
                path: [...path], start: i + 1, res: [...res],
                message: `Recurse with start=${i + 1}`,
                sortedNums,
            })

            backtrack(i + 1, path)

            path.pop()
            steps.push({
                phase: 'unchoose', activeLine: 11,
                path: [...path], start: i, res: [...res],
                message: `Unchoose nums[${i}]=${sortedNums[i]}, path=[${path.join(', ')}]`,
                sortedNums,
            })
        }
    }

    steps.push({
        phase: 'init', activeLine: 12,
        path: [], start: 0, res: [],
        message: 'Start backtracking from index 0',
        sortedNums,
    })

    backtrack(0, [])

    steps.push({
        phase: 'done', activeLine: 13,
        path: [], start: sortedNums.length, res,
        message: `Done. ${res.length} unique subsets found.`,
        sortedNums,
    })

    return steps
}

const EXAMPLES = getExamples('subsets-ii')

function VisualizationPanel({ EXAMPLES, applyExample, numsInput, setNumsInput, nums, inputError, handleReset, step }) {
    const sortedNums = step?.sortedNums || nums.sort((a, b) => a - b)

    return (
        <div className="subsetsii-viz-panel">
            <div className="subsetsii-top">
                <section className="subsetsii-panel main">
                    <header className="subsetsii-head">
                        <span>Backtracking with Duplicate Handling</span>
                        {inputError && <span className="subsetsii-error">{inputError}</span>}
                    </header>
                    <div className="subsetsii-body">
                        <div className="subsetsii-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="subsetsii-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                            ))}
                        </div>
                        <input className="subsetsii-input" value={numsInput} onChange={(e) => { setNumsInput(e.target.value); handleReset() }} />

                        <div className="subsetsii-section-label">Current path</div>
                        <div className="subsetsii-path-row">
                            <span className="subsetsii-bracket">[</span>
                            <AnimatePresence mode="popLayout">
                                {(step?.path ?? []).map((v, i) => (
                                    <motion.div key={`${i}-${v}`} className="subsetsii-path-cell"
                                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}>
                                        {v}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <span className="subsetsii-bracket">]</span>
                        </div>

                        <div className="subsetsii-section-label">Sorted input array</div>
                        <div className="subsetsii-nums-row">
                            {sortedNums.map((v, i) => {
                                const isStart = step?.start === i
                                const isPast = step?.path?.length > 0 && i < (step?.start ?? sortedNums.length)
                                const isSkipped = step?.phase === 'skip_dup' && step?.i === i
                                return (
                                    <div key={i} className={`subsetsii-num-cell ${isStart ? 'start' : ''} ${isPast ? 'past' : ''} ${isSkipped ? 'skipped' : ''}`}>
                                        <span className="subsetsii-num-val">{v}</span>
                                        <span className="subsetsii-num-idx">{i}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <section className="subsetsii-panel side">
                    <header className="subsetsii-head"><span>Results ({step?.res?.length ?? 0})</span></header>
                    <div className="subsetsii-body">
                        <div className="subsetsii-res-list">
                            <AnimatePresence mode="popLayout">
                                {(step?.res ?? []).map((subset, i) => (
                                    <motion.div key={i} className={`subsetsii-res-item ${i === (step?.res?.length ?? 0) - 1 && step?.phase === 'record' ? 'latest' : ''}`}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}>
                                        [{subset.join(', ')}]
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </div>
            <div className="subsetsii-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function SubsetsIIVisualizer() {
    const [numsInput, setNumsInput] = useState('[4,4,4,1,0]')

    const { nums, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(numsInput)
            if (!Array.isArray(parsed)) throw new Error('Must be array')
            return { nums: parsed.map(Number).slice(0, 6), inputError: '' }
        } catch (e) {
            return { nums: [4, 4, 4, 1, 0], inputError: e.message }
        }
    }, [numsInput])

    const steps = useMemo(() => generateSteps(nums), [nums])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => { setNumsInput(JSON.stringify(ex.nums)); handleReset() }, [handleReset])

    const dockPanels = useMemo(() => [
        {
            id: 'viz',
            title: 'Visualization',
            content: <VisualizationPanel EXAMPLES={EXAMPLES} applyExample={applyExample} numsInput={numsInput} setNumsInput={setNumsInput} nums={nums} inputError={inputError} handleReset={handleReset} step={step} />,
        },
        {
            id: 'code',
            title: 'Code',
            content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} />,
        },
    ], [step, autoScrollCode])

    return (
        <div className="problem-shell">
            <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['viz', 'code']], minimized: [] }} />
            <FloatingPanel title="Playback Controls">
                <PlaybackControls
                    isPlaying={isPlaying} isDone={isDone} speed={speed}
                    onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                    prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
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
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
