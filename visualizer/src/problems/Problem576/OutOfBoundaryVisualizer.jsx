import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './OutOfBoundaryVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findPaths(m, n, maxMove, row, col):' },
  { line: 2, text: '    memo = {}' },
  { line: 3, text: '    MOD = 10**9 + 7' },
  { line: 4, text: '    ' },
  { line: 5, text: '    def dfs(r, c, moves):' },
  { line: 6, text: '        if r < 0 or r >= m or c < 0 or c >= n:' },
  { line: 7, text: '            return 1  # Out of bounds' },
  { line: 8, text: '        ' },
  { line: 9, text: '        if moves == 0:' },
  { line: 10, text: '            return 0  # No moves left' },
  { line: 11, text: '        ' },
  { line: 12, text: '        if (r, c, moves) in memo:' },
  { line: 13, text: '            return memo[(r, c, moves)]' },
  { line: 14, text: '        ' },
  { line: 15, text: '        paths = 0' },
  { line: 16, text: '        paths += dfs(r+1, c, moves-1)  # Down' },
  { line: 17, text: '        paths += dfs(r-1, c, moves-1)  # Up' },
  { line: 18, text: '        paths += dfs(r, c+1, moves-1)  # Right' },
  { line: 19, text: '        paths += dfs(r, c-1, moves-1)  # Left' },
  { line: 20, text: '        ' },
  { line: 21, text: '        memo[(r, c, moves)] = paths % MOD' },
  { line: 22, text: '        return memo[(r, c, moves)]' },
  { line: 23, text: '    ' },
  { line: 24, text: '    return dfs(row, col, maxMove)' },
]

const PATTERNS = ['init', 'bounds_check', 'move_check', 'memoization', 'explore', 'backtrack', 'result']
const LINE_PATTERN_MAP = {
  5: 'init',
  6: 'bounds_check',
  9: 'move_check',
  12: 'memoization',
  16: 'explore',
  21: 'backtrack',
  24: 'result',
}

const DIRECTIONS = [
  { name: 'Down', dr: 1, dc: 0, symbol: '↓' },
  { name: 'Up', dr: -1, dc: 0, symbol: '↑' },
  { name: 'Right', dr: 0, dc: 1, symbol: '→' },
  { name: 'Left', dr: 0, dc: -1, symbol: '←' },
]

function generateSteps(m, n, maxMove, startRow, startCol) {
  const steps = []
  const MOD = 1000000007
  const memo = {}
  let stepId = 0
  const visitedStates = new Set()

  function dfs(r, c, moves, depth) {
    const key = `${r},${c},${moves}`

    // Check bounds
    steps.push({
      id: stepId++,
      phase: 'bounds_check',
      activeLine: 6,
      relatedLines: [6, 7],
      message: `Check bounds: row=${r}, col=${c}`,
      m,
      n,
      currentRow: r,
      currentCol: c,
      movesLeft: moves,
      depth,
      type: 'bounds_check',
    })

    if (r < 0 || r >= m || c < 0 || c >= n) {
      steps.push({
        id: stepId++,
        phase: 'bounds_check',
        activeLine: 7,
        relatedLines: [7],
        message: `Out of bounds! Found 1 valid path.`,
        m,
        n,
        currentRow: r,
        currentCol: c,
        movesLeft: moves,
        depth,
        type: 'out_of_bounds',
        outOfBoundsFound: true,
        pathCount: 1,
      })
      return 1
    }

    // Check if no moves left
    steps.push({
      id: stepId++,
      phase: 'move_check',
      activeLine: 9,
      relatedLines: [9, 10],
      message: `Check moves left: ${moves}`,
      m,
      n,
      currentRow: r,
      currentCol: c,
      movesLeft: moves,
      depth,
      type: 'move_check',
    })

    if (moves === 0) {
      steps.push({
        id: stepId++,
        phase: 'move_check',
        activeLine: 10,
        relatedLines: [10],
        message: `No moves left. Return 0.`,
        m,
        n,
        currentRow: r,
        currentCol: c,
        movesLeft: moves,
        depth,
        type: 'no_moves',
        pathCount: 0,
      })
      return 0
    }

    // Check memoization
    if (memo[key] !== undefined) {
      steps.push({
        id: stepId++,
        phase: 'memoization',
        activeLine: 12,
        relatedLines: [12, 13],
        message: `Found in memo: (${r}, ${c}, ${moves}) = ${memo[key]}`,
        m,
        n,
        currentRow: r,
        currentCol: c,
        movesLeft: moves,
        depth,
        type: 'memo_hit',
        pathCount: memo[key],
      })
      return memo[key]
    }

    // Explore directions
    let result = 0
    const directionResults = []

    for (let dirIdx = 0; dirIdx < DIRECTIONS.length; dirIdx++) {
      const dir = DIRECTIONS[dirIdx]
      const newR = r + dir.dr
      const newC = c + dir.dc
      const lineNum = 16 + dirIdx

      steps.push({
        id: stepId++,
        phase: 'explore',
        activeLine: lineNum,
        relatedLines: [lineNum],
        message: `Explore ${dir.name}: (${r}, ${c}) → (${newR}, ${newC})`,
        m,
        n,
        currentRow: r,
        currentCol: c,
        nextRow: newR,
        nextCol: newC,
        movesLeft: moves,
        depth,
        direction: dir.name,
        directionSymbol: dir.symbol,
        type: 'explore',
      })

      const pathsInDirection = dfs(newR, newC, moves - 1, depth + 1)
      result += pathsInDirection
      directionResults.push({ dir: dir.name, count: pathsInDirection })
    }

    result = result % MOD
    memo[key] = result

    steps.push({
      id: stepId++,
      phase: 'backtrack',
      activeLine: 21,
      relatedLines: [21, 22],
      message: `Memoize: (${r}, ${c}, ${moves}) = ${result}`,
      m,
      n,
      currentRow: r,
      currentCol: c,
      movesLeft: moves,
      depth,
      type: 'memoize',
      pathCount: result,
      directionResults,
    })

    return result
  }

  steps.push({
    id: stepId++,
    phase: 'init',
    activeLine: 1,
    relatedLines: [1, 2, 3, 5],
    message: `Initialize: Grid=${m}×${n}, Start=(${startRow},${startCol}), MaxMoves=${maxMove}`,
    m,
    n,
    currentRow: startRow,
    currentCol: startCol,
    movesLeft: maxMove,
    type: 'init',
  })

  const result = dfs(startRow, startCol, maxMove, 0)

  steps.push({
    id: stepId++,
    phase: 'result',
    activeLine: 24,
    relatedLines: [24],
    message: `Final result: ${result} paths go out of bounds.`,
    m,
    n,
    finalResult: result,
    type: 'result',
    done: true,
  })

  return steps
}

function GridVisualization({ m, n, step }) {
  return (
    <div className="obb-grid" style={{ gridTemplateColumns: `repeat(${n}, 60px)` }}>
      {Array.from({ length: m }).map((_, r) =>
        Array.from({ length: n }).map((_, c) => {
          const isCurrent = step?.currentRow === r && step?.currentCol === c
          const isNext = step?.nextRow === r && step?.nextCol === c

          return (
            <motion.div
              key={`${r}-${c}`}
              className={`obb-cell ${isCurrent ? 'current' : ''} ${isNext ? 'next' : ''}`}
              animate={{
                scale: isCurrent ? 1.1 : 1,
                boxShadow: isCurrent ? '0 0 12px rgba(56, 189, 248, 0.6)' : '0 0 0px rgba(56, 189, 248, 0)',
              }}
              transition={{ duration: 0.2 }}
            >
              {r},{c}
            </motion.div>
          )
        })
      )}
    </div>
  )
}

function VisualizationPanel({ step, m, n, maxMove, startRow, startCol, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <GridVisualization m={m} n={n} step={step} />

      {step && (
        <div className="obb-stats">
          <div className="obb-stat">
            <div className="obb-stat-label">Grid Size</div>
            <div className="obb-stat-value">
              {m} × {n}
            </div>
          </div>
          <div className="obb-stat">
            <div className="obb-stat-label">Moves Left</div>
            <div className="obb-stat-value">{step.movesLeft ?? maxMove}</div>
          </div>
          <div className="obb-stat">
            <div className="obb-stat-label">Current Position</div>
            <div className="obb-stat-value">
              ({step.currentRow ?? startRow}, {step.currentCol ?? startCol})
            </div>
          </div>
        </div>
      )}

      {step?.direction && (
        <div className="obb-directions">
          {DIRECTIONS.map((dir) => (
            <div
              key={dir.name}
              className={`obb-direction ${step.direction === dir.name ? 'active' : ''}`}
            >
              <div style={{ fontSize: 16, marginBottom: 4 }}>{dir.symbol}</div>
              <div>{dir.name}</div>
            </div>
          ))}
        </div>
      )}

      {step?.type === 'out_of_bounds' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#0f172a',
            borderRadius: 6,
            border: '2px solid #22c55e',
            color: '#22c55e',
            fontWeight: 600,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✓ Out of Bounds - Path Found!
        </motion.div>
      )}

      {step?.type === 'no_moves' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#0f172a',
            borderRadius: 6,
            border: '2px solid #f87171',
            color: '#f87171',
            fontWeight: 600,
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✗ No Moves Left
        </motion.div>
      )}

      {step?.type === 'memo_hit' && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #fbbf24',
            color: '#fbbf24',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Memo Hit: {step.pathCount}
        </div>
      )}

      {step?.type === 'memoize' && step?.directionResults?.length > 0 && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '1px solid #475569',
            color: '#cbd5e1',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8 }}>Direction Results</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {step.directionResults.map((dr, i) => (
              <div key={i} style={{ fontSize: 12, color: '#38bdf8' }}>
                {dr.dir}: {dr.count}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.type === 'result' && (
        <motion.div
          className="obb-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, marginBottom: 8 }}>Total Paths Out of Bounds</div>
          <div className="obb-result result-value">{step.finalResult}</div>
        </motion.div>
      )}

      <div
        style={{
          padding: 12,
          backgroundColor: '#0f172a',
          borderRadius: 6,
          border: '1px solid #475569',
          fontSize: 12,
          color: '#cbd5e1',
          lineHeight: '1.5',
        }}
      >
        {step?.message}
      </div>
    </div>
  )
}

export default function OutOfBoundaryVisualizer() {
  const examples = useMemo(() => getExamplesOr('out-of-boundary', []), [])
  const [m, setM] = useState(2)
  const [n, setN] = useState(2)
  const [maxMove, setMaxMove] = useState(2)
  const [startRow, setStartRow] = useState(0)
  const [startCol, setStartCol] = useState(0)

  const steps = useMemo(() => generateSteps(m, n, maxMove, startRow, startCol), [m, n, maxMove, startRow, startCol])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setM(ex.m || 2)
      setN(ex.n || 2)
      setMaxMove(ex.maxMove || 2)
      setStartRow(ex.startRow || 0)
      setStartCol(ex.startCol || 0)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
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
      {
        id: 'viz',
        title: '🎯 Out of Boundary',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Rows (m)</div>
                <input
                  type="number"
                  value={m}
                  onChange={(e) => {
                    setM(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  max={5}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Cols (n)</div>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => {
                    setN(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  max={5}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Max Moves</div>
                <input
                  type="number"
                  value={maxMove}
                  onChange={(e) => {
                    setMaxMove(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  max={10}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Start Row</div>
                <input
                  type="number"
                  value={startRow}
                  onChange={(e) => {
                    setStartRow(Number(e.target.value))
                    handleReset()
                  }}
                  min={0}
                  max={m - 1}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Start Col</div>
              <input
                type="number"
                value={startCol}
                onChange={(e) => {
                  setStartCol(Number(e.target.value))
                  handleReset()
                }}
                min={0}
                max={n - 1}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              />
            </div>
            <VisualizationPanel
              step={step}
              m={m}
              n={n}
              maxMove={maxMove}
              startRow={startRow}
              startCol={startCol}
              applyExample={applyExample}
              examples={examples}
            />
          </div>
        ),
      },
    ],
    [
      step,
      connectivity,
      setActiveLineDom,
      m,
      n,
      maxMove,
      startRow,
      startCol,
      examples,
      applyExample,
      handleReset,
      showPatternOverlay,
      activeLineDom,
    ]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
      </FloatingPanel>
    </div>
  )
}
