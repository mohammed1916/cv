import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './GamePlayAnalysisIIVisualizer.css'

const EXAMPLES = getExamples('game-play-analysis-ii')

function generateSteps(events) {
  const steps = []

  if (!events || events.length === 0) {
    steps.push({
      activeLine: 1,
      events: [],
      processed: [],
      message: 'No events',
      relatedLines: [1]
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    events,
    processed: [],
    message: 'Load all events',
    relatedLines: [1]
  })

  const sorted = [...events].sort((a, b) => {
    if (a.player_id !== b.player_id) return a.player_id - b.player_id
    return new Date(a.event_date) - new Date(b.event_date)
  })

  steps.push({
    activeLine: 2,
    events: sorted,
    processed: [],
    message: 'Sort by player_id and event_date',
    relatedLines: [2]
  })

  const playerFirstDevice = new Map()
  sorted.forEach((event, idx) => {
    if (!playerFirstDevice.has(event.player_id)) {
      playerFirstDevice.set(event.player_id, event.device)
      const processed = Array.from(playerFirstDevice.entries()).map(([id, device]) => ({ player_id: id, device }))
      steps.push({
        activeLine: 3,
        events: sorted,
        processed,
        currentEvent: event,
        currentIdx: idx,
        message: `Player ${event.player_id} first device: ${event.device}`,
        relatedLines: [3]
      })
    }
  })

  const result = Array.from(playerFirstDevice.entries()).map(([id, device]) => ({ player_id: id, device }))
  steps.push({
    activeLine: 4,
    events: sorted,
    processed: result,
    done: true,
    result,
    message: `Found ${result.length} players with first devices`,
    relatedLines: [4]
  })

  return steps
}

function VisualizationPanel({ events, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          "Find the first device each player uses to login with. Group by player and get first occurrence."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Events</div>
        <div style={{ overflowX: 'auto', maxHeight: 200, overflowY: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Player ID</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Device</th>
                <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {step?.events?.map((e, idx) => {
                const isActive = step && idx === step.currentIdx
                return (
                  <motion.tr
                    key={idx}
                    style={{
                      backgroundColor: isActive ? '#a7f3d0' : '#fff',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{e.player_id}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{e.device}</td>
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{e.event_date}</td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result */}
      {step?.processed && step.processed.length > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#d1fae5',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 12 }}>
            First Devices ({step.processed.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {step.processed.map((p, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                backgroundColor: '#a7f3d0',
                borderRadius: 4,
                border: '1px solid #10b981',
                fontSize: 11,
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 600 }}>Player {p.player_id}</div>
                <div style={{ fontSize: 10 }}>{p.device}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#d1fae5',
          borderRadius: 6,
          border: '2px solid #10b981',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#10b981' }}>
          {step?.processed?.length ?? 0} players
        </div>
        <div style={{ fontSize: 12, color: '#10b981', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function GamePlayAnalysisIIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { events: [{ player_id: 1, device: 'phone', event_date: '2016-03-01' }] })
  const SOLUTION_CODE = useSolutionCode('game-play-analysis-ii')

  const steps = useMemo(
    () =>
      generateSteps(ex.events).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
      title: '🎮 Game Play Analysis II',
      content: (
        <VisualizationPanel
          events={ex.events}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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
