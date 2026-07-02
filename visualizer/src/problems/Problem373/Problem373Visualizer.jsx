import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem373Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []

const EXAMPLES = getExamples('search-a-2d-matrix-ii')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def searchMatrix(matrix, target):' },
  { line: 2, text: '    if not matrix or not matrix[0]:' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    rows, cols = len(matrix), len(matrix[0])' },
  { line: 5, text: '    row, col = 0, cols - 1' },
  { line: 6, text: '    while row < rows and col >= 0:' },
  { line: 7, text: '        if matrix[row][col] == target:' },
  { line: 8, text: '            return True' },
  { line: 9, text: '        elif matrix[row][col] > target:' },
  { line: 10, text: '            col -= 1' },
  { line: 11, text: '        else:' },
  { line: 12, text: '            row += 1' },
  { line: 13, text: '    return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(matrix, target) {
  const steps = []
  const rows = matrix.length
  const cols = matrix[0]?.length || 0

  if (!matrix.length || !cols) {
    steps.push({
      activeLine: 2,
      row: -1,
      col: -1,
      found: false,
      message: 'Empty matrix, return False',
    })
    return steps
  }

  // Initialize
  steps.push({
    activeLine: 5,
    row: 0,
    col: cols - 1,
    current: null,
    comparison: null,
    found: null,
    message: `Start at top-right: [0][${cols - 1}]`,
  })

  let row = 0
  let col = cols - 1
  const path = [[0, cols - 1]]

  while (row < rows && col >= 0) {
    const current = matrix[row][col]
    let comparison = null

    if (current === target) {
      steps.push({
        activeLine: 7,
        row,
        col,
        current,
        comparison: '==',
        found: true,
        path: [...path],
        message: `matrix[${row}][${col}] = ${current} == ${target} ✓ Found!`,
      })
      return steps
    } else if (current > target) {
      comparison = '>'
      steps.push({
        activeLine: 9,
        row,
        col,
        current,
        comparison,
        found: null,
        path: [...path],
        message: `matrix[${row}][${col}] = ${current} > ${target}, move left`,
      })
      col--
      path.push([row, col])
      steps.push({
        activeLine: 10,
        row,
        col,
        current,
        comparison: null,
        found: null,
        path: [...path],
        message: `col = ${col}`,
      })
    } else {
      comparison = '<'
      steps.push({
        activeLine: 11,
        row,
        col,
        current,
        comparison,
        found: null,
        path: [...path],
        message: `matrix[${row}][${col}] = ${current} < ${target}, move down`,
      })
      row++
      path.push([row, col])
      steps.push({
        activeLine: 12,
        row,
        col,
        current,
        comparison: null,
        found: null,
        path: [...path],
        message: `row = ${row}`,
      })
    }
  }

  steps.push({
    activeLine: 13,
    row,
    col,
    current: null,
    comparison: null,
    found: false,
    path: [...path],
    message: `Exhausted search space, ${target} not found`,
  })

  return steps
}

function MatrixVisualization({ matrix, target, step }) {
  const rows = matrix.length
  const cols = matrix[0]?.length || 0
  const currentRow = step?.row ?? -1
  const currentCol = step?.col ?? -1
  const path = step?.path || []
  const pathSet = new Set(path.map(p => `${p[0]},${p[1]}`))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
        Matrix ({rows}×{cols}), Target: {target}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
          gap: 6,
          padding: 12,
          backgroundColor: '#f8fafc',
          borderRadius: 8,
        }}
      >
        {matrix.map((row, r) =>
          row.map((val, c) => {
            const isCurrent = r === currentRow && c === currentCol && !step?.found
            const isOnPath = pathSet.has(`${r},${c}`)
            const isFound = isCurrent && step?.found === true

            return (
              <motion.div
                key={`cell-${r}-${c}`}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  boxShadow: isFound ? '0 0 15px rgba(34, 197, 94, 0.6)' : '0 0 0px',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isFound
                    ? '#dcfce7'
                    : isCurrent
                      ? '#fef3c7'
                      : isOnPath
                        ? '#dbeafe'
                        : '#f1f5f9',
                  border: isCurrent
                    ? '2px solid #f59e0b'
                    : isOnPath
                      ? '1px solid #0284c7'
                      : '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#1e293b',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {val}
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    fontSize: 9,
                    color: '#64748b',
                    fontWeight: 'normal',
                  }}
                >
                  [{r},{c}]
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {step && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            padding: 12,
            backgroundColor: '#f8fafc',
            borderRadius: 6,
            border: '2px solid #8b5cf6',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
            Current Position
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#1e40af' }}>row</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0c4a6e' }}>
                {currentRow >= 0 ? currentRow : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fee2e2', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#991b1b' }}>col</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#7f1d1d' }}>
                {currentCol >= 0 ? currentCol : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#fce7f3', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#831843' }}>current</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#be185d' }}>
                {step.current !== null ? step.current : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#15803d' }}>comparison</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#166534' }}>
                {step.comparison || '—'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step?.found !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            padding: 12,
            backgroundColor: step?.found ? '#dcfce7' : '#fee2e2',
            borderRadius: 6,
            border: step?.found ? '2px solid #86efac' : '2px solid #fecaca',
            textAlign: 'center',
            fontWeight: 600,
            color: step?.found ? '#15803d' : '#991b1b',
            fontSize: 14,
          }}
        >
          {step?.found ? `✓ Found ${target} at [${step.row}][${step.col}]` : `✗ ${target} not found`}
        </motion.div>
      )}

      <div style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 8 }}>
        <strong>Strategy:</strong> Start from top-right corner. If current value is larger than target, move left (decrease column). If smaller, move down (increase row).
      </div>
    </div>
  )
}

function VisualizationPanel({ matrix, target, step, applyEx, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {examples.map((e, idx) => (
            <button
              key={e.label}
              onClick={() => applyEx(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <MatrixVisualization matrix={matrix} target={target} step={step} />
    </div>
  )
}

export default function Problem373Visualizer() {
  const [exIndex, setExIndex] = useState(0)
  const codeLines = SOLUTION_CODE_HOOK && SOLUTION_CODE_HOOK.length > 0 ? SOLUTION_CODE_HOOK : SOLUTION_CODE

  const examples = EXAMPLES && EXAMPLES.length > 0 ? EXAMPLES : [
    {
      label: 'Found (5)',
      matrix: [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
      ],
      target: 5,
    },
    {
      label: 'Not Found (20)',
      matrix: [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
      ],
      target: 20,
    },
    {
      label: 'Edge (1)',
      matrix: [
        [1, 4, 7, 11, 15],
        [2, 5, 8, 12, 19],
        [3, 6, 9, 16, 22],
        [10, 13, 14, 17, 24],
        [18, 21, 23, 26, 30],
      ],
      target: 1,
    },
  ]

  const { matrix, target } = examples[exIndex]

  const steps = useMemo(() => generateSteps(matrix, target), [matrix, target])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : steps[0]

  const applyEx = useCallback((idx) => {
    setExIndex(idx)
    handleReset()
  }, [handleReset])

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
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={codeLines}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>
      ),
    },
    {
      id: 'viz',
      title: '🔍 Staircase Search',
      content: (
        <VisualizationPanel
          matrix={matrix}
          target={target}
          step={step}
          applyEx={applyEx}
          examples={examples}
        />
      ),
    },
  ], [step, codeLines, connectivity, setActiveLineDom, matrix, target, applyEx, examples])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
