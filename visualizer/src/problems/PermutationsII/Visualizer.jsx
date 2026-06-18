import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def permuteUnique(nums):' },
    { line: 2, text: '    nums.sort()' },
    { line: 3, text: '    res = []' },
    { line: 4, text: '    used = [False]*len(nums)' },
    { line: 5, text: '    def backtrack(path):' },
    { line: 6, text: '        if len(path) == len(nums):' },
    { line: 7, text: '            res.append(path[:])' },
    { line: 8, text: '            return' },
    { line: 9, text: '        for i in range(len(nums)):' },
    { line: 10, text: '            if used[i]: continue' },
    { line: 11, text: '            if i > 0 and nums[i] == nums[i-1] and not used[i-1]:' },
    { line: 12, text: '                continue  # prune duplicate' },
    { line: 13, text: '            used[i] = True' },
    { line: 14, text: '            path.append(nums[i])' },
    { line: 15, text: '            backtrack(path)' },
    { line: 16, text: '            path.pop()' },
    { line: 17, text: '            used[i] = False' },
    { line: 18, text: '    backtrack([])' },
    { line: 19, text: '    return res' },
]

function generateSteps(nums) {
    const steps = []
    const sortedNums = [...nums].sort((a, b) => a - b)
    const res = []
    const used = new Array(sortedNums.length).fill(false)

    function backtrack(path) {
        if (path.length === sortedNums.length) {
            res.push([...path])
            steps.push({
                phase: 'record', activeLine: 7,
                path: [...path], used: [...used], res,
                message: `Complete permutation: [${path.join(', ')}]`,
            })
            return
        }

        for (let i = 0; i < sortedNums.length; i++) {
            if (used[i]) {
                steps.push({
                    phase: 'skip', activeLine: 10,
                    path: [...path], used: [...used], res,
                    message: `Skip: nums[${i}]=${sortedNums[i]} already used`,
                })
                continue
            }

            if (i > 0 && sortedNums[i] === sortedNums[i - 1] && !used[i - 1]) {
                steps.push({
                    phase: 'prune', activeLine: 11,
                    path: [...path], used: [...used], res,
                    message: `Prune duplicate: nums[${i}]=${sortedNums[i]} (nums[${i-1}] not used yet)`,
                })
                continue
            }

            used[i] = true
            path.push(sortedNums[i])
            steps.push({
                phase: 'choose', activeLine: 14,
                path: [...path], used: [...used], res,
                message: `Choose nums[${i}]=${sortedNums[i]}, path=[${path.join(', ')}]`,
            })

            backtrack(path)

            path.pop()
            used[i] = false
            steps.push({
                phase: 'unchoose', activeLine: 17,
                path: [...path], used: [...used], res,
                message: `Unchoose nums[${i}]=${sortedNums[i]}, path=[${path.join(', ')}]`,
            })
        }
    }

    steps.push({
        phase: 'init', activeLine: 2,
        path: [], used: [...used], res: [],
        message: `Sort and start backtracking: [${sortedNums.join(', ')}]`,
    })
    backtrack([])
    steps.push({
        phase: 'done', activeLine: 19,
        path: [], used: [...used], res,
        message: `Done. ${res.length} unique permutations found.`,
    })
    return steps
}

const EXAMPLES = getExamples('permutations-ii')

function VisualizationPanel({ EXAMPLES, applyExample, numsInput, setNumsInput, nums, inputError, handleReset, step }) {
    return (
        <div className="perm2-viz-panel">
            <div className="perm2-top">
                <section className="perm2-panel main">
                    <header className="perm2-head">
                        <span>Backtracking with deduplication</span>
                        {inputError && <span className="perm2-error">{inputError}</span>}
                    </header>
                    <div className="perm2-body">
                        <div className="perm2-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="perm2-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                            ))}
                        </div>
                        <input className="perm2-input" value={numsInput} onChange={(e) => { setNumsInput(e.target.value); handleReset() }} />

                        <div className="perm2-section-label">Current path</div>
                        <div className="perm2-path-row">
                            <span className="perm2-bracket">[</span>
                            <AnimatePresence mode="popLayout">
                                {(step?.path ?? []).map((v, i) => (
                                    <motion.div key={`${i}-${v}`} className="perm2-path-cell"
                                        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}>
                                        {v}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <span className="perm2-bracket">]</span>
                        </div>

                        <div className="perm2-section-label">Used flags</div>
                        <div className="perm2-nums-row">
                            {nums.map((v, i) => (
                                <div key={i} className={`perm2-num-cell ${step?.used?.[i] ? 'used' : ''}`}>
                                    <span className="perm2-num-val">{v}</span>
                                    <span className="perm2-num-flag">{step?.used?.[i] ? '✓' : '○'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="perm2-panel side">
                    <header className="perm2-head"><span>Results ({step?.res?.length ?? 0})</span></header>
                    <div className="perm2-body">
                        <div className="perm2-res-list">
                            <AnimatePresence mode="popLayout">
                                {(step?.res ?? []).map((perm, i) => (
                                    <motion.div key={i} className={`perm2-res-item ${i === (step?.res?.length ?? 0) - 1 && step?.phase === 'record' ? 'latest' : ''}`}
                                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}>
                                        [{perm.join(', ')}]
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>
            </div>
            <div className="perm2-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function PermutationsIIVisualizer() {
    const [numsInput, setNumsInput] = useState('[1,1,2]')

    const { nums, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(numsInput)
            if (!Array.isArray(parsed)) throw new Error('Must be array')
            return { nums: parsed.map(Number).slice(0, 5), inputError: '' }
        } catch (e) {
            return { nums: [1, 1, 2], inputError: e.message }
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
