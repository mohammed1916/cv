import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { getExamples } from '../../config/examplesRegistry'
import './BalancedBinaryTreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE = [
    { line: 1, text: 'def isBalanced(root):' },
    { line: 2, text: '    def height(node):' },
    { line: 3, text: '        if not node: return 0' },
    { line: 4, text: '        lh = height(node.left)' },
    { line: 5, text: '        if lh == -1: return -1' },
    { line: 6, text: '        rh = height(node.right)' },
    { line: 7, text: '        if rh == -1: return -1' },
    { line: 8, text: '        if abs(lh - rh) > 1: return -1' },
    { line: 9, text: '        return max(lh, rh) + 1' },
    { line: 10, text: '    return height(root) != -1' },
]

function generateSteps(arr) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{ phase: 'done', activeLine: 3, activeId: -1, heights: new Map(), unbalancedIds: new Set(), result: true, positions, edges, allNodes, message: 'Empty tree → balanced' }]
    }

    const heights = new Map()
    const unbalancedIds = new Set()

    function dfs(node) {
        if (!node) return 0

        steps.push({
            phase: 'recurse-left', activeLine: 4, activeId: node.id,
            heights: new Map(heights), unbalancedIds: new Set(unbalancedIds),
            result: null, positions, edges, allNodes,
            message: `Node ${node.val}: recurse left subtree`,
        })

        const lh = dfs(node.left)

        steps.push({
            phase: 'recurse-right', activeLine: 6, activeId: node.id,
            heights: new Map(heights), unbalancedIds: new Set(unbalancedIds),
            result: null, positions, edges, allNodes,
            message: `Node ${node.val}: lh=${lh === -1 ? '-1(unbalanced)' : lh}, recurse right subtree`,
        })

        const rh = dfs(node.right)

        const lhStr = lh === -1 ? '-1' : lh
        const rhStr = rh === -1 ? '-1' : rh

        if (lh === -1 || rh === -1 || Math.abs(lh - rh) > 1) {
            unbalancedIds.add(node.id)
            steps.push({
                phase: 'unbalanced', activeLine: 8, activeId: node.id,
                heights: new Map(heights), unbalancedIds: new Set(unbalancedIds),
                result: false, positions, edges, allNodes,
                message: `Node ${node.val}: |lh(${lhStr}) - rh(${rhStr})| > 1 → UNBALANCED, return -1`,
            })
            return -1
        }

        const h = Math.max(lh, rh) + 1
        heights.set(node.id, h)
        steps.push({
            phase: 'balanced', activeLine: 9, activeId: node.id,
            heights: new Map(heights), unbalancedIds: new Set(unbalancedIds),
            result: null, positions, edges, allNodes,
            message: `Node ${node.val}: balanced, height = max(${lhStr},${rhStr})+1 = ${h}`,
        })
        return h
    }

    const finalH = dfs(root)
    const result = finalH !== -1

    steps.push({
        phase: 'done', activeLine: 10, activeId: -1,
        heights: new Map(heights), unbalancedIds: new Set(unbalancedIds),
        result, positions, edges, allNodes,
        message: `Result: ${result ? '✓ Balanced' : '✗ Not Balanced'}`,
    })

    return steps
}

const EXAMPLES = getExamples('balanced-binary-tree')

// TreeVisualizationPanel: renders the tree canvas with states
function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
    return (
        <div className="bbt-viz-panel">
            <div className="bbt-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CANVAS_W} height={CANVAS_H}>
                    {edges.map(({ fromId, toId }) => {
                        const from = positions.get(fromId)
                        const to = positions.get(toId)
                        if (!from || !to) return null
                        return <line key={`${fromId}-${toId}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#45475a" strokeWidth={1.5} />
                    })}
                </svg>
                {allNodes.map((node) => {
                    const pos = positions.get(node.id)
                    if (!pos) return null
                    const isActive = step?.activeId === node.id
                    const isUnbal = step?.unbalancedIds?.has(node.id)
                    const h = step?.heights?.get(node.id)
                    return (
                        <motion.div key={node.id} style={{ position: 'absolute', left: pos.x - NODE_R, top: pos.y - NODE_R }}>
                            <motion.div
                                className={`bbt-node ${isActive ? 'active' : ''} ${isUnbal ? 'unbalanced' : h != null ? 'balanced' : ''}`}
                                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {node.val}
                            </motion.div>
                            {h != null && (
                                <div className="bbt-height-badge">{h}</div>
                            )}
                            {isUnbal && (
                                <div className="bbt-height-badge unbal">!</div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
            <div className="bbt-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

// StatePanel: shows active node and final result
function StatePanel({ step, allNodes }) {
    return (
        <div className="bbt-state-panel">
            <div className="bbt-metric">
                <span className="bbt-label">Active node</span>
                <strong className="bbt-val">
                    {step?.activeId != null && step.activeId !== -1
                        ? allNodes.find((n) => n.id === step.activeId)?.val ?? '—'
                        : '—'}
                </strong>
            </div>
            <div className="bbt-legend">
                <div className="bbt-legend-item"><div className="bbt-dot active" />Processing</div>
                <div className="bbt-legend-item"><div className="bbt-dot balanced" />Balanced subtree</div>
                <div className="bbt-legend-item"><div className="bbt-dot unbalanced" />Unbalanced</div>
            </div>
            <div className={`bbt-result ${step?.phase === 'done' ? (step.result ? 'ok' : 'fail') : ''}`}>
                {step?.phase === 'done'
                    ? (step.result ? '✓ Balanced' : '✗ Not Balanced')
                    : 'Checking…'}
            </div>
        </div>
    )
}

// InputPanel: for adjusting tree input
function InputPanel({ arrInput, setArrInput, applyExample, inputError }) {
    return (
        <div className="bbt-input-panel">
            <div className="bbt-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="bbt-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <input
                className="bbt-input"
                value={arrInput}
                onChange={(e) => setArrInput(e.target.value)}
                placeholder="[3,9,20,null,null,15,7]"
            />
            {inputError && <span className="bbt-error">{inputError}</span>}
        </div>
    )
}

export default function BalancedBinaryTreeVisualizer() {
    const [arrInput, setArrInput] = useState('[3,9,20,null,null,15,7]')

    const { arr, inputError } = useMemo(() => {
        try {
            return { arr: parseTreeInput(arrInput), inputError: '' }
        } catch (e) {
            return { arr: [3, 9, 20, null, null, 15, 7], inputError: e.message }
        }
    }, [arrInput])

    const steps = useMemo(() => generateSteps(arr), [arr])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const applyExample = useCallback((ex) => {
        setArrInput(JSON.stringify(ex.arr))
        handleReset()
    }, [handleReset])

    const positions = step?.positions ?? new Map()
    const edges = step?.edges ?? []
    const allNodes = step?.allNodes ?? []

    // Step 2: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"arr","label":"arr","type":"string"}]}
        values={{ arr: arrInput }}
        onChange={(k, v) => { if (k === 'arr') setArrInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

        <div className="bbt-panel">
            <TreeVisualizationPanel step={step} positions={positions} edges={edges} allNodes={allNodes} />
        </div>
    
    </>)

    const statePanel = (
        <div className="bbt-panel">
            <StatePanel step={step} allNodes={allNodes} />
        </div>
    )

    const inputPanel = (
        <div className="bbt-panel">
            <InputPanel arrInput={arrInput} setArrInput={setArrInput} applyExample={applyExample} inputError={inputError} />
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
        <div className="bbt-status">
            {step?.message || 'Press Play to begin.'}
        </div>
    )

    const playbackPanel = (
            {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
                autoScroll={autoScrollCode}
                onAutoScrollChange={setAutoScrollCode}
                autoScrollLabel="Auto-scroll code"
                showAutoScroll
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    )

    // Step 3: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'input', title: 'Input', dockMode: 'split-right' },
            { id: 'state', title: 'State', dockMode: 'split-right' },
            { id: 'primary', title: 'Tree Visualization', dockMode: 'split-bottom' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 5: Replace return with portals
    return (
        <div className="bbt-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.state && createPortal(statePanel, panelDivs.state)}
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
