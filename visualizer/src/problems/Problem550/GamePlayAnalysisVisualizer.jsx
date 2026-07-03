import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './GamePlayAnalysisVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'SELECT player_id, MIN(event_date) as first_login' },
  { line: 2, text: 'FROM Activity' },
  { line: 3, text: 'GROUP BY player_id' },
  { line: 4, text: 'ORDER BY player_id;' },
]

const PATTERNS = ['parse', 'group', 'aggregate', 'sort', 'done']
const LINE_PATTERN_MAP = {
  1: 'parse',
  3: 'group',
  1: 'aggregate',
  4: 'sort',
}

function generateSteps(activity) {
  const steps = []

  if (!Array.isArray(activity) || activity.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 4,
      relatedLines: [4],
      message: 'No activity records.',
      result: [],
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'parse',
    activeLine: 1,
    relatedLines: [1, 2],
    message: `Parsing ${activity.length} activity records.`,
    activity,
  })

  const playerLogins = {}

  for (let i = 0; i < activity.length; i++) {
    const { playerId, eventDate } = activity[i]

    steps.push({
      phase: 'group',
      activeLine: 3,
      relatedLines: [3],
      message: `Processing player ${playerId} on ${eventDate}`,
      activity,
      currentIdx: i,
      playerLogins: { ...playerLogins },
    })

    if (!playerLogins[playerId] || eventDate < playerLogins[playerId]) {
      playerLogins[playerId] = eventDate

      steps.push({
        phase: 'aggregate',
        activeLine: 1,
        relatedLines: [1],
        message: `First login for player ${playerId}: ${eventDate}`,
        activity,
        playerLogins: { ...playerLogins },
      })
    }
  }

  const result = Object.entries(playerLogins)
    .map(([playerId, firstDate]) => ({
      playerId: parseInt(playerId),
      firstDate,
    }))
    .sort((a, b) => a.playerId - b.playerId)

  steps.push({
    phase: 'sort',
    activeLine: 4,
    relatedLines: [4],
    message: `Sorted ${result.length} players by ID`,
    result,
  })

  steps.push({
    phase: 'done',
    activeLine: 4,
    relatedLines: [4],
    message: 'Query complete',
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.activity && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Activity Table</div>
          <div style={{ maxHeight: 150, overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: 11, color: '#e2e8f0', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #475569' }}>
                  <th style={{ textAlign: 'left', padding: 6, color: '#64748b' }}>Player</th>
                  <th style={{ textAlign: 'left', padding: 6, color: '#64748b' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {step.activity.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #334155',
                      backgroundColor: idx === step.currentIdx ? '#334155' : 'transparent',
                    }}
                  >
                    <td style={{ padding: 6, fontFamily: 'monospace' }}>{row.playerId}</td>
                    <td style={{ padding: 6, fontFamily: 'monospace' }}>{row.eventDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step?.playerLogins && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>First Logins</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {Object.entries(step.playerLogins).map(([playerId, date]) => (
                <motion.div
                  key={`${playerId}-${date}`}
                  style={{
                    padding: '8px',
                    backgroundColor: '#334155',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <span>Player {playerId}</span>
                  <span style={{ color: '#22c55e' }}>{date}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.result && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Result Count</div>
          <div style={{ fontSize: 16, color: '#22c55e', fontWeight: 'bold' }}>{step.result.length} records</div>
        </motion.div>
      )}
    </div>
  )
}

export default function GamePlayAnalysisVisualizer() {
  const examples = useMemo(() => getExamples('game-play-analysis') || [], [])
  const [activityInput, setActivityInput] = useState('[{"playerId":1,"eventDate":"2016-03-01"},{"playerId":1,"eventDate":"2016-05-02"},{"playerId":2,"eventDate":"2017-06-25"}]')

  const { activity, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(activityInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array')
      return { activity: parsed, inputError: '' }
    } catch (e) {
      return { activity: [], inputError: e.message }
    }
  }, [activityInput])

  const steps = useMemo(() => generateSteps(activity), [activity])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setActivityInput(JSON.stringify(ex.activity || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'SQL Code',
        content: (
          <div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
      {
        id: 'viz',
        title: '🎮 Game Play Analysis',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Activity (JSON)</div>
              <textarea
                value={activityInput}
                onChange={(e) => {
                  setActivityInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 100,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, activityInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
