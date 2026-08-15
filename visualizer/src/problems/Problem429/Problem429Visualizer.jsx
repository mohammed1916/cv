import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem429Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('nary-tree-level-order')

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('nary-tree-level-order', [
  { label: 'Example 1', root: [1, null, 3, 2, 4, null, 5, 6] },
])

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
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [rootInput, setRootInput] = useState("[1,null,3,2,4,null,5,6]");
  const { root: inputRoot, inputError } = useMemo(() => {
    try {
      const parsedRoot = JSON.parse(rootInput); if (!Array.isArray(parsedRoot)) throw new Error('root must be an array');
      return { root: parsedRoot, inputError: '' };
    } catch (e) {
      return { root: "[1,null,3,2,4,null,5,6]", inputError: e.message };
    }
  }, [rootInput]);
  const root = useMemo(() => buildTree(inputRoot), [inputRoot])
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
  const applyEx = useCallback((e) => { setEx(e); setRootInput(JSON.stringify(e.root)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 N-ary Level Order', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel root={root} step={step} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, root])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"root","label":"root","type":"array"}]}
          values={{ root: rootInput }}
          onChange={(k, v) => { if (k === 'root') setRootInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
