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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem429Visualizer.css'

const EXAMPLES = getExamples('nary-tree-level-order') || [
  { label: 'Example 1', root: [1, null, 3, 2, 4, null, 5, 6] },
]

// Build an N-ary tree from LeetCode level-order-with-null-separators encoding.
function buildTree(arr) {
  if (!arr || arr.length === 0 || arr[0] == null) return null
  let id = 0
  const root = { val: arr[0], children: [], id: id++ }
  const queue = [root]
  let i = 2 // skip root and the null after it
  while (i < arr.length && queue.length) {
    const parent = queue.shift()
    while (i < arr.length && arr[i] != null) {
      const child = { val: arr[i], children: [], id: id++ }
      parent.children.push(child)
      queue.push(child)
      i++
    }
    i++ // skip the null separator
  }
  return root
}

function generateSteps(root) {
  const steps = []
  if (!root) {
    steps.push({ activeLine: 2, result: [], queue: [], message: 'Empty tree → return []', done: true })
    return steps
  }

  const result = []
  let queue = [root]

  steps.push({
    activeLine: 3,
    result: [],
    queue: queue.map(n => n.val),
    queueIds: queue.map(n => n.id),
    message: 'Initialize result=[] and queue with root',
  })

  while (queue.length > 0) {
    steps.push({
      activeLine: 4,
      result: result.map(r => [...r]),
      queue: queue.map(n => n.val),
      queueIds: queue.map(n => n.id),
      message: `Queue has ${queue.length} node(s) — process this level`,
    })

    const level = queue.map(n => n.val)
    const levelIds = queue.map(n => n.id)
    result.push(level)

    steps.push({
      activeLine: 6,
      result: result.map(r => [...r]),
      queue: queue.map(n => n.val),
      queueIds: levelIds,
      levelIds,
      message: `Record level: [${level.join(', ')}]`,
    })

    const children = []
    for (const node of queue) {
      for (const c of node.children) children.push(c)
    }

    steps.push({
      activeLine: 9,
      result: result.map(r => [...r]),
      queue: children.map(n => n.val),
      queueIds: children.map(n => n.id),
      message: children.length
        ? `Collect children for next level: [${children.map(c => c.val).join(', ')}]`
        : 'No children — traversal will end',
    })

    queue = children
  }

  steps.push({
    activeLine: 6,
    result: result.map(r => [...r]),
    queue: [],
    queueIds: [],
    done: true,
    message: `Done — ${result.length} levels: ${JSON.stringify(result)}`,
  })

  return steps
}

// Lay out the tree for drawing (simple depth-based rows).
function layout(root) {
  const rows = []
  if (!root) return rows
  let level = [root]
  while (level.length) {
    rows.push(level)
    const next = []
    level.forEach(n => n.children.forEach(c => next.push(c)))
    level = next
  }
  return rows
}

function VisualizationPanel({ root, step }) {
  const rows = useMemo(() => layout(root), [root])
  const activeIds = new Set(step?.queueIds || [])
  const levelIds = new Set(step?.levelIds || [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, borderLeft: '4px solid #16a34a' }}>
        <div style={{ fontSize: 12, color: '#14532d', fontStyle: 'italic' }}>
          BFS by levels: record all node values at the current depth, then collect their children for the next level.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 12 }}>
            {row.map(node => {
              const inQueue = activeIds.has(node.id)
              const inLevel = levelIds.has(node.id)
              return (
                <motion.div
                  key={node.id}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                    backgroundColor: inLevel ? '#16a34a' : inQueue ? '#86efac' : '#f0fdf4',
                    color: inLevel ? '#fff' : '#14532d',
                    border: inQueue ? '2px solid #16a34a' : '1px solid #bbf7d0',
                  }}
                  animate={{ scale: inQueue || inLevel ? 1.12 : 1 }}
                >
                  {node.val}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#14532d', marginBottom: 6 }}>Result (levels)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(step?.result || []).map((lvl, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: 13, color: '#16a34a' }}>
              [{lvl.join(', ')}]
            </div>
          ))}
          {(!step?.result || step.result.length === 0) && (
            <div style={{ fontSize: 12, color: '#6b7280' }}>—</div>
          )}
        </div>
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #16a34a', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#14532d' }}>Current queue: [{(step?.queue || []).join(', ') || '∅'}]</div>
        <div style={{ fontSize: 12, color: '#16a34a', marginTop: 6 }}>{step?.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem429Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('nary-tree-level-order')
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
    { id: 'viz', title: '🌳 N-ary Level Order', content: (<VisualizationPanel root={root} step={step} />) },
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
