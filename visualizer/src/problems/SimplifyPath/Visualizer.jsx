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
    { line: 1, text: 'def simplifyPath(path: str) -> str:' },
    { line: 2, text: '    stack = []' },
    { line: 3, text: '    for part in path.split("/"):' },
    { line: 4, text: '        if part == "" or part == ".":' },
    { line: 5, text: '            continue' },
    { line: 6, text: '        elif part == "..":' },
    { line: 7, text: '            if stack:' },
    { line: 8, text: '                stack.pop()' },
    { line: 9, text: '        else:' },
    { line: 10, text: '            stack.append(part)' },
    { line: 11, text: '    return "/" + "/".join(stack)' },
]

function generateSteps(path) {
    const steps = []
    const parts = path.split('/')
    const stack = []

    // Initial state
    steps.push({
        phase: 'init', activeLine: 2,
        parts, partIndex: -1, currentPart: '',
        stack: [], message: `Input: "${path}". Splitting by "/" to get parts.`,
    })

    // Process each part
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        steps.push({
            phase: 'read', activeLine: 3,
            parts, partIndex: i, currentPart: part,
            stack: [...stack], message: `Process part: "${part || '(empty)'}".`,
        })

        if (part === '' || part === '.') {
            steps.push({
                phase: 'skip', activeLine: 4,
                parts, partIndex: i, currentPart: part,
                stack: [...stack], message: part === '' ? 'Skip empty part (redundant slash).' : 'Skip "." (current directory).',
            })
        } else if (part === '..') {
            steps.push({
                phase: 'parent', activeLine: 6,
                parts, partIndex: i, currentPart: part,
                stack: [...stack], message: 'Go to parent directory (..).',
            })
            if (stack.length > 0) {
                const popped = stack.pop()
                steps.push({
                    phase: 'pop', activeLine: 8,
                    parts, partIndex: i, currentPart: part,
                    stack: [...stack], message: `Pop "${popped}" from stack.`,
                })
            } else {
                steps.push({
                    phase: 'noop', activeLine: 7,
                    parts, partIndex: i, currentPart: part,
                    stack: [...stack], message: 'Already at root. Do nothing.',
                })
            }
        } else {
            steps.push({
                phase: 'push', activeLine: 10,
                parts, partIndex: i, currentPart: part,
                stack: [...stack, part], message: `Push "${part}" to stack.`,
            })
            stack.push(part)
        }
    }

    // Final state
    const result = '/' + stack.join('/')
    steps.push({
        phase: 'done', activeLine: 11,
        parts, partIndex: -1, currentPart: '',
        stack: [...stack], message: `Result: "${result}".`,
    })

    return steps
}

const EXAMPLES = getExamples('simplify-path') || [
    { label: '/a/./b/../../c/', path: '/a/./b/../../c/' },
    { label: '/a//b////c/d//././/..', path: '/a//b////c/d//././/..' },
    { label: '/../', path: '/../' },
    { label: '/home/', path: '/home/' },
]

function VisualizationPanel({ EXAMPLES, applyExample, pathInput, setPathInput, inputError, handleReset, step }) {
    return (
        <div className="simplify-viz-panel">
            <div className="simplify-top">
                <section className="simplify-panel main">
                    <header className="simplify-head">
                        <span>Path Simplification</span>
                        {inputError && <span className="simplify-error">{inputError}</span>}
                    </header>
                    <div className="simplify-body">
                        <div className="simplify-examples">
                            {EXAMPLES.map((ex) => (
                                <button
                                    key={ex.label}
                                    className="simplify-chip"
                                    onClick={() => applyExample(ex)}
                                >
                                    {ex.label}
                                </button>
                            ))}
                        </div>

                        <div className="simplify-section-label">Input Path</div>
                        <input
                            className="simplify-input"
                            value={pathInput}
                            onChange={(e) => { setPathInput(e.target.value); handleReset() }}
                            placeholder="/a/./b/../../c/"
                        />

                        <div className="simplify-section-label">Parts</div>
                        <div className="simplify-parts-container">
                            {(step?.parts ?? []).map((part, i) => (
                                <motion.div
                                    key={i}
                                    className={`simplify-part ${step?.partIndex === i ? 'active' : ''} ${part === '' ? 'empty' : ''} ${part === '.' ? 'dot' : ''} ${part === '..' ? 'dotdot' : ''}`}
                                    animate={{ scale: step?.partIndex === i ? 1.1 : 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    {part === '' ? '(empty)' : part}
                                </motion.div>
                            ))}
                        </div>

                        <div className="simplify-section-label">Directory Stack</div>
                        <div className="simplify-stack">
                            <span className="simplify-bracket">[</span>
                            <AnimatePresence mode="popLayout">
                                {(step?.stack ?? []).map((dir, i) => (
                                    <motion.div
                                        key={`${i}-${dir}`}
                                        className="simplify-stack-item"
                                        initial={{ opacity: 0, y: -14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 14 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                                    >
                                        {dir}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            <span className="simplify-bracket">]</span>
                        </div>

                        <div className="simplify-section-label">Canonical Path</div>
                        <div className="simplify-result">
                            {step?.stack && step.stack.length > 0
                                ? '/' + step.stack.join('/')
                                : '/'}
                        </div>
                    </div>
                </section>
            </div>
            <div className="simplify-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function SimplifyPathVisualizer() {
    const [pathInput, setPathInput] = useState('/a/./b/../../c/')

    const { path, inputError } = useMemo(() => {
        try {
            if (typeof pathInput !== 'string') throw new Error('Must be a string')
            if (!pathInput.startsWith('/')) throw new Error('Must start with /')
            if (pathInput.length > 200) throw new Error('Max length 200')
            return { path: pathInput, inputError: '' }
        } catch (e) {
            return { path: '/a/./b/../../c/', inputError: e.message }
        }
    }, [pathInput])

    const steps = useMemo(() => generateSteps(path), [path])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => { setPathInput(ex.path); handleReset() }, [handleReset])

    const dockPanels = useMemo(() => [
        {
            id: 'viz',
            title: 'Visualization',
            content: <VisualizationPanel EXAMPLES={EXAMPLES} applyExample={applyExample} pathInput={pathInput} setPathInput={setPathInput} inputError={inputError} handleReset={handleReset} step={step} />,
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
