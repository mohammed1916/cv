import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import SvgViewport from '../../components/shared/SvgViewport'
import './BoundaryOfBinaryTreeVisualizer.css'

const PATTERNS = ['init', 'root', 'left_boundary', 'leaves', 'right_boundary', 'reverse', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'root',
  11: 'left_boundary',
  12: 'left_boundary',
  16: 'leaves',
  20: 'leaves',
  29: 'right_boundary',
  30: 'right_boundary',
  33: 'reverse',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def boundaryOfBinaryTree(root):' },
  { line: 2, text: '    if not root:' },
  { line: 3, text: '        return []' },
  { line: 4, text: '    boundary = [root.val]' },
  { line: 5, text: '' },
  { line: 6, text: '    def is_leaf(n):' },
  { line: 7, text: '        return not n.left and not n.right' },
  { line: 8, text: '' },
  { line: 9, text: '    # 1. Left boundary, top-down, excluding leaves' },
  { line: 10, text: '    node = root.left' },
  { line: 11, text: '    while node and not is_leaf(node):' },
  { line: 12, text: '        boundary.append(node.val)' },
  { line: 13, text: '        node = node.left or node.right' },
  { line: 14, text: '' },
  { line: 15, text: '    # 2. All leaves, left to right' },
  { line: 16, text: '    def leaves(n):' },
  { line: 17, text: '        if not n:' },
  { line: 18, text: '            return' },
  { line: 19, text: '        if is_leaf(n) and n is not root:' },
  { line: 20, text: '            boundary.append(n.val)' },
  { line: 21, text: '        leaves(n.left)' },
  { line: 22, text: '        leaves(n.right)' },
  { line: 23, text: '    leaves(root.left)' },
  { line: 24, text: '    leaves(root.right)' },
  { line: 25, text: '' },
  { line: 26, text: '    # 3. Right boundary, bottom-up, excluding leaves' },
  { line: 27, text: '    right = []' },
  { line: 28, text: '    node = root.right' },
  { line: 29, text: '    while node and not is_leaf(node):' },
  { line: 30, text: '        right.append(node.val)' },
  { line: 31, text: '        node = node.right or node.left' },
  { line: 32, text: '' },
  { line: 33, text: '    return boundary + right[::-1]' },
]

const EXAMPLES = getExamplesOr('boundary-of-binary-tree', [
  { label: 'Example 1', text: '1,null,2,3,4' },
  { label: 'Example 2', text: '1,2,3,4,5,6,null,null,null,7,8,9,10' },
  { label: 'Left chain', text: '1,2,null,3,null,4' },
]).map((ex) => ({
  label: ex.label,
  text: ex.text ?? (ex.root ?? ex.tree ?? []).join(','),
}))

/** Build a tree from LeetCode level-order notation with `null` placeholders. */
function parseTree(text) {
  const tokens = text.split(/[,\s[\]]+/).filter((s) => s !== '')
  if (tokens.length === 0) throw new Error('Enter a level-order tree, e.g. 1,null,2,3,4')
  if (tokens.length > 40) throw new Error('Keep the tree to 40 nodes or fewer')

  const parse = (t) => {
    if (t === 'null' || t === 'n' || t === '#') return null
    const v = Number(t)
    if (Number.isNaN(v)) throw new Error(`"${t}" is not a number or null`)
    return v
  }

  const vals = tokens.map(parse)
  if (vals[0] === null) throw new Error('The root cannot be null')

  let nextId = 0
  const makeNode = (val) => ({ id: nextId++, val, left: null, right: null })
  const root = makeNode(vals[0])
  const queue = [root]
  let i = 1

  while (queue.length > 0 && i < vals.length) {
    const node = queue.shift()
    if (i < vals.length) {
      const lv = vals[i++]
      if (lv !== null) { node.left = makeNode(lv); queue.push(node.left) }
    }
    if (i < vals.length) {
      const rv = vals[i++]
      if (rv !== null) { node.right = makeNode(rv); queue.push(node.right) }
    }
  }

  return root
}

/** Assign x/y by in-order position and depth so subtrees never overlap. */
function layoutTree(root) {
  const positions = new Map()
  let counter = 0

  const walk = (node, depth) => {
    if (!node) return
    walk(node.left, depth + 1)
    positions.set(node.id, { col: counter++, depth, node })
    walk(node.right, depth + 1)
  }
  walk(root, 0)

  const cols = Math.max(counter, 1)
  let maxDepth = 0
  positions.forEach((p) => { maxDepth = Math.max(maxDepth, p.depth) })

  const width = 400
  const height = 300
  const stepX = width / (cols + 1)
  const stepY = maxDepth === 0 ? 0 : (height - 60) / maxDepth

  const laidOut = new Map()
  positions.forEach((p, id) => {
    laidOut.set(id, {
      node: p.node,
      x: stepX * (p.col + 1),
      y: 30 + stepY * p.depth,
    })
  })
  return laidOut
}

function collectEdges(root) {
  const edges = []
  const walk = (node) => {
    if (!node) return
    if (node.left) { edges.push([node.id, node.left.id]); walk(node.left) }
    if (node.right) { edges.push([node.id, node.right.id]); walk(node.right) }
  }
  walk(root)
  return edges
}

const isLeaf = (n) => n && !n.left && !n.right

function generateSteps(text) {
  const steps = []

  try {
    const root = parseTree(text)

    const boundary = []
    const marks = new Map() // node id -> 'root' | 'left' | 'leaf' | 'right'

    const snapshot = (extra) => ({
      root,
      boundary: [...boundary],
      marks: new Map(marks),
      ...extra,
    })

    steps.push(snapshot({
      phase: 'init',
      activeLine: 2,
      message: 'The boundary is: root, then the left boundary top-down, then all leaves left-to-right, then the right boundary bottom-up.',
    }))

    boundary.push(root.val)
    marks.set(root.id, 'root')
    steps.push(snapshot({
      phase: 'root',
      activeLine: 4,
      message: `Start with the root: ${root.val}`,
      cursor: root.id,
    }))

    // ── 1. Left boundary, excluding leaves ──────────────────────────
    let node = root.left
    if (!node) {
      steps.push(snapshot({
        phase: 'left_boundary',
        activeLine: 11,
        message: 'No left child — the left boundary is empty.',
      }))
    }
    while (node && !isLeaf(node)) {
      boundary.push(node.val)
      marks.set(node.id, 'left')
      steps.push(snapshot({
        phase: 'left_boundary',
        activeLine: 12,
        message: `Left boundary: append ${node.val}. Prefer the left child, fall back to the right.`,
        cursor: node.id,
      }))
      node = node.left || node.right
    }
    if (node && isLeaf(node)) {
      steps.push(snapshot({
        phase: 'left_boundary',
        activeLine: 11,
        message: `Node ${node.val} is a leaf — stop the left boundary here; it gets collected in the leaf pass.`,
        cursor: node.id,
      }))
    }

    // ── 2. Leaves, left to right ────────────────────────────────────
    const leafWalk = (n) => {
      if (!n) return
      if (isLeaf(n) && n !== root) {
        boundary.push(n.val)
        marks.set(n.id, 'leaf')
        steps.push(snapshot({
          phase: 'leaves',
          activeLine: 20,
          message: `Leaf found: ${n.val}. Append it.`,
          cursor: n.id,
        }))
        return
      }
      leafWalk(n.left)
      leafWalk(n.right)
    }
    steps.push(snapshot({
      phase: 'leaves',
      activeLine: 16,
      message: 'Now walk the whole tree left-to-right and append every leaf.',
    }))
    leafWalk(root.left)
    leafWalk(root.right)

    // ── 3. Right boundary, collected top-down then reversed ─────────
    const right = []
    const rightIds = []
    let rnode = root.right
    if (!rnode) {
      steps.push(snapshot({
        phase: 'right_boundary',
        activeLine: 29,
        message: 'No right child — the right boundary is empty.',
      }))
    }
    while (rnode && !isLeaf(rnode)) {
      right.push(rnode.val)
      rightIds.push(rnode.id)
      marks.set(rnode.id, 'right')
      steps.push(snapshot({
        phase: 'right_boundary',
        activeLine: 30,
        message: `Right boundary (collected top-down): ${rnode.val}. Prefer the right child.`,
        cursor: rnode.id,
        rightList: [...right],
      }))
      rnode = rnode.right || rnode.left
    }
    if (rnode && isLeaf(rnode)) {
      steps.push(snapshot({
        phase: 'right_boundary',
        activeLine: 29,
        message: `Node ${rnode.val} is a leaf — stop; it was already collected as a leaf.`,
        cursor: rnode.id,
        rightList: [...right],
      }))
    }

    const reversed = [...right].reverse()
    steps.push(snapshot({
      phase: 'reverse',
      activeLine: 33,
      message: right.length
        ? `Reverse the right boundary: [${right.join(', ')}] → [${reversed.join(', ')}]`
        : 'Nothing to reverse — the right boundary is empty.',
      rightList: [...right],
      reversedList: reversed,
    }))

    const result = [...boundary, ...reversed]
    // Fold the reversed right boundary in so the final snapshot's boundary[]
    // matches the returned answer.
    boundary.push(...reversed)

    steps.push(snapshot({
      phase: 'done',
      activeLine: 33,
      message: `Boundary: [${result.join(', ')}]`,
      rightList: [...right],
      reversedList: reversed,
      result,
      done: true,
    }))
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

export default function BoundaryOfBinaryTreeVisualizer() {
  const [text, setText] = useState(EXAMPLES[0]?.text || '1,null,2,3,4')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseTree(text)
      return ''
    } catch (e) {
      return e.message
    }
  }, [text])

  const steps = useMemo(
    () => generateSteps(text).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [text],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setText(ex.text)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const treeRoot = step?.root ?? null
  const layout = useMemo(() => (treeRoot ? layoutTree(treeRoot) : new Map()), [treeRoot])
  const edges = useMemo(() => (treeRoot ? collectEdges(treeRoot) : []), [treeRoot])

  const markFill = (mark) => {
    if (mark === 'root') return 'rgba(167,139,250,0.34)'
    if (mark === 'left') return 'rgba(56,189,248,0.3)'
    if (mark === 'leaf') return 'rgba(16,185,129,0.3)'
    if (mark === 'right') return 'rgba(249,115,22,0.3)'
    return 'var(--surface3, #21213a)'
  }

  const primaryPanel = (
    <div className="p545-panel-primary">
      <div className="p545-card">
        <div className="p545-section-label">Tree (level order)</div>
        <input
          className={`p545-input mono ${inputError ? 'has-error' : ''}`}
          value={text}
          onChange={(e) => { setText(e.target.value); handleReset() }}
          placeholder="1,null,2,3,4"
        />
        <p className={`p545-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Use null for missing children, LeetCode style.'}
        </p>
        <div className="p545-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p545-example-btn ${text === ex.text ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p545-card">
        <div className="p545-section-label">Tree</div>
        <SvgViewport width={400} height={300}>
          {edges.map(([a, b]) => {
            const pa = layout.get(a)
            const pb = layout.get(b)
            if (!pa || !pb) return null
            return (
              <line
                key={`${a}-${b}`}
                x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke="var(--border)"
                strokeWidth="1.5"
              />
            )
          })}
          {[...layout.entries()].map(([id, p]) => {
            const mark = step?.marks?.get(id)
            const isCursor = step?.cursor === id
            return (
              <g key={id}>
                <circle
                  cx={p.x} cy={p.y} r="16"
                  fill={markFill(mark)}
                  stroke={isCursor ? 'var(--accent-400, #fbbf24)' : mark ? 'var(--primary, #6366f1)' : 'var(--border)'}
                  strokeWidth={isCursor ? 3 : 1.5}
                />
                <text
                  x={p.x} y={p.y + 4}
                  textAnchor="middle" fontSize="11" fontWeight="700"
                  fill="var(--text)"
                >
                  {p.node.val}
                </text>
              </g>
            )
          })}
        </SvgViewport>
        <div className="p545-legend">
          <span><i className="p545-swatch root" /> root</span>
          <span><i className="p545-swatch left" /> left boundary</span>
          <span><i className="p545-swatch leaf" /> leaves</span>
          <span><i className="p545-swatch right" /> right boundary</span>
        </div>
      </div>
    </div>
  )

  const statePanel = (
    <div className="p545-panel-state">
      <div className="p545-card">
        <div className="p545-section-label">boundary[] (root + left + leaves)</div>
        {step?.boundary?.length ? (
          <div className="p545-row">
            {step.boundary.map((v, idx) => (
              <div key={idx} className="p545-chip">{v}</div>
            ))}
          </div>
        ) : (
          <p className="p545-hint">Empty — press Play or Step to begin.</p>
        )}
      </div>

      {step?.rightList && (
        <div className="p545-card">
          <div className="p545-section-label">right[] (collected top-down)</div>
          <div className="p545-row">
            {step.rightList.length === 0
              ? <p className="p545-hint">Empty.</p>
              : step.rightList.map((v, idx) => (
                <div key={idx} className="p545-chip right">{v}</div>
              ))}
          </div>
          {step.reversedList && (
            <>
              <div className="p545-section-label" style={{ margin: '0.8rem 0 0.5rem' }}>
                reversed
              </div>
              <div className="p545-row">
                {step.reversedList.map((v, idx) => (
                  <div key={idx} className="p545-chip right">{v}</div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step?.result && (
        <div className="p545-result">
          <div className="p545-section-label" style={{ marginBottom: '0.3rem' }}>Boundary</div>
          <div className="p545-result-val mono">[{step.result.join(', ')}]</div>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p545-panel-code">
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
    <div className="p545-panel-status">
      <div className={`p545-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p545-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
