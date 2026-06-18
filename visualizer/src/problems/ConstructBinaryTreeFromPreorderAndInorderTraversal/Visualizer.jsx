import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import { buildTree, computeLayout, collectNodes, buildEdges } from '../../components/treeUtils'
import './Visualizer.css'

const CANVAS_W = 520
const CANVAS_H = 400
const NODE_R = 20

const EXAMPLES = getExamples('construct-binary-tree-from-preorder-and-inorder-traversal')

/**
 * Generates step-by-step reconstruction of binary tree from preorder and inorder traversals.
 * Uses divide-and-conquer approach:
 * - First element in preorder is the root
 * - Find that root in inorder to split into left and right subtrees
 * - Recursively construct left and right subtrees
 */
function generateSteps(preorder, inorder) {
  const steps = []
  const nodeMap = new Map()
  let nodeIdCounter = 0
  let stepCounter = 0

  // Build inorder value-to-index map for O(1) lookup
  const inorderMap = new Map()
  inorder.forEach((val, idx) => {
    inorderMap.set(val, idx)
  })

  function buildRecursive(preStart, preEnd, inStart, inEnd, parentId = null, isLeft = null) {
    // Base case: invalid range
    if (preStart > preEnd || inStart > inEnd) {
      steps.push({
        phase: 'base-case',
        activeLine: 3,
        message: 'Base case: empty subtree',
        preStart,
        preEnd,
        inStart,
        inEnd,
        nodes: new Map(nodeMap),
        edges: [],
      })
      return null
    }

    // Get root value from preorder
    const rootVal = preorder[preStart]
    const nodeId = nodeIdCounter++

    steps.push({
      phase: 'identify-root',
      activeLine: 4,
      message: `Root identified: ${rootVal} at preorder[${preStart}]`,
      preStart,
      preEnd,
      inStart,
      inEnd,
      rootVal,
      nodes: new Map(nodeMap),
      edges: [],
      activeNode: nodeId,
    })

    // Find root position in inorder
    const inRootIdx = inorderMap.get(rootVal)

    steps.push({
      phase: 'find-in-root',
      activeLine: 5,
      message: `Located in inorder at index ${inRootIdx}. Left: [${inStart},${inRootIdx - 1}], Right: [${inRootIdx + 1},${inEnd}]`,
      preStart,
      preEnd,
      inStart,
      inEnd,
      inRootIdx,
      rootVal,
      nodes: new Map(nodeMap),
      edges: [],
      activeNode: nodeId,
    })

    // Calculate left subtree size
    const leftSize = inRootIdx - inStart

    // Create node
    const node = {
      id: nodeId,
      val: rootVal,
      left: null,
      right: null,
      parentId,
      isLeftChild: isLeft,
    }
    nodeMap.set(nodeId, node)

    steps.push({
      phase: 'create-node',
      activeLine: 6,
      message: `Create node: ${rootVal}`,
      preStart,
      preEnd,
      inStart,
      inEnd,
      nodes: new Map(nodeMap),
      edges: [],
      activeNode: nodeId,
    })

    // Recursively build left subtree
    if (leftSize > 0) {
      steps.push({
        phase: 'recurse-left',
        activeLine: 7,
        message: `Recursing left: preorder[${preStart + 1},${preStart + leftSize}], inorder[${inStart},${inRootIdx - 1}]`,
        preStart,
        preEnd,
        inStart,
        inEnd,
        nodes: new Map(nodeMap),
        edges: [],
        activeNode: nodeId,
      })

      const leftChild = buildRecursive(
        preStart + 1,
        preStart + leftSize,
        inStart,
        inRootIdx - 1,
        nodeId,
        true
      )
      node.left = leftChild
    }

    // Recursively build right subtree
    const rightStart = inRootIdx + 1
    if (rightStart <= inEnd) {
      steps.push({
        phase: 'recurse-right',
        activeLine: 8,
        message: `Recursing right: preorder[${preStart + leftSize + 1},${preEnd}], inorder[${inRootIdx + 1},${inEnd}]`,
        preStart,
        preEnd,
        inStart,
        inEnd,
        nodes: new Map(nodeMap),
        edges: [],
        activeNode: nodeId,
      })

      const rightChild = buildRecursive(
        preStart + leftSize + 1,
        preEnd,
        inRootIdx + 1,
        inEnd,
        nodeId,
        false
      )
      node.right = rightChild
    }

    steps.push({
      phase: 'return-node',
      activeLine: 9,
      message: `Return node ${rootVal} with left=${node.left ? 'subtree' : 'null'}, right=${node.right ? 'subtree' : 'null'}`,
      preStart,
      preEnd,
      inStart,
      inEnd,
      nodes: new Map(nodeMap),
      edges: [],
      activeNode: nodeId,
    })

    return node
  }

  if (preorder.length === 0 || inorder.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 1,
      message: 'Empty input: return null',
      nodes: new Map(),
      edges: [],
    })
    return steps
  }

  const root = buildRecursive(0, preorder.length - 1, 0, inorder.length - 1)

  // Final step: build visualization layout and edges
  const positions = root ? computeLayout(root, CANVAS_W, 80) : new Map()
  const edges = root ? buildEdges(root) : []
  const allNodes = root ? collectNodes(root) : []

  steps.push({
    phase: 'done',
    activeLine: 10,
    message: 'Tree construction complete',
    nodes: new Map(nodeMap),
    edges,
    positions,
    allNodes,
  })

  return steps
}

/**
 * Tree visualization panel showing the constructed binary tree
 */
function TreeVisualizationPanel({ step, positions, allNodes, edges }) {
  if (!step || !positions || positions.size === 0) {
    return (
      <div style={{ padding: 16, color: '#94a3b8', textAlign: 'center' }}>
        Loading visualization...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
        Tree Structure
      </div>
      <svg
        width="100%"
        height={CANVAS_H}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        style={{ border: '1px solid #e2e8f0', borderRadius: 6, backgroundColor: '#f8fafc' }}
      >
        {/* Draw edges */}
        {edges.map((edge, idx) => (
          <line
            key={`edge-${idx}`}
            x1={positions.get(edge.from)?.x ?? 0}
            y1={positions.get(edge.from)?.y ?? 0}
            x2={positions.get(edge.to)?.x ?? 0}
            y2={positions.get(edge.to)?.y ?? 0}
            stroke="#cbd5e1"
            strokeWidth={2}
          />
        ))}

        {/* Draw nodes */}
        {allNodes.map((node) => {
          const pos = positions.get(node.id)
          if (!pos) return null

          const isActive = step.activeNode === node.id
          const isInProcess = step.phase !== 'done' && step.nodes?.has(node.id)

          return (
            <motion.g key={`node-${node.id}`}>
              {/* Node circle */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={isActive ? '#3b82f6' : isInProcess ? '#f3f4f6' : '#f1f5f9'}
                stroke={isActive ? '#0ea5e9' : '#cbd5e1'}
                strokeWidth={isActive ? 3 : 2}
                animate={{
                  r: isActive ? NODE_R + 4 : NODE_R,
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))' : 'none',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
              {/* Node value */}
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="13"
                fontWeight="bold"
                fill={isActive ? 'white' : '#1e293b'}
              >
                {node.val}
              </text>
            </motion.g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Input panel for preorder and inorder traversals
 */
function InputPanel({ preorderInput, setPreorderInput, inorderInput, setInorderInput, applyExample, inputError }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 6 }}>
            Preorder (comma-separated):
          </label>
          <input
            type="text"
            value={preorderInput}
            onChange={(e) => setPreorderInput(e.target.value)}
            placeholder="3,9,20,15,7"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              fontFamily: 'monospace',
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 6 }}>
            Inorder (comma-separated):
          </label>
          <input
            type="text"
            value={inorderInput}
            onChange={(e) => setInorderInput(e.target.value)}
            placeholder="9,3,15,20,7"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              fontFamily: 'monospace',
              fontSize: 12,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {inputError && (
          <div style={{ fontSize: 12, color: '#dc2626', padding: '8px 12px', backgroundColor: '#fee2e2', borderRadius: 4 }}>
            {inputError}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Info panel showing current step details and pointer ranges
 */
function InfoPanel({ step }) {
  if (!step) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Step Info</div>
        <div style={{ fontSize: 12, color: '#475569', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {step.message}
        </div>
      </div>

      {step.phase !== 'done' && step.phase !== 'base-case' && (
        <div style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 6, fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: '#0369a1', marginBottom: 6 }}>Pointer Ranges:</div>
          <div style={{ color: '#475569', fontFamily: 'monospace' }}>
            <div>Preorder: [{step.preStart}, {step.preEnd}]</div>
            <div>Inorder: [{step.inStart}, {step.inEnd}]</div>
          </div>
        </div>
      )}

      {step.inRootIdx !== undefined && (
        <div style={{ backgroundColor: '#fef3c7', padding: 12, borderRadius: 6, fontSize: 11 }}>
          <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 6 }}>Root Position:</div>
          <div style={{ color: '#475569', fontFamily: 'monospace' }}>
            Inorder index: {step.inRootIdx}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Main visualizer component
 */
export default function Visualizer() {
  const [preorderInput, setPreorderInput] = useState('3,9,20,15,7')
  const [inorderInput, setInorderInput] = useState('9,3,15,20,7')
  const [inputError, setInputError] = useState('')

  const SOLUTION_CODE = useSolutionCode('construct-binary-tree-from-preorder-and-inorder-traversal')

  // Parse inputs
  const { preorder, inorder, isValid } = useMemo(() => {
    try {
      const p = preorderInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
      const i = inorderInput
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))

      if (p.length === 0 && i.length === 0) {
        return { preorder: [], inorder: [], isValid: true }
      }

      if (p.length !== i.length) {
        setInputError('Preorder and inorder must have the same length')
        return { preorder: [], inorder: [], isValid: false }
      }

      if (new Set(p).size !== p.length || new Set(i).size !== i.length) {
        setInputError('Duplicate values in traversal')
        return { preorder: [], inorder: [], isValid: false }
      }

      if (JSON.stringify(p.slice().sort((a, b) => a - b)) !== JSON.stringify(i.slice().sort((a, b) => a - b))) {
        setInputError('Preorder and inorder must contain the same elements')
        return { preorder: [], inorder: [], isValid: false }
      }

      setInputError('')
      return { preorder: p, inorder: i, isValid: true }
    } catch (error) {
      setInputError('Invalid input format')
      return { preorder: [], inorder: [], isValid: false }
    }
  }, [preorderInput, inorderInput])

  // Generate steps
  const steps = useMemo(
    () => (isValid ? generateSteps(preorder, inorder) : []),
    [preorder, inorder, isValid]
  )

  // Playback state
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = steps[stepIndex] || null

  // Pattern overlay
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Code connectivity
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  // Example handler
  const applyExample = useCallback(
    (ex) => {
      setPreorderInput(ex.preorder.join(','))
      setInorderInput(ex.inorder.join(','))
      handleReset()
    },
    [handleReset]
  )

  // Build positions and edges for tree visualization
  const { positions, edges, allNodes } = useMemo(() => {
    if (!step || !step.nodes || step.nodes.size === 0) {
      return { positions: new Map(), edges: [], allNodes: [] }
    }

    // Reconstruct tree from nodeMap
    let root = null
    for (const node of step.nodes.values()) {
      if (!node.parentId) {
        root = node
        break
      }
    }

    if (!root) {
      return { positions: new Map(), edges: [], allNodes: [] }
    }

    const positions = step.positions || computeLayout(root, CANVAS_W, 80)
    const edges = step.edges || buildEdges(root)
    const allNodes = step.allNodes || collectNodes(root)

    return { positions, edges, allNodes }
  }, [step])

  // Dockable panels
  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
        ),
      },
      {
        id: 'tree',
        title: 'Tree Visualization',
        content: (
          <TreeVisualizationPanel
            step={step}
            positions={positions}
            allNodes={allNodes}
            edges={edges}
          />
        ),
      },
      {
        id: 'input',
        title: 'Input & Examples',
        content: (
          <InputPanel
            preorderInput={preorderInput}
            setPreorderInput={setPreorderInput}
            inorderInput={inorderInput}
            setInorderInput={setInorderInput}
            applyExample={applyExample}
            inputError={inputError}
          />
        ),
      },
      {
        id: 'info',
        title: 'Step Info',
        content: <InfoPanel step={step} />,
      },
    ],
    [
      step,
      SOLUTION_CODE,
      connectivity.highlightedLines,
      connectivity.handleLineSelect,
      setActiveLineDom,
      positions,
      allNodes,
      edges,
      preorderInput,
      setPreorderInput,
      inorderInput,
      setInorderInput,
      applyExample,
      inputError,
    ]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'tree'], ['input', 'info']], minimized: [] }}
      />
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
