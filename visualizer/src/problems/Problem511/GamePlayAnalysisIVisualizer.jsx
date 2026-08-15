import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './GamePlayAnalysisIVisualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamples('game-play-analysis-i')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def gamePlayAnalysisI(events):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    for event in events:' },
  { line: 4, text: '        player_id = event["player_id"]' },
  { line: 5, text: '        device = event["device"]' },
  { line: 6, text: '        event_date = event["event_date"]' },
  { line: 7, text: '        # Group by player, find first login' },
  { line: 8, text: '        if not any(e["player_id"]==player_id for e in result):' },
  { line: 9, text: '            result.append({"player_id": player_id, "device": device, "date": event_date})' },
  { line: 10, text: '    return sorted(result, key=lambda x: x["date"])' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

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

  const playerFirstLogin = new Map()
  sorted.forEach((event, idx) => {
    if (!playerFirstLogin.has(event.player_id)) {
      playerFirstLogin.set(event.player_id, event.event_date)
      const processed = Array.from(playerFirstLogin.entries()).map(([id, date]) => ({ player_id: id, first_login: date }))
      steps.push({
        activeLine: 3,
        events: sorted,
        processed,
        currentEvent: event,
        currentIdx: idx,
        message: `Player ${event.player_id} first login on ${event.event_date}`,
        relatedLines: [3]
      })
    } else {
      const processed = Array.from(playerFirstLogin.entries()).map(([id, date]) => ({ player_id: id, first_login: date }))
      steps.push({
        activeLine: 4,
        events: sorted,
        processed,
        currentEvent: event,
        currentIdx: idx,
        message: `Player ${event.player_id} already logged in, skip`,
        relatedLines: [4]
      })
    }
  })

  const result = Array.from(playerFirstLogin.entries()).map(([id, date]) => ({ player_id: id, first_login: date }))
  steps.push({
    activeLine: 5,
    events: sorted,
    processed: result,
    done: true,
    result,
    message: `Found ${result.length} unique players`,
    relatedLines: [5]
  })

  return steps
}

function VisualizationPanel({ events, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#78350f', fontStyle: 'italic' }}>
          "Find each player's first login date. Events are logged with player ID and event date."
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
                <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Event Date</th>
              </tr>
            </thead>
            <tbody>
              {step?.events?.map((e, idx) => {
                const isActive = step && idx === step.currentIdx
                return (
                  <motion.tr
                    key={idx}
                    style={{
                      backgroundColor: isActive ? '#fef08a' : '#fff',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{e.player_id}</td>
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
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 12 }}>
            First Logins ({step.processed.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {step.processed.map((p, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                backgroundColor: '#fcd34d',
                borderRadius: 4,
                border: '1px solid #f59e0b',
                fontSize: 11,
                textAlign: 'center'
              }}>
                <div style={{ fontWeight: 600 }}>Player {p.player_id}</div>
                <div style={{ fontSize: 10 }}>{p.first_login}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Progress</div>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#f59e0b' }}>
          {step?.processed?.length ?? 0} / {step?.events?.length ?? events?.length ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function GamePlayAnalysisIVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { events: [{ player_id: 1, event_date: '2016-03-01' }] })

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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎮 Game Play Analysis I', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          events={ex.events}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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

