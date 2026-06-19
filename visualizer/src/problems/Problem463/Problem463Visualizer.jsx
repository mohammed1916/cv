import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE = [
  { line: 1, text: 'def islandPerimeter(grid):' },
  { line: 2, text: '    if not grid: return 0' },
  { line: 3, text: '    perimeter = 0' },
  { line: 4, text: '    for i in range(len(grid)):' },
  { line: 5, text: '        for j in range(len(grid[0])):' },
  { line: 6, text: '            if grid[i][j] == 1:' },
  { line: 7, text: '                perimeter += 4' },
  { line: 8, text: '                if i > 0 and grid[i-1][j]: perimeter -= 2' },
  { line: 9, text: '                if j > 0 and grid[i][j-1]: perimeter -= 2' },
  { line: 10, text: '    return perimeter' },
]

const EXAMPLES = getExamples('island-perimeter') || [
  { label: 'Example 1', grid: [[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]], expected: 16 },
  { label: 'Example 2', grid: [[1]], expected: 4 },
  { label: 'Example 3', grid: [[1, 1], [1, 1]], expected: 8 },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize', lines: [2, 3] },
  { id: 'loop', label: 'Iterate Cells', lines: [4, 5] },
  { id: 'land', label: 'Land Check', lines: [6] },
  { id: 'calc', label: 'Calculate', lines: [7, 8, 9] },
  { id: 'return', label: 'Return', lines: [10] },
]

function generateSteps(grid) {
  const steps = []

  if (!Array.isArray(grid) || grid.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      grid: [],
      perimeter: 0,
      stepNum: 0,
      message: 'Empty grid.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    grid,
    perimeter: 0,
    stepNum: 0,
    message: `Calculating island perimeter for ${grid.length}x${grid[0]?.length || 0} grid`,
  })

  let perimeter = 0
  let stepNum = 1

  steps.push({
    phase: 'init',
    activeLine: 3,
    grid,
    perimeter,
    stepNum,
    message: `Starting perimeter calculation`,
  })
  stepNum++

  for (let i = 0; i < Math.min(grid.length, 3); i++) {
    for (let j = 0; j < Math.min(grid[i]?.length || 0, 3); j++) {
      steps.push({
        phase: 'checking_cell',
        activeLine: 4,
        grid,
        perimeter,
        i,
        j,
        stepNum,
        message: `Checking cell [${i}][${j}]`,
      })
      stepNum++

      if (grid[i][j] === 1) {
        steps.push({
          phase: 'found_land',
          activeLine: 6,
          grid,
          perimeter,
          i,
          j,
          stepNum,
          message: `Found land at [${i}][${j}]`,
        })
        stepNum++

        perimeter += 4

        steps.push({
          phase: 'add_perimeter',
          activeLine: 7,
          grid,
          perimeter,
          i,
          j,
          stepNum,
          message: `Add 4: perimeter = ${perimeter}`,
        })
        stepNum++

        if (i > 0 && grid[i - 1][j] === 1) {
          perimeter -= 2

          steps.push({
            phase: 'adjust_up',
            activeLine: 8,
            grid,
            perimeter,
            i,
            j,
            stepNum,
            message: `Neighbor above: subtract 2, perimeter = ${perimeter}`,
          })
          stepNum++
        }

        if (j > 0 && grid[i][j - 1] === 1) {
          perimeter -= 2

          steps.push({
            phase: 'adjust_left',
            activeLine: 9,
            grid,
            perimeter,
            i,
            j,
            stepNum,
            message: `Neighbor left: subtract 2, perimeter = ${perimeter}`,
          })
          stepNum++
        }
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 10,
    grid,
    perimeter,
    stepNum,
    message: `Island perimeter: ${perimeter}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'init') return 'init'
  if (phase === 'checking_cell') return 'loop'
  if (phase === 'found_land') return 'land'
  if (phase === 'add_perimeter' || phase === 'adjust_up' || phase === 'adjust_left') return 'calc'
  if (phase === 'done') return 'return'
  return 'init'
}

function GridVisualization({ step }) {
  const grid = step?.grid || []
  const i = step?.i ?? -1
  const j = step?.j ?? -1
  const perimeter = step?.perimeter ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
          Grid Visualization
        </header>
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${Math.min(grid[0]?.length || 0, 4)}, 45px)`,
          gap: 4,
        }}>
          {grid.map((row, rowIdx) => (
            row.map((cell, colIdx) => {
              if (rowIdx >= 3 || colIdx >= 4) return null
              const isCurrent = rowIdx === i && colIdx === j
              const isLand = cell === 1

              return (
                <motion.div
                  key={`${rowIdx}-${colIdx}`}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                  style={{
                    width: 45,
                    height: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCurrent && isLand ? '#fef08a' : isLand ? '#10b981' : '#dbeafe',
                    border: `2px solid ${isCurrent ? '#eab308' : isLand ? '#059669' : '#3b82f6'}`,
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    color: isCurrent && isLand ? '#713f12' : isLand ? '#ffffff' : '#1e40af',
                  }}
                >
                  {isLand ? '█' : '▪'}
                </motion.div>
              )
            })
          ))}
        </div>
      </div>

      <motion.div
        key={perimeter}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        style={{
          padding: 16,
          backgroundColor: '#fecdd3',
          borderRadius: 4,
          border: '2px solid #f87171',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>
          Perimeter
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
          {perimeter}
        </div>
      </motion.div>
    </div>
  )
}

function VisualizationPanel({ step, EXAMPLES, handleExampleClick, gridInput, setGridInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
          Grid (rows separated by semicolon)
        </label>
        <textarea
          value={gridInput}
          onChange={(e) => { setGridInput(e.target.value); handleReset() }}
          placeholder="e.g., 0,1,0,0;1,1,1,0;0,1,0,1;1,1,0,0"
          style={{
            width: '100%',
            minHeight: 80,
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <GridVisualization step={step} />

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Perimeter Calculation
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Each land cell contributes 4 edges. Subtract 2 for each shared edge with neighbors.
        </div>
      </div>
    </section>
  )
}

export default function Problem463Visualizer() {
  const [gridInput, setGridInput] = useState('0,1,0,0\n1,1,1,0\n0,1,0,1\n1,1,0,0')

  const grid = useMemo(() => {
    if (!gridInput || gridInput.trim() === '') return []
    return gridInput.split('\n').map(row => {
      return row.split(',').map(s => {
        const n = parseInt(s.trim())
        return isNaN(n) ? 0 : (n > 0 ? 1 : 0)
      })
    }).filter(row => row.length > 0)
  }, [gridInput])

  const steps = useMemo(
    () => generateSteps(grid).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [grid],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })

  const SOLUTION_CODE_WITH_CONNECTIVITY = useSolutionCode('island-perimeter') || SOLUTION_CODE

  const handleExampleClick = useCallback((ex) => {
    setGridInput(ex.grid.map(row => row.join(',')).join('\n'))
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <VisualizationPanel
          step={step}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          gridInput={gridInput}
          setGridInput={setGridInput}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    gridInput,
    autoScrollCode,
    handleReset,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
