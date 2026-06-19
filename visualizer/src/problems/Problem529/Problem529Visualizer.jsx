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
import './Problem529Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def updateBoard(board, click):' },
  { line: 2, text: '    r, c = click' },
  { line: 3, text: '    if board[r][c] == "M": return board  # Hit mine' },
  { line: 4, text: '    queue = deque([(r, c)])' },
  { line: 5, text: '    board[r][c] = "B"  # Mark visited' },
  { line: 6, text: '    while queue:' },
  { line: 7, text: '        x, y = queue.popleft()' },
  { line: 8, text: '        mines = count_neighbors(x, y, board)' },
  { line: 9, text: '        if mines > 0: board[x][y] = str(mines)' },
  { line: 10, text: '        else: board[x][y] = "B"' },
  { line: 11, text: '        if mines == 0:' },
  { line: 12, text: '            for nx, ny in neighbors(x, y):' },
  { line: 13, text: '                if is_valid(nx, ny) and board[nx][ny]=="E":' },
  { line: 14, text: '                    queue.append((nx, ny))' },
  { line: 15, text: '    return board' },
]

function generateSteps(board, click) {
  const steps = []
  const rows = board.length
  const cols = board[0].length
  const boardState = board.map(r => [...r])
  const visited = new Set()

  const countMines = (r, c) => {
    let count = 0
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && boardState[nr][nc] === 'M') count++
      }
    }
    return count
  }

  const getNeighbors = (r, c) => {
    const neighbors = []
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) neighbors.push([nr, nc])
      }
    }
    return neighbors
  }

  const [r, c] = click

  steps.push({
    activeLine: 2,
    boardState: boardState.map(r => [...r]),
    clickPos: [r, c],
    visited: new Set(),
    message: `Click at [${r}, ${c}]`,
  })

  if (boardState[r][c] === 'M') {
    boardState[r][c] = 'X'
    steps.push({
      activeLine: 3,
      boardState: boardState.map(r => [...r]),
      clickPos: [r, c],
      visited: new Set(),
      hitMine: true,
      message: 'Hit a mine! Game over.',
    })
    return steps
  }

  const queue = [[r, c]]
  boardState[r][c] = 'B'
  visited.add(`${r},${c}`)

  while (queue.length > 0) {
    const [x, y] = queue.shift()

    const mines = countMines(x, y)

    steps.push({
      activeLine: 8,
      boardState: boardState.map(r => [...r]),
      clickPos: [r, c],
      visited: new Set(visited),
      currentPos: [x, y],
      mineCount: mines,
      message: `Process [${x}, ${y}]: ${mines} adjacent mines`,
    })

    if (mines > 0) {
      boardState[x][y] = mines.toString()
      steps.push({
        activeLine: 9,
        boardState: boardState.map(r => [...r]),
        clickPos: [r, c],
        visited: new Set(visited),
        currentPos: [x, y],
        mineCount: mines,
        message: `Mark [${x}, ${y}] with ${mines}`,
      })
    } else {
      boardState[x][y] = 'B'
      steps.push({
        activeLine: 10,
        boardState: boardState.map(r => [...r]),
        clickPos: [r, c],
        visited: new Set(visited),
        currentPos: [x, y],
        mineCount: mines,
        message: `Mark [${x}, ${y}] as blank, add neighbors to queue`,
      })

      getNeighbors(x, y).forEach(([nx, ny]) => {
        if (!visited.has(`${nx},${ny}`) && boardState[nx][ny] === 'E') {
          queue.push([nx, ny])
          visited.add(`${nx},${ny}`)
        }
      })
    }
  }

  steps.push({
    activeLine: 15,
    boardState: boardState.map(r => [...r]),
    clickPos: [r, c],
    visited: new Set(visited),
    complete: true,
    message: 'Board update complete',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    board: [['E', 'E', 'E'], ['E', 'M', 'E'], ['E', 'E', 'E']],
    click: [0, 0],
  },
  {
    label: 'Example 2',
    board: [['B', '1', 'E', '1', 'B'], ['B', '1', 'E', '1', 'B'], ['B', 'B', 'E', 'B', 'B'], ['M', '1', '1', '1', 'B'], ['B', 'B', 'B', 'B', 'B']],
    click: [4, 2],
  },
]

export default function Problem529Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.board, ex.click), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const getCellColor = (cell, isClicked, isVisited, isCurrent) => {
    if (isCurrent) return '#0ea5e9'
    if (isClicked) return '#fbbf24'
    if (isVisited) return '#d1d5db'
    if (cell === 'E') return '#f3f4f6'
    if (cell === 'M') return '#fecaca'
    if (cell === 'X') return '#ef4444'
    return '#dbeafe'
  }

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
        title: '💣 Minesweeper Board',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11, minHeight: 40 }}>
                  <div style={{ fontWeight: 600 }}>{step.message}</div>
                </div>

                {/* Board Grid */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ex.board[0].length}, 40px)`, gap: 4 }}>
                    {ex.board.map((row, r) =>
                      row.map((cell, c) => {
                        const isClicked = r === step.clickPos?.[0] && c === step.clickPos?.[1]
                        const isVisited = step.visited?.has(`${r},${c}`)
                        const isCurrent = r === step.currentPos?.[0] && c === step.currentPos?.[1]
                        const displayCell = step.boardState?.[r]?.[c] ?? cell

                        return (
                          <motion.div
                            key={`${r}-${c}`}
                            animate={{ scale: isCurrent ? 1.1 : 1 }}
                            style={{
                              width: 40,
                              height: 40,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              fontWeight: 700,
                              fontSize: 14,
                              border: isCurrent ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                              backgroundColor: getCellColor(displayCell, isClicked, isVisited, isCurrent),
                              color: ['M', 'X'].includes(displayCell) ? '#fff' : '#1e293b',
                            }}
                          >
                            {displayCell === 'E' ? '' : displayCell === 'B' ? '' : displayCell}
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Info */}
                {step.mineCount !== undefined && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Current Position</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>
                        [{step.currentPos?.[0]}, {step.currentPos?.[1]}]
                      </div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Adjacent Mines</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>{step.mineCount}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.board]
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
