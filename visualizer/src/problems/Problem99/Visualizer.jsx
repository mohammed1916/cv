import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

// ─── Pattern annotations ───────────────────────────────────────────────────
const PATTERNS = ['init', 'inorder', 'compare', 'violation', 'swap', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'init',
  4: 'inorder',
  5: 'inorder',
  6: 'inorder',
  7: 'compare',
  8: 'violation',
  9: 'violation',
  10: 'inorder',
  11: 'swap',
  12: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def recoverTree(root):' },
  { line: 2, text: '    stack, prev = [], None' },
  { line: 3, text: '    first = second = None' },
  { line: 4, text: '    node = root' },
  { line: 5, text: '    while stack or node:' },
  { line: 6, text: '        while node: stack.append(node); node = node.left' },
  { line: 7, text: '        node = stack.pop()' },
  { line: 8, text: '        if prev and prev.val > node.val:' },
  { line: 9, text: '            if not first: first = prev' },
  { line: 10, text: '            second = node' },
  { line: 11, text: '        prev = node; node = node.right' },
  { line: 12, text: '    first.val, second.val = second.val, first.val' },
]

const EXAMPLES = [
  { label: 'Example 1', tree: [1, 3, null, null, 2] },
  { label: 'Example 2', tree: [3, 1, 4, null, null, 2] },
]

// ─── Layout constants ──────────────────────────────────────────────────────
const CANVAS_W = 520
const CANVAS_H = 340
const NODE_R = 22
const LEVEL_H = 74

// Build a linked node structure from a LeetCode level-order array (with nulls).
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null
  const nodes = arr.map((val, i) => (val == null ? null : { id: i, val, left: null, right: null }))
  for (let i = 0; i < nodes.length; i++) {
    if (!nodes[i]) continue
    const li = 2 * i + 1
    const ri = 2 * i + 2
    if (li < nodes.length) nodes[i].left = nodes[li]
    if (ri < nodes.length) nodes[i].right = nodes[ri]
  }
  return nodes[0]
}

// Assign x/y positions using depth (y) + inorder index (x).
function computeLayout(root) {
  const positions = new Map()
  const order = []
  let maxDepth = 0

  function inorder(node, depth) {
    if (!node) return
    maxDepth = Math.max(maxDepth, depth)
    inorder(node.left, depth + 1)
    order.push({ id: node.id, depth })
    inorder(node.right, depth + 1)
  }
  inorder(root, 0)

  const n = order.length
  const stepX = n > 0 ? CANVAS_W / (n + 1) : CANVAS_W / 2
  order.forEach((o, i) => {
    positions.set(o.id, { x: (i + 1) * stepX, y: o.depth * LEVEL_H + 44 })
  })
  return positions
}

function buildEdges(root) {
  const edges = []
  if (!root) return edges
  const q = [root]
  while (q.length) {
    const node = q.shift()
    if (node.left) { edges.push({ fromId: node.id, toId: node.left.id }); q.push(node.left) }
    if (node.right) { edges.push({ fromId: node.id, toId: node.right.id }); q.push(node.right) }
  }
  return edges
}

// Snapshot the current node values into a plain [{id, val}] list for a step.
function snapshotNodes(root) {
  const list = []
  function walk(node) {
    if (!node) return
    walk(node.left)
    list.push({ id: node.id, val: node.val })
    walk(node.right)
  }
  walk(root)
  return list
}

function generateSteps(treeArr) {
  const root = buildTree(treeArr)
  const positions = computeLayout(root)
  const edges = buildEdges(root)
  const steps = []

  if (!root) {
    return [{
      activeLine: 1, phase: 'done', message: 'Empty tree — nothing to recover.',
      nodes: [], positions, edges, currentId: null, prevId: null, firstId: null, secondId: null,
    }]
  }

  const base = () => ({ positions, edges })

  steps.push({
    ...base(), activeLine: 3, phase: 'init',
    nodes: snapshotNodes(root),
    currentId: null, prevId: null, firstId: null, secondId: null,
    message: 'Init: iterative inorder traversal with a stack. prev = first = second = None.',
  })

  const stack = []
  let node = root
  let prev = null
  let first = null
  let second = null

  while (stack.length || node) {
    // Dive left, pushing nodes onto the stack.
    while (node) {
      stack.push(node)
      steps.push({
        ...base(), activeLine: 6, phase: 'inorder',
        nodes: snapshotNodes(root),
        currentId: node.id, prevId: prev ? prev.id : null,
        firstId: first ? first.id : null, secondId: second ? second.id : null,
        stackIds: stack.map((n) => n.id),
        message: `Go left: push ${node.val} onto the stack.`,
      })
      node = node.left
    }

    // Pop the next inorder node.
    node = stack.pop()
    steps.push({
      ...base(), activeLine: 7, phase: 'inorder',
      nodes: snapshotNodes(root),
      currentId: node.id, prevId: prev ? prev.id : null,
      firstId: first ? first.id : null, secondId: second ? second.id : null,
      stackIds: stack.map((n) => n.id),
      message: `Visit ${node.val} (pop from stack).`,
    })

    // Compare with previous inorder node.
    if (prev) {
      const violated = prev.val > node.val
      steps.push({
        ...base(), activeLine: 8, phase: 'compare',
        nodes: snapshotNodes(root),
        currentId: node.id, prevId: prev.id,
        firstId: first ? first.id : null, secondId: second ? second.id : null,
        stackIds: stack.map((n) => n.id),
        message: `Compare prev ${prev.val} vs curr ${node.val}: ${violated ? `${prev.val} > ${node.val} — violation!` : 'in order ✓'}`,
      })

      if (violated) {
        if (!first) {
          first = prev
          steps.push({
            ...base(), activeLine: 9, phase: 'violation',
            nodes: snapshotNodes(root),
            currentId: node.id, prevId: prev.id,
            firstId: first.id, secondId: second ? second.id : null,
            stackIds: stack.map((n) => n.id),
            message: `First violation: mark first = prev (${first.val}).`,
          })
        }
        second = node
        steps.push({
          ...base(), activeLine: 10, phase: 'violation',
          nodes: snapshotNodes(root),
          currentId: node.id, prevId: prev.id,
          firstId: first.id, secondId: second.id,
          stackIds: stack.map((n) => n.id),
          message: `Set second = curr (${second.val}). Candidates so far: first=${first.val}, second=${second.val}.`,
        })
      }
    }

    prev = node
    node = node.right
  }

  // Perform the swap of the two misplaced values.
  if (first && second) {
    const tmp = first.val
    first.val = second.val
    second.val = tmp

    steps.push({
      ...base(), activeLine: 11, phase: 'swap',
      nodes: snapshotNodes(root),
      currentId: null, prevId: null,
      firstId: first.id, secondId: second.id,
      swapped: true,
      message: `Swap the two misplaced values: now first=${first.val}, second=${second.val}.`,
    })
  }

  steps.push({
    ...base(), activeLine: 12, phase: 'done',
    nodes: snapshotNodes(root),
    currentId: null, prevId: null,
    firstId: first ? first.id : null, secondId: second ? second.id : null,
    swapped: true,
    message: 'Done — BST recovered. Inorder sequence is strictly increasing again.',
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return <div className="problem99-hint">Press play to run the inorder traversal and recover the BST.</div>
  }

  const {
    nodes = [], positions = new Map(), edges = [],
    currentId, prevId, firstId, secondId, swapped,
  } = step

  const highlightPairs = firstId != null && secondId != null ? [[firstId, secondId]] : []

  return (
    <div className="problem99-visualization" style={{ width: '100%' }}>
      <div className="problem99-canvas" style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '0 auto' }}>
        <svg
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={CANVAS_W}
          height={CANVAS_H}
        >
          {edges.map(({ fromId, toId }) => {
            const from = positions.get(fromId)
            const to = positions.get(toId)
            if (!from || !to) return null
            const isSwapEdge = highlightPairs.some(
              ([a, b]) => (a === fromId && b === toId) || (a === toId && b === fromId)
            )
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke={isSwapEdge ? '#f9e2af' : '#45475a'}
                strokeWidth={isSwapEdge ? 2.5 : 1.5}
              />
            )
          })}
        </svg>

        {nodes.map(({ id, val }) => {
          const pos = positions.get(id)
          if (!pos) return null

          const isCurrent = id === currentId
          const isPrev = id === prevId
          const isFirst = id === firstId
          const isSecond = id === secondId
          const isSwapNode = isFirst || isSecond

          let bg = '#313244'
          let border = '#45475a'
          let color = '#cdd6f4'
          if (isSwapNode) { bg = swapped ? '#166534' : '#7f1d1d'; border = swapped ? '#22c55e' : '#f38ba8'; color = '#ffffff' }
          if (isPrev) { bg = '#334155'; border = '#89dceb' }
          if (isCurrent) { bg = '#1e3a8a'; border = '#89b4fa'; color = '#ffffff' }

          return (
            <motion.div
              key={id}
              animate={{ scale: isCurrent ? 1.15 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: pos.x - NODE_R,
                top: pos.y - NODE_R,
                width: NODE_R * 2,
                height: NODE_R * 2,
                borderRadius: '50%',
                background: bg,
                border: `2.5px solid ${border}`,
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: isCurrent ? '0 0 12px rgba(137,180,250,0.6)' : 'none',
              }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>

      <div className="problem99-legend" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', fontSize: 11, color: '#6773a1' }}>
        <LegendDot color="#89b4fa" label="current" />
        <LegendDot color="#89dceb" label="prev" />
        <LegendDot color={swapped ? '#22c55e' : '#f38ba8'} label={swapped ? 'swapped ✓' : 'misplaced'} />
      </div>

      <div className="problem99-message" style={{ marginTop: 4, textAlign: 'center', fontSize: 13, color: '#4f6ed8', maxWidth: 480 }}>
        {step.message}
      </div>
    </div>
  )
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  )
}

export default function Problem99Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [treeInput, setTreeInput] = useState("[1,3,null,null,2]");
  const { tree, inputError } = useMemo(() => {
    try {
      const parsedTree = JSON.parse(treeInput); if (!Array.isArray(parsedTree)) throw new Error('tree must be an array');
      return { tree: parsedTree, inputError: '' };
    } catch (e) {
      return { tree: "[1,3,null,null,2]", inputError: e.message };
    }
  }, [treeInput]);
  const [panelDivs, setPanelDivs] = useState(null)
  const steps = useMemo(
    () => generateSteps(tree).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [tree]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setTreeInput(JSON.stringify(e.tree)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels as constants
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
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"array"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="problem99-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem99-status">
      <div className="problem99-examples" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 4px' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            className="problem99-button"
            onClick={() => applyEx(e)}
            style={ex.label === e.label ? { background: '#ec489930', borderColor: '#ec489960' } : undefined}
          >
            {e.label}: [{e.tree.map((v) => (v == null ? 'null' : v)).join(',')}]
          </button>
        ))}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
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

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🌳 Recover BST', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem99-shell">
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
    </div>
  )
}
