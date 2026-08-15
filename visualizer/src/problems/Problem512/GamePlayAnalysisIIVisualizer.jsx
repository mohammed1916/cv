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
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './GamePlayAnalysisIIVisualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'done',


}

const EXAMPLES = getExamples('game-play-analysis-ii')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def gamePlayAnalysisII(events):' },
  { line: 2, text: '    game_sessions = {}' },
  { line: 3, text: '    for event in events:' },
  { line: 4, text: '        player_id = event["player_id"]' },
  { line: 5, text: '        event_date = event["event_date"]' },
  { line: 6, text: '        device = event["device"]' },
  { line: 7, text: '        if player_id not in game_sessions:' },
  { line: 8, text: '            game_sessions[player_id] = []' },
  { line: 9, text: '        game_sessions[player_id].append(event)' },
  { line: 10, text: '    result = []' },
  { line: 11, text: '    for player_id, events_list in game_sessions.items():' },
  { line: 12, text: '        sorted_events = sorted(events_list, key=lambda e: e["event_date"])' },
  { line: 13, text: '        if len(sorted_events) > 1:' },
  { line: 14, text: '            for i in range(1, len(sorted_events)):' },
  { line: 15, text: '                result.append([player_id, sorted_events[i-1]["event_date"], sorted_events[i]["event_date"]])' },
]

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

function VisualizationPanel({ events, step, inputPanel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          "Find the first device each player uses to login with. Group by player and get first occurrence."
        </div>
      </div>

      {/* Manual input */}
      {inputPanel}

      {/* Events Table */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Events</div>
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
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#0c865d' }}>
          {step?.processed?.length ?? 0} players
        </div>
        <div style={{ fontSize: 12, color: '#0c865d', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function GamePlayAnalysisIIVisualizer() {
  const DEFAULT_ACTIVITY = EXAMPLES[0]?.activity ?? [{ player_id: 1, device_id: 2, event_date: '2016-03-01' }]
  const [activityInput, setActivityInput] = useState(JSON.stringify(DEFAULT_ACTIVITY))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const { events, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(activityInput)
      if (!Array.isArray(parsed)) throw new Error('activity must be an array of rows')
      const rows = parsed.map((row, i) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`row ${i} must be an object`)
        if (typeof row.player_id !== 'number') throw new Error(`row ${i} needs a numeric player_id`)
        if (typeof row.event_date !== 'string') throw new Error(`row ${i} needs a string event_date`)
        return { ...row, device: row.device ?? row.device_id }
      })
      return { events: rows, inputError: '' }
    } catch (e) {
      return { events: [], inputError: e.message }
    }
  }, [activityInput])

  const steps = useMemo(
    () =>
      generateSteps(events).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [events]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setActivityInput(JSON.stringify(e.activity))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎮 Game Play Analysis II', dockMode: 'split-right' },
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
          events={events}
          step={step}
          inputPanel={(
            <ManualInputPanel
              fields={[{ key: 'activity', label: 'activity (JSON rows)', type: 'array' }]}
              values={{ activity: activityInput }}
              onChange={(k, v) => { if (k === 'activity') setActivityInput(v); setActiveLabel(''); handleReset() }}
              examples={EXAMPLES}
              activeLabel={activeLabel}
              applyExample={applyEx}
              inputError={inputError}
            />
          )}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, events, applyEx, activityInput, activeLabel, inputError, handleReset])
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

