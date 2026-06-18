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
import './GrayCodeVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'def grayCode(n):' },
    { line: 2, text: '    result = []' },
    { line: 3, text: '    for i in range(1 << n):' },
    { line: 4, text: '        result.append(i ^ (i >> 1))' },
    { line: 5, text: '    return result' },
]

function toBinary(num, bits) {
    return (num >>> 0).toString(2).padStart(bits, '0')
}

function generateSteps(n) {
    const steps = []
    const max = 1 << n
    const result = []

    steps.push({
        phase: 'init',
        activeLine: 2,
        i: -1,
        result: [],
        grayValue: null,
        message: `Initialize: generating ${max} Gray codes for n=${n}`,
    })

    for (let i = 0; i < max; i++) {
        const shifted = i >> 1
        const grayValue = i ^ shifted

        steps.push({
            phase: 'compute',
            activeLine: 4,
            i,
            shifted,
            grayValue,
            result: [...result],
            binary: toBinary(i, n),
            shiftedBinary: toBinary(shifted, n),
            grayBinary: toBinary(grayValue, n),
            message: `i=${i} (${toBinary(i, n)}₂), i>>1=${shifted} (${toBinary(shifted, n)}₂), gray=${grayValue} (${toBinary(grayValue, n)}₂)`,
        })

        result.push(grayValue)

        steps.push({
            phase: 'add',
            activeLine: 4,
            i,
            grayValue,
            result: [...result],
            message: `Add ${grayValue} to result`,
        })
    }

    steps.push({
        phase: 'done',
        activeLine: 5,
        i: -1,
        result,
        grayValue: null,
        message: `Done. Generated ${result.length} Gray codes: [${result.join(', ')}]`,
    })

    return steps
}

const EXAMPLES = getExamples('gray-code')

export default function GrayCodeVisualizer() {
    const [nInput, setNInput] = useState('3')
    const SOLUTION_CODE = useSolutionCode('gray-code')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { n, inputError } = useMemo(() => {
        const v = parseInt(nInput, 10)
        if (Number.isNaN(v) || v < 0 || v > 8) return { n: 3, inputError: 'n must be 0–8' }
        return { n: v, inputError: '' }
    }, [nInput])

    const steps = useMemo(() => generateSteps(n), [n])
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

    const applyExample = useCallback((ex) => {
        setNInput(String(ex.n))
        handleReset()
    }, [handleReset])

    const dockPanels = useMemo(() => [
        {
            id: 'code',
            title: 'Code',
            content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        },
        {
            id: 'viz',
            title: '🔢 Gray Code',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {EXAMPLES && EXAMPLES.length > 0 && EXAMPLES.map(ex => <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                            {ex.label}
                        </button>)}
                        <label style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>n = <input type="number" min="0" max="8" value={nInput} onChange={e => { setNInput(e.target.value); handleReset() }} style={{ width: 50, padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} /></label>
                    </div>
                    {inputError && <div style={{ color: '#991b1b', fontSize: 11 }}>{inputError}</div>}

                    {step?.phase === 'compute' && (
                        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11, fontFamily: 'monospace' }}>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 'bold', color: '#0c4a6e' }}>i = {step.i}</span>
                                <span style={{ marginLeft: 8 }}>({step.binary}₂)</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 'bold', color: '#0c4a6e' }}>i >> 1 = {step.shifted}</span>
                                <span style={{ marginLeft: 8 }}>({step.shiftedBinary}₂)</span>
                            </div>
                            <div style={{ marginBottom: 8 }}>
                                <span style={{ fontWeight: 'bold', color: '#0c4a6e' }}>XOR = {step.grayValue}</span>
                                <span style={{ marginLeft: 8 }}>({step.grayBinary}₂)</span>
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Result Sequence</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, overflow: 'auto', alignItems: 'flex-start' }}>
                        <AnimatePresence mode="popLayout">
                            {(step?.result ?? []).map((val, idx) => {
                                const isActive = step?.phase === 'add' && idx === (step?.result?.length - 1)
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: isActive ? 1.1 : 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        style={{
                                            minWidth: 56,
                                            padding: '8px 6px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: isActive ? '#fbbf24' : '#f0fdf4',
                                            border: isActive ? '2px solid #f59e0b' : '1px solid #86efac',
                                            borderRadius: 4,
                                            fontSize: 11,
                                            fontWeight: 'bold',
                                            color: '#15803d',
                                        }}
                                    >
                                        <span>{val}</span>
                                        <span style={{ fontSize: 9, color: '#65a30d' }}>{toBinary(val, n)}</span>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>

                    {step?.phase === 'done' && (
                        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', fontSize: 11, fontWeight: 'bold', color: '#15803d' }}>
                            ✓ Generated {step.result.length} Gray codes
                        </div>
                    )}
                </div>
            )
        }
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, nInput, inputError, applyExample, n])

    return (
        <div className="problem-shell">
            <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
            <FloatingPanel title="Playback Controls">
                <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
            </FloatingPanel>
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
