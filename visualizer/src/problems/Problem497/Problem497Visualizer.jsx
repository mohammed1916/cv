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
import './Problem497Visualizer.css'

const EXAMPLES = getExamples('random-point-in-non-overlapping-rectangles') || [
  { label: 'Example', rects: [[1,0,3,0],[2,1,3,2]] },
]

function generateSteps(rects) {
  const steps = []
  steps.push({ activeLine: 1, rects, totalArea: rects.reduce((a,r)=>a+(r[2]-r[0])*(r[3]-r[1]),0), message: 'Calculate total area' })
  steps.push({ activeLine: 2, rects, totalArea: rects.reduce((a,r)=>a+(r[2]-r[0])*(r[3]-r[1]),0), done: true, message: 'Ready to generate random points' })
  return steps
}

function VisualizationPanel({ rects, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#581c87', fontStyle: 'italic' }}>Generate random points proportionally from rectangles.</div>
      </div>
      <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Rectangles: {rects.length}</div></div>
      <motion.div style={{ padding: 16, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #8b5cf6', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#581c87' }}>Total Area</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#8b5cf6' }}>{step?.totalArea ?? 0}</div>
      </motion.div>
    </div>
  )
}

export default function Problem497Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('random-point-in-non-overlapping-rectangles')
  const steps = useMemo(() => generateSteps(ex.rects).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🎲 Random Point', content: (<VisualizationPanel rects={ex.rects} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}
