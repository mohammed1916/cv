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
import './Problem500Visualizer.css'

const EXAMPLES = getExamples('keyboard-row') || [
  { label: 'Example 1', words: ["Hello", "Alaska", "Dad", "Peace"] },
  { label: 'Example 2', words: ["omk"] },
]

function generateSteps(words) {
  const steps = []
  const rows = [new Set('qwertyuiop'.split('')), new Set('asdfghjkl'.split('')), new Set('zxcvbnm'.split(''))]
  const result = []
  steps.push({ activeLine: 1, words, result: [], message: 'Check each word against keyboard rows' })
  for (let word of words) {
    for (let row of rows) {
      if (word.toLowerCase().split('').every(c => row.has(c))) {
        result.push(word)
        steps.push({ activeLine: 2, words, result: [...result], currentWord: word, message: `"${word}" matches a row` })
        break
      }
    }
  }
  steps.push({ activeLine: 3, words, result, done: true, message: `Found ${result.length} words` })
  return steps
}

function VisualizationPanel({ words, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>Words that can be typed from single keyboard row.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input: [{words.join(', ')}]</div></div>
      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Result ({step.result.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.result.map((w, i) => (<div key={i} style={{ padding: '4px 8px', backgroundColor: '#d1fae5', borderRadius: 3, fontSize: 11, color: '#047857', fontWeight: 600 }}>{w}</div>))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem500Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('keyboard-row')
  const steps = useMemo(() => generateSteps(ex.words).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '⌨️ Keyboard Row', content: (<VisualizationPanel words={ex.words} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}
