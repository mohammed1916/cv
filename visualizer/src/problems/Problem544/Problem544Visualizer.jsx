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
import './Problem544Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findContestMatch(n):' },
  { line: 2, text: '    teams = [str(i) for i in range(1, n+1)]' },
  { line: 3, text: '    while len(teams) > 1:' },
  { line: 4, text: '        next_round = []' },
  { line: 5, text: '        for i in range(0, len(teams), 2):' },
  { line: 6, text: '            match = "(" + teams[i] + "," + teams[i+1] + ")"' },
  { line: 7, text: '            next_round.append(match)' },
  { line: 8, text: '        teams = next_round' },
  { line: 9, text: '    return teams[0]' },
]

function generateSteps(n) {
  const steps = []
  let teams = Array.from({ length: n }, (_, i) => (i + 1).toString())

  steps.push({
    activeLine: 1,
    teams: [...teams],
    message: `Tournament bracket for ${n} teams`,
  })

  steps.push({
    activeLine: 2,
    teams: [...teams],
    message: `Initialize teams: [${teams.join(', ')}]`,
  })

  let round = 1
  while (teams.length > 1) {
    steps.push({
      activeLine: 3,
      teams: [...teams],
      round,
      message: `Round ${round}: ${teams.length} teams remaining`,
    })

    const nextRound = []
    for (let i = 0; i < teams.length; i += 2) {
      const match = `(${teams[i]},${teams[i + 1]})`
      nextRound.push(match)

      steps.push({
        activeLine: 6,
        teams: [...teams],
        round,
        currentMatch: match,
        message: `Match: ${teams[i]} vs ${teams[i + 1]}`,
      })
    }

    teams = nextRound

    steps.push({
      activeLine: 8,
      teams: [...teams],
      round,
      message: `Round ${round} complete: ${teams.length} winners`,
    })

    round++
  }

  steps.push({
    activeLine: 9,
    teams: [...teams],
    winner: teams[0],
    message: `Champion: ${teams[0]}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1: n=2', n: 2 },
  { label: 'Example 2: n=4', n: 4 },
  { label: 'Example 3: n=8', n: 8 },
]

export default function Problem544Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.n), [ex])
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
        title: '🏆 Contest Matches',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, i) => (
                <button
                  key={i}
                  onClick={() => applyExample(i)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Teams/Matches */}
                  {step.teams && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>
                        {step.round ? `Round ${step.round}` : 'Tournament Bracket'}:
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.teams.map((team, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: step.currentMatch && step.teams[i].includes(step.currentMatch) ? 1.15 : 1,
                            }}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: step.currentMatch && step.teams[i].includes(step.currentMatch) ? '#dbeafe' : '#f1f5f9',
                              border: `1px solid ${step.currentMatch && step.teams[i].includes(step.currentMatch) ? '#0ea5e9' : '#cbd5e1'}`,
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 600,
                              fontFamily: 'monospace',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {team}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Winner */}
                  {step.winner && (
                    <motion.div
                      animate={{ scale: 1.05 }}
                      style={{
                        padding: 12,
                        backgroundColor: '#dcfce7',
                        border: '2px solid #10b981',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 13,
                        textAlign: 'center',
                        color: '#15803d',
                      }}
                    >
                      🏆 Winner: {step.winner}
                    </motion.div>
                  )}
              </>
            )}
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
