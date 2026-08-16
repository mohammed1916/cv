import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
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
  const [timesInput, setTimesInput] = useState(JSON.stringify(EXAMPLES[0].times))
  const [nInput, setNInput] = useState(String(EXAMPLES[0].n))
  const [kInput, setKInput] = useState(String(EXAMPLES[0].k))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0].label)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { n, k, times, inputError } = useMemo(() => {
    const fallback = { n: 1, k: 1, times: [] }
    try {
      const parsedN = JSON.parse(nInput)
      if (!Number.isInteger(parsedN) || parsedN < 1) throw new Error('n must be an integer >= 1')

      const parsedK = JSON.parse(kInput)
      if (!Number.isInteger(parsedK) || parsedK < 1 || parsedK > parsedN) {
        throw new Error(`k must be an integer in 1..${parsedN}`)
      }

      const parsedTimes = JSON.parse(timesInput)
      if (!Array.isArray(parsedTimes)) throw new Error('times must be an array of [u, v, w]')
      parsedTimes.forEach((t) => {
        if (!Array.isArray(t) || t.length !== 3 || !t.every((v) => typeof v === 'number')) {
          throw new Error('each edge must be [u, v, w] numbers')
        }
        if (!Number.isInteger(t[0]) || t[0] < 1 || t[0] > parsedN || !Number.isInteger(t[1]) || t[1] < 1 || t[1] > parsedN) {
          throw new Error(`edge endpoints must be integers in 1..${parsedN}`)
        }
      })

      return { n: parsedN, k: parsedK, times: parsedTimes, inputError: '' }
    } catch (e) {
      return { ...fallback, inputError: e.message }
    }
  }, [nInput, kInput, timesInput])

  const steps = useMemo(() => generateSteps(n, k, times), [n, k, times])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] ?? null : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((example) => {
    setTimesInput(JSON.stringify(example.times))
    setNInput(String(example.n))
    setKInput(String(example.k))
    setActiveLabel(example.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'times') setTimesInput(text)
    else if (key === 'n') setNInput(text)
    else if (key === 'k') setKInput(text)
    setActiveLabel('')
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
    for (let i = 1; i <= n; i++) {
      positions[i] = getNodePosition(i, n)
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
            <polygon points="0 0, 10 3, 0 6" fill="var(--text-muted)" />
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
        {times.map((time, idx) => {
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
                stroke={isRelaxing ? '#0ea5e9' : 'var(--border)'}
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
                fill="var(--text-muted)"
              >
                {w}
              </text>
            </g>
          )
        })}

        {/* Nodes */}
        {Array.from({ length: n }, (_, i) => i + 1).map((node) => {
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
                fill={isCurrent ? '#0ea5e9' : isVisited ? '#86efac' : 'var(--surface2)'}
                stroke={isCurrent ? '#0284c7' : isVisited ? '#22c55e' : 'var(--border)'}
                strokeWidth={2}
                animate={{ scale: isCurrent ? 1.2 : 1 }}
              />
              <text
                x={pos.x}
                y={pos.y + 6}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill={isCurrent || isVisited ? '#fff' : 'var(--surface2)'}
              >
                {node}
              </text>
              <text
                x={pos.x}
                y={pos.y + 42}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--text-muted)"
              >
                d:{distance === Infinity ? '∞' : distance}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  )

  const vizPanel = (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <ManualInputPanel
            fields={[
              { key: 'times', label: 'times', type: 'array' },
              { key: 'n', label: 'n', type: 'number' },
              { key: 'k', label: 'k', type: 'number' },
            ]}
            values={{ times: timesInput, n: nInput, k: kInput }}
            onChange={handleFieldChange}
            examples={EXAMPLES}
            activeLabel={activeLabel}
            applyExample={applyExample}
            inputError={inputError}
          />

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
                {step.message}
              </div>

              <div style={{ borderRadius: 6, overflow: 'hidden' }}>
                {renderGraphVisualization()}
              </div>

              <div style={{ padding: 8, backgroundColor: 'var(--surface2)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--code-bg)' }}>Distances:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({ length: n }, (_, i) => i + 1).map((node) => {
                    const dist = step.dist[node]
                    const isVisited = step.visited.has(node)
                    return (
                      <motion.div
                        key={node}
                        animate={{ scale: step.currentNode === node ? 1.1 : 1 }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 4,
                          border: '1px solid var(--border)',
                          backgroundColor: isVisited ? '#d1fae5' : 'var(--text)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--code-bg)',
                        }}
                      >
                        {node}: {dist === Infinity ? '∞' : dist}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: 'var(--surface2)', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--code-bg)' }}>Heap:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {step.heap.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>Empty</span>
                  ) : (
                    step.heap.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 3,
                          border: '1px solid var(--border)',
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
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔗 Dijkstra Visualization', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
