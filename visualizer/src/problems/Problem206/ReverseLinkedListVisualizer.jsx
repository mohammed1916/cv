import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './ReverseLinkedListVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def reverseList(self, head: ListNode) -> ListNode:' },
    { line: 3, text: '        prev = None' },
    { line: 4, text: '        curr = head' },
    { line: 5, text: '        while curr:' },
    { line: 6, text: '            nxt = curr.next' },
    { line: 7, text: '            curr.next = prev' },
    { line: 8, text: '            prev = curr' },
    { line: 9, text: '            curr = nxt' },
    { line: 10, text: '        return prev' },
]

function generateSteps(values) {
    const steps = []

    if (!values || values.length === 0) {
        steps.push({
            phase: 'done', activeLine: 10,
            nodes: [], arrows: [], prev: -1, curr: -1, nxt: -1,
            message: 'Empty list. Return None.',
        })
        return steps
    }

    const n = values.length

    // arrows[i] = true means node i points to node i+1, false = reversed (points left / null)
    // We track the direction each arrow is reversed step by step
    const forwardArrows = Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 }))

    steps.push({
        phase: 'init', activeLine: 3,
        nodes: [...values], arrows: forwardArrows.map(a => ({ ...a, active: false, reversed: false })),
        prev: -1, curr: 0, nxt: -1,
        message: 'Initialize prev = None, curr = head.',
    })

    const arrows = forwardArrows.map(a => ({ ...a, reversed: false, active: false }))
    let curr = 0

    while (curr < n) {
        const nxt = curr + 1 < n ? curr + 1 : -1

        steps.push({
            phase: 'save_nxt', activeLine: 6,
            nodes: [...values], arrows: arrows.map(a => ({ ...a })),
            prev: curr - 1, curr, nxt,
            message: `Save nxt = ${nxt >= 0 ? `node(${values[nxt]})` : 'None'}.`,
        })

        // Mark the arrow from curr as active (about to reverse)
        const arrowIdx = curr  // arrow between node curr and curr+1
        if (arrowIdx < n - 1) {
            arrows[arrowIdx] = { ...arrows[arrowIdx], active: true }
        }

        steps.push({
            phase: 'reverse_arrow', activeLine: 7,
            nodes: [...values], arrows: arrows.map(a => ({ ...a })),
            prev: curr - 1, curr, nxt,
            message: `Reverse curr.next: node(${values[curr]}).next = ${curr > 0 ? `node(${values[curr - 1]})` : 'None'}.`,
        })

        // Actually reverse the arrow
        if (arrowIdx < n - 1) {
            arrows[arrowIdx] = { from: arrowIdx + 1, to: arrowIdx, reversed: true, active: false }
        }

        steps.push({
            phase: 'move_prev', activeLine: 8,
            nodes: [...values], arrows: arrows.map(a => ({ ...a })),
            prev: curr, curr, nxt,
            message: `prev = curr = node(${values[curr]}).`,
        })

        const prevNode = curr
        curr = nxt

        steps.push({
            phase: 'move_curr', activeLine: 9,
            nodes: [...values], arrows: arrows.map(a => ({ ...a })),
            prev: prevNode, curr: nxt, nxt: -1,
            message: curr >= 0 ? `curr = nxt = node(${values[curr]}).` : 'curr = None. Loop ends.',
        })
    }

    steps.push({
        phase: 'done', activeLine: 10,
        nodes: [...values], arrows: arrows.map(a => ({ ...a })),
        prev: n - 1, curr: -1, nxt: -1,
        message: `Done! List reversed. New head = node(${values[n - 1]}).`,
    })

    return steps
}

const EXAMPLES = getExamples('reverse-linked-list')

function ReverseLinkedListViz({ step, values, nodes, arrows, EXAMPLES, valInput, setValInput, handleReset, inputError }) {
    const handleExampleClick = useCallback((ex) => {
        setValInput(JSON.stringify(ex.values))
        handleReset()
    }, [setValInput, handleReset])

    return (
        <section className="rll-panel main">
            <header className="rll-head">
                <span>Linked List · Pointer Reversal</span>
                {inputError && <span className="rll-error">{inputError}</span>}
            </header>
            <div className="rll-body">
                <div className="rll-examples">
                    {EXAMPLES.map((ex) => (
                        <button key={ex.label} className="rll-chip" onClick={() => handleExampleClick(ex)}>
                            {ex.label}
                        </button>
                    ))}
                </div>
                <div className="rll-input-row">
                    <input
                        className="rll-input"
                        value={valInput}
                        onChange={(e) => { setValInput(e.target.value); handleReset() }}
                        placeholder="[1,2,3,4,5]"
                    />
                </div>

                {/* Node row */}
                <div className="rll-canvas">
                    <svg className="rll-arrows-svg" aria-hidden="true">
                        {arrows.map((arrow, idx) => {
                            const fromX = arrow.from * 90 + 32
                            const toX = arrow.to * 90 + 32
                            const y = 32
                            const dir = arrow.reversed ? -1 : 1
                            return (
                                <g key={idx}>
                                    <line
                                        x1={fromX + (dir > 0 ? 20 : -20)}
                                        y1={y}
                                        x2={toX + (dir > 0 ? -22 : 22)}
                                        y2={y}
                                        className={`rll-arrow-line${arrow.active ? ' active' : ''}${arrow.reversed ? ' reversed' : ''}`}
                                    />
                                    {/* arrowhead */}
                                    <polygon
                                        points={`${toX + (dir > 0 ? -22 : 22)},${y - 5} ${toX + (dir > 0 ? -10 : 10)},${y} ${toX + (dir > 0 ? -22 : 22)},${y + 5}`}
                                        className={`rll-arrow-head${arrow.reversed ? ' reversed' : ''}`}
                                    />
                                </g>
                            )
                        })}
                    </svg>

                    <div className="rll-nodes">
                        {nodes.map((val, idx) => {
                            const isCurr = step?.curr === idx
                            const isPrev = step?.prev === idx
                            const isNxt = step?.nxt === idx
                            const isDone = step?.phase === 'done'
                            return (
                                <div key={idx} className="rll-node-wrap">
                                    <motion.div
                                        className={`rll-node${isCurr ? ' curr' : ''}${isPrev ? ' prev' : ''}${isNxt ? ' nxt' : ''}${isDone ? ' done' : ''}`}
                                        animate={{ y: isCurr ? -10 : 0, scale: isCurr ? 1.15 : 1 }}
                                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                                    >
                                        {val}
                                    </motion.div>
                                    <div className="rll-ptrs">
                                        {isPrev && <span className="rll-ptr rll-ptr-prev">prev</span>}
                                        {isCurr && <span className="rll-ptr rll-ptr-curr">curr</span>}
                                        {isNxt && <span className="rll-ptr rll-ptr-nxt">nxt</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="rll-legend">
                    <span className="rll-legend-item prev">prev — last reversed node</span>
                    <span className="rll-legend-item curr">curr — current node</span>
                    <span className="rll-legend-item nxt">nxt — saved next</span>
                </div>
            </div>
        </section>
    )
}

function ReverseLinkedListPointerState({ step, nodes }) {
    return (
        <section className="rll-panel side">
            <header className="rll-head"><span>Pointer State</span></header>
            <div className="rll-body">
                {[
                    { label: 'prev', val: step?.prev != null && step.prev >= 0 ? `node(${nodes[step.prev]})` : 'None', cls: 'prev' },
                    { label: 'curr', val: step?.curr != null && step.curr >= 0 ? `node(${nodes[step.curr]})` : 'None', cls: 'curr' },
                    { label: 'nxt', val: step?.nxt != null && step.nxt >= 0 ? `node(${nodes[step.nxt]})` : 'None', cls: 'nxt' },
                ].map(({ label, val, cls }) => (
                    <div key={label} className="rll-state-row">
                        <span className={`rll-state-label ${cls}`}>{label}</span>
                        <span className="rll-state-val mono">{val}</span>
                    </div>
                ))}

                {step?.phase === 'done' && (
                    <motion.div
                        className="rll-result"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        New head = node({nodes[nodes.length - 1]})
                    </motion.div>
                )}
            </div>
        </section>
    )
}

export default function ReverseLinkedListVisualizer() {
    const [valInput, setValInput] = useState('[1,2,3,4,5]')

    const { values, inputError } = useMemo(() => {
        try {
            const v = JSON.parse(valInput)
            if (!Array.isArray(v)) throw new Error('Must be an array')
            if (v.length > 8) throw new Error('Max 8 nodes for clarity')
            return { values: v, inputError: '' }
        } catch (e) {
            return { values: [1, 2, 3, 4, 5], inputError: e.message || 'Invalid input' }
        }
    }, [valInput])

    const steps = useMemo(() => generateSteps(values), [values])

    const {
        stepIndex, stepForward, stepBack, togglePlay,
        handleReset, isPlaying, speed, setSpeed, isDone,
    } = usePlaybackState(steps.length)

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const nodes = step?.nodes ?? values
    const arrows = step?.arrows ?? []

    const codePanel = (
        <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} />
    )

    const vizPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"val","label":"val","type":"array"}]}
        values={{ val: valInput }}
        onChange={(k, v) => { if (k === 'val') setValInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

        <div className="rll-top">
            <ReverseLinkedListViz
                step={step}
                values={values}
                nodes={nodes}
                arrows={arrows}
                EXAMPLES={EXAMPLES}
                valInput={valInput}
                setValInput={setValInput}
                handleReset={handleReset}
                inputError={inputError}
            />
            <ReverseLinkedListPointerState step={step} nodes={nodes} />
        </div>
    
    </>)

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(() => [
        { id: 'code', title: 'Code' },
        { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
    ], [])
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="problem-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
                </>
            )}

            {createPortal(
                <FloatingPanel title="Playback Controls">
                    <div className="rll-status" style={{ marginBottom: '12px' }}>
                        {step?.message ?? 'Press Play or Step to begin.'}
                    </div>
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
                        showAutoScroll={true}
                        autoScroll={autoScrollCode}
                        onAutoScrollChange={setAutoScrollCode}
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
