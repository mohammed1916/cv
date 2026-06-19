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
import './Problem508Visualizer.css'

const EXAMPLES = getExamples('most-frequent-subtree-sum') || [
  { label: 'Example 1', tree: { val: 5, left: { val: 2, left: null, right: null }, right: { val: -3, left: null, right: null } } },
  { label: 'Example 2', tree: { val: 5, left: { val: 2, left: null, right: null }, right: { val: -5, left: null, right: null } } },
]

function generateSteps(tree) {
  const steps = []
  const sums = {}
  const postorder = []

  steps.push({
    activeLine: 1,
    tree,
    sums: {},
    postorder: [],
    message: 'Use DFS post-order traversal to calculate subtree sums',
    phase: 'Setup'
  })

  function dfs(node, depth = 0) {
    if (!node) return 0

    const left = dfs(node.left, depth + 1)
    const right = dfs(node.right, depth + 1)
    const sum = node.val + left + right

    postorder.push({ val: node.val, sum, depth })

    steps.push({
      activeLine: 2,
      tree,
      sums: { ...sums, [sum]: (sums[sum] || 0) + 1 },
      postorder: [...postorder],
      currentNode: node.val,
      currentSum: sum,
      message: `Node ${node.val}: sum = ${node.val} + ${left} + ${right} = ${sum}`,
      phase: 'DFS Traversal'
    })

    sums[sum] = (sums[sum] || 0) + 1
    return sum
  }

  dfs(tree)

  const maxFreq = Math.max(...Object.values(sums))
  const result = Object.keys(sums).filter(sum => sums[sum] === maxFreq).map(Number)

  steps.push({
    activeLine: 3,
    tree,
    sums,
    postorder,
    maxFreq,
    result,
    done: true,
    message: `Most frequent sum(s): ${result.join(', ')} (frequency: ${maxFreq})`,
    phase: 'Result'
  })

  return steps
}

function VisualizationPanel({ tree, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, borderLeft: '4px solid #dc2626' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>Find the most frequent subtree sum using DFS post-order traversal.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 4, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7f1d1d' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, border: '1px solid #fecaca' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Tree Visualization</div>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5f2121', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(tree, null, 2)}
        </div>
      </motion.div>

      {step?.postorder && step.postorder.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Post-order Traversal</div>
          {step.postorder.map((node, i) => (
            <motion.div
              key={i}
              style={{
                padding: '6px 8px',
                marginBottom: 4,
                backgroundColor: step.currentNode === node.val ? '#fcd34d' : '#fef3c7',
                borderRadius: 4,
                border: step.currentNode === node.val ? '2px solid #ca8a04' : '1px solid #fcd34d',
                fontSize: 11,
                fontWeight: 600,
                color: '#78350f'
              }}
              animate={{ backgroundColor: step.currentNode === node.val ? '#fcd34d' : '#fef3c7' }}
            >
              Node {node.val}: sum = {node.sum}
            </motion.div>
          ))}
        </motion.div>
      )}

      {step?.sums && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #7dd3fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Sum Frequency Map</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Object.entries(step.sums).map(([sum, freq], i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 8px',
                  backgroundColor: step.maxFreq === freq ? '#60a5fa' : '#e0f2fe',
                  borderRadius: 4,
                  border: step.maxFreq === freq ? '2px solid #3b82f6' : '1px solid #7dd3fc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  fontWeight: 600,
                  color: step.maxFreq === freq ? 'white' : '#0c4a6e'
                }}
                animate={{ backgroundColor: step.maxFreq === freq ? '#60a5fa' : '#e0f2fe' }}
              >
                <span>Sum: {sum}</span>
                <span>Freq: {freq}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step?.result && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Most Frequent: {step.result.join(', ')}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem508Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('most-frequent-subtree-sum')
  const steps = useMemo(() => generateSteps(ex.tree).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🌳 Subtree Sums', content: (<VisualizationPanel tree={ex.tree} step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls
          isPlaying={isPlaying}
          isDone={isDone}
          speed={speed}
          onPlayToggle={togglePlay}
          onPrev={stepBack}
          onNext={stepForward}
          onReset={handleReset}
          prevDisabled={stepIndex < 0}
          nextDisabled={isDone}
          resetDisabled={stepIndex < 0}
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
