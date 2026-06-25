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
import './ConvertSortedListToBinarySearchTreeVisualizer.css'

const EXAMPLES = getExamples('convert-sorted-list-to-binary-search-tree') || [
  { label: 'Example 1', list: [1, 2, 3, 4, 5, 6] },
  { label: 'Example 2', list: [-10, -3, 0, 5, 9] },
  { label: 'Example 3', list: [] },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def sortedListToBST(head):' },
  { line: 2, text: '    def build(nodes):' },
  { line: 3, text: '        if not nodes: return None' },
  { line: 4, text: '        mid = len(nodes) // 2' },
  { line: 5, text: '        node = TreeNode(nodes[mid])' },
  { line: 6, text: '        node.left = build(nodes[:mid])' },
  { line: 7, text: '        node.right = build(nodes[mid+1:])' },
  { line: 8, text: '        return node' },
  { line: 9, text: '    nodes = []' },
  { line: 10, text: '    curr = head' },
  { line: 11, text: '    while curr:' },
  { line: 12, text: '        nodes.append(curr.val)' },
  { line: 13, text: '        curr = curr.next' },
  { line: 14, text: '    return build(nodes)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(list) {
  const steps = []

  if (!list || list.length === 0) {
    steps.push({
      activeLine: 3,
      list: [],
      nodes: [],
      message: 'Empty list → return None',
      relatedLines: [3],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    list,
    nodes: [],
    message: `Convert list ${JSON.stringify(list)} to balanced BST`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 9,
    list,
    nodes: [...list],
    message: 'Extract list values into array',
    relatedLines: [9, 10, 11, 12, 13],
  })

  const buildTree = (nodes, depth = 0) => {
    if (!nodes || nodes.length === 0) return null

    const mid = Math.floor(nodes.length / 2)
    const val = nodes[mid]

    steps.push({
      activeLine: 4,
      list,
      nodes,
      mid,
      midVal: val,
      depth,
      message: `Mid index: ${mid}, value: ${val} (from ${nodes.length} elements)`,
      relatedLines: [4, 5],
    })

    const left = nodes.slice(0, mid)
    const right = nodes.slice(mid + 1)

    if (left.length > 0) {
      steps.push({
        activeLine: 6,
        list,
        nodes,
        mid,
        midVal: val,
        left,
        depth,
        message: `Left subtree: [${left.join(', ')}]`,
        relatedLines: [6],
      })
      buildTree(left, depth + 1)
    }

    if (right.length > 0) {
      steps.push({
        activeLine: 7,
        list,
        nodes,
        mid,
        midVal: val,
        right,
        depth,
        message: `Right subtree: [${right.join(', ')}]`,
        relatedLines: [7],
      })
      buildTree(right, depth + 1)
    }

    return { val, left: null, right: null }
  }

  buildTree(list)

  steps.push({
    activeLine: 14,
    list,
    nodes: list,
    done: true,
    message: 'Balanced BST construction complete',
    relatedLines: [14],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          Use middle element as root to balance the tree recursively.
        </div>
      </div>

      {step.list && step.list.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>
            Sorted List
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
            {step.list.map((val, idx) => (
              <motion.span
                key={idx}
                style={{
                  padding: '4px 8px',
                  borderRadius: 3,
                  backgroundColor: step.midVal === val ? '#c7d2fe' : '#e0e7ff',
                  border: step.midVal === val ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                  fontWeight: step.midVal === val ? 700 : 500,
                }}
                animate={{ scale: step.midVal === val ? 1.15 : 1 }}
              >
                {val}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {(step.left || step.right) && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Subtrees</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {step.left && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Left: [{step.left.join(', ')}]</div>
              </div>
            )}
            {step.right && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#0c4a6e', marginBottom: 4 }}>Right: [{step.right.join(', ')}]</div>
              </div>
            )}
          </div>
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

export default function ConvertSortedListToBinarySearchTreeVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.list || [1, 2, 3, 4, 5, 6])
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.list); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🌳 List to BST',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

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
