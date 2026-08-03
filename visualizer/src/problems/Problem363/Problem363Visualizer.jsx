import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem363.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['bst_search', 'done', 'init', 'left_col', 'right_col_start', 'sum_calc', 'update_result']
const LINE_PATTERN_MAP = {
  2: 'done',
  4: 'left_col',
  6: 'right_col_start',
  8: 'sum_calc',
  11: 'bst_search',
  14: 'update_result',
  16: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def maxSumSubmatrix(matrix, K):' },
  { line: 2, text: '    m, n = len(matrix), len(matrix[0])' },
  { line: 3, text: '    result = float("-inf")' },
  { line: 4, text: '    for left in range(n):' },
  { line: 5, text: '        colSums = [0] * m' },
  { line: 6, text: '        for right in range(left, n):' },
  { line: 7, text: '            for row in range(m):' },
  { line: 8, text: '                colSums[row] += matrix[row][right]' },
  { line: 9, text: '            bst = BST()' },
  { line: 10, text: '            for sum in colSums:' },
  { line: 11, text: '                target = sum - K' },
  { line: 12, text: '                maxSum = bst.findMax(target)' },
  { line: 13, text: '                if maxSum is not None:' },
  { line: 14, text: '                    result = max(result, sum - maxSum)' },
  { line: 15, text: '                bst.insert(sum)' },
  { line: 16, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(matrix, K) {
  const steps = []

  if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
    steps.push({
      activeLine: 2,
      phase: 'done',
      message: 'Empty matrix.',
    })
    return steps
  }

  const m = matrix.length
  const n = matrix[0].length

  steps.push({
    activeLine: 2,
    phase: 'init',
    m,
    n,
    K,
    message: `Matrix ${m}×${n}, K=${K}. Compress by column ranges.`,
  })

  let result = -Infinity
  const compressedRanges = []

  for (let left = 0; left < n; left++) {
    steps.push({
      activeLine: 4,
      phase: 'left_col',
      left,
      right: left - 1,
      K,
      message: `Start column range: left=${left}`,
    })

    const colSums = new Array(m).fill(0)

    for (let right = left; right < n; right++) {
      steps.push({
        activeLine: 6,
        phase: 'right_col_start',
        left,
        right,
        K,
        colSums: [...colSums],
        message: `Extend range: right=${right}`,
      })

      for (let row = 0; row < m; row++) {
        colSums[row] += matrix[row][right]
      }

      steps.push({
        activeLine: 8,
        phase: 'sum_calc',
        left,
        right,
        K,
        colSums: [...colSums],
        message: `Column sums [${left}..${right}]: [${colSums.map(s => s).join(', ')}]`,
      })

      const bstValues = []
      let maxForThisRange = -Infinity

      for (let i = 0; i < colSums.length; i++) {
        const sum = colSums[i]
        const target = sum - K

        // Find max value <= target in bst
        let maxSum = null
        for (const val of bstValues) {
          if (val <= target && (maxSum === null || val > maxSum)) {
            maxSum = val
          }
        }

        steps.push({
          activeLine: 11,
          phase: 'bst_search',
          left,
          right,
          K,
          colSums: [...colSums],
          currentRowSum: sum,
          target,
          maxSum,
          validSumFound: maxSum !== null,
          message: `Row ${i}: sum=${sum}, target(≤K)=${target}, max≤target=${maxSum !== null ? maxSum : 'none'}`,
        })

        if (maxSum !== null) {
          const candidateSum = sum - maxSum
          if (candidateSum <= K && candidateSum > maxForThisRange) {
            maxForThisRange = candidateSum
            result = Math.max(result, candidateSum)
          }

          steps.push({
            activeLine: 14,
            phase: 'update_result',
            left,
            right,
            K,
            colSums: [...colSums],
            rectangleSum: candidateSum,
            result,
            message: `Rectangle sum = ${sum} - ${maxSum} = ${candidateSum} ≤ ${K}? Yes. result = ${result}`,
          })
        }

        bstValues.push(sum)
        bstValues.sort((a, b) => a - b)
      }

      if (maxForThisRange !== -Infinity) {
        compressedRanges.push({
          left,
          right,
          sum: maxForThisRange,
        })
      }
    }
  }

  steps.push({
    activeLine: 16,
    phase: 'done',
    result,
    K,
    compressedRanges,
    message: `Complete. Maximum rectangle sum ≤ ${K}: ${result === -Infinity ? 'none' : result}`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple 2×2',
    matrix: [
      [1, 0],
      [0, -2],
    ],
    K: 0,
  },
  {
    label: 'Constraint Binding',
    matrix: [
      [5, -4, -3],
      [4, -3, 4],
      [-3, 3, -4],
    ],
    K: 3,
  },
  {
    label: 'Optimization',
    matrix: [
      [2, 1, -1],
      [-1, -1, 2],
      [1, 0, -1],
    ],
    K: 2,
  },
]

export default function Problem363Visualizer() {
  const [exIdx, setExIdx] = useState(0)

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.matrix, ex.K), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const cols = ex.matrix[0].length
  const rows = ex.matrix.length

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
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
        title: '🎯 Rectangle Search',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            {/* Examples Selector */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                    fontWeight: exIdx === i ? 600 : 400,
                  }}
                >
                  {e.label}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#1e293b' }}>K = {ex.K}</span>
            </div>

            {/* Matrix Display */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Matrix</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`, gap: 4 }}>
                {ex.matrix.map((row, i) =>
                  row.map((val, j) => {
                    const isInRange =
                      step?.left !== undefined &&
                      step?.right !== undefined &&
                      j >= step.left &&
                      j <= step.right
                    const isCurrentCol = step?.right === j && step?.left !== undefined
                    const highlight = step?.phase === 'sum_calc' || step?.phase === 'bst_search'

                    return (
                      <motion.div
                        key={`${i}-${j}`}
                        animate={{
                          scale: isCurrentCol ? 1.1 : 1,
                          opacity: highlight && !isInRange ? 0.4 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isCurrentCol ? '#fbbf24' : isInRange ? '#dbeafe' : '#f1f5f9',
                          border: isCurrentCol ? '2px solid #f59e0b' : isInRange ? '1px solid #0ea5e9' : '1px solid #cbd5e1',
                          borderRadius: 4,
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#1e293b',
                        }}
                      >
                        {val}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Column Range Info */}
            {step?.left !== undefined && step?.right !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 10,
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>
                  Column Range: [{step.left}...{step.right}]
                </div>
                {step.colSums && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {step.colSums.map((sum, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: step.currentRowSum === sum ? 1.15 : 1,
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: step.currentRowSum === sum ? '#0ea5e9' : '#e0f2fe',
                          color: step.currentRowSum === sum ? '#fff' : '#1e40af',
                          borderRadius: 3,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {sum}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* BST Search Info */}
            {step?.phase === 'bst_search' && step.target !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: 10,
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 600, color: '#92400e', marginBottom: 6 }}>
                  BST Search: sum={step.currentRowSum}, target(≤K)={step.target}
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {step.maxSum !== null ? (
                    <>
                      <span style={{ color: '#92400e' }}>
                        Max ≤ {step.target} found: {step.maxSum}
                      </span>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>
                        → Rectangle = {step.currentRowSum} - {step.maxSum} = {step.currentRowSum - step.maxSum}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#92400e' }}>No value ≤ {step.target} in BST</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Result Display */}
            {step?.phase === 'done' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: 12,
                  backgroundColor: step.result === -Infinity ? '#fee2e2' : '#dcfce7',
                  border: step.result === -Infinity ? '2px solid #fecaca' : '2px solid #86efac',
                  borderRadius: 6,
                  textAlign: 'center',
                  fontWeight: 700,
                  color: step.result === -Infinity ? '#991b1b' : '#15803d',
                  fontSize: 12,
                }}
              >
                {step.result === -Infinity
                  ? `No valid rectangle ≤ ${step.K}`
                  : `Maximum sum: ${step.result} ≤ ${step.K}`}
              </motion.div>
            )}

            {/* Message */}
            {step && (
              <div
                style={{
                  padding: 10,
                  backgroundColor: '#f8fafc',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#475569',
                  borderLeft: '3px solid #0ea5e9',
                }}
              >
                {step.message}
              </div>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex]
  )

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
          prevDisabled={stepIndex <= 0}
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
