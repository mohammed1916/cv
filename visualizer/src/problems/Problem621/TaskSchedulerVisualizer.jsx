import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './TaskSchedulerVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def leastInterval(tasks, n):' },
    { line: 2, text: '    freq = {}' },
    { line: 3, text: '    for task in tasks:' },
    { line: 4, text: '        freq[task] = freq.get(task, 0) + 1' },
    { line: 5, text: '    max_freq = max(freq.values())' },
    { line: 6, text: '    max_count = sum(1 for f in freq.values() if f == max_freq)' },
    { line: 7, text: '    formula_result = (max_freq - 1) * (n + 1) + max_count' },
    { line: 8, text: '    return max(len(tasks), formula_result)' },
]

const EXAMPLES = getExamplesOr('task-scheduler', [
    { label: 'Example 1', tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 2 },
    { label: 'Example 2', tasks: ['A', 'A', 'A', 'B', 'B', 'B', 'C', 'C', 'C'], n: 3 },
    { label: 'Example 3', tasks: ['A', 'B', 'C', 'D', 'E'], n: 2 },
])

function generateSteps(tasks, n) {
    const steps = []
    const freq = {}

    steps.push({
        activeLine: 2,
        state: { freq: {}, taskIndex: -1, phase: 'init' },
        message: 'Initialize frequency map',
    })

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        freq[task] = (freq[task] || 0) + 1
        steps.push({
            activeLine: 4,
            state: { freq: { ...freq }, taskIndex: i, phase: 'counting', currentTask: task },
            message: `Count task "${task}": frequency = ${freq[task]}`,
        })
    }

    const maxFreq = Math.max(...Object.values(freq), 0)
    const maxCount = Object.values(freq).filter(f => f === maxFreq).length

    steps.push({
        activeLine: 5,
        state: { freq: { ...freq }, maxFreq, maxCount, phase: 'max-freq' },
        message: `Max frequency = ${maxFreq}`,
    })

    steps.push({
        activeLine: 6,
        state: { freq: { ...freq }, maxFreq, maxCount, phase: 'max-count' },
        message: `Tasks with max frequency = ${maxCount}`,
    })

    const formulaResult = (maxFreq - 1) * (n + 1) + maxCount
    const result = Math.max(tasks.length, formulaResult)

    steps.push({
        activeLine: 7,
        state: { freq: { ...freq }, maxFreq, maxCount, n, formulaResult, phase: 'formula' },
        message: `Formula: (${maxFreq} - 1) × (${n} + 1) + ${maxCount} = ${formulaResult}`,
    })

    steps.push({
        activeLine: 8,
        state: { freq: { ...freq }, maxFreq, maxCount, n, formulaResult, result, phase: 'done' },
        message: `Result: max(${tasks.length}, ${formulaResult}) = ${result}`,
    })

    return steps
}

function TaskFrequencyViz({ step }) {
    if (!step) return <div className="tsv-empty">Press Play to begin</div>

    const { freq = {}, currentTask, maxFreq = 0 } = step.state
    const freqArray = Object.entries(freq).sort((a, b) => b[1] - a[1])

    return (
        <div className="tsv-freq-container">
            <div className="tsv-bars">
                {freqArray.length === 0 ? (
                    <div className="tsv-empty">No tasks counted yet</div>
                ) : (
                    freqArray.map(([task, count]) => (
                        <motion.div
                            key={task}
                            className={`tsv-bar-item ${currentTask === task ? 'tsv-active' : ''} ${count === maxFreq && maxFreq > 0 ? 'tsv-max' : ''}`}
                            animate={{ opacity: 1, y: 0 }}
                            initial={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="tsv-bar"
                                animate={{ height: `${maxFreq > 0 ? (count / maxFreq) * 160 : 0}px` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            />
                            <div className="tsv-bar-label">{task}</div>
                            <div className="tsv-bar-count">{count}</div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}

function TimelineViz({ tasks, n, step }) {
    if (!step || !step.state) return <div className="tsv-empty">Press Play to begin</div>

    const { maxFreq = 0 } = step.state
    const scheduleLength = Math.max(tasks.length, (maxFreq - 1) * (n + 1) + 1)
    const timeline = Array.from({ length: Math.min(scheduleLength, 30) }, (_, i) => {
        const taskAtIndex = i < tasks.length ? tasks[i] : null
        return { index: i, task: taskAtIndex }
    })

    return (
        <div className="tsv-timeline-container">
            <div className="tsv-timeline-header">
                <span className="tsv-timeline-label">Scheduling Timeline</span>
                <span className="tsv-timeline-info">Cooldown = {n} units</span>
            </div>
            <div className="tsv-timeline">
                {timeline.map((slot, idx) => (
                    <motion.div
                        key={idx}
                        className={`tsv-timeline-slot ${slot.task ? 'filled' : 'empty'}`}
                        animate={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0.6, scale: 0.9 }}
                        transition={{ delay: idx * 0.02 }}
                    >
                        <div className="tsv-slot-content">{slot.task || '·'}</div>
                        <div className="tsv-slot-index">{slot.index}</div>
                    </motion.div>
                ))}
            </div>
            <div className="tsv-timeline-note">Greedy scheduling minimizes idle slots</div>
        </div>
    )
}

function AlgorithmStateViz({ step }) {
    if (!step) return <div className="tsv-empty">Press Play to begin</div>

    const { state = {} } = step
    const { maxFreq = 0, maxCount = 0, n = 0, formulaResult = 0, result = 0, phase = '' } = state

    return (
        <motion.div
            className="tsv-state-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
        >
            {phase === 'init' && (
                <div className="tsv-state-item">
                    <span className="tsv-label">Initializing...</span>
                </div>
            )}

            {(phase === 'counting' || phase === 'max-freq' || phase === 'max-count' || phase === 'formula' || phase === 'done') && (
                <>
                    <motion.div
                        className="tsv-state-item"
                        animate={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0.5, scale: 0.9 }}
                    >
                        <span className="tsv-label">Max Frequency</span>
                        <span className="tsv-value">{maxFreq}</span>
                    </motion.div>

                    <motion.div
                        className="tsv-state-item"
                        animate={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0.5, scale: 0.9 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="tsv-label">Max Count</span>
                        <span className="tsv-value">{maxCount}</span>
                    </motion.div>

                    <motion.div
                        className="tsv-state-item"
                        animate={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0.5, scale: 0.9 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="tsv-label">Cooldown (n)</span>
                        <span className="tsv-value">{n}</span>
                    </motion.div>
                </>
            )}

            {(phase === 'formula' || phase === 'done') && (
                <motion.div
                    className="tsv-formula-box"
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="tsv-formula-expr">
                        ({maxFreq} - 1) × ({n} + 1) + {maxCount}
                    </div>
                    <div className="tsv-formula-equals">=</div>
                    <div className="tsv-formula-result">{formulaResult}</div>
                </motion.div>
            )}

            {phase === 'done' && (
                <motion.div
                    className="tsv-final-result"
                    animate={{ scale: 1, opacity: 1 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                >
                    <span className="tsv-label">Result</span>
                    <span className="tsv-value tsv-final">{result}</span>
                </motion.div>
            )}
        </motion.div>
    )
}

function InputPanel({ tasks, n, setTasks, setN, applyExample }) {
    const [customInput, setCustomInput] = useState('')

    const handleSetTasks = () => {
        if (customInput.trim()) {
            const input = customInput.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
            if (input.length > 0) {
                setTasks(input)
                setCustomInput('')
            }
        }
    }

    return (
        <div className="tsv-input-panel">
            <div className="tsv-examples">
                {EXAMPLES.map((ex, idx) => (
                    <motion.button
                        key={`${ex.label}-${idx}`}
                        className="tsv-chip"
                        onClick={() => {
                            applyExample(ex)
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {ex.label}
                    </motion.button>
                ))}
            </div>

            <div className="tsv-input-group">
                <label>Tasks (letters):</label>
                <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g., AAABBB or AaBbCc"
                    onKeyDown={(e) => e.key === 'Enter' && handleSetTasks()}
                />
                <motion.button
                    className="tsv-btn"
                    onClick={handleSetTasks}
                    whileHover={{ backgroundColor: '#4f46e5' }}
                    whileTap={{ scale: 0.98 }}
                >
                    Set Tasks
                </motion.button>
            </div>

            <div className="tsv-input-group">
                <label>Cooldown Period (n):</label>
                <motion.input
                    type="number"
                    value={n}
                    onChange={(e) => setN(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                    max="26"
                />
            </div>
        </div>
    )
}

export default function TaskSchedulerVisualizer() {
    const [tasks, setTasks] = useState(['A', 'A', 'A', 'B', 'B', 'B'])
    const [n, setN] = useState(2)

    const steps = useMemo(() => generateSteps(tasks, n), [tasks, n])
    const {
        stepIndex,
        stepForward,
        stepBack,
        togglePlay,
        handleReset,
        isPlaying,
        speed,
        setSpeed,
        isDone,
    } = usePlaybackState(steps.length, 500)

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    // Pattern overlay hook
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    // Code visual connectivity hook
    const { highlightedElements, setHighlightedElements } = useCodeVisualConnectivity()

    const applyExample = useCallback((example) => {
        setTasks(example.tasks)
        setN(example.n || 2)
        handleReset()
    }, [handleReset])

    const dockPanels = useMemo(() => [
        {
            id: 'input',
            title: 'Input',
            content: <InputPanel tasks={tasks} n={n} setTasks={setTasks} setN={setN} applyExample={applyExample} />,
        },
        {
            id: 'timeline',
            title: 'Timeline',
            content: <TimelineViz tasks={tasks} n={n} step={step} />,
        },
        {
            id: 'freq-viz',
            title: 'Task Frequency',
            content: <TaskFrequencyViz step={step} />,
        },
        {
            id: 'state-viz',
            title: 'Algorithm State',
            content: <AlgorithmStateViz step={step} />,
        },
        {
            id: 'code',
            title: 'Code Trace',
            content: <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
            />,
        },
    ], [tasks, n, step, applyExample])

    return (
        <div className="problem-shell">
            <DockableWorkspace
                panels={dockPanels}
                initialLayout={{
                    rows: [
                        ['input', 'timeline'],
                        ['freq-viz', 'state-viz'],
                        ['code'],
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
                    prevDisabled={stepIndex < 0}
                    nextDisabled={isDone}
                    isPlaying={isPlaying}
                    isDone={isDone}
                    speed={speed}
                    onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                    speedIndicator={`${speed}ms`}
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
