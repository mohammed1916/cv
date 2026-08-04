import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem430Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('flatten-multilevel-dll', [
  { label: 'Example 1', structure: '1->2->3->null with child [7->null] at 3' },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def flatten(head):' },
  { line: 2, text: '    if not head: return head' },
  { line: 3, text: '    current = head' },
  { line: 4, text: '    while current:' },
  { line: 5, text: '        if current.child:' },
  { line: 6, text: '            next_node = current.next' },
  { line: 7, text: '            flat_child = flatten(current.child)' },
  { line: 8, text: '            current.next = flat_child' },
  { line: 9, text: '            flat_child.prev = current' },
  { line: 10, text: '            current.child = None' },
  { line: 11, text: '        current = current.next' },
  { line: 12, text: '    return head' },
]

function generateSteps(structure) {
  const steps = []

  steps.push({ activeLine: 1, message: `Start: flatten multilevel doubly linked list`, structure, head: null, flatList: [] })

  steps.push({ activeLine: 2, message: 'Check if head exists', hasHead: true })

  if (!structure || structure.trim() === '') {
    steps.push({ activeLine: 2, message: 'Head is null → return null', done: true, result: null })
    return steps
  }

  steps.push({ activeLine: 3, message: 'Initialize current pointer at head' })

  const flatList = []
  let level = 0

  // Simulate DFS traversal
  steps.push({ activeLine: 4, message: 'Start DFS: current = head', level })

  for (let i = 0; i < 6; i++) {
    const nodeVal = i + 1
    flatList.push(nodeVal)
    steps.push({ activeLine: 5, message: `Process node: val=${nodeVal}`, current: nodeVal, flatList: [...flatList] })

    if (i === 2) {
      // Simulate finding a child
      steps.push({ activeLine: 6, message: `Node ${nodeVal} has child list → save next pointer` })
      steps.push({ activeLine: 7, message: `Recursively flatten child from node ${nodeVal}`, child: 'child_list' })

      // Process child nodes
      for (let j = 0; j < 2; j++) {
        const childVal = 20 + j
        flatList.push(childVal)
        steps.push({ activeLine: 8, message: `In child DFS: process node val=${childVal}`, current: childVal, flatList: [...flatList], inChild: true })
      }

      steps.push({ activeLine: 9, message: `Child DFS complete → link back to saved next` })
    }

    steps.push({ activeLine: 10, message: `Move to next node: current = current.next`, current: nodeVal + 1, flatList: [...flatList] })
  }

  steps.push({ activeLine: 11, message: `All nodes flattened: [${flatList.join('->')}]`, flatList, done: true, result: flatList })
  return steps
}

function NodeDisplay({ val, isCurrent, isChild }) {
  return (
    <motion.div
      style={{
        width: 45,
        height: 45,
        borderRadius: 6,
        backgroundColor: isCurrent ? '#dbeafe' : isChild ? '#f3e8ff' : '#f1f5f9',
        border: isCurrent ? '3px solid #0284c7' : isChild ? '2px solid #d8b4fe' : '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700,
        color: isCurrent ? '#0c4a6e' : isChild ? '#6b21a8' : '#475569',
      }}
      animate={{ scale: isCurrent ? 1.15 : 1 }}
    >
      {val}
    </motion.div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Algorithm Overview</div>
        <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe', fontSize: 11, color: '#1e40af' }}>
          DFS-based flattening: traverse next, check for child, save next if child exists, recursively flatten child, link child tail to saved next
        </div>
      </div>

      {step?.flatList && step.flatList.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Flattened So Far</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.flatList.map((val, i) => (
              <NodeDisplay key={i} val={val} isCurrent={step.current === val && !step.inChild} isChild={step.inChild && step.flatList.indexOf(val) > 2} />
            ))}
          </div>
        </div>
      )}

      {step?.hasHead !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Head: {step.hasHead ? 'Exists ✓' : 'Null'}</div>
        </div>
      )}

      {step?.level !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Recursion Depth: {step.level}</div>
        </div>
      )}

      {step?.result && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Final Flattened List</div>
          <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#047857' }}>
            [{step.result.join(' → ')}]
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem430Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(ex.structure).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
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
    {
      id: 'viz',
      title: '🔗 Flatten Multi-level',
      content: <VisualizationPanel step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
      
    </div>
  )
}
