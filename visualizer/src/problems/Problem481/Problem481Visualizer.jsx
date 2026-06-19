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
import './Problem481Visualizer.css'

const EXAMPLES = getExamples('magical-string')

function generateSteps(n) {
  const steps = []
  const s = ['1', '2', '2']
  steps.push({ activeLine: 1, n, s: [...s], index: 0, ones: 1, message: 'Build magical string following pattern: 1, 2, 2, 1, 1, 2, ...' })

  let ones = 1
  let twoCount = 0
  let i = 0

  while (s.length < n) {
    const count = parseInt(s[i])
    const char = s.length % 2 === 0 ? '2' : '1'

    steps.push({ activeLine: 2, n, s: [...s], index: i, ones, message: `s[${i}]=${count}: add ${count} '${char}'s` })

    for (let j = 0; j < count && s.length < n; j++) {
      s.push(char)
    }

    if (char === '1') ones = s.length - (s.filter(x => x === '1').length - (char === '1' ? 1 : 0))

    i++
  }

  steps.push({ activeLine: 3, n, s: s.slice(0, n), index: i, ones, done: true, message: `Magical string complete: ones count = ${ones}` })
  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>A magical string contains digits 1 and 2. s[i] tells how many times to repeat the next character.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Target Length: {n}</div>
      </div>

      {step?.s && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>String ({step.s.length} / {n})</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 80, overflowY: 'auto' }}>
            {step.s.map((char, i) => <motion.div key={`char-${i}`} style={{ padding: '6px 10px', borderRadius: 4, border: '2px solid', fontFamily: 'monospace', fontWeight: 600, backgroundColor: char === '1' ? '#f0fdf4' : '#fee2e2', borderColor: char === '1' ? '#10b981' : '#dc2626', color: char === '1' ? '#10b981' : '#dc2626' }} animate={{ scale: 1 }}>{char}</motion.div>)}
          </div>
        </div>
      )}

      <motion.div style={{ padding: 16, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Count of 1's</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{step?.ones ?? 0}</div>
      </motion.div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem481Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { n: 15 })
  const SOLUTION_CODE = useSolutionCode('magical-string')

  const steps = useMemo(() => generateSteps(ex.n).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '✨ Magical String', content: <VisualizationPanel n={ex.n} step={step} applyEx={applyEx} /> },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
