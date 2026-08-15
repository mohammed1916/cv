import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MaxDepthNaryVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maxDepth(self, root):' },
  { line: 3, text: '        if not root:' },
  { line: 4, text: '            return 0' },
  { line: 5, text: '        ' },
  { line: 6, text: '        max_child_depth = 0' },
  { line: 7, text: '        for child in root.children:' },
  { line: 8, text: '            child_depth = self.maxDepth(child)' },
  { line: 9, text: '            max_child_depth = max(max_child_depth, child_depth)' },
  { line: 10, text: '        ' },
  { line: 11, text: '        return 1 + max_child_depth' },
]

const PATTERNS = ['check', 'loop', 'recurse', 'compare', 'return', 'done']
const LINE_PATTERN_MAP = {
  3: 'check',
  7: 'loop',
  8: 'recurse',
  9: 'compare',
  11: 'return',
}

// Build N-ary tree from nested array format
// Format: [value, child1, child2, ...] where each child is also in this format
// Example: [1, [2], [3, [4], [5]]] creates:
//     1
//    / \
//   2   3
//      / \
//     4   5
function buildNaryTree(arr) {
  if (!arr || arr.length === 0) return null

  const nodeMap = new Map()
  let nodeId = 0

  function build(item, depth = 0) {
    if (!Array.isArray(item) || item.length === 0) return null

    const id = nodeId++
    const val = item[0]
    const node = {
      id,
      val,
      depth,
      children: [],
    }
    nodeMap.set(id, node)

    // Children are elements 1 onwards
    for (let i = 1; i < item.length; i++) {
      const child = build(item[i], depth + 1)
      if (child) node.children.push(child)
    }

    return node
  }

  const root = build(arr, 0)
  return { root, nodeMap, totalNodes: nodeId }
}

// Compute layout for tree nodes using level-based positioning
function computeNaryTreeLayout(root, canvasWidth, canvasHeight) {
  const positions = new Map()
  if (!root) return positions

  // Calculate level widths
  const levelNodes = new Map()

  function collectByLevel(node, level = 0) {
    if (!levelNodes.has(level)) levelNodes.set(level, [])
    levelNodes.get(level).push(node)
    node.children.forEach((child) => collectByLevel(child, level + 1))
  }

  collectByLevel(root)

  const maxLevel = Math.max(...levelNodes.keys())
  const vSpacing = (canvasHeight - 40) / (maxLevel + 1)

  levelNodes.forEach((nodes, level) => {
    const levelWidth = nodes.length
    const hSpacing = (canvasWidth - 40) / Math.max(1, levelWidth - 1 || 1)

    nodes.forEach((node, index) => {
      const x = levelWidth === 1 ? canvasWidth / 2 : 20 + index * hSpacing
      const y = 20 + (level + 0.5) * vSpacing
      positions.set(node.id, { x, y })
    })
  })

  return positions
}

function generateSteps(arr) {
  const steps = []

  if (!Array.isArray(arr) || arr.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 4,
      relatedLines: [4],
      message: 'Empty tree. Maximum depth = 0',
      maxDepth: 0,
      done: true,
    })
    return steps
  }

  const { root, nodeMap } = buildNaryTree(arr)

  if (!root) {
    steps.push({
      phase: 'done',
      activeLine: 4,
      relatedLines: [4],
      message: 'Invalid tree structure.',
      maxDepth: 0,
      done: true,
    })
    return steps
  }

  const depthMap = new Map() // nodeId -> depth returned
  const visitOrder = []

  function dfs(node, callStack) {
    visitOrder.push(node.id)

    steps.push({
      phase: 'check',
      activeLine: 3,
      relatedLines: [3],
      message: `Enter node ${node.val}. Check if null.`,
      currentNode: node.id,
      currentValue: node.val,
      callStack: [...callStack],
      depthMap: new Map(depthMap),
    })

    if (node.children.length === 0) {
      steps.push({
        phase: 'compare',
        activeLine: 6,
        relatedLines: [6],
        message: `Node ${node.val} has no children. max_child_depth = 0`,
        currentNode: node.id,
        currentValue: node.val,
        callStack: [...callStack],
        depthMap: new Map(depthMap),
      })
    } else {
      steps.push({
        phase: 'loop',
        activeLine: 7,
        relatedLines: [7],
        message: `Node ${node.val} has ${node.children.length} child(ren). Start loop.`,
        currentNode: node.id,
        currentValue: node.val,
        callStack: [...callStack],
        depthMap: new Map(depthMap),
      })
    }

    let maxChildDepth = 0

    node.children.forEach((child, index) => {
      steps.push({
        phase: 'recurse',
        activeLine: 8,
        relatedLines: [8],
        message: `Recurse on child ${index + 1}/${node.children.length}: node ${child.val}`,
        currentNode: node.id,
        currentValue: node.val,
        processingChild: child.id,
        childValue: child.val,
        callStack: [...callStack, node.val],
        depthMap: new Map(depthMap),
      })

      const childDepth = dfs(child, [...callStack, node.val])

      steps.push({
        phase: 'compare',
        activeLine: 9,
        relatedLines: [9],
        message: `Back at ${node.val}: child ${child.val} depth = ${childDepth}. Compare with max_child_depth = ${maxChildDepth}.`,
        currentNode: node.id,
        currentValue: node.val,
        childValue: child.val,
        childDepth,
        maxChildDepth,
        callStack: [...callStack],
        depthMap: new Map(depthMap),
      })

      maxChildDepth = Math.max(maxChildDepth, childDepth)

      steps.push({
        phase: 'compare',
        activeLine: 9,
        relatedLines: [9],
        message: `Updated max_child_depth = ${maxChildDepth}`,
        currentNode: node.id,
        currentValue: node.val,
        maxChildDepth,
        callStack: [...callStack],
        depthMap: new Map(depthMap),
      })
    })

    const nodeDepth = 1 + maxChildDepth
    depthMap.set(node.id, nodeDepth)

    steps.push({
      phase: 'return',
      activeLine: 11,
      relatedLines: [11],
      message: `Return from ${node.val}: 1 + ${maxChildDepth} = ${nodeDepth}`,
      currentNode: node.id,
      currentValue: node.val,
      returnDepth: nodeDepth,
      callStack: [...callStack],
      depthMap: new Map(depthMap),
    })

    return nodeDepth
  }

  const totalDepth = dfs(root, [])

  steps.push({
    phase: 'done',
    activeLine: 11,
    relatedLines: [11],
    message: `Tree traversal complete. Maximum depth = ${totalDepth}`,
    maxDepth: totalDepth,
    done: true,
    depthMap: new Map(depthMap),
  })

  return { steps, root, nodeMap }
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.currentValue !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Current Node</div>
          <div style={{ fontSize: 16, color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.currentValue}
          </div>
        </div>
      )}

      {step?.childValue !== undefined && step.phase === 'recurse' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Recursing on Child</div>
          <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.childValue}
          </div>
        </div>
      )}

      {step?.childDepth !== undefined && step.phase === 'compare' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Depth Comparison</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#e2e8f0' }}>
            <div>
              Child <span style={{ color: '#38bdf8', fontWeight: 600 }}>{step.childValue}</span> depth:{' '}
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{step.childDepth}</span>
            </div>
            <div>
              Max so far:{' '}
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>{step.maxChildDepth}</span>
            </div>
          </div>
        </div>
      )}

      {step?.returnDepth !== undefined && step.phase === 'return' && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Returning Depth</div>
          <div style={{ fontSize: 16, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.returnDepth}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>From node {step.currentValue}</div>
        </div>
      )}

      {step?.maxDepth !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Maximum Depth</div>
          <div
            style={{
              fontSize: 24,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#22c55e',
            }}
          >
            {step.maxDepth}
          </div>
        </motion.div>
      )}

      {step?.callStack && step.callStack.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Call Stack</div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
            {step.callStack.map((val, i) => (
              <div key={i} style={{ fontSize: 11, color: '#e2e8f0', paddingLeft: `${i * 12}px` }}>
                → maxDepth({val})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TreeVisualization({ root, nodeMap, step, canvasWidth = 400, canvasHeight = 300 }) {
  const positions = useMemo(() => computeNaryTreeLayout(root, canvasWidth, canvasHeight), [root, canvasWidth, canvasHeight])

  if (!root) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: canvasHeight, color: '#64748b' }}>
        Empty tree
      </div>
    )
  }

  const nodes = Array.from(nodeMap.values())

  // Draw edges
  const edgeElements = []
  nodes.forEach((node) => {
    const pos1 = positions.get(node.id)
    if (!pos1) return
    node.children.forEach((child) => {
      const pos2 = positions.get(child.id)
      if (!pos2) return
      edgeElements.push(
        <line
          key={`edge-${node.id}-${child.id}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke="#475569"
          strokeWidth="2"
        />
      )
    })
  })

  return (
    <svg width={canvasWidth} height={canvasHeight} style={{ border: '1px solid #334155', borderRadius: 6 }}>
      {edgeElements}
      {nodes.map((node) => {
        const pos = positions.get(node.id)
        if (!pos) return null

        const isActive = step?.currentNode === node.id
        const isProcessing = step?.processingChild === node.id
        const returnDepth = step?.depthMap?.get(node.id)

        let fill = '#1e293b'
        let stroke = '#475569'
        let strokeWidth = 2

        if (isActive) {
          fill = '#22c55e'
          stroke = '#22c55e'
          strokeWidth = 3
        } else if (isProcessing) {
          fill = '#38bdf8'
          stroke = '#38bdf8'
          strokeWidth = 3
        } else if (returnDepth !== undefined) {
          fill = '#a78bfa'
          stroke = '#a78bfa'
          strokeWidth = 2
        }

        return (
          <g key={`node-${node.id}`}>
            <circle cx={pos.x} cy={pos.y} r="20" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">
              {node.val}
            </text>
            {returnDepth !== undefined && (
              <text x={pos.x} y={pos.y + 35} textAnchor="middle" fontSize="11" fill={stroke} fontWeight="600">
                d={returnDepth}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function MaxDepthNaryVisualizer() {
  const examples = useMemo(() => getExamplesOr('max-depth-nary-tree', []), [])
  const [treeInput, setTreeInput] = useState('[1,[3,5,6],[2,4]]')

  const { tree, nodeMap, inputError } = useMemo(() => {
    try {
      const arr = JSON.parse(treeInput)
      if (!Array.isArray(arr) || arr.length === 0) throw new Error('Input must be non-empty array')
      const { root, nodeMap: nm } = buildNaryTree(arr)
      return { tree: root, nodeMap: nm, inputError: '' }
    } catch (e) {
      return { tree: null, nodeMap: new Map(), inputError: e.message }
    }
  }, [treeInput])

  const { steps } = useMemo(() => generateSteps(tree ? treeInput : []), [treeInput, tree])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setTreeInput(JSON.stringify(ex.tree || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 N-ary Tree Traversal', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Tree Structure (Nested Array)</div>
              <textarea
                value={treeInput}
                onChange={(e) => {
                  setTreeInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Tree Visualization</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <TreeVisualization root={tree} nodeMap={nodeMap} step={step} canvasWidth={360} canvasHeight={280} />
              </div>
            </div>

            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, treeInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom, tree, nodeMap])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"array"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
