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
import './ReshapeMatrixVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def matrixReshape(self, mat: List[List[int]], r: int, c: int) -> List[List[int]]:' },
  { line: 3, text: '        m, n = len(mat), len(mat[0])' },
  { line: 4, text: '        if m * n != r * c:' },
  { line: 5, text: '            return mat  # Cannot reshape' },
  { line: 6, text: '        ' },
  { line: 7, text: '        # Flatten the matrix to 1D' },
  { line: 8, text: '        flat = []' },
  { line: 9, text: '        for row in mat:' },
  { line: 10, text: '            for val in row:' },
  { line: 11, text: '                flat.append(val)' },
  { line: 12, text: '        ' },
  { line: 13, text: '        # Reshape flattened array to r x c matrix' },
  { line: 14, text: '        result = []' },
  { line: 15, text: '        for i in range(r):' },
  { line: 16, text: '            row = []' },
  { line: 17, text: '            for j in range(c):' },
  { line: 18, text: '                row.append(flat[i * c + j])' },
  { line: 19, text: '            result.append(row)' },
  { line: 20, text: '        ' },
  { line: 21, text: '        return result' },
]

const PATTERNS = ['flattening', 'iteration', 'indexing', 'reshaping', 'done']
const LINE_PATTERN_MAP = {
  9: 'flattening',
  10: 'iteration',
  18: 'indexing',
  15: 'reshaping',
  21: 'done',
}

function generateSteps(matrixStr, r, c) {
  const steps = []

  let matrix
  try {
    matrix = JSON.parse(matrixStr)
    if (!Array.isArray(matrix) || !matrix.every((row) => Array.isArray(row))) {
      throw new Error('Invalid matrix format')
    }
  } catch (e) {
    steps.push({
      phase: 'done',
      activeLine: 21,
      relatedLines: [21],
      message: 'Invalid input matrix',
      result: null,
      done: true,
    })
    return steps
  }

  const m = matrix.length
  const n = matrix[0]?.length || 0

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3],
    message: `Original: ${m}x${n}, Target: ${r}x${c}`,
    m,
    n,
    r,
    c,
    original: matrix,
  })

  // Check if reshape is possible
  if (m * n !== r * c) {
    steps.push({
      phase: 'validation',
      activeLine: 4,
      relatedLines: [4, 5],
      message: `Cannot reshape: ${m}*${n}=${m * n} ≠ ${r}*${c}=${r * c}`,
      cannotReshape: true,
      result: matrix,
      done: true,
    })
    return steps
  }

  // Flattening phase
  steps.push({
    phase: 'flattening',
    activeLine: 8,
    relatedLines: [8],
    message: 'Initialize empty flattened array',
    m,
    n,
    r,
    c,
    flat: [],
    original: matrix,
  })

  let flat = []
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const val = matrix[i][j]

      steps.push({
        phase: 'flattening',
        activeLine: 10,
        relatedLines: [9, 10, 11],
        message: `Extract [${i}][${j}] = ${val} from original matrix`,
        m,
        n,
        r,
        c,
        flat: [...flat],
        extractRow: i,
        extractCol: j,
        extractVal: val,
        original: matrix,
      })

      flat.push(val)

      steps.push({
        phase: 'flattening',
        activeLine: 11,
        relatedLines: [11],
        message: `Append ${val} to flattened array`,
        m,
        n,
        r,
        c,
        flat: [...flat],
        extractVal: val,
        original: matrix,
      })
    }
  }

  // Reshaping phase
  steps.push({
    phase: 'reshaping',
    activeLine: 14,
    relatedLines: [14],
    message: `Initialize result matrix (${r}x${c})`,
    m,
    n,
    r,
    c,
    flat,
    result: [],
    original: matrix,
  })

  let result = []
  let flatIndex = 0

  for (let i = 0; i < r; i++) {
    let row = []

    for (let j = 0; j < c; j++) {
      steps.push({
        phase: 'reshaping',
        activeLine: 17,
        relatedLines: [17, 18],
        message: `Calculate index: ${i} * ${c} + ${j} = ${i * c + j}`,
        m,
        n,
        r,
        c,
        flat,
        result: [...result],
        currentRow: i,
        currentCol: j,
        flatIndexCalc: i * c + j,
        original: matrix,
      })

      const val = flat[i * c + j]

      steps.push({
        phase: 'reshaping',
        activeLine: 18,
        relatedLines: [18],
        message: `Get flat[${i * c + j}] = ${val}, place at [${i}][${j}]`,
        m,
        n,
        r,
        c,
        flat,
        result: [...result],
        currentRow: i,
        currentCol: j,
        placeVal: val,
        placeAtIndex: [i, j],
        original: matrix,
      })

      row.push(val)
    }

    result.push([...row])

    steps.push({
      phase: 'reshaping',
      activeLine: 19,
      relatedLines: [19],
      message: `Row ${i} complete: [${row.join(', ')}]`,
      m,
      n,
      r,
      c,
      flat,
      result: [...result],
      original: matrix,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 21,
    relatedLines: [21],
    message: `Reshape complete!`,
    m,
    n,
    r,
    c,
    flat,
    result,
    original: matrix,
    done: true,
  })

  return steps
}

function MatrixGrid({ matrix, title, highlight = null, extractHighlight = null }) {
  if (!matrix || !Array.isArray(matrix) || matrix.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{title}</div>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${matrix[0].length}, 1fr)`,
          gap: 4,
          padding: 8,
          backgroundColor: '#0f172a',
          borderRadius: 6,
          border: '1px solid #334155',
        }}
      >
        {matrix.map((row, i) =>
          row.map((val, j) => {
            const isHighlighted = highlight && highlight[0] === i && highlight[1] === j
            const isExtracted = extractHighlight && extractHighlight[0] === i && extractHighlight[1] === j

            return (
              <motion.div
                key={`${i}-${j}`}
                style={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  backgroundColor: isHighlighted ? '#38bdf8' : isExtracted ? '#fbbf24' : '#1e293b',
                  color: isHighlighted ? '#0f172a' : isExtracted ? '#0f172a' : '#e2e8f0',
                  border: isHighlighted || isExtracted ? '2px solid #38bdf8' : '1px solid #475569',
                }}
                animate={{
                  scale: isHighlighted || isExtracted ? 1.1 : 1,
                  boxShadow: isHighlighted || isExtracted ? '0 0 12px rgba(56, 189, 248, 0.6)' : 'none',
                }}
                transition={{ duration: 0.2 }}
              >
                {val}
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

function FlattenedArray({ flat, highlightIndex = null }) {
  if (!Array.isArray(flat) || flat.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>Flattened Array</div>
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 8,
          backgroundColor: '#0f172a',
          borderRadius: 6,
          border: '1px solid #334155',
          flexWrap: 'wrap',
        }}
      >
        {flat.map((val, idx) => {
          const isHighlighted = idx === highlightIndex

          return (
            <motion.div
              key={idx}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'monospace',
                backgroundColor: isHighlighted ? '#38bdf8' : '#1e293b',
                color: isHighlighted ? '#0f172a' : '#e2e8f0',
                border: isHighlighted ? '2px solid #38bdf8' : '1px solid #475569',
              }}
              animate={{
                scale: isHighlighted ? 1.15 : 1,
                boxShadow: isHighlighted ? '0 0 12px rgba(56, 189, 248, 0.6)' : 'none',
              }}
              transition={{ duration: 0.2 }}
            >
              {val}
            </motion.div>
          )
        })}
      </div>
      <div style={{ fontSize: 10, color: '#64748b' }}>[0] to [{flat.length - 1}]</div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {/* Phase message */}
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#1e293b',
          borderRadius: 6,
          border: '1px solid #38bdf8',
          fontSize: 13,
          color: '#e2e8f0',
          fontFamily: 'monospace',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {step.message}
      </motion.div>

      {/* Original matrix */}
      {step.original && (
        <MatrixGrid
          matrix={step.original}
          title="Original Matrix"
          extractHighlight={step.extractHighlight || (step.extractRow !== undefined ? [step.extractRow, step.extractCol] : null)}
        />
      )}

      {/* Flattened array */}
      {(step.flat || (step.phase === 'flattening' && step.flat !== undefined)) && (
        <FlattenedArray flat={step.flat} highlightIndex={step.flatIndexCalc} />
      )}

      {/* Result matrix */}
      {step.result && step.result.length > 0 && (
        <MatrixGrid
          matrix={step.result}
          title={`Result Matrix (${step.r}x${step.c})`}
          highlight={step.placeAtIndex}
        />
      )}

      {/* Validation error */}
      {step.cannotReshape && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #f87171',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 8 }}>Cannot Reshape</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>Dimensions don't match. Returning original matrix.</div>
        </motion.div>
      )}

      {/* Completion */}
      {step.done && !step.cannotReshape && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#22c55e', marginBottom: 8 }}>Complete</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>
            Successfully reshaped {step.m}x{step.n} matrix to {step.r}x{step.c}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ReshapeMatrixVisualizer() {
  const examples = useMemo(() => getExamplesOr('reshape-matrix', []), [])
  const [matrixInput, setMatrixInput] = useState('[[1,2,3,4]]')
  const [r, setR] = useState(2)
  const [c, setC] = useState(2)

  const steps = useMemo(() => generateSteps(matrixInput, r, c), [matrixInput, r, c])

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
      setMatrixInput(JSON.stringify(ex.mat || ex.matrix || [[1, 2, 3, 4]]))
      setR(ex.r || 2)
      setC(ex.c || 2)
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
        title: '📊 Reshape Matrix',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
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
                    height: 60,
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Rows (r)</div>
                <input
                  type="number"
                  value={r}
                  onChange={(e) => {
                    setR(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                />
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Cols (c)</div>
                <input
                  type="number"
                  value={c}
                  onChange={(e) => {
                    setC(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {examples?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
              </div>
            </div>
            <VisualizationPanel step={step} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, matrixInput, r, c, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"matrix","label":"matrix","type":"string"}]}
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
