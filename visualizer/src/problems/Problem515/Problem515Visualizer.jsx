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
import './Problem515Visualizer.css'

const EXAMPLES = getExamples('find-largest-value-each-row') || [
  { label: 'Example 1', tree: { val: 1, left: { val: 3, left: null, right: null }, right: { val: 2, left: null, right: null } } },
]

function generateSteps(tree) {
  const steps = []
  const result = []
  const queue = [tree]

  steps.push({
    activeLine: 1,
    tree,
    result: [],
    queue: [tree],
    message: 'BFS: Find largest value at each level',
    phase: 'Initialize'
  })

  let level = 0
  while (queue.length > 0) {
    const levelSize = queue.length
    let maxVal = -Infinity

    steps.push({
      activeLine: 2,
      tree,
      result: [...result],
      queue: [...queue],
      currentLevel: level,
      message: `Processing level ${level} with ${levelSize} nodes`,
      phase: 'Level Processing'
    })

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      maxVal = Math.max(maxVal, node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(maxVal)
    steps.push({
      activeLine: 3,
      tree,
      result: [...result],
      queue: [...queue],
      currentLevel: level,
      levelMax: maxVal,
      message: `Max value at level ${level}: ${maxVal}`,
      phase: 'Max Found'
    })

    level++
  }

  steps.push({
    activeLine: 4,
    tree,
    result,
    done: true,
    message: `Result: [${result.join(', ')}]`,
    phase: 'Complete'
  })

  return steps
}

function VisualizationPanel({ tree, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>BFS: Find the largest value in each row of a binary tree.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0f2fe', borderRadius: 4, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#0c4a6e' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0f2fe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Tree Structure</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#0369a1', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(tree, null, 2)}
        </div>
      </motion.div>

      {step?.queue && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Current Queue</div>
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

      {step?.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '1px solid #6ee7b7' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Largest Values Per Row</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {step.result.map((val, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: i === step.currentLevel ? '#10b981' : '#d1fae5',
                  borderRadius: 4,
                  border: i === step.currentLevel ? '2px solid #059669' : '1px solid #6ee7b7',
                  fontSize: 11,
                  fontWeight: 600,
                  color: i === step.currentLevel ? 'white' : '#065f46'
                }}
                animate={{ backgroundColor: i === step.currentLevel ? '#10b981' : '#d1fae5' }}
              >
                L{i}: {val}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem515Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('find-largest-value-each-row')
  const steps = useMemo(() => generateSteps(ex.tree).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🌳 Largest Value Per Row', content: (<VisualizationPanel tree={ex.tree} step={step} />) },
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
