import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem434Visualizer.css'

const EXAMPLES = [
  {
    label: 'Islands Form',
    m: 3,
    n: 3,
    positions: [[0, 0], [0, 2], [2, 1]],
  },
  {
    label: 'Islands Merge',
    m: 4,
    n: 4,
    positions: [[0, 0], [0, 1], [1, 0], [1, 1]],
  },
  {
    label: 'Single Island',
    m: 2,
    n: 2,
    positions: [[0, 0], [0, 1], [1, 0], [1, 1]],
  },
]

class UnionFind {
  constructor(n) {
    this.parent = Array(n).fill(-1)
    this.rank = Array(n).fill(0)
    this.count = 0
  }

  find(x) {
    if (this.parent[x] === -1) return -1
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }
    return this.parent[x]
  }

  union(x, y) {
    const rootX = this.find(x)
    const rootY = this.find(y)
    if (rootX === -1 || rootY === -1 || rootX === rootY) return

    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX
    } else {
      this.parent[rootY] = rootX
      this.rank[rootX]++
    }
    this.count--
  }

  addLand(idx) {
    this.parent[idx] = idx
    this.count++
  }
}

function generateSteps(m, n, positions) {
  const steps = []
  const uf = new UnionFind(m * n)

  const getIdx = (r, c) => r * n + c
  const getNeighbors = (r, c) => {
    const neighbors = []
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
        neighbors.push([nr, nc])
      }
    }
    return neighbors
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    m,
    n,
    positions: [],
    grid: Array(m).fill(null).map(() => Array(n).fill(0)),
    ufParent: [-1],
    islandCount: 0,
    message: `Initialize ${m}x${n} grid and Union-Find with 0 islands`,
  })

  for (const [r, c] of positions) {
    const idx = getIdx(r, c)
    uf.addLand(idx)

    const grid = Array(m).fill(null).map(() => Array(n).fill(0))
    const addedPositions = positions.slice(0, positions.indexOf([r, c]) + 1)
    for (const [pr, pc] of addedPositions) {
      grid[pr][pc] = 1
    }

    steps.push({
      activeLine: 2,
      phase: 'add_land',
      m,
      n,
      currentPos: [r, c],
      positions: [...addedPositions],
      grid,
      ufParent: [...uf.parent],
      islandCount: uf.count,
      message: `Add land at [${r},${c}], count = ${uf.count}`,
    })

    const neighbors = getNeighbors(r, c)
    const mergedNeighbors = []

    for (const [nr, nc] of neighbors) {
      const nIdx = getIdx(nr, nc)
      if (grid[nr][nc] === 1) {
        const beforeCount = uf.count
        uf.union(idx, nIdx)
        mergedNeighbors.push({ pos: [nr, nc], idx: nIdx, merged: beforeCount !== uf.count })

        steps.push({
          activeLine: 3,
          phase: 'check_neighbor',
          m,
          n,
          currentPos: [r, c],
          neighborPos: [nr, nc],
          positions: [...addedPositions],
          grid,
          ufParent: [...uf.parent],
          islandCount: uf.count,
          highlightedCells: [[r, c], [nr, nc]],
          message: `Check neighbor [${nr},${nc}], islands = ${uf.count}`,
        })

        if (uf.count !== beforeCount) {
          steps.push({
            activeLine: 4,
            phase: 'union',
            m,
            n,
            currentPos: [r, c],
            neighborPos: [nr, nc],
            positions: [...addedPositions],
            grid,
            ufParent: [...uf.parent],
            islandCount: uf.count,
            mergedCells: [[r, c], [nr, nc]],
            message: `Union: merged islands, count = ${uf.count}`,
          })
        }
      }
    }

    steps.push({
      activeLine: 5,
      phase: 'step_complete',
      m,
      n,
      currentPos: [r, c],
      positions: [...addedPositions],
      grid,
      ufParent: [...uf.parent],
      islandCount: uf.count,
      message: `Step complete: ${uf.count} island(s) after adding [${r},${c}]`,
    })
  }

  steps.push({
    activeLine: 6,
    phase: 'complete',
    m,
    n,
    positions,
    grid: (() => {
      const g = Array(m).fill(null).map(() => Array(n).fill(0))
      for (const [r, c] of positions) g[r][c] = 1
      return g
    })(),
    ufParent: [...uf.parent],
    islandCount: uf.count,
    isComplete: true,
    message: `Final island count: ${uf.count}`,
  })

  return steps
}

function GridVisualization({ grid, m, n, currentPos, highlightedCells, mergedCells }) {
  const cellSize = 40

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Grid</div>
      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
        gap: 2,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isHighlighted = highlightedCells?.some(([hr, hc]) => hr === r && hc === c)
            const isMerged = mergedCells?.some(([mr, mc]) => mr === r && mc === c)
            const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c

            return (
              <motion.div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: cell === 1 ? '#1e40af' : '#e2e8f0',
                  border: isMerged ? '3px solid #10b981' : isCurrent ? '3px solid #dc2626' : isHighlighted ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  color: cell === 1 ? '#ffffff' : '#64748b',
                }}
                animate={{
                  scale: isCurrent ? 1.1 : isHighlighted || isMerged ? 1.05 : 1,
                  boxShadow: isCurrent ? '0 0 12px rgba(220,38,38,0.5)' : isMerged ? '0 0 12px rgba(16,185,129,0.5)' : 'none',
                }}
                transition={{ duration: 0.3 }}
              >
                {cell === 1 ? '🌍' : '~'}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function UnionFindVisualization({ ufParent, m, n, islandCount }) {
  const displayParent = ufParent.slice(0, Math.min(m * n, 9))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Union-Find Parent Array (sample)</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {displayParent.map((parent, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: parent === -1 ? '#fee2e2' : parent === idx ? '#ecfdf5' : '#dbeafe',
                border: parent === -1 ? '2px solid #dc2626' : parent === idx ? '2px solid #10b981' : '2px solid #0284c7',
                fontSize: 11,
                fontWeight: 600,
                color: parent === -1 ? '#991b1b' : parent === idx ? '#047857' : '#0c4a6e',
                minWidth: 28,
                textAlign: 'center',
              }}
              animate={{ scale: parent !== -1 ? 1 : 0.95 }}
            >
              {parent === -1 ? '∅' : parent}
            </motion.div>
          ))}
        </div>
        <div style={{
          padding: 12,
          backgroundColor: '#f0fdf4',
          borderRadius: 4,
          border: '2px solid #10b981',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#047857',
        }}>
          Island Count: {islandCount}
        </div>
      </div>
    </div>
  )
}

function IslandCountVisualization({ islandCount, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Island Count Progress</div>
      <div style={{
        padding: 16,
        backgroundColor: '#f3e8ff',
        borderRadius: 8,
        border: '2px solid #8b5cf6',
        textAlign: 'center',
      }}>
        <motion.div
          style={{ fontSize: 32, fontWeight: 700, color: '#6b21a8' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          {islandCount}
        </motion.div>
        <div style={{ fontSize: 11, color: '#6b21a8', marginTop: 8 }}>
          {islandCount === 1 ? '1 island' : `${islandCount} islands`}
        </div>
        {step?.currentPos && (
          <div style={{ fontSize: 10, color: '#7c3aed', marginTop: 8 }}>
            Added: [{step.currentPos[0]},{step.currentPos[1]}]
          </div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GridVisualization
          grid={step?.grid || Array(3).fill(null).map(() => Array(3).fill(0))}
          m={step?.m || 3}
          n={step?.n || 3}
          currentPos={step?.currentPos}
          highlightedCells={step?.highlightedCells}
          mergedCells={step?.mergedCells}
        />

        <UnionFindVisualization
          ufParent={step?.ufParent || [-1]}
          m={step?.m || 3}
          n={step?.n || 3}
          islandCount={step?.islandCount || 0}
        />

        <IslandCountVisualization
          islandCount={step?.islandCount || 0}
          step={step}
        />

        <div style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '1px solid #fbbf24',
          fontSize: 11,
          color: '#78350f',
          fontFamily: 'monospace',
        }}>
          {step?.message || 'Initialize grid'}
        </div>
      </div>
    </div>
  )
}

export default function Problem434Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('number-of-islands-ii')

  const steps = useMemo(
    () =>
      generateSteps(ex.m, ex.n, ex.positions).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

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
      title: '🏝️ Islands II',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
