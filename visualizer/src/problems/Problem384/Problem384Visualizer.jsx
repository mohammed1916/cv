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
import './Problem384Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self, nums):' },
  { line: 3, text: '        self.original = nums' },
  { line: 4, text: '        self.array = nums[:]' },
  { line: 5, text: '    def shuffle(self):' },
  { line: 6, text: '        # Fisher-Yates shuffle' },
  { line: 7, text: '        for i in range(len(self.array) - 1, 0, -1):' },
  { line: 8, text: '            j = random.randint(0, i)' },
  { line: 9, text: '            self.array[i], self.array[j] = ...' },
  { line: 10, text: '            self.array[j], self.array[i]' },
  { line: 11, text: '        return self.array' },
  { line: 12, text: '    def reset(self):' },
  { line: 13, text: '        self.array = self.original[:]' },
  { line: 14, text: '        return self.array' },
]

function generateSteps(nums) {
  const steps = []
  const array = [...nums]
  const original = [...nums]

  // Step 1: Initialize
  steps.push({
    activeLine: 2,
    phase: 'init',
    original,
    array: [...array],
    swapI: -1,
    swapJ: -1,
    message: 'Initialize array and store original copy',
  })

  // Step 2: Start shuffle
  steps.push({
    activeLine: 7,
    phase: 'shuffle',
    original,
    array: [...array],
    swapI: -1,
    swapJ: -1,
    message: 'Begin Fisher-Yates shuffle from end to start',
  })

  // Step 3: Process each position
  for (let i = array.length - 1; i > 0; i--) {
    // Select random j
    const j = Math.floor(Math.random() * (i + 1))

    steps.push({
      activeLine: 8,
      phase: 'select',
      original,
      array: [...array],
      swapI: i,
      swapJ: j,
      message: `Select random index j=${j} for position i=${i}`,
    })

    // Swap
    steps.push({
      activeLine: 9,
      phase: 'swap',
      original,
      array: [...array],
      swapI: i,
      swapJ: j,
      message: `Swap array[${i}]=${array[i]} with array[${j}]=${array[j]}`,
    })

    ;[array[i], array[j]] = [array[j], array[i]]

    steps.push({
      activeLine: 11,
      phase: 'swap',
      original,
      array: [...array],
      swapI: -1,
      swapJ: -1,
      message: `After swap: array = [${array.join(', ')}]`,
    })
  }

  // Complete
  steps.push({
    activeLine: 11,
    phase: 'complete',
    original,
    array: [...array],
    swapI: -1,
    swapJ: -1,
    message: 'Shuffle complete! Each permutation equally likely',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Small Array',
    nums: [1, 2, 3],
  },
  {
    label: 'Larger Array',
    nums: [1, 2, 3, 4, 5],
  },
  {
    label: 'Single Element',
    nums: [42],
  },
]

export default function Problem384Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.nums), [ex])
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
      title: '🔀 Fisher-Yates Shuffle',
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

              {/* Original Array */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Original</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.original.map((val, idx) => (
                    <div
                      key={`orig-${idx}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Array */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Current State</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.array.map((val, idx) => {
                    let bgColor = '#f1f5f9'
                    let borderColor = '#cbd5e1'
                    let textColor = '#334155'

                    if (idx === step.swapI) {
                      bgColor = '#fed7aa'
                      borderColor = '#f59e0b'
                      textColor = '#92400e'
                    } else if (idx === step.swapJ) {
                      bgColor = '#fca5a5'
                      borderColor = '#ef4444'
                      textColor = '#991b1b'
                    }

                    return (
                      <motion.div
                        key={`arr-${idx}`}
                        animate={{
                          scale: idx === step.swapI || idx === step.swapJ ? 1.15 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: `2px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          fontSize: 12,
                          fontWeight: 600,
                          color: textColor,
                          minWidth: 45,
                          textAlign: 'center',
                        }}
                      >
                        {val}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Swap Information */}
              {step.phase === 'select' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>
                    Randomly select j from [0, {step.swapI}]
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                    j = {step.swapJ}
                  </div>
                </motion.div>
              )}

              {step.phase === 'swap' && step.swapI !== -1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e' }}>
                    Swap positions {step.swapI} and {step.swapJ}
                  </div>
                </motion.div>
              )}

              {/* Algorithm explanation */}
              {step.phase === 'shuffle' && (
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
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Fisher-Yates Shuffle:</div>
                  <div>
                    Iterate from end to start. For each position i, pick random j in [0, i] and swap.
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
                  ✓ Complete! Time: O(n), Space: O(1), Fair randomization
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
