import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import SvgViewport from '../../components/shared/SvgViewport'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './BTLongestConsecutiveIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'visit', 'base', 'recurse_left', 'recurse_right', 'extend', 'combine', 'update_best', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'visit',
  5: 'base',
  6: 'recurse_left',
  7: 'recurse_right',
  11: 'extend',
  16: 'combine',
  17: 'update_best',
  20: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def longestConsecutive(root):' },
  { line: 2, text: '    best = 0' },
  { line: 3, text: '' },
  { line: 4, text: '    def dfs(node):' },
  { line: 5, text: '        if not node: return (0, 0)   # (inc, dec) lengths' },
  { line: 6, text: '        li, ld = dfs(node.left)' },
  { line: 7, text: '        ri, rd = dfs(node.right)' },
  { line: 8, text: '        inc = dec = 1' },
  { line: 9, text: '' },
  { line: 10, text: '        if node.left:' },
  { line: 11, text: '            if node.left.val == node.val + 1: inc = li + 1' },
  { line: 12, text: '            if node.left.val == node.val - 1: dec = ld + 1' },
  { line: 13, text: '        if node.right:' },
  { line: 14, text: '            if node.right.val == node.val + 1: inc = max(inc, ri + 1)' },
  { line: 15, text: '            if node.right.val == node.val - 1: dec = max(dec, rd + 1)' },
  { line: 16, text: '' },
  { line: 17, text: '        nonlocal best' },
  { line: 18, text: '        best = max(best, inc + dec - 1)  # child-parent-child path' },
  { line: 19, text: '        return (inc, dec)' },
  { line: 20, text: '' },
  { line: 21, text: '    dfs(root)' },
  { line: 22, text: '    return best' },
]

/** Parse a LeetCode level-order array, e.g. "1,2,3,null,4". */
function parseTree(text) {
  const cleaned = String(text).replace(/[[\]]/g, ' ').trim()
  if (!cleaned) throw new Error('Enter a level-order array, e.g. 1,2,3')
  const tokens = cleaned.split(/[\s,]+/).filter(Boolean)
  if (tokens.length > 31) throw new Error('Keep the tree to 31 nodes or fewer')

  const vals = tokens.map((t) => {
    if (t === 'null' || t === 'n' || t === '#') return null
    const v = Number(t)
    if (!Number.isFinite(v)) throw new Error(`"${t}" is not a number or null`)
    return v
  })

  if (vals[0] == null) throw new Error('Root cannot be null')

  let nextId = 0
  const nodes = []
  const makeNode = (val) => {
    const node = { id: nextId++, val, left: null, right: null }
    nodes.push(node)
    return node
  }

  const root = makeNode(vals[0])
  const queue = [root]
  let idx = 1
  while (queue.length && idx < vals.length) {
    const node = queue.shift()
    if (idx < vals.length) {
      const v = vals[idx++]
      if (v != null) { node.left = makeNode(v); queue.push(node.left) }
    }
    if (idx < vals.length) {
      const v = vals[idx++]
      if (v != null) { node.right = makeNode(v); queue.push(node.right) }
    }
  }

  return { root, nodes }
}

/**
 * Assign x/y layout coordinates by in-order index so subtrees never overlap.
 */
function layoutTree(root) {
  const positions = {}
  let col = 0
  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    positions[node.id] = { col: col++, depth }
    walk(node.right, depth + 1)
  }
  walk(root, 0)

  const cols = col
  let maxDepth = 0
  Object.values(positions).forEach((p) => { maxDepth = Math.max(maxDepth, p.depth) })

  const gapX = 56
  const gapY = 62
  const width = Math.max(360, cols * gapX)
  const height = Math.max(200, (maxDepth + 1) * gapY + 30)

  const coords = {}
  Object.entries(positions).forEach(([id, p]) => {
    coords[id] = {
      x: (p.col + 0.5) * (width / cols),
      y: 30 + p.depth * gapY,
    }
  })

  return { coords, width, height }
}

/**
 * LC 549. dfs returns (inc, dec): the longest increasing / decreasing run that
 * starts at `node` and descends. A path through the node joins its longest
 * increasing descent with its longest decreasing descent, so the candidate
 * answer at each node is inc + dec - 1 (the node itself counted once).
 */
function generateSteps(input) {
  const steps = []

  try {
    const { root, nodes } = parseTree(input)

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Tree with ${nodes.length} node(s). best = 0. DFS returns (inc, dec) per node.`,
      best: 0,
      resolved: {},
    })

    let best = 0
    const resolved = {}
    let bestPath = null

    const dfs = (node) => {
      if (!node) return { inc: 0, dec: 0 }

      steps.push({
        phase: 'visit',
        activeLine: 4,
        message: `Visit node ${node.val}. Recurse into children first.`,
        current: node.id,
        best,
        resolved: { ...resolved },
      })

      const left = dfs(node.left)
      const right = dfs(node.right)

      let inc = 1
      let dec = 1
      const notes = []

      if (node.left) {
        if (node.left.val === node.val + 1) {
          inc = left.inc + 1
          notes.push(`left ${node.left.val} = ${node.val}+1 → inc = ${left.inc}+1 = ${inc}`)
        }
        if (node.left.val === node.val - 1) {
          dec = left.dec + 1
          notes.push(`left ${node.left.val} = ${node.val}-1 → dec = ${left.dec}+1 = ${dec}`)
        }
      }
      if (node.right) {
        if (node.right.val === node.val + 1) {
          inc = Math.max(inc, right.inc + 1)
          notes.push(`right ${node.right.val} = ${node.val}+1 → inc = ${inc}`)
        }
        if (node.right.val === node.val - 1) {
          dec = Math.max(dec, right.dec + 1)
          notes.push(`right ${node.right.val} = ${node.val}-1 → dec = ${dec}`)
        }
      }

      steps.push({
        phase: notes.length ? 'extend' : 'base',
        activeLine: notes.length ? 11 : 8,
        message: notes.length
          ? `Node ${node.val}: ${notes.join('; ')}`
          : `Node ${node.val}: no consecutive child. inc = dec = 1.`,
        current: node.id,
        inc,
        dec,
        best,
        resolved: { ...resolved },
      })

      const candidate = inc + dec - 1

      steps.push({
        phase: 'combine',
        activeLine: 18,
        message: `Path through ${node.val}: inc + dec - 1 = ${inc} + ${dec} - 1 = ${candidate}.`,
        current: node.id,
        inc,
        dec,
        candidate,
        best,
        resolved: { ...resolved },
      })

      if (candidate > best) {
        best = candidate
        bestPath = { nodeId: node.id, inc, dec, length: candidate }
        steps.push({
          phase: 'update_best',
          activeLine: 18,
          message: `New best = ${best} (path bending at node ${node.val}).`,
          current: node.id,
          inc,
          dec,
          candidate,
          best,
          resolved: { ...resolved },
        })
      }

      resolved[node.id] = { val: node.val, inc, dec }

      return { inc, dec }
    }

    dfs(root)

    steps.push({
      phase: 'done',
      activeLine: 22,
      message: `Longest consecutive path length = ${best}${bestPath ? ` (bends at node ${resolved[bestPath.nodeId].val})` : ''}.`,
      best,
      result: best,
      resolved: { ...resolved },
      bestNode: bestPath?.nodeId ?? null,
    })
  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamplesOr('binary-tree-longest-consecutive-sequence-ii', [
  { label: 'Example 1', tree: '1,2,3' },
  { label: 'Example 2', tree: '2,1,3' },
  { label: 'Longer path', tree: '3,2,4,1,null,null,5' },
])

export default function BTLongestConsecutiveIIVisualizer() {
  const [treeInput, setTreeInput] = useState('2,1,3')
  const [panelDivs, setPanelDivs] = useState(null)

  const { inputError, tree } = useMemo(() => {
    try {
      return { inputError: '', tree: parseTree(treeInput) }
    } catch (e) {
      return { inputError: e.message, tree: null }
    }
  }, [treeInput])

  const layout = useMemo(() => (tree ? layoutTree(tree.root) : null), [tree])

  const steps = useMemo(
    () => generateSteps(treeInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [treeInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setTreeInput(ex.tree)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Flat edge list for drawing.
  const edges = useMemo(() => {
    if (!tree) return []
    const out = []
    const walk = (node) => {
      if (!node) return
      if (node.left) { out.push([node.id, node.left.id]); walk(node.left) }
      if (node.right) { out.push([node.id, node.right.id]); walk(node.right) }
    }
    walk(tree.root)
    return out
  }, [tree])

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"string"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <div className="p549-panel-primary">
      <div className="p549-card">
        <div className="p549-section-label">Input (level order)</div>
        <input
          id="p549-tree"
          className={`p549-input mono ${inputError ? 'has-error' : ''}`}
          value={treeInput}
          onChange={(e) => { setTreeInput(e.target.value); handleReset() }}
          placeholder="2,1,3"
        />
        <p className={`p549-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Use null for missing children. A path may go child → parent → child.'}
        </p>
        <div className="p549-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p549-example-btn ${treeInput === ex.tree ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p549-card">
        <div className="p549-section-label">Tree</div>
        {layout ? (
          <div className="p549-tree-host">
            <SvgViewport width={layout.width} height={layout.height}>
              {edges.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  className="p549-edge"
                  x1={layout.coords[a].x}
                  y1={layout.coords[a].y}
                  x2={layout.coords[b].x}
                  y2={layout.coords[b].y}
                />
              ))}
              {tree.nodes.map((node) => {
                const pos = layout.coords[node.id]
                const info = step?.resolved?.[node.id]
                const isCurrent = step?.current === node.id
                const isBest = step?.bestNode === node.id
                const cls = [
                  'p549-node',
                  isCurrent ? 'visiting' : '',
                  isBest ? 'on-path' : info ? 'resolved' : '',
                ].filter(Boolean).join(' ')
                const runs = isCurrent && step?.inc != null
                  ? `${step.inc},${step.dec}`
                  : info ? `${info.inc},${info.dec}` : ''
                return (
                  <g key={node.id} className={cls}>
                    <circle cx={pos.x} cy={pos.y} r={16} />
                    <text className="p549-node-val" x={pos.x} y={pos.y}>{node.val}</text>
                    {runs && (
                      <text className="p549-node-runs" x={pos.x} y={pos.y + 28}>({runs})</text>
                    )}
                  </g>
                )
              })}
            </SvgViewport>
          </div>
        ) : (
          <div className="p549-empty">Fix the input to draw the tree.</div>
        )}
        <p className="p549-hint">Labels below nodes show the returned (inc, dec) run lengths.</p>
      </div>

      {step?.result !== undefined && (
        <div className="p549-result">
          <div className="p549-section-label" style={{ marginBottom: '0.3rem' }}>Longest Path</div>
          <div className="p549-result-val">{step.result}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p549-panel-state">
      <div className="p549-card">
        <div className="p549-section-label">Current Node</div>
        <div className="p549-stat-grid">
          <div className="p549-stat"><span className="p549-stat-key">inc</span><span className="p549-stat-val">{step?.inc ?? '—'}</span></div>
          <div className="p549-stat"><span className="p549-stat-key">dec</span><span className="p549-stat-val">{step?.dec ?? '—'}</span></div>
          <div className="p549-stat"><span className="p549-stat-key">inc+dec-1</span><span className="p549-stat-val">{step?.candidate ?? '—'}</span></div>
          <div className="p549-stat highlight"><span className="p549-stat-key">best</span><span className="p549-stat-val">{step?.best ?? 0}</span></div>
        </div>
      </div>

      <div className="p549-card">
        <div className="p549-section-label">Resolved (inc, dec)</div>
        {step?.resolved && Object.keys(step.resolved).length ? (
          <table className="p549-table">
            <thead>
              <tr><th>node</th><th>inc</th><th>dec</th></tr>
            </thead>
            <tbody>
              {Object.entries(step.resolved).map(([id, info]) => (
                <tr key={id} className={step.current === Number(id) ? 'current' : ''}>
                  <td>{info.val}</td>
                  <td>{info.inc}</td>
                  <td>{info.dec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p549-empty">No nodes resolved yet.</div>
        )}
      </div>
    </div>
  )

  const codePanel = (
    <div className="p549-panel-code">
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
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

  const statusPanel = (
    <div className="p549-panel-status">
      <div className={`p549-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
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
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state',   title: 'State',         dockMode: 'split-right' },
      { id: 'code',    title: 'Code',          dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status',        dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  return (
    <div className="p549-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state   && createPortal(statePanel,   panelDivs.state)}
          {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
          {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
