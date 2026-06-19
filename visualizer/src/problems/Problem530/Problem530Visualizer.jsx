import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem530Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def getMinimumDifference(root):' },
  { line: 2, text: '    min_diff = [float("inf")]' },
  { line: 3, text: '    prev = [None]' },
  { line: 4, text: '    def inorder(node):' },
  { line: 5, text: '        if not node: return' },
  { line: 6, text: '        inorder(node.left)' },
  { line: 7, text: '        if prev[0]: min_diff[0] = min(min_diff[0], node.val - prev[0])' },
  { line: 8, text: '        prev[0] = node.val' },
  { line: 9, text: '        inorder(node.right)' },
  { line: 10, text: '    inorder(root)' },
  { line: 11, text: '    return min_diff[0]' },
]

function generateSteps(treeValues) {
  const steps = []
  const sorted = [...treeValues].sort((a, b) => a - b)
  const visited = []
  let minDiff = Infinity
  let prev = null

  steps.push({
    activeLine: 1,
    visited: [],
    minDiff: Infinity,
    prev: null,
    message: 'Start in-order traversal of BST',
  })

  sorted.forEach((val, idx) => {
    steps.push({
      activeLine: 6,
      visited: [...visited],
      minDiff,
      prev,
      currentVal: val,
      message: `Visit node with value ${val}`,
    })

    if (prev !== null) {
      const diff = val - prev
      minDiff = Math.min(minDiff, diff)
      steps.push({
        activeLine: 7,
        visited: [...visited, val],
        minDiff,
        prev,
        currentVal: val,
        diff,
        message: `Calculate difference: ${val} - ${prev} = ${diff}. Min so far: ${minDiff}`,
      })
    }

    visited.push(val)
    prev = val

    steps.push({
      activeLine: 8,
      visited: [...visited],
      minDiff,
      prev,
      currentVal: val,
      message: `Update previous value to ${val}`,
    })
  })

  steps.push({
    activeLine: 11,
    visited: [...visited],
    minDiff,
    prev,
    message: `Return minimum difference: ${minDiff}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', values: [4, 2, 6, 1, 3] },
  { label: 'Example 2', values: [1, 0, 48, null, null, 12, 49] },
  { label: 'Example 3', values: [236, 104, 701, null, 227, null, 911] },
]

export default function Problem530Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.values.filter(v => v !== null)), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '🌳 In-Order Traversal',
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

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Current</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>
                        {step.currentVal ?? '-'}
                      </div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Previous</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>
                        {step.prev ?? '-'}
                      </div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Min Diff</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                        {step.minDiff === Infinity ? '-' : step.minDiff}
                      </div>
                    </div>
                  </div>

                  {/* Visited Nodes */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>
                      In-Order Traversal:
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {step.visited.map((val, idx) => (
                        <motion.div
                          key={idx}
                          animate={{ scale: idx === step.visited.length - 1 ? 1.15 : 1 }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: idx === step.visited.length - 1 ? '#dbeafe' : '#f1f5f9',
                            border: `1px solid ${idx === step.visited.length - 1 ? '#0ea5e9' : '#cbd5e1'}`,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                          }}
                        >
                          {val}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Difference display */}
                  {step.diff !== undefined && (
                    <div style={{ padding: 6, backgroundColor: '#f0fdf4', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Difference</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>
                        {step.currentVal} - {step.prev} = {step.diff}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample]
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
