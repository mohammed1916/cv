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
import './Problem534Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class LogSystem:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.logs = []' },
  { line: 4, text: '    def put(self, id, ts):' },
  { line: 5, text: '        self.logs.append((id, ts))' },
  { line: 6, text: '    def retrieve(self, s, e, gra):' },
  { line: 7, text: '        length = len(s.split(":")[:gra])' },
  { line: 8, text: '        start = ":".join(s.split(":")[:length])' },
  { line: 9, text: '        end = ":".join(e.split(":")[:length])' },
  { line: 10, text: '        return [id for id, ts in self.logs' },
  { line: 11, text: '                if start <= ts[:len(start)] <= end]' },
]

function generateSteps(logs, queries) {
  const steps = []
  const storage = []

  steps.push({
    activeLine: 2,
    storage: [],
    message: 'Initialize log storage system.',
  })

  logs.forEach(([id, ts]) => {
    storage.push([id, ts])
    steps.push({
      activeLine: 5,
      storage: [...storage],
      currentLog: [id, ts],
      message: `Log entry: id=${id}, timestamp=${ts}`,
    })
  })

  queries.forEach(([start, end, granularity]) => {
    const gras = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second']
    const graIdx = gras.indexOf(granularity)
    const parts = start.split(':')
    const length = graIdx + 1

    steps.push({
      activeLine: 6,
      storage: [...storage],
      currentQuery: { start, end, granularity },
      message: `Retrieve logs from ${start} to ${end} at ${granularity} level`,
    })

    const filtered = storage.filter(([id, ts]) => {
      const tsPrefix = ts.split(':').slice(0, length).join(':')
      const startPrefix = start.split(':').slice(0, length).join(':')
      const endPrefix = end.split(':').slice(0, length).join(':')
      return tsPrefix >= startPrefix && tsPrefix <= endPrefix
    })

    steps.push({
      activeLine: 11,
      storage: [...storage],
      currentQuery: { start, end, granularity },
      result: filtered.map(([id]) => id),
      message: `Found ${filtered.length} log(s) in range`,
    })
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    logs: [
      [1, '2017:01:01:23:59:59'],
      [2, '2017:01:01:22:59:58'],
      [3, '2016:01:01:00:00:00'],
    ],
    queries: [['2016:01:01:01:01:01', '2017:01:01:23:00:00', 'Second']],
  },
]

export default function Problem534Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.logs, ex.queries), [ex])
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
        title: '📋 Log Storage',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{step?.message}</div>

              {/* Storage */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Storage:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflow: 'auto' }}>
                  {step?.storage.map(([id, ts], idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: step?.currentLog && step.currentLog[0] === id ? '#dbeafe' : '#f1f5f9',
                        border: `1px solid ${step?.currentLog && step.currentLog[0] === id ? '#0ea5e9' : '#cbd5e1'}`,
                        borderRadius: 3,
                        fontSize: 10,
                        fontFamily: 'monospace',
                      }}
                    >
                      id={id}: {ts}
                    </div>
                  ))}
                </div>
              </div>

              {/* Query */}
              {step?.currentQuery && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Query:</div>
                  <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4, fontSize: 10, fontFamily: 'monospace' }}>
                    [{step.currentQuery.start}, {step.currentQuery.end}] @ {step.currentQuery.granularity}
                  </div>
                </div>
              )}

              {/* Result */}
              {step?.result && (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Result:</div>
                  <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                    [{step.result.join(', ')}]
                  </div>
                </div>
              )}
            </div>
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
