import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem379.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class PhoneDirectory:' },
  { line: 2, text: '    def __init__(self, maxNumbers):' },
  { line: 3, text: '        self.available = set(range(maxNumbers))' },
  { line: 4, text: '        self.released = []' },
  { line: 5, text: '    def get(self):' },
  { line: 6, text: '        if self.released: return self.released.pop()' },
  { line: 7, text: '        if self.available: return self.available.pop()' },
  { line: 8, text: '    def check(self, number): return number in self.available' },
  { line: 9, text: '    def release(self, number):' },
  { line: 10, text: '        if number not in available: self.released.append(number)' },
]

function generateSteps(maxNumbers, operations) {
  const steps = []
  const available = new Set(Array.from({ length: maxNumbers }, (_, i) => i))
  const released = []
  const allocated = new Set()

  // Initialize
  steps.push({
    activeLine: 3,
    available: new Set(available),
    released: [...released],
    allocated: new Set(allocated),
    lastOp: null,
    message: `Initialize: ${maxNumbers} phone numbers (0-${maxNumbers - 1}) all available.`,
  })

  // Process operations
  for (let op of operations) {
    if (op.type === 'get') {
      let number
      if (released.length > 0) {
        number = released.pop()
      } else if (available.size > 0) {
        number = available.values().next().value
        available.delete(number)
      }

      if (number !== undefined) {
        allocated.add(number)
        steps.push({
          activeLine: 6,
          available: new Set(available),
          released: [...released],
          allocated: new Set(allocated),
          lastOp: { type: 'get', number },
          message: `Allocate number ${number}. Available: ${available.size}, Released: ${released.length}, Allocated: ${allocated.size}.`,
        })
      }
    } else if (op.type === 'check') {
      const number = op.number
      const isAvail = available.has(number)
      steps.push({
        activeLine: 8,
        available: new Set(available),
        released: [...released],
        allocated: new Set(allocated),
        lastOp: { type: 'check', number, result: isAvail },
        message: `Check ${number}: ${isAvail ? 'available' : 'unavailable'}.`,
      })
    } else if (op.type === 'release') {
      const number = op.number
      if (allocated.has(number)) {
        allocated.delete(number)
        released.push(number)
        steps.push({
          activeLine: 10,
          available: new Set(available),
          released: [...released],
          allocated: new Set(allocated),
          lastOp: { type: 'release', number },
          message: `Release number ${number}. Available: ${available.size}, Released: ${released.length}, Allocated: ${allocated.size}.`,
        })
      }
    }
  }

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    maxNumbers: 5,
    operations: [
      { type: 'get' },
      { type: 'get' },
      { type: 'check', number: 0 },
      { type: 'get' },
      { type: 'release', number: 2 },
      { type: 'check', number: 2 },
    ],
  },
  {
    label: 'Example 2',
    maxNumbers: 3,
    operations: [
      { type: 'get' },
      { type: 'get' },
      { type: 'get' },
      { type: 'release', number: 0 },
      { type: 'get' },
      { type: 'check', number: 1 },
    ],
  },
  {
    label: 'Example 3',
    maxNumbers: 4,
    operations: [
      { type: 'get' },
      { type: 'release', number: 0 },
      { type: 'get' },
      { type: 'check', number: 0 },
    ],
  },
]

export default function Problem379Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const SOLUTION_CODE_HOOK = useSolutionCode('design-phone-directory')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.maxNumbers, ex.operations), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '☎️ Phone Directory',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Available Numbers:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Array.from(step.available).sort((a, b) => a - b).map((num) => (
                    <motion.div
                      key={num}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '2px solid #0ea5e9',
                        backgroundColor: '#0ea5e9',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {step.available.size === 0 && <span style={{ color: '#64748b' }}>None</span>}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#15803d' }}>Allocated Numbers:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Array.from(step.allocated).sort((a, b) => a - b).map((num) => (
                    <motion.div
                      key={num}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '2px solid #22c55e',
                        backgroundColor: '#86efac',
                        color: '#15803d',
                        fontSize: 11,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {step.allocated.size === 0 && <span style={{ color: '#64748b' }}>None</span>}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Released Queue:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.released.map((num, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ scale: 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '2px solid #f59e0b',
                        backgroundColor: '#fbbf24',
                        color: '#78350f',
                        fontSize: 11,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {step.released.length === 0 && <span style={{ color: '#64748b' }}>Empty</span>}
                </div>
              </div>

              {step.lastOp && step.lastOp.type === 'check' && (
                <div
                  style={{
                    padding: 8,
                    backgroundColor: step.lastOp.result ? '#dcfce7' : '#fee2e2',
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  <div style={{ fontWeight: 600, color: step.lastOp.result ? '#15803d' : '#991b1b' }}>
                    {step.lastOp.result ? '✓' : '✗'} Number {step.lastOp.number} is {step.lastOp.result ? 'available' : 'unavailable'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, ex])

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
