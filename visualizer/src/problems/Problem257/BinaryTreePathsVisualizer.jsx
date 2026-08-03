import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { getExamples } from '../../config/examplesRegistry'
import './BinaryTreePathsVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE = [
    { line: 1, text: 'def binaryTreePaths(root):' },
    { line: 2, text: '    paths = []' },
    { line: 3, text: '    def dfs(node, path):' },
    { line: 4, text: '        if not node: return' },
    { line: 5, text: '        path.append(str(node.val))' },
    { line: 6, text: '        if not node.left and not node.right:' },
    { line: 7, text: '            paths.append("->".join(path))' },
    { line: 8, text: '        else:' },
    { line: 9, text: '            dfs(node.left, path)' },
    { line: 10, text: '            dfs(node.right, path)' },
    { line: 11, text: '        path.pop()' },
    { line: 12, text: '    dfs(root, []); return paths' },
]

function generateSteps(arr) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{ phase: 'done', activeLine: 12, activeId: -1, pathStack: [], completedPaths: [], onPathNode: new Set(), positions, edges, allNodes, message: 'Empty tree → return []' }]
    }

    const completedPaths = []
    const pathStack = []
    const onPathNode = new Set()

    steps.push({ phase: 'init', activeLine: 2, activeId: -1, pathStack: [], completedPaths: [], onPathNode: new Set(), positions, edges, allNodes, message: 'Initialize paths list. Start DFS.' })

    function dfs(node, path) {
        if (!node) {
            steps.push({
                phase: 'null', activeLine: 4, activeId: -1,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes,
                message: 'Null node detected. Return from DFS.'
            })
            return
        }

        const pathStr = [...path, node.val].join('->')
        path.push(node.val)
        onPathNode.add(node.id)

        steps.push({
            phase: 'visit', activeLine: 5, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes,
            message: `Visit node ${node.val}. Current path: [${path.join(', ')}]`
        })

        const isLeaf = !node.left && !node.right
        if (isLeaf) {
            completedPaths.push(pathStr)
            steps.push({
                phase: 'leaf', activeLine: 7, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes,
                message: `Leaf node! Save path: "${pathStr}". Total paths: ${completedPaths.length}`
            })
        } else {
            steps.push({
                phase: 'branch', activeLine: 8, activeId: node.id,
                pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                positions, edges, allNodes,
                message: `Internal node. Continue DFS to children.`
            })

            if (node.left) {
                dfs(node.left, path)
            } else {
                steps.push({
                    phase: 'no-left', activeLine: 9, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes,
                    message: `No left child. Skip.`
                })
            }

            if (node.right) {
                dfs(node.right, path)
            } else {
                steps.push({
                    phase: 'no-right', activeLine: 10, activeId: node.id,
                    pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
                    positions, edges, allNodes,
                    message: `No right child. Skip.`
                })
            }
        }

        onPathNode.delete(node.id)
        path.pop()

        steps.push({
            phase: 'backtrack', activeLine: 11, activeId: node.id,
            pathStack: [...path], completedPaths: [...completedPaths], onPathNode: new Set(onPathNode),
            positions, edges, allNodes,
            message: `Backtrack from node ${node.val}. Path: [${path.join(', ')}]`
        })
    }

    dfs(root, [])

    steps.push({
        phase: 'done', activeLine: 12, activeId: -1,
        pathStack: [], completedPaths: [...completedPaths], onPathNode: new Set(),
        positions, edges, allNodes,
        message: `All paths found: ${JSON.stringify(completedPaths)}`
    })

    return steps
}

const EXAMPLES = getExamples('binary-tree-paths')

function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
    return (
        <div className="btp-viz-panel">
            <div className="btp-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
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
                                stroke={isOnPath ? '#f38ba8' : '#45475a'}
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
                                className={`btp-node ${isActive ? 'active' : ''} ${isOnPath ? 'on-path' : ''}`}
                                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                                {node.val}
                            </motion.div>
                        </motion.div>
                    )
                })}
            </div>
            <div className="btp-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

function StatePanel({ step, allNodes }) {
    return (
        <div className="btp-state-panel">
            <div className="btp-metric">
                <span className="btp-label">Current Path</span>
                <div className="btp-path-display">
                    {step?.pathStack && step.pathStack.length > 0
                        ? `[${step.pathStack.join(', ')}]`
                        : '[]'}
                </div>
            </div>
            <div className="btp-metric">
                <span className="btp-label">Completed Paths ({step?.completedPaths?.length || 0})</span>
                <div className="btp-paths-list">
                    {step?.completedPaths && step.completedPaths.length > 0
                        ? step.completedPaths.map((p, i) => (
                            <div key={i} className="btp-path-item">"{p}"</div>
                        ))
                        : <span className="btp-empty">none yet</span>}
                </div>
            </div>
            <div className="btp-legend">
                <div className="btp-legend-item"><div className="btp-dot active" />Active node</div>
                <div className="btp-legend-item"><div className="btp-dot on-path" />On path</div>
            </div>
        </div>
    )
}

function InputPanel({ arrInput, setArrInput, applyExample, inputError }) {
    return (
        <div className="btp-input-panel">
            <div className="btp-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="btp-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <input
                className="btp-input"
                value={arrInput}
                onChange={(e) => setArrInput(e.target.value)}
                placeholder="[1,2,3]"
            />
            {inputError && <span className="btp-error">{inputError}</span>}
        </div>
    )
}

export default function BinaryTreePathsVisualizer() {
    const [arrInput, setArrInput] = useState('[1,2,3]')

    const { arr, inputError } = useMemo(() => {
        try {
            return { arr: parseTreeInput(arrInput), inputError: '' }
        } catch (e) {
            return { arr: [1, 2, 3], inputError: e.message }
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

    const dockPanels = useMemo(() => [
        {
            id: 'input',
            title: 'Input',
            content: <InputPanel arrInput={arrInput} setArrInput={setArrInput} applyExample={applyExample} inputError={inputError} />,
        },
        {
            id: 'tree',
            title: 'Tree Visualization',
            content: <TreeVisualizationPanel step={step} positions={positions} edges={edges} allNodes={allNodes} />,
        },
        {
            id: 'state',
            title: 'State',
            content: <StatePanel step={step} allNodes={allNodes} />,
        },
        {
            id: 'code',
            title: 'Code Trace',
            content: <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                autoScroll={autoScrollCode}
            />,
        },
    ], [arrInput, setArrInput, applyExample, inputError, step, positions, edges, allNodes, setActiveLineDom, autoScrollCode])

    return (
        <div className="problem-shell">
            <DockableWorkspace
                title="Binary Tree Paths Visualizer"
                panels={dockPanels}
                initialLayout={{
                    rows: [
                        ['input', 'state'],
                        ['tree', 'code'],
                    ],
                    minimized: [],
                }}
            />

            <FloatingPanel title="Playback Controls">
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
            </FloatingPanel>

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
