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
import './Problem496Visualizer.css'

const EXAMPLES = getExamples('next-greater-element-i') || [
  { label: 'Ex1', nums1: [4,1,2], nums2: [1,3,4,2] },
  { label: 'Ex2', nums1: [2,4], nums2: [1,2,3,4] },
]

function generateSteps(nums1, nums2) {
  const steps = []
  const result = new Map()
  const stack = []
  steps.push({ activeLine: 1, nums1, nums2, stack: [], result: new Map(), message: 'Init stack for nums2' })
  for (let num of nums2) {
    while (stack.length && stack[stack.length-1] < num) { result.set(stack.pop(), num) }
    stack.push(num)
  }
  steps.push({ activeLine: 2, nums1, nums2, stack, result, message: 'Built map for all elements' })
  const ans = nums1.map(n => result.get(n) ?? -1)
  steps.push({ activeLine: 3, nums1, nums2, ans, done: true, message: `Result: [${ans.join(',')}]` })
  return steps
}

function VisualizationPanel({ nums1, nums2, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>Find next greater element for each num in nums1.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>nums1=[{nums1.join(',')}], nums2=[{nums2.join(',')}]</div></div>
      {step?.ans && (
        <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Result</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#f59e0b' }}>[{step.ans.join(', ')}]</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem496Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('next-greater-element-i')
  const steps = useMemo(() => generateSteps(ex.nums1, ex.nums2).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '➡️ Next Greater', content: (<VisualizationPanel nums1={ex.nums1} nums2={ex.nums2} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}
