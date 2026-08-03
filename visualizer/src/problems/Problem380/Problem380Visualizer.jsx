import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem380.css'

const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class RandomizedSet:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.array = []' },
  { line: 4, text: '        self.map = {}  # val -> index' },
  { line: 5, text: '    def insert(self, val):' },
  { line: 6, text: '        if val in self.map: return False' },
  { line: 7, text: '        self.map[val] = len(self.array)' },
  { line: 8, text: '        self.array.append(val); return True' },
  { line: 9, text: '    def delete(self, val):' },
  { line: 10, text: '        if val not in self.map: return False' },
  { line: 11, text: '        lastVal = self.array[-1]' },
  { line: 12, text: '        self.map[lastVal] = self.map[val]' },
  { line: 13, text: '        self.array[self.map[val]] = lastVal; return True' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(operations) {
  const steps = []
  const array = []
  const map = {}
  const allOps = []

  // Initialize
  steps.push({
    activeLine: 2,
    array: [...array],
    map: { ...map },
    currentOp: null,
    lastRandom: null,
    message: `Initialize RandomizedSet: empty array and hash map.`,
  })

  // Process operations
  for (let op of operations) {
    if (op.type === 'insert') {
      const val = op.val
      if (val in map) {
        steps.push({
          activeLine: 6,
          array: [...array],
          map: { ...map },
          currentOp: { type: 'insert', val, result: false },
          lastRandom: null,
          message: `Insert ${val}: already exists, return False.`,
        })
      } else {
        map[val] = array.length
        array.push(val)
        steps.push({
          activeLine: 8,
          array: [...array],
          map: { ...map },
          currentOp: { type: 'insert', val, result: true },
          lastRandom: null,
          highlighted: val,
          message: `Insert ${val}: add to array at index ${array.length - 1}, return True.`,
        })
      }
    } else if (op.type === 'delete') {
      const val = op.val
      if (!(val in map)) {
        steps.push({
          activeLine: 10,
          array: [...array],
          map: { ...map },
          currentOp: { type: 'delete', val, result: false },
          lastRandom: null,
          message: `Delete ${val}: not found, return False.`,
        })
      } else {
        const idx = map[val]
        const lastVal = array[array.length - 1]
        map[lastVal] = idx
        array[idx] = lastVal
        delete map[val]

        steps.push({
          activeLine: 13,
          array: [...array],
          map: { ...map },
          currentOp: { type: 'delete', val, result: true },
          lastRandom: null,
          highlighted: val,
          message: `Delete ${val}: swap with last element (${lastVal}), remove, return True.`,
        })
      }
    } else if (op.type === 'getRandom') {
      const randIdx = Math.floor(Math.random() * array.length)
      const randVal = array[randIdx]

      steps.push({
        activeLine: 14,
        array: [...array],
        map: { ...map },
        currentOp: { type: 'getRandom' },
        lastRandom: randVal,
        highlighted: randVal,
        message: `GetRandom: randomly select from ${array.length} elements, returned ${randVal}.`,
      })
    }
  }

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    operations: [
      { type: 'insert', val: 1 },
      { type: 'insert', val: 2 },
      { type: 'delete', val: 1 },
      { type: 'getRandom' },
      { type: 'insert', val: 1 },
    ],
  },
  {
    label: 'Example 2',
    operations: [
      { type: 'insert', val: 5 },
      { type: 'insert', val: 10 },
      { type: 'insert', val: 3 },
      { type: 'getRandom' },
      { type: 'delete', val: 10 },
      { type: 'getRandom' },
    ],
  },
  {
    label: 'Example 3',
    operations: [
      { type: 'insert', val: 100 },
      { type: 'delete', val: 100 },
      { type: 'insert', val: 100 },
    ],
  },
]

export default function Problem380Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(ex.operations).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
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
        <div style={{ position: "relative" }}>
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
      title: '🎲 RandomizedSet',
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
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Array (Values):</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32 }}>
                  {step.array.length === 0 ? (
                    <span style={{ color: '#64748b' }}>Empty</span>
                  ) : (
                    step.array.map((val, idx) => (
                      <motion.div
                        key={idx}
                        animate={{
                          scale: val === step.highlighted ? 1.2 : 1,
                          backgroundColor:
                            val === step.highlighted ? '#0ea5e9' : '#dbeafe',
                        }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: '2px solid #0ea5e9',
                          backgroundColor: val === step.highlighted ? '#0ea5e9' : '#dbeafe',
                          color: val === step.highlighted ? '#fff' : '#1e40af',
                          fontSize: 12,
                          fontWeight: 600,
                          minWidth: 40,
                          textAlign: 'center',
                          position: 'relative',
                        }}
                      >
                        {val}
                        <div style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>idx {idx}</div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Hash Map (Value → Index):</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 6 }}>
                  {Object.entries(step.map).map(([val, idx]) => (
                    <motion.div
                      key={val}
                      animate={{
                        scale: parseInt(val) === step.highlighted ? 1.15 : 1,
                      }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: '1px solid #d97706',
                        backgroundColor: parseInt(val) === step.highlighted ? '#fbbf24' : '#fcd34d',
                        color: '#78350f',
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      <div>{val}</div>
                      <div style={{ fontSize: 10, opacity: 0.8 }}>→ {idx}</div>
                    </motion.div>
                  ))}
                  {Object.keys(step.map).length === 0 && <span style={{ color: '#64748b' }}>Empty</span>}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#15803d' }}>Stats:</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div>
                    <span style={{ color: '#15803d' }}>Size: </span>
                    <span style={{ fontWeight: 600 }}>{step.array.length}</span>
                  </div>
                  {step.lastRandom !== null && (
                    <div>
                      <span style={{ color: '#15803d' }}>Random: </span>
                      <span style={{ fontWeight: 600 }}>{step.lastRandom}</span>
                    </div>
                  )}
                </div>
              </div>

              {step.currentOp && (
                <div
                  style={{
                    padding: 8,
                    backgroundColor:
                      step.currentOp.result === false ? '#fee2e2' :
                      step.currentOp.type === 'getRandom' ? '#dbeafe' :
                      step.currentOp.result ? '#dcfce7' : '#fee2e2',
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      color:
                        step.currentOp.result === false ? '#991b1b' :
                        step.currentOp.type === 'getRandom' ? '#1e40af' :
                        step.currentOp.result ? '#15803d' : '#991b1b',
                    }}
                  >
                    {step.currentOp.result === false ? '✗ Failed' :
                     step.currentOp.result === true ? '✓ Success' :
                     '↻ getRandom'}
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
        )}
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
    </div>
  )
}
