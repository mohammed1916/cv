import { useState, useMemo } from 'react'
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
import './Problem513Visualizer.css'

const EXAMPLES = getExamples('find-bottom-left-tree-value') || [
  { label: 'Example 1', tree: { val: 2, left: { val: 1, left: null, right: null }, right: { val: 3, left: null, right: null } } },
]

function generateSteps(tree) {
  const steps = []
  const queue = [tree]
  let leftmost = tree.val

  steps.push({
    activeLine: 1,
    tree,
    queue: [tree],
    message: 'BFS: Process level by level to find bottom-left value',
    phase: 'Initialize'
  })

  while (queue.length > 0) {
    const levelSize = queue.length
    leftmost = queue[0].val

    steps.push({
      activeLine: 2,
      tree,
      queue: [...queue],
      leftmost,
      message: `Level has ${levelSize} nodes, leftmost: ${leftmost}`,
      phase: 'Level Processing'
    })

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
  }

  steps.push({
    activeLine: 3,
    tree,
    leftmost,
    done: true,
    message: `Bottom-left value: ${leftmost}`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ tree, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, borderLeft: '4px solid #dc2626' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>BFS: Find the leftmost value at the bottom level of the tree.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 4, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7f1d1d' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Tree Structure</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5f2121', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(tree, null, 2)}
        </div>
      </motion.div>

      {step?.queue && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>BFS Queue</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {step.queue.map((node, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: 4,
                  border: '1px solid #fcd34d',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#78350f'
                }}
              >
                {node.val}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.leftmost !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#065f46' }}>Bottom-Left Value: {step.leftmost}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem513Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('find-bottom-left-tree-value')
  const steps = useMemo(() => generateSteps(ex.tree).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🌳 Bottom-Left Value', content: (<VisualizationPanel tree={ex.tree} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

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
