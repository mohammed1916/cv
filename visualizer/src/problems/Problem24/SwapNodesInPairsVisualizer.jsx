import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamples } from '../../config/examplesRegistry'
import './SwapNodesInPairsVisualizer.css'

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def swapPairs(self, head: ListNode) -> ListNode:' },
    { line: 3, text: '        dummy = ListNode(0, head)' },
    { line: 4, text: '        prev = dummy' },
    { line: 5, text: '        while prev.next and prev.next.next:' },
    { line: 6, text: '            first = prev.next' },
    { line: 7, text: '            second = prev.next.next' },
    { line: 8, text: '            prev.next = second' },
    { line: 9, text: '            first.next = second.next' },
    { line: 10, text: '            second.next = first' },
    { line: 11, text: '            prev = first' },
    { line: 12, text: '        return dummy.next' },
]

const SWAPNODESINPAIRS_PATTERNS = ['advance', 'check_end', 'check_pair', 'done', 'identify', 'init', 'swap_done', 'swap_start']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'init',
  5: 'check_pair',
  6: 'identify',
  8: 'swap_start',
  10: 'swap_done',
  11: 'advance',
  12: 'done',
}

function generateSteps(values) {
    const steps = []

    if (!values || values.length === 0) {
        steps.push({
            phase: 'done', activeLine: 12,
            nodes: [], swaps: [], prevIdx: -1, firstIdx: -1, secondIdx: -1,
            message: 'Empty list. Return None.',
        })
        return steps
    }

    const n = values.length
    const nodes = [...values]
    const swaps = [] // track which pairs were swapped: [0,1], [2,3], ...

    steps.push({
        phase: 'init', activeLine: 4,
        nodes: [...nodes], swaps: [...swaps], prevIdx: -1, firstIdx: -1, secondIdx: -1,
        message: 'Create dummy node. prev = dummy.',
    })

    let prevIdx = -1 // -1 represents dummy, 0+ are actual nodes
    let i = 0

    while (i + 1 < n) {
        const firstIdx = i
        const secondIdx = i + 1

        steps.push({
            phase: 'check_pair', activeLine: 5,
            nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx, secondIdx,
            message: `Found pair: node[${firstIdx}]=${nodes[firstIdx]} and node[${secondIdx}]=${nodes[secondIdx]}`,
        })

        steps.push({
            phase: 'identify', activeLine: 6,
            nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx, secondIdx,
            message: `first = node[${firstIdx}], second = node[${secondIdx}]`,
        })

        steps.push({
            phase: 'swap_start', activeLine: 8,
            nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx, secondIdx,
            message: `Swap pair: ${nodes[firstIdx]} <-> ${nodes[secondIdx]}`,
        })

        // Actually swap the nodes
        ;[nodes[firstIdx], nodes[secondIdx]] = [nodes[secondIdx], nodes[firstIdx]]
        swaps.push([firstIdx, secondIdx])

        steps.push({
            phase: 'swap_done', activeLine: 10,
            nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx: secondIdx, secondIdx: firstIdx,
            message: `Pair swapped. new order: ${nodes[firstIdx]} <-> ${nodes[secondIdx]}`,
        })

        prevIdx = firstIdx
        i += 2

        steps.push({
            phase: 'advance', activeLine: 11,
            nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx: -1, secondIdx: -1,
            message: `Move prev to next pair position (prev = node[${firstIdx}])`,
        })
    }

    steps.push({
        phase: 'check_end', activeLine: 5,
        nodes: [...nodes], swaps: [...swaps], prevIdx, firstIdx: -1, secondIdx: -1,
        message: i + 1 >= n ? 'Remaining node or end of list. Exit loop.' : 'No more pairs. Exit loop.',
    })

    steps.push({
        phase: 'done', activeLine: 12,
        nodes: [...nodes], swaps: [...swaps], prevIdx: -1, firstIdx: -1, secondIdx: -1,
        message: `Done! Result: [${nodes.join(', ')}]`,
    })

    return steps
}


export default function SwapNodesInPairsVisualizer() {
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

    // Extract panels as consts
    const primaryPanel = (
        <div className="snip-panel main">
            <header className="snip-head">
                <span>Linked List · Pair Swaps</span>
                {inputError && <span className="snip-error">{inputError}</span>}
            </header>
            <div className="snip-body">
                <div className="snip-examples">
                    {getExamples('swap-nodes-in-pairs').map((ex) => (
                        <button key={ex.label} className="snip-chip" onClick={() => { setValInput(JSON.stringify(ex.values)); handleReset(); }}>
                            {ex.label}
                        </button>
                    ))}
                </div>
                <div className="snip-input-row">
                    <input
                        className="snip-input"
                        value={valInput}
                        onChange={(e) => { setValInput(e.target.value); handleReset() }}
                        placeholder="[1,2,3,4,5]"
                    />
                </div>

                {/* Linked list visualization */}
                <div className="snip-canvas">
                    <div className="snip-nodes">
                        {nodes.map((val, idx) => {
                            const isFirst = step?.firstIdx === idx
                            const isSecond = step?.secondIdx === idx
                            const isSwapping = step?.phase === 'swap_start' || step?.phase === 'swap_done'
                            const isSwapped = step?.swaps?.some(([a, b]) => (a === idx || b === idx)) && step?.phase !== 'swap_start'
                            const isDone = step?.phase === 'done'

                            return (
                                <div key={idx} className="snip-node-wrap">
                                    <motion.div
                                        className={`snip-node${isFirst && isSwapping ? ' first' : ''}${isSecond && isSwapping ? ' second' : ''}${isSwapped && !isSwapping ? ' swapped' : ''}${isDone ? ' done' : ''}`}
                                        animate={{
                                            y: (isFirst || isSecond) && isSwapping ? -12 : 0,
                                            scale: isSwapping && (isFirst || isSecond) ? 1.15 : 1,
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                                    >
                                        {val}
                                    </motion.div>
                                    <div className="snip-ptrs">
                                        {isFirst && isSwapping && <span className="snip-ptr snip-ptr-first">first</span>}
                                        {isSecond && isSwapping && <span className="snip-ptr snip-ptr-second">second</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Arrows between nodes */}
                    <svg className="snip-arrows-svg" aria-hidden="true">
                        {Array.from({ length: nodes.length - 1 }).map((_, idx) => {
                            const fromX = idx * 90 + 32
                            const toX = (idx + 1) * 90 + 32
                            const y = 32
                            const isHighlighted = step?.swaps?.some(([a, b]) => (a === idx && b === idx + 1) || (a === idx + 1 && b === idx))
                            return (
                                <g key={idx}>
                                    <line
                                        x1={fromX + 20}
                                        y1={y}
                                        x2={toX - 22}
                                        y2={y}
                                        className={`snip-arrow-line${isHighlighted ? ' highlighted' : ''}`}
                                    />
                                    <polygon
                                        points={`${toX - 22},${y - 5} ${toX - 10},${y} ${toX - 22},${y + 5}`}
                                        className={`snip-arrow-head${isHighlighted ? ' highlighted' : ''}`}
                                    />
                                </g>
                            )
                        })}
                    </svg>
                </div>

                {/* Legend */}
                <div className="snip-legend">
                    <span className="snip-legend-item first">first — first node of pair</span>
                    <span className="snip-legend-item second">second — second node of pair</span>
                    <span className="snip-legend-item swapped">swapped — completed swap</span>
                </div>
            </div>
        </div>
    )

    const statePanel = (
        <div className="snip-panel side">
            <header className="snip-head"><span>Swap State</span></header>
            <div className="snip-body">
                {[
                    { label: 'prev', val: step?.prevIdx != null && step.prevIdx >= 0 ? `node(${nodes[step.prevIdx]})` : 'dummy', cls: 'prev' },
                    { label: 'first', val: step?.firstIdx != null && step.firstIdx >= 0 ? `node(${nodes[step.firstIdx]})` : '—', cls: 'first' },
                    { label: 'second', val: step?.secondIdx != null && step.secondIdx >= 0 ? `node(${nodes[step.secondIdx]})` : '—', cls: 'second' },
                ].map(({ label, val, cls }) => (
                    <div key={label} className="snip-state-row">
                        <span className={`snip-state-label ${cls}`}>{label}</span>
                        <span className="snip-state-val mono">{val}</span>
                    </div>
                ))}

                {step?.phase === 'done' && (
                    <motion.div
                        className="snip-result"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Swaps completed: {step.swaps?.length ?? 0}
                    </motion.div>
                )}
            </div>
        </div>
    )

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                autoScroll={autoScrollCode}
                disableResizer
            />
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

    const statusPanel = (
        <div className="snip-status">
            {step?.message ?? 'Press Play or Step to begin.'}
        </div>
    )

    const playbackPanel = (
        <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={SWAPNODESINPAIRS_PATTERNS} />
            )}
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
        </>
    )

    // Lumino state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Linked List · Pair Swaps', dockMode: 'split-right' },
            { id: 'state', title: 'Swap State', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="snip-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.state && createPortal(statePanel, panelDivs.state)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
                document.body
            )}
        </div>
    )
}
