import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MaxAreaOfIsland.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

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

const EXAMPLES = getExamplesOr('max-area-of-island', [
  {
    label: 'Basic',
    gridStr: '[[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]]',
  },
  {
    label: 'Dense',
    gridStr: '[[1,1,1],[0,1,0],[1,1,1]]',
  },
  {
    label: 'Sparse',
    gridStr: '[[0,0,0],[0,1,0],[0,0,0]]',
  },
])

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

  const applyExample = useCallback((ex) => {
    setGridInput(ex.gridStr)
    handleReset()
  }, [handleReset])

  const rows = grid.length
  const cols = grid[0]?.length || 0

  const gridPanel = (
          <div className="maoi-panel-body">
              <ManualInputPanel
                fields={[{"key":"grid","label":"grid","type":"array"}]}
                values={{ grid: gridInput }}
                onChange={(k, v) => { if (k === 'grid') setGridInput(v); handleReset() }}
                examples={EXAMPLES}
                applyExample={applyExample}
                inputError={inputError}
              />
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  className="maoi-example-btn"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {inputError && <div style={{ color: '#f87171', marginBottom: 12, fontSize: 13 }}>{inputError}</div>}

            <textarea
              className="maoi-input-textarea"
              value={gridInput}
              onChange={(e) => { setGridInput(e.target.value); handleReset() }}
              rows={5}
              spellCheck={false}
            />

            <div className="maoi-grid-container">
              <div
                className="maoi-grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(30px, 1fr))`,
                  maxWidth: `${cols * 50}px`
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

                    let cellClass = "maoi-cell "
                    if (isWater) cellClass += "water "
                    else cellClass += "land "

                    if (isVisited) cellClass += "visited "

                    return (
                      <motion.div
                        key={`${r}-${c}`}
                        animate={{
                          scale: isDfs ? 1.1 : 1,
                          boxShadow: isDfs ? '0 0 12px rgba(59, 130, 246, 0.8)' : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                        className={cellClass}
                        style={{
                          ...(isVisited && !isWater && islandColor ? { backgroundColor: islandColor, borderColor: islandColor } : {})
                        }}
                      >
                        {cell}
                        {isScan && !isDfs && <div className="maoi-cell-indicator scan" />}
                        {isDfs && <div className="maoi-cell-indicator dfs" />}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
  )

  const statePanel = (
          <div className="maoi-panel-body">
            <div className="maoi-stats-container">
              <div className="maoi-stat-box">
                <span className="maoi-stat-label">Current Area</span>
                <span className="maoi-stat-val">{step?.currentArea ?? 0}</span>
              </div>
              <div className="maoi-stat-box">
                <span className="maoi-stat-label">Max Area</span>
                <span className="maoi-stat-val">{step?.maxArea ?? 0}</span>
              </div>
            </div>

            {step && (
              <div className="maoi-section">
                <span className="maoi-section-title">Message</span>
                <div
                  style={{
                    padding: 10,
                    backgroundColor: '#0f172a',
                    borderRadius: 6,
                    border: '1px solid #334155',
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: '#cbd5e1',
                  }}
                >
                  {step.message}
                </div>
              </div>
            )}

            <div className="maoi-section" style={{ flex: 1 }}>
              <span className="maoi-section-title">Legend</span>
              <div className="maoi-legend">
                <div className="maoi-legend-item">
                  <div className="maoi-legend-box land" /> Unvisited Land (1)
                </div>
                <div className="maoi-legend-item">
                  <div className="maoi-legend-box water" /> Water (0)
                </div>
                <div className="maoi-legend-item">
                  <div className="maoi-legend-box scan" /> Scanning pointer
                </div>
                <div className="maoi-legend-item">
                  <div className="maoi-legend-box dfs" /> DFS Current Node
                </div>
                <div className="maoi-legend-item" style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {ISLAND_COLORS.slice(0, 4).map((c, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: c }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, marginLeft: 4 }}>Colored by Island ID</span>
                </div>
              </div>
            </div>
          </div>
  )

  const codePanel = (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'grid', title: 'Grid View & Input' },
      { id: 'state', title: 'State & Info', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.grid && createPortal(gridPanel, panelDivs.grid)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}

      {createPortal(
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
      </FloatingPanel>,
      document.body
      )}

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
