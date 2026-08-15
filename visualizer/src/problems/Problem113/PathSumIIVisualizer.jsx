import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import './PathSumIIVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE = [
    { line: 1, text: 'def pathSum(root, targetSum):' },
    { line: 2, text: '    result = []' },
    { line: 3, text: '    def dfs(node, path, sum):' },
    { line: 4, text: '        if not node: return' },
    { line: 5, text: '        path.append(node.val)' },
    { line: 6, text: '        if not node.left and not node.right:' },
    { line: 7, text: '            if sum == node.val:' },
    { line: 8, text: '                result.append(path[:])' },
    { line: 9, text: '        else:' },
    { line: 10, text: '            dfs(node.left, path, sum - node.val)' },
    { line: 11, text: '            dfs(node.right, path, sum - node.val)' },
    { line: 12, text: '        path.pop()' },
    { line: 13, text: '    dfs(root, [], targetSum); return result' },
]

function generateSteps(arr, targetSum) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{
            phase: 'done', activeLine: 13, activeId: -1, pathStack: [], completedPaths: [],
            onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
            message: 'Empty tree → return []'
        }]
    }

    const completedPaths = []
    const onPathNode = new Set()

    steps.push({
        phase: 'init', activeLine: 2, activeId: -1, pathStack: [], completedPaths: [],
        onPathNode: new Set(), positions, edges, allNodes, currentSum: 0, targetSum,
        message: `Initialize result list. Target sum: ${targetSum}. Start DFS.`
    })

    function dfs(node, path, remainingSum) {
        if (!node) {
            steps.push({
                phase: 'null', activeLine: 4, activeId: -1,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
                message: 'Null node detected. Return from DFS.'
            })
            return
        }

        path.push(node.val)
        onPathNode.add(node.id)
        const currentSum = targetSum - remainingSum

        steps.push({
            phase: 'visit', activeLine: 5, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum, targetSum,
            message: `Visit node ${node.val}. Current path: [${path.join(', ')}]. Sum so far: ${currentSum}`
        })

        const isLeaf = !node.left && !node.right
        if (isLeaf) {
            steps.push({
                phase: 'leaf', activeLine: 6, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Leaf node! Current path sum: ${currentSum}. Target: ${targetSum}`
            })

            if (currentSum === targetSum) {
                completedPaths.push([...path])
                steps.push({
                    phase: 'match', activeLine: 8, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum matches! Save path: [${path.join(', ')}]. Total: ${completedPaths.length}`
                })
            } else {
                steps.push({
                    phase: 'no-match', activeLine: 7, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `Sum doesn't match. ${currentSum} != ${targetSum}`
                })
            }
        } else {
            steps.push({
                phase: 'branch', activeLine: 9, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes, currentSum, targetSum,
                message: `Internal node. Continue DFS to children. Remaining: ${remainingSum - node.val}`
            })

            if (node.left) {
                dfs(node.left, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-left', activeLine: 10, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No left child. Skip.`
                })
            }

            if (node.right) {
                dfs(node.right, path, remainingSum - node.val)
            } else {
                steps.push({
                    phase: 'no-right', activeLine: 11, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes, currentSum, targetSum,
                    message: `No right child. Skip.`
                })
            }
        }

        onPathNode.delete(node.id)
        path.pop()

        steps.push({
            phase: 'backtrack', activeLine: 12, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes, currentSum: targetSum - remainingSum, targetSum,
            message: `Backtrack from node ${node.val}. Path: [${path.join(', ')}]`
        })
    }

    dfs(root, [], targetSum)

    steps.push({
        phase: 'done', activeLine: 13, activeId: -1,
        pathStack: [], completedPaths: [...completedPaths], onPathNode: new Set(),
        positions, edges, allNodes, currentSum: 0, targetSum,
        message: completedPaths.length > 0
            ? `Found ${completedPaths.length} path(s): ${JSON.stringify(completedPaths)}`
            : 'No paths found that sum to target.'
    })

    return steps
}

// Examples registry will be loaded by the visualizer if needed
// getExamples('path-sum-ii') can be called within a component for example buttons

function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
    return (
        <div className="psi-viz-panel">
            <div className="psi-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CANVAS_W} height={CANVAS_H}>
                    {edges.map(({ fromId, toId }) => {
                        const from = positions.get(fromId)
                        const to = positions.get(toId)
                        if (!from || !to) return null
                        const isOnPath = step?.onPathNode?.has(fromId) && step?.onPathNode?.has(toId)
                        return (
                            <line
                                key={`${fromId}-${toId}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke={isOnPath ? '#f38ba8' : 'var(--code-line)'}
                                strokeWidth={isOnPath ? 2.5 : 1.5}
                            />
                        )
                    })}
                </svg>
                {allNodes.map((node) => {
                    const pos = positions.get(node.id)
                    if (!pos) return null
                    const isActive = step?.activeId === node.id
                    const isOnPath = step?.onPathNode?.has(node.id)
                    return (
                        <motion.div
                            key={node.id}
                            style={{ position: 'absolute', left: pos.x - NODE_R, top: pos.y - NODE_R }}
                        >
                            <motion.div
                                className={`psi-node ${isActive ? 'active' : ''} ${isOnPath ? 'on-path' : ''}`}
                                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {node.val}
                            </motion.div>
                        </motion.div>
                    )
                })}
            </div>
            <div className="psi-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

function StatePanel({ step }) {
    return (
        <div className="psi-state-panel">
            <div className="psi-metric">
                <span className="psi-label">Target Sum</span>
                <div className="psi-value">{step?.targetSum ?? 0}</div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Current Path</span>
                <div className="psi-path-display">
                    {step?.pathStack && step.pathStack.length > 0
                        ? `[${step.pathStack.join(', ')}]`
                        : '[]'}
                </div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Current Sum</span>
                <div className="psi-value">{step?.currentSum ?? 0}</div>
            </div>
            <div className="psi-metric">
                <span className="psi-label">Valid Paths ({step?.completedPaths?.length || 0})</span>
                <div className="psi-paths-list">
                    {step?.completedPaths && step.completedPaths.length > 0
                        ? step.completedPaths.map((p, i) => (
                            <div key={i} className="psi-path-item">[{p.join(', ')}]</div>
                        ))
                        : <span className="psi-empty">none yet</span>}
                </div>
            </div>
            <div className="psi-legend">
                <div className="psi-legend-item"><div className="psi-dot active" />Active node</div>
                <div className="psi-legend-item"><div className="psi-dot on-path" />On path</div>
            </div>
        </div>
    )
}

export default function PathSumIIVisualizer() {
    const [arrInput, setArrInput] = useState('[5,4,8,11,null,13,4,7,2,null,1]')
    const [targetInput, setTargetInput] = useState('22')

    const { arr, targetSum, inputError } = useMemo(() => {
        const fallback = { arr: [5, 4, 8, 11, null, 13, 4, 7, 2, null, 1], targetSum: 22 }
        try {
            const parsedArr = parseTreeInput(arrInput)
            if (!Array.isArray(parsedArr)) throw new Error('Tree must be an array, e.g. [5,4,8,null,1]')
            const parsedTarget = parseInt(targetInput, 10)
            if (isNaN(parsedTarget)) throw new Error('targetSum must be a number')
            return { arr: parsedArr, targetSum: parsedTarget, inputError: '' }
        } catch (e) {
            return { ...fallback, inputError: e.message }
        }
    }, [arrInput, targetInput])

    const steps = useMemo(() => generateSteps(arr, targetSum), [arr, targetSum])
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

    const positions = step?.positions ?? new Map()
    const edges = step?.edges ?? []
    const allNodes = step?.allNodes ?? []

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        onStepJump: setStepIndex,
    })

    // Step 2: Extract panels into consts
    const primaryPanel = (
        <div className="psi-panel" style={{ flex: 1 }}>
            <div className="psi-panel-head">Tree Visualization</div>
            <div className="psi-panel-body">
                <ManualInputPanel
                    fields={[
                        { key: 'tree', label: 'tree', type: 'array' },
                        { key: 'targetSum', label: 'targetSum', type: 'number' },
                    ]}
                    values={{ tree: arrInput, targetSum: targetInput }}
                    onChange={(k, v) => {
                        if (k === 'tree') setArrInput(v)
                        else if (k === 'targetSum') setTargetInput(v)
                        handleReset()
                    }}
                    inputError={inputError}
                    showExamples={false}
                />
                <TreeVisualizationPanel step={step} positions={positions} edges={edges} allNodes={allNodes} />
            </div>
        </div>
    )

    const statePanel = (
        <div className="psi-panel" style={{ flex: 1 }}>
            <div className="psi-panel-head">State</div>
            <div className="psi-panel-body">
                <StatePanel step={step} />
            </div>
        </div>
    )

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                highlightedLines={connectivity.highlightedLines}
                onLineSelect={connectivity.handleLineSelect}
                onActiveLineDomChange={setActiveLineDom}
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
        <div className="psi-status">{step?.message || 'Press Play to begin.'}</div>
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
            { id: 'primary', title: 'Tree Visualization', dockMode: 'split-right' },
            { id: 'state', title: 'State', dockMode: 'split-right' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="psi-shell">
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
