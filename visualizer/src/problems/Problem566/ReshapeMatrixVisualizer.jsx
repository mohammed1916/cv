import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ReshapeMatrixVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def matrixReshape(mat, r, c):' },
  { line: 2, text: '    m, n = len(mat), len(mat[0])' },
  { line: 3, text: '    if m * n != r * c:' },
  { line: 4, text: '        return mat' },
  { line: 5, text: '' },
  { line: 6, text: '    flat = []' },
  { line: 7, text: '    for row in mat:' },
  { line: 8, text: '        flat.extend(row)' },
  { line: 9, text: '' },
  { line: 10, text: '    result = []' },
  { line: 11, text: '    for i in range(r):' },
  { line: 12, text: '        result.append(flat[i*c:(i+1)*c])' },
  { line: 13, text: '' },
  { line: 14, text: '    return result' },
]

const EXAMPLES = getExamples('reshape-matrix')

function generateSteps(mat, r, c) {
  const steps = []
  const m = mat.length
  const n = mat[0]?.length || 0

  steps.push({
    activeLine: 2,
    m,
    n,
    r,
    c,
    flat: [],
    result: [],
    message: `Matrix dimensions: ${m}×${n}. Target: ${r}×${c}`,
    relatedLines: [2],
  })

  if (m * n !== r * c) {
    steps.push({
      activeLine: 4,
      m,
      n,
      r,
      c,
      flat: [],
      result: [],
      message: `Cannot reshape: ${m}×${n} = ${m * n} ≠ ${r * c} = ${r}×${c}`,
      relatedLines: [3, 4],
    })
    return steps
  }

  let flat = []
  for (let row of mat) {
    for (let val of row) {
      steps.push({
        activeLine: 8,
        m,
        n,
        r,
        c,
        flat: [...flat],
        result: [],
        currentVal: val,
        message: `Flatten element: ${val}. Flat array: [${[...flat, val].join(', ')}]`,
        relatedLines: [7, 8],
      })
      flat.push(val)
    }
  }

  let result = []
  for (let i = 0; i < r; i++) {
    const start = i * c
    const end = (i + 1) * c
    const row = flat.slice(start, end)

    steps.push({
      activeLine: 12,
      m,
      n,
      r,
      c,
      flat: [...flat],
      result: [...result],
      currentRow: row,
      currentRowIndex: i,
      message: `Build row ${i}: flat[${start}:${end}] = [${row.join(', ')}]`,
      relatedLines: [11, 12],
    })

    result.push(row)
  }

  steps.push({
    activeLine: 14,
    m,
    n,
    r,
    c,
    flat: [...flat],
    result: [...result],
    message: `Reshape complete: ${m}×${n} → ${r}×${c}`,
    relatedLines: [14],
  })

  return steps
}

function MatrixDisplay({ matrix, currentRowIndex, title }) {
  return (
    <div className="rm-matrix-container">
      <div className="rm-matrix-label">{title}</div>
      <div className="rm-matrix">
        {matrix.map((row, rowIdx) => (
          <div key={rowIdx} className={`rm-row ${rowIdx === currentRowIndex ? 'active' : ''}`}>
            {row.map((val, colIdx) => (
              <motion.div
                key={`${rowIdx}-${colIdx}`}
                className={`rm-cell ${rowIdx === currentRowIndex ? 'highlight' : ''}`}
                animate={{
                  scale: rowIdx === currentRowIndex ? 1.08 : 1,
                }}
              >
                {val}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatePanel({ mat, r, c, step }) {
  const result = step?.result || []
  const currentRowIndex = step?.currentRowIndex ?? -1

  return (
    <div className="rm-main-column">
      <div className="rm-card">
        <div className="rm-card-head">
          <div>
            <div className="rm-section-label">Matrix Reshape</div>
            <div className="rm-subtitle">Flatten then rebuild with new dimensions.</div>
          </div>
        </div>

        <div className="rm-matrices-row">
          <MatrixDisplay matrix={mat} currentRowIndex={-1} title={`Original (${mat.length}×${mat[0]?.length || 0})`} />
          {result.length > 0 && <MatrixDisplay matrix={result} currentRowIndex={currentRowIndex} title={`Result (${r}×${c})`} />}
        </div>

        {step?.flat && (
          <div className="rm-flat-section">
            <div className="rm-flat-label">Flattened Array</div>
            <div className="rm-flat-display">
              <span className="rm-flat-item">[</span>
              {step.flat.map((val, idx) => (
                <span key={idx} className={`rm-flat-item ${step.currentVal === val ? 'current' : ''}`}>
                  {val}
                  {idx < step.flat.length - 1 ? ',' : ''}
                </span>
              ))}
              <span className="rm-flat-item">]</span>
            </div>
          </div>
        )}

        <div className="rm-info-grid">
          <div className="rm-info-item">
            <span className="rm-info-key">Original Dims</span>
            <span className="mono rm-info-value">
              {step?.m}×{step?.n}
            </span>
          </div>
          <div className="rm-info-item">
            <span className="rm-info-key">Target Dims</span>
            <span className="mono rm-info-value">
              {step?.r}×{step?.c}
            </span>
          </div>
          <div className="rm-info-item">
            <span className="rm-info-key">Total Elements</span>
            <span className="mono rm-info-value">{step?.m * step?.n || 0}</span>
          </div>
          <div className="rm-info-item wide">
            <span className="rm-info-key">Status</span>
            <span className="rm-info-value">{step?.message ?? 'Start reshape process.'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReshapeMatrixVisualizer() {
  const [matInput, setMatInput] = useState('[[1,2],[3,4]]')
  const [rInput, setRInput] = useState('1')
  const [cInput, setCInput] = useState('4')
  const [source, setSource] = useState([
    [1, 2],
    [3, 4],
  ])
  const [targetR, setTargetR] = useState(1)
  const [targetC, setTargetC] = useState(4)
  const [steps, setSteps] = useState(() => generateSteps([[1, 2], [3, 4]], 1, 4))
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  const { stepIndex, setStepIndex, isPlaying, setIsPlaying, speed, setSpeed, stepForward, stepBack, togglePlay, handleReset, isDone } = usePlaybackState(steps.length, 480)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const currentStep = stepIndex >= 0 ? steps[stepIndex] : null

  const handleVisualize = useCallback(() => {
    setAttemptedSubmit(true)
    try {
      const mat = JSON.parse(matInput)
      const r = parseInt(rInput)
      const c = parseInt(cInput)
      if (!Array.isArray(mat) || r <= 0 || c <= 0) return
      setSource(mat)
      setTargetR(r)
      setTargetC(c)
      setSteps(generateSteps(mat, r, c))
      setStepIndex(-1)
      setIsPlaying(false)
    } catch {
      // Invalid input
    }
  }, [matInput, rInput, cInput, setIsPlaying, setStepIndex])

  const applyExample = useCallback((example) => {
    setMatInput(JSON.stringify(example.mat))
    setRInput(String(example.r))
    setCInput(String(example.c))
    setSource(example.mat)
    setTargetR(example.r)
    setTargetC(example.c)
    setSteps(generateSteps(example.mat, example.r, example.c))
    setStepIndex(-1)
    setIsPlaying(false)
    setAttemptedSubmit(false)
  }, [setIsPlaying, setStepIndex])

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: <StatePanel mat={source} r={targetR} c={targetC} step={currentStep} />,
      },
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={currentStep} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />,
      },
    ],
    [source, targetR, targetC, currentStep]
  )

  return (
    <div className="rm-root">
      <div className="rm-card rm-input-card">
        <div className="rm-input-row">
          <div className="rm-field-group">
            <label className="rm-input-label">Matrix</label>
            <input
              className="rm-input mono"
              value={matInput}
              onChange={(e) => {
                setMatInput(e.target.value)
                if (attemptedSubmit) setAttemptedSubmit(false)
              }}
              placeholder="[[1,2],[3,4]]"
            />
          </div>
          <div className="rm-field-group">
            <label className="rm-input-label">Rows</label>
            <input
              className="rm-input mono"
              value={rInput}
              onChange={(e) => {
                setRInput(e.target.value)
                if (attemptedSubmit) setAttemptedSubmit(false)
              }}
              inputMode="numeric"
              placeholder="1"
            />
          </div>
          <div className="rm-field-group">
            <label className="rm-input-label">Cols</label>
            <input
              className="rm-input mono"
              value={cInput}
              onChange={(e) => {
                setCInput(e.target.value)
                if (attemptedSubmit) setAttemptedSubmit(false)
              }}
              inputMode="numeric"
              placeholder="4"
            />
          </div>
          <button className="rm-btn rm-btn-primary" onClick={handleVisualize}>
            Visualize
          </button>
        </div>

        <div className="rm-example-grid">
          {EXAMPLES.map((example, idx) => (
            <button key={idx} className="rm-example-card" onClick={() => applyExample(example)}>
              <span className="rm-example-label">{example.label}</span>
              <span className="rm-example-chip mono">
                {example.r}×{example.c}
              </span>
            </button>
          ))}
        </div>
      </div>

      <DockableWorkspace panels={dockPanels}>
        <FloatingPanel>
          <PlaybackControls isPlaying={isPlaying} onPlayToggle={togglePlay} onStepForward={stepForward} onStepBack={stepBack} onReset={handleReset} speed={speed} onSpeedChange={setSpeed} currentStep={stepIndex + 1} totalSteps={steps.length} />
        </FloatingPanel>
      </DockableWorkspace>

      {showPatternOverlay && <PatternOverlay activeLineDom={activeLineDom} />}
    </div>
  )
}
