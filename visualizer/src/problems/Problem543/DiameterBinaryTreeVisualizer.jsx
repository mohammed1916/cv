import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { getExamples } from '../../config/examplesRegistry'
import './DiameterBinaryTreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['call', 'done', 'return', 'right']
const LINE_PATTERN_MAP = {
  5: 'done',
  6: 'call',
  7: 'right',
  9: 'return',
  11: 'done'
}


const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

const SOLUTION_CODE_INLINE = [
    { line: 1, text: 'class Solution:' },
    { line: 2, text: '    def diameterOfBinaryTree(self, root):' },
    { line: 3, text: '        self.diameter = 0' },
    { line: 4, text: '        def depth(node):' },
    { line: 5, text: '            if not node: return 0' },
    { line: 6, text: '            left  = depth(node.left)' },
    { line: 7, text: '            right = depth(node.right)' },
    { line: 8, text: '            self.diameter = max(self.diameter, left + right)' },
    { line: 9, text: '            return 1 + max(left, right)' },
    { line: 10, text: '        depth(root)' },
    { line: 11, text: '        return self.diameter' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function VisualizationPanel({ step, positions, edges, allNodes, inputError, applyExample }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto', padding: 16 }}>
            <section className="dbt-panel main">
                <header className="dbt-head">
                    <span>Post-order DFS (depth tracking)</span>
                    {inputError && <span className="dbt-error">{inputError}</span>}
                </header>
                <div className="dbt-body">
                    <div className="dbt-examples">
                        {EXAMPLES.map((example) => (
                            <button key={example.label} className="dbt-chip" onClick={() => applyExample(example)}>{example.label}</button>
                        ))}
                    </div>
                    <div className="dbt-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
                        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CANVAS_W} height={CANVAS_H}>
                            {edges.map(({ fromId, toId }) => {
                                const from = positions.get(fromId)
                                const to = positions.get(toId)
                                if (!from || !to) return null
                                return <line key={`${fromId}-${toId}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--code-line)" strokeWidth={1.5} />
                            })}
                        </svg>
                        {allNodes.map((node) => {
                            const pos = positions.get(node.id)
                            if (!pos) return null
                            const isActive = step?.activeId === node.id
                            const depthValue = step?.depthMap?.get(node.id)
                            return (
                                <motion.div key={node.id} className={`dbt-node ${isActive ? 'active' : ''} ${depthValue !== undefined ? 'done' : ''}`} style={{ left: pos.x - NODE_R, top: pos.y - NODE_R }} animate={{ scale: isActive ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                    {node.val}
                                    {depthValue !== undefined && <span className="dbt-badge">{depthValue}</span>}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>
            <section className="dbt-panel side">
                <header className="dbt-head"><span>Diameter</span></header>
                <div className="dbt-body">
                    <div className="dbt-diameter-display">
                        <span className="dbt-label">Current diameter</span>
                        <motion.div className="dbt-diameter-val" key={step?.diameter} initial={{ scale: 0.7 }} animate={{ scale: 1 }}>{step?.diameter ?? 0}</motion.div>
                    </div>
                    <div className="dbt-depth-list">
                        <span className="dbt-label">Depths computed</span>
                        {allNodes.filter((node) => step?.depthMap?.has(node.id)).map((node) => <div key={node.id} className="dbt-depth-row"><span>node {node.val}</span><span className="dbt-depth-val">depth={step.depthMap.get(node.id)}</span></div>)}
                        {!allNodes.some((node) => step?.depthMap?.has(node.id)) && <span className="dbt-empty">none yet</span>}
                    </div>
                    <div className={`dbt-result ${step?.phase === 'done' ? 'ok' : ''}`}>{step?.phase === 'done' ? `Diameter = ${step.diameter}` : 'Computing...'}</div>
                </div>
            </section>
            <div className={`dbt-status ${step?.phase === 'done' ? 'ok' : ''}`}>{step?.message || 'Press Play to begin.'}</div>
        </div>
    )
}

function generateSteps(arr) {
    const root = buildTree(arr)
    const positions = computeLayout(root, CANVAS_W, 80)
    const edges = buildEdges(root)
    const allNodes = collectNodes(root)
    const steps = []

    if (!root) {
        return [{ phase: 'done', activeLine: 5, activeId: -1, diameter: 0, depthMap: new Map(), bestPairIds: [], positions, edges, allNodes, message: 'Empty tree → diameter = 0' }]
    }

    let diameter = 0
    const depthMap = new Map() // nodeId -> depth returned
    let bestPairIds = []  // [leftDescendant ids, rightDescendant ids] for visualizing the path

    // Track which pair gives the best diameter
    let bestLeft = null
    let bestRight = null
    let bestNode = null

    function dfs(node) {
        if (!node) return 0

        steps.push({
            phase: 'call', activeLine: 6, activeId: node.id,
            diameter, depthMap: new Map(depthMap), bestPairIds,
            positions, edges, allNodes,
            message: `Call depth(${node.val}) — recurse left`,
        })

        const left = dfs(node.left)

        steps.push({
            phase: 'right', activeLine: 7, activeId: node.id,
            diameter, depthMap: new Map(depthMap), bestPairIds,
            positions, edges, allNodes,
            message: `depth(${node.val}): left=${left} — recurse right`,
        })

        const right = dfs(node.right)

        const localDiameter = left + right
        if (localDiameter > diameter) {
            diameter = localDiameter
            bestNode = node.id
        }

        const d = 1 + Math.max(left, right)
        depthMap.set(node.id, d)

        steps.push({
            phase: 'return', activeLine: 9, activeId: node.id,
            diameter, depthMap: new Map(depthMap), bestPairIds,
            positions, edges, allNodes,
            message: `depth(${node.val}): left=${left}, right=${right}, path=${localDiameter}, diameter=${diameter}, return ${d}`,
        })

        return d
    }

    dfs(root)

    steps.push({
        phase: 'done', activeLine: 11, activeId: -1,
        diameter, depthMap: new Map(depthMap), bestPairIds,
        positions, edges, allNodes,
        message: `Diameter = ${diameter}`,
    })

    return steps
}

const EXAMPLES = getExamples('diameter-binary-tree')

export default function DiameterBinaryTreeVisualizer() {
    const [arrInput, setArrInput] = useState('[1,2,3,4,5]')
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

    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input' },
        { id: 'viz', title: 'Diameter of Binary Tree', dockMode: 'split-bottom' },
        { id: 'code', title: 'Code', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    const codePanel = (
        <div style={{ position: 'relative' }}>
            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
            {showPatternOverlay && <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />}
        </div>
    )

    return (
        <div className="dbt-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && <>
                {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'arr', label: 'Level-order tree', type: 'string' }]} values={{ arr: arrInput }} onChange={(key, value) => { if (key === 'arr') setArrInput(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={inputError} />, panelDivs.input)}
                {panelDivs.viz && createPortal(<VisualizationPanel step={step} positions={positions} edges={edges} allNodes={allNodes} inputError={inputError} applyExample={applyExample} />, panelDivs.viz)}
                {panelDivs.code && createPortal(codePanel, panelDivs.code)}
            </>}
            <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
        <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
      </FloatingPanel>
            
        </div>
    )
}
