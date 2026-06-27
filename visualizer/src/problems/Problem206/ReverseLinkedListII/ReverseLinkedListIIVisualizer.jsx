import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../../components/shared/DockableWorkspace'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import './ReverseLinkedListIIVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def reverseBetween(head, m, n):' },
  { line: 2, text: '    if not head: return None' },
  { line: 3, text: '    dummy = ListNode(0)' },
  { line: 4, text: '    dummy.next = head' },
  { line: 5, text: '    prev = dummy' },
  { line: 6, text: '    for i in range(m - 1):' },
  { line: 7, text: '        prev = prev.next' },
  { line: 8, text: '    curr = prev.next' },
  { line: 9, text: '    for i in range(n - m):' },
  { line: 10, text: '        next_temp = curr.next' },
  { line: 11, text: '        curr.next = next_temp.next' },
  { line: 12, text: '        next_temp.next = prev.next' },
  { line: 13, text: '        prev.next = next_temp' },
  { line: 14, text: '    return dummy.next' },
]

function buildList(arr) {
  if (arr.length === 0) return null
  return { val: arr[0], next: arr.length > 1 ? buildList(arr.slice(1)) : null }
}

function listToArray(head, maxLen = 20) {
  const arr = []
  let curr = head
  while (curr && arr.length < maxLen) {
    arr.push(curr.val)
    curr = curr.next
  }
  return arr
}

function generateSteps(arr, m, n) {
  const steps = []

  steps.push({
    activeLine: 1,
    arr,
    m,
    n,
    message: `Reverse nodes from position ${m} to ${n}`,
    relatedLines: [1],
  })

  let head = buildList(arr)

  steps.push({
    activeLine: 2,
    arr,
    m,
    n,
    head: listToArray(head),
    message: 'Create dummy node pointing to head',
    relatedLines: [3, 4],
  })

  const dummy = { val: 0, next: head }
  let prev = dummy
  let curr = head

  steps.push({
    activeLine: 5,
    arr,
    m,
    n,
    message: `Initialize: prev = dummy, curr = head`,
    relatedLines: [5, 8],
  })

  steps.push({
    activeLine: 6,
    arr,
    m,
    n,
    message: `Move prev pointer to position ${m - 1}`,
    relatedLines: [6, 7],
  })

  for (let i = 0; i < m - 1; i++) {
    steps.push({
      activeLine: 7,
      arr,
      m,
      n,
      i,
      moveCount: i + 1,
      message: `Move prev: step ${i + 1}/${m - 1}`,
      relatedLines: [7],
    })
    prev = prev.next
    curr = prev.next
  }

  steps.push({
    activeLine: 8,
    arr,
    m,
    n,
    message: `Positioned: prev at node ${m - 1}, curr at node ${m}`,
    relatedLines: [8],
  })

  steps.push({
    activeLine: 9,
    arr,
    m,
    n,
    message: `Reverse section: perform ${n - m} rotations`,
    relatedLines: [9],
  })

  for (let i = 0; i < n - m; i++) {
    steps.push({
      activeLine: 10,
      arr,
      m,
      n,
      i,
      step: i + 1,
      message: `Rotation ${i + 1}/${n - m}: extract node`,
      relatedLines: [10],
    })

    const nextTemp = curr.next
    steps.push({
      activeLine: 11,
      arr,
      m,
      n,
      i,
      step: i + 1,
      message: `Skip the node: curr.next = next_temp.next`,
      relatedLines: [11],
    })

    curr.next = nextTemp.next
    steps.push({
      activeLine: 12,
      arr,
      m,
      n,
      i,
      step: i + 1,
      message: `Link: next_temp.next = prev.next`,
      relatedLines: [12],
    })

    nextTemp.next = prev.next
    steps.push({
      activeLine: 13,
      arr,
      m,
      n,
      i,
      step: i + 1,
      message: `Insert: prev.next = next_temp`,
      relatedLines: [13],
    })

    prev.next = nextTemp
  }

  steps.push({
    activeLine: 14,
    arr,
    m,
    n,
    result: listToArray(dummy.next),
    done: true,
    message: 'Reversal complete',
    relatedLines: [14],
  })

  return steps
}

function LinkedListDisplay({ nodes, highlighted = [] }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      {nodes.map((val, idx) => (
        <motion.div
          key={idx}
          style={{
            padding: '6px 12px',
            borderRadius: 4,
            backgroundColor: highlighted.includes(idx) ? '#fbbf24' : '#334155',
            border: '2px solid ' + (highlighted.includes(idx) ? '#f59e0b' : '#64748b'),
            fontFamily: 'monospace',
            fontWeight: 600,
            color: highlighted.includes(idx) ? '#000' : '#e2e8f0',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {val}
        </motion.div>
      ))}
      <div style={{ fontFamily: 'monospace', color: '#94a3b8' }}>→ null</div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>
          Dummy node for edge case. Reverse by rotating nodes one at a time.
        </div>
      </div>

      {step.arr && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Original List
          </div>
          <LinkedListDisplay nodes={step.arr} />
        </motion.div>
      )}

      {step.m !== undefined && step.n !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: '#92400e' }}>
            Reverse from position {step.m} to {step.n}
          </div>
        </motion.div>
      )}

      {step.moveCount !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: '#0c4a6e' }}>
            Moving prev to position: {step.moveCount}/{step.m - 1}
          </div>
        </motion.div>
      )}

      {step.step !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: '#7f1d1d' }}>
            Rotation: {step.step}/{step.n - step.m}
          </div>
        </motion.div>
      )}

      {step.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Result
          </div>
          <LinkedListDisplay nodes={step.result} />
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function ReverseLinkedListIIVisualizer() {
  const [arr, setArr] = useState([1, 2, 3, 4, 5])
  const [m, setM] = useState(2)
  const [n, setN] = useState(4)

  const steps = useMemo(() => generateSteps(arr, m, n).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [arr, m, n])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />,
      },
      {
        id: 'viz',
        title: '🔄 Reverse Section',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Controls">
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
          patternOverlayLabel="Pattern"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
