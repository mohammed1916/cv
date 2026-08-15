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
const PATTERNS = ['base', 'choose_root', 'build_subtrees', 'combine', 'done']

const LINE_PATTERN_MAP = {
  1: 'choose_root',   // def generate(start, end)
  2: 'base',          // if start > end: return [None]
  3: 'choose_root',   // trees = []
  4: 'choose_root',   // for root in range(start, end+1)
  5: 'build_subtrees',// leftTrees = generate(start, root-1)
  6: 'build_subtrees',// rightTrees = generate(root+1, end)
  7: 'combine',       // for l in leftTrees
  8: 'combine',       // for r in rightTrees
  9: 'combine',       // node = TreeNode(root, l, r)
  10: 'combine',      // trees.append(node)
  11: 'done',         // return trees
}

const SOLUTION_CODE = [
  { line: 1, text: 'def generate(start, end):' },
  { line: 2, text: '    if start > end: return [None]' },
  { line: 3, text: '    trees = []' },
  { line: 4, text: '    for root in range(start, end + 1):' },
  { line: 5, text: '        leftTrees  = generate(start, root - 1)' },
  { line: 6, text: '        rightTrees = generate(root + 1, end)' },
  { line: 7, text: '        for l in leftTrees:' },
  { line: 8, text: '            for r in rightTrees:' },
  { line: 9, text: '                node = TreeNode(root, l, r)' },
  { line: 10, text: '                trees.append(node)' },
  { line: 11, text: '    return trees          # generateTrees(n) = generate(1, n)' },
]

// n is capped at 4 for rendering sanity (n=4 already yields 14 trees).
const EXAMPLES = [
  { label: 'n = 3', n: 3 },
  { label: 'n = 2', n: 2 },
  { label: 'n = 1', n: 1 },
  { label: 'n = 4', n: 4 },
]

// ─── Pure BST generation (real algorithm) ───────────────────────────────────
function generate(start, end) {
  if (start > end) return [null]
  const trees = []
  for (let root = start; root <= end; root++) {
    const leftTrees = generate(start, root - 1)
    const rightTrees = generate(root + 1, end)
    for (const l of leftTrees) {
      for (const r of rightTrees) {
        trees.push({ val: root, left: l, right: r })
      }
    }
  }
  return trees
}

// Layout a single BST: x from in-order (sorted-value) index, y from depth.
// Returns { nodes: [{id, val, x, y}], edges: [{from, to}] } with normalized
// coordinates inside a small cell.
function layoutTree(tree, cellW, cellH) {
  const nodes = []
  const edges = []
  const padX = 22
  const padY = 26
  const innerW = cellW - padX * 2
  const innerH = cellH - padY * 2

  // In-order traversal to assign x-order, and track depth for y.
  const inorder = []
  let maxDepth = 0
  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    node.__order = inorder.length
    node.__depth = depth
    maxDepth = Math.max(maxDepth, depth)
    inorder.push(node)
    walk(node.right, depth + 1)
  }
  walk(tree, 0)

  const count = inorder.length || 1
  const xStep = count > 1 ? innerW / (count - 1) : 0
  const yStep = maxDepth > 0 ? innerH / maxDepth : 0

  let idCounter = 0
  const assignId = (node) => {
    if (!node) return null
    const id = idCounter++
    const x = padX + (count > 1 ? node.__order * xStep : innerW / 2)
    const y = padY + node.__depth * yStep
    const self = { id, val: node.val, x, y }
    nodes.push(self)
    const leftId = assignId(node.left)
    const rightId = assignId(node.right)
    if (leftId != null) edges.push({ from: id, to: leftId })
    if (rightId != null) edges.push({ from: id, to: rightId })
    return id
  }
  assignId(tree)

  return { nodes, edges }
}

const CELL_W = 150
const CELL_H = 150

function generateSteps(n) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'choose_root',
    currentRoot: null,
    n,
    count: 0,
    trees: [],
    message: `generateTrees(${n}): build every structurally unique BST storing values 1..${n}.`,
  })

  if (n < 1) {
    steps.push({
      activeLine: 2,
      phase: 'base',
      currentRoot: null,
      n,
      count: 1,
      trees: [{ nodes: [], edges: [] }],
      message: 'n = 0 → the only tree is the empty tree [null].',
    })
    return steps
  }

  const allTrees = []
  let running = 0

  // Animate the TOP-LEVEL choice of root = 1..n.
  for (let root = 1; root <= n; root++) {
    // Announce the root choice.
    steps.push({
      activeLine: 4,
      phase: 'choose_root',
      currentRoot: root,
      n,
      count: running,
      trees: allTrees.map((t) => layoutTree(t, CELL_W, CELL_H)),
      message: `Choose root = ${root}. Left subtree uses {${root > 1 ? `1..${root - 1}` : '∅'}}, right uses {${root < n ? `${root + 1}..${n}` : '∅'}}.`,
    })

    const leftTrees = generate(1, root - 1)
    const rightTrees = generate(root + 1, n)

    steps.push({
      activeLine: 6,
      phase: 'build_subtrees',
      currentRoot: root,
      n,
      count: running,
      trees: allTrees.map((t) => layoutTree(t, CELL_W, CELL_H)),
      message: `Recurse: ${leftTrees.length} left-subtree shape(s) × ${rightTrees.length} right-subtree shape(s) = ${leftTrees.length * rightTrees.length} tree(s) rooted at ${root}.`,
    })

    // Combine every (left, right) pair under this root.
    const rootTrees = []
    for (const l of leftTrees) {
      for (const r of rightTrees) {
        rootTrees.push({ val: root, left: l, right: r })
      }
    }

    running += rootTrees.length
    allTrees.push(...rootTrees)

    steps.push({
      activeLine: 10,
      phase: 'combine',
      currentRoot: root,
      n,
      count: running,
      newTreeCount: rootTrees.length,
      trees: allTrees.map((t) => layoutTree(t, CELL_W, CELL_H)),
      message: `Collected ${rootTrees.length} BST(s) with root = ${root}. Running total: ${running} unique tree(s).`,
    })
  }

  steps.push({
    activeLine: 11,
    phase: 'done',
    currentRoot: null,
    n,
    count: running,
    trees: allTrees.map((t) => layoutTree(t, CELL_W, CELL_H)),
    message: `Done. ${running} structurally unique BST(s) store values 1..${n}.`,
  })

  return steps
}

// ─── Visualization ───────────────────────────────────────────────────────────
function TreeCell({ tree, index, highlight }) {
  const { nodes = [], edges = [] } = tree || {}
  const nodeById = new Map(nodes.map((nd) => [nd.id, nd]))
  const R = 15
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        width: CELL_W,
        height: CELL_H + 18,
        borderRadius: 10,
        border: highlight ? '2px solid #10b981' : '1px solid #cbd5e1',
        background: highlight ? '#ecfdf5' : '#ffffff',
        boxShadow: highlight ? '0 0 0 3px #10b98122' : '0 1px 3px #0000000f',
        position: 'relative',
        flex: '0 0 auto',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#64748b',
          textAlign: 'center',
          padding: '3px 0',
          fontWeight: 600,
        }}
      >
        tree #{index + 1}
      </div>
      {nodes.length === 0 ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: CELL_H - 20,
            color: '#627794',
            fontSize: 12,
            fontStyle: 'italic',
          }}
        >
          null
        </div>
      ) : (
        <svg width={CELL_W} height={CELL_H} style={{ display: 'block' }}>
          {edges.map((e, i) => {
            const a = nodeById.get(e.from)
            const b = nodeById.get(e.to)
            if (!a || !b) return null
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#94a3b8"
                strokeWidth={1.5}
              />
            )
          })}
          {nodes.map((nd) => (
            <g key={nd.id}>
              <circle
                cx={nd.x}
                cy={nd.y}
                r={R}
                fill={highlight ? '#10b981' : '#3b82f6'}
                stroke="#1e293b"
                strokeWidth={1}
              />
              <text
                x={nd.x}
                y={nd.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={700}
                fill="#ffffff"
              >
                {nd.val}
              </text>
            </g>
          ))}
        </svg>
      )}
    </motion.div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play to generate all unique BSTs.
      </div>
    )
  }

  const { trees = [], currentRoot, count, n, newTreeCount, phase } = step
  const highlightStart = phase === 'combine' && newTreeCount ? trees.length - newTreeCount : -1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16 }}>
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            fontSize: 13,
            color: '#1e3a8a',
            fontWeight: 600,
          }}
        >
          n = {n}
        </div>
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: currentRoot != null ? '#fef3c7' : '#f1f5f9',
            border: `1px solid ${currentRoot != null ? '#fde68a' : '#e2e8f0'}`,
            fontSize: 13,
            color: '#78350f',
            fontWeight: 600,
          }}
        >
          root = {currentRoot != null ? currentRoot : '—'}
        </div>
        <div
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            fontSize: 13,
            color: '#065f46',
            fontWeight: 700,
          }}
        >
          unique BSTs: {count}
        </div>
      </div>

      <div
        style={{
          padding: 10,
          background: '#f8fafc',
          borderRadius: 8,
          borderLeft: '4px solid #3b82f6',
          fontSize: 12.5,
          color: '#334155',
        }}
      >
        {step.message}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignContent: 'flex-start',
        }}
      >
        {trees.length === 0 ? (
          <div style={{ color: '#627794', fontSize: 13, fontStyle: 'italic' }}>
            No trees collected yet.
          </div>
        ) : (
          trees.map((t, i) => (
            <TreeCell key={i} tree={t} index={i} highlight={i >= highlightStart && highlightStart >= 0} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Default export ───────────────────────────────────────────────────────────
export default function Problem95Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(3);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 3, inputError: e.message };
    }
  }, [nInput]);
  const steps = useMemo(
    () =>
      generateSteps(n).map((c) => ({
        ...c,
        relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
      })),
    [n]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"number"}]}
        values={{ n: nInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="problem95-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem95-status">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '8px 12px' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            className="problem95-button"
            onClick={() => applyEx(e)}
            style={{
              outline: e.label === ex.label ? '2px solid #10b981' : 'none',
            }}
          >
            {e.label}
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

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🌲 Unique BSTs II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem95-shell">
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
