import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { TreeCanvas3D } from '../../components/viz3d'
import { getExamples } from '../../config/examplesRegistry'
import './BTMaxPathVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def maxPathSum(root):' },
    { line: 2, text: '    max_sum = float("-inf")' },
    { line: 3, text: '    def gain(node):' },
    { line: 4, text: '        nonlocal max_sum' },
    { line: 5, text: '        if not node: return 0' },
    { line: 6, text: '        left = max(gain(node.left), 0)' },
    { line: 7, text: '        right = max(gain(node.right), 0)' },
    { line: 8, text: '        path = node.val + left + right' },
    { line: 9, text: '        max_sum = max(max_sum, path)' },
    { line: 10, text: '        return node.val + max(left, right)' },
    { line: 11, text: '    gain(root)' },
    { line: 12, text: '    return max_sum' },
]

function generateSteps(root) {
    const steps = []
    let maxSum = -Infinity
    const gainMap = new Map() // nodeId -> gain value

    function gain(node) {
        if (!node) return 0

        steps.push({ phase: 'visit', activeLine: 6, nodeId: node.id, maxSum, gainMap: new Map(gainMap), message: `Visit node ${node.val}, compute left gain` })

        const lg = Math.max(gain(node.left), 0)
        const rg = Math.max(gain(node.right), 0)

        steps.push({ phase: 'compute', activeLine: 8, nodeId: node.id, maxSum, gainMap: new Map(gainMap), leftGain: lg, rightGain: rg, message: `node ${node.val}: left_gain=${lg}, right_gain=${rg}` })

        const path = node.val + lg + rg
        const prev = maxSum
        maxSum = Math.max(maxSum, path)
        gainMap.set(node.id, node.val + Math.max(lg, rg))

        steps.push({
            phase: 'update', activeLine: 9,
            nodeId: node.id, maxSum, gainMap: new Map(gainMap),
            leftGain: lg, rightGain: rg, pathThrough: path,
            message: `Path through ${node.val} = ${path}. max_sum updated: ${prev} → ${maxSum}`,
        })

        return node.val + Math.max(lg, rg)
    }

    steps.push({ phase: 'init', activeLine: 11, nodeId: null, maxSum: -Infinity, gainMap: new Map(), message: 'Start post-order DFS' })
    gain(root)
    steps.push({ phase: 'done', activeLine: 12, nodeId: null, maxSum, gainMap: new Map(gainMap), message: `Maximum path sum = ${maxSum}` })
    return steps
}

const EXAMPLES = getExamples('binary-tree-max-path')

export default function BTMaxPathVisualizer() {
    const [treeInput, setTreeInput] = useState('-10,9,20,null,null,15,7')
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const root = useMemo(() => parseTreeInput(treeInput), [treeInput])
    const steps = useMemo(() => root ? generateSteps(root) : [], [root])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => { setTreeInput(ex.input); handleReset() }, [handleReset])

    const W = 440, LH = 72
    const layout = useMemo(() => root ? computeLayout(root, W, LH) : new Map(), [root])
    const nodes = useMemo(() => root ? collectNodes(root) : [], [root])
    const edges = useMemo(() => root ? buildEdges(root) : [], [root])
    const totalH = nodes.length > 0 ? (Math.max(...nodes.map((n) => n.depth), 0) + 1) * LH + 20 : 80

    // Step 2: Extract panels into consts
    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"string"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
      />

        <div className="btmps-panel">
            <div className="btmps-panel-head">Tree Visualization</div>
            <div className="btmps-panel-body">
                <div className="btmps-viz-container">
                    <div className="btmps-max-badge">
                        max_sum = <span className="btmps-val">{isFinite(step?.maxSum ?? -Infinity) ? step?.maxSum ?? '−∞' : '−∞'}</span>
                    </div>

                    <div className="btmps-tree-panel">
                        <div className="btmps-tree-canvas" style={{ position: 'relative', width: W, height: totalH }}>
                            <TreeCanvas3D
                                positions={layout}
                                edges={edges}
                                allNodes={nodes}
                                activeIds={step?.nodeId ? new Set([step.nodeId]) : new Set()}
                                visitedIds={step?.gainMap ? new Set(Array.from(step.gainMap.keys())) : new Set()}
                                queueIds={new Set()}
                                canvasWidth={W}
                                canvasHeight={totalH}
                                nodeRadius={26}
                            />
                            {nodes.map((nd) => {
                                const pos = layout.get(nd.id)
                                if (!pos) return null
                                const gainVal = step?.gainMap?.get(nd.id)
                                return gainVal != null ? (
                                    <div key={`gain-${nd.id}`} className="btmps-gain-badge" style={{ left: pos.x + 12, top: pos.y - 30, position: 'absolute' }}>
                                        {gainVal}
                                    </div>
                                ) : null
                            })}
                        </div>
                    </div>

                    {step?.phase === 'update' && (
                        <div className="btmps-path-info">
                            Path through node: {step.pathThrough} &nbsp;|&nbsp; left_gain={step.leftGain}, right_gain={step.rightGain}
                        </div>
                    )}
                </div>
            </div>
        </div>
    
    </>)

    const inputPanel = (
        <div className="btmps-panel">
            <div className="btmps-panel-head">Input & Settings</div>
            <div className="btmps-panel-body">
                <div className="btmps-input-panel">
                    <div className="btmps-controls-row">
                        <div className="btmps-examples">
                            {EXAMPLES.map((ex) => (
                                <button key={ex.label} className="btmps-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                            ))}
                        </div>
                    </div>
                    <input
                        className="btmps-input"
                        value={treeInput}
                        onChange={(e) => { setTreeInput(e.target.value); handleReset() }}
                        placeholder="e.g. -10,9,20,null,null,15,7"
                    />
                </div>
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
        <div className="btmps-status">
            {step?.message || 'Press Play to begin.'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
            )}
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
                onSpeedChange={(event) => setSpeed(Number(event.target.value))}
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
            { id: 'input', title: 'Input & Settings', dockMode: 'split-right' },
            { id: 'primary', title: 'Tree Visualization', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="btmps-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
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
