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
import './Problem541Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def reverseStr(s, k):' },
  { line: 2, text: '    s = list(s)' },
  { line: 3, text: '    for i in range(0, len(s), 2*k):' },
  { line: 4, text: '        s[i:i+k] = s[i:i+k][::-1]' },
  { line: 5, text: '    return "".join(s)' },
]

function generateSteps(s, k) {
  const steps = []
  const chars = s.split('')

  steps.push({
    activeLine: 1,
    chars: [...chars],
    k,
    message: `Reverse every ${k}th character`,
  })

  for (let i = 0; i < chars.length; i += 2 * k) {
    steps.push({
      activeLine: 3,
      chars: [...chars],
      k,
      i,
      message: `Process block starting at index ${i}`,
    })

    const end = Math.min(i + k, chars.length)
    const reversed = chars.slice(i, end).reverse()

    for (let j = 0; j < reversed.length; j++) {
      chars[i + j] = reversed[j]
    }

    steps.push({
      activeLine: 4,
      chars: [...chars],
      k,
      i,
      blockStart: i,
      blockEnd: end,
      message: `Reversed chars from ${i} to ${end - 1}`,
    })
  }

  steps.push({
    activeLine: 5,
    chars: [...chars],
    k,
    result: chars.join(''),
    message: `Return: ${chars.join('')}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: k=2', s: 'abcdefg', k: 2 },
  { label: 'Example 2: k=2', s: 'abcd', k: 2 },
  { label: 'Example 3: k=3', s: 'abcdefg', k: 3 },
]

export default function Problem541Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.s, ex.k), [ex])
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
        title: '🔄 Reverse String',
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

                  {/* K value */}
                  <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>K (Block Size)</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.k}</div>
                  </div>

                  {/* String visualization */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>String:</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {step.chars.map((char, idx) => {
                        const inBlock = step.blockStart !== undefined && idx >= step.blockStart && idx < step.blockEnd
                        const isProcessing = idx === step.i

                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              scale: inBlock ? 1.15 : 1,
                              backgroundColor: inBlock ? '#dcfce7' : isProcessing ? '#dbeafe' : '#f1f5f9',
                            }}
                            style={{
                              width: 36,
                              height: 36,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              fontWeight: 600,
                              fontSize: 14,
                              border: `2px solid ${inBlock ? '#10b981' : '#cbd5e1'}`,
                              color: '#1e293b',
                            }}
                          >
                            {char}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Result */}
                  {step.result && (
                    <motion.div
                      animate={{ scale: 1.02 }}
                      style={{
                        padding: 8,
                        backgroundColor: '#dcfce7',
                        border: '1px solid #10b981',
                        borderRadius: 4,
                        fontFamily: 'monospace',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {step.result}
                    </motion.div>
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
