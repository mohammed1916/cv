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
import './Problem514Visualizer.css'

const EXAMPLES = getExamples('freedom-trail') || [
  { label: 'Example 1', ring: "godding", key: "gd" },
  { label: 'Example 2', ring: "godding", key: "godding" },
]

function generateSteps(ring, key) {
  const steps = []
  let turns = 0

  steps.push({
    activeLine: 1,
    ring,
    key,
    turns: 0,
    message: `Match "${key}" with rotation of "${ring}"`,
    phase: 'Initialize'
  })

  let ringIdx = 0
  for (let char of key) {
    const targetIdx = ring.indexOf(char, ringIdx)
    const clockwise = targetIdx >= ringIdx ? targetIdx - ringIdx : ring.length - ringIdx + targetIdx
    const counter = ringIdx - targetIdx >= 0 ? ringIdx - targetIdx : ringIdx + ring.length - targetIdx
    const minTurns = Math.min(clockwise, counter)
    turns += minTurns + 1

    steps.push({
      activeLine: 2,
      ring,
      key,
      currentChar: char,
      targetIdx,
      turns,
      message: `Match '${char}': ${minTurns} rotations + 1 click = ${minTurns + 1}`,
      phase: 'Matching Character'
    })

    ringIdx = targetIdx
  }

  steps.push({
    activeLine: 3,
    ring,
    key,
    turns,
    done: true,
    message: `Total turns: ${turns}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ ring, key, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, borderLeft: '4px solid #dc2626' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>Dynamic programming: Find minimum turns to spell key on rotatable ring.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 4, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7f1d1d' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Ring: "{ring}"</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
          {ring.split('').map((char, i) => (
            <motion.div
              key={i}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: step?.targetIdx === i ? '#dc2626' : '#fee2e2',
                border: step?.targetIdx === i ? '2px solid #7f1d1d' : '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: step?.targetIdx === i ? 'white' : '#7f1d1d'
              }}
              animate={{ backgroundColor: step?.targetIdx === i ? '#dc2626' : '#fee2e2' }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Key: "{key}"</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {key.split('').map((char, i) => (
            <motion.div
              key={i}
              style={{
                padding: '6px 12px',
                backgroundColor: step?.currentChar === char ? '#60a5fa' : '#e0f2fe',
                borderRadius: 4,
                border: step?.currentChar === char ? '2px solid #0284c7' : '1px solid #7dd3fc',
                fontSize: 11,
                fontWeight: 600,
                color: step?.currentChar === char ? 'white' : '#0c4a6e'
              }}
              animate={{ backgroundColor: step?.currentChar === char ? '#60a5fa' : '#e0f2fe' }}
            >
              {char}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.turns !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Total Turns: {step.turns}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem514Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('freedom-trail')
  const steps = useMemo(() => generateSteps(ex.ring, ex.key).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔄 Freedom Trail', content: (<VisualizationPanel ring={ex.ring} key={ex.key} step={step} />) },
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
