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
  { line: 2, text: '    def partition(self, head: ListNode, x: int) -> ListNode:' },
  { line: 3, text: '        # Create dummy nodes for < x and >= x lists' },
  { line: 4, text: '        less_dummy = ListNode(0)' },
  { line: 5, text: '        greater_dummy = ListNode(0)' },
  { line: 6, text: '        less, greater = less_dummy, greater_dummy' },
  { line: 7, text: '        curr = head' },
  { line: 8, text: '        while curr:' },
  { line: 9, text: '            if curr.val < x:' },
  { line: 10, text: '                less.next = curr' },
  { line: 11, text: '                less = less.next' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                greater.next = curr' },
  { line: 14, text: '                greater = greater.next' },
  { line: 15, text: '            curr = curr.next' },
  { line: 16, text: '        # Connect the two lists' },
  { line: 17, text: '        greater.next = None' },
  { line: 18, text: '        less.next = greater_dummy.next' },
  { line: 19, text: '        return less_dummy.next' },
]

const EXAMPLES = getExamples('partition-list') || [
  { label: '1→4→3→2→5→2, x=3', values: [1, 4, 3, 2, 5, 2], x: 3 },
  { label: '5→2→8→3→10, x=5', values: [5, 2, 8, 3, 10], x: 5 },
  { label: '1→2→3, x=2', values: [1, 2, 3], x: 2 },
  { label: '1→2, x=0', values: [1, 2], x: 0 },
]

function generateSteps(values, inputX) {
  const steps = []

  if (!values || values.length === 0) {
    steps.push({
      phase: 'done', activeLine: 19,
      nodes: [], lessList: [], greaterList: [],
      currIdx: -1, lessIdx: -1, greaterIdx: -1,
      x: inputX,
      message: 'Empty list. Return head.',
    })
    return steps
  }

  // Initial state
  steps.push({
    phase: 'start', activeLine: 4,
    nodes: [...values], lessList: [], greaterList: [],
    currIdx: -1, lessIdx: -1, greaterIdx: -1,
    x: inputX,
    message: `Initialize less and greater dummy nodes. x = ${inputX}`,
  })

  const lessList = []
  const greaterList = []

  // Process each node
  steps.push({
    phase: 'traverse', activeLine: 8,
    nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
    currIdx: 0, lessIdx: -1, greaterIdx: -1,
    x: inputX,
    message: `Start traversing. Current = node(${values[0]})`,
  })

  for (let i = 0; i < values.length; i++) {
    const val = values[i]

    if (val < inputX) {
      lessList.push(val)
      steps.push({
        phase: 'add_less', activeLine: 9,
        nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
        currIdx: i, lessIdx: lessList.length - 1, greaterIdx: -1,
        x: inputX,
        message: `node(${val}) < ${inputX}. Add to less list.`,
      })
    } else {
      greaterList.push(val)
      steps.push({
        phase: 'add_greater', activeLine: 13,
        nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
        currIdx: i, lessIdx: -1, greaterIdx: greaterList.length - 1,
        x: inputX,
        message: `node(${val}) >= ${inputX}. Add to greater list.`,
      })
    }

    if (i < values.length - 1) {
      steps.push({
        phase: 'traverse', activeLine: 15,
        nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
        currIdx: i + 1, lessIdx: -1, greaterIdx: -1,
        x: inputX,
        message: `Move to next. Current = node(${values[i + 1]})`,
      })
    }
  }

  // Connect the two lists
  steps.push({
    phase: 'connect', activeLine: 18,
    nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
    currIdx: -1, lessIdx: -1, greaterIdx: -1,
    x: inputX,
    message: `Connect less list to greater list.`,
  })

  // Final state
  steps.push({
    phase: 'done', activeLine: 19,
    nodes: [...values], lessList: [...lessList], greaterList: [...greaterList],
    currIdx: -1, lessIdx: -1, greaterIdx: -1,
    x: inputX,
    message: `Partition complete! Result: [${[...lessList, ...greaterList].join('→')}]`,
  })

  return steps
}

function PartitionListViz({ step, values, EXAMPLES, valInput, setValInput, xInput, setXInput, handleReset, inputError }) {
  const handleExampleClick = useCallback((ex) => {
    setValInput(JSON.stringify(ex.values))
    setXInput(String(ex.x))
    handleReset()
  }, [setValInput, setXInput, handleReset])

  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        List Partition Visualization
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
          placeholder="[1,4,3,2,5,2]"
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
          value={xInput}
          onChange={(e) => { setXInput(e.target.value); handleReset() }}
          placeholder="x"
          style={{
            width: 60,
            padding: '8px 10px',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            fontSize: 12,
          }}
        />
      </div>

      {/* Visualization */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 400 }}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Original list */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Original List (x = {step?.x || 0})
            </div>
            <svg
              width="100%"
              height={Math.max(100, (values.length || 1) * 60)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 4, backgroundColor: '#fafafa' }}
            >
              {/* Arrows for original list */}
              {values && values.map((val, idx) => {
                if (idx < values.length - 1) {
                  return (
                    <g key={`arrow-${idx}`}>
                      <line
                        x1={80 + idx * 70}
                        y1={30}
                        x2={80 + (idx + 1) * 70 - 35}
                        y2={30}
                        stroke="#0ea5e9"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowBlue)"
                      />
                    </g>
                  )
                }
                return null
              })}

              <defs>
                <marker id="arrowBlue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#0ea5e9" />
                </marker>
                <marker id="arrowGreen" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
                </marker>
                <marker id="arrowRed" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
                </marker>
              </defs>

              {/* Nodes in original list */}
              {values && values.map((val, idx) => {
                const x = 50 + idx * 70
                const y = 30
                const isCurr = step?.currIdx === idx
                const bgColor = isCurr ? '#e9d5ff' : '#dbeafe'
                const borderColor = isCurr ? '#a855f7' : '#0ea5e9'

                return (
                  <motion.g key={`node-${idx}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={bgColor}
                      stroke={borderColor}
                      strokeWidth="2"
                      animate={{ scale: isCurr ? 1.2 : 1 }}
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
                    {isCurr && <text x={x - 30} y={y - 5} fontSize="11" fill="#a855f7" fontWeight="bold">CURR</text>}
                  </motion.g>
                )
              })}
            </svg>
          </div>

          {/* Less list */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Less List (values &lt; {step?.x || 0})
            </div>
            <svg
              width="100%"
              height={Math.max(80, ((step?.lessList?.length || 0) + 1) * 60)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 4, backgroundColor: '#f0fdf4' }}
            >
              {/* Arrows in less list */}
              {step?.lessList && step.lessList.map((val, idx) => {
                if (idx < step.lessList.length - 1) {
                  return (
                    <g key={`less-arrow-${idx}`}>
                      <line
                        x1={80 + idx * 70}
                        y1={30}
                        x2={80 + (idx + 1) * 70 - 35}
                        y2={30}
                        stroke="#10b981"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowGreen)"
                      />
                    </g>
                  )
                }
                return null
              })}

              {/* Nodes in less list */}
              {step?.lessList && step.lessList.map((val, idx) => {
                const x = 50 + idx * 70
                const y = 30
                const isLess = step?.lessIdx === idx
                const bgColor = isLess ? '#fef08a' : '#dcfce7'
                const borderColor = isLess ? '#eab308' : '#10b981'

                return (
                  <motion.g key={`less-node-${idx}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={bgColor}
                      stroke={borderColor}
                      strokeWidth="2"
                      animate={{ scale: isLess ? 1.2 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#166534"
                    >
                      {val}
                    </text>
                    {isLess && <text x={x - 30} y={y - 5} fontSize="11" fill="#eab308" fontWeight="bold">NEW</text>}
                  </motion.g>
                )
              })}

              {(!step?.lessList || step.lessList.length === 0) && (
                <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="12" fill="#999">
                  Empty
                </text>
              )}
            </svg>
          </div>

          {/* Greater or equal list */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
              Greater/Equal List (values &gt;= {step?.x || 0})
            </div>
            <svg
              width="100%"
              height={Math.max(80, ((step?.greaterList?.length || 0) + 1) * 60)}
              style={{ border: '1px solid #e2e8f0', borderRadius: 4, backgroundColor: '#fef2f2' }}
            >
              {/* Arrows in greater list */}
              {step?.greaterList && step.greaterList.map((val, idx) => {
                if (idx < step.greaterList.length - 1) {
                  return (
                    <g key={`greater-arrow-${idx}`}>
                      <line
                        x1={80 + idx * 70}
                        y1={30}
                        x2={80 + (idx + 1) * 70 - 35}
                        y2={30}
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowRed)"
                      />
                    </g>
                  )
                }
                return null
              })}

              {/* Nodes in greater list */}
              {step?.greaterList && step.greaterList.map((val, idx) => {
                const x = 50 + idx * 70
                const y = 30
                const isGreater = step?.greaterIdx === idx
                const bgColor = isGreater ? '#fef08a' : '#fecaca'
                const borderColor = isGreater ? '#eab308' : '#ef4444'

                return (
                  <motion.g key={`greater-node-${idx}`}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="20"
                      fill={bgColor}
                      stroke={borderColor}
                      strokeWidth="2"
                      animate={{ scale: isGreater ? 1.2 : 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="14"
                      fontWeight="bold"
                      fill="#7f1d1d"
                    >
                      {val}
                    </text>
                    {isGreater && <text x={x - 30} y={y - 5} fontSize="11" fill="#eab308" fontWeight="bold">NEW</text>}
                  </motion.g>
                )
              })}

              {(!step?.greaterList || step.greaterList.length === 0) && (
                <text x="50%" y="50%" textAnchor="middle" dy="0.3em" fontSize="12" fill="#999">
                  Empty
                </text>
              )}
            </svg>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12, color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#e9d5ff', border: '2px solid #a855f7' }} />
          <span>Current node</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#dcfce7', border: '2px solid #10b981' }} />
          <span>Less list</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fecaca', border: '2px solid #ef4444' }} />
          <span>Greater/equal list</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#fef08a', border: '2px solid #eab308' }} />
          <span>Newly added</span>
        </div>
      </div>
    </section>
  )
}

function PartitionListPointerState({ step, values }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderLeft: '1px solid #e2e8f0' }}>
      <header style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Algorithm State
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Partition value (x)</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.x !== undefined ? step.x : 0}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Less list size</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.lessList?.length || 0}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Greater/equal list size</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.greaterList?.length || 0}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 8, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Current node</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#1e293b' }}>
            {step?.currIdx >= 0 && values[step.currIdx] !== undefined ? `node(${values[step.currIdx]})` : 'None'}
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
          ✓ Partition Complete
        </motion.div>
      )}
    </section>
  )
}

export default function PartitionListVisualizer() {
  const [valInput, setValInput] = useState('[1,4,3,2,5,2]')
  const [xInput, setXInput] = useState('3')

  const { values, x, inputError } = useMemo(() => {
    try {
      const v = JSON.parse(valInput)
      if (!Array.isArray(v)) throw new Error('Must be an array')
      if (v.length > 10) throw new Error('Max 10 nodes')
      const xVal = parseInt(xInput) || 0
      return { values: v, x: xVal, inputError: '' }
    } catch (e) {
      return { values: [1, 4, 3, 2, 5, 2], x: 3, inputError: e.message || 'Invalid input' }
    }
  }, [valInput, xInput])

  const steps = useMemo(() => generateSteps(values, x), [values, x])

  const {
    stepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const SOLUTION_CODE_WITH_CONNECTIVITY = useSolutionCode('partition-list') || SOLUTION_CODE

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
          <PartitionListViz
            step={step}
            values={values}
            EXAMPLES={EXAMPLES}
            valInput={valInput}
            setValInput={setValInput}
            xInput={xInput}
            setXInput={setXInput}
            handleReset={handleReset}
            inputError={inputError}
          />
          <PartitionListPointerState step={step} values={values} />
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
    xInput,
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
