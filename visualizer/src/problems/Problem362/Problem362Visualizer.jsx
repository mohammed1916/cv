import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './Problem362.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer

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

function generateSteps(hits, queryTime, windowSize) {
  const steps = []
  const timelineMax = Math.max(queryTime, ...(hits.length ? hits : [0]), 1)
  const base = {
    hits: [],
    windowStart: null,
    windowEnd: null,
    result: null,
    inWindow: null,
    timelineMax,
    windowSize,
  }

  steps.push({
    ...base,
    activeLine: 2,
    message: 'Initialize: Empty queue to store hit timestamps.',
  })

  hits.forEach((t, idx) => {
    steps.push({
      ...base,
      activeLine: 5,
      hits: hits.slice(0, idx + 1),
      message: `hit(${t}): Add timestamp ${t} to queue.`,
    })
  })

  const cutoff = queryTime - windowSize
  const displayStart = Math.max(cutoff, 0)
  const inWindow = hits.map((t) => t > cutoff)
  const stale = hits.filter((t) => t <= cutoff)

  steps.push({
    ...base,
    activeLine: 6,
    hits: [...hits],
    windowStart: displayStart,
    windowEnd: queryTime,
    inWindow,
    message:
      stale.length > 0
        ? `getHits(${queryTime}): cutoff = ${queryTime} - ${windowSize} = ${cutoff}. ${stale.length} hit(s) outside the window.`
        : `getHits(${queryTime}): cutoff = ${queryTime} - ${windowSize} = ${cutoff}. All hits are still valid.`,
  })

  let remaining = [...hits]
  while (remaining.length > 0 && remaining[0] <= cutoff) {
    const removed = remaining[0]
    remaining = remaining.slice(1)
    steps.push({
      ...base,
      activeLine: 9,
      hits: [...remaining],
      windowStart: displayStart,
      windowEnd: queryTime,
      inWindow: remaining.map(() => true),
      message: `Remove hit ${removed} (${removed} <= ${cutoff}): outside window.`,
    })
  }

  steps.push({
    ...base,
    activeLine: 10,
    hits: [...remaining],
    windowStart: displayStart,
    windowEnd: queryTime,
    inWindow: remaining.map(() => true),
    result: remaining.length,
    message: `Return count: ${remaining.length} hit(s) in the ${windowSize}-second window.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Simple Sequence',
    desc: 'Basic hit tracking',
    hits: [1, 100, 150],
    timestamp: 150,
    windowSize: 300,
  },
  {
    label: 'Example 2: Window Expiration',
    desc: 'Removing stale hits',
    hits: [1, 100, 150, 300, 400, 500],
    timestamp: 500,
    windowSize: 300,
  },
  {
    label: 'Example 3: Rate Limiting',
    desc: 'Monitoring request volume',
    hits: [1, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500],
    timestamp: 500,
    windowSize: 300,
  },
]


export default function Problem362Visualizer() {
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0].label)
  const [hitsInput, setHitsInput] = useState(JSON.stringify(EXAMPLES[0].hits))
  const [timestampInput, setTimestampInput] = useState(String(EXAMPLES[0].timestamp))
  const [windowInput, setWindowInput] = useState(String(EXAMPLES[0].windowSize))
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { hits, queryTime, windowSize, inputError } = useMemo(() => {
    const fallback = { hits: [], queryTime: 0, windowSize: 300 }
    try {
      const parsedHits = JSON.parse(hitsInput)
      if (!Array.isArray(parsedHits)) throw new Error('hits must be an array of timestamps')
      parsedHits.forEach((t, i) => {
        if (typeof t !== 'number' || !Number.isFinite(t) || t < 0) {
          throw new Error('every hit timestamp must be a non-negative number')
        }
        if (i > 0 && t < parsedHits[i - 1]) {
          throw new Error('hit timestamps must be in non-decreasing order')
        }
      })
      const parsedQuery = Number(timestampInput)
      if (!Number.isFinite(parsedQuery) || parsedQuery < 0) {
        throw new Error('timestamp must be a non-negative number')
      }
      const parsedWindow = Number(windowInput)
      if (!Number.isFinite(parsedWindow) || parsedWindow <= 0) {
        throw new Error('window must be a positive number')
      }
      return { hits: parsedHits, queryTime: parsedQuery, windowSize: parsedWindow, inputError: '' }
    } catch (e) {
      return { ...fallback, inputError: e.message }
    }
  }, [hitsInput, timestampInput, windowInput])

  const steps = useMemo(() => generateSteps(hits, queryTime, windowSize), [hits, queryTime, windowSize])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((ex) => {
    if (!ex) return
    setActiveLabel(ex.label)
    setHitsInput(JSON.stringify(ex.hits))
    setTimestampInput(String(ex.timestamp))
    setWindowInput(String(ex.windowSize))
    handleReset()
  }, [handleReset])

  const handleInputChange = useCallback((key, text) => {
    if (key === 'hits') setHitsInput(text)
    if (key === 'timestamp') setTimestampInput(text)
    if (key === 'window') setWindowInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⏱️ Hit Counter Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <ManualInputPanel
            fields={[
              { key: 'hits', label: 'hits', type: 'array' },
              { key: 'timestamp', label: 'getHits at', type: 'number' },
              { key: 'window', label: 'window (s)', type: 'number' },
            ]}
            values={{ hits: hitsInput, timestamp: timestampInput, window: windowInput }}
            onChange={handleInputChange}
            examples={EXAMPLES}
            activeLabel={activeLabel}
            applyExample={applyExample}
            inputError={inputError}
          />

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{step.message}</div>
              </div>

              <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>Timeline (0-{step.timelineMax}s)</div>
                <div style={{ position: 'relative', height: 60, backgroundColor: '#ffffff', borderRadius: 4, border: '1px solid #e0e7ff', padding: '8px 4px', overflow: 'hidden' }}>
                  {step.windowStart !== null && step.windowEnd !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.15 }}
                      style={{
                        position: 'absolute',
                        left: `${(step.windowStart / step.timelineMax) * 100}%`,
                        right: `${100 - (step.windowEnd / step.timelineMax) * 100}%`,
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
                        const position = (hit / step.timelineMax) * 100
                        return (
                          <motion.div
                            key={`${hit}-${idx}`}
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
                          key={`${hit}-${idx}`}
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
                    Hits in {step.windowSize}-second window
                  </div>
                </motion.div>
              )}

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 10, color: '#92400e' }}>
                <strong>Story:</strong> Rate limiting in microservices. Monitor HTTP request volume in sliding 300-second windows to enforce quotas.
              </div>
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, hitsInput, timestampInput, windowInput, inputError, activeLabel, applyExample, handleInputChange])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
