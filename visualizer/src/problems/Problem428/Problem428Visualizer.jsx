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
import './Problem428Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamples('serialize-deserialize-nary-tree') || [
  { label: 'Example 1', tree: { val: 1, children: [{ val: 3, children: [{ val: 5 }, { val: 6 }] }, { val: 2 }, { val: 4 }] } },
]

// Assign ids and normalize children arrays.
function normalize(node, ctx = { id: 0 }) {
  if (!node) return null
  const n = { val: node.val, id: ctx.id++, children: [] }
  for (const c of (node.children || [])) n.children.push(normalize(c, ctx))
  return n
}

function generateSteps(root) {
  const steps = []
  const out = []

  steps.push({
    activeLine: 3,
    out: [], current: null,
    message: 'serialize(root): emit value, then child count, then each child',
  })

  const dfs = (node) => {
    out.push(String(node.val))
    out.push(String(node.children.length))
    steps.push({
      activeLine: 3,
      out: [...out], current: node.id,
      message: `Emit "${node.val}" and child-count ${node.children.length}`,
    })
    for (const c of node.children) {
      steps.push({
        activeLine: 4,
        out: [...out], current: node.id, childOf: node.id,
        message: `Descend into child ${c.val} of ${node.val}`,
      })
      dfs(c)
    }
  }

  dfs(root)

  steps.push({
    activeLine: 6,
    out: [...out], current: null, done: true,
    message: `Serialized string: "${out.join(' ')}"`,
  })

  return steps
}

function layout(root) {
  const positions = {}
  const rows = []
  let order = 0
  const walk = (node, depth) => {
    if (!node) return
    if (!rows[depth]) rows[depth] = []
    rows[depth].push(node)
    const startOrder = order
    if (node.children.length === 0) { positions[node.id] = { x: order++, depth } }
    else {
      node.children.forEach(c => walk(c, depth + 1))
      // center over children
      const xs = node.children.map(c => positions[c.id].x)
      positions[node.id] = { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth }
    }
  }
  walk(root, 0)
  return { positions, maxDepth: rows.length }
}

function VisualizationPanel({ root, step }) {
  const { positions, maxDepth } = useMemo(() => layout(root), [root])
  const idToNode = useMemo(() => {
    const m = {}
    ;(function c(n){ if(!n) return; m[n.id]=n; n.children.forEach(c) })(root)
    return m
  }, [root])
  if (!step) return <div style={{ padding: 16, color: '#5b21b6', fontSize: 13 }}>Press play to serialize the tree.</div>

  const ids = Object.keys(positions).map(Number)
  const maxX = Math.max(0, ...ids.map(id => positions[id].x))
  const colW = 60, rowH = 64
  const width = (maxX + 1) * colW
  const height = (maxDepth + 1) * rowH

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, borderLeft: '4px solid #7c3aed' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          Encode each node as <code>value, childCount</code>, then recurse into its children — enough to rebuild the N-ary tree.
        </div>
      </div>

      <svg width={width} height={height} style={{ backgroundColor: '#f5f3ff', borderRadius: 6, border: '1px solid #c4b5fd' }}>
        {ids.map(id => {
          const node = idToNode[id]
          const p = positions[id]
          const cx = p.x * colW + colW / 2
          const cy = p.depth * rowH + rowH / 2
          return node.children.map(c => {
            const cp = positions[c.id]
            return <line key={`${id}-${c.id}`} x1={cx} y1={cy} x2={cp.x * colW + colW / 2} y2={cp.depth * rowH + rowH / 2}
              stroke="#c4b5fd" strokeWidth={1.5} />
          })
        })}
        {ids.map(id => {
          const node = idToNode[id]
          const p = positions[id]
          const cx = p.x * colW + colW / 2
          const cy = p.depth * rowH + rowH / 2
          const isCur = step.current === id
          return (
            <g key={id}>
              <circle cx={cx} cy={cy} r={17}
                fill={isCur ? '#7c3aed' : '#ede9fe'} stroke={isCur ? '#5b21b6' : '#a78bfa'} strokeWidth={isCur ? 3 : 1} />
              <text x={cx} y={cy + 4} textAnchor="middle" fontSize={13} fontWeight={700}
                fill={isCur ? '#fff' : '#5b21b6'}>{node.val}</text>
            </g>
          )
        })}
      </svg>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 6 }}>Serialized output</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(step.out || []).length === 0 && <span style={{ fontSize: 12, color: '#9ca3af' }}>—</span>}
          {(step.out || []).map((tok, i) => (
            <motion.div key={i} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
                backgroundColor: i % 2 ? '#ddd6fe' : '#ede9fe', color: '#5b21b6' }}>{tok}</motion.div>
          ))}
        </div>
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #7c3aed', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem428Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const root = useMemo(() => normalize(ex.tree), [ex])
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
    { id: 'viz', title: '🌐 Serialize N-ary', content: (<VisualizationPanel root={root} step={step} />) },
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
