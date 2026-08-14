import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem407Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const EXAMPLES = getExamplesOr('trapping-rain-water-ii', [
  { label: 'Example', heightMap: [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]] },
])

const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def trapRainWater(heightMap):' },
  { line: 2, text: '    if not heightMap: return 0' },
  { line: 3, text: '    m, n = len(heightMap), len(heightMap[0])' },
  { line: 4, text: '    visited = set()' },
  { line: 5, text: '    heap = []' },
  { line: 6, text: '    for i in range(m):' },
  { line: 7, text: '        heap.append((heightMap[i][0], i, 0))' },
  { line: 8, text: '        heap.append((heightMap[i][n-1], i, n-1))' },
  { line: 9, text: '        visited.add((i, 0))' },
  { line: 10, text: '        visited.add((i, n-1))' },
  { line: 11, text: '    for j in range(n):' },
  { line: 12, text: '        if (0, j) not in visited:' },
  { line: 13, text: '            heap.append((heightMap[0][j], 0, j))' },
  { line: 14, text: '            visited.add((0, j))' },
  { line: 15, text: '        if (m-1, j) not in visited:' },
  { line: 16, text: '            heap.append((heightMap[m-1][j], m-1, j))' },
  { line: 17, text: '            visited.add((m-1, j))' },
  { line: 18, text: '    heapify(heap)' },
  { line: 19, text: '    water = 0' },
  { line: 20, text: '    while heap:' },
  { line: 21, text: '        h, x, y = heappop(heap)' },
  { line: 22, text: '        for dx, dy in [(0,1),(0,-1),(1,0),(-1,0)]:' },
  { line: 23, text: '            nx, ny = x+dx, y+dy' },
  { line: 24, text: '            if 0<=nx<m and 0<=ny<n and (nx,ny) not in visited:' },
]

function generateSteps(heightMap) {
  const steps = []

  if (!heightMap || heightMap.length === 0) {
    steps.push({ activeLine: 2, message: 'Empty map → return 0', done: true })
    return steps
  }

  steps.push({ activeLine: 2, message: 'Input valid, proceed with heap-based boundary expansion' })

  const m = heightMap.length
  const n = heightMap[0].length
  steps.push({ activeLine: 4, message: `Dimensions: ${m} rows × ${n} cols`, m, n })

  const visited = new Set()
  steps.push({ activeLine: 5, message: 'Initialize visited set for tracking processed cells' })

  const heap = []
  steps.push({ activeLine: 6, message: 'Initialize priority queue (heap)' })

  // Add top and bottom rows
  for (let i = 0; i < m; i++) {
    for (const j of [0, n - 1]) {
      if (i === 0) steps.push({ activeLine: 7, message: `Row loop: i=${i}` })
      steps.push({ activeLine: 8, message: `Add boundary j=${j}` })
      heap.push([heightMap[i][j], i, j])
      steps.push({ activeLine: 9, message: `Heap push: height=${heightMap[i][j]} at (${i},${j})` })
      visited.add(`${i},${j}`)
      steps.push({ activeLine: 10, message: `Mark (${i},${j}) visited` })
    }
  }

  // Add left and right columns
  for (let j = 0; j < n; j++) {
    for (const i of [0, m - 1]) {
      if (j === 0) steps.push({ activeLine: 11, message: `Col loop: j=${j}` })
      steps.push({ activeLine: 12, message: `Add boundary i=${i}` })
      if (!visited.has(`${i},${j}`)) {
        heap.push([heightMap[i][j], i, j])
        steps.push({ activeLine: 13, message: `Heap push: height=${heightMap[i][j]} at (${i},${j})` })
        visited.add(`${i},${j}`)
        steps.push({ activeLine: 14, message: `Mark (${i},${j}) visited` })
      }
    }
  }

  let water = 0
  steps.push({ activeLine: 15, message: `Water accumulated: ${water}` })

  // Simulate processing (limit for visualization)
  const limit = Math.min(12, (m * n) / 2)
  for (let iter = 0; iter < limit && heap.length > 0; iter++) {
    steps.push({ activeLine: 16, message: `Heap has ${heap.length} cells - continue processing` })

    // Simulate heap pop (simplified)
    const idx = heap.reduce((minIdx, h, i) => h[0] < heap[minIdx][0] ? i : minIdx, 0)
    const [h, x, y] = heap.splice(idx, 1)[0]
    steps.push({ activeLine: 17, message: `Pop: height=${h} at (${x},${y})` })

    const dirs = [[0,1],[0,-1],[1,0],[-1,0]]
    for (const [dx, dy] of dirs) {
      steps.push({ activeLine: 18, message: `Check direction [${dx},${dy}]` })
      const nx = x + dx, ny = y + dy
      steps.push({ activeLine: 19, message: `Neighbor: (${nx},${ny})` })

      if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited.has(`${nx},${ny}`)) {
        steps.push({ activeLine: 20, message: `Cell (${nx},${ny}) in bounds and unvisited` })
        const trapped = Math.max(0, h - heightMap[nx][ny])
        water += trapped
        steps.push({ activeLine: 21, message: `Water trapped: max(0, ${h} - ${heightMap[nx][ny]}) = ${trapped}. Total: ${water}` })
        visited.add(`${nx},${ny}`)
        steps.push({ activeLine: 22, message: `Mark (${nx},${ny}) visited` })
        heap.push([Math.max(h, heightMap[nx][ny]), nx, ny])
        steps.push({ activeLine: 23, message: `Push to heap: height=${Math.max(h, heightMap[nx][ny])}` })
      }
    }
  }

  steps.push({ activeLine: 24, message: `Return water: ${water}`, done: true, water })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#1e40af', fontSize: 13 }}>Press play.</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #60a5fa', fontSize: 12, color: '#1e3a8a' }}>
        {step.message}
      </div>
      {step.water != null && (
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1e40af' }}>💧 Water: {step.water}</div>
      )}
    </div>
  )
}

export default function Problem407Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [heightMapInput, setHeightMapInput] = useState("[[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]");
  const { heightMap, inputError } = useMemo(() => {
    try {
      const parsedHeightMap = JSON.parse(heightMapInput); if (!Array.isArray(parsedHeightMap)) throw new Error('heightMap must be an array');
      return { heightMap: parsedHeightMap, inputError: '' };
    } catch (e) {
      return { heightMap: "[[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]]", inputError: e.message };
    }
  }, [heightMapInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE
  const steps = useMemo(
    () => generateSteps(heightMap).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [heightMap]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setHeightMapInput(JSON.stringify(e.heightMap)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
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
      ),
    },
    { id: 'viz', title: '💧 Rain Water II', content: (<VisualizationPanel step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
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
