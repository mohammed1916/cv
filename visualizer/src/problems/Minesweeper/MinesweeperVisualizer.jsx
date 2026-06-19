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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './MinesweeperVisualizer.css'

const EXAMPLES = getExamples('minesweeper')

function generateSteps(board, click) {
  const steps = []
  const boardCopy = board.map(row => [...row])
  const [r, c] = click

  steps.push({
    activeLine: 1,
    board: boardCopy.map(row => [...row]),
    r,
    c,
    phase: 'init',
    message: `Click at [${r}, ${c}]`,
    relatedLines: [1]
  })

  if (boardCopy[r][c] === 'M') {
    steps.push({
      activeLine: 3,
      board: boardCopy,
      r,
      c,
      phase: 'mine_hit',
      message: `Hit a mine at [${r}, ${c}]! Game over.`,
      relatedLines: [3],
      done: true
    })
    return steps
  }

  steps.push({
    activeLine: 4,
    board: boardCopy.map(row => [...row]),
    r,
    c,
    queue: [[r, c]],
    phase: 'start_bfs',
    message: `No mine. Starting BFS from [${r}, ${c}]`,
    relatedLines: [4]
  })

  const queue = [[r, c]]
  const visited = new Set()
  visited.add(`${r},${c}`)
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()

    steps.push({
      activeLine: 7,
      board: boardCopy.map(row => [...row]),
      cr,
      cc,
      queue: queue.map(q => [...q]),
      phase: 'process_cell',
      message: `Process cell [${cr}, ${cc}]`,
      relatedLines: [7]
    })

    let mineCount = 0
    for (const [dr, dc] of directions) {
      const nr = cr + dr
      const nc = cc + dc
      if (nr >= 0 && nr < boardCopy.length && nc >= 0 && nc < boardCopy[0].length) {
        if (boardCopy[nr][nc] === 'M') {
          mineCount++
        }
      }
    }

    steps.push({
      activeLine: 8,
      board: boardCopy.map(row => [...row]),
      cr,
      cc,
      mineCount,
      phase: 'count_mines',
      message: `Found ${mineCount} adjacent mines`,
      relatedLines: [8]
    })

    if (mineCount === 0) {
      boardCopy[cr][cc] = 'B'
      steps.push({
        activeLine: 9,
        board: boardCopy.map(row => [...row]),
        cr,
        cc,
        phase: 'blank_cell',
        message: `Mark [${cr}, ${cc}] as blank`,
        relatedLines: [9]
      })

      for (const [dr, dc] of directions) {
        const nr = cr + dr
        const nc = cc + dc
        if (nr >= 0 && nr < boardCopy.length && nc >= 0 && nc < boardCopy[0].length) {
          const key = `${nr},${nc}`
          if (!visited.has(key) && boardCopy[nr][nc] === 'E') {
            visited.add(key)
            queue.push([nr, nc])

            steps.push({
              activeLine: 12,
              board: boardCopy.map(row => [...row]),
              nr,
              nc,
              queue: queue.map(q => [...q]),
              phase: 'add_to_queue',
              message: `Add unrevealed neighbor [${nr}, ${nc}] to queue`,
              relatedLines: [12]
            })
          }
        }
      }
    } else {
      boardCopy[cr][cc] = String(mineCount)
      steps.push({
        activeLine: 9,
        board: boardCopy.map(row => [...row]),
        cr,
        cc,
        mineCount,
        phase: 'number_cell',
        message: `Mark [${cr}, ${cc}] with number ${mineCount}`,
        relatedLines: [9]
      })
    }
  }

  steps.push({
    activeLine: 15,
    board: boardCopy,
    phase: 'done',
    message: `Minesweeper board updated`,
    relatedLines: [15],
    done: true
  })

  return steps
}

function VisualizationPanel({ board, click, step, applyEx }) {
  const getColor = (cell) => {
    if (cell === 'M') return { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', icon: '💣' }
    if (cell === 'E') return { bg: '#e5e7eb', border: '#6b7280', text: '#1f2937', icon: '?' }
    if (cell === 'X') return { bg: '#fca5a5', border: '#dc2626', text: '#7f1d1d', icon: '💥' }
    if (cell === 'B') return { bg: '#dbeafe', border: '#0284c7', text: '#0c4a6e', icon: '·' }
    return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: cell }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Sweep minesweeper board using BFS, revealing safe cells and counting adjacent mines."
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

      {/* Board */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Board State</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${step?.board[0]?.length || 5}, 1fr)`, gap: 4 }}>
          {step?.board?.map((row, r) =>
            row.map((cell, c) => {
              const color = getColor(cell)
              const isClick = r === step?.r && c === step?.c
              const isCurrent = r === step?.cr && c === step?.cc
              return (
                <motion.div
                  key={`cell-${r}-${c}`}
                  style={{
                    width: 50,
                    height: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: `2px solid ${color.border}`,
                    backgroundColor: color.bg,
                    color: color.text,
                    fontSize: 18,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  animate={{ scale: isCurrent ? 1.15 : isClick ? 1.1 : 1 }}
                >
                  {color.icon}
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Status */}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#0284c7' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function MinesweeperVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { board: [['E','E','E','E','E'],['E','E','M','E','E'],['E','E','E','E','E'],['E','E','E','E','E']], click: [0, 0] })
  const SOLUTION_CODE = useSolutionCode('minesweeper')

  const steps = useMemo(
    () =>
      generateSteps(ex.board, ex.click).map((current) => ({
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
      title: '💣 Minesweeper',
      content: (
        <VisualizationPanel
          board={ex.board}
          click={ex.click}
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
