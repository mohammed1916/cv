import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './CountingBitsVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['done', 'fill', 'init']
const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'fill',
  6: 'done'
}


const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def countBits(self, n):' },
    { line: 3, text: '        dp = [0] * (n + 1)' },
    { line: 4, text: '        for i in range(1, n + 1):' },
    { line: 5, text: '            dp[i] = dp[i >> 1] + (i & 1)' },
    { line: 6, text: '        return dp' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(n) {
    const steps = []
    const dp = new Array(n + 1).fill(0)
    steps.push({ phase: 'init', activeLine: 3, i: -1, dp: [...dp], message: 'Initialize dp array with all zeros.' })

    for (let i = 1; i <= n; i++) {
        dp[i] = dp[i >> 1] + (i & 1)
        steps.push({
            phase: 'fill', activeLine: 5, i,
            dp: [...dp],
            half: i >> 1,
            lsb: i & 1,
            binary: i.toString(2),
            message: `dp[${i}] = dp[${i >> 1}] + (${i} & 1) = ${dp[i >> 1]} + ${i & 1} = ${dp[i]}   (${i} in binary: ${i.toString(2)})`,
        })
    }

    steps.push({ phase: 'done', activeLine: 6, i: -1, dp: [...dp], message: `Done. dp = [${dp.join(', ')}]` })
    return steps
}

const EXAMPLES = getExamples('counting-bits')

export default function CountingBitsVisualizer() {
    const [nInput, setNInput] = useState('5')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { n, inputError } = useMemo(() => {
        const v = parseInt(nInput, 10)
        if (Number.isNaN(v) || v < 0 || v > 20) return { n: 5, inputError: 'n must be 0–20' }
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
            title: '📊 Counting Bits',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {EXAMPLES.map(ex => <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                            {ex.label}
                        </button>)}
                        <label style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>n = <input type="number" min="0" max="20" value={nInput} onChange={e => { setNInput(e.target.value); handleReset() }} style={{ width: 50, padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} /></label>
                    </div>
                    {inputError && <div style={{ color: '#991b1b', fontSize: 11 }}>{inputError}</div>}
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>DP Array</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1, overflow: 'auto' }}>
                        {(step?.dp ?? []).map((val, i) => {
                            const isActive = step?.i === i
                            const isHalf = step?.half === i && step?.i !== -1
                            return (
                                <motion.div key={i} animate={isActive ? { y: -8, scale: 1.15 } : { y: 0, scale: 1 }} style={{
                                    minWidth: 50, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isActive ? '#fbbf24' : isHalf ? '#dbeafe' : step?.phase === 'done' ? '#f0fdf4' : '#f3f4f6',
                                    border: isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1', borderRadius: 4, fontSize: 11, fontWeight: 'bold'
                                }}>
                                    <span>{val}</span>
                                    <span style={{ fontSize: 9, color: '#64748b' }}>{i.toString(2)}</span>
                                </motion.div>
                            )
                        })}
                    </div>
                    {step?.i > 0 && (
                        <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0', fontSize: 11 }}>
                            <div>i = {step.i} ({step.binary}₂)</div>
                            <div>i{'>>'}1 = {step.half}</div>
                            <div>i & 1 = {step.lsb} ({step.lsb ? 'odd' : 'even'})</div>
                            <div style={{ fontWeight: 'bold', color: '#0ea5e9' }}>dp[{step.i}] = {step.dp?.[step.i]}</div>
                        </div>
                    )}
                    {step?.phase === 'done' && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', fontSize: 11, fontWeight: 'bold', color: '#15803d' }}>✓ {`[${step.dp.join(', ')}]`}</div>}
                </div>
            )
        }
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, nInput, inputError, applyExample])

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
