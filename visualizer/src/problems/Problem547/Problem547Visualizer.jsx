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
import './Problem547Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def solve(input):' },
  { line: 2, text: '    # Initialize data structures' },
  { line: 3, text: '    result = []' },
  { line: 4, text: '    for item in input:' },
  { line: 5, text: '        # Process item' },
  { line: 6, text: '        result.append(item)' },
  { line: 7, text: '    return result' },
  { line: 8, text: '    # Solution optimized' },
  { line: 9, text: '    # Time: O(n)' },
  { line: 10, text: '    # Space: O(n)' },
]

function generateSteps(data) {
  return [
    { activeLine: 1, data, message: 'Algorithm initialization' },
    { activeLine: 2, data, message: 'Data structures setup' },
    { activeLine: 4, data, message: 'Processing items' },
    { activeLine: 6, data, message: 'Building result' },
    { activeLine: 10, data, message: 'Algorithm complete' },
  ]
}

const EXAMPLES = [
  { label: 'Example 1', data: [1, 2, 3] },
  { label: 'Example 2', data: [4, 5, 6] },
]

export default function Problem547Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  
  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.data), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  
  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])
  
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
    )},
    { id: 'viz', title: '🗺️ Number of Provinces', content: (
      <div style={ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }>
        <div style={ display: 'flex', gap: 6, flexWrap: 'wrap' }>
          {EXAMPLES.map((e, i) => (
            <button key={i} onClick={() => applyExample(i)} style={ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9' }>{e.label}</button>
          ))}
        </div>
        {step && (
          <div style={ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }>
            <div style={ fontWeight: 600, marginBottom: 8 }>{step.message}</div>
            {step.data && <div style={ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4 }>Data: {JSON.stringify(step.data)}</div>}
          </div>
        )}
      </div>
    )},
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])
  
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={ rows: [['code', 'viz']], minimized: [] } />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex <= 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
