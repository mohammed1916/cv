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
import './Problem546Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def removeBoxes(boxes):' },
  { line: 2, text: '    memo = {}' },
  { line: 3, text: '    def dp(i, j, k):' },
  { line: 4, text: '        if i > j: return 0' },
  { line: 5, text: '        if (i, j, k) in memo: return memo[(i, j, k)]' },
  { line: 6, text: '        while i < j and boxes[i] == boxes[i+1]:' },
  { line: 7, text: '            i += 1; k += 1' },
  { line: 8, text: '        res = (k + 1) ** 2 * dp(i+1, j, 1)' },
  { line: 9, text: '        for m in range(i+1, j+1):' },
  { line: 10, text: '            if boxes[i] == boxes[m]:' },
  { line: 11, text: '                res = max(res, dp(i+1, m-1, 1) + dp(m, j, k+1))' },
  { line: 12, text: '        return memo[(i, j, k)] = res' },
  { line: 13, text: '    return dp(0, len(boxes)-1, 1)' },
]

function generateSteps(boxes) {
  const steps = []
  const boxStr = `[${boxes.join(', ')}]`
  
  steps.push({
    activeLine: 1,
    boxes: [...boxes],
    message: `Remove boxes to maximize points: ${boxStr}`
  })
  
  steps.push({
    activeLine: 2,
    boxes: [...boxes],
    message: 'Memoization table initialized'
  })
  
  steps.push({
    activeLine: 3,
    boxes: [...boxes],
    message: 'DP function with (left, right, count) state'
  })
  
  for (let i = 0; i < boxes.length; i++) {
    steps.push({
      activeLine: 9,
      boxes: [...boxes],
      currentIdx: i,
      message: `Considering boxes[${i}] = ${boxes[i]}`
    })
  }
  
  steps.push({
    activeLine: 13,
    boxes: [...boxes],
    message: 'DP solution computed'
  })
  
  return steps
}

const EXAMPLES = [
  { label: 'Example 1: [1,3,2,2,2]', boxes: [1, 3, 2, 2, 2] },
  { label: 'Example 2: [1,1,1]', boxes: [1, 1, 1] },
  { label: 'Example 3: [1,2,1]', boxes: [1, 2, 1] },
]

export default function Problem546Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  
  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.boxes), [ex])
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
    { id: 'viz', title: '📦 Remove Boxes', content: (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((e, i) => (
            <button key={i} onClick={() => applyExample(i)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>
          ))}
        </div>
        {step && (
          <>
            <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
              {step.boxes && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.boxes.map((box, i) => (
                    <motion.div key={i} animate={{ scale: i === step.currentIdx ? 1.2 : 1, backgroundColor: i === step.currentIdx ? '#0ea5e9' : '#94a3b8' }} style={{ padding: '8px 12px', borderRadius: 4, color: 'white', fontWeight: 600, fontSize: 12 }}>{box}</motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )},
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])
  
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex <= 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
