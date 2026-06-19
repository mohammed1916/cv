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
import './Problem499Visualizer.css'

const EXAMPLES = getExamples('the-maze-iii') || [
  { label: 'Example', maze: [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], ball: [0,4], hole: [4,4] },
]

function generateSteps(maze, ball, hole) {
  const steps = []
  steps.push({ activeLine: 1, maze, ball, hole, path: '', message: 'Find lexicographically smallest path to hole' })
  steps.push({ activeLine: 2, maze, ball, hole, path: '', done: true, message: 'BFS finds all paths, return smallest' })
  return steps
}

function VisualizationPanel({ maze, ball, hole, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>Ball rolls until hitting wall. Find path directions to reach hole.</div>
      </div>
      <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${maze[0].length}, 1fr)`, gap: 2 }}>
        {maze.map((row, r) => row.map((val, c) => (<motion.div key={`z${r}${c}`} style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: val === 1 ? '#000' : '#fef3c7', border: '1px solid #f59e0b', fontSize: 10, fontWeight: 700 }} animate={{ scale: (r === ball[0] && c === ball[1]) || (r === hole[0] && c === hole[1]) ? 1.1 : 1 }}>{r === ball[0] && c === ball[1] ? 'B' : r === hole[0] && c === hole[1] ? 'H' : ''}</motion.div>)))}
      </div>
      <motion.div style={{ padding: 16, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Path</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }}>{step?.path || 'Finding...'}</div>
      </motion.div>
    </div>
  )
}

export default function Problem499Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('the-maze-iii')
  const steps = useMemo(() => generateSteps(ex.maze, ex.ball, ex.hole).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🎱 Maze III', content: (<VisualizationPanel maze={ex.maze} ball={ex.ball} hole={ex.hole} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])
  return (<div className="problem-shell"><DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} /><FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle /></FloatingPanel>{showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}</div>)
}
