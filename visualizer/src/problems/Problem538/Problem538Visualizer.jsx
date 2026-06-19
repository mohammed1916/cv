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
import './Problem538Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def convertBST(root):' },
  { line: 2, text: '    cumsum = [0]' },
  { line: 3, text: '    def reverse_inorder(node):' },
  { line: 4, text: '        if not node: return' },
  { line: 5, text: '        reverse_inorder(node.right)' },
  { line: 6, text: '        cumsum[0] += node.val' },
  { line: 7, text: '        node.val = cumsum[0]' },
  { line: 8, text: '        reverse_inorder(node.left)' },
  { line: 9, text: '    reverse_inorder(root)' },
  { line: 10, text: '    return root' },
]

function generateSteps(values) {
  const steps = []
  const sorted = [...values].sort((a, b) => b - a) // Reverse sorted for reverse in-order
  let cumsum = 0
  const result = []

  steps.push({
    activeLine: 1,
    cumsum: 0,
    result: [],
    message: 'Convert BST to Greater Tree using reverse in-order traversal.',
  })

  sorted.forEach((val) => {
    cumsum += val
    result.push(`${val}→${cumsum}`)

    steps.push({
      activeLine: 6,
      cumsum,
      result: [...result],
      currentVal: val,
      message: `Visit ${val}: cumsum = ${cumsum}`,
    })

    steps.push({
      activeLine: 7,
      cumsum,
      result: [...result],
      currentVal: val,
      message: `Update node value: ${val} → ${cumsum}`,
    })
  })

  steps.push({
    activeLine: 10,
    cumsum,
    result: [...result],
    message: `Traversal complete`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', values: [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8] },
  { label: 'Example 2', values: [0, null, 1] },
]

export default function Problem538Visualizer() {
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
        title: '🌳 BST to Greater Tree',
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

                  {/* Cumsum */}
                  <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Cumulative Sum</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.cumsum}</div>
                  </div>

                  {/* Transformations */}
                  {step.result.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Transformations:</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.result.map((trans, i) => (
                          <motion.span
                            key={i}
                            animate={{ scale: i === step.result.length - 1 ? 1.15 : 1 }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: i === step.result.length - 1 ? '#dcfce7' : '#dbeafe',
                              border: '1px solid #10b981',
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                              fontFamily: 'monospace',
                            }}
                          >
                            {trans}
                          </motion.span>
                        ))}
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
