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

// ─── Pattern annotations ───────────────────────────────────────────────────
const PATTERNS = ['init', 'go_left', 'pop_visit', 'go_right', 'done']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'go_left',
  4: 'go_left',
  5: 'go_left',
  6: 'pop_visit',
  7: 'pop_visit',
  8: 'go_right',
  9: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def inorderTraversal(root):' },
  { line: 2, text: '    result, stack, curr = [], [], root' },
  { line: 3, text: '    while curr or stack:' },
  { line: 4, text: '        while curr:' },
  { line: 5, text: '            stack.append(curr); curr = curr.left' },
  { line: 6, text: '        curr = stack.pop()' },
  { line: 7, text: '        result.append(curr.val)' },
  { line: 8, text: '        curr = curr.right' },
  { line: 9, text: '    return result' },
]

const EXAMPLES = [
  { label: 'Example 1', tree: [1, null, 2, 3] },
  { label: 'Example 2', tree: [4, 2, 6, 1, 3, 5, 7] },
  { label: 'Left chain', tree: [3, 2, null, 1] },
]

// ─── Canvas / layout constants ───────────────────────────────────────────────
const CANVAS_W = 520
const CANVAS_H = 300
const NODE_R = 20
const MARGIN_X = 36
const LEVEL_H = 70
const TOP_Y = 34

// Build a tree of node objects from a LeetCode level-order array (with nulls).
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null
  let idCounter = 0
  const root = { id: idCounter++, val: arr[0], left: null, right: null }
  const queue = [root]
  let i = 1
  while (queue.length && i < arr.length) {
    const node = queue.shift()
    if (i < arr.length) {
      const lv = arr[i++]
      if (lv != null) {
        node.left = { id: idCounter++, val: lv, left: null, right: null }
        queue.push(node.left)
      }
    }
    if (i < arr.length) {
      const rv = arr[i++]
      if (rv != null) {
        node.right = { id: idCounter++, val: rv, left: null, right: null }
        queue.push(node.right)
      }
    }
  }
  return root
}

// Compute x by in-order index and y by depth; return Map<id, {x, y, val}>.
function computeLayout(root) {
  const positions = new Map()
  if (!root) return positions
  const inorder = []
  let maxDepth = 0
  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    inorder.push({ node, depth })
    maxDepth = Math.max(maxDepth, depth)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  const n = inorder.length
  const usableW = CANVAS_W - MARGIN_X * 2
  inorder.forEach(({ node, depth }, idx) => {
    const x = n === 1 ? CANVAS_W / 2 : MARGIN_X + (usableW * idx) / (n - 1)
    const y = TOP_Y + depth * LEVEL_H
    positions.set(node.id, { x, y, val: node.val, id: node.id })
  })
  return positions
}

function buildEdges(root) {
  const edges = []
  const walk = (node) => {
    if (!node) return
    if (node.left) { edges.push({ from: node.id, to: node.left.id }); walk(node.left) }
    if (node.right) { edges.push({ from: node.id, to: node.right.id }); walk(node.right) }
  }
  walk(root)
  return edges
}

function generateSteps(treeArr) {
  const root = buildTree(treeArr)
  const positions = computeLayout(root)
  const edges = buildEdges(root)
  const steps = []

  const snap = (extra) => ({
    positions,
    edges,
    stack: [],
    output: [],
    currentId: null,
    visitedIds: new Set(),
    stackIds: new Set(),
    ...extra,
  })

  if (!root) {
    steps.push(snap({ activeLine: 9, phase: 'done', message: 'Empty tree → return []' }))
    return steps
  }

  const output = []
  const stack = []
  const visited = new Set()
  let curr = root

  steps.push(snap({
    activeLine: 2, phase: 'init',
    stack: [], output: [],
    currentId: curr.id,
    stackIds: new Set(),
    message: `Initialize: result=[], stack=[], curr=node ${curr.val} (root).`,
  }))

  while (curr || stack.length) {
    // Dive left, pushing every node onto the stack.
    while (curr) {
      stack.push(curr)
      steps.push(snap({
        activeLine: 5, phase: 'go_left',
        stack: stack.map((s) => s.val),
        output: [...output],
        currentId: curr.left ? curr.left.id : null,
        stackIds: new Set(stack.map((s) => s.id)),
        message: `Push ${curr.val} onto stack, go left${curr.left ? ` to ${curr.left.val}` : ' (null)'}.`,
      }))
      curr = curr.left
    }

    // Pop the top and visit it.
    curr = stack.pop()
    output.push(curr.val)
    visited.add(curr.id)
    steps.push(snap({
      activeLine: 7, phase: 'pop_visit',
      stack: stack.map((s) => s.val),
      output: [...output],
      currentId: curr.id,
      stackIds: new Set(stack.map((s) => s.id)),
      visitedIds: new Set(visited),
      message: `Pop and visit ${curr.val}. Append to output → [${output.join(', ')}].`,
    }))

    // Move to the right subtree.
    const rightVal = curr.right ? curr.right.val : null
    curr = curr.right
    steps.push(snap({
      activeLine: 8, phase: 'go_right',
      stack: stack.map((s) => s.val),
      output: [...output],
      currentId: curr ? curr.id : null,
      stackIds: new Set(stack.map((s) => s.id)),
      visitedIds: new Set(visited),
      message: rightVal != null
        ? `Move to right child ${rightVal}.`
        : 'No right child; continue with stack.',
    }))
  }

  steps.push(snap({
    activeLine: 9, phase: 'done',
    stack: [], output: [...output],
    currentId: null,
    stackIds: new Set(),
    visitedIds: new Set(visited),
    message: `Traversal complete. Inorder = [${output.join(', ')}].`,
  }))

  return steps
}

// ─── Visualization ────────────────────────────────────────────────────────────
function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play to walk the iterative inorder traversal.
      </div>
    )
  }

  const positions = step.positions ?? new Map()
  const edges = step.edges ?? []
  const nodes = [...positions.values()]
  const currentId = step.currentId
  const stackIds = step.stackIds ?? new Set()
  const visitedIds = step.visitedIds ?? new Set()

  const nodeFill = (id) => {
    if (id === currentId) return '#f59e0b'
    if (stackIds.has(id)) return '#a78bfa'
    if (visitedIds.has(id)) return '#34d399'
    return '#1e293b'
  }
  const nodeStroke = (id) => {
    if (id === currentId) return '#b45309'
    if (stackIds.has(id)) return '#6d28d9'
    if (visitedIds.has(id)) return '#059669'
    return '#475569'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
      <div style={{ fontSize: 12, color: '#334155' }}>{step.message}</div>

      <svg width={CANVAS_W} height={CANVAS_H} style={{ background: '#0f172a', borderRadius: 8, maxWidth: '100%' }}>
        {edges.map((e, i) => {
          const a = positions.get(e.from)
          const b = positions.get(e.to)
          if (!a || !b) return null
          return (
            <line
              key={`e${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#475569" strokeWidth={2}
            />
          )
        })}
        {nodes.map((p) => (
          <g key={p.id}>
            <motion.circle
              cx={p.x} cy={p.y} r={NODE_R}
              fill={nodeFill(p.id)}
              stroke={nodeStroke(p.id)}
              strokeWidth={3}
              animate={{ scale: p.id === currentId ? 1.12 : 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
            <text
              x={p.x} y={p.y + 5}
              textAnchor="middle"
              fontSize={14} fontWeight={700}
              fill={p.id === currentId || visitedIds.has(p.id) ? '#0f172a' : '#e2e8f0'}
            >
              {p.val}
            </text>
          </g>
        ))}
      </svg>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* Stack column */}
        <div style={{ minWidth: 120 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6d28d9', marginBottom: 4 }}>
            Stack (top → bottom)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4 }}>
            {(step.stack ?? []).length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>empty</div>
            )}
            {(step.stack ?? []).map((v, i) => (
              <motion.div
                key={`${v}-${i}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '6px 12px', borderRadius: 6, textAlign: 'center',
                  background: '#ede9fe', border: '2px solid #a78bfa',
                  color: '#5b21b6', fontWeight: 700, fontSize: 13,
                }}
              >
                {v}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Output row */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginBottom: 4 }}>
            Output (inorder)
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(step.output ?? []).length === 0 && (
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>[]</div>
            )}
            {(step.output ?? []).map((v, i) => (
              <motion.div
                key={`o-${i}-${v}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '6px 12px', borderRadius: 6, textAlign: 'center',
                  background: '#d1fae5', border: '2px solid #34d399',
                  color: '#065f46', fontWeight: 700, fontSize: 13,
                }}
              >
                {v}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Problem94Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.tree).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // ─── Extract panels ───────────────────────────────────────────────────────
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

  const vizPanel = (<VisualizationPanel step={step} />)

  const statusPanel = (
    <div className="p94-status" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 12, fontSize: 12, color: '#64748b' }}>
      <span>Step: <strong>{stepIndex + 1}</strong> / {steps.length}</span>
      {step?.phase && <span style={{ color: '#8b5cf6' }}>Phase: <strong>{step.phase}</strong></span>}
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

  // ─── Panel configuration ──────────────────────────────────────────────────
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🌳 Inorder Traversal', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="p94-shell">
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', flexWrap: 'wrap' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px', borderRadius: 6, cursor: 'pointer',
              border: e.label === ex.label ? '2px solid #059669' : '1px solid #cbd5e1',
              background: e.label === ex.label ? '#d1fae5' : '#f8fafc',
              color: '#0f172a', fontSize: 12, fontWeight: 600,
            }}
          >
            {e.label} [{e.tree.map((v) => (v == null ? 'null' : v)).join(',')}]
          </button>
        ))}
      </div>
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
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
