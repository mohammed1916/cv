import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import { buildTree, buildEdges, collectNodes, computeLayout, parseTreeInput } from '../../components/treeUtils'
import './LargestBSTSubtreeVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'from math import inf' },
  { line: 2, text: 'def largestBSTSubtree(root):' },
  { line: 3, text: '    best = 0' },
  { line: 4, text: '    def dfs(node):' },
  { line: 5, text: '        nonlocal best' },
  { line: 6, text: '        if not node:' },
  { line: 7, text: '            return (True, inf, -inf, 0)' },
  { line: 8, text: '        l_bst, l_min, l_max, l_size = dfs(node.left)' },
  { line: 9, text: '        r_bst, r_min, r_max, r_size = dfs(node.right)' },
  { line: 10, text: '        if l_bst and r_bst and l_max < node.val < r_min:' },
  { line: 11, text: '            size = l_size + r_size + 1' },
  { line: 12, text: '            best = max(best, size)' },
  { line: 13, text: '            return (True, min(l_min, node.val), max(r_max, node.val), size)' },
  { line: 14, text: '        return (False, -inf, inf, max(l_size, r_size))' },
  { line: 15, text: '    dfs(root)' },
  { line: 16, text: '    return best' },
]

const DEFAULT_EXAMPLES = [
  { label: 'Classic [10,5,15,1,8,null,7]', inputs: [10, 5, 15, 1, 8, null, 7] },
  { label: 'Whole tree is a BST', inputs: [5, 3, 8, 1, 4, 7, 9] },
  { label: 'Only leaves valid', inputs: [3, 2, 4, 5] },
  { label: 'Single node', inputs: [42] },
]

const registryExamples = getExamples('largest-bst-subtree')
const EXAMPLES = registryExamples && registryExamples.length ? registryExamples : DEFAULT_EXAMPLES

const fmt = (v) => (v === Infinity ? '+inf' : v === -Infinity ? '-inf' : String(v))

// Trace a postorder DFS returning (isBST, min, max, size) per node.
function generateSteps(root) {
  const steps = []
  if (!root) {
    steps.push({
      phase: 'done', activeLine: 16, relatedLines: [15, 16],
      message: 'Empty tree: largest BST subtree size = 0.',
      current: null, computed: {}, best: 0,
    })
    return steps
  }

  let best = 0
  const computed = {}

  steps.push({
    phase: 'init', activeLine: 3, relatedLines: [2, 3],
    message: 'Start postorder DFS. best = 0.',
    current: null, computed: {}, best: 0,
  })

  function dfs(node) {
    if (!node) return { isBST: true, min: Infinity, max: -Infinity, size: 0 }

    const left = dfs(node.left)
    const right = dfs(node.right)

    steps.push({
      phase: 'visit', activeLine: 10, relatedLines: [8, 9, 10],
      message: `Node ${node.val}: children done (L→BST=${left.isBST}, R→BST=${right.isBST}). Check ${fmt(left.max)} < ${node.val} < ${fmt(right.min)}.`,
      current: node.id, computed: { ...computed }, best,
    })

    const cond = left.isBST && right.isBST && left.max < node.val && node.val < right.min
    let result

    if (cond) {
      const size = left.size + right.size + 1
      best = Math.max(best, size)
      result = {
        isBST: true,
        min: Math.min(left.min, node.val),
        max: Math.max(right.max, node.val),
        size,
      }
      computed[node.id] = { isBST: true, size, min: result.min, max: result.max }
      steps.push({
        phase: 'valid', activeLine: 12, relatedLines: [11, 12, 13],
        message: `Node ${node.val} roots a VALID BST of size ${size}. best = ${best}.`,
        current: node.id, computed: { ...computed }, best,
      })
    } else {
      const size = Math.max(left.size, right.size)
      result = { isBST: false, min: -Infinity, max: Infinity, size }
      const reason = !left.isBST
        ? 'left subtree is not a BST'
        : !right.isBST
          ? 'right subtree is not a BST'
          : left.max >= node.val
            ? `left max (${fmt(left.max)}) ≥ ${node.val}`
            : `right min (${fmt(right.min)}) ≤ ${node.val}`
      computed[node.id] = { isBST: false, size }
      steps.push({
        phase: 'invalid', activeLine: 14, relatedLines: [14],
        message: `Node ${node.val} is NOT a BST root (${reason}). Largest BST below it = ${size}.`,
        current: node.id, computed: { ...computed }, best,
      })
    }
    return result
  }

  dfs(root)

  steps.push({
    phase: 'done', activeLine: 16, relatedLines: [15, 16],
    message: `Done. Largest BST subtree size = ${best}.`,
    current: null, computed: { ...computed }, best,
  })
  return steps
}

const NODE_R = 24

function TreeView({ tree, layout, step }) {
  if (!tree || !layout) {
    return <div className="largest-b-s-t-subtree-empty">No tree to display.</div>
  }
  const computed = step?.computed || {}
  const current = step?.current

  return (
    <div className="largest-b-s-t-subtree-tree-wrap">
      <svg width={layout.width} height={layout.height} role="img" aria-label="binary tree">
        {tree.edges.map(({ fromId, toId }) => {
          const a = layout.pos.get(fromId)
          const b = layout.pos.get(toId)
          if (!a || !b) return null
          const childValid = computed[toId]?.isBST
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={childValid ? '#22c55e' : 'var(--border)'}
              strokeWidth={childValid ? 2.5 : 1.5}
            />
          )
        })}
        {tree.nodes.map((node) => {
          const p = layout.pos.get(node.id)
          if (!p) return null
          const c = computed[node.id]
          const isCurrent = node.id === current
          let fill = 'var(--surface2)'
          let stroke = 'var(--border)'
          if (c) {
            if (c.isBST) { fill = 'rgba(34,197,94,0.18)'; stroke = '#22c55e' }
            else { fill = 'rgba(100,116,139,0.20)'; stroke = 'var(--text-muted)' }
          }
          if (isCurrent) stroke = '#f9e2af'
          return (
            <g key={node.id}>
              {isCurrent && (
                <motion.circle
                  cx={p.x} cy={p.y} r={NODE_R + 6}
                  fill="none" stroke="#f9e2af" strokeWidth={1.5} opacity={0.6}
                  initial={{ r: NODE_R }} animate={{ r: NODE_R + 6 }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                />
              )}
              <circle
                cx={p.x} cy={p.y} r={NODE_R}
                fill={fill} stroke={stroke} strokeWidth={isCurrent ? 3 : 2}
              />
              <text
                x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central"
                fill="var(--text)" fontSize={14} fontWeight={600}
              >
                {node.val}
              </text>
              {c && (
                <text
                  x={p.x} y={p.y + NODE_R + 14} textAnchor="middle"
                  fill={c.isBST ? '#22c55e' : 'var(--text-muted)'} fontSize={11} fontWeight={600}
                >
                  {c.isBST ? `BST·${c.size}` : `✗·${c.size}`}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function VisualizationPanel({ best, stepIndex, step, tree, layout }) {
  return (
    <div className="largest-b-s-t-subtree-panel-body" style={{ height: '100%', overflow: 'auto' }}>
      <div className="largest-b-s-t-subtree-readout">
        <div className="largest-b-s-t-subtree-stat"><span className="largest-b-s-t-subtree-stat-label">Largest BST size</span><span className="largest-b-s-t-subtree-stat-value">{best}</span></div>
        <div className="largest-b-s-t-subtree-legend"><span><i className="largest-b-s-t-subtree-dot valid" /> valid BST</span><span><i className="largest-b-s-t-subtree-dot invalid" /> not a BST</span><span><i className="largest-b-s-t-subtree-dot current" /> current node</span></div>
      </div>
      <AnimatePresence mode="wait"><motion.div key={stepIndex} className="largest-b-s-t-subtree-viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}><div className="largest-b-s-t-subtree-step-info"><h3>{step?.message || 'Press play (or Next) to run the postorder DFS.'}</h3></div><TreeView tree={tree} layout={layout} step={step} /></motion.div></AnimatePresence>
    </div>
  )
}

export default function LargestBSTSubtreeVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]))

  const parsed = useMemo(() => {
    try {
      const arr = parseTreeInput(inputValue)
      return { arr, error: '' }
    } catch (e) {
      return { arr: null, error: e.message }
    }
  }, [inputValue])

  const tree = useMemo(() => {
    if (!parsed.arr) return null
    const root = buildTree(parsed.arr)
    if (!root) return { root: null, nodes: [], edges: [] }
    return { root, nodes: collectNodes(root), edges: buildEdges(root) }
  }, [parsed.arr])

  const layout = useMemo(() => {
    if (!tree?.root) return null
    const raw = computeLayout(tree.root, 640, 88)
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity
    raw.forEach((p) => {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      maxY = Math.max(maxY, p.y)
    })
    const pad = 24
    const offX = pad + NODE_R - minX
    const pos = new Map()
    raw.forEach((p, id) => pos.set(id, { x: p.x + offX, y: p.y }))
    return {
      pos,
      width: (maxX - minX) + 2 * (pad + NODE_R),
      height: maxY + NODE_R + pad + 18,
    }
  }, [tree])

  const steps = useMemo(() => (tree ? generateSteps(tree.root) : []), [tree])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const best = step ? step.best : 0
  const applyExample = useCallback((example) => { setInputValue(JSON.stringify(example.inputs || example)); handleReset() }, [handleReset])
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Largest BST Subtree', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="largest-b-s-t-subtree-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && <>
        {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'tree', label: 'Level-order tree', type: 'string' }]} values={{ tree: inputValue }} onChange={(_, value) => { setInputValue(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={parsed.error} />, panelDivs.input)}
        {panelDivs.viz && createPortal(<VisualizationPanel best={best} stepIndex={stepIndex} step={step} tree={tree} layout={layout} />, panelDivs.viz)}
        {panelDivs.code && createPortal(<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} />, panelDivs.code)}
      </>}

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
        />
      </FloatingPanel>
    </div>
  )
}
