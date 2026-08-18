import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './RottingOrangesVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def orangesRotting(self, grid):' },
  { line: 3, text: '        rows, cols = len(grid), len(grid[0])' },
  { line: 4, text: '        queue = deque()' },
  { line: 5, text: '        fresh = 0' },
  { line: 6, text: '        for r in range(rows):' },
  { line: 7, text: '            for c in range(cols):' },
  { line: 8, text: '                if grid[r][c] == 2: queue.append((r, c))' },
  { line: 9, text: '                elif grid[r][c] == 1: fresh += 1' },
  { line: 10, text: '        minutes = 0' },
  { line: 11, text: '        dirs = [[1,0],[-1,0],[0,1],[0,-1]]' },
  { line: 12, text: '        while queue and fresh > 0:' },
  { line: 13, text: '            for _ in range(len(queue)):' },
  { line: 14, text: '                r, c = queue.popleft()' },
  { line: 15, text: '                for dr, dc in dirs:' },
  { line: 16, text: '                    nr, nc = r + dr, c + dc' },
  { line: 17, text: '                    if in bounds and grid[nr][nc] == 1:' },
  { line: 18, text: '                        grid[nr][nc] = 2' },
  { line: 19, text: '                        fresh -= 1' },
  { line: 20, text: '                        queue.append((nr, nc))' },
  { line: 21, text: '            minutes += 1' },
  { line: 22, text: '        return minutes if fresh == 0 else -1' },
]

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]

function cloneGrid(grid) {
  return grid.map((row) => [...row])
}

function parseGrid(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed) || !parsed.length || !Array.isArray(parsed[0])) {
    throw new Error('Grid must be a 2D array')
  }
  const rowLen = parsed[0].length
  const out = parsed.map((row) => {
    if (!Array.isArray(row) || row.length !== rowLen) throw new Error('Grid rows must be same length')
    return row.map((v) => {
      const n = Number(v)
      if (![0, 1, 2].includes(n)) throw new Error('Cell values must be 0, 1, or 2')
      return n
    })
  })
  return out
}

function generateSteps(gridInput) {
  const steps = []
  const grid = cloneGrid(gridInput)
  const rows = grid.length
  const cols = grid[0].length
  let fresh = 0
  const queue = []

  steps.push({
    phase: 'init',
    activeLine: 5,
    grid: cloneGrid(grid),
    queue: [...queue],
    fresh,
    minutes: 0,
    message: 'Initialize queue and count fresh oranges.',
  })

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) queue.push([r, c])
      else if (grid[r][c] === 1) fresh++
    }
  }

  steps.push({
    phase: 'scan_done',
    activeLine: 10,
    grid: cloneGrid(grid),
    queue: [...queue],
    fresh,
    minutes: 0,
    message: `Scan complete. Fresh=${fresh}, initial rotten frontier=${queue.length}.`,
  })

  let minutes = 0
  while (queue.length && fresh > 0) {
    const layerSize = queue.length
    steps.push({
      phase: 'minute_start',
      activeLine: 13,
      grid: cloneGrid(grid),
      queue: [...queue],
      fresh,
      minutes,
      layerSize,
      message: `Minute ${minutes + 1}: process ${layerSize} rotten cells in current frontier.`,
    })

    for (let i = 0; i < layerSize; i++) {
      const [r, c] = queue.shift()
      steps.push({
        phase: 'pop',
        activeLine: 14,
        grid: cloneGrid(grid),
        queue: [...queue],
        fresh,
        minutes,
        current: [r, c],
        message: `Process rotten cell (${r}, ${c}).`,
      })

      for (const [dr, dc] of DIRS) {
        const nr = r + dr
        const nc = c + dc
        const inBounds = nr >= 0 && nr < rows && nc >= 0 && nc < cols
        steps.push({
          phase: 'check_neighbor',
          activeLine: 17,
          grid: cloneGrid(grid),
          queue: [...queue],
          fresh,
          minutes,
          current: [r, c],
          neighbor: [nr, nc],
          valid: inBounds && grid[nr]?.[nc] === 1,
          message: `Check neighbor (${nr}, ${nc}).`,
        })
        if (inBounds && grid[nr][nc] === 1) {
          grid[nr][nc] = 2
          fresh--
          queue.push([nr, nc])
          steps.push({
            phase: 'rot_neighbor',
            activeLine: 20,
            grid: cloneGrid(grid),
            queue: [...queue],
            fresh,
            minutes,
            current: [r, c],
            neighbor: [nr, nc],
            message: `Fresh orange at (${nr}, ${nc}) rots and joins next frontier.`,
          })
        }
      }
    }
    minutes++
    steps.push({
      phase: 'minute_end',
      activeLine: 21,
      grid: cloneGrid(grid),
      queue: [...queue],
      fresh,
      minutes,
      message: `Minute increments to ${minutes}. Fresh remaining=${fresh}.`,
    })
  }

  const ok = fresh === 0
  steps.push({
    phase: 'done',
    activeLine: 22,
    grid: cloneGrid(grid),
    queue: [...queue],
    fresh,
    minutes,
    ok,
    message: ok ? `All oranges rotted in ${minutes} minute(s).` : 'Some fresh oranges are unreachable. Return -1.',
  })
  return steps
}

const EXAMPLES = getExamples('rotting-oranges')

function VisualizationPanel({ grid, step, inputError, applyExample }) {
  const activeGrid = step?.grid || grid
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto', padding: 16 }}>
      <section className="rot-panel grid">
        <header className="rot-head"><span>Grid BFS Simulation</span>{inputError && <span className="rot-error">{inputError}</span>}</header>
        <div className="rot-body">
          <div className="rot-examples">{EXAMPLES.map((example) => <button key={example.label} className="rot-chip" onClick={() => applyExample(example)}>{example.label}</button>)}</div>
          <div className="rot-grid" style={{ gridTemplateColumns: `repeat(${activeGrid[0]?.length || 1}, minmax(0, 1fr))` }}>
            {activeGrid.flatMap((row, rowIndex) => row.map((cell, columnIndex) => {
              const current = step?.current?.[0] === rowIndex && step?.current?.[1] === columnIndex
              const neighbor = step?.neighbor?.[0] === rowIndex && step?.neighbor?.[1] === columnIndex
              return <motion.div key={`${rowIndex}-${columnIndex}`} className={`rot-cell v${cell} ${current ? 'current' : ''} ${neighbor ? 'neighbor' : ''}`} animate={{ scale: current ? [1, 1.08, 1] : 1 }}><span>{cell}</span><small>{rowIndex},{columnIndex}</small></motion.div>
            }))}
          </div>
        </div>
      </section>
      <section className="rot-panel side">
        <header className="rot-head"><span>Frontier State</span></header>
        <div className="rot-body">
          <div className="rot-metrics"><div><span>minute</span><strong>{step?.minutes ?? 0}</strong></div><div><span>fresh</span><strong>{step?.fresh ?? 0}</strong></div><div><span>frontier</span><strong>{step?.queue?.length ?? 0}</strong></div></div>
          <div><div className="rot-label">Queue (next cells)</div><div className="rot-queue"><AnimatePresence>{(step?.queue || []).map(([rowIndex, columnIndex], index) => <motion.span key={`${rowIndex}-${columnIndex}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>({rowIndex},{columnIndex})</motion.span>)}</AnimatePresence></div></div>
          <div className={`rot-result ${step?.phase === 'done' ? (step?.ok ? 'ok' : 'bad') : ''}`}>{step?.phase === 'done' ? (step.ok ? `Return ${step.minutes}` : 'Return -1') : 'BFS wave in progress'}</div>
        </div>
      </section>
      <div className={`rot-status ${step?.phase === 'done' ? (step?.ok ? 'ok' : 'bad') : ''}`}>{step?.message || 'Press Play to begin.'}</div>
    </div>
  )
}

export default function RottingOrangesVisualizer() {
  const [gridInput, setGridInput] = useState('[[2,1,1],[1,1,0],[0,1,1]]')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { grid, inputError } = useMemo(() => {
    try {
      return { grid: parseGrid(gridInput), inputError: '' }
    } catch (e) {
      return { grid: [[2, 1, 1], [1, 1, 0], [0, 1, 1]], inputError: e.message || 'Invalid input' }
    }
  }, [gridInput])

  const steps = useMemo(() => generateSteps(grid), [grid])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setGridInput(JSON.stringify(ex.grid))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Rotting Oranges BFS', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="rot-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && <>
        {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'grid', label: 'Grid', type: 'string' }]} values={{ grid: gridInput }} onChange={(key, value) => { if (key === 'grid') setGridInput(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={inputError} />, panelDivs.input)}
        {panelDivs.viz && createPortal(<VisualizationPanel grid={grid} step={step} inputError={inputError} applyExample={applyExample} />, panelDivs.viz)}
        {panelDivs.code && createPortal(<CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />, panelDivs.code)}
      </>}
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
