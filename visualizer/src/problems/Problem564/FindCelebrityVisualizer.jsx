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
import { getExamples } from '../../config/examplesRegistry'
import './FindCelebrityVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findCelebrity(self, n: int) -> int:' },
  { line: 3, text: '        left, right = 0, n - 1' },
  { line: 4, text: '        ' },
  { line: 5, text: '        while left < right:' },
  { line: 6, text: '            if knows(left, right):' },
  { line: 7, text: '                left += 1' },
  { line: 8, text: '            else:' },
  { line: 9, text: '                right -= 1' },
  { line: 10, text: '        ' },
  { line: 11, text: '        candidate = left' },
  { line: 12, text: '        for i in range(n):' },
  { line: 13, text: '            if i != candidate and (knows(candidate, i) or not knows(i, candidate)):' },
  { line: 14, text: '                return -1' },
  { line: 15, text: '        ' },
  { line: 16, text: '        return candidate' },
]

const PATTERNS = ['elimination', 'pointers', 'verify', 'check_knows', 'done']
const LINE_PATTERN_MAP = {
  5: 'elimination',
  6: 'pointers',
  12: 'verify',
  13: 'check_knows',
  16: 'done',
}

function generateSteps(n, knowsMatrix) {
  const steps = []

  if (!Array.isArray(knowsMatrix) || knowsMatrix.length === 0 || n <= 0) {
    steps.push({
      phase: 'done',
      activeLine: 16,
      relatedLines: [16],
      message: 'Invalid input.',
      result: -1,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'elimination',
    activeLine: 3,
    relatedLines: [3],
    message: `Initialize two pointers: left=0, right=${n - 1}`,
    left: 0,
    right: n - 1,
    n,
    matrixState: 'unknown',
  })

  let left = 0
  let right = n - 1

  while (left < right) {
    steps.push({
      phase: 'pointers',
      activeLine: 6,
      relatedLines: [6],
      message: `Check if person ${left} knows person ${right}`,
      left,
      right,
      n,
      checkA: left,
      checkB: right,
      matrixState: 'checking',
    })

    const knowsRightOfLeft = knowsMatrix[left] && knowsMatrix[left][right]

    if (knowsRightOfLeft) {
      steps.push({
        phase: 'elimination',
        activeLine: 7,
        relatedLines: [7],
        message: `Person ${left} knows ${right} → ${left} cannot be celebrity. Eliminate left.`,
        left,
        right,
        n,
        eliminated: left,
        matrixState: 'checked',
      })
      left++
    } else {
      steps.push({
        phase: 'elimination',
        activeLine: 9,
        relatedLines: [9],
        message: `Person ${left} doesn't know ${right} → ${right} cannot be celebrity. Eliminate right.`,
        left,
        right,
        n,
        eliminated: right,
        matrixState: 'checked',
      })
      right--
    }

    steps.push({
      phase: 'elimination',
      activeLine: 5,
      relatedLines: [5],
      message: `Elimination continues: left=${left}, right=${right}`,
      left,
      right,
      n,
      matrixState: 'checked',
    })
  }

  const candidate = left

  steps.push({
    phase: 'verify',
    activeLine: 11,
    relatedLines: [11],
    message: `Candidate identified: ${candidate}. Now verify against all people.`,
    candidate,
    n,
    matrixState: 'verification',
  })

  let isCelebrity = true
  for (let i = 0; i < n; i++) {
    if (i === candidate) continue

    const candidateKnowsI = knowsMatrix[candidate] && knowsMatrix[candidate][i]
    const iKnowsCandidate = knowsMatrix[i] && knowsMatrix[i][candidate]

    steps.push({
      phase: 'check_knows',
      activeLine: 13,
      relatedLines: [13],
      message: `Person ${i}: candidate→${i}=${candidateKnowsI ? 'Y' : 'N'}, ${i}→candidate=${iKnowsCandidate ? 'Y' : 'N'}`,
      candidate,
      checkPerson: i,
      candidateKnows: candidateKnowsI,
      personKnows: iKnowsCandidate,
      n,
      matrixState: 'verification',
    })

    if (candidateKnowsI || !iKnowsCandidate) {
      isCelebrity = false
      steps.push({
        phase: 'done',
        activeLine: 14,
        relatedLines: [14],
        message: `Verification failed! Person ${i} breaks rules. Return -1.`,
        result: -1,
        done: true,
      })
      return steps
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 16,
    relatedLines: [16],
    message: `Celebrity verified! Person ${candidate} knows nobody and everyone knows them.`,
    result: candidate,
    done: true,
  })

  return steps
}

function MatrixVisualization({ step, n, knowsMatrix }) {
  if (!step || n <= 0 || !Array.isArray(knowsMatrix)) {
    return null
  }

  const cellSize = Math.max(32, Math.min(40, 280 / (n + 1)))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Knows Matrix</div>
      <div style={{ display: 'flex', gap: 2, overflow: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: n }).map((_, i) => (
            <div
              key={`label-${i}`}
              style={{
                width: cellSize,
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                color: '#64748b',
              }}
            >
              {i}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Array.from({ length: n }).map((_, i) => (
            <div key={`row-${i}`} style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: n }).map((_, j) => {
                const value = knowsMatrix[i] && knowsMatrix[i][j]
                let bgColor = '#1e293b'
                let borderColor = '#475569'

                if (step.matrixState === 'checking') {
                  if ((i === step.checkA && j === step.checkB) || (i === step.checkB && j === step.checkA)) {
                    bgColor = '#1e40af'
                    borderColor = '#60a5fa'
                  }
                } else if (step.matrixState === 'checked') {
                  if ((i === step.checkA && j === step.checkB) || (i === step.checkB && j === step.checkA)) {
                    bgColor = value ? '#7f1d1d' : '#1e3a1f'
                    borderColor = value ? '#dc2626' : '#22c55e'
                  }
                } else if (step.matrixState === 'verification') {
                  if ((i === step.candidate && j !== step.candidate) || (j === step.candidate && i !== step.candidate)) {
                    if (i === step.candidate && j === step.checkPerson) {
                      bgColor = value ? '#7f1d1d' : '#1e3a1f'
                      borderColor = value ? '#dc2626' : '#22c55e'
                    } else if (j === step.candidate && i === step.checkPerson) {
                      bgColor = value ? '#1e3a1f' : '#7f1d1d'
                      borderColor = value ? '#22c55e' : '#dc2626'
                    }
                  }
                }

                return (
                  <div
                    key={`cell-${i}-${j}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 2,
                      fontSize: 10,
                      fontWeight: 600,
                      color: value ? '#fca5a5' : '#86efac',
                      cursor: 'default',
                    }}
                  >
                    {value ? '1' : '0'}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyExample, examples, n, knowsMatrix }) {
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

      <MatrixVisualization step={step} n={n} knowsMatrix={knowsMatrix} />

      {step?.left !== undefined && step?.right !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #60a5fa' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 6 }}>Left Pointer</div>
            <div style={{ fontSize: 16, color: '#60a5fa', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.left}
            </div>
          </div>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Right Pointer</div>
            <div style={{ fontSize: 16, color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.right}
            </div>
          </div>
        </div>
      )}

      {step?.candidate !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Candidate</div>
          <div style={{ fontSize: 16, color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.candidate}
          </div>
        </div>
      )}

      {step?.checkPerson !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Verification Check</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#e2e8f0' }}>
            <div>
              Candidate → {step.checkPerson}:{' '}
              <span style={{ color: step.candidateKnows ? '#f87171' : '#22c55e', fontWeight: 600 }}>
                {step.candidateKnows ? '✗ knows (fail)' : '✓ not knows (pass)'}
              </span>
            </div>
            <div>
              {step.checkPerson} → Candidate:{' '}
              <span style={{ color: step.personKnows ? '#22c55e' : '#f87171', fontWeight: 600 }}>
                {step.personKnows ? '✓ knows (pass)' : '✗ not knows (fail)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid',
            borderColor: step.result >= 0 ? '#22c55e' : '#f87171',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: step.result >= 0 ? '#22c55e' : '#f87171',
            }}
          >
            {step.result >= 0 ? `Celebrity: ${step.result}` : 'No Celebrity (-1)'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function FindCelebrityVisualizer() {
  const examples = useMemo(() => getExamples('find-the-celebrity-564') || [], [])
  const [n, setN] = useState(3)
  const [matrixInput, setMatrixInput] = useState('[[1,1,0],[0,1,0],[1,1,1]]')

  const { matrix, inputError } = useMemo(() => {
    try {
      const m = JSON.parse(matrixInput)
      if (!Array.isArray(m)) throw new Error('Input must be array')
      return { matrix: m, inputError: '' }
    } catch (e) {
      return { matrix: [], inputError: e.message }
    }
  }, [matrixInput])

  const steps = useMemo(() => generateSteps(n, matrix), [n, matrix])

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
      setN(ex.n || 3)
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
        title: '🌟 Find Celebrity',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>N (people)</div>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => {
                    setN(Number(e.target.value))
                    handleReset()
                  }}
                  min={1}
                  max={10}
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
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Knows Matrix (JSON)</div>
              <textarea
                value={matrixInput}
                onChange={(e) => {
                  setMatrixInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 80,
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
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} n={n} knowsMatrix={matrix} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, n, matrixInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom, matrix]
  )

  return (
    <div className="problem-shell">
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
