import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem490Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('the-maze')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamplesOr('the-maze', [
  { label: 'Example 1', maze: [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start: [0,4], destination: [4,4] },
  { label: 'Example 2', maze: [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start: [0,4], destination: [3,2] },
])

function generateSteps(maze, start, destination) {
  const steps = []
  const visited = new Set()
  const queue = [[...start, 0]]
  visited.add(`${start[0]},${start[1]}`)
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  const dirLabels = ['→', '↓', '←', '↑']
  let found = false

  steps.push({
    activeLine: 1,
    queue,
    visited,
    current: start,
    path: [],
    found: false,
    maze,
    message: 'Start BFS: ball rolling in maze'
  })

  while (queue.length > 0 && !found) {
    const [r, c, dist] = queue.shift()

    steps.push({
      activeLine: 2,
      queue,
      visited,
      current: [r, c],
      path: [],
      found: false,
      maze,
      message: `Dequeue (${r},${c})`
    })

    if (r === destination[0] && c === destination[1]) {
      found = true
      steps.push({
        activeLine: 3,
        queue,
        visited,
        current: [r, c],
        path: [],
        found: true,
        maze,
        message: `Found destination at (${r},${c})!`,
        done: true
      })
      break
    }

    for (let d = 0; d < 4; d++) {
      const [dr, dc] = directions[d]
      let nr = r + dr
      let nc = c + dc
      let dist = 1

      while (nr >= 0 && nr < maze.length && nc >= 0 && nc < maze[0].length && maze[nr][nc] === 0) {
        nr += dr
        nc += dc
        dist++
      }
      nr -= dr
      nc -= dc

      if (nr >= 0 && nr < maze.length && nc >= 0 && nc < maze[0].length && !visited.has(`${nr},${nc}`)) {
        visited.add(`${nr},${nc}`)
        queue.push([nr, nc, dist])

        steps.push({
          activeLine: 4,
          queue,
          visited,
          current: [r, c],
          path: [],
          found: false,
          maze,
          message: `Roll ${dirLabels[d]} to (${nr},${nc})`
        })
      }
    }
  }

  if (!found) {
    steps.push({
      activeLine: 5,
      queue: [],
      visited,
      current: start,
      path: [],
      found: false,
      maze,
      done: true,
      message: 'Destination not reachable'
    })
  }

  return steps
}

function VisualizationPanel({ maze, start, destination, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, borderLeft: '4px solid #6366f1' }}>
        <div style={{ fontSize: 12, color: '#312e81', fontStyle: 'italic' }}>
          Ball rolls until hitting wall. Use BFS to find if destination is reachable.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Maze</div>
        <div style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${maze[0].length}, 1fr)`,
          gap: 2
        }}>
          {maze.map((row, r) => row.map((cell, c) => {
            const isStart = r === start[0] && c === start[1]
            const isDestination = r === destination[0] && c === destination[1]
            const isVisited = step?.visited?.has(`${r},${c}`)
            return (
              <motion.div
                key={`m-${r}-${c}`}
                style={{
                  width: 30,
                  height: 30,
                  backgroundColor: cell === 1 ? '#1f2937' : isVisited ? '#c7d2fe' : '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700
                }}
                animate={{ scale: isStart || isDestination ? 1.1 : 1 }}
              >
                {isStart ? 'S' : isDestination ? 'D' : ''}
              </motion.div>
            )
          }))}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#c7d2fe',
            borderRadius: 6,
            border: '2px solid #6366f1'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#312e81', marginBottom: 12 }}>
            BFS State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#312e81', marginBottom: 4 }}>Current</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6063f1' }}>({step.current[0]},{step.current[1]})</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#312e81', marginBottom: 4 }}>Visited</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6063f1' }}>{step.visited?.size || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#312e81', marginBottom: 4 }}>Queue Size</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6063f1' }}>{step.queue?.length || 0}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#027bba' }}>
          {step?.found ? '✓ Reachable' : step?.done ? '✗ Not Reachable' : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#027bba', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem490Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [mazeInput, setMazeInput] = useState("[[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]]");
  const [startInput, setStartInput] = useState("[0,0]");
  const [destinationInput, setDestinationInput] = useState("[4,4]");
  const { maze, start, destination, inputError } = useMemo(() => {
    try {
      const parsedMaze = JSON.parse(mazeInput); if (!Array.isArray(parsedMaze)) throw new Error('maze must be an array');
      const parsedStart = JSON.parse(startInput); if (!Array.isArray(parsedStart)) throw new Error('start must be an array');
      const parsedDestination = JSON.parse(destinationInput); if (!Array.isArray(parsedDestination)) throw new Error('destination must be an array');
      return { maze: parsedMaze, start: parsedStart, destination: parsedDestination, inputError: '' };
    } catch (e) {
      return { maze: "[[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]]", start: "[0,0]", destination: "[4,4]", inputError: e.message };
    }
  }, [mazeInput, startInput, destinationInput]);

  const steps = useMemo(
    () =>
      generateSteps(maze, start, destination).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [maze, start, destination]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setMazeInput(JSON.stringify(e.maze)); setStartInput(JSON.stringify(e.start)); setDestinationInput(JSON.stringify(e.destination)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎱 The Maze', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          maze={maze}
          start={start}
          destination={destination}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"maze","label":"maze","type":"array"},{"key":"start","label":"start","type":"array"},{"key":"destination","label":"destination","type":"array"}]}
          values={{ maze: mazeInput, start: startInput, destination: destinationInput }}
          onChange={(k, v) => { if (k === 'maze') setMazeInput(v); if (k === 'start') setStartInput(v); if (k === 'destination') setDestinationInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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

