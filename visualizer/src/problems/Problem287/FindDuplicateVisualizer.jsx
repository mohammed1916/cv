import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './FindDuplicateVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'def findDuplicate(nums):' },
    { line: 2, text: '    slow = fast = nums[0]' },
    { line: 3, text: '    while True:' },
    { line: 4, text: '        slow = nums[slow]' },
    { line: 5, text: '        fast = nums[nums[fast]]' },
    { line: 6, text: '        if slow == fast: break' },
    { line: 7, text: '    slow = nums[0]' },
    { line: 8, text: '    while slow != fast:' },
    { line: 9, text: '        slow = nums[slow]' },
    { line: 10, text: '        fast = nums[fast]' },
    { line: 11, text: '    return slow  # duplicate' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
    const steps = []
    const n = nums.length

    let slow = nums[0]
    let fast = nums[0]

    steps.push({
        phase: 'init', activeLine: 2, slow, fast,
        phase1Done: false, result: null,
        message: `Init slow=${slow} fast=${fast}`,
    })

    // Phase 1: detect cycle
    while (true) {
        slow = nums[slow]
        fast = nums[nums[fast]]
        const met = slow === fast

        steps.push({
            phase: 'phase1', activeLine: met ? 6 : 5, slow, fast,
            phase1Done: false, result: null,
            message: met
                ? `slow=fast=${slow} → cycle detected`
                : `slow→${slow}, fast→${fast}`,
        })

        if (met) break
    }

    steps.push({
        phase: 'phase1-done', activeLine: 7, slow, fast: nums[0],
        phase1Done: true, result: null,
        message: `Reset slow to nums[0]=${nums[0]}, keep fast=${slow}`,
    })

    // Phase 2: find entrance
    slow = nums[0]
    fast = slow === fast ? fast : fast // fast stays

    while (slow !== fast) {
        slow = nums[slow]
        fast = nums[fast]

        steps.push({
            phase: 'phase2', activeLine: slow === fast ? 11 : 10, slow, fast,
            phase1Done: true, result: slow === fast ? slow : null,
            message: slow === fast
                ? `slow=fast=${slow} → duplicate found!`
                : `slow→${slow}, fast→${fast}`,
        })
    }

    steps.push({
        phase: 'done', activeLine: 11, slow, fast,
        phase1Done: true, result: slow,
        message: `Duplicate = ${slow}`,
    })

    return steps
}

const EXAMPLES = getExamples('find-duplicate')

// Visualization component for array and pointers
function ArrayVisualizationPanel({ nums, step }) {
    return (
        <div className="fd-array-container">
            <div className="fd-array-wrap">
                <div className="fd-indices">
                    {nums.map((_, i) => <span key={i} className="fd-idx">{i}</span>)}
                </div>
                <div className="fd-cells">
                    {nums.map((v, i) => {
                        const isSlow = step?.slow === i
                        const isFast = step?.fast === i
                        const isDup = step?.result === v && v === i
                        return (
                            <motion.div
                                key={i}
                                className={`fd-cell ${isSlow ? 'slow' : ''} ${isFast ? 'fast' : ''} ${isSlow && isFast ? 'both' : ''}`}
                                animate={isSlow || isFast ? { scale: 1.15 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                            >
                                {v}
                            </motion.div>
                        )
                    })}
                </div>
                {/* Pointer badges below array */}
                <div className="fd-pointers">
                    {nums.map((_, i) => {
                        const isSlow = step?.slow === i
                        const isFast = step?.fast === i
                        return (
                            <div key={i} className="fd-ptr-slot">
                                {isSlow && <span className="fd-ptr slow-ptr">S</span>}
                                {isFast && <span className="fd-ptr fast-ptr">F</span>}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="fd-phase-badge">
                {!step?.phase1Done ? 'Phase 1: Find cycle' : 'Phase 2: Find entrance'}
            </div>
        </div>
    )
}

// Metrics panel component
function MetricsPanel({ step }) {
    return (
        <div className="fd-metrics-container">
            <div className="fd-metric"><span className="fd-label">slow</span><strong className="fd-val slow-color">{step?.slow ?? '—'}</strong></div>
            <div className="fd-metric"><span className="fd-label">fast</span><strong className="fd-val fast-color">{step?.fast ?? '—'}</strong></div>
            <div className={`fd-result ${step?.phase === 'done' ? 'done' : ''}`}>
                {step?.phase === 'done' ? `Duplicate: ${step.result}` : 'Searching…'}
            </div>
            <div className="fd-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

export default function FindDuplicateVisualizer() {
    const [numsInput, setNumsInput] = useState('[1,3,4,2,2]')
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const { nums, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(numsInput)
            if (!Array.isArray(parsed)) throw new Error('Must be an array')
            return { nums: parsed.map(Number), inputError: '' }
        } catch (e) {
            return { nums: [1, 3, 4, 2, 2], inputError: e.message }
        }
    }, [numsInput])

    const steps = useMemo(() => generateSteps(nums), [nums])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setNumsInput(JSON.stringify(ex.nums))
        handleReset()
    }, [handleReset])

    // Panel content (relocated out of the old DockableWorkspace panels array)
    const inputPanel = (
        <div className="fd-input-panel">
            <div className="fd-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="fd-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <label className="fd-input-field">
                <span>Array input (JSON format)</span>
                <input
                    className="fd-input"
                    value={numsInput}
                    onChange={(e) => {
                        setNumsInput(e.target.value)
                        handleReset()
                    }}
                />
            </label>
            {inputError && <div className="fd-error-box">{inputError}</div>}
        </div>
    )

    const vizPanel = <ArrayVisualizationPanel nums={nums} step={step} />

    const metricsPanel = <MetricsPanel step={step} />

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                autoScroll={autoScrollCode}
            />
        </div>
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input Setup' },
        { id: 'viz', title: 'Array Visualization', dockMode: 'split-right' },
        { id: 'metrics', title: 'Pointer State', dockMode: 'split-bottom' },
        { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
    ], [])
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="fd-shell">
            <section className="fd-hero">
                <div className="fd-hero-copy">
                    <span className="fd-kicker">LeetCode 287</span>
                    <h2>Find the Duplicate Number</h2>
                    <p>
                        Discover how Floyd's cycle detection algorithm finds a duplicate in an array
                        where each number points to another array index. Two pointers move at different speeds
                        until they collide inside a cycle, revealing the duplicate.
                    </p>
                </div>
            </section>

            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
                    {panelDivs.metrics && createPortal(metricsPanel, panelDivs.metrics)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}

            {createPortal(
                <FloatingPanel title="Playback Controls">
                    <PlaybackControls
                        onReset={handleReset}
                        onPrev={stepBack}
                        onPlayToggle={togglePlay}
                        onNext={stepForward}
                        resetDisabled={steps.length === 0}
                        prevDisabled={stepIndex <= 0}
                        nextDisabled={steps.length === 0 || isDone}
                        isPlaying={isPlaying}
                        isDone={isDone}
                        speed={speed}
                        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                        speedIndicator={`${speed}ms`}
                        autoScroll={autoScrollCode}
                        onAutoScrollChange={setAutoScrollCode}
                        autoScrollLabel="Auto-scroll code"
                        showAutoScroll
                        showPatternOverlay={showPatternOverlay}
                        onShowPatternOverlayChange={setShowPatternOverlay}
                        patternOverlayLabel="Show pattern overlay"
                        showPatternOverlayToggle
                    />
                </FloatingPanel>,
                document.body
            )}

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
