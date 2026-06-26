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
import './ExcelSheetColumnNumberVisualizer.css'

const EXAMPLES = [
  { label: 'Example 1', s: 'A' },
  { label: 'Example 2', s: 'AB' },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def titleToNumber(s):' },
  { line: 2, text: '    result = 0' },
  { line: 3, text: '    for char in s:' },
  { line: 4, text: '        result = result * 26' },
  { line: 5, text: '        result += ord(char) - ord("A") + 1' },
  { line: 6, text: '    return result' },
]

function generateSteps(s) {
  const steps = []
  steps.push({ activeLine: 1, s, message: `Convert "${s}" to column number`, relatedLines: [1] })
  steps.push({ activeLine: 2, result: 0, message: 'Initialize result = 0', relatedLines: [2] })

  let result = 0
  for (let i = 0; i < s.length; i++) {
    const char = s[i]
    const val = char.charCodeAt(0) - 'A'.charCodeAt(0) + 1
    result = result * 26 + val
    steps.push({
      activeLine: 4,
      s, char, charValue: val, result, position: i,
      message: `Char '${char}' (${val}): result = ${result}`,
      relatedLines: [4, 5],
    })
  }

  steps.push({ activeLine: 6, s, result, done: true, message: `Result: ${result}`, relatedLines: [6] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>Base-26: multiply by 26, add value.</div>
      </div>
      {step.s && <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Input</div>
        <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#0c4a6e', fontWeight: 600 }}>{step.s}</div>
      </motion.div>}
      {step.char && <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Current: '{step.char}' = {step.charValue}</div>
      </motion.div>}
      {step.result !== undefined && <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Result</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{step.result}</div>
      </motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function ExcelSheetColumnNumberVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(() => generateSteps(input.s).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [input])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '🔢 Excel Column', content: <VisualizationPanel step={step} /> },
  ], [step, connectivity, setActiveLineDom])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
