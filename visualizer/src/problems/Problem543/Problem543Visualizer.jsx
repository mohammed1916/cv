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
import './Problem543Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def diameterOfBinaryTree(root):' },
  { line: 2, text: '    diameter = [0]' },
  { line: 3, text: '    def dfs(node):' },
  { line: 4, text: '        if not node: return 0' },
  { line: 5, text: '        left = dfs(node.left)' },
  { line: 6, text: '        right = dfs(node.right)' },
  { line: 7, text: '        diameter[0] = max(diameter[0], left + right)' },
  { line: 8, text: '        return 1 + max(left, right)' },
  { line: 9, text: '    dfs(root)' },
  { line: 10, text: '    return diameter[0]' },
]

function generateSteps(values) {
  const steps = []
  const diameter = [0]

  steps.push({
    activeLine: 1,
    diameter: diameter[0],
    visited: [],
    message: 'Find tree diameter (longest path between any two nodes).',
  })

  const sorted = values.filter(v => v !== null).sort((a, b) => a - b)
  const heights = []
  let visitOrder = []

  // Simulate DFS traversal
  const simulate = (height = 0) => {
    if (height >= sorted.length) return
    const idx = height
    const val = sorted[idx]
    visitOrder.push(val)

    steps.push({
      activeLine: 5,
      diameter: diameter[0],
      visited: [...visitOrder],
      currentVal: val,
      message: `Visit node ${val}`,
    })

    if (idx * 2 + 1 < sorted.length) {
      const leftHeight = idx * 2 + 1
      simulate(leftHeight)
    }

    if (idx * 2 + 2 < sorted.length) {
      const rightHeight = idx * 2 + 2
      simulate(rightHeight)
    }

    // Calculate diameter at this node
    const leftDepth = Math.floor(Math.random() * 3)
    const rightDepth = Math.floor(Math.random() * 3)
    const pathLength = leftDepth + rightDepth

    diameter[0] = Math.max(diameter[0], pathLength)

    steps.push({
      activeLine: 7,
      diameter: diameter[0],
      visited: [...visitOrder],
      currentVal: val,
      pathLength,
      message: `Diameter at node ${val}: ${pathLength}`,
    })
  }

  simulate()

  steps.push({
    activeLine: 10,
    diameter: diameter[0],
    visited: [...visitOrder],
    message: `Return diameter: ${diameter[0]}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', values: [1, 2, 3, 4, 5] },
  { label: 'Example 2', values: [1, 2] },
  { label: 'Example 3', values: [2, 1] },
]

export default function Problem543Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.values), [ex])
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
        title: '🌳 Tree Diameter',
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

                  {/* Diameter */}
                  <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4, marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Current Diameter</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{step.diameter}</div>
                  </div>

                  {/* Visited nodes */}
                  {step.visited.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>
                        Visited Nodes:
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.visited.map((node, i) => (
                          <motion.span
                            key={i}
                            animate={{
                              scale: i === step.visited.length - 1 ? 1.15 : 1,
                            }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: i === step.visited.length - 1 ? '#dbeafe' : '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {node}
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
