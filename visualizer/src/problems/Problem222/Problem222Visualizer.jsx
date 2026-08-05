import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
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
import './Problem222Visualizer.css'

const PATTERNS = ['init', 'measure', 'perfect', 'recurse', 'accumulate', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'measure',
  8: 'perfect',
  10: 'recurse',
  13: 'measure',
  17: 'measure',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def countNodes(root):' },
  { line: 2, text: '    if not root:' },
  { line: 3, text: '        return 0' },
  { line: 4, text: '    ' },
  { line: 5, text: '    lh = left_height(root)' },
  { line: 6, text: '    rh = right_height(root)' },
  { line: 7, text: '    ' },
  { line: 8, text: '    if lh == rh:            # perfect subtree' },
  { line: 9, text: '        return (1 << lh) - 1' },
  { line: 10, text: '    return 1 + countNodes(root.left) + countNodes(root.right)' },
  { line: 11, text: '' },
  { line: 12, text: 'def left_height(node):' },
  { line: 13, text: '    h = 0' },
  { line: 14, text: '    while node: h += 1; node = node.left' },
  { line: 15, text: '    return h' },
  { line: 16, text: '' },
  { line: 17, text: 'def right_height(node):' },
  { line: 18, text: '    h = 0' },
  { line: 19, text: '    while node: h += 1; node = node.right' },
  { line: 20, text: '    return h' },
]

/** Build a complete binary tree of `n` nodes as a 1-indexed level array. */
function buildComplete(n) {
  const nodes = []
  for (let i = 1; i <= n; i++) nodes.push(i)
  return nodes // value at level-order position i-1 has id i
}

function leftHeight(id, n) {
  let h = 0
  let cur = id
  while (cur <= n) { h += 1; cur *= 2 }
  return h
}

function rightHeight(id, n) {
  let h = 0
  let cur = id
  while (cur <= n) { h += 1; cur = cur * 2 + 1 }
  return h
}

function subtreeIds(id, n) {
  const out = []
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()
    if (cur > n) continue
    out.push(cur)
    stack.push(cur * 2, cur * 2 + 1)
  }
  return out
}

function generateSteps(nText) {
  const steps = []
  try {
    const n = Number(nText)
    if (!Number.isInteger(n) || n < 0) throw new Error('Node count must be a non-negative integer')
    if (n > 31) throw new Error('Use at most 31 nodes so the tree stays readable')

    const nodes = buildComplete(n)

    if (n === 0) {
      steps.push({
        phase: 'done', activeLine: 3, message: 'Empty tree → 0 nodes',
        n, nodes, visited: [], result: 0, calls: [],
      })
      return steps
    }

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Complete binary tree with ${n} nodes. Count without visiting every node.`,
      n, nodes, visited: [], calls: [], total: 0,
    })

    const visited = []
    const calls = []
    let total = 0

    const walk = (id, depth) => {
      if (id > n) {
        calls.push({ id, depth, kind: 'empty', note: 'null → 0' })
        steps.push({
          phase: 'recurse', activeLine: 3,
          message: `Node ${id} does not exist → contributes 0`,
          n, nodes, visited: [...visited], focus: null, calls: [...calls], total,
        })
        return 0
      }

      visited.push(id)
      const lh = leftHeight(id, n)
      const rh = rightHeight(id, n)

      steps.push({
        phase: 'measure', activeLine: 5,
        message: `At node ${id}: walk left spine → height ${lh}; walk right spine → height ${rh}`,
        n, nodes, visited: [...visited], focus: id, leftSpine: spine(id, n, 'left'),
        rightSpine: spine(id, n, 'right'), lh, rh, calls: [...calls], total, depth,
      })

      if (lh === rh) {
        const count = (1 << lh) - 1
        total += count
        calls.push({ id, depth, kind: 'perfect', note: `2^${lh} - 1 = ${count}` })
        steps.push({
          phase: 'perfect', activeLine: 9,
          message: `Heights equal (${lh}) → subtree at ${id} is perfect: 2^${lh} - 1 = ${count} nodes. No recursion needed.`,
          n, nodes, visited: [...visited], focus: id, perfectIds: subtreeIds(id, n),
          lh, rh, calls: [...calls], total, depth,
        })
        return count
      }

      calls.push({ id, depth, kind: 'split', note: `lh=${lh} ≠ rh=${rh} → recurse` })
      steps.push({
        phase: 'recurse', activeLine: 10,
        message: `Heights differ (${lh} vs ${rh}) at node ${id} → count 1 + left subtree + right subtree`,
        n, nodes, visited: [...visited], focus: id, lh, rh, calls: [...calls], total, depth,
      })

      total += 1
      const l = walk(id * 2, depth + 1)
      const r = walk(id * 2 + 1, depth + 1)
      return 1 + l + r
    }

    const result = walk(1, 0)

    steps.push({
      phase: 'done', activeLine: 10,
      message: `Total nodes = ${result} (visited only ${visited.length} node(s) — O(log²n))`,
      n, nodes, visited: [...visited], calls: [...calls], total: result, result,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, message: `Error: ${e.message}`, error: true })
  }
  return steps
}

function spine(id, n, dir) {
  const out = []
  let cur = id
  while (cur <= n) {
    out.push(cur)
    cur = dir === 'left' ? cur * 2 : cur * 2 + 1
  }
  return out
}

const EXAMPLES = getExamplesOr('count-complete-tree-nodes', [
  { label: 'Example 1', n: '6' },
  { label: 'Example 2', n: '1' },
  { label: 'Example 3', n: '13' },
])

export default function Problem222Visualizer() {
  const [nInput, setNInput] = useState('6')
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(
    () => generateSteps(nInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nInput],
  )

  const inputError = steps.length === 1 && steps[0].error ? steps[0].message : ''

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(ex.n)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const n = step?.n ?? 0

  /* Group node ids into tree levels for rendering. */
  const levels = useMemo(() => {
    const out = []
    let start = 1
    while (start <= n) {
      const row = []
      for (let id = start; id < start * 2 && id <= n; id++) row.push(id)
      out.push(row)
      start *= 2
    }
    return out
  }, [n])

  const primaryPanel = (
    <div className="p222-panel-primary">
      <div className="p222-card">
        <div className="p222-section-label">Input</div>
        <div className="p222-input-row">
          <div className="p222-field">
            <label className="p222-input-label" htmlFor="p222-n">Node count</label>
            <input
              id="p222-n"
              className={`p222-input mono ${inputError ? 'has-error' : ''}`}
              value={nInput}
              onChange={(e) => { setNInput(e.target.value); handleReset() }}
              placeholder="6"
              type="number"
              min="0"
              max="31"
            />
          </div>
        </div>
        <p className={`p222-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'A complete tree of this many nodes is built; the algorithm counts them in O(log²n).'}
        </p>
        <div className="p222-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p222-example-btn ${nInput === ex.n ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} (n={ex.n})
            </button>
          ))}
        </div>
      </div>

      <div className="p222-card">
        <div className="p222-section-label">Complete Binary Tree</div>
        <div className="p222-tree">
          {levels.map((row, li) => (
            <div className="p222-level" key={li}>
              {row.map((id) => {
                const cls = [
                  'p222-node',
                  step?.focus === id ? 'focus' : '',
                  step?.perfectIds?.includes(id) ? 'perfect' : '',
                  step?.leftSpine?.includes(id) ? 'left-spine' : '',
                  step?.rightSpine?.includes(id) ? 'right-spine' : '',
                  step?.visited?.includes(id) ? 'visited' : '',
                ].filter(Boolean).join(' ')
                return (
                  <motion.div
                    key={id}
                    className={cls}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: step?.focus === id ? 1.15 : 1 }}
                  >
                    {id}
                  </motion.div>
                )
              })}
            </div>
          ))}
          {levels.length === 0 && <p className="p222-hint">Empty tree.</p>}
        </div>
        <div className="p222-pointer-key">
          <span className="p222-key focus">current</span>
          <span className="p222-key left-spine">left spine</span>
          <span className="p222-key right-spine">right spine</span>
          <span className="p222-key perfect">perfect subtree</span>
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p222-result">
          <div className="p222-section-label" style={{ marginBottom: '0.3rem' }}>Node Count</div>
          <div className="p222-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p222-panel-state">
      <div className="p222-card">
        <div className="p222-section-label">Algorithm State</div>
        <div className="p222-stat-grid">
          <div className="p222-stat"><span className="p222-stat-key">node</span><span className="p222-stat-val">{step?.focus ?? '—'}</span></div>
          <div className="p222-stat highlight"><span className="p222-stat-key">left h</span><span className="p222-stat-val">{step?.lh ?? '—'}</span></div>
          <div className="p222-stat highlight"><span className="p222-stat-key">right h</span><span className="p222-stat-val">{step?.rh ?? '—'}</span></div>
          <div className="p222-stat"><span className="p222-stat-key">counted</span><span className="p222-stat-val">{step?.total ?? 0}</span></div>
          <div className="p222-stat"><span className="p222-stat-key">visited</span><span className="p222-stat-val">{step?.visited?.length ?? 0}</span></div>
          <div className="p222-stat"><span className="p222-stat-key">tree size</span><span className="p222-stat-val">{n}</span></div>
        </div>
      </div>

      <div className="p222-card">
        <div className="p222-section-label">Call Trace</div>
        {step?.calls?.length ? (
          <div className="p222-calls">
            {step.calls.map((c, i) => (
              <div key={i} className={`p222-call ${c.kind}`} style={{ marginLeft: `${c.depth * 12}px` }}>
                <span className="p222-call-id">countNodes({c.id})</span>
                <span className="p222-call-note">{c.note}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="p222-hint">No calls yet.</p>
        )}
      </div>

      <div className="p222-card">
        <div className="p222-section-label">Complexity</div>
        <p className="p222-hint">
          Each level of recursion measures two spines in O(log n) and only one child can be
          non-perfect, so at most O(log n) recursive calls run → O(log²n) total.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p222-panel-code">
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
    <div className="p222-panel-status">
      <div className={`p222-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    <div className="p222-shell">
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
