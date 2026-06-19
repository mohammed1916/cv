import { useState, useMemo } from 'react'
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
import './Problem512Visualizer.css'

const EXAMPLES = getExamples('game-play-analysis-ii') || [
  { label: 'Example 1', activity: [["1","2016-03-01","0"],["1","2016-05-02","0"],["1","2017-06-25","50"],["3","2016-03-02","8"]] },
]

function generateSteps(activity) {
  const steps = []
  const playerFirstEvent = {}

  steps.push({
    activeLine: 1,
    activity,
    message: 'Find device used at first login for each player',
    phase: 'Initialize'
  })

  const sorted = [...activity].sort((a, b) => new Date(a[1]) - new Date(b[1]))

  for (let record of sorted) {
    const playerId = record[0]
    const device = record[3] || 'Unknown'

    if (!playerFirstEvent[playerId]) {
      playerFirstEvent[playerId] = { date: record[1], device }
      steps.push({
        activeLine: 2,
        activity: sorted,
        current: record,
        message: `First event for player ${playerId}: ${record[1]}`,
        phase: 'Processing'
      })
    }
  }

  steps.push({
    activeLine: 3,
    activity: sorted,
    result: Object.entries(playerFirstEvent).map(([pid, data]) => [pid, data.date, data.device]),
    done: true,
    message: 'Found first device for each player',
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ activity, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, borderLeft: '4px solid #4f46e5' }}>
        <div style={{ fontSize: 12, color: '#3730a3', fontStyle: 'italic' }}>SQL: Find device of first login for each player.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#f3e8ff', borderRadius: 4, border: '1px solid #d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#3730a3' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 8 }}>Activity Timeline</div>
        {step?.activity?.map((record, i) => (
          <motion.div
            key={i}
            style={{
              padding: '6px 8px',
              marginBottom: 4,
              backgroundColor: step?.current === record ? '#a855f7' : '#f3e8ff',
              borderRadius: 4,
              border: step?.current === record ? '2px solid #9333ea' : '1px solid #d8b4fe',
              fontSize: 11,
              fontWeight: 600,
              color: step?.current === record ? 'white' : '#3730a3'
            }}
            animate={{ backgroundColor: step?.current === record ? '#a855f7' : '#f3e8ff' }}
          >
            Player {record[0]} - {record[1]}
          </motion.div>
        ))}
      </motion.div>

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>First Device Results</div>
          {step.result.map((record, i) => (
            <div key={i} style={{ padding: '4px 0', fontSize: 11, color: '#065f46' }}>
              Player {record[0]}: {record[1]}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default function Problem512Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('game-play-analysis-ii')
  const steps = useMemo(() => generateSteps(ex.activity).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🎮 Game Analysis II', content: (<VisualizationPanel activity={ex.activity} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
