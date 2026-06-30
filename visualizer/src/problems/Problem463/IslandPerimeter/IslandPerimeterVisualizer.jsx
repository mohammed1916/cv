import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './IslandPerimeterVisualizer.css'
const EXAMPLES = getExamples('island-perimeter')

function generateSteps(grid) {
  const steps = []
  const m = grid.length
  const n = grid[0]?.length || 0
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  steps.push({
    activeLine: 1,
    grid,
    perimeter: 0,
    currentRow: -1,
    currentCol: -1,
    cellContributions: [],
    message: 'Initialize: Count perimeter contributions from each cell'
  })

  let perimeter = 0
  const cellContributions = []

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (grid[i][j] === 1) {
        steps.push({
          activeLine: 2,
          grid,
          perimeter,
          currentRow: i,
          currentCol: j,
          cellContributions,
          message: `Checking cell (${i}, ${j}): land cell`
        })

        let sides = 4
        for (const [di, dj] of directions) {
          const ni = i + di
          const nj = j + dj

          if (ni >= 0 && ni < m && nj >= 0 && nj < n && grid[ni][nj] === 1) {
            sides--

            steps.push({
              activeLine: 3,
              grid,
              perimeter,
              currentRow: i,
              currentCol: j,
              cellContributions,
              message: `Adjacent cell (${ni}, ${nj}) is land, subtract 1 shared edge`
            })
          } else {
            steps.push({
              activeLine: 4,
              grid,
              perimeter,
              currentRow: i,
              currentCol: j,
              cellContributions,
              message: `Edge at (${ni}, ${nj}) is boundary, add 1 to perimeter`
            })
          }
        }

        perimeter += sides
        cellContributions.push({ row: i, col: j, sides })

        steps.push({
          activeLine: 5,
          grid,
          perimeter,
          currentRow: i,
          currentCol: j,
          cellContributions: [...cellContributions],
          message: `Cell (${i}, ${j}) contributes ${sides} sides. Total perimeter: ${perimeter}`
        })
      }
    }
  }

  steps.push({
    activeLine: 6,
    grid,
    perimeter,
    currentRow: -1,
    currentCol: -1,
    cellContributions,
    done: true,
    message: `Island perimeter: ${perimeter}`
  })

  return steps
}

function VisualizationPanel({ grid, step, applyEx }) {
  const m = grid.length
  const n = grid[0]?.length || 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, borderLeft: '4px solid #818cf8' }}>
        <div style={{ fontSize: 12, color: '#3730a3', fontStyle: 'italic' }}>
          "You have a grid with islands (1) and water (0). Calculate the perimeter of the island by counting exposed edges. Each land cell contributes edges that are not shared with other land cells!"
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Visualization */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
          Island Grid
        </div>
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gap: 4,
          padding: 8,
          backgroundColor: '#ffffff',
          borderRadius: 4
        }}>
          {grid.map((row, i) =>
            row.map((cell, j) => {
              const isCurrent = step && step.currentRow === i && step.currentCol === j
              const hasContribution = step?.cellContributions?.some(c => c.row === i && c.col === j)

              return (
                <motion.div
                  key={`${i}-${j}`}
                  style={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    fontSize: 16,
                    backgroundColor: cell === 1 ? '#22c55e' : '#e5e7eb',
                    borderColor: isCurrent ? '#0284c7' : hasContribution ? '#10b981' : '#cbd5e1',
                    color: cell === 1 ? '#ffffff' : '#666'
                  }}
                  animate={{
                    scale: isCurrent ? 1.15 : hasContribution ? 1.05 : 1,
                    boxShadow: isCurrent ? '0 0 15px rgba(2, 132, 199, 0.7)' : 'none'
                  }}
                >
                  {cell === 1 ? '🏝️' : '💧'}
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>

      {/* Cell Contribution */}
      {step && step.currentRow !== -1 && step.grid[step.currentRow][step.currentCol] === 1 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #22c55e'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 12 }}>
            Cell ({step.currentRow}, {step.currentCol}) Contribution
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8
          }}>
            {[
              { label: 'Top', dir: [-1, 0] },
              { label: 'Right', dir: [0, 1] },
              { label: 'Bottom', dir: [1, 0] },
              { label: 'Left', dir: [0, -1] }
            ].map((side, idx) => {
              const ni = step.currentRow + side.dir[0]
              const nj = step.currentCol + side.dir[1]
              const isWater = ni < 0 || ni >= m || nj < 0 || nj >= n || step.grid[ni][nj] === 0
              const isAdjacentLand = ni >= 0 && ni < m && nj >= 0 && nj < n && step.grid[ni][nj] === 1

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: 10,
                    backgroundColor: isWater ? '#d1fae5' : '#fee2e2',
                    borderRadius: 4,
                    border: `2px solid ${isWater ? '#10b981' : '#ef4444'}`,
                    textAlign: 'center'
                  }}
                  animate={{ scale: 1 }}
                >
                  <div style={{ fontSize: 11, fontWeight: 600, color: isWater ? '#15803d' : '#991b1b' }}>
                    {side.label}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {isWater ? '✓ Counts' : '✗ Shared'}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Contributions List */}
      {step && step.cellContributions && step.cellContributions.length > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f8f4ff',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Land Cell Contributions
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8
          }}>
            {step.cellContributions.map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#e9d5ff',
                  borderRadius: 4,
                  border: '2px solid #c084fc',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#5b21b6'
                }}
              >
                ({c.row}, {c.col}): {c.sides} sides
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#e0e7ff',
          borderRadius: 6,
          border: '2px solid #818cf8',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>
          Island Perimeter
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#818cf8',
          marginBottom: 8
        }}>
          {step?.perimeter ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#3730a3' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function IslandPerimeterVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]] })

  const steps = useMemo(
    () =>
      generateSteps(ex.grid).map((current) => ({
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
      title: '🏝️ Island Perimeter',
      content: (
        <VisualizationPanel
          grid={ex.grid}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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

