import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SurroundedRegionsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('surrounded-regions', [
  { label: 'Example 1', board: [['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'X', 'O', 'X'], ['X', 'O', 'X', 'X']] },
  { label: 'Example 2', board: [['X', 'O', 'X'], ['O', 'X', 'O']] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def solve(board):' },
  { line: 2, text: '    if not board: return' },
  { line: 3, text: '    rows, cols = len(board), len(board[0])' },
  { line: 4, text: '    visited = set()' },
  { line: 5, text: '    def dfs(r, c):' },
  { line: 6, text: '        if r<0 or r>=rows or c<0 or c>=cols: return' },
  { line: 7, text: '        if (r,c) in visited or board[r][c]=="X": return' },
  { line: 8, text: '        visited.add((r, c))' },
  { line: 9, text: '        dfs(r+1, c); dfs(r-1, c)' },
  { line: 10, text: '        dfs(r, c+1); dfs(r, c-1)' },
  { line: 11, text: '    for r in range(rows):' },
  { line: 12, text: '        dfs(r, 0); dfs(r, cols-1)' },
  { line: 13, text: '    for c in range(cols):' },
  { line: 14, text: '        dfs(0, c); dfs(rows-1, c)' },
  { line: 15, text: '    for r in range(rows):' },
  { line: 16, text: '        for c in range(cols):' },
  { line: 17, text: '            if board[r][c]=="O": board[r][c]="X"' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(board) {
  const steps = []

  if (!board || board.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty board',
      relatedLines: [1],
    })
    return steps
  }

  const rows = board.length
  const cols = board[0].length
  const boardCopy = board.map(row => [...row])

  steps.push({
    activeLine: 1,
    board: boardCopy.map(r => [...r]),
    message: `Surrounded Regions: mark all O surrounded by X`,
    relatedLines: [1],
  })

  const visited = new Set()

  const dfs = (r, c, path = []) => {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return
    const key = `${r},${c}`
    if (visited.has(key) || boardCopy[r][c] === 'X') return

    visited.add(key)
    const newPath = [...path, [r, c]]

    steps.push({
      activeLine: 8,
      currentCell: [r, c],
      visitedCells: Array.from(visited).map(k => k.split(',').map(Number)),
      board: boardCopy.map(r => [...r]),
      message: `DFS: visiting border-connected O at (${r},${c})`,
      relatedLines: [8],
    })

    dfs(r + 1, c, newPath)
    dfs(r - 1, c, newPath)
    dfs(r, c + 1, newPath)
    dfs(r, c - 1, newPath)
  }

  // Mark border-connected O's
  steps.push({
    activeLine: 11,
    message: 'Starting DFS from all border cells with O',
    relatedLines: [11, 12, 13, 14],
  })

  for (let r = 0; r < rows; r++) {
    dfs(r, 0)
    dfs(r, cols - 1)
  }
  for (let c = 0; c < cols; c++) {
    dfs(0, c)
    dfs(rows - 1, c)
  }

  steps.push({
    activeLine: 15,
    visitedCells: Array.from(visited).map(k => k.split(',').map(Number)),
    board: boardCopy.map(r => [...r]),
    message: `Marked ${visited.size} border-connected O cells. Now replacing surrounded O with X.`,
    relatedLines: [15],
  })

  // Replace surrounded O with X
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (boardCopy[r][c] === 'O' && !visited.has(`${r},${c}`)) {
        boardCopy[r][c] = 'X'

        steps.push({
          activeLine: 17,
          currentCell: [r, c],
          visitedCells: Array.from(visited).map(k => k.split(',').map(Number)),
          board: boardCopy.map(r => [...r]),
          message: `Replace surrounded O at (${r},${c}) with X`,
          relatedLines: [17],
        })
      }
    }
  }

  steps.push({
    activeLine: 1,
    visitedCells: Array.from(visited).map(k => k.split(',').map(Number)),
    board: boardCopy.map(r => [...r]),
    done: true,
    message: `Complete! ${visited.size} border-connected regions preserved.`,
    relatedLines: [1],
  })

  return steps
}

function GridVisualization({ board, currentCell, visitedCells, rows = 4, cols = 4 }) {
  if (!board) return null

  const cellSize = 40
  const gapSize = 2

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${board[0]?.length || 1}, ${cellSize}px)`,
        gap: `${gapSize}px`,
        padding: 8,
        backgroundColor: '#1e293b',
        borderRadius: 6,
      }}>
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isVisited = visitedCells?.some(([vr, vc]) => vr === r && vc === c)
            const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c

            return (
              <motion.div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 14,
                  backgroundColor: isCurrent ? '#fbbf24' : isVisited ? '#86efac' : cell === 'X' ? '#94a3b8' : '#e2e8f0',
                  color: cell === 'X' ? 'white' : '#0f172a',
                  border: isCurrent ? '3px solid #f59e0b' : isVisited && cell === 'O' ? '2px solid #22c55e' : 'none',
                }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
              >
                {cell}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          DFS from borders to mark connected O regions. Replace surrounded O with X.
        </div>
      </div>

      <GridVisualization
        board={step.board}
        currentCell={step.currentCell}
        visitedCells={step.visitedCells}
      />

      {step.visitedCells && step.visitedCells.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Border-Connected O Cells: {step.visitedCells.length}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 80, overflowY: 'auto' }}>
            {step.visitedCells.slice(0, 12).map((cell, idx) => (
              <div
                key={idx}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#bbf7d0',
                  borderRadius: 3,
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#065f46',
                  fontFamily: 'monospace',
                }}
              >
                ({cell[0]},{cell[1]})
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function SurroundedRegionsVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","board":[["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]});
  const [boardInput, setBoardInput] = useState("[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]");
  const { board, inputError } = useMemo(() => {
    try {
      const parsedBoard = JSON.parse(boardInput); if (!Array.isArray(parsedBoard)) throw new Error('board must be an array');
      return { board: parsedBoard, inputError: '' };
    } catch (e) {
      return { board: [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]], inputError: e.message };
    }
  }, [boardInput]);  const steps = useMemo(
    () =>
      generateSteps(board).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [board]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setBoardInput(JSON.stringify(e.board)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [panelDivs, setPanelDivs] = useState(null)

  // Extract panels into consts for Lumino portals
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"board","label":"board","type":"array"}]}
        values={{ board: boardInput }}
        onChange={(k, v) => { if (k === 'board') setBoardInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="srr-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
      />
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const statusPanel = (
    <div className="srr-status">
      {step && (
        <div style={{ fontSize: 12, color: '#94a3b8', padding: '4px 8px' }}>
          Step: {stepIndex + 1} / {steps.length}
          {step.message && ` — ${step.message.substring(0, 50)}...`}
        </div>
      )}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '◼ Surrounded Regions', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="srr-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
