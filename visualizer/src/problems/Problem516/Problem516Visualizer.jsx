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
import './Problem516Visualizer.css'

const EXAMPLES = getExamples('longest-palindromic-subsequence') || [
  { label: 'Example 1', s: "bbbab" },
  { label: 'Example 2', s: "cbbd" },
]

function generateSteps(s) {
  const steps = []
  const n = s.length
  const dp = Array(n).fill(0).map(() => Array(n).fill(0))

  steps.push({
    activeLine: 1,
    s,
    dp: dp.map(row => [...row]),
    message: `Find longest palindromic subsequence in "${s}"`,
    phase: 'Initialize'
  })

  // Single characters are palindromes of length 1
  for (let i = 0; i < n; i++) {
    dp[i][i] = 1
  }

  steps.push({
    activeLine: 2,
    s,
    dp: dp.map(row => [...row]),
    message: 'Base case: single characters are palindromes',
    phase: 'Base Case'
  })

  // Build up for substrings of increasing length
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1])
      }

      steps.push({
        activeLine: 3,
        s,
        dp: dp.map(row => [...row]),
        i,
        j,
        currentLen: len,
        message: `s[${i}:${j+1}] = "${s.substring(i, j + 1)}": LPS = ${dp[i][j]}`,
        phase: 'DP Building'
      })
    }
  }

  const result = dp[0][n - 1]

  steps.push({
    activeLine: 4,
    s,
    dp,
    result,
    done: true,
    message: `Longest palindromic subsequence length: ${result}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ s, step }) {
  const cellSize = 30
  const n = s.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid '#a855f7' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>DP: Find longest palindromic subsequence using dynamic programming.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e9d5ff', borderRadius: 4, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>Input String: "{s}"</div>
      </motion.div>

      {step?.dp && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid '#d8b4fe', overflowX: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>DP Table</div>
          <div style={{ display: 'inline-block' }}>
            {step.dp.map((row, i) => (
              <div key={i} style={{ display: 'flex', gap: 2 }}>
                {row.map((val, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: 2,
                      backgroundColor: i === step.i && j === step.j ? '#a855f7' : step.dp[i][j] > 0 ? '#e9d5ff' : '#f3e8ff',
                      border: i === step.i && j === step.j ? '2px solid #6b21a8' : '1px solid '#d8b4fe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 9,
                      fontWeight: 600,
                      color: i === step.i && j === step.j ? 'white' : '#6b21a8'
                    }}
                    animate={{ backgroundColor: i === step.i && j === step.j ? '#a855f7' : step.dp[i][j] > 0 ? '#e9d5ff' : '#f3e8ff' }}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid '#10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Length of LPS: {step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem516Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('longest-palindromic-subsequence')
  const steps = useMemo(() => generateSteps(ex.s).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔤 Longest Palindrome', content: (<VisualizationPanel s={ex.s} step={step} />) },
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
