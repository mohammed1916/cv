import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem426Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamples('bst-to-doubly-linked-list') || [
  { label: 'Example 1', root: [4, 2, 6, 1, 3, 5, 7] },
]

// Build a BST from level-order array (null = missing).
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null
  let id = 0
  const nodes = arr.map(v => (v == null ? null : { val: v, left: null, right: null, id: id++ }))
  const root = nodes[0]
  const queue = [root]
  let i = 1
  while (queue.length && i < nodes.length) {
    const node = queue.shift()
    if (i < nodes.length) { node.left = nodes[i]; if (nodes[i]) queue.push(nodes[i]); i++ }
    if (i < nodes.length) { node.right = nodes[i]; if (nodes[i]) queue.push(nodes[i]); i++ }
  }
  return root
}

function layout(root) {
  // assign x by inorder index, y by depth
  const positions = {}
  let order = 0
  const rows = []
  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    positions[node.id] = { x: order++, depth }
    if (!rows[depth]) rows[depth] = []
    rows[depth].push(node)
    walk(node.right, depth + 1)
  }
  walk(root, 0)
  return { positions, maxDepth: rows.length }
}

function generateSteps(root) {
  const steps = []
  if (!root) {
    steps.push({ activeLine: 2, order: [], links: [], message: 'Empty tree → return None', done: true })
    return steps
  }

  const order = [] // ids in inorder (the DLL order)
  const links = [] // {from, to} finalized prev->next links
  let first = null
  let last = null

  steps.push({
    activeLine: 3,
    order: [], links: [], current: null,
    message: 'Initialize: first = last = None; start inorder DFS',
  })

  const dfs = (node) => {
    if (!node) return
    steps.push({
      activeLine: 7,
      order: [...order], links: links.map(l => ({ ...l })), current: node.id, going: 'left',
      message: `Recurse left of ${node.val}`,
    })
    dfs(node.left)

    // visit node
    if (last != null) {
      links.push({ from: last, to: node.id })
      steps.push({
        activeLine: 8,
        order: [...order], links: links.map(l => ({ ...l })), current: node.id, prev: last,
        message: `Link prev(${valOf(last)}) ⇄ ${node.val}`,
      })
    } else {
      first = node.id
      steps.push({
        activeLine: 9,
        order: [...order], links: links.map(l => ({ ...l })), current: node.id,
        message: `${node.val} is the smallest — set as head (first)`,
      })
    }
    order.push(node.id)
    last = node.id
    steps.push({
      activeLine: 10,
      order: [...order], links: links.map(l => ({ ...l })), current: node.id,
      message: `Advance last = ${node.val}`,
    })

    steps.push({
      activeLine: 11,
      order: [...order], links: links.map(l => ({ ...l })), current: node.id, going: 'right',
      message: `Recurse right of ${node.val}`,
    })
    dfs(node.right)
  }

  const idToVal = {}
  ;(function collect(n) { if (!n) return; collect(n.left); idToVal[n.id] = n.val; collect(n.right) })(root)
  function valOf(id) { return idToVal[id] }

  dfs(root)

  // close the ring
  links.push({ from: last, to: first, wrap: true })
  steps.push({
    activeLine: 13,
    order: [...order], links: links.map(l => ({ ...l })), current: null,
    message: `Close circular list: head(${valOf(first)}) ⇄ tail(${valOf(last)})`,
  })
  steps.push({
    activeLine: 14,
    order: [...order], links: links.map(l => ({ ...l })), current: null, done: true,
    message: `Return head. DLL order: ${order.map(valOf).join(' ⇄ ')}`,
  })

  return steps
}

function VisualizationPanel({ root, step }) {
  const { positions, maxDepth } = useMemo(() => layout(root), [root])
  const idToVal = useMemo(() => {
    const m = {}
    ;(function c(n){ if(!n) return; c(n.left); m[n.id]=n.val; c(n.right) })(root)
    return m
  }, [root])
  if (!step) return <div style={{ padding: 16, color: '#155e75', fontSize: 13 }}>Press play to flatten the BST.</div>

  const nodeIds = Object.keys(positions).map(Number)
  const colW = 56, rowH = 56
  const width = Math.max(1, nodeIds.length) * colW
  const height = (maxDepth + 1) * rowH

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#155e75', fontStyle: 'italic' }}>
          In-order traversal visits nodes in sorted order; each visited node is linked to the previous one, forming a circular doubly linked list.
        </div>
      </div>

      {/* Tree with inorder x-positions */}
      <svg width={width} height={height} style={{ backgroundColor: '#ecfeff', borderRadius: 6, border: '1px solid #67e8f9' }}>
        {nodeIds.map(id => {
          const p = positions[id]
          const cx = p.x * colW + colW / 2
          const cy = p.depth * rowH + rowH / 2
          const isCur = step.current === id
          const inOrder = (step.order || []).includes(id)
          return (
            <g key={id}>
              <circle cx={cx} cy={cy} r={16}
                fill={isCur ? '#06b6d4' : inOrder ? '#a5f3fc' : '#ecfeff'}
                stroke={isCur ? '#0e7490' : '#06b6d4'} strokeWidth={isCur ? 3 : 1} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={isCur ? '#fff' : '#155e75'}>{idToVal[id]}</text>
            </g>
          )
        })}
      </svg>

      {/* DLL being built */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#155e75', marginBottom: 6 }}>Doubly linked list (in-order)</div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {(step.order || []).length === 0 && <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
          {(step.order || []).map((id, i) => (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <span style={{ color: '#06b6d4', fontSize: 14 }}>⇄</span>}
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: '#06b6d4', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {idToVal[id]}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, border: '2px solid #06b6d4', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#06b6d4' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem426Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const root = useMemo(() => buildTree(ex.root), [ex])
  const steps = useMemo(
    () => generateSteps(root).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [root]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
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
    { id: 'viz', title: '🔗 BST → DLL', content: (<VisualizationPanel root={root} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, root])
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
