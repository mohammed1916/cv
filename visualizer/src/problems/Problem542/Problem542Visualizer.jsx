import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem542Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def updateMatrix(mat):' },
  { line: 2, text: '    m, n = len(mat), len(mat[0])' },
  { line: 3, text: '    queue = deque()' },
  { line: 4, text: '    for i in range(m):' },
  { line: 5, text: '        for j in range(n):' },
  { line: 6, text: '            if mat[i][j] == 0:' },
  { line: 7, text: '                queue.append((i, j))' },
  { line: 8, text: '            else: mat[i][j] = -1' },
  { line: 9, text: '    while queue:' },
  { line: 10, text: '        x, y = queue.popleft()' },
  { line: 11, text: '        for dx, dy in dirs:' },
  { line: 12, text: '            nx, ny = x+dx, y+dy' },
  { line: 13, text: '            if 0 <= nx < m and 0 <= ny < n and mat[nx][ny] == -1:' },
  { line: 14, text: '                mat[nx][ny] = mat[x][y] + 1' },
  { line: 15, text: '                queue.append((nx, ny))' },
  { line: 16, text: '    return mat' },
]

function generateSteps(mat) {
  const steps = []
  const m = mat.length
  const n = mat[0].length
  const result = mat.map(r => [...r])

  steps.push({
    activeLine: 1,
    result: result.map(r => [...r]),
    message: 'Initialize BFS: find distance from each 1 to nearest 0.',
  })

  const queue = []
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (result[i][j] === 0) {
        queue.push([i, j])
      } else {
        result[i][j] = -1
      }
    }
  }

  steps.push({
    activeLine: 8,
    result: result.map(r => [...r]),
    message: `Added ${queue.length} zero positions to queue`,
  })

  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  while (queue.length > 0) {
    const [x, y] = queue.shift()

    for (const [dx, dy] of dirs) {
      const nx = x + dx
      const ny = y + dy

      if (nx >= 0 && nx < m && ny >= 0 && ny < n && result[nx][ny] === -1) {
        result[nx][ny] = result[x][y] + 1
        queue.push([nx, ny])

        steps.push({
          activeLine: 14,
          result: result.map(r => [...r]),
          currentPos: [x, y],
          nextPos: [nx, ny],
          distance: result[nx][ny],
          message: `Update [${nx}, ${ny}] to distance ${result[nx][ny]}`,
        })
      }
    }
  }

  steps.push({
    activeLine: 16,
    result: result.map(r => [...r]),
    message: 'BFS complete',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    mat: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
]

export default function Problem542Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.mat), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '📍 01 Matrix Distance',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{step?.message}</div>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ex.mat[0].length}, 50px)`,
                    gap: 4,
                  }}
                >
                  {step?.result.map((row, i) =>
                    row.map((cell, j) => {
                      const isCurrent = i === step?.currentPos?.[0] && j === step?.currentPos?.[1]
                      const isNext = i === step?.nextPos?.[0] && j === step?.nextPos?.[1]

                      const bgColor =
                        cell === 0
                          ? '#dcfce7'
                          : cell === -1
                          ? '#fef3c7'
                          : '#dbeafe'

                      return (
                        <motion.div
                          key={`${i}-${j}`}
                          animate={{ scale: isCurrent || isNext ? 1.2 : 1 }}
                          style={{
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: 14,
                            border: isCurrent || isNext ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                            backgroundColor: bgColor,
                            color: '#1e293b',
                          }}
                        >
                          {cell === -1 ? '?' : cell}
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.mat]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex <= 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
