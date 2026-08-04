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
import { getExamplesOr } from '../../config/examplesRegistry'
import './RotateListVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const LINE_PATTERN_MAP = {}
const PATTERNS = []

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def rotateRight(self, head: ListNode, k: int) -> ListNode:' },
  { line: 3, text: '        if not head or k == 0:' },
  { line: 4, text: '            return head' },
  { line: 5, text: '        ' },
  { line: 6, text: '        length = 0' },
  { line: 7, text: '        curr = head' },
  { line: 8, text: '        while curr:' },
  { line: 9, text: '            length += 1' },
  { line: 10, text: '            curr = curr.next' },
  { line: 11, text: '        ' },
  { line: 12, text: '        k = k % length' },
  { line: 13, text: '        if k == 0:' },
  { line: 14, text: '            return head' },
  { line: 15, text: '        ' },
  { line: 16, text: '        new_tail_idx = length - k - 1' },
  { line: 17, text: '        ' },
  { line: 18, text: '        curr = head' },
  { line: 19, text: '        for i in range(new_tail_idx):' },
  { line: 20, text: '            curr = curr.next' },
  { line: 21, text: '        ' },
  { line: 22, text: '        new_head = curr.next' },
  { line: 23, text: '        curr.next = None' },
  { line: 24, text: '        ' },
  { line: 25, text: '        tail = new_head' },
  { line: 26, text: '        while tail.next:' },
  { line: 27, text: '            tail = tail.next' },
  { line: 28, text: '        ' },
  { line: 29, text: '        tail.next = head' },
  { line: 30, text: '        return new_head' },
]

function generateSteps(values, k) {
  const steps = []

  if (!values || values.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 4,
      nodes: [],
      arrows: [],
      message: 'Empty list. Return head.',
    })
    return steps
  }

  const n = values.length

  if (k === 0 || k % n === 0) {
    steps.push({
      phase: 'done',
      activeLine: 4,
      nodes: [...values],
      arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
      message: `k=${k} is multiple of ${n}. No rotation needed.`,
    })
    return steps
  }

  // Phase 1: Count length
  steps.push({
    phase: 'count',
    activeLine: 6,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
    message: 'Initialize length = 0.',
  })

  for (let i = 0; i < n; i++) {
    steps.push({
      phase: 'count',
      activeLine: 8,
      nodes: [...values],
      arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
      curr: i,
      message: `Count node ${i}: length = ${i + 1}.`,
    })
  }

  const actualK = k % n

  steps.push({
    phase: 'normalize',
    activeLine: 12,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
    message: `Normalize k: ${k} % ${n} = ${actualK}.`,
    length: n,
    k: actualK,
  })

  // Phase 2: Find new tail position
  const newTailIdx = n - actualK - 1

  steps.push({
    phase: 'find-tail',
    activeLine: 16,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
    message: `New tail position: ${newTailIdx} (length - k - 1).`,
    length: n,
    k: actualK,
    newTailIdx,
  })

  // Phase 3: Traverse to new tail
  steps.push({
    phase: 'find-tail',
    activeLine: 18,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({ from: i, to: i + 1 })),
    message: `Start traversal to find new tail.`,
    length: n,
    k: actualK,
    newTailIdx,
  })

  for (let i = 0; i <= newTailIdx; i++) {
    steps.push({
      phase: 'find-tail',
      activeLine: i < newTailIdx ? 19 : 20,
      nodes: [...values],
      arrows: Array.from({ length: n - 1 }, (_, idx) => ({
        from: idx,
        to: idx + 1,
        active: idx === i,
      })),
      curr: i,
      message: `Traverse: curr at index ${i}${i === newTailIdx ? ' (new tail found)' : ''}.`,
      length: n,
      k: actualK,
      newTailIdx,
    })
  }

  // Phase 4: Find new head and disconnect
  steps.push({
    phase: 'reconnect',
    activeLine: 22,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({
      from: i,
      to: i + 1,
      broken: i === newTailIdx,
    })),
    newTail: newTailIdx,
    newHead: newTailIdx + 1,
    message: `new_head = node at index ${newTailIdx + 1}.`,
    length: n,
    k: actualK,
  })

  steps.push({
    phase: 'reconnect',
    activeLine: 23,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({
      from: i,
      to: i + 1,
      broken: i === newTailIdx,
    })),
    newTail: newTailIdx,
    newHead: newTailIdx + 1,
    message: `Disconnect: node at index ${newTailIdx}.next = None.`,
    length: n,
    k: actualK,
  })

  // Phase 5: Find tail of new head
  steps.push({
    phase: 'reconnect',
    activeLine: 25,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({
      from: i,
      to: i + 1,
      broken: i === newTailIdx,
    })),
    newTail: newTailIdx,
    newHead: newTailIdx + 1,
    message: `Start from new_head to find its tail.`,
    length: n,
    k: actualK,
  })

  for (let i = newTailIdx + 1; i < n; i++) {
    steps.push({
      phase: 'reconnect',
      activeLine: 26,
      nodes: [...values],
      arrows: Array.from({ length: n - 1 }, (_, idx) => ({
        from: idx,
        to: idx + 1,
        broken: idx === newTailIdx,
        highlightNew: idx >= newTailIdx + 1,
      })),
      curr: i,
      newTail: newTailIdx,
      newHead: newTailIdx + 1,
      message: `Traverse new list: curr at index ${i}${i === n - 1 ? ' (tail found)' : ''}.`,
      length: n,
      k: actualK,
    })
  }

  // Phase 6: Connect tail to head
  steps.push({
    phase: 'done',
    activeLine: 29,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({
      from: i,
      to: i + 1,
      rotated: i !== newTailIdx,
      tailConnection: i === n - 1,
    })).concat([{ from: n - 1, to: 0, tailConnection: true }]),
    newHead: newTailIdx + 1,
    message: `Connect tail to head. Rotation complete!`,
    result: newTailIdx + 1,
    length: n,
    k: actualK,
  })

  steps.push({
    phase: 'done',
    activeLine: 30,
    nodes: [...values],
    arrows: Array.from({ length: n - 1 }, (_, i) => ({
      from: i,
      to: i + 1,
      rotated: true,
    })).concat([{ from: n - 1, to: 0, tailConnection: true }]),
    newHead: newTailIdx + 1,
    message: `Return new head at index ${newTailIdx + 1}.`,
    result: newTailIdx + 1,
    length: n,
    k: actualK,
  })

  return steps
}

function VisualizationPanel({
  step,
  applyExample,
  examples,
  values,
  k,
  setValInput,
  setK,
  valInput,
  handleReset,
  inputError,
}) {
  return (
    <section className="rl-panel main">
      <header className="rl-head">
        <span>Linked List · Rotate Right</span>
        {inputError && <span className="rl-error">{inputError}</span>}
      </header>
      <div className="rl-body">
        <div className="rl-examples">
          {examples.map((ex) => (
            <button
              key={ex.label}
              className="rl-chip"
              onClick={() => {
                setValInput(JSON.stringify(ex.values))
                setK(ex.k || 2)
                handleReset()
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div className="rl-input-row">
          <div className="rl-input-group">
            <label className="rl-input-label">List Values</label>
            <input
              className="rl-input"
              value={valInput}
              onChange={(e) => {
                setValInput(e.target.value)
                handleReset()
              }}
              placeholder="[1,2,3,4,5]"
            />
          </div>
          <div className="rl-input-group" style={{ flex: 0, minWidth: 80 }}>
            <label className="rl-input-label">k (rotation)</label>
            <input
              type="number"
              className="rl-input"
              value={k}
              onChange={(e) => {
                setK(Number(e.target.value))
                handleReset()
              }}
              min={0}
            />
          </div>
        </div>

        {/* Node row */}
        <div className="rl-canvas">
          <svg className="rl-arrows-svg" aria-hidden="true">
            {step?.arrows?.map((arrow, idx) => {
              const fromX = arrow.from * 90 + 32
              const toX = arrow.to * 90 + 32
              const y = 32
              const isCircular = arrow.from > arrow.to
              const startX = fromX + 20
              const endX = isCircular ? 10 : toX - 22

              return (
                <g key={idx}>
                  <path
                    d={
                      isCircular
                        ? `M ${startX} ${y} L 500 ${y} Q 520 ${y} 520 ${y + 40} Q 520 ${y + 50} 510 ${y + 50} L ${endX} ${y + 50} Q ${endX - 10} ${y + 50} ${endX - 10} ${y + 40} L ${endX - 10} ${y}`
                        : `M ${startX} ${y} L ${endX} ${y}`
                    }
                    className={`rl-arrow-line${arrow.active ? ' active' : ''}${arrow.rotated ? ' rotated' : ''}${arrow.tailConnection ? ' tail-to-head' : ''}${arrow.broken ? ' broken' : ''}`}
                    fill="none"
                  />
                  {!arrow.broken && (
                    <polygon
                      points={`${endX},${isCircular ? y + 50 : y - 5} ${endX + 12},${isCircular ? y + 50 : y} ${endX},${isCircular ? y + 50 : y + 5}`}
                      className={`rl-arrow-head${arrow.rotated ? ' rotated' : ''}${arrow.tailConnection ? ' tail-to-head' : ''}`}
                    />
                  )}
                </g>
              )
            })}
          </svg>

          <div className="rl-nodes">
            {values.map((val, idx) => {
              const isCurr = step?.curr === idx
              const isNewTail = step?.newTail === idx
              const isTail = idx === values.length - 1
              const isNewHead = step?.newHead === idx
              const isDone = step?.phase === 'done'

              return (
                <div key={idx} className="rl-node-wrap">
                  <motion.div
                    className={`rl-node${isCurr ? ' curr' : ''}${isNewTail ? ' new-tail' : ''}${isTail && !isNewTail ? ' tail' : ''}${isNewHead ? ' new-head' : ''}${isDone ? ' done' : ''}`}
                    animate={{
                      y: isCurr || isNewTail || isNewHead ? -10 : 0,
                      scale: isCurr || isNewTail || isNewHead ? 1.15 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  >
                    {val}
                  </motion.div>
                  <div className="rl-ptrs">
                    {isCurr && <span className="rl-ptr rl-ptr-curr">curr</span>}
                    {isNewTail && <span className="rl-ptr rl-ptr-new-tail">new-tail</span>}
                    {isTail && !isNewTail && <span className="rl-ptr rl-ptr-tail">tail</span>}
                    {isNewHead && <span className="rl-ptr rl-ptr-new-head">new-head</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="rl-legend">
          <span className="rl-legend-item curr">curr — current node</span>
          <span className="rl-legend-item new-tail">new-tail — rotation point</span>
          <span className="rl-legend-item tail">tail — last node</span>
          <span className="rl-legend-item new-head">new-head — new start</span>
        </div>
      </div>
    </section>
  )
}

function RotateListState({ step, values }) {
  return (
    <section className="rl-panel side">
      <header className="rl-head">
        <span>State</span>
      </header>
      <div className="rl-body">
        {step?.length !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label">Length</span>
            <span className="rl-state-val mono">{step.length}</span>
          </div>
        )}

        {step?.k !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label">k (normalized)</span>
            <span className="rl-state-val mono">{step.k}</span>
          </div>
        )}

        {step?.newTailIdx !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label">New Tail Index</span>
            <span className="rl-state-val mono">{step.newTailIdx}</span>
          </div>
        )}

        {step?.curr !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label curr">Current</span>
            <span className="rl-state-val mono">
              {step.curr >= 0 ? `node(${values[step.curr]})` : 'None'}
            </span>
          </div>
        )}

        {step?.newTail !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label new-tail">New Tail</span>
            <span className="rl-state-val mono">
              {step.newTail >= 0 ? `node(${values[step.newTail]})` : 'None'}
            </span>
          </div>
        )}

        {step?.newHead !== undefined && (
          <div className="rl-state-row">
            <span className="rl-state-label new-head">New Head</span>
            <span className="rl-state-val mono">
              {step.newHead >= 0 ? `node(${values[step.newHead]})` : 'None'}
            </span>
          </div>
        )}

        {step?.result !== undefined && (
          <motion.div
            className="rl-result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Rotation Complete!
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function RotateListVisualizer() {
  const examples = useMemo(() => getExamplesOr('rotate-list', []), [])
  const [valInput, setValInput] = useState('[1,2,3,4,5]')
  const [k, setK] = useState(2)

  const { values, inputError } = useMemo(() => {
    try {
      const v = JSON.parse(valInput)
      if (!Array.isArray(v)) throw new Error('Must be an array')
      if (v.length > 8) throw new Error('Max 8 nodes for clarity')
      return { values: v, inputError: '' }
    } catch (e) {
      return { values: [1, 2, 3, 4, 5], inputError: e.message || 'Invalid input' }
    }
  }, [valInput])

  const steps = useMemo(() => generateSteps(values, k), [values, k])

  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } =
    usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

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
              onActiveLineDomChange={setActiveLineDom}
              autoScroll={autoScrollCode}
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
        title: 'Visualization',
        content: (
          <div className="rl-top">
            <VisualizationPanel
              step={step}
              values={values}
              k={k}
              setValInput={setValInput}
              setK={setK}
              valInput={valInput}
              applyExample={useCallback(
                (ex) => {
                  setValInput(JSON.stringify(ex.values))
                  setK(ex.k || 2)
                  handleReset()
                },
                [handleReset]
              )}
              examples={examples}
              handleReset={handleReset}
              inputError={inputError}
            />
            <RotateListState step={step} values={values} />
          </div>
        ),
      },
    ],
    [
      step,
      values,
      k,
      valInput,
      examples,
      handleReset,
      inputError,
      autoScrollCode,
      showPatternOverlay,
      activeLineDom,
    ]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div className="rl-status" style={{ marginBottom: '12px' }}>
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
