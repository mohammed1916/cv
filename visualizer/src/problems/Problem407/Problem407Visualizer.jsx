import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem407Visualizer.css'

const EXAMPLES = [
  { label: 'Ex1', grid: [[1,4,3,1,3,2],[3,2,1,3,2,4],[2,3,3,2,3,1]], expected: 4 },
  { label: 'Simple', grid: [[3,3],[3,3]], expected: 0 },
]

function generateSteps(grid) {
  const steps = []

  if (!grid || grid.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Grid is empty. Return 0.',
      phase: 'done',
      visited: new Set(),
      water: 0,
      currentCell: null,
      waterLevel: 0,
    })
    return steps
  }

  const rows = grid.length
  const cols = grid[0].length
  const visited = new Set()
  let water = 0
  let waterLevel = 0

  steps.push({
    activeLine: 1,
    message: `Initialize 2D grid: ${rows} x ${cols}. Add all boundary cells to priority queue.`,
    phase: 'init',
    grid,
    visited: new Set(),
    water: 0,
    currentCell: null,
    waterLevel: 0,
  })

  // Add boundary cells
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
        visited.add(`${i},${j}`)
        waterLevel = Math.max(waterLevel, grid[i][j])

        steps.push({
          activeLine: 2,
          message: `Add boundary cell [${i}, ${j}] with height ${grid[i][j]} to queue.`,
          phase: 'boundary_add',
          grid,
          visited: new Set(visited),
          water,
          currentCell: [i, j],
          waterLevel,
          cellHeight: grid[i][j],
        })
      }
    }
  }

  steps.push({
    activeLine: 3,
    message: `Boundary cells added. Current water level: ${waterLevel}. Start BFS from boundary.`,
    phase: 'boundary_complete',
    grid,
    visited: new Set(visited),
    water,
    waterLevel,
    currentCell: null,
  })

  // Simulate BFS from boundary
  const queue = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (visited.has(`${i},${j}`)) {
        queue.push([i, j, grid[i][j]])
      }
    }
  }

  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  let stepCount = 0

  while (queue.length > 0 && stepCount < 20) {
    stepCount++
    queue.sort((a, b) => a[2] - b[2])
    const [i, j, h] = queue.shift()
    waterLevel = Math.max(waterLevel, h)

    for (const [di, dj] of directions) {
      const ni = i + di
      const nj = j + dj
      const key = `${ni},${nj}`

      if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && !visited.has(key)) {
        visited.add(key)
        const cellHeight = grid[ni][nj]
        const trapped = Math.max(0, waterLevel - cellHeight)

        water += trapped

        steps.push({
          activeLine: 4,
          message: `Process cell [${ni}, ${nj}] height=${cellHeight}. Water level=${waterLevel}. Trapped: ${trapped}. Total: ${water}`,
          phase: 'process',
          grid,
          visited: new Set(visited),
          water,
          currentCell: [ni, nj],
          waterLevel,
          cellHeight,
          trapped,
        })

        queue.push([ni, nj, cellHeight])
      }
    }
  }

  steps.push({
    activeLine: 5,
    message: `BFS complete. Total water trapped: ${water}`,
    phase: 'done',
    grid,
    visited: new Set(visited),
    water,
    waterLevel,
    currentCell: null,
  })

  return steps
}

function ElevationMapVisualization({ grid, step }) {
  const maxHeight = Math.max(...grid.flat())
  const scale = 100 / maxHeight

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>2D Elevation Map</div>

      {/* Grid visualization */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`,
        gap: 4,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {grid.map((row, i) =>
          row.map((height, j) => {
            const isVisited = step?.visited?.has(`${i},${j}`)
            const isCurrent = step?.currentCell && step.currentCell[0] === i && step.currentCell[1] === j
            const water = step?.waterLevel ? Math.max(0, step.waterLevel - height) : 0

            return (
              <motion.div
                key={`${i}-${j}`}
                style={{
                  position: 'relative',
                  height: 60,
                  backgroundColor: '#ffffff',
                  borderRadius: 4,
                  border: isCurrent ? '2px solid #0284c7' : isVisited ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  overflow: 'hidden',
                }}
              >
                {/* Water */}
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${water * scale}%`,
                    backgroundColor: '#93c5fd',
                    opacity: 0.6,
                  }}
                  animate={{ height: `${water * scale}%` }}
                />

                {/* Ground */}
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${height * scale}%`,
                    backgroundColor: isCurrent ? '#dc2626' : '#94a3b8',
                  }}
                  animate={{ height: `${height * scale}%` }}
                />

                {/* Height label */}
                <div style={{
                  position: 'absolute',
                  top: 4,
                  left: 4,
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#475569',
                }}>
                  {height}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Water Level</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0284c7' }}>{step?.waterLevel ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#7f1d1d', fontWeight: 600 }}>Current Cell</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#991b1b', fontFamily: 'monospace' }}>
            {step?.currentCell ? `[${step.currentCell[0]},${step.currentCell[1]}]` : '—'}
          </div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>Visited</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{step?.visited?.size ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fce7f3', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#831843', fontWeight: 600 }}>Water Trapped</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#be185d' }}>{step?.water ?? 0}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem407Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]
  const SOLUTION_CODE = useSolutionCode('trapping-rain-water-ii')

  const steps = useMemo(
    () =>
      generateSteps(example.grid).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
      title: '💧 Rain Water Trapping II',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#dbeafe' : '#f1f5f9',
                    color: exIdx === idx ? '#0c4a6e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <ElevationMapVisualization grid={example.grid} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
