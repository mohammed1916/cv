import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './OutputContestMatchesVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findMatches(self, n: int) -> str:' },
  { line: 3, text: '        teams = [str(i) for i in range(1, n+1)]' },
  { line: 4, text: '        ' },
  { line: 5, text: '        while len(teams) > 1:' },
  { line: 6, text: '            new_teams = []' },
  { line: 7, text: '            for i in range(len(teams) // 2):' },
  { line: 8, text: '                left = teams[i]' },
  { line: 9, text: '                right = teams[-(i+1)]' },
  { line: 10, text: '                match = f"({left},{right})"' },
  { line: 11, text: '                new_teams.append(match)' },
  { line: 12, text: '            teams = new_teams' },
  { line: 13, text: '        return teams[0]' },
]

const PATTERNS = ['init', 'round', 'match', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'round',
  10: 'match',
  13: 'done',
}

function generateSteps(n) {
  const steps = []

  if (n <= 0) {
    steps.push({
      phase: 'done',
      activeLine: 13,
      relatedLines: [13],
      message: 'Invalid n.',
      done: true,
    })
    return steps
  }

  let teams = Array.from({ length: n }, (_, i) => String(i + 1))

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3],
    message: `Initialize ${n} teams: [${teams.join(', ')}]`,
    teams: [...teams],
    round: 0,
  })

  let round = 1

  while (teams.length > 1) {
    steps.push({
      phase: 'round',
      activeLine: 5,
      relatedLines: [5],
      message: `Round ${round}: ${teams.length} teams → ${teams.length / 2} matches`,
      teams: [...teams],
      round,
    })

    const newTeams = []

    for (let i = 0; i < teams.length / 2; i++) {
      const left = teams[i]
      const right = teams[teams.length - 1 - i]
      const match = `(${left},${right})`

      newTeams.push(match)

      steps.push({
        phase: 'match',
        activeLine: 10,
        relatedLines: [8, 9, 10, 11],
        message: `Match: ${left} vs ${right}`,
        teams: [...newTeams],
        round,
        matchIdx: i,
        left,
        right,
        match,
      })
    }

    teams = newTeams
    round++
  }

  steps.push({
    phase: 'done',
    activeLine: 13,
    relatedLines: [13],
    message: `Champion: ${teams[0]}`,
    result: teams[0],
    done: true,
  })

  return steps
}

function VisualizationPanel({ n, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                }}
              >
                {ex.label || `n=${ex.n}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '1px solid var(--text-muted)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Teams</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#067db1' }}>{n}</div>
      </div>

      {step?.round !== undefined && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7e56f8', marginBottom: 6 }}>Round {step.round}</div>
          <div style={{ fontSize: 12, color: '#5577a4' }}>
            {step.teams.length} {step.teams.length === 1 ? 'winner' : 'matches'}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>
          {step?.round ? `Round ${step.round} Matches` : 'Bracket'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
          <AnimatePresence mode="popLayout">
            {step?.teams?.map((match, idx) => (
              <motion.div
                key={`match-${step.round}-${idx}`}
                style={{
                  padding: '10px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  backgroundColor: 'var(--surface2)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  borderColor: step?.matchIdx === idx ? '#f59e0b' : 'var(--text-muted)',
                  color: step?.matchIdx === idx ? '#fbbf24' : 'var(--text)',
                  wordBreak: 'break-all',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                {match}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {step?.result && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>🏆 Champion</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#178740' }}>
            {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function OutputContestMatchesVisualizer() {
  const examples = useMemo(() => getExamplesOr('output-contest-matches', []), [])
  const [nValue, setNValue] = useState(2)

  const steps = useMemo(() => generateSteps(nValue), [nValue])

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
      setNValue(ex.n || 2)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🏆 Output Contest Matches', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Number of Teams</div>
              <input
                type="number"
                value={nValue}
                onChange={(e) => {
                  setNValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                  handleReset()
                }}
                min="1"
                max="16"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                }}
              />
            </div>
            <VisualizationPanel n={nValue} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, nValue, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
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
