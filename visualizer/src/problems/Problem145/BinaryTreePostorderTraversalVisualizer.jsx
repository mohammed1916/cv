import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './BinaryTreePostorderTraversalVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('binary-tree-postorder-traversal') || [
  { label: 'Example 1', root: [1, 2, 3] },
  { label: 'Example 2', root: [] },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def postorderTraversal(root):' },
  { line: 2, text: '    if not root: return []' },
  { line: 3, text: '    result = []' },
  { line: 4, text: '    stack1 = [root]' },
  { line: 5, text: '    stack2 = []' },
  { line: 6, text: '    while stack1:' },
  { line: 7, text: '        node = stack1.pop()' },
  { line: 8, text: '        stack2.append(node)' },
  { line: 9, text: '        if node.left: stack1.append(node.left)' },
  { line: 10, text: '        if node.right: stack1.append(node.right)' },
  { line: 11, text: '    while stack2:' },
  { line: 12, text: '        result.append(stack2.pop().val)' },
  { line: 13, text: '    return result' },
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
    message: 'Postorder traversal: left → right → root',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    result: [],
    stack1: [root],
    stack2: [],
    message: 'Phase 1: use two stacks to reverse order',
    relatedLines: [3, 4, 5],
  })

  const result = []
  const stack1 = [root]
  const stack2 = []
  const processedIds = new Set()

  // Phase 1: Pre-populate stack2
  while (stack1.length > 0) {
    const node = stack1.pop()

    steps.push({
      activeLine: 7,
      currentNode: node,
      stack1: [...stack1],
      stack2: [...stack2],
      message: `Pop from stack1: ${node.val}`,
      relatedLines: [7],
    })

    stack2.push(node)

    steps.push({
      activeLine: 8,
      currentNode: node,
      stack1: [...stack1],
      stack2: [...stack2],
      message: `Push to stack2: ${node.val}`,
      relatedLines: [8],
    })

    if (node.left) {
      stack1.push(node.left)

      steps.push({
        activeLine: 9,
        currentNode: node,
        stack1: [...stack1],
        stack2: [...stack2],
        message: `Push left child: ${node.left.val}`,
        relatedLines: [9],
      })
    }

    if (node.right) {
      stack1.push(node.right)

      steps.push({
        activeLine: 10,
        currentNode: node,
        stack1: [...stack1],
        stack2: [...stack2],
        message: `Push right child: ${node.right.val}`,
        relatedLines: [10],
      })
    }
  }

  steps.push({
    activeLine: 11,
    stack2: [...stack2],
    message: 'Phase 2: pop from stack2 in reverse order',
    relatedLines: [11],
  })

  // Phase 2: Pop from stack2
  while (stack2.length > 0) {
    const node = stack2.pop()
    result.push(node.val)
    processedIds.add(node.id)

    steps.push({
      activeLine: 12,
      currentNode: node,
      stack2: [...stack2],
      result: [...result],
      processedIds: Array.from(processedIds),
      message: `Pop from stack2: ${node.val}`,
      relatedLines: [12],
    })
  }

  steps.push({
    activeLine: 13,
    result,
    done: true,
    message: `Complete! Postorder: ${result.join(' → ')}`,
    relatedLines: [13],
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

        {nodes.map((node) => {
          const isCurrent = currentNode && currentNode.id === node.id
          const isProcessed = processedIds && processedIds.includes(node.id)

          return (
            <g key={node.id}>
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={24}
                fill={isCurrent ? '#fbbf24' : isProcessed ? '#f472b6' : '#e2e8f0'}
                stroke={isCurrent ? '#f59e0b' : isProcessed ? '#ec4899' : '#94a3b8'}
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
      <div style={{ padding: 12, backgroundColor: '#fbcfe8', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          Two-stack postorder: reverse the preorder result to get postorder.
        </div>
      </div>

      <TreeVisualization
        root={root}
        currentNode={step.currentNode}
        processedIds={step.processedIds}
      />

      {step.stack1 && step.stack1.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Stack 1
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {step.stack1.map((node, idx) => (
              <div key={idx} style={{ padding: '4px 8px', backgroundColor: '#a5b4fc', borderRadius: 3, fontSize: 11, fontWeight: 600, color: '#1e1b4b' }}>
                {node.val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.stack2 && step.stack2.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#fbcfe8', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#831843', marginBottom: 8 }}>
            Stack 2
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {step.stack2.map((node, idx) => (
              <div key={idx} style={{ padding: '4px 8px', backgroundColor: '#f472b6', borderRadius: 3, fontSize: 11, fontWeight: 600, color: '#fff' }}>
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

export default function BinaryTreePostorderTraversalVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.root || [1, 2, 3])
  const root = useMemo(() => buildTree(input), [input])
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.root); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🌳 Postorder Traversal',
        content: <VisualizationPanel step={step} root={root} />,
      },
    ],
    [step, connectivity, setActiveLineDom, root]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
