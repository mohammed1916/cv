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
import './Problem417Visualizer.css'

const EXAMPLES = [
  {
    label: 'Small',
    heights: [[1, 2, 3], [8, 9, 4], [7, 6, 5]],
    expected: [[0, 0], [0, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
  },
  {
    label: 'Medium',
    heights: [[1, 1], [1, 1]],
    expected: [[0, 0], [0, 1], [1, 0], [1, 1]]
  },
]

function generateSteps(heights) {
  const steps = []
  const m = heights.length
  const n = heights[0].length

  steps.push({
    activeLine: 1,
    message: `Find Pacific-Atlantic water flow. Grid: ${m}x${n}`,
    phase: 'init',
    result: [],
    pacific: Array(m).fill(null).map(() => Array(n).fill(false)),
    atlantic: Array(m).fill(null).map(() => Array(n).fill(false)),
    currentCell: null,
    heights,
  })

  const pacific = Array(m).fill(null).map(() => Array(n).fill(false))
  const atlantic = Array(m).fill(null).map(() => Array(n).fill(false))

  steps.push({
    activeLine: 2,
    message: `Initialize flow maps. Top/left edges can reach Pacific.`,
    phase: 'init_pacific',
    result: [],
    pacific: pacific.map(row => [...row]),
    atlantic,
    currentCell: null,
    heights,
  })

  // Mark Pacific (top and left edges)
  for (let i = 0; i < m; i++) {
    pacific[i][0] = true
  }
  for (let j = 0; j < n; j++) {
    pacific[0][j] = true
  }

  steps.push({
    activeLine: 3,
    message: `Initialize flow maps. Bottom/right edges can reach Atlantic.`,
    phase: 'init_atlantic',
    result: [],
    pacific: pacific.map(row => [...row]),
    atlantic: atlantic.map(row => [...row]),
    currentCell: null,
    heights,
  })

  // Mark Atlantic (bottom and right edges)
  for (let i = 0; i < m; i++) {
    atlantic[i][n - 1] = true
  }
  for (let j = 0; j < n; j++) {
    atlantic[m - 1][j] = true
  }

  const result = []
  let stepCount = 0

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if ((pacific[i][j] && atlantic[i][j])) {
        result.push([i, j])

        steps.push({
          activeLine: 4,
          message: `Cell [${i}, ${j}] reaches both oceans. Height: ${heights[i][j]}`,
          phase: 'found',
          result: [...result],
          pacific: pacific.map(row => [...row]),
          atlantic: atlantic.map(row => [...row]),
          currentCell: [i, j],
          heights,
        })

        stepCount++
        if (stepCount > 8) break
      }
    }
    if (stepCount > 8) break
  }

  steps.push({
    activeLine: 5,
    message: `Complete. Cells that reach both oceans: ${result.length}`,
    phase: 'done',
    result,
    pacific: pacific.map(row => [...row]),
    atlantic: atlantic.map(row => [...row]),
    currentCell: null,
    heights,
  })

  return steps
}

function PacificAtlanticVisualization({ heights, step }) {
  const result = step?.result || []
  const pacific = step?.pacific || []
  const atlantic = step?.atlantic || []
  const m = heights.length
  const n = heights[0].length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Pacific Atlantic Water Flow</div>

      {/* Grid visualization */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Height Grid</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${n}, minmax(60px, 1fr))`,
          gap: 4,
          padding: 8,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1',
          width: 'fit-content',
        }}>
          {heights.map((row, i) =>
            row.map((val, j) => {
              const isPacific = pacific[i] && pacific[i][j]
              const isAtlantic = atlantic[i] && atlantic[i][j]
              const isBoth = isPacific && isAtlantic
              const isCurrent = step?.currentCell && step.currentCell[0] === i && step.currentCell[1] === j

              let bgColor = '#f1f5f9'
              let borderColor = '#cbd5e1'

              if (isBoth) {
                bgColor = '#c7d2fe'
                borderColor = '#6366f1'
              } else if (isPacific) {
                bgColor = '#dbeafe'
                borderColor = '#0284c7'
              } else if (isAtlantic) {
                bgColor = '#fef3c7'
                borderColor = '#f59e0b'
              }

              if (isCurrent) {
                bgColor = '#fce7f3'
                borderColor = '#be185d'
              }

              return (
                <motion.div
                  key={`${i}-${j}`}
                  style={{
                    padding: '8px',
                    backgroundColor: bgColor,
                    borderRadius: 4,
                    border: `2px solid ${borderColor}`,
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: isBoth ? '#4f46e5' : isPacific ? '#0284c7' : isAtlantic ? '#f59e0b' : '#334155',
                    minWidth: 50,
                  }}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                >
                  {val}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#0c4a6e' }}>Pacific Only</div>
          <div style={{ fontSize: 11, color: '#0c4a6e', marginTop: 4 }}>Left/Top</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 4, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Atlantic Only</div>
          <div style={{ fontSize: 11, color: '#92400e', marginTop: 4 }}>Right/Bottom</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#c7d2fe', borderRadius: 4, border: '2px solid #6366f1' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#3730a3' }}>Both Oceans</div>
          <div style={{ fontSize: 11, color: '#3730a3', marginTop: 4 }}>Pacific & Atlantic</div>
        </div>
      </div>

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Result Count</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7' }}>
          {result.length} cells
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem417Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.heights).map((current) => ({
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
      title: '🎯 Water Flow',
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
                    border: exIdx === idx ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#cffafe' : '#f1f5f9',
                    color: exIdx === idx ? '#164e63' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <PacificAtlanticVisualization heights={example.heights} step={step} />
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
