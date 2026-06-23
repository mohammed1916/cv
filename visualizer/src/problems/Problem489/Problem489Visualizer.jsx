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
import { getExamples } from '../../config/examplesRegistry'
import './Problem489Visualizer.css'

const EXAMPLES = getExamples('robot-room-cleaner') || [
  { label: 'Example 1', room: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
  { label: 'Example 2', room: [[1, 0, 1], [1, 1, 1], [1, 0, 1]] },
]

function generateSteps(room) {
  const steps = []
  const visited = new Set()
  let robotR = 0, robotC = 0
  let direction = 0 // 0: up, 1: right, 2: down, 3: left
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]]
  const dirLabels = ['⬆', '➡', '⬇', '⬅']

  steps.push({
    activeLine: 1,
    robotR,
    robotC,
    direction: dirLabels[direction],
    visited: new Set(),
    cleaned: [],
    message: 'Start DFS robot cleaning from (0,0) facing up'
  })

  function dfs(r, c, d) {
    visited.add(`${r},${c}`)

    steps.push({
      activeLine: 2,
      robotR: r,
      robotC: c,
      direction: dirLabels[d],
      visited,
      cleaned: Array.from(visited),
      message: `Visit and clean cell (${r},${c})`
    })

    for (let i = 0; i < 4; i++) {
      const newD = (d + i) % 4
      const [dr, dc] = directions[newD]
      const nr = r + dr
      const nc = c + dc

      if (nr >= 0 && nr < room.length && nc >= 0 && nc < room[0].length &&
          room[nr][nc] === 1 && !visited.has(`${nr},${nc}`)) {

        steps.push({
          activeLine: 3,
          robotR: r,
          robotC: c,
          direction: dirLabels[newD],
          visited,
          cleaned: Array.from(visited),
          message: `Found unvisited cell (${nr},${nc}). Turn to ${dirLabels[newD]}.`
        })

        dfs(nr, nc, newD)
      }
    }

    steps.push({
      activeLine: 4,
      robotR: r,
      robotC: c,
      direction: dirLabels[d],
      visited,
      cleaned: Array.from(visited),
      message: `Backtrack from (${r},${c})`
    })
  }

  dfs(robotR, robotC, direction)

  steps.push({
    activeLine: 5,
    robotR: 0,
    robotC: 0,
    direction: dirLabels[0],
    visited,
    cleaned: Array.from(visited),
    done: true,
    message: `Done! Cleaned ${visited.size} cells.`
  })

  return steps
}

function VisualizationPanel({ room, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#165a40', fontStyle: 'italic' }}>
          Clean all accessible cells in the room using only 4 API methods: move(), turnRight(), canMove(), clean().
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Room Layout</div>
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${room[0].length}, 1fr)`,
          gap: 4
        }}>
          {room.map((row, r) => row.map((cell, c) => {
            const isCleaned = step?.cleaned?.includes(`${r},${c}`)
            const isRobot = step && step.robotR === r && step.robotC === c
            return (
              <motion.div
                key={`cell-${r}-${c}`}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: cell === 0 ? '#000' : isCleaned ? '#d1fae5' : '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 18,
                  color: isRobot ? '#0284c7' : '#000'
                }}
                animate={{ scale: isRobot ? 1.2 : 1 }}
              >
                {isRobot ? '🤖' : ''}
              </motion.div>
            )
          }))}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#d1fae5',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 12 }}>
            Robot Status
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#065f46', marginBottom: 4 }}>Row</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{step.robotR}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#065f46', marginBottom: 4 }}>Col</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{step.robotC}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#065f46', marginBottom: 4 }}>Facing</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{step.direction}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#065f46', marginBottom: 4 }}>Cleaned</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{step.cleaned?.length || 0}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>DFS Progress</div>
        <div style={{ fontSize: 12, color: '#10b981' }}>
          {step?.message || 'Initializing...'}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem489Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])

  const steps = useMemo(
    () =>
      generateSteps(ex.room).map((current) => ({
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
      title: '🤖 Robot Room Cleaner',
      content: (
        <VisualizationPanel
          room={ex.room}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
