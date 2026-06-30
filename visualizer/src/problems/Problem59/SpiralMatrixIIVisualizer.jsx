import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './SpiralMatrixIIVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"

const SOLUTION_CODE = [
  { line: 1,  text: 'class Solution:' },
  { line: 2,  text: '    def generateMatrix(self, n: int) -> List[List[int]]:' },
  { line: 3,  text: '        matrix = [[0] * n for _ in range(n)]' },
  { line: 4,  text: '        top, bottom = 0, n - 1' },
  { line: 5,  text: '        left, right = 0, n - 1' },
  { line: 6,  text: '        num = 1' },
  { line: 7,  text: '        while top <= bottom and left <= right:' },
  { line: 8,  text: '            for j in range(left, right + 1):' },
  { line: 9,  text: '                matrix[top][j] = num' },
  { line: 10, text: '                num += 1' },
  { line: 11, text: '            top += 1' },
  { line: 12, text: '            for i in range(top, bottom + 1):' },
  { line: 13, text: '                matrix[i][right] = num' },
  { line: 14, text: '                num += 1' },
  { line: 15, text: '            right -= 1' },
  { line: 16, text: '            if top <= bottom:' },
  { line: 17, text: '                for j in range(right, left - 1, -1):' },
  { line: 18, text: '                    matrix[bottom][j] = num' },
  { line: 19, text: '                    num += 1' },
  { line: 20, text: '                bottom -= 1' },
  { line: 21, text: '            if left <= right:' },
  { line: 22, text: '                for i in range(bottom, top - 1, -1):' },
  { line: 23, text: '                    matrix[i][left] = num' },
  { line: 24, text: '                    num += 1' },
  { line: 25, text: '                left += 1' },
  { line: 26, text: '        return matrix' },
]

const SPIRALMATRIXII_PATTERNS = ['check_left_right', 'check_top_bottom', 'check_while', 'done', 'fill', 'init', 'start_down', 'start_left', 'start_right', 'start_up', 'update_bottom', 'update_left', 'update_right', 'update_top']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'done',
  3: 'init',
  7: 'check_while',
  8: 'start_right',
  9: 'fill',
  11: 'update_top',
  12: 'start_down',
  13: 'fill',
  15: 'update_right',
  16: 'check_top_bottom',
  17: 'start_left',
  18: 'fill',
  20: 'update_bottom',
  21: 'check_left_right',
  22: 'start_up',
  23: 'fill',
  25: 'update_left',
  26: 'done',
}

function generateSteps(n) {
  const steps = []

  if (!n || n <= 0 || n > 20) {
    steps.push({
      phase: 'done', top: null, bottom: null, left: null, right: null,
      matrix: [], num: 1, currI: null, currJ: null,
      activeLine: 2, message: 'Invalid n. Constraint: 1 <= n <= 20.'
    })
    return steps
  }

  const matrix = Array.from({ length: n }, () => Array(n).fill(0))
  let top = 0
  let bottom = n - 1
  let left = 0
  let right = n - 1
  let num = 1

  steps.push({
    phase: 'init', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
    currI: null, currJ: null, activeLine: 3,
    message: `Initialize ${n}x${n} matrix and boundaries: top=${top}, bottom=${bottom}, left=${left}, right=${right}.`
  })

  while (top <= bottom && left <= right) {
    steps.push({
      phase: 'check_while', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 7,
      message: `Check: top <= bottom (${top} <= ${bottom}) and left <= right (${left} <= ${right}).`
    })

    // Fill right
    steps.push({
      phase: 'start_right', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 8,
      message: `Fill row ${top} from left to right.`
    })
    for (let j = left; j <= right; j++) {
      matrix[top][j] = num
      steps.push({
        phase: 'fill', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: top, currJ: j, activeLine: 9,
        message: `Set matrix[${top}][${j}] = ${num}.`
      })
      num++
    }
    top++
    steps.push({
      phase: 'update_top', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 11,
      message: `Increment top boundary to ${top}.`
    })

    // Fill down
    steps.push({
      phase: 'start_down', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 12,
      message: `Fill column ${right} from top to bottom.`
    })
    for (let i = top; i <= bottom; i++) {
      matrix[i][right] = num
      steps.push({
        phase: 'fill', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: i, currJ: right, activeLine: 13,
        message: `Set matrix[${i}][${right}] = ${num}.`
      })
      num++
    }
    right--
    steps.push({
      phase: 'update_right', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 15,
      message: `Decrement right boundary to ${right}.`
    })

    steps.push({
      phase: 'check_top_bottom', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 16,
      message: `Check if top <= bottom (${top} <= ${bottom}).`
    })
    if (top <= bottom) {
      // Fill left
      steps.push({
        phase: 'start_left', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: null, currJ: null, activeLine: 17,
        message: `Fill row ${bottom} from right to left.`
      })
      for (let j = right; j >= left; j--) {
        matrix[bottom][j] = num
        steps.push({
          phase: 'fill', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
          currI: bottom, currJ: j, activeLine: 18,
          message: `Set matrix[${bottom}][${j}] = ${num}.`
        })
        num++
      }
      bottom--
      steps.push({
        phase: 'update_bottom', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: null, currJ: null, activeLine: 20,
        message: `Decrement bottom boundary to ${bottom}.`
      })
    }

    steps.push({
      phase: 'check_left_right', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
      currI: null, currJ: null, activeLine: 21,
      message: `Check if left <= right (${left} <= ${right}).`
    })
    if (left <= right) {
      // Fill up
      steps.push({
        phase: 'start_up', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: null, currJ: null, activeLine: 22,
        message: `Fill column ${left} from bottom to top.`
      })
      for (let i = bottom; i >= top; i--) {
        matrix[i][left] = num
        steps.push({
          phase: 'fill', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
          currI: i, currJ: left, activeLine: 23,
          message: `Set matrix[${i}][${left}] = ${num}.`
        })
        num++
      }
      left++
      steps.push({
        phase: 'update_left', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
        currI: null, currJ: null, activeLine: 25,
        message: `Increment left boundary to ${left}.`
      })
    }
  }

  steps.push({
    phase: 'done', top, bottom, left, right, matrix: matrix.map(r => [...r]), num,
    currI: null, currJ: null, activeLine: 26,
    message: `Matrix generation complete. All ${n * n} numbers placed in spiral order.`
  })

  return steps
}

const EXAMPLES = getExamples('spiral-matrix-ii') || [
  { label: 'n=1', n: 1 },
  { label: 'n=2', n: 2 },
  { label: 'n=3', n: 3 },
  { label: 'n=4', n: 4 },
]

export default function SpiralMatrixIIVisualizer() {
  const [nInput, setNInput] = useState('3')

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { n, inputError } = useMemo(() => {
    try {
      const parsed = parseInt(nInput, 10)
      if (isNaN(parsed) || parsed < 1 || parsed > 20) {
        throw new Error('n must be 1-20.')
      }
      return { n: parsed, inputError: '' }
    } catch (e) {
      return { n: 3, inputError: 'Invalid input' }
    }
  }, [nInput])

  const steps = useMemo(() => generateSteps(n), [n])

  const {
    stepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(String(ex.n))
    handleReset()
  }, [handleReset])

  return (
    <div className="spiral-matrix-ii-shell">
      <div className="smi-top">
        <div className="smi-panel">
          <div className="smi-panel-head">
            Matrix Generation
            {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
          </div>
          <div className="smi-panel-body">
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  className="smi-example-btn"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6 }}>
                n (matrix size):
              </label>
              <input
                value={nInput}
                onChange={(e) => { setNInput(e.target.value);

 handleReset() }}
                placeholder="3"
                className="smi-input"
                type="number"
                min="1"
                max="20"
              />
            </div>

            <div className="smi-matrix-container">
              <div
                className="smi-grid"
                style={{
                  gridTemplateColumns: `repeat(${n}, 1fr)`,
                  gridTemplateRows: `repeat(${n}, 1fr)`,
                  width: Math.min(n * 50, 400),
                  height: Math.min(n * 50, 400),
                }}
              >
                {step && step.matrix.map((row, i) => row.map((val, j) => {
                  const isCurrent = step && step.currI === i && step.currJ === j
                  const isFilled = val > 0

                  return (
                    <motion.div
                      key={`${i}-${j}`}
                      className={`smi-cell ${isFilled ? 'filled' : ''} ${isCurrent ? 'current' : ''}`}
                      layout
                    >
                      {isFilled ? val : ''}
                    </motion.div>
                  )
                }))}
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 13, color: '#94a3b8' }}>
              Current num: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{step?.num ?? '–'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="spiral-matrix-ii-middle">
                <div style={{ position: "relative" }}>
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />

          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
              activeLine={step?.activeLine}
            />
          )}
        </div>

        <div className="smi-panel">
          <div className="smi-panel-head">Variables</div>
          <div className="smi-panel-body">
            <div className="smi-vars">
              <div className="smi-var-row">
                <span className="smi-var-name">top</span>
                <span className="smi-var-val" style={{ color: '#ef4444' }}>{step?.top ?? '–'}</span>
              </div>
              <div className="smi-var-row">
                <span className="smi-var-name">bottom</span>
                <span className="smi-var-val" style={{ color: '#f97316' }}>{step?.bottom ?? '–'}</span>
              </div>
              <div className="smi-var-row">
                <span className="smi-var-name">left</span>
                <span className="smi-var-val" style={{ color: '#3b82f6' }}>{step?.left ?? '–'}</span>
              </div>
              <div className="smi-var-row">
                <span className="smi-var-name">right</span>
                <span className="smi-var-val" style={{ color: '#8b5cf6' }}>{step?.right ?? '–'}</span>
              </div>
              <div className="smi-var-row">
                <span className="smi-var-name">num</span>
                <span className="smi-var-val highlight">{step?.num ?? '–'}</span>
              </div>
              <div className="smi-var-row">
                <span className="smi-var-name">n</span>
                <span className="smi-var-val">{n}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`smi-status ${step?.phase === 'fill' ? 'fill' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={SPIRALMATRIXII_PATTERNS} />
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
      </FloatingPanel>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
