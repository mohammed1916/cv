import { Fragment, useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import SvgViewport from '../../components/shared/SvgViewport'
import './Problem399Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['build_edge', 'dfs_end', 'dfs_start', 'done', 'error', 'init', 'query_invalid', 'query_start']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  6: 'build_edge',
  9: 'dfs_start',
  21: 'query_start',
  22: 'query_invalid',
  25: 'dfs_end',
  26: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def calcEquation(equations, values, queries):' },
  { line: 2, text: '    from collections import defaultdict' },
  { line: 3, text: '    graph = defaultdict(list)' },
  { line: 4, text: '    ' },
  { line: 5, text: '    for (a, b), val in zip(equations, values):' },
  { line: 6, text: '        graph[a].append((b, val))' },
  { line: 7, text: '        graph[b].append((a, 1/val))' },
  { line: 8, text: '    ' },
  { line: 9, text: '    def dfs(start, end, visited):' },
  { line: 10, text: '        if start == end:' },
  { line: 11, text: '            return 1.0' },
  { line: 12, text: '        visited.add(start)' },
  { line: 13, text: '        for neighbor, weight in graph[start]:' },
  { line: 14, text: '            if neighbor not in visited:' },
  { line: 15, text: '                result = dfs(neighbor, end, visited)' },
  { line: 16, text: '            if result > 0:' },
  { line: 17, text: '                return result * weight' },
  { line: 18, text: '        return -1.0' },
  { line: 19, text: '    ' },
  { line: 20, text: '    results = []' },
  { line: 21, text: '    for num, den in queries:' },
  { line: 22, text: '        if num not in graph or den not in graph:' },
  { line: 23, text: '            results.append(-1)' },
  { line: 24, text: '        else:' },
  { line: 25, text: '            results.append(dfs(num, den, set()))' },
  { line: 26, text: '    return results' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(equationsStr, valuesStr, queryStr) {
  const steps = []

  try {
    const equations = JSON.parse(equationsStr)
    const values = JSON.parse(valuesStr)
    const query = JSON.parse(queryStr)

    if (!Array.isArray(equations) || !Array.isArray(values) || !Array.isArray(query)) {
      throw new Error('All inputs must be arrays')
    }

    // Build graph
    const graph = {}
    equations.forEach(([a, b], idx) => {
      if (!graph[a]) graph[a] = []
      if (!graph[b]) graph[b] = []
      const val = values[idx]
      graph[a].push({ neighbor: b, weight: val })
      graph[b].push({ neighbor: a, weight: 1 / val })
    })

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Build graph from ${equations.length} equations`,
      graph,
      nodes: Object.keys(graph),
    })

    equations.forEach(([a, b], idx) => {
      const val = values[idx]
      steps.push({
        phase: 'build_edge',
        activeLine: 6,
        message: `Add edge: ${a} -> ${b} (weight: ${val}), ${b} -> ${a} (weight: ${(1/val).toFixed(4)})`,
        graph,
        nodes: Object.keys(graph),
        currentEdge: { a, b, val },
      })
    })

    // Process queries
    const results = []
    query.forEach(([num, den]) => {
      steps.push({
        phase: 'query_start',
        activeLine: 21,
        message: `Query: ${num} / ${den}`,
        graph,
        nodes: Object.keys(graph),
        currentQuery: { num, den },
      })

      if (!graph[num] || !graph[den]) {
        results.push(-1)
        steps.push({
          phase: 'query_invalid',
          activeLine: 22,
          message: `${!graph[num] ? num : den} not in graph. Result: -1`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          result: -1,
        })
      } else {
        // Simulate DFS
        let foundPath = false
        let pathResult = -1
        const visitedInDFS = new Set()
        const path = []

        // Simple DFS simulation
        function dfsSimulate(start, end, visited, currentWeight) {
          if (start === end) {
            path.push(start)
            foundPath = true
            pathResult = currentWeight
            return currentWeight
          }
          visited.add(start)
          path.push(start)

          for (const edge of graph[start]) {
            if (!visited.has(edge.neighbor)) {
              const result = dfsSimulate(edge.neighbor, end, visited, currentWeight * edge.weight)
              if (foundPath) return result
            }
          }
          path.pop()
          return -1
        }

        steps.push({
          phase: 'dfs_start',
          activeLine: 9,
          message: `Start DFS from ${num} to ${den}`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          visited: visitedInDFS,
        })

        dfsSimulate(num, den, visitedInDFS, 1.0)

        results.push(foundPath ? pathResult : -1)
        steps.push({
          phase: 'dfs_end',
          activeLine: 25,
          message: `DFS complete. Path: ${foundPath ? path.join(' -> ') : 'Not found'}. Result: ${foundPath ? pathResult.toFixed(4) : -1}`,
          graph,
          nodes: Object.keys(graph),
          currentQuery: { num, den },
          path: foundPath ? path : [],
          result: foundPath ? pathResult : -1,
        })
      }
    })

    steps.push({
      phase: 'done',
      activeLine: 26,
      message: `All queries processed. Results: [${results.map(r => r === -1 ? -1 : r.toFixed(4)).join(', ')}]`,
      graph,
      nodes: Object.keys(graph),
      allResults: results,
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

const EXAMPLES = getExamplesOr('evaluate-division', [
  { label: 'Example 1', equations: '[["a","b"],["b","c"]]', values: '[2.0,3.0]', query: '[["a","c"],["b","a"],["a","e"]]' },
  { label: 'Example 2', equations: '[["a","b"],["b","c"],["bc","cd"]]', values: '[1.5,2.5,5.0]', query: '[["a","c"],["c","b"],["bc","cd"],["cd","bc"]]' },
])

export default function Problem399Visualizer() {
  const [equationsInput, setEquationsInput] = useState('[["a","b"],["b","c"]]')
  const [valuesInput, setValuesInput] = useState('[2.0,3.0]')
  const [queryInput, setQueryInput] = useState('[["a","c"],["b","a"],["a","e"]]')
  const [panelDivs, setPanelDivs] = useState(null)

  // Only the error message is consumed — generateSteps re-parses the raw input
  // strings itself, so the parsed arrays aren't needed here.
  const { inputError } = useMemo(() => {
    try {
      const eqs = JSON.parse(equationsInput)
      const vals = JSON.parse(valuesInput)
      const q = JSON.parse(queryInput)
      if (!Array.isArray(eqs) || !Array.isArray(vals) || !Array.isArray(q)) {
        throw new Error('All inputs must be arrays')
      }
      return { inputError: '' }
    } catch (e) {
      return {
        inputError: e.message || 'Invalid input'
      }
    }
  }, [equationsInput, valuesInput, queryInput])

  const steps = useMemo(
    () => generateSteps(equationsInput, valuesInput, queryInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [equationsInput, valuesInput, queryInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setEquationsInput(ex.equations)
    setValuesInput(ex.values)
    setQueryInput(ex.query)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  /* ── Graph layout ─────────────────────────────────────────────
     Nodes are placed on a circle so the layout is deterministic and stable
     across steps (a force simulation would jitter as steps advance). Positions
     are keyed off the node list, which only changes when the equations do. */
  const nodes = step?.nodes ?? []
  // Join into a plain string first: the lint config only accepts simple
  // expressions in a dependency array, and this keeps the layout stable unless
  // the node set itself changes.
  const nodesKey = nodes.join(',')
  const layout = useMemo(() => {
    const names = nodesKey ? nodesKey.split(',') : []
    const pos = {}
    const cx = 200
    const cy = 150
    const r = names.length <= 1 ? 0 : Math.min(110, 42 + names.length * 9)
    names.forEach((name, i) => {
      const angle = (i / Math.max(1, names.length)) * Math.PI * 2 - Math.PI / 2
      pos[name] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
    })
    return pos
  }, [nodesKey])

  // Undirected edge list (the graph stores both directions; draw each pair once).
  const edges = useMemo(() => {
    const graph = step?.graph
    if (!graph) return []
    const seen = new Set()
    const out = []
    for (const from of Object.keys(graph)) {
      for (const e of graph[from] ?? []) {
        const key = [from, e.neighbor].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        out.push({ from, to: e.neighbor, weight: e.weight })
      }
    }
    return out
  }, [step?.graph])

  const path = step?.path ?? []
  const pathKey = path.join(',')
  const pathPairs = useMemo(() => {
    const seq = pathKey ? pathKey.split(',') : []
    const s = new Set()
    for (let i = 0; i < seq.length - 1; i++) {
      s.add([seq[i], seq[i + 1]].sort().join('|'))
    }
    return s
  }, [pathKey])

  const visitedSet = useMemo(() => {
    const v = step?.visited
    return v instanceof Set ? v : new Set(Array.isArray(v) ? v : [])
  }, [step?.visited])

  const activeEdgeKey = step?.currentEdge
    ? [step.currentEdge.a, step.currentEdge.b].sort().join('|')
    : null

  const nodeClass = (name) => {
    const cls = ['p399-node']
    if (step?.currentQuery?.num === name) cls.push('query-num')
    else if (step?.currentQuery?.den === name) cls.push('query-den')
    else if (path.includes(name)) cls.push('on-path')
    else if (visitedSet.has(name)) cls.push('visited')
    return cls.join(' ')
  }

  /* ── Panels ───────────────────────────────────────────────── */
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"equations","label":"equations","type":"array"},{"key":"values","label":"values","type":"array"},{"key":"query","label":"query","type":"array"}]}
        values={{ equations: equationsInput, values: valuesInput, query: queryInput }}
        onChange={(k, v) => { if (k === 'equations') setEquationsInput(v); if (k === 'values') setValuesInput(v); if (k === 'query') setQueryInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <div className="p399-panel-primary">
      <div className="p399-card">
        <div className="p399-section-label">Equations Graph</div>
        <div className="p399-graph-wrap">
          <SvgViewport width={400} height={300} className="p399-viewport">
            {edges.map(({ from, to, weight }) => {
              const a = layout[from]
              const b = layout[to]
              if (!a || !b) return null
              const key = [from, to].sort().join('|')
              const cls = [
                'p399-edge',
                key === activeEdgeKey ? 'active' : '',
                pathPairs.has(key) ? 'on-path' : '',
              ].join(' ')
              return (
                <g key={key}>
                  <line className={cls} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                  <text
                    className={`p399-edge-label ${key === activeEdgeKey ? 'active' : ''}`}
                    x={(a.x + b.x) / 2}
                    y={(a.y + b.y) / 2 - 3}
                    textAnchor="middle"
                  >
                    {Number(weight).toFixed(2)}
                  </text>
                </g>
              )
            })}
            {nodes.map((name) => {
              const p = layout[name]
              if (!p) return null
              return (
                <motion.g
                  key={name}
                  className={nodeClass(name)}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                >
                  <circle cx={p.x} cy={p.y} r="17" />
                  <text x={p.x} y={p.y}>{name}</text>
                </motion.g>
              )
            })}
          </SvgViewport>
        </div>
        <div className="p399-legend">
          <span className="p399-legend-item"><span className="p399-swatch num" />numerator</span>
          <span className="p399-legend-item"><span className="p399-swatch den" />denominator</span>
          <span className="p399-legend-item"><span className="p399-swatch path" />path</span>
          <span className="p399-legend-item"><span className="p399-swatch visited" />visited</span>
        </div>
      </div>

      <div className="p399-card">
        <div className="p399-section-label">Input</div>
        <div className="p399-field-grid">
          <div className="p399-field">
            <label className="p399-input-label" htmlFor="p399-eq">equations</label>
            <input
              id="p399-eq"
              className={`p399-input ${inputError ? 'has-error' : ''}`}
              value={equationsInput}
              onChange={(e) => { setEquationsInput(e.target.value); handleReset() }}
            />
          </div>
          <div className="p399-field">
            <label className="p399-input-label" htmlFor="p399-vals">values</label>
            <input
              id="p399-vals"
              className={`p399-input ${inputError ? 'has-error' : ''}`}
              value={valuesInput}
              onChange={(e) => { setValuesInput(e.target.value); handleReset() }}
            />
          </div>
          <div className="p399-field">
            <label className="p399-input-label" htmlFor="p399-q">queries</label>
            <input
              id="p399-q"
              className={`p399-input ${inputError ? 'has-error' : ''}`}
              value={queryInput}
              onChange={(e) => { setQueryInput(e.target.value); handleReset() }}
            />
          </div>
        </div>
        <p className={`p399-hint ${inputError ? 'error' : ''}`} style={{ marginTop: '0.6rem' }}>
          {inputError || 'Each equation a/b = value becomes edges a→b (value) and b→a (1/value).'}
        </p>
        <div className="p399-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className="p399-example-btn"
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p399-result">
          <div className="p399-section-label" style={{ marginBottom: '0.3rem' }}>Query Result</div>
          <div className="p399-result-val">
            {typeof step.result === 'number' ? step.result.toFixed(4) : String(step.result)}
          </div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p399-panel-state">
      <div className="p399-card">
        <div className="p399-section-label">Query</div>
        {step?.currentQuery ? (
            <div className="p399-stat highlight">
              <span className="p399-stat-key">numerator</span>
              <span className="p399-stat-val">{step.currentQuery.num}</span>
            </div>
            <div className="p399-stat">
              <span className="p399-stat-key">denominator</span>
              <span className="p399-stat-val">{step.currentQuery.den}</span>
            </div>
          </>
        ) : (
          <p className="p399-hint">No active query.</p>
        )}
        {step?.currentEdge && (
          <div className="p399-stat" style={{ marginTop: '0.4rem' }}>
            <span className="p399-stat-key">adding edge</span>
            <span className="p399-stat-val">
              {step.currentEdge.a}/{step.currentEdge.b} = {step.currentEdge.val}
            </span>
          </div>
        )}
      </div>

      {path.length > 0 && (
        <div className="p399-card">
          <div className="p399-section-label">DFS Path</div>
          <div className="p399-path-chips">
            {path.map((nodeName, i) => (
              <Fragment key={`${nodeName}-${i}`}>
                {i > 0 && <span className="p399-path-arrow">→</span>}
                <span className="p399-path-chip">{nodeName}</span>
              </Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="p399-card">
        <div className="p399-section-label">Adjacency List</div>
        <div className="p399-adj-list">
          {nodes.length === 0 && <p className="p399-hint">Graph not built yet.</p>}
          {nodes.map((name) => (
            <div className="p399-adj-row" key={name}>
              <span className="p399-adj-node">{name}</span>
              {' → '}
              {(step?.graph?.[name] ?? [])
                .map((e) => `${e.neighbor} (${Number(e.weight).toFixed(2)})`)
                .join(', ') || '—'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p399-panel-code">
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
    <div className="p399-panel-status">
      <div className={`p399-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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
      { id: 'primary', title: 'Graph',  dockMode: 'split-right' },
      { id: 'state',   title: 'State',  dockMode: 'split-right' },
      { id: 'code',    title: 'Code',   dockMode: 'split-bottom' },
      { id: 'status',  title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  return (
    <div className="p399-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
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
