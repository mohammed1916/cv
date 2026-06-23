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
import './Problem362.css'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class HitCounter:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.hits = deque()' },
  { line: 4, text: '    def hit(self, timestamp):' },
  { line: 5, text: '        self.hits.append(timestamp)' },
  { line: 6, text: '    def getHits(self, timestamp):' },
  { line: 7, text: '        while self.hits and' },
  { line: 8, text: '              self.hits[0] <= timestamp - 300:' },
  { line: 9, text: '            self.hits.popleft()' },
  { line: 10, text: '        return len(self.hits)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps() {
  const steps = []

  // Example 1: Simple sequence
  steps.push({
    activeLine: 2,
    hits: [],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'Initialize: Empty queue to store hit timestamps.',
    exampleNum: 1,
  })

  // Hit at 1
  steps.push({
    activeLine: 5,
    hits: [1],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'hit(1): Add timestamp 1 to queue.',
    exampleNum: 1,
  })

  // Hit at 100
  steps.push({
    activeLine: 5,
    hits: [1, 100],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'hit(100): Add timestamp 100 to queue.',
    exampleNum: 1,
  })

  // Hit at 150
  steps.push({
    activeLine: 5,
    hits: [1, 100, 150],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'hit(150): Add timestamp 150 to queue.',
    exampleNum: 1,
  })

  // getHits(150) - window [0, 150]
  steps.push({
    activeLine: 6,
    hits: [1, 100, 150],
    windowStart: 0,
    windowEnd: 150,
    result: null,
    inWindow: [true, true, true],
    message: 'getHits(150): Check window (150 - 300 = -150). All hits valid.',
    exampleNum: 1,
  })

  steps.push({
    activeLine: 10,
    hits: [1, 100, 150],
    windowStart: 0,
    windowEnd: 150,
    result: 3,
    inWindow: [true, true, true],
    message: 'Return count: 3 hits in 300-second window.',
    exampleNum: 1,
  })

  // Example 2: Hits with expiration
  steps.push({
    activeLine: 2,
    hits: [],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'Example 2: New counter. Initialize.',
    exampleNum: 2,
  })

  // Build up hits: 1, 100, 150, 300, 400, 500
  const exampleHits = [1, 100, 150, 300, 400, 500]
  exampleHits.forEach((timestamp, idx) => {
    steps.push({
      activeLine: 5,
      hits: exampleHits.slice(0, idx + 1),
      windowStart: null,
      windowEnd: null,
      result: null,
      message: `hit(${timestamp}): Add timestamp ${timestamp}.`,
      exampleNum: 2,
    })
  })

  // getHits(500) - window [200, 500]
  steps.push({
    activeLine: 6,
    hits: exampleHits,
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [false, false, false, true, true, true],
    message: 'getHits(500): Window (500 - 300 = 200). Hits 1, 100, 150 outside window.',
    exampleNum: 2,
  })

  // Remove stale hits
  steps.push({
    activeLine: 7,
    hits: exampleHits,
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [false, false, false, true, true, true],
    message: 'Remove hit 1 (1 <= 200): Outside window.',
    exampleNum: 2,
  })

  steps.push({
    activeLine: 7,
    hits: exampleHits,
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [false, false, false, true, true, true],
    message: 'Remove hit 100 (100 <= 200): Outside window.',
    exampleNum: 2,
  })

  steps.push({
    activeLine: 7,
    hits: exampleHits,
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [false, false, false, true, true, true],
    message: 'Remove hit 150 (150 <= 200): Outside window.',
    exampleNum: 2,
  })

  steps.push({
    activeLine: 9,
    hits: [300, 400, 500],
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [true, true, true],
    message: 'After removal: [300, 400, 500] remain in window.',
    exampleNum: 2,
  })

  steps.push({
    activeLine: 10,
    hits: [300, 400, 500],
    windowStart: 200,
    windowEnd: 500,
    result: 3,
    inWindow: [true, true, true],
    message: 'Return count: 3 hits in 300-second window.',
    exampleNum: 2,
  })

  // Example 3: Multiple windows
  steps.push({
    activeLine: 2,
    hits: [],
    windowStart: null,
    windowEnd: null,
    result: null,
    message: 'Example 3: Rate limiting scenario.',
    exampleNum: 3,
  })

  const example3Hits = [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
  example3Hits.slice(0, 6).forEach((timestamp, idx) => {
    steps.push({
      activeLine: 5,
      hits: example3Hits.slice(0, idx + 1),
      windowStart: null,
      windowEnd: null,
      result: null,
      message: `hit(${timestamp}): Add request at ${timestamp}.`,
      exampleNum: 3,
    })
  })

  // getHits(300) - window [0, 300]
  steps.push({
    activeLine: 6,
    hits: example3Hits.slice(0, 6),
    windowStart: 0,
    windowEnd: 300,
    result: null,
    inWindow: [true, true, true, true, true, true],
    message: 'getHits(300): All 6 requests in window [0, 300].',
    exampleNum: 3,
  })

  steps.push({
    activeLine: 10,
    hits: example3Hits.slice(0, 6),
    windowStart: 0,
    windowEnd: 300,
    result: 6,
    inWindow: [true, true, true, true, true, true],
    message: 'Rate limit check: 6 hits per 300 seconds - ALLOWED.',
    exampleNum: 3,
  })

  // Add more hits
  example3Hits.slice(6).forEach((timestamp, idx) => {
    steps.push({
      activeLine: 5,
      hits: example3Hits.slice(0, 6 + idx + 1),
      windowStart: null,
      windowEnd: null,
      result: null,
      message: `hit(${timestamp}): Add request at ${timestamp}.`,
      exampleNum: 3,
    })
  })

  // getHits(500) - window [200, 500]
  steps.push({
    activeLine: 6,
    hits: example3Hits,
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [false, false, false, false, true, true, true, true, true, true, true],
    message: 'getHits(500): Window [200, 500]. Hits 1, 50, 100, 150 outside.',
    exampleNum: 3,
  })

  steps.push({
    activeLine: 9,
    hits: [200, 250, 300, 350, 400, 450, 500],
    windowStart: 200,
    windowEnd: 500,
    result: null,
    inWindow: [true, true, true, true, true, true, true],
    message: 'Remove stale hits. 7 hits remain in window.',
    exampleNum: 3,
  })

  steps.push({
    activeLine: 10,
    hits: [200, 250, 300, 350, 400, 450, 500],
    windowStart: 200,
    windowEnd: 500,
    result: 7,
    inWindow: [true, true, true, true, true, true, true],
    message: 'Rate limit check: 7 hits per 300 seconds - EXCEEDED.',
    exampleNum: 3,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: Simple Sequence', desc: 'Basic hit tracking' },
  { label: 'Example 2: Window Expiration', desc: 'Removing stale hits' },
  { label: 'Example 3: Rate Limiting', desc: 'Monitoring request volume' },
]

export default function Problem362Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const steps = useMemo(() => generateSteps(), [])
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
      title: '⏱️ Hit Counter Visualization',
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
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.message}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Example {step.exampleNum}: {EXAMPLES[step.exampleNum - 1]?.desc}</div>
              </div>

              <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Timeline (0-500s)</div>
                <div style={{ position: 'relative', height: 60, backgroundColor: '#ffffff', borderRadius: 4, border: '1px solid #e0e7ff', padding: '8px 4px', overflow: 'hidden' }}>
                  {step.windowStart !== null && step.windowEnd !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      style={{
                        position: 'absolute',
                        left: `${(step.windowStart / 500) * 100}%`,
                        right: `${100 - (step.windowEnd / 500) * 100}%`,
                        top: 0,
                        bottom: 0,
                        backgroundColor: '#3b82f6',
                        zIndex: 0,
                      }}
                    />
                  )}

                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', height: '100%', gap: 2 }}>
                    <AnimatePresence>
                      {step.hits.map((hit, idx) => {
                        const isInWindow = step.inWindow ? step.inWindow[idx] : true
                        const position = (hit / 500) * 100
                        return (
                          <motion.div
                            key={hit}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                              position: 'absolute',
                              left: `${position}%`,
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: isInWindow ? '#10b981' : '#ef4444',
                                border: isInWindow ? '2px solid #059669' : '2px solid #dc2626',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 8,
                                fontWeight: 'bold',
                                color: '#fff',
                              }}
                              title={`${hit}s`}
                            >
                              {idx + 1}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {step.windowStart !== null && step.windowEnd !== null && (
                  <div style={{ marginTop: 8, fontSize: 10, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Window: [{step.windowStart}, {step.windowEnd}]</span>
                    <span>Duration: {step.windowEnd - step.windowStart}s</span>
                  </div>
                )}
              </div>

              <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #7dd3fc' }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Queue State</div>
                {step.hits.length === 0 ? (
                  <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>Queue is empty</div>
                ) : (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {step.hits.map((hit, idx) => {
                      const isInWindow = step.inWindow ? step.inWindow[idx] : true
                      return (
                        <motion.div
                          key={hit}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: isInWindow ? '#f0fdf4' : '#fee2e2',
                            border: isInWindow ? '1px solid #86efac' : '1px solid #fca5a5',
                            borderRadius: 3,
                            fontSize: 11,
                            fontWeight: 'bold',
                            color: isInWindow ? '#15803d' : '#991b1b',
                          }}
                        >
                          {hit}s
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>

              {step.result !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #86efac' }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 4, color: '#15803d' }}>Hit Count Result</div>
                  <div style={{ fontSize: 28, fontWeight: 'bold', color: '#15803d', textAlign: 'center' }}>{step.result}</div>
                  <div style={{ fontSize: 9, color: '#059669', textAlign: 'center', marginTop: 4 }}>
                    Hits in 300-second window
                  </div>
                </motion.div>
              )}

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 10, color: '#92400e' }}>
                <strong>Story:</strong> Rate limiting in microservices. Monitor HTTP request volume in sliding 300-second windows to enforce quotas.
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample])

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
