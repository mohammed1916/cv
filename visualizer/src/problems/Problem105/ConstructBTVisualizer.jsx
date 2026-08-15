import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ConstructBTVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def buildTree(preorder, inorder):' },
    { line: 2, text: '    if not preorder: return None' },
    { line: 3, text: '    root_val = preorder[0]' },
    { line: 4, text: '    mid = inorder.index(root_val)' },
    { line: 5, text: '    root = TreeNode(root_val)' },
    { line: 6, text: '    root.left = buildTree(' },
    { line: 7, text: '        preorder[1:mid+1], inorder[:mid])' },
    { line: 8, text: '    root.right = buildTree(' },
    { line: 9, text: '        preorder[mid+1:], inorder[mid+1:])' },
    { line: 10, text: '    return root' },
]

let nodeIdCounter = 0

function generateSteps(preArr, inArr) {
    nodeIdCounter = 0
    const steps = []
    const builtNodes = [] // {id, val, x, y, parentId}

    // Layout: we'll assign positions in a simple way post-build
    function build(pre, ino, depth, parentId) {
        if (pre.length === 0) return null

        const rootVal = pre[0]
        const mid = ino.indexOf(rootVal)
        const id = nodeIdCounter++

        steps.push({
            phase: 'pick_root', activeLine: 3,
            preSlice: [...pre], inoSlice: [...ino], mid, rootVal, depth, id, parentId,
            builtNodes: builtNodes.map((n) => ({ ...n })),
            message: `preorder[0]=${rootVal} is the root; it splits inorder at index ${mid}`,
        })

        builtNodes.push({ id, val: rootVal, parentId, depth })

        steps.push({
            phase: 'create', activeLine: 5,
            preSlice: [...pre], inoSlice: [...ino], mid, rootVal, depth, id, parentId,
            builtNodes: builtNodes.map((n) => ({ ...n })),
            message: `Create node(${rootVal}). Left inorder: [${ino.slice(0, mid).join(',')}], Right: [${ino.slice(mid + 1).join(',')}]`,
        })

        const left = build(pre.slice(1, mid + 1), ino.slice(0, mid), depth + 1, id)
        const right = build(pre.slice(mid + 1), ino.slice(mid + 1), depth + 1, id)

        return { id, val: rootVal, left, right, depth }
    }

    steps.push({ phase: 'init', activeLine: 1, preSlice: [...preArr], inoSlice: [...inArr], builtNodes: [], message: 'Start building tree' })
    const tree = build(preArr, inArr, 0, null)
    steps.push({ phase: 'done', activeLine: 10, preSlice: [], inoSlice: [], builtNodes: builtNodes.map((n) => ({ ...n })), tree, message: 'Tree construction complete!' })
    return { steps, finalTree: tree }
}

function layoutTree(root) {
    if (!root) return new Map()
    const map = new Map()
    let order = 0
    const levelCounts = {}

    function countDepth(node, depth) {
        if (!node) return
        levelCounts[depth] = (levelCounts[depth] || 0) + 1
        countDepth(node.left, depth + 1)
        countDepth(node.right, depth + 1)
    }
    countDepth(root, 0)

    const W = 400, LH = 68
    const levelX = {}
    function assign(node, depth) {
        if (!node) return
        assign(node.left, depth + 1)
        levelX[depth] = (levelX[depth] || 0) + 1
        const cnt = levelCounts[depth]
        const x = (levelX[depth] / (cnt + 1)) * W
        map.set(node.id, { x, y: depth * LH + 32 })
        assign(node.right, depth + 1)
    }
    assign(root, 0)
    return map
}

function collectEdges(root) {
    const edges = []
    function dfs(node) {
        if (!node) return
        if (node.left) { edges.push({ from: node.id, to: node.left.id }); dfs(node.left) }
        if (node.right) { edges.push({ from: node.id, to: node.right.id }); dfs(node.right) }
    }
    dfs(root)
    return edges
}

const EXAMPLES = getExamples('construct-binary-tree')

function parseArr(str) {
    try { const p = JSON.parse(str); if (!Array.isArray(p)) throw new Error(); return { arr: p.map(Number), err: '' } }
    catch (e) { return { arr: [], err: 'Invalid JSON array' } }
}

export default function ConstructBTVisualizer() {
    const [preInput, setPreInput] = useState('[3,9,20,15,7]')
    const [inoInput, setInoInput] = useState('[9,3,15,20,7]')

    const { arr: preArr, err: preErr } = useMemo(() => parseArr(preInput), [preInput])
    const { arr: inoArr, err: inoErr } = useMemo(() => parseArr(inoInput), [inoInput])

    const { steps, finalTree } = useMemo(() => {
        if (preArr.length !== inoArr.length || preArr.length === 0) return { steps: [], finalTree: null }
        return generateSteps(preArr, inoArr)
    }, [preArr, inoArr])

    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
    const step = stepIndex >= 0 ? steps[stepIndex] : null
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

    const applyExample = useCallback((ex) => {
        setPreInput(JSON.stringify(ex.pre)); setInoInput(JSON.stringify(ex.ino)); handleReset()
    }, [handleReset])

    // Build final tree layout for visualization
    const treeLayout = useMemo(() => finalTree ? layoutTree(finalTree) : new Map(), [finalTree])
    const allEdges = useMemo(() => finalTree ? collectEdges(finalTree) : [], [finalTree])

    const builtSet = new Set((step?.builtNodes ?? []).map((n) => n.id))
    const activeId = step?.phase === 'create' ? step?.id : null

    // Extract panel consts for Lumino DockPanel
    const inputPanel = (
        <div className="ctpi-panel-body">
              <ManualInputPanel
                fields={[{"key":"pre","label":"pre","type":"string"},{"key":"ino","label":"ino","type":"string"}]}
                values={{ pre: preInput, ino: inoInput }}
                onChange={(k, v) => { if (k === 'pre') setPreInput(v); if (k === 'ino') setInoInput(v); handleReset() }}
                examples={EXAMPLES}
                applyExample={applyExample}
              />
            <div className="ctpi-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="ctpi-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                ))}
            </div>
            <label className="ctpi-field">
                <span>Preorder</span>
                <input
                    className="ctpi-input"
                    value={preInput}
                    onChange={(e) => { setPreInput(e.target.value); handleReset() }}
                />
            </label>
            <label className="ctpi-field">
                <span>Inorder</span>
                <input
                    className="ctpi-input"
                    value={inoInput}
                    onChange={(e) => { setInoInput(e.target.value); handleReset() }}
                />
            </label>
            {(preErr || inoErr) && <div className="ctpi-error">{preErr || inoErr}</div>}
        </div>
    )

    const arraysPanel = (
        <div className="ctpi-panel-body">
            <div className="ctpi-arrays-row">
                <div className="ctpi-arr-panel">
                    <div className="ctpi-arr-label">Current preorder slice</div>
                    <div className="ctpi-arr-cells">
                        {(step?.preSlice ?? []).map((v, i) => (
                            <div key={i} className={`ctpi-cell ${i === 0 && step?.phase !== 'init' ? 'root' : ''}`}>{v}</div>
                        ))}
                    </div>
                </div>
                <div className="ctpi-arr-panel">
                    <div className="ctpi-arr-label">Current inorder slice</div>
                    <div className="ctpi-arr-cells">
                        {(step?.inoSlice ?? []).map((v, i) => (
                            <div key={i} className={`ctpi-cell ${i === step?.mid ? 'mid' : i < (step?.mid ?? -1) ? 'left-part' : 'right-part'}`}>{v}</div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="ctpi-status">{step?.message || 'Press Play to begin.'}</div>
        </div>
    )

    const treePanel = finalTree ? (
        <div className="ctpi-tree-panel">
            <div className="ctpi-tree-canvas" style={{ position: 'relative', width: 400, height: 320 }}>
                <svg style={{ position: 'absolute', inset: 0, overflow: 'visible' }} width={400} height={320}>
                    {allEdges.map((e) => {
                        const p = treeLayout.get(e.from), c = treeLayout.get(e.to)
                        if (!p || !c || !builtSet.has(e.from) || !builtSet.has(e.to)) return null
                        return <line key={`${e.from}-${e.to}`} x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke="#45475a" strokeWidth={2} />
                    })}
                </svg>
                {(step?.builtNodes ?? []).map((nd) => {
                    const pos = treeLayout.get(nd.id)
                    if (!pos) return null
                    return (
                        <motion.div key={nd.id} className={`ctpi-node ${nd.id === activeId ? 'active' : ''}`}
                            style={{ left: pos.x - 22, top: pos.y - 22 }}
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                            {nd.val}
                        </motion.div>
                    )
                })}
            </div>
        </div>
    ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: '#a6adc8' }}>
            Tree visualization will appear when you start playback.
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
            {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} />}
        </div>
    )

    const statusPanel = (
        <div className="ctpi-status-panel">
            {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
        </div>
    )

    // Panel config for Lumino DockPanel
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'input', title: 'Input Playground', dockMode: 'split-right' },
            { id: 'tree', title: 'Tree Visualization', dockMode: 'split-right' },
            { id: 'arrays', title: 'Array Slices', dockMode: 'split-bottom' },
            { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="ctpi-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.tree && createPortal(treePanel, panelDivs.tree)}
                    {panelDivs.arrays && createPortal(arraysPanel, panelDivs.arrays)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">
                    <div style={{ display: 'none' }}>{/* floating panel content moved to status panel */}</div>
                </FloatingPanel>,
                document.body
            )}
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    )
}
