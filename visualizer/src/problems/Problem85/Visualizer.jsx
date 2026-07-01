import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MaximalRectangleVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maximalRectangle(self, matrix):' },
  { line: 3, text: '        if not matrix: return 0' },
  { line: 4, text: '        m, n = len(matrix), len(matrix[0])' },
  { line: 5, text: '        heights = [0] * n' },
  { line: 6, text: '        max_area = 0' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for row in matrix:' },
  { line: 9, text: '            for i in range(n):' },
  { line: 10, text: '                if row[i] == "1":' },
  { line: 11, text: '                    heights[i] += 1' },
  { line: 12, text: '                else:' },
  { line: 13, text: '                    heights[i] = 0' },
  { line: 14, text: '            ' },
  { line: 15, text: '            max_area = max(max_area, largestRectangleArea(heights))' },
]

function generateSteps(matrix) {
  const steps = []

  if (!matrix || matrix.length === 0) {
    steps.push({
      phase: 'done',
      currentRow: -1,
      heights: [],
      maxArea: 0,
      activeLine: 3,
      message: 'Empty matrix.',
    })
    return steps
  }

  const m = matrix.length
  const n = matrix[0].length

  steps.push({
    phase: 'init',
    currentRow: -1,
    heights: new Array(n).fill(0),
    maxArea: 0,
    activeLine: 5,
    message: `Matrix ${m}x${n}. Initialize heights=[0]*${n}`,
  })

  let heights = new Array(n).fill(0)
  let maxArea = 0

  for (let row = 0; row < m; row++) {
    steps.push({
      phase: 'row_start',
      currentRow: row,
      heights: [...heights],
      maxArea,
      activeLine: 8,
      message: `Process row ${row}: [${matrix[row].map(x => x).join(',')}]`,
    })

    for (let i = 0; i < n; i++) {
      if (matrix[row][i] === '1' || matrix[row][i] === 1) {
        heights[i] += 1
      } else {
        heights[i] = 0
      }

      steps.push({
        phase: 'height_update',
        currentRow: row,
        heights: [...heights],
        maxArea,
        activeLine: matrix[row][i] === '1' || matrix[row][i] === 1 ? 11 : 13,
        message: `Col ${i}: matrix[${row}][${i}]=${matrix[row][i]}, heights[${i}]=${heights[i]}`,
      })
    }

    const stack = []
    let currentMaxArea = 0

    for (let i = 0; i < n; i++) {
      while (stack.length > 0 && heights[stack[stack.length - 1]] > heights[i]) {
        const popIdx = stack.pop()
        const h = heights[popIdx]
        const width = i - (stack.length > 0 ? stack[stack.length - 1] + 1 : 0)
        const area = h * width

        steps.push({
          phase: 'area_calc',
          currentRow: row,
          heights: [...heights],
          maxArea,
          currentArea: area,
          activeLine: 15,
          message: `Pop[${popIdx}]: h=${h}, width=${width}, area=${area}`,
        })

        currentMaxArea = Math.max(currentMaxArea, area)
      }

      stack.push(i)
    }

    while (stack.length > 0) {
      const popIdx = stack.pop()
      const h = heights[popIdx]
      const width = n - (stack.length > 0 ? stack[stack.length - 1] + 1 : 0)
      const area = h * width

      steps.push({
        phase: 'area_final',
        currentRow: row,
        heights: [...heights],
        maxArea,
        currentArea: area,
        activeLine: 15,
        message: `Final pop[${popIdx}]: h=${h}, width=${width}, area=${area}`,
      })

      currentMaxArea = Math.max(currentMaxArea, area)
    }

    maxArea = Math.max(maxArea, currentMaxArea)

    steps.push({
      phase: 'row_end',
      currentRow: row,
      heights: [...heights],
      maxArea,
      activeLine: 15,
      message: `Row ${row} complete. Max area so far: ${maxArea}`,
    })
  }

  steps.push({
    phase: 'done',
    currentRow: m,
    heights: [...heights],
    maxArea,
    activeLine: 15,
    message: `Complete. Maximum rectangle: ${maxArea}`,
  })

  return steps
}

const EXAMPLES = getExamples('maximal-rectangle')

function VisualizationPanel({ EXAMPLES, applyExample, selected, handleReset, step }) {
  const initial = EXAMPLES[selected]?.matrix ?? [
    ['1', '0', '1'],
    ['1', '0', '1'],
    ['1', '1', '1'],
  ]
  const matrix = step?.matrix ?? initial
  const n = matrix[0]?.length || 0
  const m = matrix.length || 0

  const cellSize = Math.min(300 / n, 200 / m, 50)

  const getCellColor = (r, c) => {
    if (step?.currentRow === r) {
      return matrix[r][c] === '1' || matrix[r][c] === 1 ? '#a6e3a1' : '#f5c6de'
    }
    return matrix[r][c] === '1' || matrix[r][c] === 1 ? '#45475a' : '#313244'
  }

  return (
    <div className="mr-viz-panel">
      <div className="mr-top">
        <section className="mr-panel main">
          <header className="mr-head">
            <span>Maximal Rectangle</span>
          </header>
          <div className="mr-body">
            {EXAMPLES && EXAMPLES.length > 0 && (
              <div className="mr-examples">
                {EXAMPLES.map((ex, i) => (
                  <button
                    key={ex.label}
                    className={`mr-chip ${selected === EXAMPLES.indexOf(ex) ? 'active' : ''}`}
                    onClick={() => applyExample(EXAMPLES.indexOf(ex))}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mr-content">
              <div className="mr-grid-section">
                <div className="mr-panel-label">Matrix</div>
                <div
                  className="mr-grid"
                  style={{
                    gridTemplateColumns: `repeat(${n}, ${cellSize}px)`,
                    gap: '4px',
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {matrix.map((row, r) =>
                      row.map((val, c) => (
                        <motion.div
                          key={`${r}-${c}`}
                          className="mr-cell"
                          style={{
                            backgroundColor: getCellColor(r, c),
                            width: cellSize,
                            height: cellSize,
                          }}
                          initial={{ opacity: 0.3 }}
                          animate={{ opacity: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="mr-cell-value">{val}</div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mr-histogram-section">
                <div className="mr-panel-label">Heights Histogram</div>
                <div className="mr-histogram-container">
                  {step?.heights?.map((h, i) => (
                    <motion.div
                      key={i}
                      className="mr-histogram-bar"
                      animate={{
                        height: `${(h / Math.max(...(step?.heights || [1]))) * 100}%`,
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        backgroundColor:
                          step?.currentHistIdx === i ? '#f38ba8' : '#a6e3a1',
                      }}
                      title={`heights[${i}] = ${h}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mr-state-section">
                <div className="mr-panel-label">State</div>
                <div className="mr-state">
                  <div className="mr-state-item">
                    <div className="mr-state-label">Phase:</div>
                    <div className="mr-state-value">{step?.phase}</div>
                  </div>
                  <div className="mr-state-item">
                    <div className="mr-state-label">Current Row:</div>
                    <div className="mr-state-value">{step?.currentRow}</div>
                  </div>
                  <div className="mr-state-item">
                    <div className="mr-state-label">Max Area:</div>
                    <div className="mr-state-value">{step?.maxArea}</div>
                  </div>
                  {step?.currentArea !== undefined && (
                    <div className="mr-state-item">
                      <div className="mr-state-label">Current Area:</div>
                      <div className="mr-state-value">{step?.currentArea}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="mr-status">{step?.message ?? 'Press Play to begin.'}</div>
    </div>
  )
}

export default function MaximalRectangleVisualizer() {
  const [selected, setSelected] = useState(0)
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const initial = EXAMPLES[selected]?.matrix ?? [
    ['1', '0', '1'],
    ['1', '0', '1'],
    ['1', '1', '1'],
  ]
  const steps = useMemo(() => generateSteps(initial), [initial])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback(
    (idx) => {
      setSelected(idx)
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: (
          <VisualizationPanel
            EXAMPLES={EXAMPLES}
            applyExample={applyExample}
            selected={selected}
            handleReset={handleReset}
            step={step}
          />
        ),
      },
      {
        id: 'code',
        title: 'Code',
        content: (
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
        ),
      },
    ],
    [step, autoScrollCode, selected]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['viz', 'code']], minimized: [] }} />
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
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
