import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem417Visualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PatternOverlay from "../../components/PatternOverlay";

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = ['atlantic_dfs', 'atlantic_start', 'done', 'init', 'pacific_dfs', 'pacific_start', 'result']



const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def pacificAtlantic(self, heights) -> list:' },
  { line: 3, text: '        if not heights: return []' },
  { line: 4, text: '        m, n = len(heights), len(heights[0])' },
  { line: 5, text: '        pacific = set()' },
  { line: 6, text: '        atlantic = set()' },
  { line: 7, text: '        ' },
  { line: 8, text: '        def dfs(r, c, visited, prev_h):' },
  { line: 9, text: '            if (r,c) in visited or r<0 or r>=m or c<0 or c>=n:' },
  { line: 10, text: '                return' },
  { line: 11, text: '            if heights[r][c] < prev_h: return' },
  { line: 12, text: '            visited.add((r,c))' },
  { line: 13, text: '            dfs(r+1,c,visited,heights[r][c])' },
  { line: 14, text: '            dfs(r-1,c,visited,heights[r][c])' },
  { line: 15, text: '            dfs(r,c+1,visited,heights[r][c])' },
  { line: 16, text: '            dfs(r,c-1,visited,heights[r][c])' },
  { line: 17, text: '        ' },
  { line: 18, text: '        # Phase 1: DFS from Pacific (top, left)' },
  { line: 19, text: '        for r in range(m):' },
  { line: 20, text: '            dfs(r, 0, pacific, 0)' },
  { line: 21, text: '        for c in range(n):' },
  { line: 22, text: '            dfs(0, c, pacific, 0)' },
  { line: 23, text: '        ' },
  { line: 24, text: '        # Phase 2: DFS from Atlantic (bottom, right)' },
  { line: 25, text: '        for r in range(m):' },
  { line: 26, text: '            dfs(r, n-1, atlantic, 0)' },
  { line: 27, text: '        for c in range(n):' },
  { line: 28, text: '            dfs(m-1, c, atlantic, 0)' },
  { line: 29, text: '        ' },
  { line: 30, text: '        return list(pacific & atlantic)' },
]

const EXAMPLES = [
  { label: 'Classic 5 × 5', input: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]] },
  { label: 'Single cell', input: [[7]] },
  { label: 'Flat grid', input: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
]

function generateSteps(heights) {
  const steps = []

  if (!heights || heights.length === 0) {
    steps.push({
      phase: 'done',
      pacific: new Set(),
      atlantic: new Set(),
      result: [],
      activeLine: 3,
      message: 'Empty grid.',
    })
    return steps
  }

  const m = heights.length
  const n = heights[0].length

  steps.push({
    phase: 'init',
    pacific: new Set(),
    atlantic: new Set(),
    result: [],
    activeLine: 4,
    message: `Grid: ${m}x${n}. Initialize pacific and atlantic sets.`,
  })

  const pacific = new Set()
  const atlantic = new Set()

  const addStep = ({ phase, activeLine, message, currentCell, result = [] }) => {
    steps.push({
      phase,
      pacific: new Set(pacific),
      atlantic: new Set(atlantic),
      result,
      activeLine,
      message,
      currentCell,
    })
  }

  const explore = (r, c, visited, ocean, phase, previousHeight) => {
    if (r < 0 || r >= m || c < 0 || c >= n || visited.has(`${r},${c}`)) return
    if (heights[r][c] < previousHeight) return

    const cellKey = `${r},${c}`
    visited.add(cellKey)
    ocean.add(cellKey)
    addStep({
      phase,
      activeLine: 12,
      message: `Visit (${r},${c}) at height ${heights[r][c]}; water can flow back to this ocean.`,
      currentCell: [r, c],
    })

    for (const [dr, dc, activeLine] of [[1, 0, 13], [-1, 0, 14], [0, 1, 15], [0, -1, 16]]) {
      explore(r + dr, c + dc, visited, ocean, phase, heights[r][c])
    }
  }

  // Phase 1: DFS from Pacific borders
  steps.push({
    phase: 'pacific_start',
    pacific: new Set(),
    atlantic: new Set(),
    result: [],
    activeLine: 18,
    message: 'Phase 1: DFS from Pacific (top and left borders)',
  })

  const pacificVisited = new Set()
  for (let r = 0; r < m; r++) {
    addStep({
      phase: 'pacific_dfs',
      activeLine: 20,
      message: `Starting DFS from left border: (${r},0), height=${heights[r][0]}`,
      currentCell: [r, 0],
    })
    explore(r, 0, pacificVisited, pacific, 'pacific_dfs', 0)
  }

  for (let c = 0; c < n; c++) {
    addStep({
      phase: 'pacific_dfs',
        activeLine: 22,
      message: `Starting DFS from top border: (0,${c}), height=${heights[0][c]}`,
        currentCell: [0, c],
    })
    explore(0, c, pacificVisited, pacific, 'pacific_dfs', 0)
  }

  // Phase 2: DFS from Atlantic borders
  steps.push({
    phase: 'atlantic_start',
    pacific: new Set(pacific),
    atlantic: new Set(),
    result: [],
    activeLine: 24,
    message: 'Phase 2: DFS from Atlantic (bottom and right borders)',
  })

  const atlanticVisited = new Set()
  for (let r = 0; r < m; r++) {
    addStep({
      phase: 'atlantic_dfs',
      activeLine: 26,
      message: `Starting DFS from right border: (${r},${n - 1}), height=${heights[r][n - 1]}`,
      currentCell: [r, n - 1],
    })
    explore(r, n - 1, atlanticVisited, atlantic, 'atlantic_dfs', 0)
  }

  for (let c = 0; c < n; c++) {
    addStep({
      phase: 'atlantic_dfs',
        activeLine: 28,
      message: `Starting DFS from bottom border: (${m - 1},${c}), height=${heights[m - 1][c]}`,
        currentCell: [m - 1, c],
    })
    explore(m - 1, c, atlanticVisited, atlantic, 'atlantic_dfs', 0)
  }

  // Find intersection (cells reachable from both)
  const result = []
  for (const cell of pacific) {
    if (atlantic.has(cell)) {
      result.push(cell)
    }
  }

  addStep({
    phase: 'result',
    activeLine: 30,
    message: `Result: ${result.length} cells reachable from both Pacific and Atlantic`,
    result,
  })

  return steps
}

function Problem417Visualizer() {
  const defaultHeights = EXAMPLES[0].input

  const [heights, setHeights] = useState(defaultHeights)
  const [inputValue, setInputValue] = useState(JSON.stringify(defaultHeights))
  const [inputError, setInputError] = useState('')

  const steps = useMemo(() => generateSteps(heights).map((current) => ({
    ...current,
    relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
  })), [heights])
  const { stepIndex, isPlaying, speed, setSpeed, togglePlay, handleReset: reset, stepForward, stepBack, isDone, setStepIndex } = usePlaybackState(steps.length)

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const activeStep = steps[Math.max(0, stepIndex)] || steps[0]

  const handleRun = useCallback(() => {
    try {
      const parsed = JSON.parse(inputValue)
      if (!Array.isArray(parsed) || !parsed.length || !parsed.every(row => Array.isArray(row) && row.length === parsed[0].length && row.every(Number.isFinite))) throw new Error('Enter a non-empty rectangular JSON matrix of numbers.')
      setHeights(parsed)
      setInputError('')
      reset()
    } catch (e) {
      setInputError(e.message || 'Enter a valid non-empty rectangular JSON matrix of numbers.')
    }
  }, [inputValue, reset])

  const handleReset = useCallback(() => {
    setHeights(defaultHeights)
    setInputValue(JSON.stringify(defaultHeights))
    setInputError('')
    reset()
  }, [reset])

  const applyExample = useCallback((example) => {
    setHeights(example.input)
    setInputValue(JSON.stringify(example.input))
    setInputError('')
    reset()
  }, [reset])

  const m = heights.length
  const n = heights[0]?.length || 0
  const cellSize = Math.min(320 / n, 240 / m, 50)
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Pacific Atlantic Flow', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const getCellColor = (r, c) => {
    const cellKey = `${r},${c}`
    const isPacific = activeStep?.pacific?.has(cellKey)
    const isAtlantic = activeStep?.atlantic?.has(cellKey)
    const isBoth = isPacific && isAtlantic

    if (isBoth) return '#6366f1' // Catppuccin Lavender (both)
    if (isPacific) return '#89b4fa' // Catppuccin Blue (Pacific)
    if (isAtlantic) return '#f9e2af' // Catppuccin Yellow (Atlantic)
    return 'var(--code-line)' // Catppuccin Surface 2
  }

  const visualizationPanel = (
    <div className="paw-shell">
      <div className="paw-panel paw-visualization">
          <div className="paw-panel-head">Grid Visualization</div>
          <div className="paw-panel-body">
            <div
              className="paw-grid"
              style={{
                gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
                gap: '4px',
              }}
            >
              <AnimatePresence mode="popLayout">
                {heights.map((row, r) =>
                  row.map((val, c) => (
                    <motion.div
                      key={`${r}-${c}`}
                      className="paw-cell"
                      style={{
                        backgroundColor: getCellColor(r, c),
                        width: cellSize,
                        height: cellSize,
                      }}
                      initial={{ opacity: 0.3 }}
                      animate={{
                        opacity:
                          activeStep?.currentCell?.[0] === r &&
                            activeStep?.currentCell?.[1] === c
                            ? 1
                            : 0.8,
                        scale:
                          activeStep?.currentCell?.[0] === r &&
                            activeStep?.currentCell?.[1] === c
                            ? 1.1
                            : 1,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="paw-cell-value">{val}</div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
      </div>

      <div className="paw-middle">
        <div className="paw-panel paw-state">
          <div className="paw-panel-head">State</div>
          <div className="paw-panel-body">
            <div className="paw-state-item">
              <div className="paw-state-label">Phase:</div>
              <div className="paw-state-value">{activeStep?.phase}</div>
            </div>
            <div className="paw-state-item">
              <div className="paw-state-label">Pacific cells:</div>
              <div className="paw-state-value">{activeStep?.pacific?.size || 0}</div>
            </div>
            <div className="paw-state-item">
              <div className="paw-state-label">Atlantic cells:</div>
              <div className="paw-state-value">{activeStep?.atlantic?.size || 0}</div>
            </div>
            <div className="paw-state-item">
              <div className="paw-state-label">Result cells:</div>
              <div className="paw-state-value">{activeStep?.result?.length || 0}</div>
            </div>
          </div>
        </div>

        <div className="paw-panel paw-message">
          <div className="paw-panel-head">Trace</div>
          <div className="paw-panel-body">
            <div className="paw-message-text">{activeStep?.message}</div>
          </div>
        </div>

      </div>
    </div>
  )

  const inputPanel = (
    <div className="paw-input-panel">
      <ManualInputPanel
        fields={[{ key: 'heights', label: 'Heights matrix (JSON)', type: 'string' }]}
        values={{ heights: inputValue }}
        onChange={(_, value) => { setInputValue(value); setInputError('') }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />
      <div className="paw-input-actions">
        <button type="button" className="paw-button" onClick={handleRun}>Run</button>
        <button type="button" className="paw-button paw-button-secondary" onClick={handleReset}>Reset</button>
      </div>
    </div>
  )

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(
            inputPanel,
            panelDivs.input,
          )}
          {panelDivs.viz && createPortal(visualizationPanel, panelDivs.viz)}
          {panelDivs.code && createPortal(
            <CodeTracePanel
              codeLines={SOLUTION_CODE}
              step={activeStep}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              title="Solution Code"
              onActiveLineDomChange={setActiveLineDom}
            />,
            panelDivs.code,
          )}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          <PlaybackControls
            isPlaying={isPlaying}
            isDone={isDone}
            speed={speed}
            onSpeedChange={(event) => setSpeed(Number(event.target.value))}
            onPlayToggle={togglePlay}
            onPrev={stepBack}
            onNext={stepForward}
            onReset={reset}
            prevDisabled={stepIndex < 0}
            nextDisabled={isDone}
            resetDisabled={stepIndex < 0}
            showPatternOverlay={showPatternOverlay}
            onShowPatternOverlayChange={setShowPatternOverlay}
            patternOverlayLabel="Show pattern overlay"
            showPatternOverlayToggle
          />
        </FloatingPanel>
        , document.body,
      )}

      {showPatternOverlay && activeStep && <PatternOverlay step={activeStep} activeLineDom={activeLineDom} />}
    </div>
  )
}

export default Problem417Visualizer
