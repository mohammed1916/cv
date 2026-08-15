import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './MinesweeperVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('minesweeper')

const PATTERNS = ['add_to_queue', 'blank_cell', 'count_mines', 'done', 'init', 'mine_hit', 'number_cell', 'process_cell', 'start_bfs']
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'mine_hit',
  4: 'start_bfs',
  7: 'process_cell',
  8: 'count_mines',
  9: 'blank_cell',
  12: 'add_to_queue',
  15: 'done'
}


const EXAMPLES = getExamples('minesweeper')

const FALLBACK_BOARD = [['E', 'E', 'E', 'E', 'E'], ['E', 'E', 'M', 'E', 'E'], ['E', 'E', 'E', 'E', 'E'], ['E', 'E', 'E', 'E', 'E']]
const FALLBACK_CLICK = [0, 0]

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

function VisualizationPanel({ step }) {
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
        <div style={{ fontSize: 12, color: '#027bba' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function MinesweeperVisualizer() {
  const [boardInput, setBoardInput] = useState(JSON.stringify(EXAMPLES[0]?.board ?? FALLBACK_BOARD))
  const [clickInput, setClickInput] = useState(JSON.stringify(EXAMPLES[0]?.click ?? FALLBACK_CLICK))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { board, click, inputError } = useMemo(() => {
    try {
      const parsedBoard = JSON.parse(boardInput)
      if (!Array.isArray(parsedBoard) || parsedBoard.length === 0) throw new Error('board must be a non-empty 2D array')
      const width = Array.isArray(parsedBoard[0]) ? parsedBoard[0].length : 0
      if (width === 0) throw new Error('board rows must be non-empty arrays')
      if (!parsedBoard.every((row) => Array.isArray(row) && row.length === width && row.every((cell) => typeof cell === 'string')))
        throw new Error('board rows must be equal-length arrays of strings')

      const parsedClick = JSON.parse(clickInput)
      if (!Array.isArray(parsedClick) || parsedClick.length !== 2 || !parsedClick.every((n) => Number.isInteger(n)))
        throw new Error('click must be [row, col]')
      const [r, c] = parsedClick
      if (r < 0 || r >= parsedBoard.length || c < 0 || c >= width)
        throw new Error('click is out of board bounds')

      return { board: parsedBoard, click: parsedClick, inputError: '' }
    } catch (e) {
      return { board: FALLBACK_BOARD, click: FALLBACK_CLICK, inputError: e.message }
    }
  }, [boardInput, clickInput])

  const steps = useMemo(
    () =>
      generateSteps(board, click).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [board, click]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setBoardInput(JSON.stringify(e.board))
    setClickInput(JSON.stringify(e.click))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'board') setBoardInput(text)
    else if (key === 'click') setClickInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '💣 Minesweeper', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

          <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />


          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 'board', label: 'board', type: 'array' },
            { key: 'click', label: 'click', type: 'array' },
          ]}
          values={{ board: boardInput, click: clickInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel step={step} />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, boardInput, clickInput, activeLabel, inputError, applyEx, handleFieldChange])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
      
    </div>
  )
}
