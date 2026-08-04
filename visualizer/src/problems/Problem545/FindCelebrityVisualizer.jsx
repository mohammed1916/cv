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
    message: `Start with pointers: left=0, right=${n - 1}`,
    left: 0,
    right: n - 1,
    n,
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
    })

    const knowsRightOfLeft = knowsMatrix[left] && knowsMatrix[left][right]

    if (knowsRightOfLeft) {
      steps.push({
        phase: 'elimination',
        activeLine: 7,
        relatedLines: [7],
        message: `${left} knows ${right}, so ${left} is not celebrity. Move left pointer.`,
        left,
        right,
        n,
      })
      left++
    } else {
      steps.push({
        phase: 'elimination',
        activeLine: 9,
        relatedLines: [9],
        message: `${left} doesn't know ${right}, so ${right} is not celebrity. Move right pointer.`,
        left,
        right,
        n,
      })
      right--
    }

    steps.push({
      phase: 'elimination',
      activeLine: 5,
      relatedLines: [5],
      message: `Continue elimination: left=${left}, right=${right}`,
      left,
      right,
      n,
    })
  }

  const candidate = left

  steps.push({
    phase: 'verify',
    activeLine: 11,
    relatedLines: [11],
    message: `Candidate found: ${candidate}. Verify with all people.`,
    candidate,
    n,
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
      message: `Person ${i}: celebrity->${i}=${candidateKnowsI}, ${i}->celebrity=${iKnowsCandidate}`,
      candidate,
      checkPerson: i,
      candidateKnows: candidateKnowsI,
      personKnows: iKnowsCandidate,
      n,
    })

    if (candidateKnowsI || !iKnowsCandidate) {
      isCelebrity = false
      steps.push({
        phase: 'done',
        activeLine: 14,
        relatedLines: [14],
        message: `Not a celebrity! Return -1.`,
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
    message: `${candidate} is the celebrity!`,
    result: candidate,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples, n }) {
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

      {step?.left !== undefined && step?.right !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Left Pointer</div>
            <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
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
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Candidate</div>
          <div style={{ fontSize: 16, color: '#a78bfa', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.candidate}
          </div>
        </div>
      )}

      {step?.checkA !== undefined && step?.checkB !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Checking</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>
            Person {step.checkA} ↔ Person {step.checkB}
          </div>
        </div>
      )}

      {step?.checkPerson !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Verification</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#e2e8f0' }}>
            <div>
              Candidate → {step.checkPerson}:{' '}
              <span style={{ color: step.candidateKnows ? '#f87171' : '#22c55e', fontWeight: 600 }}>
                {step.candidateKnows ? '✗ knows' : '✓ not knows'}
              </span>
            </div>
            <div>
              {step.checkPerson} → Candidate:{' '}
              <span style={{ color: step.personKnows ? '#22c55e' : '#f87171', fontWeight: 600 }}>
                {step.personKnows ? '✓ knows' : '✗ not knows'}
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
  const examples = useMemo(() => getExamplesOr('find-the-celebrity', []), [])
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
        title: '👥 Find Celebrity',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>N (people count)</div>
                <input
                  type="number"
                  value={n}
                  onChange={(e) => {
                    setN(Number(e.target.value))
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
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} n={n} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, n, matrixInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
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
