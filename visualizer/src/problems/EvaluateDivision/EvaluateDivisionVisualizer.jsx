import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './EvaluateDivision.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def calcEquation(equations, values, queries):' },
  { line: 2, text: '    graph = build_graph(equations, values)' },
  { line: 3, text: '    results = []' },
  { line: 4, text: '    for query in queries:' },
  { line: 5, text: '        visited = set()' },
  { line: 6, text: '        result = dfs(query[0], query[1], graph, visited, 1)' },
  { line: 7, text: '        results.append(result)' },
  { line: 8, text: '    return results' },
  { line: 9, text: 'def dfs(current, target, graph, visited, product):' },
  { line: 10, text: '    if current == target: return product' },
  { line: 11, text: '    visited.add(current)' },
  { line: 12, text: '    for neighbor, weight in graph[current]:' },
]

function generateSteps(equations, values, queries) {
  const steps = []
  const graph = {}

  // Build graph
  equations.forEach((eq, idx) => {
    const [u, v] = eq
    const val = values[idx]
    if (!graph[u]) graph[u] = []
    if (!graph[v]) graph[v] = []
    graph[u].push([v, val])
    graph[v].push([u, 1 / val])
  })

  steps.push({
    activeLine: 2,
    type: 'init',
    graph: { ...graph },
    query: null,
    queryIndex: -1,
    visited: new Set(),
    path: [],
    product: 1,
    results: [],
    highlightedEdge: null,
    message: `Graph built: ${equations.length} equations, ${Object.keys(graph).length} nodes.`,
  })

  let allResults = []

  queries.forEach((query, qIdx) => {
    const [x, y] = query

    steps.push({
      activeLine: 4,
      type: 'query_start',
      graph: { ...graph },
      query: [...query],
      queryIndex: qIdx,
      visited: new Set(),
      path: [],
      product: 1,
      results: [...allResults],
      highlightedEdge: null,
      message: `Starting query: ${x}/${y}`,
    })

    const visited = new Set()
    let found = false
    let finalProduct = -1

    const dfsPath = []
    const dfsVisit = (current, target, product) => {
      visited.add(current)
      dfsPath.push(current)

      steps.push({
        activeLine: 9,
        type: 'dfs_visit',
        graph: { ...graph },
        query: [...query],
        queryIndex: qIdx,
        visited: new Set(visited),
        path: [...dfsPath],
        product: product,
        results: [...allResults],
        highlightedEdge: null,
        message: `DFS visit: ${current}`,
      })

      if (current === target) {
        found = true
        finalProduct = product
        steps.push({
          activeLine: 10,
          type: 'found',
          graph: { ...graph },
          query: [...query],
          queryIndex: qIdx,
          visited: new Set(visited),
          path: [...dfsPath],
          product: product,
          results: [...allResults],
          highlightedEdge: null,
          message: `Found target! Result: ${product.toFixed(5)}`,
        })
        return
      }

      if (graph[current]) {
        for (const [next, weight] of graph[current]) {
          if (!visited.has(next)) {
            steps.push({
              activeLine: 12,
              type: 'edge_check',
              graph: { ...graph },
              query: [...query],
              queryIndex: qIdx,
              visited: new Set(visited),
              path: [...dfsPath],
              product: product,
              results: [...allResults],
              highlightedEdge: [current, next],
              message: `Exploring: ${current} → ${next} (weight: ${weight.toFixed(2)})`,
            })

            const newProduct = product * weight
            dfsVisit(next, target, newProduct)

            if (found) return
          }
        }
      }
    }

    dfsVisit(x, y, 1)
    allResults.push(found ? finalProduct : -1)

    steps.push({
      activeLine: 6,
      type: 'query_complete',
      graph: { ...graph },
      query: [...query],
      queryIndex: qIdx,
      visited: new Set(),
      path: [],
      product: 1,
      results: [...allResults],
      highlightedEdge: null,
      message: `Query complete. Result: ${found ? finalProduct.toFixed(5) : -1}`,
    })
  })

  steps.push({
    activeLine: 8,
    type: 'complete',
    graph: { ...graph },
    query: null,
    queryIndex: -1,
    visited: new Set(),
    path: [],
    product: 1,
    results: [...allResults],
    highlightedEdge: null,
    message: `All queries processed.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    equations: [['a', 'b'], ['b', 'c']],
    values: [2, 3],
    queries: [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'b']],
  },
  {
    label: 'Example 2',
    equations: [['a', 'b'], ['b', 'c'], ['c', 'd']],
    values: [2, 3, 4],
    queries: [['a', 'd'], ['d', 'a'], ['b', 'b']],
  },
]

function getNodePosition(node) {
  const positions = {
    a: { x: 80, y: 150 },
    b: { x: 200, y: 80 },
    c: { x: 200, y: 220 },
    d: { x: 320, y: 150 },
    e: { x: 320, y: 150 },
  }
  return positions[node] || { x: 150, y: 150 }
}

export default function EvaluateDivisionVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const SOLUTION_CODE_HOOK = useSolutionCode('evaluate-division')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.equations, ex.values, ex.queries), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
    {
      id: 'viz',
      title: '🔍 DFS Graph Exploration',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <svg style={{ width: '100%', height: 280, border: '1px solid #e2e8f0', borderRadius: 6, backgroundColor: '#fafbfc' }} viewBox="0 0 400 300">
                {Object.entries(step.graph).map(([from, edges]) =>
                  edges.map((edge, idx) => {
                    const [to, weight] = edge
                    const posFrom = getNodePosition(from)
                    const posTo = getNodePosition(to)
                    const isHighlighted = step.highlightedEdge && (
                      (step.highlightedEdge[0] === from && step.highlightedEdge[1] === to) ||
                      (step.highlightedEdge[0] === to && step.highlightedEdge[1] === from)
                    )

                    return (
                      <motion.g key={`edge-${from}-${to}-${idx}`}>
                        <line
                          x1={posFrom.x}
                          y1={posFrom.y}
                          x2={posTo.x}
                          y2={posTo.y}
                          stroke={isHighlighted ? '#0ea5e9' : '#cbd5e1'}
                          strokeWidth={isHighlighted ? 3 : 2}
                          animate={{ strokeWidth: isHighlighted ? 3 : 2 }}
                        />
                        <text
                          x={(posFrom.x + posTo.x) / 2}
                          y={(posFrom.y + posTo.y) / 2 - 12}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight={isHighlighted ? 700 : 500}
                          fill={isHighlighted ? '#0ea5e9' : '#64748b'}
                        >
                          {weight.toFixed(2)}
                        </text>
                      </motion.g>
                    )
                  })
                )}

                {Object.keys(step.graph).map((node) => {
                  const pos = getNodePosition(node)
                  const isVisited = step.visited.has(node)
                  const isInPath = step.path.includes(node)
                  const isTarget = step.query?.[1] === node
                  const isStart = step.query?.[0] === node

                  return (
                    <motion.g key={`node-${node}`}>
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={28}
                        fill={isInPath ? '#0ea5e9' : isVisited ? '#dbeafe' : '#f1f5f9'}
                        stroke={isTarget ? '#dc2626' : isStart ? '#16a34a' : isVisited ? '#0284c7' : '#cbd5e1'}
                        strokeWidth={isInPath ? 3 : 2}
                        animate={{
                          r: isInPath ? 32 : 28,
                          strokeWidth: isInPath ? 3 : isVisited ? 2 : 1,
                        }}
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 6}
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fill="#1e293b"
                      >
                        {node}
                      </text>
                    </motion.g>
                  )
                })}
              </svg>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {step.path.length > 0 && (
                  <div style={{ padding: 8, backgroundColor: '#eff6ff', borderRadius: 6, border: '1px solid #0ea5e9', flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#0284c7', marginBottom: 6 }}>Path:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      {step.path.map((node, i) => (
                        <span key={i}>
                          <motion.span
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#0ea5e9',
                              color: '#fff',
                              borderRadius: 3,
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                            animate={{ scale: 1.05 }}
                          >
                            {node}
                          </motion.span>
                          {i < step.path.length - 1 && <span style={{ margin: '0 4px', color: '#94a3b8' }}>→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {step.product !== 1 && step.path.length > 0 && (
                  <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b', flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#d97706', marginBottom: 6 }}>Product:</div>
                    <motion.div
                      style={{ fontSize: 14, fontWeight: 700, color: '#d97706' }}
                      animate={{ scale: 1.05 }}
                    >
                      {step.product.toFixed(5)}
                    </motion.div>
                  </div>
                )}
              </div>

              {step.results.length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#ecfdf5', borderRadius: 6, border: '1px solid #10b981' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#059669', marginBottom: 6 }}>Results:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {step.results.map((res, i) => (
                      <motion.div
                        key={i}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: res === -1 ? '#fee2e2' : '#dcfce7',
                          color: res === -1 ? '#dc2626' : '#16a34a',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                        animate={{ scale: i === step.queryIndex ? 1.1 : 1 }}
                      >
                        Q{i + 1}: {res === -1 ? '-1' : res.toFixed(5)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, exIdx, applyExample])

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
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
