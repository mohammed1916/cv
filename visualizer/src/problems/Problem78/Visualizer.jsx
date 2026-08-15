import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
    { line: 1, text: 'def subsets(nums):' },
    { line: 2, text: '    res = []' },
    { line: 3, text: '    def backtrack(start, path):' },
    { line: 4, text: '        res.append(path[:])' },
    { line: 5, text: '        for i in range(start, len(nums)):' },
    { line: 6, text: '            path.append(nums[i])' },
    { line: 7, text: '            backtrack(i + 1, path)' },
    { line: 8, text: '            path.pop()' },
    { line: 9, text: '    backtrack(0, [])' },
    { line: 10, text: '    return res' },
]

function generateSteps(nums) {
    const steps = []
    const res = []

    function backtrack(start, path) {
        res.push([...path])
        steps.push({
            phase: 'record', activeLine: 4,
            path: [...path], start, res,
            message: `Record subset [${path.join(', ')}]`,
        })

        for (let i = start; i < nums.length; i++) {
            path.push(nums[i])
            steps.push({
                phase: 'choose', activeLine: 6,
                path: [...path], start: i, res,
                message: `Choose nums[${i}]=${nums[i]}, path=[${path.join(', ')}]`,
            })

            steps.push({
                phase: 'recurse', activeLine: 7,
                path: [...path], start: i + 1, res,
                message: `Recurse with start=${i + 1}`,
            })

            backtrack(i + 1, path)

            path.pop()
            steps.push({
                phase: 'unchoose', activeLine: 8,
                path: [...path], start: i, res,
                message: `Unchoose nums[${i}]=${nums[i]}, path=[${path.join(', ')}]`,
            })
        }
    }

    steps.push({
        phase: 'init', activeLine: 9,
        path: [], start: 0, res: [],
        message: 'Start backtracking from index 0',
    })

    backtrack(0, [])

    steps.push({
        phase: 'done', activeLine: 10,
        path: [], start: nums.length, res,
        message: `Done. ${res.length} subsets found.`,
    })

    return steps
}

const EXAMPLES = getExamples('subsets')

function VisualizationPanel({ EXAMPLES, applyExample, numsInput, setNumsInput, nums, inputError, handleReset, step }) {
    return (
        <div className="subsets-viz-panel">
            <div className="subsets-top">
                <section className="subsets-panel main">
                    <header className="subsets-head">
                        <span>Backtracking (include / skip each element)</span>
                        {inputError && <span className="subsets-error">{inputError}</span>}
                    </header>
                    <div className="subsets-body">
                        <div className="subsets-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="subsets-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                            ))}
                        </div>
                        <input className="subsets-input" value={numsInput} onChange={(e) => { setNumsInput(e.target.value); handleReset() }} />

                        <div className="subsets-section-label">Current path</div>
                        <div className="subsets-path-row">
                            <span className="subsets-bracket">[</span>
                            <AnimatePresence mode="popLayout">
                                {(step?.path ?? []).map((v, i) => (
                                    <motion.div key={`${i}-${v}`} className="subsets-path-cell"
                                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}>
                                        {v}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <span className="subsets-bracket">]</span>
                        </div>

                        <div className="subsets-section-label">Input array</div>
                        <div className="subsets-nums-row">
                            {nums.map((v, i) => {
                                const isStart = step?.start === i
                                const isPast = step?.path?.length > 0 && i < (step?.start ?? nums.length)
                                return (
                                    <div key={i} className={`subsets-num-cell ${isStart ? 'start' : ''} ${isPast ? 'past' : ''}`}>
                                        <span className="subsets-num-val">{v}</span>
                                        <span className="subsets-num-idx">{i}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                <section className="subsets-panel side">
                    <header className="subsets-head"><span>Results ({step?.res?.length ?? 0})</span></header>
                    <div className="subsets-body">
                        <div className="subsets-res-list">
                            <AnimatePresence mode="popLayout">
                                {(step?.res ?? []).map((subset, i) => (
                                    <motion.div key={i} className={`subsets-res-item ${i === (step?.res?.length ?? 0) - 1 && step?.phase === 'record' ? 'latest' : ''}`}
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
            <div className="subsets-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

const LINE_PATTERN_MAP = {}

export default function SubsetsVisualizer() {
    const [numsInput, setNumsInput] = useState('[1,2,3]')

    const { nums, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(numsInput)
            if (!Array.isArray(parsed)) throw new Error('Must be array')
            return { nums: parsed.map(Number).slice(0, 6), inputError: '' }
        } catch (e) {
            return { nums: [1, 2, 3], inputError: e.message }
        }
    }, [numsInput])

    const steps = useMemo(() => generateSteps(nums), [nums])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => { setNumsInput(JSON.stringify(ex.nums)); handleReset() }, [handleReset])

    const vizPanel = (
        <>
          <ManualInputPanel
            fields={[{"key":"nums","label":"nums","type":"string"}]}
            values={{ nums: numsInput }}
            onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
            examples={EXAMPLES}
            applyExample={applyExample}
            inputError={inputError}
          />
          <VisualizationPanel EXAMPLES={EXAMPLES} applyExample={applyExample} numsInput={numsInput} setNumsInput={setNumsInput} nums={nums} inputError={inputError} handleReset={handleReset} step={step} />
        </>
    )

    const codePanel = (
        <div style={{ position: "relative" }}>
            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} />
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

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(() => [
        { id: 'viz', title: 'Visualization' },
        { id: 'code', title: 'Code', dockMode: 'split-right' },
    ], [])
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="problem-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}
            {createPortal(
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
                </FloatingPanel>,
                document.body
            )}
        </div>
    )
}
