import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import './WordSearchVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

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

const _PATTERNS = ['backtrack', 'check', 'choose', 'done', 'init', 'start_cell', 'success']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'init',
  6: 'success',
  7: 'check',
  8: 'choose',
  10: 'backtrack',
  14: 'start_cell',
  15: 'done',
}

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

function VisualizationPanel({ EXAMPLES, applyExample, selected, handleReset, step, board, word, boardInput, setBoardInput, wordInput, setWordInput, inputError }) {
  return (
    <div className="ws-viz-panel">
      <section className="ws-panel">
        <header className="ws-head">
          <span>DFS Backtracking Grid</span>
          {inputError && <span className="ws-error">{inputError}</span>}
        </header>
        <div className="ws-body">
          <div className="ws-examples">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className={`ws-chip ${selected === EXAMPLES.indexOf(ex) ? 'active' : ''}`}
                onClick={() => applyExample(EXAMPLES.indexOf(ex))}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <div className="ws-inputs">
            <input
              className="ws-input"
              value={boardInput}
              onChange={(e) => {
                setBoardInput(e.target.value)
                handleReset()
              }}
            />
            <input
              className="ws-input small"
              value={wordInput}
              onChange={(e) => {
                setWordInput(e.target.value.toUpperCase())
                handleReset()
              }}
            />
          </div>
          <div
            className="ws-grid"
            style={{ gridTemplateColumns: `repeat(${(step?.board || board)[0].length}, minmax(0, 1fr))` }}
          >
            {(step?.board || board).flatMap((row, r) =>
              row.map((cell, c) => {
                const current = step?.current?.[0] === r && step?.current?.[1] === c
                const inPath = (step?.path || []).some(([pr, pc]) => pr === r && pc === c)
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    className={`ws-cell ${current ? 'current' : ''} ${inPath ? 'path' : ''}`}
                    animate={current ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  >
                    <span>{cell}</span>
                    <small>
                      {r},{c}
                    </small>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>

      <section className="ws-panel side">
        <header className="ws-head">
          <span>Search State</span>
        </header>
        <div className="ws-body">
          <div className="ws-word">
            {word.split('').map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={i === step?.idx ? 'active' : i < (step?.idx || 0) ? 'done' : ''}
              >
                {ch}
              </span>
            ))}
          </div>
          <div className="ws-metrics">
            <div>
              <span>idx</span>
              <strong>{step?.idx ?? 0}</strong>
            </div>
            <div>
              <span>path len</span>
              <strong>{step?.path?.length ?? 0}</strong>
            </div>
            <div>
              <span>result</span>
              <strong>{step?.phase === 'done' ? (step?.found ? 'true' : 'false') : '...'}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className={`ws-status ${step?.phase === 'done' ? (step?.found ? 'ok' : 'bad') : ''}`}>
        {step?.message || 'Press Play to begin.'}
      </div>
    </div>
  )
}

export default function WordSearchVisualizer() {
  const [boardInput, setBoardInput] = useState('[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]')
  const [wordInput, setWordInput] = useState('ABCCED')
  const [selected, setSelected] = useState(0)
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (idx) => {
      const ex = EXAMPLES[idx]
      setBoardInput(JSON.stringify(ex.board))
      setWordInput(ex.word)
      setSelected(idx)
      handleReset()
    },
    [handleReset]
  )

  const vizPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"board","label":"board","type":"string"},{"key":"word","label":"word","type":"string"}]}
        values={{ board: boardInput, word: wordInput }}
        onChange={(k, v) => { if (k === 'board') setBoardInput(v); if (k === 'word') setWordInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <VisualizationPanel
      EXAMPLES={EXAMPLES}
      applyExample={applyExample}
      selected={selected}
      handleReset={handleReset}
      step={step}
      board={board}
      word={word}
      boardInput={boardInput}
      setBoardInput={setBoardInput}
      wordInput={wordInput}
      setWordInput={setWordInput}
      inputError={inputError}
    />
  
    </>)

  const codePanel = (
    <div style={{ position: "relative" }}>
      <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      onActiveLineDomChange={setActiveLineDom}
      autoScroll={autoScrollCode}
    />

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

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'viz', title: 'Visualization' },
      { id: 'code', title: 'Code', dockMode: 'split-right' },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          {showPatternOverlay && (
            <PatternLegend currentPhase={step?.phase} usedPatterns={_PATTERNS} />
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
            autoScroll={autoScrollCode}
            onAutoScrollChange={setAutoScrollCode}
            showAutoScroll
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
          />
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}

