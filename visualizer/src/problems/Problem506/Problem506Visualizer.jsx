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
import './Problem506Visualizer.css'

const EXAMPLES = getExamples('relative-ranks') || [
  { label: 'Example 1', score: [10, 3, 8, 9, 4] },
  { label: 'Example 2', score: [5, 4, 3, 2, 1] },
]

function generateSteps(score) {
  const steps = []
  const n = score.length

  steps.push({
    activeLine: 1,
    score,
    message: 'Create array with original indices and scores',
    phase: 'Setup'
  })

  // Create indexed pairs and sort
  const indexed = score.map((s, i) => ({ score: s, originalIdx: i }))
  const sorted = [...indexed].sort((a, b) => b.score - a.score)

  steps.push({
    activeLine: 2,
    score,
    sorted: sorted.map(item => ({ ...item, displayIdx: sorted.indexOf(item) })),
    message: 'Sort athletes by score in descending order',
    phase: 'Sorting'
  })

  // Create result array
  const result = new Array(n)
  const medals = ['Gold Medal', 'Silver Medal', 'Bronze Medal']

  for (let i = 0; i < Math.min(3, n); i++) {
    result[sorted[i].originalIdx] = medals[i]
    steps.push({
      activeLine: 3,
      score,
      sorted: sorted.map((item, idx) => ({ ...item, displayIdx: idx })),
      result: [...result],
      currentRank: i,
      message: `${medals[i]} goes to athlete ${sorted[i].originalIdx} (score: ${sorted[i].score})`,
      phase: 'Medal Assignment'
    })
  }

  // Assign rankings to rest
  for (let i = 3; i < n; i++) {
    result[sorted[i].originalIdx] = String(i + 1)
    steps.push({
      activeLine: 4,
      score,
      sorted: sorted.map((item, idx) => ({ ...item, displayIdx: idx })),
      result: [...result],
      currentRank: i,
      message: `Rank ${i + 1} goes to athlete ${sorted[i].originalIdx} (score: ${sorted[i].score})`,
      phase: 'Ranking'
    })
  }

  steps.push({
    activeLine: 5,
    score,
    result,
    done: true,
    message: `Final rankings: ${result.join(', ')}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ score, step }) {
  const getMedalEmoji = (rank) => {
    if (rank === 'Gold Medal') return '🥇'
    if (rank === 'Silver Medal') return '🥈'
    if (rank === 'Bronze Medal') return '🥉'
    return '🏅'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fcd34d', borderRadius: 6, borderLeft: '4px solid #ca8a04' }}>
        <div style={{ fontSize: 12, color: '#713f12', fontStyle: 'italic' }}>Assign rankings and medals to athletes.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 4, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#78350f' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Original Scores</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {score.map((s, i) => (
            <motion.div
              key={i}
              style={{
                flex: 1,
                padding: '8px 4px',
                backgroundColor: step?.currentRank !== undefined && step?.result && step.result[i] ? '#60a5fa' : '#e0f2fe',
                borderRadius: 4,
                border: '1px solid #7dd3fc',
                textAlign: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: step?.currentRank !== undefined && step?.result && step.result[i] ? 'white' : '#0c4a6e'
              }}
              animate={{ backgroundColor: step?.currentRank !== undefined && step?.result && step.result[i] ? '#60a5fa' : '#e0f2fe' }}
            >
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.sorted && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef08a', borderRadius: 6, border: '1px solid #facc15' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#713f12', marginBottom: 8 }}>Sorted Ranking</div>
          {step.sorted.map((item, i) => (
            <motion.div
              key={i}
              style={{
                padding: '6px 8px',
                marginBottom: 4,
                backgroundColor: i === step.currentRank ? '#fcd34d' : '#fef3c7',
                borderRadius: 4,
                border: i === step.currentRank ? '2px solid #ca8a04' : '1px solid #fcd34d',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#78350f'
              }}
              animate={{ backgroundColor: i === step.currentRank ? '#fcd34d' : '#fef3c7' }}
            >
              <span>Athlete {item.originalIdx}: {item.score}</span>
              <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
            </motion.div>
          ))}
        </motion.div>
      )}

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid #6ee7b7' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Final Rankings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step.result.map((rank, i) => (
              rank && (
                <motion.div
                  key={i}
                  style={{
                    padding: '8px',
                    backgroundColor: '#d1fae5',
                    borderRadius: 4,
                    border: '1px solid #6ee7b7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#065f46'
                  }}
                >
                  <span>Position {i}:</span>
                  <span>{getMedalEmoji(rank)} {rank}</span>
                </motion.div>
              )
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem506Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('relative-ranks')
  const steps = useMemo(() => generateSteps(ex.score).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🏆 Relative Ranks', content: (<VisualizationPanel score={ex.score} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
