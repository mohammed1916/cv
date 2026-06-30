import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'
function generateSteps(values, left, right) {
  const steps = []

  if (!values || values.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: -1,
      nodes: [],
      arrows: [],
      nodeStates: {},
      message: 'Empty list.',
    })
    return steps
  }

  const n = values.length
  if (left < 1 || right > n || left > right) {
    steps.push({
      phase: 'done',
      activeLine: -1,
      nodes: [...values],
      arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1, reversed: false })),
      nodeStates: {},
      message: 'Invalid left or right position.',
    })
    return steps
  }

  // Convert to 0-indexed
  const l = left - 1
  const r = right - 1

  steps.push({
    phase: 'init',
    activeLine: 1,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1, reversed: false })),
    nodeStates: { leftPos: l, rightPos: r, pointer1: -1, pointer2: -1, pointer3: -1 },
    message: `Initialize to reverse between position ${left} and ${right} (0-indexed: ${l} to ${r}).`,
  })

  // Simulate the reversal
  const arrows = Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1, reversed: false }))

  // Reverse the portion from index l to r
  let leftIdx = l
  let rightIdx = r

  steps.push({
    phase: 'find_segment',
    activeLine: 2,
    nodes: [...values],
    arrows: arrows.map(a => ({ ...a })),
    nodeStates: { leftPos: leftIdx, rightPos: rightIdx, pointer1: leftIdx, pointer2: rightIdx, pointer3: -1 },
    message: `Identify the segment to reverse: nodes ${leftIdx} to ${rightIdx}.`,
  })

  // Two-pointer reversal
  while (leftIdx < rightIdx) {
    steps.push({
      phase: 'compare',
      activeLine: 3,
      nodes: [...values],
      arrows: arrows.map(a => ({ ...a })),
      nodeStates: { leftPos: l, rightPos: r, pointer1: leftIdx, pointer2: rightIdx, pointer3: -1 },
      message: `Compare nodes at index ${leftIdx} and ${rightIdx}.`,
    })

    // Swap values
    const tmp = values[leftIdx]
    values[leftIdx] = values[rightIdx]
    values[rightIdx] = tmp

    steps.push({
      phase: 'swap',
      activeLine: 4,
      nodes: [...values],
      arrows: arrows.map(a => ({ ...a })),
      nodeStates: { leftPos: l, rightPos: r, pointer1: leftIdx, pointer2: rightIdx, pointer3: -1 },
      message: `Swap values: ${tmp} <-> ${values[leftIdx]}.`,
    })

    leftIdx++
    rightIdx--

    steps.push({
      phase: 'move_pointers',
      activeLine: 5,
      nodes: [...values],
      arrows: arrows.map(a => ({ ...a })),
      nodeStates: { leftPos: l, rightPos: r, pointer1: leftIdx, pointer2: rightIdx, pointer3: -1 },
      message: `Move pointers: left -> ${leftIdx}, right -> ${rightIdx}.`,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 6,
    nodes: [...values],
    arrows: arrows.map(a => ({ ...a })),
    nodeStates: { leftPos: l, rightPos: r, pointer1: -1, pointer2: -1, pointer3: -1 },
    message: `Reversal complete. List: [${values.join(', ')}]`,
  })

  return steps
}

function LinkedListVisualization({ nodes, step, nodeStates }) {
  const { leftPos = -1, rightPos = -1, pointer1 = -1, pointer2 = -1 } = nodeStates || {}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
      {/* Linked list visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', paddingBottom: 16 }}>
        <AnimatePresence>
          {nodes.map((value, idx) => {
            const isLeft = idx === pointer1
            const isRight = idx === pointer2
            const inSegment = idx >= leftPos && idx <= rightPos
            const isReverted = step?.phase !== 'init'

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    color: 'white',
                    backgroundColor: isLeft || isRight ? '#ef4444' : inSegment ? '#f59e0b' : '#6b7280',
                    border: isLeft || isRight ? '3px solid #991b1b' : inSegment ? '2px solid #b45309' : '2px solid #4b5563',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {value}
                </motion.div>

                {idx < nodes.length - 1 && (
                  <svg width="40" height="30" style={{ flexShrink: 0 }}>
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                      </marker>
                    </defs>
                    <line x1="0" y1="15" x2="35" y2="15" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  </svg>
                )}

                {/* Position labels */}
                {idx === pointer1 && (
                  <div style={{ position: 'absolute', marginTop: 80, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
                    left
                  </div>
                )}
                {idx === pointer2 && (
                  <div style={{ position: 'absolute', marginTop: 80, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
                    right
                  </div>
                )}
              </div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Segment indicator */}
      {leftPos >= 0 && rightPos >= 0 && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 8, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Reversing Segment</div>
          <div style={{ fontSize: 13, color: '#78350f' }}>
            Indices {leftPos} to {rightPos} ({rightPos - leftPos + 1} nodes)
          </div>
        </div>
      )}

      {/* Step information */}
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 8, border: '1px solid #0284c7' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Current Step</div>
          <div style={{ fontSize: 13, color: '#164e63' }}>{step.message}</div>
        </div>
      )}
    </div>
  )
}

function InputPanel({ valInput, setValInput, leftInput, setLeftInput, rightInput, setRightInput, inputError, handleReset, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {examples.map((ex, idx) => (
            <button
              key={ex.label}
              onClick={() => applyExample(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#e2e8f0' }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#f1f5f9' }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 6 }}>
          List Values
        </label>
        <input
          type="text"
          value={valInput}
          onChange={(e) => { setValInput(e.target.value); handleReset() }}
          placeholder="[1,2,3,4,5]"
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #cbd5e1',
            fontSize: 13,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 6 }}>
            Left Position
          </label>
          <input
            type="number"
            value={leftInput}
            onChange={(e) => { setLeftInput(e.target.value); handleReset() }}
            placeholder="1"
            min="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', display: 'block', marginBottom: 6 }}>
            Right Position
          </label>
          <input
            type="number"
            value={rightInput}
            onChange={(e) => { setRightInput(e.target.value); handleReset() }}
            placeholder="5"
            min="1"
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {inputError && (
        <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 4, border: '1px solid #fca5a5', color: '#991b1b', fontSize: 12 }}>
          {inputError}
        </div>
      )}
    </div>
  )
}

const EXAMPLES = getExamples('reverse-linked-list-ii') || [
  { label: 'Basic', values: [1, 2, 3, 4, 5], left: 2, right: 4 },
  { label: 'Full', values: [1, 2, 3, 4, 5], left: 1, right: 5 },
  { label: 'Single', values: [5], left: 1, right: 1 },
  { label: 'Pair', values: [1, 2], left: 1, right: 2 },
]

export default function ReverseLinkedListIIVisualizer() {
  const [valInput, setValInput] = useState('[1,2,3,4,5]')
  const [leftInput, setLeftInput] = useState('2')
  const [rightInput, setRightInput] = useState('4')


  const { values, left, right, inputError } = useMemo(() => {
    try {
      const vals = JSON.parse(valInput)
      if (!Array.isArray(vals)) throw new Error('Values must be an array')
      if (vals.length === 0) throw new Error('List cannot be empty')

      const l = parseInt(leftInput, 10)
      const r = parseInt(rightInput, 10)

      if (isNaN(l) || isNaN(r)) throw new Error('Left and right must be numbers')
      if (l < 1 || r < 1) throw new Error('Positions must be >= 1')
      if (l > vals.length || r > vals.length) throw new Error('Positions exceed list length')
      if (l > r) throw new Error('Left must be <= right')

      return { values: vals, left: l, right: r, inputError: '' }
    } catch (e) {
      return { values: [1, 2, 3, 4, 5], left: 2, right: 4, inputError: e.message || 'Invalid input' }
    }
  }, [valInput, leftInput, rightInput])

  const steps = useMemo(
    () => generateSteps([...values], left, right),
    [values, left, right]
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : steps[0]

  const applyExample = useCallback((idx) => {
    const ex = EXAMPLES[idx]
    setValInput(JSON.stringify(ex.values))
    setLeftInput(String(ex.left))
    setRightInput(String(ex.right))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

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
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Linked List',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <LinkedListVisualization
            nodes={step?.nodes || values}
            step={step}
            nodeStates={step?.nodeStates}
          />
        </div>
      ),
    },
    {
      id: 'input',
      title: 'Input',
      content: (
        <InputPanel
          valInput={valInput}
          setValInput={setValInput}
          leftInput={leftInput}
          setLeftInput={setLeftInput}
          rightInput={rightInput}
          setRightInput={setRightInput}
          inputError={inputError}
          handleReset={handleReset}
          applyExample={applyExample}
          examples={EXAMPLES}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, autoScrollCode, valInput, leftInput, rightInput, inputError, handleReset, applyExample, values])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz'], ['input']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
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
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

