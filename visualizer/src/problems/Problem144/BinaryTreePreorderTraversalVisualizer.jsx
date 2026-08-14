import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './BinaryTreePreorderTraversalVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('binary-tree-preorder-traversal', [
  { label: 'Example 1', root: [1, 2, 3] },
  { label: 'Example 2', root: [] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def preorderTraversal(root):' },
  { line: 2, text: '    if not root: return []' },
  { line: 3, text: '    result = []' },
  { line: 4, text: '    stack = [root]' },
  { line: 5, text: '    while stack:' },
  { line: 6, text: '        node = stack.pop()' },
  { line: 7, text: '        result.append(node.val)' },
  { line: 8, text: '        if node.right: stack.append(node.right)' },
  { line: 9, text: '        if node.left: stack.append(node.left)' },
  { line: 10, text: '    return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const root = { val: arr[0], left: null, right: null, id: 0 }
  const q = [root]
  let nodeId = 1
  let i = 1
  while (q.length && i < arr.length) {
    const node = q.shift()
    if (arr[i] !== null) {
      node.left = { val: arr[i], left: null, right: null, id: nodeId++ }
      q.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i], left: null, right: null, id: nodeId++ }
      q.push(node.right)
    }
    i++
  }
  return root
}

function generateSteps(arr) {
  const steps = []
  const root = buildTree(arr)

  if (!root) {
    steps.push({
      activeLine: 2,
      message: 'Empty tree',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: 'Preorder traversal: root → left → right',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    result: [],
    stack: [root],
    message: 'Initialize result and stack with root',
    relatedLines: [3, 4],
  })

  const result = []
  const stack = [root]
  const processedIds = new Set()

  while (stack.length > 0) {
    const node = stack.pop()

    steps.push({
      activeLine: 6,
      currentNode: node,
      stack: [...stack],
      result: [...result],
      message: `Pop: ${node.val}`,
      relatedLines: [6],
    })

    result.push(node.val)
    processedIds.add(node.id)

    steps.push({
      activeLine: 7,
      currentNode: node,
      stack: [...stack],
      result: [...result],
      processedIds: Array.from(processedIds),
      message: `Add ${node.val} to result`,
      relatedLines: [7],
    })

    if (node.right) {
      stack.push(node.right)

      steps.push({
        activeLine: 8,
        currentNode: node,
        stack: [...stack],
        result: [...result],
        message: `Push right child: ${node.right.val}`,
        relatedLines: [8],
      })
    }

    if (node.left) {
      stack.push(node.left)

      steps.push({
        activeLine: 9,
        currentNode: node,
        stack: [...stack],
        result: [...result],
        message: `Push left child: ${node.left.val}`,
        relatedLines: [9],
      })
    }
  }

  steps.push({
    activeLine: 10,
    result,
    done: true,
    message: `Complete! Preorder: ${result.join(' → ')}`,
    relatedLines: [10],
  })

  return steps
}

function TreeVisualization({ root, currentNode, processedIds }) {
  if (!root) return null

  const width = 400
  const height = 300

  function getAllNodes(node, nodes = [], x = 200, y = 30, offset = 80) {
    if (!node) return nodes
    nodes.push({ ...node, x, y })
    if (node.left) getAllNodes(node.left, nodes, x - offset, y + 60, offset / 2)
    if (node.right) getAllNodes(node.right, nodes, x + offset, y + 60, offset / 2)
    return nodes
  }

  const nodes = getAllNodes(root)
  const edges = []

  function addEdges(node) {
    if (!node) return
    const nodeData = nodes.find(n => n.id === node.id)
    if (node.left) {
      const leftData = nodes.find(n => n.id === node.left.id)
      edges.push({ x1: nodeData.x, y1: nodeData.y, x2: leftData.x, y2: leftData.y })
      addEdges(node.left)
    }
    if (node.right) {
      const rightData = nodes.find(n => n.id === node.right.id)
      edges.push({ x1: nodeData.x, y1: nodeData.y, x2: rightData.x, y2: rightData.y })
      addEdges(node.right)
    }
  }

  addEdges(root)

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg width={width} height={height} style={{ border: '1px solid #334155' }}>
        {/* Edges */}
        {edges.map((edge, idx) => (
          <line
            key={idx}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke="#64748b"
            strokeWidth={2}
            markerEnd="url(#arrowhead)"
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => {
          const isCurrent = currentNode && currentNode.id === node.id
          const isProcessed = processedIds && processedIds.includes(node.id)

          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={isCurrent ? '#fbbf24' : isProcessed ? '#86efac' : '#e2e8f0'}
                stroke={isCurrent ? '#f59e0b' : isProcessed ? '#22c55e' : '#94a3b8'}
                strokeWidth={isCurrent ? 3 : 2}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dy="0.3em"
                fontSize={14}
                fontWeight={600}
                fill="#0f172a"
              >
                {node.val}
              </text>
            </g>
          )
        })}

        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

function VisualizationPanel({ step, root }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          Iterative preorder: stack-based traversal, process root before children.
        </div>
      </div>

      <TreeVisualization
        root={root}
        currentNode={step.currentNode}
        processedIds={step.processedIds}
      />

      {step.stack && step.stack.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Stack (top to bottom)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {step.stack.map((node, idx) => (
              <div
                key={idx}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#a5b4fc',
                  borderRadius: 3,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#1e1b4b',
                }}
              >
                {node.val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Result
          </div>
          <div style={{ fontSize: 12, color: '#065f46', fontFamily: 'monospace' }}>
            {step.result.join(' → ')}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function BinaryTreePreorderTraversalVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","root":[1,2,3]});
  const [arrInput, setArrInput] = useState("");
  const { arr, inputError } = useMemo(() => {
    try {
      const parsedArr = arrInput;
      return { arr: parsedArr, inputError: '' };
    } catch (e) {
      return { arr: "", inputError: e.message };
    }
  }, [arrInput]);  const root = useMemo(() => buildTree(input), [arr])
  const steps = useMemo(
    () =>
      generateSteps(arr).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [arr]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setArrInput(String(e.arr)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels for Lumino
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} patterns={PATTERNS} linePatternMap={LINE_PATTERN_MAP} />}
    </div>
  )

  const primaryPanel = (
    <>
    <div className="btpt-panel">
      <VisualizationPanel step={step} root={root} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="btpt-status">
      {step?.message && (
        <div style={{ padding: 8, fontSize: 12, color: '#94a3b8' }}>
          {step.message}
        </div>
      )}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🌳 Preorder Traversal', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="btpt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
