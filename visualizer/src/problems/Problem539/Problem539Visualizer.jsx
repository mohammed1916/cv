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
import './Problem539Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findMinDifference(times):' },
  { line: 2, text: '    def time_to_mins(t):' },
  { line: 3, text: '        h, m = map(int, t.split(":"))' },
  { line: 4, text: '        return h * 60 + m' },
  { line: 5, text: '    mins = [time_to_mins(t) for t in times]' },
  { line: 6, text: '    mins.sort()' },
  { line: 7, text: '    min_diff = float("inf")' },
  { line: 8, text: '    for i in range(len(mins)):' },
  { line: 9, text: '        diff = (mins[(i+1)%len(mins)] - mins[i]) % (24*60)' },
  { line: 10, text: '        min_diff = min(min_diff, diff)' },
  { line: 11, text: '    return min_diff' },
]

function generateSteps(times) {
  const steps = []

  steps.push({
    activeLine: 1,
    times,
    message: 'Find minimum time difference between any two times.',
  })

  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  const mins = times.map(toMins)
  steps.push({
    activeLine: 5,
    times,
    mins,
    message: `Convert to minutes: [${mins.join(', ')}]`,
  })

  mins.sort((a, b) => a - b)
  steps.push({
    activeLine: 6,
    times,
    mins,
    message: `Sorted: [${mins.join(', ')}]`,
  })

  let minDiff = Infinity

  for (let i = 0; i < mins.length; i++) {
    const nextIdx = (i + 1) % mins.length
    const diff = (mins[nextIdx] - mins[i] + 24 * 60) % (24 * 60)
    minDiff = Math.min(minDiff, diff)

    steps.push({
      activeLine: 9,
      times,
      mins,
      i,
      nextIdx,
      diff,
      minDiff,
      message: `Compare ${mins[i]} and ${mins[nextIdx]}: diff=${diff}`,
    })
  }

  steps.push({
    activeLine: 11,
    times,
    mins,
    minDiff,
    message: `Return minimum difference: ${minDiff}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', times: ['23:59', '00:00'] },
  { label: 'Example 2', times: ['00:00', '04:00', '14:23'] },
  { label: 'Example 3', times: ['12:12', '00:13', '07:09'] },
]

export default function Problem539Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.times), [ex])
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
        title: '⏱️ Minimum Time Difference',
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

                  {/* Input times */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Input Times:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {step.times.map((t, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                            fontFamily: 'monospace',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Converted minutes */}
                  {step.mins && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>As Minutes:</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.mins.map((m, i) => (
                          <motion.span
                            key={i}
                            animate={{
                              scale: i === step.i || i === step.nextIdx ? 1.15 : 1,
                              backgroundColor:
                                i === step.i
                                  ? '#dbeafe'
                                  : i === step.nextIdx
                                  ? '#fef3c7'
                                  : '#f1f5f9',
                            }}
                            style={{
                              padding: '4px 8px',
                              border: `1px solid ${i === step.i || i === step.nextIdx ? '#0ea5e9' : '#cbd5e1'}`,
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                              fontFamily: 'monospace',
                            }}
                          >
                            {m}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current difference */}
                  {step.diff !== undefined && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Current Diff</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.diff}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Min Diff</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>
                          {step.minDiff === Infinity ? '-' : step.minDiff}
                        </div>
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
