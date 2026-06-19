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
import './Problem524Visualizer.css'

const EXAMPLES = getExamples('longest-word-in-dictionary') || [
  { label: 'Example 1', s: "abpcplea", dictionary: ["ale","apple","monkey","plea"] },
  { label: 'Example 2', s: "abpcplea", dictionary: ["a","b","c"] },
]

function generateSteps(s, dictionary) {
  const steps = []
  let result = ""

  steps.push({
    activeLine: 1,
    s,
    dictionary,
    result: "",
    message: `Find longest word in dictionary that is subsequence of "${s}"`,
    phase: 'Initialize'
  })

  for (let word of dictionary) {
    steps.push({
      activeLine: 2,
      s,
      dictionary,
      currentWord: word,
      message: `Checking if "${word}" is subsequence of "${s}"`,
      phase: 'Checking Word'
    })

    if (isSubsequence(word, s)) {
      if (word.length > result.length || (word.length === result.length && word < result)) {
        result = word
        steps.push({
          activeLine: 3,
          s,
          dictionary,
          currentWord: word,
          result,
          message: `"${word}" is valid subsequence, new result: "${result}"`,
          phase: 'Valid Word'
        })
      }
    }
  }

  steps.push({
    activeLine: 4,
    s,
    dictionary,
    result,
    done: true,
    message: `Longest word in dictionary: "${result}"`,
    phase: 'Result'
  })

  return steps
}

function isSubsequence(word, s) {
  let i = 0
  for (let j = 0; j < s.length && i < word.length; j++) {
    if (word[i] === s[j]) i++
  }
  return i === word.length
}

function VisualizationPanel({ s, dictionary, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid '#0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>Find the longest word in dictionary that is a subsequence of the given string.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid '#7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Given String</div>
        <div style={{ padding: '8px', backgroundColor: '#f0f9ff', borderRadius: 4, fontSize: 14, fontWeight: 600, color: '#0c4a6e', letterSpacing: '2px' }}>
          {s.split('').map((c, i) => <span key={i}>{c} </span>)}
        </div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid '#fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Dictionary Words</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {dictionary.map((word, i) => (
            <motion.div
              key={i}
              style={{
                padding: '6px 10px',
                backgroundColor: step?.currentWord === word ? '#fcd34d' : '#fef3c7',
                borderRadius: 4,
                border: step?.currentWord === word ? '2px solid '#ca8a04' : '1px solid '#fcd34d',
                fontSize: 11,
                fontWeight: 600,
                color: '#78350f'
              }}
              animate={{ backgroundColor: step?.currentWord === word ? '#fcd34d' : '#fef3c7' }}
            >
              {word}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, border: '1px solid '#fca5a5' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 4 }}>Subsequence Check</div>
        <div style={{ fontSize: 11, color: '#7f1d1d' }}>
          Find each character of word in order within the given string
        </div>
      </motion.div>

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid '#10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Result: "{step.result}"</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem524Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('longest-word-in-dictionary')
  const steps = useMemo(() => generateSteps(ex.s, ex.dictionary).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '📚 Longest Word', content: (<VisualizationPanel s={ex.s} dictionary={ex.dictionary} step={step} />) },
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
