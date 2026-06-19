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
import './Problem493Visualizer.css'

const EXAMPLES = getExamples('reverse-pairs') || [
  { label: 'Example 1', nums: [1,2,3,4,5] },
  { label: 'Example 2', nums: [40,26,26,2,6,4,85] },
]

function generateSteps(nums) {
  const steps = []
  const pairs = []

  steps.push({ activeLine: 1, nums, pairs: [], count: 0, message: 'Find pairs where i < j and nums[i] > 2*nums[j]' })

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] > 2 * nums[j]) {
        pairs.push([i, j, nums[i], nums[j]])
        steps.push({ activeLine: 2, nums, pairs: [...pairs], count: pairs.length, i, j, message: `Found pair: nums[${i}]=${nums[i]} > 2*nums[${j}]=${2*nums[j]}` })
      }
    }
  }

  steps.push({ activeLine: 3, nums, pairs, count: pairs.length, done: true, message: `Total reverse pairs: ${pairs.length}` })
  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#4c1d95', fontStyle: 'italic' }}>Find pairs (i,j) where i < j and nums[i] > 2*nums[j] using divide & conquer.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Array: [{nums.join(', ')}]</div></div>
      {step?.pairs && step.pairs.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '1px solid #8b5cf6', maxHeight: 150, overflowY: 'auto' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95', marginBottom: 8 }}>Pairs Found ({step.pairs.length})</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.pairs.slice(-8).map((p, idx) => (<div key={idx} style={{ padding: '4px 8px', backgroundColor: '#f3e8ff', borderRadius: 3, fontSize: 11, color: '#4c1d95' }}>({p[0]},{p[1]})</div>))}
          </div>
        </motion.div>
      )}
      <motion.div style={{ padding: 16, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #8b5cf6', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#4c1d95' }}>Reverse Pairs</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#8b5cf6' }}>{step?.count ?? 0}</div>
        <div style={{ fontSize: 12, color: '#8b5cf6', marginTop: 8 }}>{step?.message || ''}</div>
      </motion.div>
    </div>
  )
}

export default function Problem493Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('reverse-pairs')
  const steps = useMemo(() => generateSteps(ex.nums).map((current) => ({ ...current, relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '↔️ Reverse Pairs', content: (<VisualizationPanel nums={ex.nums} step={step} applyEx={applyEx} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}
