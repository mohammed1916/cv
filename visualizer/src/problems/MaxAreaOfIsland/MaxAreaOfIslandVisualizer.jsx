import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './MaxAreaOfIsland.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def maxAreaOfIsland(grid: List[List[int]]) -> int:' },
  { line: 2, text: '    if not grid: return 0' },
  { line: 3, text: '    rows, cols = len(grid), len(grid[0])' },
  { line: 4, text: '    visited = set()' },
  { line: 5, text: '    maxArea = 0' },
  { line: 6, text: '    ' },
  { line: 7, text: '    def dfs(r, c):' },
  { line: 8, text: '        if r < 0 or r >= rows or c < 0 or c >= cols: return 0' },
  { line: 9, text: '        if (r, c) in visited or grid[r][c] == 0: return 0' },
  { line: 10, text: '        visited.add((r, c))' },
  { line: 11, text: '        area = 1 + dfs(r+1,c) + dfs(r-1,c) + dfs(r,c+1) + dfs(r,c-1)' },
  { line: 12, text: '        return area' },
  { line: 13, text: '    ' },
  { line: 14, text: '    for r in range(rows):' },
  { line: 15, text: '        for c in range(cols):' },
  { line: 16, text: '            if grid[r][c] == 1 and (r, c) not in visited:' },
  { line: 17, text: '                maxArea = max(maxArea, dfs(r, c))' },
  { line: 18, text: '    return maxArea' },
]

function generateSteps(grid) {
  const steps = []

  if (!grid || grid.length === 0 || grid[0].length === 0) {
    steps.push({
      phase: 'done',
      visited: [],
      dfsStack: [],
      currentArea: 0,
      maxArea: 0,
      activeLine: 2,
      message: 'Empty grid, return 0.',
    })
    return steps
  }

  const rows = grid.length
  const cols = grid[0].length
  const visited = new Set()
  let maxArea = 0
  const islandMap = {}

  steps.push({
    phase: 'init',
    visited: Array.from(visited),
    dfsStack: [],
    currentArea: 0,
    maxArea: 0,
    islandMap: { ...islandMap },
    activeLine: 5,
    message: `Initialize grid ${rows}x${cols}, visited set empty, maxArea = 0.`,
  })

  let islandId = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      steps.push({
        phase: 'scan',
        visited: Array.from(visited),
        dfsStack: [],
        currentArea: 0,
        maxArea,
        islandMap: { ...islandMap },
        currScan: [r, c],
        activeLine: 16,
        message: `Scanning grid[${r}][${c}] (value: ${grid[r][c]}). Is it unvisited land?`,
      })

      if (grid[r][c] === 1 && !visited.has(`${r},${c}`)) {
        steps.push({
          phase: 'found_new',
          visited: Array.from(visited),
          dfsStack: [[r, c]],
          currentArea: 0,
          maxArea,
          islandMap: { ...islandMap },
          currScan: [r, c],
          activeLine: 17,
          message: `Found unvisited land at (${r}, ${c})! Call dfs(${r}, ${c}).`,
        })

        // DFS simulation
        let currentArea = 0
        const dfsStack = [[r, c]]
        const dfsVisited = new Set(visited)

        while (dfsStack.length > 0) {
          const [row, col] = dfsStack[dfsStack.length - 1]

          if (
            row < 0 ||
            row >= rows ||
            col < 0 ||
            col >= cols ||
            dfsVisited.has(`${row},${col}`) ||
            grid[row][col] === 0
          ) {
            dfsStack.pop()
            continue
          }

          dfsVisited.add(`${row},${col}`)
          islandMap[`${row},${col}`] = islandId
          currentArea++

          steps.push({
            phase: 'dfs_explore',
            visited: Array.from(dfsVisited),
            dfsStack: [...dfsStack],
            currentArea,
            maxArea,
            islandMap: { ...islandMap },
            currScan: [r, c],
            currDfs: [row, col],
            activeLine: 11,
            message: `DFS visit (${row}, ${col}). Area grows to ${currentArea}.`,
          })

          // Explore neighbors
          const neighbors = [
            [row + 1, col],
            [row - 1, col],
            [row, col + 1],
            [row, col - 1],
          ]
          for (const [nr, nc] of neighbors) {
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              !dfsVisited.has(`${nr},${nc}`) &&
              grid[nr][nc] === 1
            ) {
              dfsStack.push([nr, nc])
              break
            }
          }
        }

        maxArea = Math.max(maxArea, currentArea)
        visited.clear()
        dfsVisited.forEach(cell => visited.add(cell))

        steps.push({
          phase: 'dfs_complete',
          visited: Array.from(visited),
          dfsStack: [],
          currentArea,
          maxArea,
          islandMap: { ...islandMap },
          currScan: [r, c],
          activeLine: 17,
          message: `DFS completed. Island area: ${currentArea}. Max area: ${maxArea}.`,
        })

        islandId++
      }
    }
  }

  steps.push({
    phase: 'done',
    visited: Array.from(visited),
    dfsStack: [],
    currentArea: 0,
    maxArea,
    islandMap: { ...islandMap },
    activeLine: 18,
    message: `Scan complete. Maximum island area: ${maxArea}.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    gridStr: '[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]',
  },
  {
    label: 'Example 2',
    gridStr: '[[1,1,1],[0,1,0],[1,1,1]]',
  },
  {
    label: 'Example 3',
    gridStr: '[[0,0,0],[0,1,0],[0,0,0]]',
  },
]

const ISLAND_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f43f5e',
  '#84cc16',
]

export default function MaxAreaOfIslandVisualizer() {
  const [gridInput, setGridInput] = useState(EXAMPLES[0].gridStr)
  const SOLUTION_CODE_HOOK = useSolutionCode('max-area-of-island')

  const { grid, inputError } = useMemo(() => {
    try {
      const g = JSON.parse(gridInput)
      if (!Array.isArray(g) || !Array.isArray(g[0])) throw new Error('Grid must be a 2D array')
      return { grid: g, inputError: '' }
    } catch (e) {
      return { grid: [[1]], inputError: e.message || 'Invalid JSON format' }
    }
  }, [gridInput])

  const steps = useMemo(() => generateSteps(grid), [grid])

  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: stepIndex })

  const applyExample = useCallback((ex) => {
    setGridInput(ex.gridStr)
    handleReset()
  }, [handleReset])

  const rows = grid.length
  const cols = grid[0]?.length || 0

  const dockPanels = useMemo(
    () => [
      {
        id: 'grid',
        title: 'Grid View & Input',
        subtitle: inputError ? 'Fix the input to resume.' : 'Edit grid input.',
        content: (
          <div className="maoi-panel-body">
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: gridInput === ex.gridStr ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {inputError && <div style={{ color: '#f87171', marginBottom: 12, fontSize: 13 }}>{inputError}</div>}

            <textarea
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                fontFamily: 'monospace',
                fontSize: 12,
                marginBottom: 16,
              }}
              value={gridInput}
              onChange={(e) => {
                setGridInput(e.target.value)
                handleReset()
              }}
              rows={4}
              spellCheck={false}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, minmax(40px, 1fr))`,
                gap: 4,
                maxWidth: `${cols * 50}px`,
              }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isWater = cell === 0
                  const isVisited = step?.visited?.includes(`${r},${c}`)
                  const isScan = step?.currScan?.[0] === r && step?.currScan?.[1] === c
                  const isDfs = step?.currDfs?.[0] === r && step?.currDfs?.[1] === c

                  const islandId = step?.islandMap?.[`${r},${c}`]
                  const islandColor = islandId !== undefined ? ISLAND_COLORS[islandId % ISLAND_COLORS.length] : undefined

                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      animate={{
                        scale: isDfs ? 1.1 : 1,
                        boxShadow: isDfs ? '0 0 12px rgba(59, 130, 246, 0.8)' : 'none',
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        padding: 12,
                        borderRadius: 4,
                        border: isDfs ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                        backgroundColor:
                          isDfs ? '#dbeafe' : isVisited && islandColor ? islandColor : isWater ? '#e2e8f0' : '#f0fdf4',
                        color: '#1e293b',
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'default',
                        transition: 'all 0.2s ease-out',
                      }}
                    >
                      {cell}
                      {isScan && !isDfs && <div style={{ position: 'absolute', width: 6, height: 6, backgroundColor: '#ef4444', borderRadius: '50%' }} />}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'state',
        title: 'State Info',
        subtitle: step ? `Max: ${step.maxArea ?? 0}, Current: ${step.currentArea ?? 0}` : 'Algorithm state',
        content: (
          <div className="maoi-panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  padding: 12,
                  backgroundColor: '#fef3c7',
                  borderRadius: 6,
                  border: '1px solid #fcd34d',
                }}
              >
                <div style={{ fontSize: 11, color: '#78350f', fontWeight: 600, marginBottom: 4 }}>Current Area</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#b45309' }}>{step?.currentArea ?? 0}</div>
              </div>

              <div
                style={{
                  padding: 12,
                  backgroundColor: '#dbeafe',
                  borderRadius: 6,
                  border: '1px solid #0ea5e9',
                }}
              >
                <div style={{ fontSize: 11, color: '#0c4a6e', fontWeight: 600, marginBottom: 4 }}>Max Area</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0369a1' }}>{step?.maxArea ?? 0}</div>
              </div>
            </div>

            {step && (
              <div
                style={{
                  padding: 10,
                  backgroundColor: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: '#475569',
                }}
              >
                <strong style={{ color: '#1e293b' }}>Message:</strong>
                <div style={{ marginTop: 6 }}>{step.message}</div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#64748b' }}>Legend</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { color: '#f0fdf4', label: 'Unvisited Land (1)' },
                  { color: '#e2e8f0', label: 'Water (0)' },
                  { color: '#dbeafe', label: 'DFS Current' },
                  { color: '#3b82f6', label: 'Island (colored)' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        backgroundColor: item.color,
                        border: '1px solid #cbd5e1',
                        borderRadius: 3,
                      }}
                    />
                    <span style={{ fontSize: 11 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'code',
        title: 'Code Trace',
        subtitle: step ? `Line ${step.activeLine}` : 'Solution code',
        content: (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />
        ),
      },
    ],
    [step, applyExample, gridInput, handleReset, inputError, grid, rows, cols, setActiveLineDom, autoScrollCode, connectivity]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace
        title="Max Area of Island Visualizer"
        panels={dockPanels}
        initialLayout={{
          rows: [['grid', 'state'], ['code']],
          minimized: [],
        }}
      />

      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          onReset={handleReset}
          onPrev={stepBack}
          onPlayToggle={togglePlay}
          onNext={stepForward}
          resetDisabled={steps.length === 0}
          prevDisabled={stepIndex < 0}
          nextDisabled={steps.length === 0 || isDone}
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          speedIndicator={`${speed}ms`}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          autoScrollLabel="Auto-scroll code"
          showAutoScroll
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
