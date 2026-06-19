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
import './Problem482Visualizer.css'

const EXAMPLES = getExamples('license-key-formatting')

function generateSteps(s, k) {
  const steps = []
  const result = []

  steps.push({ activeLine: 1, s, k, processed: '', groups: 0, message: 'Format license key: remove dashes, convert to uppercase, group digits' })

  for (let i = 0; i < Math.min(s.length, 10); i++) {
    const char = s[i]
    if (char === '-') continue

    const upper = char.toUpperCase()
    steps.push({ activeLine: 2, s, k, processed: upper, groups: Math.floor(result.length / k), message: `Process '${char}' → '${upper}'` })

    result.push(upper)
  }

  const groups = []
  for (let i = result.length - 1; i >= 0; i -= k) {
    groups.unshift(result.slice(Math.max(0, i - k + 1), i + 1).join(''))
  }

  steps.push({ activeLine: 3, s, k, processed: result.join(''), groups: groups.length, done: true, message: `Formatted: ${groups.join('-')}` })

  return steps
}

function VisualizationPanel({ s, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>Format license key: remove dashes, uppercase letters, group every k characters with dashes.</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>{e.label}</button>)}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input: "{s}" | Group Size: {k}</div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Original Characters</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s.split('').map((char, i) => (
            <motion.div key={`char-${i}`} style={{ padding: '6px 10px', borderRadius: 4, border: '2px solid', fontFamily: 'monospace', fontWeight: 600, backgroundColor: char === '-' ? '#fee2e2' : '#f0fdf4', borderColor: char === '-' ? '#dc2626' : '#10b981' }} animate={{ scale: 1 }}>
              {char}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div style={{ padding: 16, backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Processed</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#10b981', wordBreak: 'break-all' }}>{step?.processed || ''}</div>
        </motion.div>

        <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 6 }}>
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Groups</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#f59e0b' }}>{step?.groups ?? 0}</div>
        </motion.div>
      </div>

      <motion.div style={{ padding: 16, backgroundColor: '#f8f4ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem482Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { s: '5F3Z-2e-9-w', k: 4 })
  const SOLUTION_CODE = useSolutionCode('license-key-formatting')

  const steps = useMemo(() => generateSteps(ex.s, ex.k).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '🔐 License Key Formatting', content: <VisualizationPanel s={ex.s} k={ex.k} step={step} applyEx={applyEx} /> },
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
