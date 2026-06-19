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
  { line: 1, text: 'def addTwoNumbers(l1: ListNode, l2: ListNode) -> ListNode:' },
  { line: 2, text: '    stack1, stack2 = [], []' },
  { line: 3, text: '    while l1:' },
  { line: 4, text: '        stack1.append(l1.val)' },
  { line: 5, text: '        l1 = l1.next' },
  { line: 6, text: '    while l2:' },
  { line: 7, text: '        stack2.append(l2.val)' },
  { line: 8, text: '        l2 = l2.next' },
  { line: 9, text: '    carry = 0' },
  { line: 10, text: '    result = None' },
  { line: 11, text: '    while stack1 or stack2 or carry:' },
  { line: 12, text: '        val = carry' },
  { line: 13, text: '        if stack1: val += stack1.pop()' },
  { line: 14, text: '        if stack2: val += stack2.pop()' },
  { line: 15, text: '        carry = val // 10' },
  { line: 16, text: '        node = ListNode(val % 10)' },
  { line: 17, text: '        node.next = result' },
  { line: 18, text: '        result = node' },
  { line: 19, text: '    return result' },
]

const EXAMPLES = getExamples('add-two-numbers-ii') || [
  { label: 'Example 1', list1: [7, 2, 4, 3], list2: [5, 6, 4], expected: [7, 8, 0, 7] },
  { label: 'Example 2', list1: [2, 4, 3], list2: [5, 6, 4], expected: [7, 0, 8] },
  { label: 'Example 3', list1: [9, 9, 9], list2: [9, 9, 9, 9], expected: [1, 0, 0, 0, 9] },
]

const SNIPPETS = [
  { id: 'init', label: 'Initialize Stacks', lines: [1, 2] },
  { id: 'load', label: 'Load Into Stacks', lines: [3, 4, 5, 6, 7, 8] },
  { id: 'process', label: 'Process & Build', lines: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18] },
  { id: 'return', label: 'Return', lines: [19] },
]

function generateSteps(list1, list2) {
  const steps = []

  if (!Array.isArray(list1) || !Array.isArray(list2)) {
    return [{
      phase: 'done',
      activeLine: 1,
      stack1: [],
      stack2: [],
      result: [],
      carry: 0,
      stepNum: 0,
      message: 'Invalid input lists.',
    }]
  }

  if (list1.length === 0 && list2.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      stack1: [],
      stack2: [],
      result: [],
      carry: 0,
      stepNum: 0,
      message: 'Both lists are empty.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    stack1: [],
    stack2: [],
    result: [],
    carry: 0,
    stepNum: 0,
    message: `Starting: list1=${JSON.stringify(list1)}, list2=${JSON.stringify(list2)}`,
  })

  let stack1 = [...list1]
  let stack2 = [...list2]

  steps.push({
    phase: 'stacks_loaded',
    activeLine: 9,
    stack1: [...stack1],
    stack2: [...stack2],
    result: [],
    carry: 0,
    stepNum: 1,
    message: `Stacks loaded. Stack1=${JSON.stringify(stack1)}, Stack2=${JSON.stringify(stack2)}`,
  })

  let result = []
  let carry = 0
  let stepNum = 2

  while (stack1.length > 0 || stack2.length > 0 || carry > 0) {
    let val = carry

    steps.push({
      phase: 'processing',
      activeLine: 12,
      stack1: [...stack1],
      stack2: [...stack2],
      result: [...result],
      carry,
      stepNum,
      message: `Starting sum with carry=${carry}`,
    })
    stepNum++

    if (stack1.length > 0) {
      val += stack1.pop()
      steps.push({
        phase: 'popped1',
        activeLine: 13,
        stack1: [...stack1],
        stack2: [...stack2],
        result: [...result],
        carry,
        popped: val - carry,
        stepNum,
        message: `Popped ${val - carry} from stack1. Current sum=${val}`,
      })
      stepNum++
    }

    if (stack2.length > 0) {
      const pop2 = stack2.pop()
      val += pop2
      steps.push({
        phase: 'popped2',
        activeLine: 14,
        stack1: [...stack1],
        stack2: [...stack2],
        result: [...result],
        carry,
        popped: pop2,
        stepNum,
        message: `Popped ${pop2} from stack2. Current sum=${val}`,
      })
      stepNum++
    }

    carry = Math.floor(val / 10)
    const digit = val % 10

    steps.push({
      phase: 'digit_created',
      activeLine: 16,
      stack1: [...stack1],
      stack2: [...stack2],
      result: [...result, digit],
      carry,
      stepNum,
      message: `Created digit ${digit}. New carry=${carry}. Result=${JSON.stringify([...result, digit])}`,
    })
    stepNum++

    result.push(digit)
  }

  steps.push({
    phase: 'done',
    activeLine: 19,
    stack1: [],
    stack2: [],
    result: [...result],
    carry: 0,
    stepNum,
    message: `Sum complete: ${JSON.stringify(result)}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'init'
  if (phase === 'stacks_loaded') return 'load'
  if (phase === 'processing' || phase === 'popped1' || phase === 'popped2' || phase === 'digit_created') return 'process'
  if (phase === 'done') return 'return'
  return 'init'
}

function StackView({ stack, label, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        {label}
      </header>
      <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 6, minHeight: 80, justifyContent: 'flex-end' }}>
        {stack.length === 0 ? (
          <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Empty</div>
        ) : (
          stack.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                padding: '8px 12px',
                backgroundColor: '#dbeafe',
                border: '2px solid #3b82f6',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                color: '#1e40af',
                textAlign: 'center',
                minWidth: 60,
              }}
            >
              {val}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function ResultList({ result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        Result: [{result.length} digits]
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 60, alignContent: 'flex-start' }}>
        {result.map((digit, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              minWidth: 50,
              height: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#dcfce7',
              border: '2px solid #22c55e',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              color: '#15803d',
            }}
          >
            {digit}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, list1, list2, EXAMPLES, handleExampleClick, list1Input, setList1Input, list2Input, setList2Input, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            List 1 (comma-separated)
          </label>
          <input
            value={list1Input}
            onChange={(e) => { setList1Input(e.target.value); handleReset() }}
            placeholder="e.g., 7,2,4,3"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
            List 2 (comma-separated)
          </label>
          <input
            value={list2Input}
            onChange={(e) => { setList2Input(e.target.value); handleReset() }}
            placeholder="e.g., 5,6,4"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleReset}
          style={{
            padding: '8px 10px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, flex: 1 }}>
        <StackView stack={step?.stack1 || []} label="Stack 1" />
        <StackView stack={step?.stack2 || []} label="Stack 2" />
        <ResultList result={step?.result || []} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Story: Building Sum from Right to Left
        </div>
        <div style={{ fontSize: 12, color: '#22c55e', lineHeight: 1.4 }}>
          Like counting from right to left with coins of different denominations, handling carries as we go.
        </div>
      </div>
    </section>
  )
}

export default function Problem445Visualizer() {
  const [list1Input, setList1Input] = useState('7,2,4,3')
  const [list2Input, setList2Input] = useState('5,6,4')

  const { list1, list2 } = useMemo(() => {
    const parse = (str) => {
      if (!str || str.trim() === '') return []
      return str.split(',').map(s => {
        const n = parseInt(s.trim())
        return isNaN(n) ? 0 : n
      })
    }
    return {
      list1: parse(list1Input),
      list2: parse(list2Input),
    }
  }, [list1Input, list2Input])

  const steps = useMemo(
    () => generateSteps(list1, list2).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [list1, list2],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })

  const SOLUTION_CODE_WITH_CONNECTIVITY = useSolutionCode('add-two-numbers-ii') || SOLUTION_CODE

  const handleExampleClick = useCallback((ex) => {
    setList1Input(ex.list1.join(','))
    setList2Input(ex.list2.join(','))
    handleReset()
  }, [handleReset])

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
        <VisualizationPanel
          step={step}
          list1={list1}
          list2={list2}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          list1Input={list1Input}
          setList1Input={setList1Input}
          list2Input={list2Input}
          setList2Input={setList2Input}
          handleReset={handleReset}
        />
      ),
    },
  ], [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    list1,
    list2,
    list1Input,
    list2Input,
    autoScrollCode,
    handleReset,
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
