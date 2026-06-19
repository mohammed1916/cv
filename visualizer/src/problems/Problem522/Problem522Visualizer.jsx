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
import './Problem522Visualizer.css'

const EXAMPLES = getExamples('longest-uncommon-subsequence-ii') || [
  { label: 'Example 1', strs: ["aba","dcdc","daac","bbca","bbca","b","ac","a"] },
  { label: 'Example 2', strs: ["d","b","b"] },
]

function generateSteps(strs) {
  const steps = []

  steps.push({
    activeLine: 1,
    strs,
    message: `Find longest uncommon subsequence from array of ${strs.length} strings`,
    phase: 'Initialize'
  })

  steps.push({
    activeLine: 2,
    strs,
    message: 'A string is uncommon if it is not a subsequence of any other string',
    phase: 'Definition'
  })

  let maxLen = 0
  let result = ""

  for (let i = 0; i < strs.length; i++) {
    let isUncommon = true

    for (let j = 0; j < strs.length; j++) {
      if (i === j) continue
      if (isSubsequence(strs[i], strs[j])) {
        isUncommon = false
        break
      }
    }

    if (isUncommon && strs[i].length > maxLen) {
      maxLen = strs[i].length
      result = strs[i]
      steps.push({
        activeLine: 3,
        strs,
        currentIdx: i,
        currentStr: strs[i],
        isUncommon: true,
        maxLen,
        message: `"${strs[i]}" is uncommon with length ${strs[i].length}`,
        phase: 'Checking String'
      })
    }
  }

  steps.push({
    activeLine: 4,
    strs,
    result,
    maxLen,
    done: true,
    message: `Longest uncommon subsequence: "${result}" (length: ${maxLen})`,
    phase: 'Result'
  })

  return steps
}

function isSubsequence(s, t) {
  let i = 0
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++
  }
  return i === s.length
}

function VisualizationPanel({ strs, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid '#a855f7' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>Find longest string that is not a subsequence of any other string.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e9d5ff', borderRadius: 4, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e9d5ff', borderRadius: 6, border: '1px solid '#d8b4fe' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>All Strings</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {strs.map((str, i) => (
            <motion.div
              key={i}
              style={{
                padding: '6px 10px',
                backgroundColor: step?.currentIdx === i ? '#a855f7' : '#f3e8ff',
                borderRadius: 4,
                border: step?.currentIdx === i ? '2px solid '#6b21a8' : '1px solid '#d8b4fe',
                fontSize: 11,
                fontWeight: 600,
                color: step?.currentIdx === i ? 'white' : '#6b21a8'
              }}
              animate={{ backgroundColor: step?.currentIdx === i ? '#a855f7' : '#f3e8ff' }}
            >
              {str}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {step?.isUncommon && step?.currentStr && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid '#6ee7b7' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Uncommon: "{step.currentStr}"</div>
        </motion.div>
      )}

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid '#10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>Result: "{step.result}"</div>
          <div style={{ fontSize: 11, color: '#065f46' }}>Length: {step.maxLen}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem522Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('longest-uncommon-subsequence-ii')
  const steps = useMemo(() => generateSteps(ex.strs).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔤 Uncommon II', content: (<VisualizationPanel strs={ex.strs} step={step} />) },
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
