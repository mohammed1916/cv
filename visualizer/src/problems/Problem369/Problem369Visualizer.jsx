import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem369Visualizer.css'

const EXAMPLES = getExamples('plus-one-linked-list') || [
  { label: 'Example 1: 999→1000', values: [9, 9, 9] },
  { label: 'Example 2: 123→124', values: [1, 2, 3] },
]

// Build linked list from array of values
function buildList(values) {
  if (!values || values.length === 0) return null
  let head = { val: values[0], next: null, id: 0 }
  let current = head
  for (let i = 1; i < values.length; i++) {
    current.next = { val: values[i], next: null, id: i }
    current = current.next
  }
  return head
}

function listToArray(head) {
  const arr = []
  let node = head
  while (node) { arr.push(node); node = node.next }
  return arr
}

function generateSteps(head) {
  const steps = []
  if (!head) {
    steps.push({ activeLine: 1, list: [], message: 'Empty list → return empty' })
    return steps
  }

  const nodes = listToArray(head)
  const list = nodes.map(n => ({ val: n.val, id: n.id, modified: false }))

  steps.push({
    activeLine: 2,
    list: list.map(n => ({ ...n })),
    current: null,
    message: 'Initialize: find rightmost non-9 node',
  })

  let notNine = null
  let notNineIdx = -1
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].val !== 9) {
      notNine = nodes[i]
      notNineIdx = i
      break
    }
  }

  if (notNineIdx === -1) {
    // All 9s — need to insert new node
    list.unshift({ val: 1, id: -1, modified: true })
    steps.push({
      activeLine: 7,
      list: list.map(n => ({ ...n })),
      current: -1,
      message: 'All digits are 9 → insert new node [1] at head',
    })
    steps.push({
      activeLine: 8,
      list: list.map(n => ({ ...n })),
      done: true,
      message: `Result: [${list.map(n => n.val).join(', ')}]`,
    })
  } else {
    steps.push({
      activeLine: 5,
      list: list.map(n => ({ ...n })),
      current: notNineIdx,
      message: `Found non-9 at index ${notNineIdx}: value ${nodes[notNineIdx].val}`,
    })

    // Increment the notNine node
    list[notNineIdx].val += 1
    list[notNineIdx].modified = true
    steps.push({
      activeLine: 6,
      list: list.map(n => ({ ...n })),
      current: notNineIdx,
      message: `Increment: ${nodes[notNineIdx].val} → ${nodes[notNineIdx].val + 1}`,
    })

    // Set all nodes after notNine to 0
    for (let i = notNineIdx + 1; i < list.length; i++) {
      list[i].val = 0
      list[i].modified = true
      steps.push({
        activeLine: 7,
        list: list.map(n => ({ ...n })),
        current: i,
        message: `Set digit at index ${i} to 0`,
      })
    }

    steps.push({
      activeLine: 8,
      list: list.map(n => ({ ...n })),
      done: true,
      message: `Result: [${list.map(n => n.val).join(', ')}]`,
    })
  }

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#1e40af', fontSize: 13 }}>Press play to add one to the number.</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #1e40af' }}>
        <div style={{ fontSize: 12, color: '#1e3a8a', fontStyle: 'italic' }}>
          Find the rightmost non-9 node, increment it, and zero out all following nodes. Handle edge case: all 9s.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(step.list || []).map((node, idx) => {
          const isCurrent = step.current === node.id || (step.current === idx && node.id === undefined)
          return (
            <motion.div key={`${node.id}-${idx}`}
              style={{
                width: 40, height: 40, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
                backgroundColor: isCurrent ? '#1e40af' : node.modified ? '#93c5fd' : '#dbeafe',
                color: isCurrent ? '#fff' : '#1e3a8a',
                border: isCurrent ? '2px solid #1e3a8a' : '1px solid #60a5fa',
              }}
              animate={{ scale: isCurrent ? 1.15 : 1 }}
            >
              {node.val}
            </motion.div>
          )
        })}
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #1e40af', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#1e40af' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem369Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const head = useMemo(() => buildList(ex.values), [ex])
  const steps = useMemo(
    () => generateSteps(head).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [head]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
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
    { id: 'viz', title: '🔗 Plus One', content: (<VisualizationPanel step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, head])
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
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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
