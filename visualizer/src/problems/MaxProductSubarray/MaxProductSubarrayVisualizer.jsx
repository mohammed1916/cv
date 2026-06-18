import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import './MaxProductSubarrayVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def maxProduct(self, nums):' },
    { line: 3, text: '        curMax = curMin = res = nums[0]' },
    { line: 4, text: '        for num in nums[1:]:' },
    { line: 5, text: '            candidates = (num, curMax*num, curMin*num)' },
    { line: 6, text: '            curMax = max(candidates)' },
    { line: 7, text: '            curMin = min(candidates)' },
    { line: 8, text: '            res = max(res, curMax)' },
    { line: 9, text: '        return res' },
]

function parseNums(input) {
    const parsed = JSON.parse(input)
    if (!Array.isArray(parsed)) throw new Error('Input must be an array')
    return parsed.map((n) => {
        const v = Number(n)
        if (Number.isNaN(v)) throw new Error('Values must be numbers')
        return v
    })
}

function generateSteps(nums) {
    const steps = []
    if (!nums.length) return [{ phase: 'done', activeLine: 9, i: -1, curMax: 0, curMin: 0, res: 0, candidates: [], message: 'Empty array.' }]

    let curMax = nums[0]
    let curMin = nums[0]
    let res = nums[0]

    steps.push({ phase: 'init', activeLine: 3, i: 0, curMax, curMin, res, candidates: [], message: `Init: curMax=curMin=res=${nums[0]}` })

    for (let i = 1; i < nums.length; i++) {
        const num = nums[i]
        const candidates = [num, curMax * num, curMin * num]
        const newMax = Math.max(...candidates)
        const newMin = Math.min(...candidates)
        const newRes = Math.max(res, newMax)

        steps.push({
            phase: 'calc', activeLine: 6, i, curMax: newMax, curMin: newMin, res: newRes,
            candidates, prevMax: curMax, prevMin: curMin,
            message: `i=${i}, num=${num}: candidates=[${candidates.join(', ')}] → curMax=${newMax}, curMin=${newMin}, res=${newRes}`,
        })

        curMax = newMax
        curMin = newMin
        res = newRes
    }

    steps.push({ phase: 'done', activeLine: 9, i: nums.length - 1, curMax, curMin, res, candidates: [], message: `Max product = ${res}` })
    return steps
}

const EXAMPLES = getExamples('max-product-subarray')

export default function MaxProductSubarrayVisualizer() {
    const [numsInput, setNumsInput] = useState('[2,3,-2,4]')
    const SOLUTION_CODE = useSolutionCode('maximum-product-subarray')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { nums, inputError } = useMemo(() => {
        try {
            return { nums: parseNums(numsInput), inputError: '' }
        } catch (e) {
            return { nums: [2, 3, -2, 4], inputError: e.message || 'Invalid input' }
        }
    }, [numsInput])

    const steps = useMemo(() => generateSteps(nums), [nums])
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

    const applyExample = useCallback((ex) => {
        setNumsInput(JSON.stringify(ex.nums))
        handleReset()
    }, [handleReset])

    const dockPanels = useMemo(() => [
        {
            id: 'code',
            title: 'Code',
            content: (
                <CodeTracePanel
                    step={step}
                    codeLines={SOLUTION_CODE}
                    highlightedLines={connectivity.highlightedLines}
                    onLineSelect={connectivity.handleLineSelect}
                    onActiveLineDomChange={setActiveLineDom}
                />
            ),
        },
        {
            id: 'viz',
            title: '📊 Max Product',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {EXAMPLES.map(ex => (
                            <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                                {ex.label}
                            </button>
                        ))}
                    </div>

                    <div>
                        <input style={{ width: '100%', padding: '8px', borderRadius: 4, border: inputError ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }} value={numsInput} onChange={e => { setNumsInput(e.target.value); handleReset() }} />
                        {inputError && <div style={{ color: '#991b1b', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Array</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {nums.map((val, i) => {
                            const isActive = step?.i === i
                            return (
                                <motion.div key={i} animate={isActive ? { y: -8, scale: 1.2 } : { y: 0, scale: 1 }} style={{
                                    width: 50, height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isActive ? '#fbbf24' : val < 0 ? '#fee2e2' : val === 0 ? '#f3f4f6' : '#dbeafe',
                                    border: isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1', borderRadius: 4
                                }}>
                                    <span style={{ fontSize: 10, color: '#64748b' }}>{i}</span>
                                    <span style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{val}</span>
                                </motion.div>
                            )
                        })}
                    </div>

                    {step?.candidates?.length > 0 && (
                        <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }}>
                            <div style={{ fontSize: 11, color: '#92400e', marginBottom: 4 }}>Candidates: [num, curMax×num, curMin×num]</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {step.candidates.map((c, i) => (
                                    <span key={i} style={{
                                        padding: '4px 8px', borderRadius: 3, fontSize: 12, fontWeight: 'bold',
                                        backgroundColor: c === step.curMax ? '#dcfce7' : c === step.curMin ? '#fee2e2' : '#fef3c7',
                                        color: c === step.curMax ? '#15803d' : c === step.curMin ? '#991b1b' : '#92400e'
                                    }}>
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, border: '1px solid #86efac' }}>
                            <div style={{ fontSize: 11, color: '#15803d', marginBottom: 4 }}>curMax</div>
                            <motion.div key={step?.curMax} initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ fontSize: 16, fontWeight: 'bold', color: '#15803d' }}>
                                {step?.curMax ?? '—'}
                            </motion.div>
                        </div>
                        <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6, border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: 11, color: '#991b1b', marginBottom: 4 }}>curMin</div>
                            <motion.div key={step?.curMin} initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ fontSize: 16, fontWeight: 'bold', color: '#991b1b' }}>
                                {step?.curMin ?? '—'}
                            </motion.div>
                        </div>
                        <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #0ea5e9' }}>
                            <div style={{ fontSize: 11, color: '#1e40af', marginBottom: 4 }}>result</div>
                            <motion.div key={step?.res} initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ fontSize: 16, fontWeight: 'bold', color: '#1e40af' }}>
                                {step?.res ?? '—'}
                            </motion.div>
                        </div>
                    </div>

                    {step?.phase === 'done' && (
                        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>
                            ✓ Max product = {step.res}
                        </div>
                    )}
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, nums, numsInput, inputError, applyExample])

    return (
        <div className="problem-shell">
            <DockableWorkspace
                panels={dockPanels}
                initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
            />
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
                    onSpeedChange={e => setSpeed(Number(e.target.value))}
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
