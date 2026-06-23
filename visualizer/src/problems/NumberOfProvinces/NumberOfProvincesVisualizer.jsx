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
import { getExamples } from '../../config/examplesRegistry'
import './NumberOfProvinces.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findCircleNum(isConnected):' },
  { line: 2, text: '    n = len(isConnected)' },
  { line: 3, text: '    parent = list(range(n))' },
  { line: 4, text: '    def find(x):' },
  { line: 5, text: '        if parent[x] != x: parent[x] = find(parent[x])' },
  { line: 6, text: '        return parent[x]' },
  { line: 7, text: '    def union(x, y):' },
  { line: 8, text: '        px, py = find(x), find(y)' },
  { line: 9, text: '        if px != py: parent[px] = py' },
  { line: 10, text: '    for i in range(n):' },
  { line: 11, text: '        for j in range(i+1, n):' },
  { line: 12, text: '            if isConnected[i][j]: union(i, j)' },
  { line: 13, text: '    return len(set(find(i) for i in range(n)))' },
]

function generateSteps(isConnected) {
  const steps = []
  const n = isConnected.length
  const parent = Array.from({ length: n }, (_, i) => i)

  steps.push({
    activeLine: 3,
    parent: [...parent],
    connections: [],
    visited: new Set(),
    message: `Initialize union-find with ${n} nodes. Each node is its own parent.`,
  })

  const find = (x) => {
    if (parent[x] === x) return x
    parent[x] = find(parent[x])
    return parent[x]
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (isConnected[i][j]) {
        const px = find(i)
        const py = find(j)

        if (px !== py) {
          parent[px] = py
          steps.push({
            activeLine: 12,
            parent: [...parent],
            connections: [[i, j]],
            visited: new Set([i, j]),
            highlighted: [i, j],
            message: `Connected(${i}, ${j}): Union roots ${px} and ${py}.`,
          })
        }
      }
    }
  }

  const roots = new Set()
  for (let i = 0; i < n; i++) {
    roots.add(find(i))
  }

  steps.push({
    activeLine: 13,
    parent: [...parent],
    connections: [],
    visited: new Set(),
    provinceCount: roots.size,
    message: `Complete. Found ${roots.size} province(s) (connected component(s)).`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Two Provinces',
    isConnected: [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 1],
    ],
  },
  {
    label: 'Example 2: Three Provinces',
    isConnected: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  },
  {
    label: 'Example 3: One Province',
    isConnected: [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ],
  },
  {
    label: 'Example 4: Complex',
    isConnected: [
      [1, 0, 0, 1],
      [0, 1, 1, 0],
      [0, 1, 1, 1],
      [1, 0, 1, 1],
    ],
  },
]

export default function NumberOfProvincesVisualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.isConnected), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const n = ex.isConnected.length

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
      title: '🔗 Union-Find Graph',
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
                {e.label.split(':')[0]}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Union-Find State:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({ length: n }).map((_, i) => {
                    const parent = step.parent[i]
                    const isHighlighted = step.highlighted?.includes(i)
                    const isRoot = parent === i
                    return (
                      <motion.div
                        key={i}
                        animate={{ scale: isHighlighted ? 1.15 : 1 }}
                        style={{
                          padding: 8,
                          borderRadius: 4,
                          border: isHighlighted ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                          backgroundColor: isHighlighted ? '#0ea5e9' : isRoot ? '#dcfce7' : '#f1f5f9',
                          color: isHighlighted ? '#fff' : '#1e293b',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {i} → {parent !== i ? parent : 'ROOT'}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#f0fdf4', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#166534' }}>Adjacency Matrix:</div>
                <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4 }}>
                  {Array.from({ length: n }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: n }).map((_, j) => {
                        const isConnected = ex.isConnected[i][j] === 1
                        const isHighlighted = step.highlighted?.includes(i) && step.highlighted?.includes(j)
                        return (
                          <motion.div
                            key={`${i}-${j}`}
                            animate={{ scale: isHighlighted ? 1.2 : 1 }}
                            style={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              border: isHighlighted ? '2px solid #ef4444' : '1px solid #cbd5e1',
                              backgroundColor: isHighlighted ? '#ef4444' : isConnected ? '#dcfce7' : '#f5f5f5',
                              color: isHighlighted ? '#fff' : '#1e293b',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {ex.isConnected[i][j]}
                          </motion.div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {step.provinceCount !== undefined && (
                <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                  Provinces Found: {step.provinceCount}
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, n, ex])

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
