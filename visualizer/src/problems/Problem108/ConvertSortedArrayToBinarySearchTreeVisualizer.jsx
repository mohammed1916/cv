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
import './ConvertSortedArrayToBinarySearchTreeVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const CANVAS_W = 600
const CANVAS_H = 400
const NODE_R = 24

const SOLUTION_CODE = [
    { line: 1, text: 'def sortedArrayToBST(nums):' },
    { line: 2, text: '    def build(left, right):' },
    { line: 3, text: '        if left > right: return None' },
    { line: 4, text: '        mid = (left + right) // 2' },
    { line: 5, text: '        node = TreeNode(nums[mid])' },
    { line: 6, text: '        node.left = build(left, mid - 1)' },
    { line: 7, text: '        node.right = build(mid + 1, right)' },
    { line: 8, text: '        return node' },
    { line: 9, text: '    return build(0, len(nums) - 1)' },
]

function generateSteps(arr) {
    const steps = []
    let nodeId = 0
    const nodeMap = {}
    const root = { id: nodeId++, val: null, left: null, right: null }
    const positions = new Map()
    const edges = []
    let allNodes = []

    if (!arr || arr.length === 0) {
        return [{
            phase: 'done',
            activeLine: 3,
            activeId: -1,
            selectedIndices: new Set(),
            createdNodeIds: new Set(),
            result: null,
            positions,
            edges,
            allNodes,
            message: 'Empty array → empty BST'
        }]
    }

    const createdNodeIds = new Set()
    let stepCount = 0

    function dfs(left, right, parentId = null, isLeftChild = true) {
        if (left > right) {
            steps.push({
                phase: 'base-case',
                activeLine: 3,
                activeId: parentId,
                selectedIndices: new Set([left, right]),
                createdNodeIds: new Set(createdNodeIds),
                result: null,
                positions: new Map(positions),
                edges: [...edges],
                allNodes: [...allNodes],
                message: `left (${left}) > right (${right}) → return None`,
            })
            return null
        }

        const mid = Math.floor((left + right) / 2)

        steps.push({
            phase: 'calc-mid',
            activeLine: 4,
            activeId: parentId,
            selectedIndices: new Set([left, mid, right]),
            createdNodeIds: new Set(createdNodeIds),
            result: null,
            positions: new Map(positions),
            edges: [...edges],
            allNodes: [...allNodes],
            message: `Range [${left}, ${right}]: mid = ${mid}, arr[${mid}] = ${arr[mid]}`,
        })

        const currentNode = {
            id: nodeId++,
            val: arr[mid],
            left: null,
            right: null,
            parentId
        }
        createdNodeIds.add(currentNode.id)
        nodeMap[currentNode.id] = currentNode
        allNodes.push(currentNode)

        steps.push({
            phase: 'create-node',
            activeLine: 5,
            activeId: currentNode.id,
            selectedIndices: new Set([mid]),
            createdNodeIds: new Set(createdNodeIds),
            result: null,
            positions: new Map(positions),
            edges: [...edges],
            allNodes: [...allNodes],
            message: `Create node with value ${arr[mid]}`,
        })

        // Recurse left
        steps.push({
            phase: 'recurse-left-start',
            activeLine: 6,
            activeId: currentNode.id,
            selectedIndices: new Set([left, mid - 1]),
            createdNodeIds: new Set(createdNodeIds),
            result: null,
            positions: new Map(positions),
            edges: [...edges],
            allNodes: [...allNodes],
            message: `Recurse left: build(${left}, ${mid - 1})`,
        })

        const leftChild = dfs(left, mid - 1, currentNode.id, true)
        currentNode.left = leftChild

        if (leftChild) {
            edges.push({ fromId: currentNode.id, toId: leftChild.id })

            steps.push({
                phase: 'attach-left',
                activeLine: 6,
                activeId: currentNode.id,
                selectedIndices: new Set([left, mid - 1]),
                createdNodeIds: new Set(createdNodeIds),
                result: null,
                positions: new Map(positions),
                edges: [...edges],
                allNodes: [...allNodes],
                message: `Attach left child (${leftChild.val}) to node ${currentNode.val}`,
            })
        }

        // Recurse right
        steps.push({
            phase: 'recurse-right-start',
            activeLine: 7,
            activeId: currentNode.id,
            selectedIndices: new Set([mid + 1, right]),
            createdNodeIds: new Set(createdNodeIds),
            result: null,
            positions: new Map(positions),
            edges: [...edges],
            allNodes: [...allNodes],
            message: `Recurse right: build(${mid + 1}, ${right})`,
        })

        const rightChild = dfs(mid + 1, right, currentNode.id, false)
        currentNode.right = rightChild

        if (rightChild) {
            edges.push({ fromId: currentNode.id, toId: rightChild.id })

            steps.push({
                phase: 'attach-right',
                activeLine: 7,
                activeId: currentNode.id,
                selectedIndices: new Set([mid + 1, right]),
                createdNodeIds: new Set(createdNodeIds),
                result: null,
                positions: new Map(positions),
                edges: [...edges],
                allNodes: [...allNodes],
                message: `Attach right child (${rightChild.val}) to node ${currentNode.val}`,
            })
        }

        steps.push({
            phase: 'return-node',
            activeLine: 8,
            activeId: currentNode.id,
            selectedIndices: new Set([left, right]),
            createdNodeIds: new Set(createdNodeIds),
            result: null,
            positions: new Map(positions),
            edges: [...edges],
            allNodes: [...allNodes],
            message: `Return node with value ${currentNode.val}`,
        })

        return currentNode
    }

    const resultRoot = dfs(0, arr.length - 1)

    // Final step - tree is complete
    if (resultRoot) {
        const finalPositions = computeLayout(resultRoot, CANVAS_W, 60)
        const finalEdges = buildEdges(resultRoot)
        const finalNodes = collectNodes(resultRoot)

        steps.push({
            phase: 'done',
            activeLine: 9,
            activeId: -1,
            selectedIndices: new Set(),
            createdNodeIds: new Set(createdNodeIds),
            result: resultRoot,
            positions: finalPositions,
            edges: finalEdges,
            allNodes: finalNodes,
            message: `Complete! Built a balanced BST from sorted array [${arr.join(', ')}]`,
        })
    }

    return steps
}

const EXAMPLES = [
    { label: 'Example 1', arr: [-10, -3, 0, 5, 9] },
    { label: 'Example 2', arr: [0, 1, 2, 3] },
    { label: 'Example 3', arr: [1, 2, 3, 4, 5] },
    { label: 'Example 4', arr: [-100, -50, 0, 50, 100] },
]

// TreeVisualizationPanel: renders the tree canvas
function TreeVisualizationPanel({ step, positions, edges, allNodes }) {
    return (
        <div className="csatbst-viz-panel">
            <div className="csatbst-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CANVAS_W} height={CANVAS_H}>
                    {edges.map(({ fromId, toId }, idx) => {
                        const from = positions.get(fromId)
                        const to = positions.get(toId)
                        if (!from || !to) return null
                        return (
                            <line
                                key={`edge-${idx}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke="#94a3b8"
                                strokeWidth={2}
                            />
                        )
                    })}
                </svg>
                {allNodes.map((node) => {
                    const pos = positions.get(node.id)
                    if (!pos) return null
                    const isActive = step?.activeId === node.id
                    const isCreated = step?.createdNodeIds?.has(node.id)
                    return (
                        <motion.div
                            key={node.id}
                            style={{ position: 'absolute', left: pos.x - NODE_R, top: pos.y - NODE_R }}
                            initial={isCreated && !isActive ? { scale: 0, opacity: 0 } : {}}
                            animate={{ scale: isActive ? 1.3 : 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <div
                                className={`csatbst-node ${isActive ? 'active' : ''} ${isCreated ? 'created' : ''}`}
                            >
                                {node.val}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
            <div className="csatbst-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

// ArrayVisualizationPanel: shows the input array with range highlights
function ArrayVisualizationPanel({ arr, selectedIndices }) {
    return (
        <div className="csatbst-array-panel">
            <div className="csatbst-array-label">Input Array</div>
            <div className="csatbst-array-container">
                {arr.map((val, idx) => {
                    const isMid = selectedIndices?.has(idx) && selectedIndices.size === 3
                    const isRange = selectedIndices?.has(idx)
                    return (
                        <motion.div
                            key={idx}
                            className={`csatbst-array-item ${isMid ? 'mid' : ''} ${isRange && !isMid ? 'range' : ''}`}
                            animate={{ scale: isRange ? 1.15 : 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            <div className="csatbst-array-idx">{idx}</div>
                            <div className="csatbst-array-val">{val}</div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

// StatePanel: shows recursion depth and node count
function StatePanel({ step, allNodes }) {
    return (
        <div className="csatbst-state-panel">
            <div className="csatbst-metric">
                <span className="csatbst-label">Active Node</span>
                <strong className="csatbst-val">
                    {step?.activeId != null && step.activeId !== -1
                        ? allNodes.find((n) => n.id === step.activeId)?.val ?? '—'
                        : '—'}
                </strong>
            </div>
            <div className="csatbst-metric">
                <span className="csatbst-label">Nodes Created</span>
                <strong className="csatbst-val">{step?.createdNodeIds?.size ?? 0}</strong>
            </div>
            <div className="csatbst-legend">
                <div className="csatbst-legend-item"><div className="csatbst-dot active" />Current node</div>
                <div className="csatbst-legend-item"><div className="csatbst-dot created" />Created node</div>
            </div>
        </div>
    )
}

// InputPanel: for adjusting array input
function InputPanel({ arrInput, setArrInput, applyExample, inputError }) {
    return (
        <div className="csatbst-input-panel">
            <div className="csatbst-examples">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex.label}
                        className="csatbst-chip"
                        onClick={() => applyExample(ex)}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>
            <input
                className="csatbst-input"
                value={arrInput}
                placeholder="[-10, -3, 0, 5, 9]"
            />
            {inputError && <span className="csatbst-error">{inputError}</span>}
        </div>
    )
}

export default function ConvertSortedArrayToBinarySearchTreeVisualizer() {
    const [arrInput, setArrInput] = useState('[-10, -3, 0, 5, 9]')

    const { arr, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(arrInput)
            if (!Array.isArray(parsed)) throw new Error('Input must be an array')
            const sorted = [...parsed].sort((a, b) => a - b)
            return { arr: sorted, inputError: '' }
        } catch (e) {
            return { arr: [-10, -3, 0, 5, 9], inputError: 'Invalid array format' }
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

    // Build dock panels for the workspace
    const dockPanels = useMemo(() => [
        {
            id: 'input',
            title: 'Input',
            content: <InputPanel arrInput={arrInput} setArrInput={setArrInput} applyExample={applyExample} inputError={inputError} />,
        },
        {
            id: 'array',
            title: 'Array View',
            content: <ArrayVisualizationPanel arr={arr} selectedIndices={step?.selectedIndices} />,
        },
        {
            id: 'tree',
            title: 'Binary Search Tree',
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
    ], [arrInput, setArrInput, applyExample, inputError, step, positions, edges, allNodes, arr, setActiveLineDom, autoScrollCode])

    return (
        <div className="problem-shell">
            <DockableWorkspace
                title="Convert Sorted Array to Binary Search Tree"
                panels={dockPanels}
                initialLayout={{
                    rows: [
                        ['input', 'state'],
                        ['array', 'tree'],
                        ['code'],
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
