import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def rotateRight(self, head: ListNode, k: int) -> ListNode:' },
  { line: 3, text: '        if not head or not head.next:' },
  { line: 4, text: '            return head' },
  { line: 5, text: '        # Find length and tail' },
  { line: 6, text: '        length = 1' },
  { line: 7, text: '        tail = head' },
  { line: 8, text: '        while tail.next:' },
  { line: 9, text: '            tail = tail.next' },
  { line: 10, text: '            length += 1' },
  { line: 11, text: '        # Normalize k' },
  { line: 12, text: '        k = k % length' },
  { line: 13, text: '        if k == 0:' },
  { line: 14, text: '            return head' },
  { line: 15, text: '        # Find node before new tail' },
  { line: 16, text: '        curr = head' },
  { line: 17, text: '        for _ in range(length - k - 1):' },
  { line: 18, text: '            curr = curr.next' },
  { line: 19, text: '        # Rotate' },
  { line: 20, text: '        new_head = curr.next' },
  { line: 21, text: '        curr.next = None' },
  { line: 22, text: '        tail.next = head' },
  { line: 23, text: '        return new_head' },
]

const EXAMPLES = getExamples('rotate-list') || [
  { label: '1→2→3→4→5, k=2', values: [1, 2, 3, 4, 5], k: 2 },
  { label: '1→2→3→4→5, k=7', values: [1, 2, 3, 4, 5], k: 7 },
  { label: '1→2, k=1', values: [1, 2], k: 1 },
  { label: '1, k=1', values: [1], k: 1 },
]

function generateSteps(values, inputK) {
  const steps = []

  if (!values || values.length === 0) {
    steps.push({
      phase: 'done', activeLine: 4,
      nodes: [], arrows: [], currIdx: -1, tailIdx: -1, length: 0, k: 0,
      message: 'Empty list. Return head.',
    })
    return steps
  }

  const length = values.length
  const k = ((inputK % length) + length) % length

  // Initial state
  steps.push({
    phase: 'start', activeLine: 3,
    nodes: [...values], arrows: generateArrows(values),
    currIdx: -1, tailIdx: -1, newHeadIdx: -1, newTailIdx: -1, length, k,
    message: `List has ${length} node(s). k = ${inputK} % ${length} = ${k}`,
  })

  if (k === 0) {
    steps.push({
      phase: 'done', activeLine: 14,
      nodes: [...values], arrows: generateArrows(values),
      currIdx: -1, tailIdx: -1, newHeadIdx: -1, newTailIdx: -1, length, k,
      message: 'k = 0, no rotation needed. Return head.',
    })
    return steps
  }

  // Find length and tail (traverse)
  steps.push({
    phase: 'traverse', activeLine: 6,
    nodes: [...values], arrows: generateArrows(values),
    currIdx: 0, tailIdx: 0, newHeadIdx: -1, newTailIdx: -1, length, k,
    message: 'Traverse to find length and tail pointer.',
  })

  for (let i = 1; i < length; i++) {
    steps.push({
      phase: 'traverse', activeLine: 9,
      nodes: [...values], arrows: generateArrows(values),
      currIdx: i, tailIdx: i, newHeadIdx: -1, newTailIdx: -1, length, k,
      message: `Move to node ${i}. Tail now at node(${values[i]}).`,
    })
  }

  steps.push({
    phase: 'found_tail', activeLine: 12,
    nodes: [...values], arrows: generateArrows(values),
    currIdx: -1, tailIdx: length - 1, newHeadIdx: -1, newTailIdx: -1, length, k,
    message: `Found tail at node(${values[length - 1]}). Length = ${length}.`,
  })

  // Find new tail (node at position length - k - 1)
  const newTailPos = length - k - 1
  steps.push({
    phase: 'find_new_tail', activeLine: 17,
    nodes: [...values], arrows: generateArrows(values),
    currIdx: 0, tailIdx: length - 1, newHeadIdx: -1, newTailIdx: -1, length, k,
    message: `Find node at position ${newTailPos} to be new tail.`,
  })

  for (let i = 1; i <= newTailPos; i++) {
    steps.push({
      phase: 'find_new_tail', activeLine: 18,
      nodes: [...values], arrows: generateArrows(values),
      currIdx: i, tailIdx: length - 1, newHeadIdx: -1, newTailIdx: -1, length, k,
      message: `Move to node ${i}. Steps remaining: ${newTailPos - i}.`,
    })
  }

  // Found new tail and new head
  const newHeadPos = newTailPos + 1
  steps.push({
    phase: 'found_new_positions', activeLine: 20,
    nodes: [...values], arrows: generateArrows(values),
    currIdx: newTailPos, tailIdx: length - 1, newHeadIdx: newHeadPos, newTailIdx: newTailPos, length, k,
    message: `Found new_tail = node(${values[newTailPos]}), new_head = node(${values[newHeadPos]}).`,
  })

  // Break the chain
  steps.push({
    phase: 'break_chain', activeLine: 21,
    nodes: [...values], arrows: generateArrows(values, newTailPos),
    currIdx: newTailPos, tailIdx: length - 1, newHeadIdx: newHeadPos, newTailIdx: newTailPos, length, k,
    message: `Break chain: node(${values[newTailPos]}).next = None.`,
  })

  // Connect tail to head
  steps.push({
    phase: 'connect_cycle', activeLine: 22,
    nodes: [...values], arrows: generateArrows(values, newTailPos, 0),
    currIdx: -1, tailIdx: length - 1, newHeadIdx: newHeadPos, newTailIdx: newTailPos, length, k,
    message: `Connect: node(${values[length - 1]}).next = node(${values[0]}).`,
  })

  // Final state
  steps.push({
    phase: 'done', activeLine: 23,
    nodes: [...values], arrows: generateArrows(values, newTailPos, 0),
    currIdx: -1, tailIdx: length - 1, newHeadIdx: newHeadPos, newTailIdx: newTailPos, length, k,
    message: `Rotation complete! New head = node(${values[newHeadPos]}).`,
  })

  return steps
}

function generateArrows(values, breakAt = -1, connectTo = -1) {
  const arrows = []
  for (let i = 0; i < values.length - 1; i++) {
    if (i === breakAt) continue
    arrows.push({ from: i, to: i + 1, active: false, broken: false })
  }
  if (connectTo >= 0 && breakAt >= 0) {
    arrows.push({ from: breakAt, to: connectTo, active: false, broken: false, isNewEdge: true })
  }
  return arrows
}

function RotateListViz({ step, values, EXAMPLES, valInput, setValInput, kInput, setKInput, handleReset, inputError }) {
  const handleExampleClick = useCallback((ex) => {
    setValInput(JSON.stringify(ex.values))
    setKInput(String(ex.k))
    handleReset()
  }, [setValInput, setKInput, handleReset])

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Linked List Rotation
        {inputError && <span style={{ marginLeft: 8, color: '#ef4444', fontSize: 12 }}>{inputError}</span>}
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => handleExampleClick(ex)}
            style={{
              padding: '6px 12px',
              borderRadius: 4,
              border: '1px solid #cbd5e1',
              backgroundColor: '#f1f5f9',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={valInput}
          onChange={(e) => { setValInput(e.target.value); handleReset() }}
          placeholder="[1,2,3,4,5]"
          style={{
            flex: 1,
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <input
          type="number"
          value={kInput}
          onChange={(e) => { setKInput(e.target.value); handleReset() }}
          placeholder="k"
          style={{
            width: 60,
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
      </div>

      {/* Node visualization */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 300 }}>
        <svg
          width="100%"
          height={Math.max(200, values.length * 100 + 100)}
          style={{ border: '1px solid #e2e8f0', borderRadius: 4 }}
        >
          {step?.arrows.map((arrow, idx) => {
            const fromX = 50
            const fromY = 50 + arrow.from * 80
            const toX = 50
            const toY = 50 + arrow.to * 80

            const isNewEdge = arrow.isNewEdge
            const isBroken = arrow.broken

            return (
              <g key={idx}>
                <line
                  x1={fromX + 35}
                  y1={fromY}
                  x2={toX + 35}
                  y2={toY - 35}
                  stroke={isNewEdge ? '#10b981' : isBroken ? '#999' : '#0ea5e9'}
                  strokeWidth={isNewEdge ? 2.5 : 1.5}
                  strokeDasharray={isBroken ? '4,4' : 'none'}
                  markerEnd={isNewEdge ? 'url(#arrowNewEdge)' : isBroken ? 'url(#arrowBroken)' : 'url(#arrowNorm)'}
                />
              </g>
            )
          })}

          <defs>
            <marker id="arrowNorm" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#0ea5e9" />
            </marker>
            <marker id="arrowNewEdge" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
            </marker>
            <marker id="arrowBroken" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#999" />
            </marker>
          </defs>

          {values.map((val, idx) => {
            const x = 50
            const y = 50 + idx * 80
            const isCurr = step?.currIdx === idx
            const isTail = step?.tailIdx === idx
            const isNewHead = step?.newHeadIdx === idx
            const isNewTail = step?.newTailIdx === idx

            let bgColor = '#dbeafe'
            let borderColor = '#0ea5e9'
            if (isNewHead) { bgColor = '#dcfce7'; borderColor = '#10b981' }
            else if (isNewTail) { bgColor = '#fef08a'; borderColor = '#eab308' }
            else if (isTail) { bgColor = '#fecaca'; borderColor = '#ef4444' }
            else if (isCurr) { bgColor = '#e9d5ff'; borderColor = '#a855f7' }

            return (
              <motion.g key={idx}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth="2"
                  animate={{ scale: isCurr || isTail || isNewHead || isNewTail ? 1.2 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="14"
                  fontWeight="bold"
                  fill="#1e3a8a"
                >
                  {val}
                </text>
                <text
                  x={x}
                  y={y + 32}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  [{idx}]
                </text>

                {isNewHead && <text x={x - 35} y={y - 5} fontSize="11" fill="#10b981" fontWeight="bold">NEW_HEAD</text>}
                {isNewTail && <text x={x - 35} y={y - 5} fontSize="11" fill="#eab308" fontWeight="bold">NEW_TAIL</text>}
                {isTail && <text x={x - 35} y={y - 5} fontSize="11" fill="#ef4444" fontWeight="bold">TAIL</text>}
                {isCurr && <text x={x - 35} y={y - 5} fontSize="11" fill="#a855f7" fontWeight="bold">CURR</text>}
              </motion.g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12, color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e9d5ff', border: '2px solid #a855f7' }} />
          <span>Current pointer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fecaca', border: '2px solid #ef4444' }} />
          <span>Tail node</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #10b981' }} />
          <span>New head</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fef08a', border: '2px solid #eab308' }} />
          <span>New tail</span>
        </div>
      </div>
    </section>
  )
}

function RotateListPointerState({ step, values }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Algorithm State
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Length</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.length || 0}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>k (normalized)</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.k !== undefined ? step.k : 0}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Current node</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.currIdx >= 0 && values[step.currIdx] !== undefined ? `node(${values[step.currIdx]})` : 'None'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Tail node</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.tailIdx >= 0 && values[step.tailIdx] !== undefined ? `node(${values[step.tailIdx]})` : 'None'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>New head</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.newHeadIdx >= 0 && values[step.newHeadIdx] !== undefined ? `node(${values[step.newHeadIdx]})` : 'None'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>New tail</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.newTailIdx >= 0 && values[step.newTailIdx] !== undefined ? `node(${values[step.newTailIdx]})` : 'None'}
          </span>
        </div>
      </div>

      {step?.phase === 'done' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dcfce7',
            border: '2px solid #10b981',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            color: '#166534',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ✓ Rotation Complete
        </motion.div>
      )}
    </section>
  )
}

export default function RotateListVisualizer() {
  const [valInput, setValInput] = useState('[1,2,3,4,5]')
  const [kInput, setKInput] = useState('2')

  const { values, k, inputError } = useMemo(() => {
    try {
      const v = JSON.parse(valInput)
      if (!Array.isArray(v)) throw new Error('Must be an array')
      if (v.length > 8) throw new Error('Max 8 nodes')
      const kVal = parseInt(kInput) || 0
      return { values: v, k: kVal, inputError: '' }
    } catch (e) {
      return { values: [1, 2, 3, 4, 5], k: 2, inputError: e.message || 'Invalid input' }
    }
  }, [valInput, kInput])

  const steps = useMemo(() => generateSteps(values, k), [values, k])

  const {
    stepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const SOLUTION_CODE_WITH_CONNECTIVITY = useSolutionCode('rotate-list') || SOLUTION_CODE

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />
      ),
    },
    {
      id: 'viz',
      title: 'Visualization',
      content: (
        <div style={{ display: 'flex', height: '100%' }}>
          <RotateListViz
            step={step}
            values={values}
            EXAMPLES={EXAMPLES}
            valInput={valInput}
            setValInput={setValInput}
            kInput={kInput}
            setKInput={setKInput}
            handleReset={handleReset}
            inputError={inputError}
          />
          <RotateListPointerState step={step} values={values} />
        </div>
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    values,
    valInput,
    kInput,
    autoScrollCode,
    handleReset,
    inputError,
  ])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div style={{ marginBottom: '12px', fontSize: 12, color: '#475569' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
