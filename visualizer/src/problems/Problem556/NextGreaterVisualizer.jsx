import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './NextGreaterVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def nextGreaterElement(self, n: int) -> int:' },
  { line: 3, text: '        # Convert to list of digits' },
  { line: 4, text: '        digits = list(str(n))' },
  { line: 5, text: '        ' },
  { line: 6, text: '        # Find rightmost digit smaller than next digit' },
  { line: 7, text: '        i = len(digits) - 2' },
  { line: 8, text: '        while i >= 0 and digits[i] >= digits[i + 1]:' },
  { line: 9, text: '            i -= 1' },
  { line: 10, text: '        ' },
  { line: 11, text: '        # No ascending pair found' },
  { line: 12, text: '        if i < 0:' },
  { line: 13, text: '            return -1' },
  { line: 14, text: '        ' },
  { line: 15, text: '        # Find rightmost digit > digits[i]' },
  { line: 16, text: '        j = len(digits) - 1' },
  { line: 17, text: '        while j > i and digits[j] <= digits[i]:' },
  { line: 18, text: '            j -= 1' },
  { line: 19, text: '        ' },
  { line: 20, text: '        # Swap pivot and successor' },
  { line: 21, text: '        digits[i], digits[j] = digits[j], digits[i]' },
  { line: 22, text: '        ' },
  { line: 23, text: '        # Reverse right portion' },
  { line: 24, text: '        digits[i + 1:] = reversed(digits[i + 1:])' },
  { line: 25, text: '        ' },
  { line: 26, text: '        result = int("".join(digits))' },
  { line: 27, text: '        return result if result <= 2**31 - 1 else -1' },
]

const PATTERNS = ['convert', 'find_pivot', 'find_successor', 'swap', 'reverse', 'result']
const LINE_PATTERN_MAP = {
  4: 'convert',
  8: 'find_pivot',
  17: 'find_successor',
  21: 'swap',
  24: 'reverse',
  26: 'result',
}

function generateSteps(n) {
  const steps = []

  if (n <= 0 || !Number.isInteger(n)) {
    steps.push({
      phase: 'result',
      activeLine: 13,
      relatedLines: [13],
      message: 'Invalid input.',
      result: -1,
      done: true,
    })
    return steps
  }

  const digits = String(n).split('')

  steps.push({
    phase: 'convert',
    activeLine: 4,
    relatedLines: [4],
    message: `Convert ${n} to digits array`,
    digits: [...digits],
    digitIndices: digits.map((_, i) => i),
  })

  // Find rightmost digit smaller than the digit to its right (pivot)
  let i = digits.length - 2

  steps.push({
    phase: 'find_pivot',
    activeLine: 7,
    relatedLines: [7],
    message: `Start from right, find pivot where digit[i] < digit[i+1]`,
    digits: [...digits],
    position: i,
  })

  while (i >= 0 && digits[i] >= digits[i + 1]) {
    steps.push({
      phase: 'find_pivot',
      activeLine: 8,
      relatedLines: [8],
      message: `digits[${i}]=${digits[i]} >= digits[${i + 1}]=${digits[i + 1]}, continue left`,
      digits: [...digits],
      position: i,
      comparing: [i, i + 1],
    })
    i--
  }

  // If no ascending pair found
  if (i < 0) {
    steps.push({
      phase: 'result',
      activeLine: 13,
      relatedLines: [13],
      message: 'No ascending pair found. Largest permutation reached.',
      result: -1,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'find_pivot',
    activeLine: 8,
    relatedLines: [8],
    message: `Found pivot at index ${i}: digits[${i}]=${digits[i]} < digits[${i + 1}]=${digits[i + 1]}`,
    digits: [...digits],
    position: i,
    pivotFound: true,
  })

  // Find rightmost digit > digits[i]
  let j = digits.length - 1

  steps.push({
    phase: 'find_successor',
    activeLine: 16,
    relatedLines: [16],
    message: `Start from right end, find successor > ${digits[i]}`,
    digits: [...digits],
    pivotPos: i,
    successorPos: j,
  })

  while (j > i && digits[j] <= digits[i]) {
    steps.push({
      phase: 'find_successor',
      activeLine: 17,
      relatedLines: [17],
      message: `digits[${j}]=${digits[j]} <= digits[${i}]=${digits[i]}, continue left`,
      digits: [...digits],
      pivotPos: i,
      successorPos: j,
      comparing: [i, j],
    })
    j--
  }

  steps.push({
    phase: 'find_successor',
    activeLine: 17,
    relatedLines: [17],
    message: `Found successor at index ${j}: digits[${j}]=${digits[j]} > digits[${i}]=${digits[i]}`,
    digits: [...digits],
    pivotPos: i,
    successorPos: j,
    successorFound: true,
  })

  // Swap pivot and successor
  const temp = digits[i]
  digits[i] = digits[j]
  digits[j] = temp

  steps.push({
    phase: 'swap',
    activeLine: 21,
    relatedLines: [21],
    message: `Swap digits[${i}] and digits[${j}]`,
    digits: [...digits],
    swappedPositions: [i, j],
  })

  // Reverse right portion
  const rightPart = digits.slice(i + 1).reverse()
  digits.splice(i + 1, digits.length - i - 1, ...rightPart)

  steps.push({
    phase: 'reverse',
    activeLine: 24,
    relatedLines: [24],
    message: `Reverse digits after position ${i}`,
    digits: [...digits],
    reversedStart: i + 1,
  })

  const result = parseInt(digits.join(''))

  steps.push({
    phase: 'result',
    activeLine: 26,
    relatedLines: [26],
    message: `Next permutation: ${result}`,
    digits: [...digits],
    result: result <= 2147483647 ? result : -1,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
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

      {step?.digits && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 8 }}>Digit Array</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.digits.map((digit, idx) => {
              let borderColor = '#38bdf8'
              let backgroundColor = '#0f172a'

              if (step.swappedPositions?.includes(idx)) {
                borderColor = '#f59e0b'
                backgroundColor = '#78350f'
              } else if (step.pivotPos === idx) {
                borderColor = '#f87171'
                backgroundColor = '#7f1d1d'
              } else if (step.successorPos === idx) {
                borderColor = '#22c55e'
                backgroundColor = '#1b4332'
              } else if (step.reversedStart !== undefined && idx >= step.reversedStart) {
                borderColor = '#a78bfa'
                backgroundColor = '#4c1d95'
              } else if (step.comparing?.includes(idx)) {
                borderColor = '#fbbf24'
                backgroundColor = '#78350f'
              }

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: `2px solid ${borderColor}`,
                    backgroundColor,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fontWeight: 600,
                    color: borderColor,
                    minWidth: 32,
                    textAlign: 'center',
                  }}
                  animate={{
                    scale: step.comparing?.includes(idx) ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {digit}
                </motion.div>
              )
            })}
          </div>
          {step.position !== undefined && (
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>Position: {step.position}</div>
          )}
        </motion.div>
      )}

      {step?.position !== undefined && !step?.pivotFound && !step?.successorFound && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Searching Pivot</div>
          <div style={{ fontSize: 13, color: '#5577a4' }}>Position: {step.position}</div>
        </div>
      )}

      {step?.pivotFound && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f87171' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#ea0c0c', marginBottom: 6 }}>Pivot Found</div>
          <div style={{ fontSize: 13, color: '#5577a4' }}>
            Index {step.position}: {step.digits?.[step.position]}
          </div>
        </motion.div>
      )}

      {step?.successorFound && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#178740', marginBottom: 6 }}>Successor Found</div>
          <div style={{ fontSize: 13, color: '#5577a4' }}>
            Index {step.successorPos}: {step.digits?.[step.successorPos]}
          </div>
        </motion.div>
      )}

      {step?.swappedPositions && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Swap</div>
          <div style={{ fontSize: 12, color: '#5577a4' }}>
            Indices {step.swappedPositions.join(' ↔ ')} swapped
          </div>
        </motion.div>
      )}

      {step?.reversedStart !== undefined && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7e56f8', marginBottom: 6 }}>Reverse</div>
          <div style={{ fontSize: 12, color: '#5577a4' }}>
            Reversed from index {step.reversedStart}
          </div>
        </motion.div>
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
            {step.result >= 0 ? step.result : 'No next permutation (-1)'}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function NextGreaterVisualizer() {
  const examples = useMemo(() => getExamplesOr('next-greater-iii', []), [])
  const [n, setN] = useState(12)

  const steps = useMemo(() => generateSteps(n), [n])

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
      setN(ex.n || 12)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔄 Next Greater Element', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Number (n)</div>
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
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, n, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
