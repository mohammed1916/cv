import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem289Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: 'def gameOfLife(board):' },
    { line: 2, text: '    next_board = copy(board)' },
    { line: 3, text: '    for row, col in every_cell(board):' },
    { line: 4, text: '        live_neighbors = count_live_neighbors(board, row, col)' },
    { line: 5, text: '        next_board[row][col] = lives_next(board[row][col], live_neighbors)' },
    { line: 6, text: '    board[:] = next_board' },
]

function generateSteps(input) {
    const board = Array.isArray(input?.[0]) && Array.isArray(input[0]?.[0]) ? input[0] : input
    const steps = []
    if (!Array.isArray(board) || board.length === 0 || !Array.isArray(board[0])) {
        return [{
            phase: 'init',
            activeLine: 1,
            message: 'Enter a non-empty 0/1 grid to simulate one Game of Life generation.',
            board: [],
            newBoard: null,
            currentCell: null,
        }]
    }

    const rows = board.length
    const cols = board[0]?.length || 0
    const originalBoard = JSON.parse(JSON.stringify(board))
    const newBoard = JSON.parse(JSON.stringify(board))

    steps.push({
        phase: 'init',
        activeLine: 1,
        message: `Game of Life: ${rows}x${cols} grid. Checking neighbors for each cell...`,
        board: originalBoard,
        newBoard: null,
        currentCell: null,
    })

    let cellsChanged = 0

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let liveNeighbors = 0

            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue
                    const ni = i + di
                    const nj = j + dj
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                        if (board[ni][nj] === 1) liveNeighbors++
                    }
                }
            }

            const wasAlive = board[i][j] === 1
            let willLive = false

            if (wasAlive) {
                willLive = liveNeighbors === 2 || liveNeighbors === 3
            } else {
                willLive = liveNeighbors === 3
            }

            if (wasAlive !== willLive) cellsChanged++
            newBoard[i][j] = willLive ? 1 : 0

            steps.push({
                phase: 'evaluate',
                activeLine: 5,
                message: `Cell [${i}][${j}]: ${liveNeighbors} neighbors, ${wasAlive ? 'alive' : 'dead'} -> ${willLive ? 'LIVES' : 'dies'}`,
                board: originalBoard,
                newBoard: newBoard,
                currentCell: { row: i, col: j },
                liveNeighbors: liveNeighbors,
                willLive: willLive,
            })
        }
    }

    const aliveCount = newBoard.reduce((sum, row) =>
        sum + row.reduce((s, cell) => s + (cell === 1 ? 1 : 0), 0), 0)

    steps.push({
        phase: 'done',
        activeLine: 6,
        message: `Generation complete: ${cellsChanged} cells changed, ${aliveCount} alive`,
        board: newBoard,
        newBoard: null,
    })

    return steps
}

export default function Problem289Visualizer() {
    const examples = useMemo(() => getExamplesOr('289', []), [])
    const [currentExample, setCurrentExample] = useState(0)
  const [inputInput, setInputInput] = useState(JSON.stringify(examples[0]?.input ?? []));
  const { input, inputError } = useMemo(() => {
    try {
      const parsedInput = JSON.parse(inputInput); if (!Array.isArray(parsedInput)) throw new Error('input must be an array');
      return { input: parsedInput, inputError: '' };
    } catch (e) {
      return { input: examples[currentExample]?.input ?? '', inputError: e.message };
    }
  }, [inputInput]);
    const [currentStep, setCurrentStep] = useState(0)

    const example = examples[currentExample] || { input: [], output: [] }
const applyEx = useCallback((i) => { setCurrentExample(i); setInputInput(JSON.stringify(examples[i].input)); setCurrentStep(0); }, [setCurrentStep]);
      const steps = useMemo(() => generateSteps(input), [input])
    const step = steps[currentStep] || steps[0] || {
      message: 'No visualization step is available for this input.',
      activeLine: 1,
      board: [],
      newBoard: null,
      currentCell: null,
    }

    const { isPlaying, setIsPlaying, canNext, canPrev } = usePlaybackState(steps, currentStep, setCurrentStep)
    const { pattern, togglePattern } = usePatternOverlay(false)

    const panelConfigs = useMemo(() => [
      { id: 'main', title: "Visualization" },
      { id: 'bottom', title: "Code Trace", dockMode: 'split-bottom' },
    ], [])
    const panelContents = {
      main: (<>
<ManualInputPanel
          fields={[{"key":"input","label":"input","type":"string"}]}
          values={{ input: inputInput }}
          onChange={(k, v) => { if (k === 'input') setInputInput(v) }}
          examples={examples}
          activeLabel={examples[currentExample]?.label}
          applyExample={(e) => applyEx(examples.indexOf(e))}
          inputError={inputError}
        />
<div className="problem289-visualizer-viz-panel">
                    <div className="problem289-visualizer-canvas">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="problem289-visualizer-content"
                        >
                            <p>{step.message}</p>
                        </motion.div>
                    </div>
                </div>
</>),
      bottom: (<CodeTracePanel
                    code={SOLUTION_CODE}
                    activeLine={step.activeLine}
                    onTogglePattern={togglePattern}
                    patternActive={pattern}
                />),
    }
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
          {panelDivs && (
            <>
              {panelDivs.main && createPortal(panelContents.main, panelDivs.main)}
              {panelDivs.bottom && createPortal(panelContents.bottom, panelDivs.bottom)}
            </>
          )}
          {createPortal(<FloatingPanel title="Playback Controls"><PlaybackControls onReset={() => setCurrentStep(0)} onNext={() => setCurrentStep((current) => Math.min(steps.length - 1, current + 1))} onPrev={() => setCurrentStep((current) => Math.max(0, current - 1))} onPlayToggle={() => setIsPlaying(!isPlaying)} isPlaying={isPlaying} canNext={canNext} canPrev={canPrev} /></FloatingPanel>, document.body)}
        </>
    )
}
