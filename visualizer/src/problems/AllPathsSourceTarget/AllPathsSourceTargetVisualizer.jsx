import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './AllPathsSourceTarget.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def allPathsSourceTarget(graph):' },
  { line: 2, text: '    res = []' },
  { line: 3, text: '    def dfs(node, path):' },
  { line: 4, text: '        if node == len(graph) - 1:' },
  { line: 5, text: '            res.append(path)' },
  { line: 6, text: '            return' },
  { line: 7, text: '        for neighbor in graph[node]:' },
  { line: 8, text: '            dfs(neighbor, path + [neighbor])' },
  { line: 9, text: '    dfs(0, [0])' },
  { line: 10, text: '    return res' },
]

function generateSteps(graph) {
  const steps = []
  const target = graph.length - 1
  const allPaths = []
  const stack = [[0, [0]]] // [currentNode, path]
  const visited = new Map()
  let stepNum = 0

  steps.push({
    activeLine: 2,
    currentNode: null,
    currentPath: [],
    allPaths: [],
    stack: [],
    message: `Initialize: Start DFS from node 0 to find all paths to node ${target}.`,
  })

  // Simulate DFS using stack
  while (stack.length > 0) {
    const [node, path] = stack.pop()

    steps.push({
      activeLine: 4,
      currentNode: node,
      currentPath: path,
      allPaths: [...allPaths],
      stack: stack.map(([n, p]) => ({ node: n, path: p })),
      message: `Visit node ${node} with path ${JSON.stringify(path)}. Check if target reached.`,
    })

    if (node === target) {
      allPaths.push([...path])
      steps.push({
        activeLine: 5,
        currentNode: node,
        currentPath: path,
        allPaths: [...allPaths],
        stack: stack.map(([n, p]) => ({ node: n, path: p })),
        message: `Found complete path: ${JSON.stringify(path)}`,
        isCompletePath: true,
      })
      continue
    }

    steps.push({
      activeLine: 7,
      currentNode: node,
      currentPath: path,
      allPaths: [...allPaths],
      stack: stack.map(([n, p]) => ({ node: n, path: p })),
      message: `Explore neighbors of node ${node}: ${JSON.stringify(graph[node])}`,
    })

    const neighbors = graph[node]
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i]
      const newPath = [...path, neighbor]
      stack.push([neighbor, newPath])

      steps.push({
        activeLine: 8,
        currentNode: node,
        currentPath: path,
        nextNode: neighbor,
        nextPath: newPath,
        allPaths: [...allPaths],
        stack: stack.map(([n, p]) => ({ node: n, path: p })),
        message: `Add neighbor ${neighbor} to stack with path ${JSON.stringify(newPath)}`,
      })
    }
  }

  steps.push({
    activeLine: 10,
    currentNode: null,
    currentPath: [],
    allPaths: [...allPaths],
    stack: [],
    message: `DFS complete. Found ${allPaths.length} paths total.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    graph: [[1, 2], [3], [3], []],
  },
  {
    label: 'Example 2',
    graph: [[4, 3, 1], [3, 2, 4], [3], [4], []],
  },
  {
    label: 'Example 3',
    graph: [[1], [2, 3], [], []],
  },
]

export default function AllPathsSourceTargetVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const SOLUTION_CODE_HOOK = useSolutionCode('all-paths-source-target')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.graph), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const getNodePosition = (idx, total) => {
    const cols = Math.ceil(Math.sqrt(total))
    const x = 40 + (idx % cols) * 80
    const y = 40 + Math.floor(idx / cols) * 80
    return { x, y }
  }

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
      title: '🌳 Path Visualization',
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
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                {step.message}
              </div>

              <svg width="100%" height="280" viewBox="0 0 500 280" style={{ border: '1px solid #e2e8f0', borderRadius: 6 }}>
                <defs>
                  <marker
                    id="arrowDefault"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
                  </marker>
                  <marker
                    id="arrowHighlight"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#14b8a6" />
                  </marker>
                </defs>

                {/* Draw edges */}
                {ex.graph.map((neighbors, from) => {
                  const fromPos = getNodePosition(from, ex.graph.length)
                  return neighbors.map((to) => {
                    const toPos = getNodePosition(to, ex.graph.length)
                    const isHighlighted = step.nextNode === to && step.currentNode === from
                    return (
                      <motion.line
                        key={`edge-${from}-${to}`}
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke={isHighlighted ? '#14b8a6' : '#cbd5e1'}
                        strokeWidth={isHighlighted ? 3 : 2}
                        markerEnd={`url(#arrow${isHighlighted ? 'Highlight' : 'Default'})`}
                        animate={{ strokeWidth: isHighlighted ? 3 : 2 }}
                      />
                    )
                  })
                })}

                {/* Draw nodes */}
                {ex.graph.map((_, idx) => {
                  const pos = getNodePosition(idx, ex.graph.length)
                  const isSource = idx === 0
                  const isTarget = idx === ex.graph.length - 1
                  const isCurrentNode = step.currentNode === idx
                  const isNextNode = step.nextNode === idx
                  const isInPath = step.currentPath.includes(idx) || step.nextPath?.includes(idx)

                  return (
                    <motion.g
                      key={`node-${idx}`}
                      animate={{
                        scale: isCurrentNode || isNextNode ? 1.3 : isInPath ? 1.1 : 1,
                      }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={20}
                        fill={
                          isCurrentNode
                            ? '#fbbf24'
                            : isNextNode
                              ? '#f87171'
                              : isTarget
                                ? '#10b981'
                                : isSource
                                  ? '#3b82f6'
                                  : isInPath
                                    ? '#60a5fa'
                                    : '#e2e8f0'
                        }
                        stroke={isCurrentNode || isNextNode ? '#dc2626' : '#64748b'}
                        strokeWidth={isCurrentNode || isNextNode ? 3 : 2}
                      />
                      <text
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        dy="0.3em"
                        fill={isInPath || isSource || isTarget ? '#fff' : '#334155'}
                        fontWeight="bold"
                        fontSize="14"
                      >
                        {idx}
                      </text>
                    </motion.g>
                  )
                })}
              </svg>

              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Current State:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div>
                      <strong>Current Node:</strong> {step.currentNode !== null ? step.currentNode : 'None'}
                    </div>
                    <div>
                      <strong>Current Path:</strong> {JSON.stringify(step.currentPath)}
                    </div>
                    {step.stack.length > 0 && (
                      <div>
                        <strong>Stack Depth:</strong> {step.stack.length}
                      </div>
                    )}
                    <div>
                      <strong>Paths Found:</strong> {step.allPaths.length}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {step.allPaths.length > 0 && (
                <div style={{ padding: 8, backgroundColor: '#d1fae5', borderRadius: 6, fontSize: 10, maxHeight: 120, overflow: 'auto' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: '#047857' }}>Found Paths ({step.allPaths.length}):</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {step.allPaths.map((path, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          padding: 4,
                          backgroundColor: '#f0fdf4',
                          border: '1px solid #6ee7b7',
                          borderRadius: 3,
                          color: '#065f46',
                        }}
                      >
                        {path.join(' → ')}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.graph, stepIndex])

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
