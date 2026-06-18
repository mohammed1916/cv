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
import './NetworkDelayTime.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def networkDelayTime(times, n, k):' },
  { line: 2, text: '    graph = defaultdict(list)' },
  { line: 3, text: '    for u, v, w in times:' },
  { line: 4, text: '        graph[u].append((v, w))' },
  { line: 5, text: '    dist = {i: float("inf") for i in range(1, n + 1)}' },
  { line: 6, text: '    dist[k] = 0' },
  { line: 7, text: '    heap = [(0, k)]' },
  { line: 8, text: '    while heap:' },
  { line: 9, text: '        d, u = heappop(heap)' },
  { line: 10, text: '        if d > dist[u]: continue' },
  { line: 11, text: '        for v, w in graph[u]:' },
  { line: 12, text: '            if dist[u] + w < dist[v]:' },
  { line: 13, text: '                dist[v] = dist[u] + w' },
  { line: 14, text: '                heappush(heap, (dist[v], v))' },
  { line: 15, text: '    return max(dist.values())' },
]

function generateSteps(n, k, times) {
  const steps = []
  const graph = {}
  for (let i = 1; i <= n; i++) {
    graph[i] = []
  }
  times.forEach(([u, v, w]) => {
    graph[u].push([v, w])
  })

  // Initialize distances
  const dist = {}
  for (let i = 1; i <= n; i++) {
    dist[i] = Infinity
  }
  dist[k] = 0

  steps.push({
    activeLine: 5,
    dist: { ...dist },
    heap: [],
    visited: new Set(),
    currentNode: null,
    relaxingEdge: null,
    message: `Initialize: source node ${k} has distance 0, all others ∞`,
  })

  const heap = [[0, k]]
  steps.push({
    activeLine: 7,
    dist: { ...dist },
    heap: [...heap],
    visited: new Set(),
    currentNode: null,
    relaxingEdge: null,
    message: `Push (0, ${k}) to heap`,
  })

  const visited = new Set()
  while (heap.length > 0) {
    heap.sort((a, b) => a[0] - b[0])
    const [d, u] = heap.shift()

    if (d > dist[u]) {
      continue
    }

    if (!visited.has(u)) {
      visited.add(u)
      steps.push({
        activeLine: 9,
        dist: { ...dist },
        heap: [...heap],
        visited: new Set(visited),
        currentNode: u,
        relaxingEdge: null,
        message: `Pop (${d}, ${u}) from heap. Process node ${u}`,
      })

      for (const [v, w] of graph[u]) {
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w
          heap.push([dist[v], v])

          steps.push({
            activeLine: 12,
            dist: { ...dist },
            heap: [...heap],
            visited: new Set(visited),
            currentNode: u,
            relaxingEdge: [u, v],
            message: `Relax edge ${u}→${v} (${dist[u]} + ${w} = ${dist[v]})`,
          })
        }
      }
    }
  }

  const maxDist = Math.max(...Object.values(dist))
  steps.push({
    activeLine: 15,
    dist: { ...dist },
    heap: [],
    visited: new Set(visited),
    currentNode: null,
    relaxingEdge: null,
    result: maxDist === Infinity ? -1 : maxDist,
    message: `Complete. Max distance: ${maxDist === Infinity ? -1 : maxDist}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    n: 4,
    k: 2,
    times: [[2, 1, 1], [2, 3, 1], [3, 4, 1]],
  },
  {
    label: 'Example 2',
    n: 2,
    k: 1,
    times: [[1, 2, 1]],
  },
  {
    label: 'Example 3',
    n: 4,
    k: 1,
    times: [[1, 2, 1], [1, 4, 4], [2, 3, 2], [3, 4, 1]],
  },
]

export default function NetworkDelayTimeVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.n, ex.k, ex.times), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const getNodePosition = (node, n) => {
    const angle = (node - 1) * (2 * Math.PI / n)
    const radius = 80
    const cx = 150
    const cy = 120
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const renderGraphVisualization = () => {
    if (!step) return null

    const positions = {}
    for (let i = 1; i <= ex.n; i++) {
      positions[i] = getNodePosition(i, ex.n)
    }

    return (
      <svg viewBox="0 0 300 240" style={{ width: '100%', height: 240 }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#64748b" />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#0ea5e9" />
          </marker>
        </defs>

        {/* Edges */}
        {ex.times.map((time, idx) => {
          const [u, v, w] = time
          const pos1 = positions[u]
          const pos2 = positions[v]
          const isRelaxing = step.relaxingEdge && step.relaxingEdge[0] === u && step.relaxingEdge[1] === v

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke={isRelaxing ? '#0ea5e9' : '#cbd5e1'}
                strokeWidth={isRelaxing ? 3 : 2}
                markerEnd={isRelaxing ? 'url(#arrowhead-highlight)' : 'url(#arrowhead)'}
                opacity={isRelaxing ? 1 : 0.7}
              />
              <text
                x={(pos1.x + pos2.x) / 2}
                y={(pos1.y + pos2.y) / 2 - 8}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#475569"
              >
                {w}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {Array.from({ length: ex.n }, (_, i) => i + 1).map((node) => {
          const pos = positions[node]
          const isVisited = step.visited.has(node)
          const isCurrent = step.currentNode === node
          const distance = step.dist[node]

          return (
            <g key={`node-${node}`}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={24}
                fill={isCurrent ? '#0ea5e9' : isVisited ? '#86efac' : '#f1f5f9'}
                stroke={isCurrent ? '#0284c7' : isVisited ? '#22c55e' : '#cbd5e1'}
                strokeWidth={2}
                animate={{ scale: isCurrent ? 1.2 : 1 }}
              />
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={isCurrent || isVisited ? '#fff' : '#1e293b'}
              >
                {node}
              </text>
              <text
                x={pos.x}
                y={pos.y + 42}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#475569"
              >
                d:{distance === Infinity ? '∞' : distance}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

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
      title: '🔗 Dijkstra Visualization',
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
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                {step.message}
              </div>

              <div style={{ borderRadius: 6, overflow: 'hidden' }}>
                {renderGraphVisualization()}
              </div>

              <div style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#0f172a' }}>Distances:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({ length: ex.n }, (_, i) => i + 1).map((node) => {
                    const dist = step.dist[node]
                    const isVisited = step.visited.has(node)
                    return (
                      <motion.div
                        key={node}
                        animate={{ scale: step.currentNode === node ? 1.1 : 1 }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: '1px solid #cbd5e1',
                          backgroundColor: isVisited ? '#d1fae5' : '#e2e8f0',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#0f172a',
                        }}
                      >
                        {node}: {dist === Infinity ? '∞' : dist}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#f1f5f9', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#0f172a' }}>Heap:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {step.heap.length === 0 ? (
                    <span style={{ color: '#64748b', fontSize: 10 }}>Empty</span>
                  ) : (
                    step.heap.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 3,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#fff',
                          fontSize: 10,
                          fontFamily: 'monospace',
                        }}
                      >
                        ({item[0]},{item[1]})
                      </div>
                    ))
                  )}
                </div>
              </div>

              {step.result !== undefined && (
                <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#0c4a6e', textAlign: 'center' }}>
                  Result: {step.result}
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.n])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} title="Network Delay Time (LC 743)" />
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
