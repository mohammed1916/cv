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
import './Problem511Visualizer.css'

const EXAMPLES = getExamples('game-play-analysis-i') || [
  { label: 'Example 1', activity: [["1","2019-01-01","0"],["1","2019-01-02","0"],["2","2019-01-01","5"]] },
]

function generateSteps(activity) {
  const steps = []
  const result = {}

  steps.push({
    activeLine: 1,
    activity,
    message: 'Group activities by player_id',
    phase: 'Initialize'
  })

  for (let record of activity) {
    const playerId = record[0]
    if (!result[playerId]) {
      result[playerId] = record
      steps.push({
        activeLine: 2,
        activity,
        current: record,
        message: `First event for player ${playerId}`,
        phase: 'Processing'
      })
    }
  }

  steps.push({
    activeLine: 3,
    activity,
    result: Object.values(result),
    done: true,
    message: 'Found first login for each player',
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ activity, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>SQL: Find the first login date for each player.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Activity Records</div>
        {step?.activity?.map((record, i) => (
          <motion.div
            key={i}
            style={{
              padding: '6px 8px',
              marginBottom: 4,
              backgroundColor: step?.current === record ? '#60a5fa' : '#e0f2fe',
              borderRadius: 4,
              border: step?.current === record ? '2px solid #0284c7' : '1px solid #7dd3fc',
              fontSize: 11,
              fontWeight: 600,
              color: step?.current === record ? 'white' : '#0c4a6e'
            }}
            animate={{ backgroundColor: step?.current === record ? '#60a5fa' : '#e0f2fe' }}
          >
            Player {record[0]}: {record[1]}
          </motion.div>
        ))}
      </motion.div>

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>First Login Results</div>
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

export default function Problem511Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('game-play-analysis-i')
  const steps = useMemo(() => generateSteps(ex.activity).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🎮 Game Analysis I', content: (<VisualizationPanel activity={ex.activity} step={step} />) },
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
