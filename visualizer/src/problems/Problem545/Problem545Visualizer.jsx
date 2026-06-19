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
import './Problem545Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def trap(height):' },
  { line: 2, text: '    left, right = 0, len(height) - 1' },
  { line: 3, text: '    left_max = right_max = 0' },
  { line: 4, text: '    water = 0' },
  { line: 5, text: '    while left < right:' },
  { line: 6, text: '        if height[left] < height[right]:' },
  { line: 7, text: '            left_max = max(left_max, height[left])' },
  { line: 8, text: '            water += left_max - height[left]' },
  { line: 9, text: '            left += 1' },
  { line: 10, text: '        else:' },
  { line: 11, text: '            right_max = max(right_max, height[right])' },
  { line: 12, text: '            water += right_max - height[right]' },
  { line: 13, text: '            right -= 1' },
  { line: 14, text: '    return water' },
]

function generateSteps(bars) {
  const steps = [
    { activeLine: 1, bars: [...bars], left: 0, right: bars.length - 1, message: 'Initialize water trap simulation' },
    { activeLine: 2, bars: [...bars], left: 0, right: bars.length - 1, message: 'Two pointers setup' },
    { activeLine: 3, bars: [...bars], leftMax: 0, rightMax: 0, message: 'Initialize max heights' },
  ]
  
  let left = 0, right = bars.length - 1
  let leftMax = 0, rightMax = 0, water = 0
  
  while (left < right) {
    if (bars[left] < bars[right]) {
      leftMax = Math.max(leftMax, bars[left])
      water += Math.max(0, leftMax - bars[left])
      steps.push({
        activeLine: 6,
        bars: [...bars],
        left,
        right,
        leftMax,
        rightMax,
        waterLevel: water,
        message: `Left pointer at index ${left}, water: ${water}`
      })
      left++
    } else {
      rightMax = Math.max(rightMax, bars[right])
      water += Math.max(0, rightMax - bars[right])
      steps.push({
        activeLine: 10,
        bars: [...bars],
        left,
        right,
        leftMax,
        rightMax,
        waterLevel: water,
        message: `Right pointer at index ${right}, water: ${water}`
      })
      right--
    }
  }
  
  steps.push({ activeLine: 14, bars: [...bars], water, message: `Total trapped water: ${water}` })
  return steps
}

const EXAMPLES = [
  { label: 'Example 1: [0,1,0,2,1,0,1,3,2,1,2,1]', bars: [0,1,0,2,1,0,1,3,2,1,2,1] },
  { label: 'Example 2: [4,2,0,3,2,5]', bars: [4,2,0,3,2,5] },
  { label: 'Example 3: [2,0,2]', bars: [2,0,2] },
]

export default function Problem545Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  
  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.bars), [ex])
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
    { id: 'viz', title: '💧 Water Trap', content: (
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
              {step.bars && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, padding: '8px 0' }}>
                  {step.bars.map((h, i) => (
                    <motion.div key={i} animate={{ scale: (i === step.left || i === step.right) ? 1.15 : 1 }} style={{ flex: 1, height: h * 12, backgroundColor: (i === step.left || i === step.right) ? '#0ea5e9' : '#94a3b8', borderRadius: 2 }} />
                  ))}
                </div>
              )}
              {step.waterLevel !== undefined && <div style={{ marginTop: 8, padding: 6, backgroundColor: '#dcfce7', borderRadius: 4, fontSize: 10 }}>Total Water: {step.waterLevel}</div>}
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
