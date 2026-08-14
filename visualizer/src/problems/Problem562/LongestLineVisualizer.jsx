import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './LongestLineVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def longestLine(self, mat: list[list[int]]) -> int:' },
  { line: 3, text: '        if not mat:' },
  { line: 4, text: '            return 0' },
  { line: 5, text: '        ' },
  { line: 6, text: '        m, n = len(mat), len(mat[0])' },
  { line: 7, text: '        h = [[0] * n for _ in range(m)]  # horizontal' },
  { line: 8, text: '        v = [[0] * n for _ in range(m)]  # vertical' },
  { line: 9, text: '        d = [[0] * n for _ in range(m)]  # diagonal' },
  { line: 10, text: '        ad = [[0] * n for _ in range(m)]  # anti-diagonal' },
  { line: 11, text: '        max_len = 0' },
  { line: 12, text: '        ' },
  { line: 13, text: '        for i in range(m):' },
  { line: 14, text: '            for j in range(n):' },
  { line: 15, text: '                if mat[i][j] == 1:' },
  { line: 16, text: '                    # Horizontal: extend from left' },
  { line: 17, text: '                    h[i][j] = h[i][j-1] + 1 if j > 0 else 1' },
  { line: 18, text: '                    # Vertical: extend from top' },
  { line: 19, text: '                    v[i][j] = v[i-1][j] + 1 if i > 0 else 1' },
  { line: 20, text: '                    # Diagonal: extend from top-left' },
  { line: 21, text: '                    d[i][j] = d[i-1][j-1] + 1 if i > 0 and j > 0 else 1' },
  { line: 22, text: '                    # Anti-diagonal: extend from top-right' },
  { line: 23, text: '                    ad[i][j] = ad[i-1][j+1] + 1 if i > 0 and j < n-1 else 1' },
  { line: 24, text: '                    ' },
  { line: 25, text: '                    # Update max with all 4 directions' },
  { line: 26, text: '                    max_len = max(max_len, h[i][j], v[i][j], d[i][j], ad[i][j])' },
  { line: 27, text: '        ' },
  { line: 28, text: '        return max_len' },
]

const PATTERNS = ['initialize', 'scanning', 'horizontal', 'vertical', 'diagonal', 'update_max', 'done']
const LINE_PATTERN_MAP = {
  7: 'initialize',
  8: 'initialize',
  9: 'initialize',
  10: 'initialize',
  13: 'scanning',
  14: 'scanning',
  17: 'horizontal',
  19: 'vertical',
  21: 'diagonal',
  23: 'diagonal',
  26: 'update_max',
  28: 'done',
}

function generateSteps(matrix) {
  const steps = []

  if (!Array.isArray(matrix) || matrix.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 28,
      relatedLines: [28],
      message: 'Invalid input: empty matrix',
      result: 0,
      done: true,
    })
    return steps
  }

  const m = matrix.length
  const n = matrix[0].length || 0

  if (n === 0) {
    steps.push({
      phase: 'done',
      activeLine: 28,
      relatedLines: [28],
      message: 'Invalid input: empty matrix',
      result: 0,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'initialize',
    activeLine: 6,
    relatedLines: [6, 7, 8, 9, 10, 11],
    message: `Initialize dimensions: m=${m}, n=${n}. Create 4 DP arrays (horizontal, vertical, diagonal, anti-diagonal)`,
    m,
    n,
    currentCell: null,
  })

  const h = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0))
  const v = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0))
  const d = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0))
  const ad = Array(m)
    .fill(0)
    .map(() => Array(n).fill(0))

  let maxLen = 0

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const currentCell = [i, j]

      steps.push({
        phase: 'scanning',
        activeLine: 15,
        relatedLines: [14, 15],
        message: `Scan cell [${i},${j}]. Value: ${matrix[i][j]}`,
        currentCell,
        m,
        n,
        matrix: matrix.map((row) => [...row]),
        h: h.map((row) => [...row]),
        v: v.map((row) => [...row]),
        d: d.map((row) => [...row]),
        ad: ad.map((row) => [...row]),
        maxLen,
      })

      if (matrix[i][j] === 1) {
        // Horizontal
        const hVal = j > 0 ? h[i][j - 1] + 1 : 1
        h[i][j] = hVal

        steps.push({
          phase: 'horizontal',
          activeLine: 17,
          relatedLines: [17],
          message: `Horizontal: Cell [${i},${j}] has ${hVal} consecutive ones (extending from left)`,
          currentCell,
          m,
          n,
          direction: 'horizontal',
          value: hVal,
          matrix: matrix.map((row) => [...row]),
          h: h.map((row) => [...row]),
          v: v.map((row) => [...row]),
          d: d.map((row) => [...row]),
          ad: ad.map((row) => [...row]),
          maxLen,
        })

        // Vertical
        const vVal = i > 0 ? v[i - 1][j] + 1 : 1
        v[i][j] = vVal

        steps.push({
          phase: 'vertical',
          activeLine: 19,
          relatedLines: [19],
          message: `Vertical: Cell [${i},${j}] has ${vVal} consecutive ones (extending from top)`,
          currentCell,
          m,
          n,
          direction: 'vertical',
          value: vVal,
          matrix: matrix.map((row) => [...row]),
          h: h.map((row) => [...row]),
          v: v.map((row) => [...row]),
          d: d.map((row) => [...row]),
          ad: ad.map((row) => [...row]),
          maxLen,
        })

        // Diagonal
        const dVal = i > 0 && j > 0 ? d[i - 1][j - 1] + 1 : 1
        d[i][j] = dVal

        steps.push({
          phase: 'diagonal',
          activeLine: 21,
          relatedLines: [21],
          message: `Diagonal: Cell [${i},${j}] has ${dVal} consecutive ones (extending from top-left)`,
          currentCell,
          m,
          n,
          direction: 'diagonal',
          value: dVal,
          matrix: matrix.map((row) => [...row]),
          h: h.map((row) => [...row]),
          v: v.map((row) => [...row]),
          d: d.map((row) => [...row]),
          ad: ad.map((row) => [...row]),
          maxLen,
        })

        // Anti-diagonal
        const adVal = i > 0 && j < n - 1 ? ad[i - 1][j + 1] + 1 : 1
        ad[i][j] = adVal

        steps.push({
          phase: 'diagonal',
          activeLine: 23,
          relatedLines: [23],
          message: `Anti-diagonal: Cell [${i},${j}] has ${adVal} consecutive ones (extending from top-right)`,
          currentCell,
          m,
          n,
          direction: 'anti-diagonal',
          value: adVal,
          matrix: matrix.map((row) => [...row]),
          h: h.map((row) => [...row]),
          v: v.map((row) => [...row]),
          d: d.map((row) => [...row]),
          ad: ad.map((row) => [...row]),
          maxLen,
        })

        // Update max
        maxLen = Math.max(maxLen, hVal, vVal, dVal, adVal)

        steps.push({
          phase: 'update_max',
          activeLine: 26,
          relatedLines: [26],
          message: `Update max length: max(${maxLen - Math.max(hVal, vVal, dVal, adVal)}, ${hVal}, ${vVal}, ${dVal}, ${adVal}) = ${maxLen}`,
          currentCell,
          m,
          n,
          directionValues: { horizontal: hVal, vertical: vVal, diagonal: dVal, antiDiagonal: adVal },
          maxLen,
          matrix: matrix.map((row) => [...row]),
          h: h.map((row) => [...row]),
          v: v.map((row) => [...row]),
          d: d.map((row) => [...row]),
          ad: ad.map((row) => [...row]),
        })
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 28,
    relatedLines: [28],
    message: `Complete! Longest line of consecutive ones: ${maxLen}`,
    result: maxLen,
    done: true,
  })

  return steps
}

function MatrixGrid({ matrix, currentCell, h, v, d, ad, direction }) {
  if (!matrix || matrix.length === 0) return null

  const m = matrix.length
  const n = matrix[0].length

  const getCellColor = (i, j) => {
    if (!currentCell || currentCell[0] !== i || currentCell[1] !== j) {
      return matrix[i][j] === 1 ? '#1e293b' : '#0f172a'
    }
    return '#f59e0b'
  }

  const getCellBorder = (i, j) => {
    if (!currentCell || currentCell[0] !== i || currentCell[1] !== j) {
      return '1px solid #334155'
    }
    return '3px solid #f59e0b'
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gap: 6,
        padding: 12,
        backgroundColor: '#0f172a',
        borderRadius: 6,
      }}
    >
      {matrix.map((row, i) =>
        row.map((val, j) => (
          <motion.div
            key={`${i}-${j}`}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: getCellColor(i, j),
              border: getCellBorder(i, j),
              borderRadius: 4,
              color: val === 1 ? '#f59e0b' : '#64748b',
              fontWeight: 700,
              fontSize: 14,
              fontFamily: 'monospace',
            }}
            animate={{
              backgroundColor: getCellColor(i, j),
              borderColor: currentCell && currentCell[0] === i && currentCell[1] === j ? '#f59e0b' : '#334155',
            }}
            transition={{ duration: 0.2 }}
          >
            {val}
          </motion.div>
        ))
      )}
    </div>
  )
}

function DirectionIndicator({ direction, value }) {
  if (!direction) return null

  const directionMap = {
    horizontal: { label: '→ Horizontal', color: '#3b82f6' },
    vertical: { label: '↓ Vertical', color: '#10b981' },
    diagonal: { label: '↘ Diagonal', color: '#8b5cf6' },
    'anti-diagonal': { label: '↙ Anti-Diagonal', color: '#ec4899' },
  }

  const info = directionMap[direction] || directionMap.horizontal

  return (
    <motion.div
      style={{
        padding: 12,
        backgroundColor: '#1e293b',
        borderRadius: 6,
        border: `2px solid ${info.color}`,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: info.color, marginBottom: 6 }}>Scanning Direction</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 700 }}>{info.label}</div>
        <div style={{ fontSize: 18, color: info.color, fontFamily: 'monospace', fontWeight: 'bold' }}>{value}</div>
      </div>
    </motion.div>
  )
}

function VisualizationPanel({
  step,
  applyExample,
  examples,
  matrixInput,
  setMatrixInput,
  inputError,
  handleReset,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Matrix (JSON)</div>
        <textarea
          value={matrixInput}
          onChange={(e) => {
            setMatrixInput(e.target.value)
            handleReset()
          }}
          style={{
            width: '100%',
            height: 100,
            padding: '8px',
            borderRadius: 4,
            border: inputError ? '2px solid #f87171' : '1px solid #475569',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            fontSize: 12,
            resize: 'vertical',
          }}
        />
        {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
      </div>

      {step?.currentCell && step?.matrix && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Matrix Visualization</div>
          <MatrixGrid
            matrix={step.matrix}
            currentCell={step.currentCell}
            h={step.h}
            v={step.v}
            d={step.d}
            ad={step.ad}
            direction={step.direction}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {step?.direction && step?.value !== undefined && (
          <DirectionIndicator key={`${step.direction}-${step.value}`} direction={step.direction} value={step.value} />
        )}
      </AnimatePresence>

      {step?.directionValues && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Horizontal</div>
            <div style={{ fontSize: 14, color: '#3b82f6', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {step.directionValues.horizontal}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Vertical</div>
            <div style={{ fontSize: 14, color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {step.directionValues.vertical}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Diagonal</div>
            <div style={{ fontSize: 14, color: '#8b5cf6', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {step.directionValues.diagonal}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Anti-Diag</div>
            <div style={{ fontSize: 14, color: '#ec4899', fontFamily: 'monospace', fontWeight: 'bold' }}>
              {step.directionValues.antiDiagonal}
            </div>
          </div>
        </motion.div>
      )}

      {step?.maxLen !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Running Maximum</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b' }}>
            {step.maxLen}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e' }}>
            {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function LongestLineVisualizer() {
  const examples = useMemo(() => getExamplesOr('longest-line', []), [])
  const [matrixInput, setMatrixInput] = useState('[[1,1,0],[0,1,1],[1,0,1]]')

  const { matrix, inputError } = useMemo(() => {
    try {
      const m = JSON.parse(matrixInput)
      if (!Array.isArray(m)) throw new Error('Input must be array')
      if (m.length > 0 && !Array.isArray(m[0])) throw new Error('Input must be 2D array')
      return { matrix: m, inputError: '' }
    } catch (e) {
      return { matrix: [], inputError: e.message }
    }
  }, [matrixInput])

  const steps = useMemo(() => generateSteps(matrix), [matrix])

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
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setMatrixInput(JSON.stringify(ex.matrix || ex))
      handleReset()
    },
    [handleReset]
  )

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
      {
        id: 'viz',
        title: '🔲 Longest Line',
        content: (
          <VisualizationPanel
            step={step}
            applyExample={applyExample}
            examples={examples}
            matrixInput={matrixInput}
            setMatrixInput={setMatrixInput}
            inputError={inputError}
            handleReset={handleReset}
          />
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, matrixInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"matrix","label":"matrix","type":"array"}]}
        values={{ matrix: matrixInput }}
        onChange={(k, v) => { if (k === 'matrix') setMatrixInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        
      />

      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
    </div>
  )
}
