import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { TreeCanvas3D } from '../../components/viz3d'
import { getExamples } from '../../config/examplesRegistry'
import './BinaryTreeLevelOrderTraversalII.css'

const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def levelOrderBottom(self, root):' },
    { line: 3, text: '        if not root: return []' },
    { line: 4, text: '        res, queue = [], deque([root])' },
    { line: 5, text: '        while queue:' },
    { line: 6, text: '            level = []' },
    { line: 7, text: '            for _ in range(len(queue)):' },
    { line: 8, text: '                node = queue.popleft()' },
    { line: 9, text: '                level.append(node.val)' },
    { line: 10, text: '                if node.left:  queue.append(node.left)' },
    { line: 11, text: '                if node.right: queue.append(node.right)' },
    { line: 12, text: '            res.append(level)' },
    { line: 13, text: '        return res[::-1]  # Reverse!' },
]

function generateSteps(arr) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{ phase: 'done', activeLine: 3, activeIds: new Set(), visitedIds: new Set(), queueIds: new Set(), levels: [], reversedLevels: [], positions, edges, allNodes, message: 'Empty tree → return []' }]
    }

    const visitedIds = new Set()
    const levels = []

    steps.push({ phase: 'init', activeLine: 4, activeIds: new Set(), visitedIds: new Set(visitedIds), queueIds: new Set([root.id]), levels: [...levels], reversedLevels: [...levels], positions, edges, allNodes, message: 'Init queue with root.' })

    let queue = [root]

    while (queue.length) {
        const levelSize = queue.length
        const levelVals = []
        const levelIds = queue.map((n) => n.id)

        steps.push({
            phase: 'level-start', activeLine: 6,
            activeIds: new Set(levelIds), visitedIds: new Set(visitedIds),
            queueIds: new Set(queue.map((n) => n.id)),
            levels: [...levels],
            reversedLevels: [...levels].reverse(),
            positions, edges, allNodes,
            message: `Start new level with ${levelSize} node(s): [${queue.map((n) => n.val).join(', ')}]`,
        })

        const nextQueue = []

        for (let i = 0; i < levelSize; i++) {
            const node = queue[i]
            visitedIds.add(node.id)
            levelVals.push(node.val)

            if (node.left) nextQueue.push(node.left)
            if (node.right) nextQueue.push(node.right)

            steps.push({
                phase: 'visit', activeLine: 9,
                activeIds: new Set([node.id]),
                visitedIds: new Set(visitedIds),
                queueIds: new Set(nextQueue.map((n) => n.id)),
                levels: [...levels],
                reversedLevels: [...levels].reverse(),
                positions, edges, allNodes,
                message: `Visit node ${node.val}. Add value to current level.`,
            })
        }

        levels.push([...levelVals])

        steps.push({
            phase: 'level-done', activeLine: 12,
            activeIds: new Set(),
            visitedIds: new Set(visitedIds),
            queueIds: new Set(nextQueue.map((n) => n.id)),
            levels: [...levels],
            reversedLevels: [...levels].reverse(),
            positions, edges, allNodes,
            message: `Level complete: [${levelVals.join(', ')}]. Intermediate result: ${JSON.stringify(levels)}`,
        })

        queue = nextQueue
    }

    steps.push({
        phase: 'done', activeLine: 13,
        activeIds: new Set(), visitedIds: new Set(visitedIds), queueIds: new Set(),
        levels: [...levels],
        reversedLevels: [...levels].reverse(),
        positions, edges, allNodes,
        message: `BFS complete. Reverse the result: ${JSON.stringify([...levels].reverse())}`,
    })

    return steps
}

const EXAMPLES = getExamples('binary-tree-level-order-ii')

function VisualizationPanel({
    EXAMPLES,
    arrInput,
    setArrInput,
    positions,
    edges,
    allNodes,
    step,
    applyExample,
    handleReset,
    CANVAS_W,
    CANVAS_H,
    NODE_R,
}) {
    return (
        <div className="btloti-viz-panel">
            <div className="btloti-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="btloti-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <input className="btloti-input" value={arrInput} onChange={(e) => { setArrInput(e.target.value); handleReset() }} />
            <div className="btloti-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                <TreeCanvas3D
                    positions={positions}
                    edges={edges}
                    allNodes={allNodes}
                    activeIds={step?.activeIds ?? new Set()}
                    visitedIds={step?.visitedIds ?? new Set()}
                    queueIds={step?.queueIds ?? new Set()}
                    canvasWidth={CANVAS_W}
                    canvasHeight={CANVAS_H}
                    nodeRadius={NODE_R}
                />
            </div>
        </div>
    );
}

function ResultPanel({
    step,
    inputError,
    LEVEL_COLORS,
}) {
    return (
        <div className="btloti-result-panel">
            <div className="btloti-queue-label">Queue: [{[...(step?.queueIds ?? [])].join(', ')}]</div>
            <div className="btloti-levels">
                <div className="btloti-section-label">Top-to-Bottom (before reverse):</div>
                {(step?.levels ?? []).map((level, i) => (
                    <div key={`forward-${i}`} className="btloti-level-row" style={{ borderLeftColor: LEVEL_COLORS[i % LEVEL_COLORS.length] }}>
                        <span className="btloti-level-idx">L{i}</span>
                        <span className="btloti-level-vals">[{level.join(', ')}]</span>
                    </div>
                ))}
                {(step?.levels?.length === 0) && <div className="btloti-empty">No levels yet</div>}
            </div>
            <div className="btloti-separator" />
            <div className="btloti-levels">
                <div className="btloti-section-label">Bottom-to-Top (after reverse):</div>
                {(step?.reversedLevels ?? []).map((level, i) => (
                    <div key={`reverse-${i}`} className="btloti-level-row" style={{ borderLeftColor: LEVEL_COLORS[(step?.levels?.length - 1 - i) % LEVEL_COLORS.length] }}>
                        <span className="btloti-level-idx">L{i}</span>
                        <span className="btloti-level-vals">[{level.join(', ')}]</span>
                    </div>
                ))}
                {(step?.reversedLevels?.length === 0) && <div className="btloti-empty">No levels yet</div>}
            </div>
            <div className={`btloti-result ${step?.phase === 'done' ? 'ok' : ''}`}>
                {step?.phase === 'done' ? `${step.reversedLevels.length} levels (reversed)` : 'Running BFS…'}
            </div>
            {inputError && <div className="btloti-error-box">{inputError}</div>}
        </div>
    );
}

export default function BinaryTreeLevelOrderTraversalIIVisualizer() {
    const [arrInput, setArrInput] = useState('[3,9,20,null,null,15,7]')
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const { arr, inputError } = useMemo(() => {
        try {
            return { arr: parseTreeInput(arrInput), inputError: '' }
        } catch (e) {
            return { arr: [3, 9, 20, null, null, 15, 7], inputError: e.message || 'Invalid input' }
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

    // Color level bands
    const LEVEL_COLORS = ['#89b4fa', '#a6e3a1', '#f9e2af', '#cba6f7', '#f38ba8', '#89dceb']

    // Create dock panels
    const dockPanels = useMemo(() => [
        {
            id: 'viz',
            title: 'Tree Visualization',
            subtitle: inputError ? 'Fix the input to resume playback.' : 'Visualize the BFS traversal.',
            defaultZone: 'left',
            content: (
                <VisualizationPanel
                    EXAMPLES={EXAMPLES}
                    arrInput={arrInput}
                    setArrInput={setArrInput}
                    positions={positions}
                    edges={edges}
                    allNodes={allNodes}
                    step={step}
                    applyExample={applyExample}
                    handleReset={handleReset}
                    CANVAS_W={CANVAS_W}
                    CANVAS_H={CANVAS_H}
                    NODE_R={NODE_R}
                />
            ),
        },
        {
            id: 'result',
            title: 'Level Results (with Reversal)',
            subtitle: step ? `Phase: ${step.phase}` : 'Levels before and after reverse.',
            defaultZone: 'left',
            content: (
                <ResultPanel
                    step={step}
                    inputError={inputError}
                    LEVEL_COLORS={LEVEL_COLORS}
                />
            ),
        },
        {
            id: 'code',
            title: 'Code Trace',
            subtitle: step ? `Active line ${step.activeLine}` : 'Step-by-step code execution.',
            defaultZone: 'full',
            content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} autoScroll={autoScrollCode} />,
        },
    ], [arrInput, setArrInput, positions, edges, allNodes, step, applyExample, handleReset, inputError, setActiveLineDom, autoScrollCode])

    return (
        <div className="btloti-shell">
            <div className="btloti-header">
                <h2>Binary Tree Level Order Traversal II</h2>
                <p className={`btloti-message ${step?.phase === 'done' ? 'ok' : ''}`}>
                    {step?.message || 'Press Play to begin.'}
                </p>
            </div>

            <DockableWorkspace
                title="BFS Level Order (Reversed) Workspace"
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
