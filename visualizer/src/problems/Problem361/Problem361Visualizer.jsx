import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem361.css'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def maxKilledEnemies(grid):' },
  { line: 2, text: '    if not grid: return 0' },
  { line: 3, text: '    m, n = len(grid), len(grid[0])' },
  { line: 4, text: '    rowKills = [0] * m' },
  { line: 5, text: '    colKills = [[0] * n for _ in range(m)]' },
  { line: 6, text: '    for i in range(m):' },
  { line: 7, text: '        col_kills = 0' },
  { line: 8, text: '        for j in range(n):' },
  { line: 9, text: '            if grid[i][j] == "W": col_kills = 0' },
  { line: 10, text: '            elif grid[i][j] == "E": col_kills += 1' },
  { line: 11, text: '            colKills[i][j] = col_kills' },
  { line: 12, text: '    for j in range(n):' },
  { line: 13, text: '        row_kills = 0' },
  { line: 14, text: '        for i in range(m):' },
  { line: 15, text: '            if grid[i][j] == "W": row_kills = 0' },
  { line: 16, text: '            elif grid[i][j] == "E": row_kills += 1' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(grid) {
  const steps = []
  const m = grid.length
  const n = m > 0 ? grid[0].length : 0

  // Initialize step
  steps.push({
    activeLine: 3,
    phase: 'init',
    grid,
    directionRays: [],
    dpValues: [],
    selectedCell: null,
    message: `Initialize grid (${m}x${n}). Need to count enemies in 4 directions from each cell.`,
    relatedLines: [3],
  })

  // Calculate left (precompute step 1)
  const leftCount = Array(m).fill(0).map(() => Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    let count = 0
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 'W') count = 0
      else if (grid[i][j] === 'E') count++
      leftCount[i][j] = count
    }
  }

  steps.push({
    activeLine: 8,
    phase: 'precompute-left',
    grid,
    directionRays: Array(m).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => ({ dir: 'left', count: leftCount[i][j] }))
    ),
    dpValues: leftCount,
    selectedCell: null,
    message: 'Precompute enemies to the LEFT of each cell.',
    relatedLines: [6, 7, 8, 9, 10, 11],
  })

  // Calculate right
  const rightCount = Array(m).fill(0).map(() => Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    let count = 0
    for (let j = n - 1; j >= 0; j--) {
      if (grid[i][j] === 'W') count = 0
      else if (grid[i][j] === 'E') count++
      rightCount[i][j] = count
    }
  }

  steps.push({
    activeLine: 8,
    phase: 'precompute-right',
    grid,
    directionRays: Array(m).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => ({ dir: 'right', count: rightCount[i][j] }))
    ),
    dpValues: rightCount,
    selectedCell: null,
    message: 'Precompute enemies to the RIGHT of each cell.',
    relatedLines: [6, 7, 8, 9, 10, 11],
  })

  // Calculate up
  const upCount = Array(m).fill(0).map(() => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let count = 0
    for (let i = 0; i < m; i++) {
      if (grid[i][j] === 'W') count = 0
      else if (grid[i][j] === 'E') count++
      upCount[i][j] = count
    }
  }

  steps.push({
    activeLine: 12,
    phase: 'precompute-up',
    grid,
    directionRays: Array(m).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => ({ dir: 'up', count: upCount[i][j] }))
    ),
    dpValues: upCount,
    selectedCell: null,
    message: 'Precompute enemies UP from each cell.',
    relatedLines: [12, 13, 14, 15, 16, 17],
  })

  // Calculate down
  const downCount = Array(m).fill(0).map(() => Array(n).fill(0))
  for (let j = 0; j < n; j++) {
    let count = 0
    for (let i = m - 1; i >= 0; i--) {
      if (grid[i][j] === 'W') count = 0
      else if (grid[i][j] === 'E') count++
      downCount[i][j] = count
    }
  }

  steps.push({
    activeLine: 12,
    phase: 'precompute-down',
    grid,
    directionRays: Array(m).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => ({ dir: 'down', count: downCount[i][j] }))
    ),
    dpValues: downCount,
    selectedCell: null,
    message: 'Precompute enemies DOWN from each cell.',
    relatedLines: [12, 13, 14, 15, 16, 17],
  })

  // Calculate total kills for each empty cell
  const totalKills = Array(m).fill(0).map(() => Array(n).fill(0))
  let maxKills = 0
  let bestCell = null

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === '0') {
        const total = leftCount[i][j] + rightCount[i][j] + upCount[i][j] + downCount[i][j]
        totalKills[i][j] = total
        if (total > maxKills) {
          maxKills = total
          bestCell = { i, j }
        }

        steps.push({
          activeLine: 11,
          phase: 'calculate-cell',
          grid,
          directionRays: [
            { dir: 'left', count: leftCount[i][j] },
            { dir: 'right', count: rightCount[i][j] },
            { dir: 'up', count: upCount[i][j] },
            { dir: 'down', count: downCount[i][j] },
          ],
          dpValues: totalKills,
          selectedCell: { i, j },
          cellTotal: total,
          breakdown: {
            left: leftCount[i][j],
            right: rightCount[i][j],
            up: upCount[i][j],
            down: downCount[i][j],
          },
          message: `Cell (${i},${j}) kills: L=${leftCount[i][j]} + R=${rightCount[i][j]} + U=${upCount[i][j]} + D=${downCount[i][j]} = ${total}`,
          relatedLines: [11],
        })
      }
    }
  }

  steps.push({
    activeLine: 16,
    phase: 'final',
    grid,
    directionRays: [],
    dpValues: totalKills,
    selectedCell: bestCell,
    maxKills,
    message: `Maximum kills: ${maxKills} at cell (${bestCell?.i || 0}, ${bestCell?.j || 0})`,
    relatedLines: [16],
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple Grid',
    grid: [
      ['0', 'E', '0'],
      ['E', '0', 'W'],
      ['0', 'E', '0'],
    ],
  },
  {
    label: 'Complex with Walls',
    grid: [
      ['0', 'E', '0', 'E'],
      ['W', '0', 'W', '0'],
      ['0', 'E', '0', 'W'],
      ['E', '0', 'E', '0'],
    ],
  },
  {
    label: 'Optimal Placement',
    grid: [
      ['E', '0', 'W', 'E'],
      ['0', 'E', '0', '0'],
      ['W', '0', 'W', 'E'],
      ['E', 'E', 'E', '0'],
    ],
  },
]

const CELL_SIZE = 50
const PADDING = 20

export default function Problem361Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.grid), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const gridHeight = ex.grid.length * CELL_SIZE + PADDING * 2
  const gridWidth = (ex.grid[0]?.length || 0) * CELL_SIZE + PADDING * 2

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>
      ),
    },
    {
      id: 'viz',
      title: '💣 Bomb Enemy Visualization',
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
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                {step.message}
              </div>

              <svg width="100%" height={gridHeight} viewBox={`0 0 ${gridWidth} ${gridHeight}`} style={{ border: '1px solid #e2e8f0', borderRadius: 6, backgroundColor: '#fafafa' }}>
                {/* Grid cells */}
                {ex.grid.map((row, i) =>
                  row.map((cell, j) => {
                    const x = PADDING + j * CELL_SIZE
                    const y = PADDING + i * CELL_SIZE
                    const isSelected = step.selectedCell?.i === i && step.selectedCell?.j === j
                    const isEmpty = cell === '0'

                    return (
                      <g key={`cell-${i}-${j}`}>
                        <motion.rect
                          x={x}
                          y={y}
                          width={CELL_SIZE}
                          height={CELL_SIZE}
                          fill={
                            isSelected
                              ? '#fbbf24'
                              : cell === 'W'
                              ? '#6b7280'
                              : cell === 'E'
                              ? '#ef4444'
                              : '#f3f4f6'
                          }
                          stroke={isSelected ? '#dc2626' : '#d1d5db'}
                          strokeWidth={isSelected ? 3 : 1}
                          animate={{
                            fill: isSelected
                              ? '#fbbf24'
                              : cell === 'W'
                              ? '#6b7280'
                              : cell === 'E'
                              ? '#ef4444'
                              : '#f3f4f6',
                          }}
                          transition={{ duration: 0.2 }}
                        />
                        <text
                          x={x + CELL_SIZE / 2}
                          y={y + CELL_SIZE / 2}
                          textAnchor="middle"
                          dy="0.3em"
                          fontSize="16"
                          fontWeight="bold"
                          fill={cell === 'W' || cell === 'E' ? '#fff' : '#333'}
                        >
                          {cell === '0' ? '' : cell}
                        </text>
                      </g>
                    )
                  })
                )}

                {/* Direction rays */}
                {step.selectedCell && step.directionRays && step.directionRays.length > 0 && (
                  <>
                    {/* Left ray */}
                    {step.directionRays[0]?.count > 0 && (
                      <motion.line
                        x1={PADDING + step.selectedCell.j * CELL_SIZE}
                        y1={PADDING + step.selectedCell.i * CELL_SIZE + CELL_SIZE / 2}
                        x2={PADDING}
                        y2={PADDING + step.selectedCell.i * CELL_SIZE + CELL_SIZE / 2}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        markerEnd="url(#arrowLeft)"
                      />
                    )}
                    {/* Right ray */}
                    {step.directionRays[1]?.count > 0 && (
                      <motion.line
                        x1={PADDING + (step.selectedCell.j + 1) * CELL_SIZE}
                        y1={PADDING + step.selectedCell.i * CELL_SIZE + CELL_SIZE / 2}
                        x2={gridWidth - PADDING}
                        y2={PADDING + step.selectedCell.i * CELL_SIZE + CELL_SIZE / 2}
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        markerEnd="url(#arrowRight)"
                      />
                    )}
                    {/* Up ray */}
                    {step.directionRays[2]?.count > 0 && (
                      <motion.line
                        x1={PADDING + step.selectedCell.j * CELL_SIZE + CELL_SIZE / 2}
                        y1={PADDING + step.selectedCell.i * CELL_SIZE}
                        x2={PADDING + step.selectedCell.j * CELL_SIZE + CELL_SIZE / 2}
                        y2={PADDING}
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        markerEnd="url(#arrowUp)"
                      />
                    )}
                    {/* Down ray */}
                    {step.directionRays[3]?.count > 0 && (
                      <motion.line
                        x1={PADDING + step.selectedCell.j * CELL_SIZE + CELL_SIZE / 2}
                        y1={PADDING + (step.selectedCell.i + 1) * CELL_SIZE}
                        x2={PADDING + step.selectedCell.j * CELL_SIZE + CELL_SIZE / 2}
                        y2={gridHeight - PADDING}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                        markerEnd="url(#arrowDown)"
                      />
                    )}
                  </>
                )}

                {/* Arrow markers */}
                <defs>
                  <marker id="arrowLeft" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="10,0 10,10 0,5" fill="#3b82f6" />
                  </marker>
                  <marker id="arrowRight" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="0,0 0,10 10,5" fill="#8b5cf6" />
                  </marker>
                  <marker id="arrowUp" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="5,10 10,0 0,0" fill="#10b981" />
                  </marker>
                  <marker id="arrowDown" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                    <polygon points="0,10 10,10 5,0" fill="#f59e0b" />
                  </marker>
                </defs>
              </svg>

              {/* DP Breakdown */}
              {step.breakdown && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${step.selectedCell?.i}-${step.selectedCell?.j}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 8, color: '#92400e' }}>
                      Cell ({step.selectedCell.i}, {step.selectedCell.j}) - Total Kills: {step.cellTotal}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
                        <div style={{ color: '#0369a1', fontWeight: 600 }}>Left</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#3b82f6' }}>{step.breakdown.left}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#ede9fe', borderRadius: 4, textAlign: 'center' }}>
                        <div style={{ color: '#6d28d9', fontWeight: 600 }}>Right</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8b5cf6' }}>{step.breakdown.right}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
                        <div style={{ color: '#065f46', fontWeight: 600 }}>Up</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#10b981' }}>{step.breakdown.up}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, textAlign: 'center' }}>
                        <div style={{ color: '#92400e', fontWeight: 600 }}>Down</div>
                        <div style={{ fontSize: 14, fontWeight: 'bold', color: '#f59e0b' }}>{step.breakdown.down}</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Total kills summary */}
              {step.phase === 'final' && step.maxKills !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#047857', textAlign: 'center' }}
                >
                  ✓ Best cell: ({step.selectedCell?.i}, {step.selectedCell?.j}) kills {step.maxKills} enemies
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.grid])

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
