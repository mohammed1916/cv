import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import './MinimumPathSumVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('minimum-path-sum')

const EXAMPLES = getExamples('minimum-path-sum')

const MINIMUMPATHSUM_PATTERNS = ['done', 'fill', 'fill-col', 'fill-row', 'init']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  6: 'fill-row',
  9: 'fill-col',
  12: 'fill',
  14: 'done',
}

function generateSteps(grid) {
  const steps = []
  if (!grid || grid.length === 0 || grid[0].length === 0) return steps

  const m = grid.length
  const n = grid[0].length
  const dp = grid.map(row => [...row])

  steps.push({
    phase: 'init',
    activeLine: 3,
    dp: dp.map(row => [...row]),
    r: -1,
    c: -1,
    result: null,
    message: `Initialize ${m}×${n} DP table from grid. First row sum = cumulative sum from top.`,
  })

  // Fill first row
  for (let c = 1; c < n; c++) {
    dp[0][c] += dp[0][c - 1]
    steps.push({
      phase: 'fill-row',
      activeLine: 6,
      dp: dp.map(row => [...row]),
      r: 0,
      c,
      result: null,
      message: `dp[0][${c}] = grid[0][${c}](${grid[0][c]}) + dp[0][${c - 1}](${dp[0][c - 1]}) = ${dp[0][c]}. First row must go right.`,
    })
  }

  // Fill first column
  for (let r = 1; r < m; r++) {
    dp[r][0] += dp[r - 1][0]
    steps.push({
      phase: 'fill-col',
      activeLine: 9,
      dp: dp.map(row => [...row]),
      r,
      c: 0,
      result: null,
      message: `dp[${r}][0] = grid[${r}][0](${grid[r][0]}) + dp[${r - 1}][0](${dp[r - 1][0]}) = ${dp[r][0]}. First column must go down.`,
    })
  }

  // Fill rest of table
  for (let r = 1; r < m; r++) {
    for (let c = 1; c < n; c++) {
      const fromAbove = dp[r - 1][c]
      const fromLeft = dp[r][c - 1]
      const minPath = Math.min(fromAbove, fromLeft)
      dp[r][c] += minPath

      steps.push({
        phase: 'fill',
        activeLine: 12,
        dp: dp.map(row => [...row]),
        r,
        c,
        result: null,
        from_above: fromAbove,
        from_left: fromLeft,
        message: `dp[${r}][${c}] = grid[${r}][${c}](${grid[r][c]}) + min(dp[${r - 1}][${c}](${fromAbove}), dp[${r}][${c - 1}](${fromLeft})) = ${dp[r][c]}. Take cheaper path.`,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 14,
    dp: dp.map(row => [...row]),
    r: m - 1,
    c: n - 1,
    result: dp[m - 1][n - 1],
    message: `Minimum path sum = dp[${m - 1}][${n - 1}] = ${dp[m - 1][n - 1]}. Path ends at bottom-right.`,
  })

  return steps.map((current) => ({
    ...current,
    relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
  }))
}

function MinimumPathSumVisualization({
  m,
  n,
  grid,
  step,
  onApplyExample,
  gridInput,
  setGridInput,
  handleReset,
  inputError,
}) {
  const dp = step?.dp ?? generateSteps(grid)[0]?.dp ?? grid.map(row => [...row])
  const currR = step?.r ?? -1
  const currC = step?.c ?? -1

  return (
    <section className="mps-panel">
      <header className="mps-head">
        <span>Minimum Path Sum · 2D DP</span>
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </header>
      <div className="mps-body">
        <div className="mps-top-row">
          <div className="mps-examples">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="mps-chip"
                onClick={() => onApplyExample(ex)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mps-grid-wrap">
          <div
            className="mps-grid"
            style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}
          >
            {dp.map((row, r) =>
              row.map((val, c) => {
                const isCurr = r === currR && c === currC
                const isAbove = r === currR - 1 && c === currC
                const isLeft = r === currR && c === currC - 1
                const isDone = step?.phase === 'done'
                const isResult = isDone && r === m - 1 && c === n - 1
                const isEdge = r === 0 || c === 0
                const isStart = r === 0 && c === 0
                const isEnd = r === m - 1 && c === n - 1

                return (
                  <motion.div
                    key={`${r}-${c}`}
                    className={[
                      'mps-cell',
                      isCurr ? 'curr' : '',
                      isAbove ? 'above' : '',
                      isLeft ? 'left' : '',
                      isResult ? 'result' : '',
                      isEdge && !isCurr && !isResult ? 'edge' : '',
                      isStart ? 'start' : '',
                      isEnd && !isResult ? 'end-cell' : '',
                    ].filter(Boolean).join(' ')}
                    animate={{ scale: isCurr || isResult ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                  >
                    {val}
                    {isStart && <span className="mps-corner-label">S</span>}
                    {isEnd && <span className="mps-corner-label">E</span>}
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Source arrows */}
        {currR >= 1 && currC >= 1 && (step?.phase === 'fill' || step?.phase === 'fill-row' || step?.phase === 'fill-col') && (
          <div className="mps-arrows">
            {currR >= 1 && (
              <>
                <span className="mps-arrow above-arrow">↓ from above: {step.from_above}</span>
                {currC >= 1 && <span className="mps-plus">+</span>}
              </>
            )}
            {currC >= 1 && (
              <>
                <span className="mps-arrow left-arrow">→ from left: {step.from_left}</span>
                <span className="mps-plus">=</span>
              </>
            )}
            <span className="mps-arrow curr-arrow">dp[{currR}][{currC}] = {dp[currR][currC]}</span>
          </div>
        )}

        <AnimatePresence>
          {step?.phase === 'done' && (
            <motion.div
              className="mps-result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Minimum path sum = {step.result}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default function MinimumPathSumVisualizer() {
  const [gridInput, setGridInput] = useState('[[1,3,1],[1,5,1],[4,2,1]]')


  const { grid, m, n, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(gridInput)
      if (!Array.isArray(parsed) || !Array.isArray(parsed[0])) {
        throw new Error('Grid must be 2D array of numbers')
      }
      const rows = parsed.length
      const cols = parsed[0].length
      if (rows < 1 || cols < 1 || rows > 15 || cols > 15) {
        throw new Error('Grid must be between 1x1 and 15x15')
      }
      if (!parsed.every(row => row.length === cols && row.every(val => typeof val === 'number' && val >= 0 && val <= 100))) {
        throw new Error('All values must be non-negative numbers')
      }
      return { grid: parsed, m: rows, n: cols, inputError: '' }
    } catch (e) {
      return { grid: [[1, 3, 1], [1, 5, 1], [4, 2, 1]], m: 3, n: 3, inputError: e.message }
    }
  }, [gridInput])

  const steps = useMemo(() => generateSteps(grid), [grid])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const applyExample = useCallback((ex) => {
    setGridInput(JSON.stringify(ex.grid))
    handleReset()
  }, [handleReset])

  // Panel definitions
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
        disableResizer
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

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"grid","label":"grid","type":"array"}]}
        values={{ grid: gridInput }}
        onChange={(k, v) => { if (k === 'grid') setGridInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <MinimumPathSumVisualization
      m={m}
      n={n}
      grid={grid}
      step={step}
      onApplyExample={applyExample}
      gridInput={gridInput}
      setGridInput={setGridInput}
      handleReset={handleReset}
      inputError={inputError}
    />
  
    </>)

  const statusPanel = (
    <div className="mps-status">
      {step ? `Step: ${step.phase} · ${step.message}` : 'Ready'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={MINIMUMPATHSUM_PATTERNS} />
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
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        showAutoScroll
      />
    </>
  )

  // Lumino panel state and config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Minimum Path Sum · 2D DP', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="mps-shell">
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
    </div>
  )
}
