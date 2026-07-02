import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem499Visualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('the-maze-iii')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  4: 'init',


  7: 'loop',


  8: 'loop',


  9: 'loop',


  15: 'loop',


  16: 'done',


}

const EXAMPLES = getExamples('the-maze-iii') || [
  { label: 'Example', maze: [[0,0,0,0,0],[1,1,0,0,1],[0,0,0,0,0],[0,1,0,0,1],[0,1,0,0,0]], ball: [4,3], hole: [0,1] },
]

const DIRS = [[-1, 0, 'u'], [0, -1, 'l'], [0, 1, 'r'], [1, 0, 'd']]

// Lexicographically smaller (dist, path) tuple
function lessThan(a, b) {
  if (a.dist !== b.dist) return a.dist < b.dist
  return a.path < b.path
}

function generateSteps(maze, ball, hole) {
  const steps = []
  const m = maze.length
  const n = maze[0].length
  const key = (r, c) => `${r},${c}`

  // Simple array-based priority queue ordered by (dist, path)
  const heap = [{ dist: 0, path: '', r: ball[0], c: ball[1] }]
  const seen = {}

  steps.push({
    activeLine: 4,
    maze, ball, hole,
    current: ball,
    seen: {},
    heapSize: heap.length,
    best: 'impossible',
    path: '',
    message: 'Init heap with ball at start (distance 0, empty path)',
  })

  while (heap.length > 0) {
    // pop the lexicographically smallest (dist, path)
    let minIdx = 0
    for (let i = 1; i < heap.length; i++) {
      if (lessThan(heap[i], heap[minIdx])) minIdx = i
    }
    const node = heap.splice(minIdx, 1)[0]
    const { dist, path, r, c } = node

    steps.push({
      activeLine: 7,
      maze, ball, hole,
      current: [r, c],
      seen: { ...seen },
      heapSize: heap.length,
      best: seen[key(hole[0], hole[1])]?.path ?? 'impossible',
      path,
      dist,
      message: `Pop (${r},${c}) — dist ${dist}, path "${path || '∅'}"`,
    })

    if (seen[key(r, c)]) {
      steps.push({
        activeLine: 8,
        maze, ball, hole,
        current: [r, c],
        seen: { ...seen },
        heapSize: heap.length,
        best: seen[key(hole[0], hole[1])]?.path ?? 'impossible',
        path,
        dist,
        message: `(${r},${c}) already finalized — skip`,
      })
      continue
    }

    seen[key(r, c)] = { dist, path }
    steps.push({
      activeLine: 9,
      maze, ball, hole,
      current: [r, c],
      seen: { ...seen },
      heapSize: heap.length,
      best: seen[key(hole[0], hole[1])]?.path ?? 'impossible',
      path,
      dist,
      message: `Finalize (${r},${c}) with best path "${path || '∅'}"`,
    })

    // If we just finalized the hole, no need to roll further from it
    if (r === hole[0] && c === hole[1]) continue

    for (const [dr, dc, ch] of DIRS) {
      let nr = r
      let nc = c
      let d = 0
      // roll until wall or boundary, stopping early if we pass the hole
      while (nr + dr >= 0 && nr + dr < m && nc + dc >= 0 && nc + dc < n && maze[nr + dr][nc + dc] === 0) {
        nr += dr
        nc += dc
        d++
        if (nr === hole[0] && nc === hole[1]) break
      }

      heap.push({ dist: dist + d, path: path + ch, r: nr, c: nc })
      steps.push({
        activeLine: 15,
        maze, ball, hole,
        current: [r, c],
        rollTo: [nr, nc],
        seen: { ...seen },
        heapSize: heap.length,
        best: seen[key(hole[0], hole[1])]?.path ?? 'impossible',
        path,
        dist,
        message: `Roll '${ch}' → stop at (${nr},${nc}), dist ${dist + d}, path "${path + ch}"`,
      })
    }
  }

  const result = seen[key(hole[0], hole[1])]?.path ?? 'impossible'
  steps.push({
    activeLine: 16,
    maze, ball, hole,
    current: hole,
    seen: { ...seen },
    heapSize: 0,
    best: result,
    path: result === 'impossible' ? '' : result,
    done: true,
    message: result === 'impossible'
      ? 'Hole unreachable → "impossible"'
      : `Shortest lexicographic path to hole: "${result}"`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#92400e', fontSize: 13 }}>
        Press play to roll the ball through the maze.
      </div>
    )
  }
  const { maze, ball, hole, current, rollTo, seen = {} } = step
  const key = (r, c) => `${r},${c}`
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Ball rolls (u/l/r/d) until hitting a wall, but stops if it drops into the hole.
          Dijkstra finds the shortest path; ties broken by lexicographically smallest direction string.
        </div>
      </div>

      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${maze[0].length}, 1fr)`, gap: 2 }}>
        {maze.map((row, r) => row.map((val, c) => {
          const isBall = r === ball[0] && c === ball[1]
          const isHole = r === hole[0] && c === hole[1]
          const isCurrent = current && r === current[0] && c === current[1]
          const isRollTo = rollTo && r === rollTo[0] && c === rollTo[1]
          const isSeen = seen[key(r, c)] != null
          let bg = '#fef3c7'
          if (val === 1) bg = '#1f2937'
          else if (isSeen) bg = '#fde68a'
          return (
            <motion.div
              key={`z${r}${c}`}
              style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: bg,
                border: isCurrent ? '3px solid #dc2626' : isRollTo ? '3px solid #2563eb' : '1px solid #f59e0b',
                fontSize: 11, fontWeight: 700, color: isHole ? '#b91c1c' : '#92400e',
              }}
              animate={{ scale: isCurrent ? 1.15 : isBall || isHole ? 1.05 : 1 }}
            >
              {isHole ? 'H' : isBall ? 'B' : isCurrent ? '●' : ''}
            </motion.div>
          )
        }))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fffbeb', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Current dist</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{step.dist ?? '—'}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fffbeb', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Heap size</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{step.heapSize ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fffbeb', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 11, color: '#92400e' }}>Finalized</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b' }}>{Object.keys(seen).length}</div>
        </div>
      </div>

      <motion.div
        style={{ padding: 16, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b', textAlign: 'center' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Best path to hole</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>
          {step.done ? (step.best === 'impossible' ? 'impossible' : step.best) : (step.best && step.best !== 'impossible' ? step.best : 'searching…')}
        </div>
        <div style={{ fontSize: 12, color: '#92400e', marginTop: 8 }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem499Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.maze, ex.ball, ex.hole).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
    { id: 'viz', title: '🎱 Maze III', content: (<VisualizationPanel step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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

