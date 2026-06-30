import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { getExamples } from '../../config/examplesRegistry'
import './Problem366Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['collect-leaf', 'compute-height', 'done', 'init', 'null', 'recurse-left', 'recurse-right', 'return-height', 'visit']
const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'visit',
  4: 'null',
  5: 'recurse-left',
  6: 'recurse-right',
  7: 'compute-height',
  10: 'collect-leaf',
  11: 'return-height',
  13: 'done'
}


const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'def findLeaves(root):' },
    { line: 2, text: '    result = []' },
    { line: 3, text: '    def dfs(node):' },
    { line: 4, text: '        if not node: return 0' },
    { line: 5, text: '        h_left = dfs(node.left)' },
    { line: 6, text: '        h_right = dfs(node.right)' },
    { line: 7, text: '        h = max(h_left, h_right)' },
    { line: 8, text: '        if h >= len(result):' },
    { line: 9, text: '            result.append([])' },
    { line: 10, text: '        result[h].append(node.val)' },
    { line: 11, text: '        return h + 1' },
    { line: 12, text: '    dfs(root)' },
    { line: 13, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(arr) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{
            phase: 'done',
            activeLine: 13,
            activeId: -1,
            visitedIds: new Set(),
            leafIds: new Set(),
            heightMap: new Map(),
            collectedLeaves: [],
            positions,
            edges,
            allNodes,
            message: 'Empty tree → return []',
        }]
    }

    const heightMap = new Map()
    const collectedLeaves = []
    const visitedIds = new Set()

    steps.push({
        phase: 'init',
        activeLine: 2,
        activeId: -1,
        visitedIds: new Set(),
        leafIds: new Set(),
        heightMap: new Map(),
        collectedLeaves: [],
        positions,
        edges,
        allNodes,
        message: 'Initialize result list. Start DFS from root.',
    })

    function dfs(node, parentId = -1) {
        if (!node) {
            steps.push({
                phase: 'null',
                activeLine: 4,
                activeId: parentId,
                visitedIds: new Set(visitedIds),
                leafIds: new Set(),
                heightMap: new Map(heightMap),
                collectedLeaves: [...collectedLeaves],
                positions,
                edges,
                allNodes,
                message: 'Null node. Return height 0.',
            })
            return 0
        }

        visitedIds.add(node.id)
        steps.push({
            phase: 'visit',
            activeLine: 3,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: new Set(),
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Visit node ${node.val}. Compute height...`,
        })

        steps.push({
            phase: 'recurse-left',
            activeLine: 5,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: new Set(),
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Recurse to left child of ${node.val}`,
        })

        const hLeft = dfs(node.left, node.id)

        steps.push({
            phase: 'recurse-right',
            activeLine: 6,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: new Set(),
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Recurse to right child of ${node.val}`,
        })

        const hRight = dfs(node.right, node.id)

        const h = Math.max(hLeft, hRight)
        heightMap.set(node.id, h)

        steps.push({
            phase: 'compute-height',
            activeLine: 7,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: new Set(),
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Node ${node.val}: height = max(${hLeft}, ${hRight}) = ${h}`,
        })

        // Ensure result array is long enough
        while (collectedLeaves.length <= h) {
            collectedLeaves.push([])
        }

        const leafSet = new Set()
        leafSet.add(node.id)

        steps.push({
            phase: 'collect-leaf',
            activeLine: 10,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: leafSet,
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Collect node ${node.val} in layer ${h}. result[${h}] = [${collectedLeaves[h].join(', ')}, ${node.val}]`,
        })

        collectedLeaves[h].push(node.val)

        steps.push({
            phase: 'return-height',
            activeLine: 11,
            activeId: node.id,
            visitedIds: new Set(visitedIds),
            leafIds: new Set(),
            heightMap: new Map(heightMap),
            collectedLeaves: [...collectedLeaves],
            positions,
            edges,
            allNodes,
            message: `Return height ${h + 1} for node ${node.val}`,
        })

        return h + 1
    }

    dfs(root)

    steps.push({
        phase: 'done',
        activeLine: 13,
        activeId: -1,
        visitedIds: new Set(),
        leafIds: new Set(),
        heightMap: new Map(),
        collectedLeaves: [...collectedLeaves],
        positions,
        edges,
        allNodes,
        message: `Complete! Result: ${JSON.stringify(collectedLeaves)}`,
    })

    return steps
}

const EXAMPLES = getExamples('find-leaves-of-binary-tree') || [
    { label: 'Simple', arr: [1, 2, 3] },
    { label: 'Unbalanced', arr: [1, 2, null, 3, null, 4] },
    { label: 'Single Node', arr: [1] },
]

function TreeVisualizationPanel({ step, positions, edges, allNodes, EXAMPLES, arrInput, setArrInput, applyExample, handleReset }) {
    return (
        <div className="p366-viz-panel">
            <div className="p366-examples">
                {EXAMPLES.map((ex) => (
                    <button
                        key={ex.label}
                        className="p366-chip"
                        onClick={() => applyExample(ex)}
                    >
                        {ex.label}
                    </button>
                ))}
            </div>
            <input
                className="p366-input"
                value={arrInput}
                onChange={(e) => {
                    setArrInput(e.target.value)
                    handleReset()
                }}
                placeholder="Enter tree array..."
            />
            <div className="p366-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CANVAS_W} height={CANVAS_H}>
                    {edges.map(({ fromId, toId }) => {
                        const from = positions.get(fromId)
                        const to = positions.get(toId)
                        if (!from || !to) return null
                        const isHighlighted = step?.leafIds?.has(fromId) || step?.leafIds?.has(toId)
                        return (
                            <line
                                key={`${fromId}-${toId}`}
                                x1={from.x}
                                y1={from.y}
                                x2={to.x}
                                y2={to.y}
                                stroke={isHighlighted ? '#f38ba8' : '#313244'}
                                strokeWidth={isHighlighted ? 3 : 2}
                                strokeDasharray={step?.leafIds?.has(fromId) && step?.leafIds?.has(toId) ? '4,4' : 'none'}
                            />
                        )
                    })}
                </svg>
                {allNodes.map((node) => {
                    const pos = positions.get(node.id)
                    if (!pos) return null
                    const isActive = step?.activeId === node.id
                    const isLeaf = step?.leafIds?.has(node.id)
                    const isVisited = step?.visitedIds?.has(node.id)
                    const h = step?.heightMap?.get(node.id)
                    return (
                        <motion.div
                            key={node.id}
                            className={`p366-node ${isActive ? 'active' : ''} ${isLeaf ? 'leaf' : ''} ${isVisited ? 'visited' : ''}`}
                            style={{ left: pos.x - NODE_R, top: pos.y - NODE_R }}
                            animate={{
                                scale: isActive ? 1.15 : isLeaf ? 1.1 : 1,
                                opacity: isLeaf ? 0.7 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="p366-node-val">{node.val}</div>
                            {h !== undefined && (
                                <div className="p366-node-height">{h}</div>
                            )}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

function ResultPanel({ step, inputError, collectedLeaves }) {
    return (
        <div className="p366-result-panel">
            <div className="p366-heights-label">Heights Computed:</div>
            <div className="p366-heights">
                {step?.heightMap && step.heightMap.size > 0 ? (
                    Array.from(step.heightMap.entries()).map(([nodeId, h]) => (
                        <div key={nodeId} className="p366-height-row">
                            Node {nodeId}: h={h}
                        </div>
                    ))
                ) : (
                    <div className="p366-empty">No heights computed yet</div>
                )}
            </div>
            <div className="p366-separator"></div>
            <div className="p366-leaves-label">Collected Leaves (by height):</div>
            <div className="p366-leaves">
                {(step?.collectedLeaves ?? []).length > 0 ? (
                    (step?.collectedLeaves ?? []).map((layer, i) => (
                        <motion.div
                            key={i}
                            className="p366-leave-layer"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="p366-layer-idx">Layer {i}:</span>
                            <span className="p366-layer-vals">[{layer.join(', ')}]</span>
                        </motion.div>
                    ))
                ) : (
                    <div className="p366-empty">No leaves collected yet</div>
                )}
            </div>
            <div className="p366-result" style={{ marginTop: 'auto' }}>
                {step?.phase === 'done'
                    ? `✓ Found ${step?.collectedLeaves?.length ?? 0} layers`
                    : 'Computing...'}
            </div>
            {inputError && <div className="p366-error-box">{inputError}</div>}
        </div>
    )
}

export default function Problem366Visualizer() {
    const [arrInput, setArrInput] = useState('[1,2,3,4,5]')
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { arr, inputError } = useMemo(() => {
        try {
            return { arr: parseTreeInput(arrInput), inputError: '' }
        } catch (e) {
            return { arr: [1, 2, 3, 4, 5], inputError: e.message || 'Invalid input' }
        }
    }, [arrInput])

    const steps = useMemo(() => generateSteps(arr), [arr])
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null

    const applyExample = useCallback((ex) => {
        setArrInput(JSON.stringify(ex.arr))
        handleReset()
    }, [handleReset])

    const positions = step?.positions ?? new Map()
    const edges = step?.edges ?? []
    const allNodes = step?.allNodes ?? []

    const dockPanels = useMemo(() => [
        {
            id: 'viz',
            title: 'Tree Visualization',
            subtitle: inputError ? 'Fix the input to resume.' : 'Watch leaves get collected by height.',
            defaultZone: 'left',
            content: (
                <TreeVisualizationPanel
                    step={step}
                    positions={positions}
                    edges={edges}
                    allNodes={allNodes}
                    EXAMPLES={EXAMPLES}
                    arrInput={arrInput}
                    setArrInput={setArrInput}
                    applyExample={applyExample}
                    handleReset={handleReset}
                />
            ),
        },
        {
            id: 'result',
            title: 'Leaf Collection',
            subtitle: step ? `Phase: ${step.phase}` : 'Leaves grouped by removal iteration.',
            defaultZone: 'left',
            content: (
                <ResultPanel
                    step={step}
                    inputError={inputError}
                    collectedLeaves={step?.collectedLeaves ?? []}
                />
            ),
        },
        {
            id: 'code',
            title: 'Code Trace',
            subtitle: step ? `Active line ${step.activeLine}` : 'DFS with height tracking.',
            defaultZone: 'full',
            content: (
                <CodeTracePanel
                    step={step}
                    codeLines={SOLUTION_CODE}
                    onActiveLineDomChange={setActiveLineDom}
                    autoScroll={autoScrollCode}
                />
            ),
        },
    ], [arrInput, setArrInput, positions, edges, allNodes, step, applyExample, handleReset, inputError, setActiveLineDom, autoScrollCode])

    return (
        <div className="p366-shell">
            <div className="p366-header">
                <h2>Find Leaves of Binary Tree</h2>
                <p className={`p366-message ${step?.phase === 'done' ? 'ok' : ''}`}>
                    {step?.message || 'Press Play to begin peeling leaves.'}
                </p>
            </div>

            <DockableWorkspace
                title="Leaf Removal Workspace"
                panels={dockPanels}
                initialLayout={{
                    rows: [['viz', 'result'], ['code']],
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
            </FloatingPanel>

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
