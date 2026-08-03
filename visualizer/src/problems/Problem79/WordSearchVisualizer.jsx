import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './WordSearchVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'

const WORDSEARCH_PATTERNS = ['init', 'match', 'success', 'backtrack', 'not_found']

const LINE_PATTERN_MAP = {
  4: 'init',
  6: 'match',
  7: 'backtrack',
  8: 'backtrack',
  14: 'not_found',
}

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def exist(self, board, word):' },
  { line: 3, text: '        rows, cols = len(board), len(board[0])' },
  { line: 4, text: '        path = set()' },
  { line: 5, text: '        def dfs(r, c, i):' },
  { line: 6, text: '            if i == len(word): return True' },
  { line: 7, text: '            if out of bounds / mismatch / visited: return False' },
  { line: 8, text: '            path.add((r,c))' },
  { line: 9, text: '            res = dfs(...) or dfs(...) or dfs(...) or dfs(...)' },
  { line: 10, text: '            path.remove((r,c))' },
  { line: 11, text: '            return res' },
  { line: 12, text: '        for r in range(rows):' },
  { line: 13, text: '            for c in range(cols):' },
  { line: 14, text: '                if dfs(r, c, 0): return True' },
  { line: 15, text: '        return False' },
]

function parseBoard(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed) || !parsed.length || !Array.isArray(parsed[0])) {
    throw new Error('Board must be 2D array of letters')
  }
  const width = parsed[0].length
  return parsed.map((row) => {
    if (!Array.isArray(row) || row.length !== width) throw new Error('All rows must have same width')
    return row.map((cell) => String(cell).slice(0, 1).toUpperCase())
  })
}

function key(r, c) {
  return `${r},${c}`
}

function generateSteps(board, word) {
  const steps = []
  const rows = board.length
  const cols = board[0].length
  const target = word.toUpperCase()

  function pushStep(payload) {
    steps.push({
      board,
      word: target,
      ...payload,
      visited: [...(payload.visited || [])],
      path: [...(payload.path || [])],
    })
  }

  pushStep({
    phase: 'init',
    activeLine: 4,
    message: `Start DFS for word "${target}".`,
    visited: [],
    path: [],
    found: false,
    idx: 0,
  })

  const visited = new Set()
  let solved = false

  function dfs(r, c, idx, path) {
    if (solved) return true
    if (idx === target.length) {
      pushStep({
        phase: 'success',
        activeLine: 6,
        current: null,
        idx,
        path,
        visited: [...visited],
        found: true,
        message: `Matched all ${target.length} characters.`,
      })
      solved = true
      return true
    }
    const out = r < 0 || c < 0 || r >= rows || c >= cols
    const cell = out ? null : board[r][c]
    const k = key(r, c)
    const mismatch = !out && cell !== target[idx]
    const used = visited.has(k)
    pushStep({
      phase: 'check',
      activeLine: 7,
      current: out ? null : [r, c],
      idx,
      path,
      visited: [...visited],
      found: false,
      valid: !(out || mismatch || used),
      message: out
        ? `(${r}, ${c}) is out of bounds.`
        : used
          ? `(${r}, ${c}) already in path.`
          : mismatch
            ? `Board[${r}][${c}]="${cell}" does not match "${target[idx]}".`
            : `Board[${r}][${c}]="${cell}" matches "${target[idx]}". Continue.`,
    })
    if (out || mismatch || used) return false

    visited.add(k)
    const nextPath = [...path, [r, c]]
    pushStep({
      phase: 'choose',
      activeLine: 8,
      current: [r, c],
      idx,
      path: nextPath,
      visited: [...visited],
      found: false,
      message: `Choose (${r}, ${c}), path length ${nextPath.length}.`,
    })

    if (
      dfs(r + 1, c, idx + 1, nextPath) ||
      dfs(r - 1, c, idx + 1, nextPath) ||
      dfs(r, c + 1, idx + 1, nextPath) ||
      dfs(r, c - 1, idx + 1, nextPath)
    ) {
      return true
    }

    visited.delete(k)
    pushStep({
      phase: 'backtrack',
      activeLine: 10,
      current: [r, c],
      idx,
      path,
      visited: [...visited],
      found: false,
      message: `Backtrack from (${r}, ${c}).`,
    })
    return false
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      pushStep({
        phase: 'start_cell',
        activeLine: 14,
        current: [r, c],
        idx: 0,
        path: [],
        visited: [...visited],
        found: false,
        message: `Try DFS starting at (${r}, ${c}).`,
      })
      if (dfs(r, c, 0, [])) {
        pushStep({
          phase: 'done',
          activeLine: 14,
          current: [r, c],
          idx: target.length,
          path: [],
          visited: [...visited],
          found: true,
          message: 'Word exists in board. Return True.',
        })
        return steps
      }
    }
  }

  pushStep({
    phase: 'done',
    activeLine: 15,
    current: null,
    idx: 0,
    path: [],
    visited: [],
    found: false,
    message: 'No path can form the word. Return False.',
  })
  return steps
}

const EXAMPLES = getExamples('word-search')

export default function WordSearchVisualizer() {
  const [boardInput, setBoardInput] = useState('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]')
  const [wordInput, setWordInput] = useState('ABCCED')

  const { board, word, inputError } = useMemo(() => {
    try {
      const b = parseBoard(boardInput)
      const w = String(wordInput || '').toUpperCase()
      if (!w) throw new Error('Word must be non-empty')
      return { board: b, word: w, inputError: '' }
    } catch (e) {
      return { board: [['A', 'B'], ['C', 'D']], word: 'AB', inputError: e.message || 'Invalid input' }
    }
  }, [boardInput, wordInput])

  const steps = useMemo(() => generateSteps(board, word), [board, word])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setBoardInput(JSON.stringify(ex.board))
    setWordInput(ex.word)
    handleReset()
  }, [handleReset])

  const primaryPanel = (
    <div className="ws-panel">
      <header className="ws-head">
        <span>DFS Backtracking Grid</span>
        {inputError && <span className="ws-error">{inputError}</span>}
      </header>
      <div className="ws-body">
        <div className="ws-examples">
          {EXAMPLES.map((ex) => <button key={ex.label} className="ws-chip" onClick={() => applyExample(ex)}>{ex.label}</button>)}
        </div>
        <div className="ws-inputs">
          <input className="ws-input" value={boardInput} onChange={(e) => { setBoardInput(e.target.value); handleReset() }} />
          <input className="ws-input small" value={wordInput} onChange={(e) => { setWordInput(e.target.value.toUpperCase()); handleReset() }} />
        </div>
        <div className="ws-grid" style={{ gridTemplateColumns: `repeat(${(step?.board || board)[0].length}, minmax(0, 1fr))` }}>
          {(step?.board || board).flatMap((row, r) => row.map((cell, c) => {
            const current = step?.current?.[0] === r && step?.current?.[1] === c
            const inPath = (step?.path || []).some(([pr, pc]) => pr === r && pc === c)
            return (
              <motion.div key={`${r}-${c}`} className={`ws-cell ${current ? 'current' : ''} ${inPath ? 'path' : ''}`} animate={current ? { scale: [1, 1.08, 1] } : { scale: 1 }}>
                <span>{cell}</span>
                <small>{r},{c}</small>
              </motion.div>
            )
          }))}
        </div>
      </div>
    </div>
  )

  const statePanel = (
    <div className="ws-panel side">
      <header className="ws-head"><span>Search State</span></header>
      <div className="ws-body">
        <div className="ws-word">
          {word.split('').map((ch, i) => (
            <span key={`${ch}-${i}`} className={i === step?.idx ? 'active' : i < (step?.idx || 0) ? 'done' : ''}>{ch}</span>
          ))}
        </div>
        <div className="ws-metrics">
          <div><span>idx</span><strong>{step?.idx ?? 0}</strong></div>
          <div><span>path len</span><strong>{step?.path?.length ?? 0}</strong></div>
          <div><span>result</span><strong>{step?.phase === 'done' ? (step?.found ? 'true' : 'false') : '...'}</strong></div>
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} disableResizer />
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const statusPanel = (
    <div className={`ws-status ${step?.phase === 'done' ? (step?.found ? 'ok' : 'bad') : ''}`}>
      {step?.message || 'Press Play to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={WORDSEARCH_PATTERNS} />
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
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'DFS Backtracking Grid', dockMode: 'split-right' },
      { id: 'state', title: 'Search State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="ws-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
