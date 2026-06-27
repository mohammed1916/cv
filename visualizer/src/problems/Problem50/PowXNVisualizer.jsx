import { useState, useMemo, useCallback } from 'react'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './PowXNVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def myPow(x, n):' },
  { line: 2, text: '    if n == 0: return 1' },
  { line: 3, text: '    half = myPow(x, n // 2)' },
  { line: 4, text: '    if n % 2 == 0: return half * half' },
  { line: 5, text: '    else: return half * half * x' },
]

const EXAMPLES = getExamples('powx-n') || [
  { label: '2^10', x: 2, n: 10 },
  { label: '2.1^3', x: 2.1, n: 3 },
  { label: '2^-2', x: 2, n: -2 },
]

function generateSteps(x, n) {
  const steps = []
  steps.push({ activeLine: 1, x, n, result: null, message: `Calculate ${x}^${n}` })
  return steps
}

export default function PowXNVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(() => generateSteps(ex.x, ex.n), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset() }, [handleReset])
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: 'viz', title: '🔢 Power Calculation', content: (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(e => (
              <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
          {ex.x}^{ex.n} = {Math.pow(ex.x, ex.n).toFixed(6)}
        </div>
      </div>
    ) },
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
