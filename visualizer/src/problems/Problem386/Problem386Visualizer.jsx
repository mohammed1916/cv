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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem386Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def lexicalOrder(n):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    def dfs(num):' },
  { line: 4, text: '        if num > n:' },
  { line: 5, text: '            return' },
  { line: 6, text: '        result.append(num)' },
  { line: 7, text: '        # Try appending each digit 0-9' },
  { line: 8, text: '        for i in range(10):' },
  { line: 9, text: '            dfs(num * 10 + i)' },
  { line: 10, text: '    # Start DFS from 1-9' },
  { line: 11, text: '    for i in range(1, 10):' },
  { line: 12, text: '        dfs(i)' },
  { line: 13, text: '    return result' },
]

function generateSteps(n) {
  const steps = []
  const result = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    n,
    result: [],
    current: null,
    depth: 0,
    message: `Generate lexicographical numbers up to ${n}`,
  })

  steps.push({
    activeLine: 11,
    phase: 'start_dfs',
    n,
    result: [],
    current: null,
    depth: 0,
    message: 'Start DFS from digits 1-9',
  })

  // Helper to do DFS
  const dfs = (num, depth = 0) => {
    if (num > n) return

    result.push(num)

    steps.push({
      activeLine: 6,
      phase: 'add_number',
      n,
      result: [...result],
      current: num,
      depth,
      message: `Add ${num} to result (depth ${depth})`,
    })

    // Try each digit 0-9
    for (let i = 0; i < 10; i++) {
      const nextNum = num * 10 + i
      if (nextNum > n) break

      steps.push({
        activeLine: 8,
        phase: 'try_digit',
        n,
        result: [...result],
        current: num,
        depth,
        nextDigit: i,
        message: `Try appending digit ${i}: ${num} * 10 + ${i} = ${nextNum}`,
      })

      dfs(nextNum, depth + 1)
    }

    steps.push({
      activeLine: 4,
      phase: 'backtrack',
      n,
      result: [...result],
      current: num,
      depth,
      message: `Backtrack from ${num}`,
    })
  }

  // Start with digits 1-9
  for (let i = 1; i <= 9; i++) {
    if (i > n) break

    steps.push({
      activeLine: 11,
      phase: 'start_digit',
      n,
      result: [...result],
      current: i,
      depth: 0,
      message: `Start DFS with digit ${i}`,
    })

    dfs(i)
  }

  steps.push({
    activeLine: 13,
    phase: 'complete',
    n,
    result: [...result],
    current: null,
    depth: 0,
    message: `Complete! Generated ${result.length} numbers`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'n=13',
    n: 13,
  },
  {
    label: 'n=100',
    n: 100,
  },
  {
    label: 'n=2',
    n: 2,
  },
]

export default function Problem386Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.n), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

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
      title: '🔢 Lexicographical DFS',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
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
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>n (limit)</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.n}</div>
                </div>
                <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>Count</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>{step.result.length}</div>
                </div>
              </div>

              {/* Current number being processed */}
              {step.current !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#f0fdf4',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    Current: {step.current} (Depth: {step.depth})
                  </div>
                </motion.div>
              )}

              {/* Next digit to try */}
              {step.nextDigit !== undefined && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#eff6ff',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>
                    Trying digit: {step.nextDigit}
                  </div>
                </motion.div>
              )}

              {/* Result list */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                  Generated Numbers ({step.result.length})
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.result.slice(0, 20).map((num, idx) => (
                    <motion.div
                      key={`num-${idx}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        backgroundColor: step.current === num ? '#fbbf24' : '#dcfce7',
                        border:
                          step.current === num
                            ? '2px solid #f59e0b'
                            : '2px solid #10b981',
                        fontSize: 12,
                        fontWeight: 600,
                        color: step.current === num ? '#78350f' : '#047857',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                  {step.result.length > 20 && (
                    <div style={{ padding: '6px 10px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                      ... ({step.result.length - 20} more)
                    </div>
                  )}
                </div>
              </div>

              {/* Algorithm explanation */}
              {step.phase === 'start_dfs' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>DFS Approach:</div>
                  <div>
                    From each number, append digits 0-9. This naturally generates numbers in lexicographical order.
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Complete! Time: O(n), Space: O(n)
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

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
