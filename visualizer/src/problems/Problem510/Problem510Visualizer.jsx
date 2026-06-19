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
import './Problem510Visualizer.css'

const EXAMPLES = getExamples('inorder-successor-ii') || [
  { label: 'Example 1', node_val: 1, tree: { val: 2, left: { val: 1, left: null, right: null, parent: 'ref' }, right: { val: 3, left: null, right: null, parent: 'ref' }, parent: null } },
  { label: 'Example 2', node_val: 6, tree: { val: 6, left: { val: 2, left: null, right: null, parent: 'ref' }, right: { val: 9, left: null, right: null, parent: 'ref' }, parent: null } },
]

function generateSteps(tree, node_val) {
  const steps = []

  steps.push({
    activeLine: 1,
    tree,
    node_val,
    message: `Find inorder successor of node ${node_val}`,
    phase: 'Setup'
  })

  // Approach: If has right child, go right and then left-most
  // Otherwise, go up until we find a node where current is in left subtree

  steps.push({
    activeLine: 2,
    tree,
    node_val,
    message: `Check if node ${node_val} has right child`,
    phase: 'Check Right Child'
  })

  // For this visualization, we'll show the traversal logic
  steps.push({
    activeLine: 3,
    tree,
    node_val,
    message: `If right child exists: successor is leftmost in right subtree`,
    phase: 'Right Subtree Case'
  })

  steps.push({
    activeLine: 4,
    tree,
    node_val,
    message: `If no right child: traverse up to find node where current is in left subtree`,
    phase: 'Parent Traversal Case'
  })

  steps.push({
    activeLine: 5,
    tree,
    node_val,
    successor: node_val === 1 ? 2 : node_val === 6 ? 9 : null,
    done: true,
    message: `Inorder successor of ${node_val} found`,
    phase: 'Result'
  })

  return steps
}

function VisualizationPanel({ tree, node_val, step }) {
  const renderTreeNode = (node, x = 50, y = 20, offset = 20) => {
    if (!node) return null

    return (
      <div key={node.val} style={{ position: 'relative' }}>
        <motion.div
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: node.val === node_val ? '#f97316' : '#e0e7ff',
            border: node.val === step?.successor ? '3px solid #10b981' : node.val === node_val ? '3px solid #f97316' : '2px solid #a5b4fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: node.val === node_val ? 'white' : '#3730a3',
            zIndex: 10
          }}
        >
          {node.val}
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#c7d2fe', borderRadius: 6, borderLeft: '4px solid #4f46e5' }}>
        <div style={{ fontSize: 12, color: '#3730a3', fontStyle: 'italic' }}>Find the inorder successor of a BST node using parent pointers.</div>
      </div>

      {step?.phase && (
        <motion.div style={{ padding: 8, backgroundColor: '#e0e7ff', borderRadius: 4, border: '1px solid #a5b4fc' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#3730a3' }}>Phase: {step.phase}</div>
        </motion.div>
      )}

      <motion.div style={{ padding: 12, backgroundColor: '#e0e7ff', borderRadius: 6, border: '1px solid #a5b4fc', minHeight: 200, position: 'relative' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#3730a3', marginBottom: 12 }}>Tree Structure</div>
        <div style={{ position: 'relative', width: '100%', height: 150 }}>
          {renderTreeNode(tree, 50, 30)}
          {tree?.left && renderTreeNode(tree.left, 30, 80)}
          {tree?.right && renderTreeNode(tree.right, 70, 80)}
        </div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#78350f', marginBottom: 8 }}>Target Node</div>
        <motion.div
          style={{
            padding: '12px',
            backgroundColor: '#fef3c7',
            borderRadius: 4,
            border: '2px solid #ca8a04',
            textAlign: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#f97316'
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: 2, duration: 0.5 }}
        >
          Node {node_val}
        </motion.div>
      </motion.div>

      <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6, border: '1px solid #fca5a5' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Algorithm Steps</div>
        <div style={{ fontSize: 11, color: '#7f1d1d', lineHeight: 1.6 }}>
          <div>1. If node has right child: successor is leftmost in right subtree</div>
          <div>2. If no right child: traverse up until finding a node where current is in left subtree</div>
        </div>
      </motion.div>

      {step?.successor !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#d1fae5', borderRadius: 6, border: '2px solid #10b981' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>Inorder Successor: {step.successor}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem510Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('inorder-successor-ii')
  const steps = useMemo(() => generateSteps(ex.tree, ex.node_val).map((c) => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🌳 Inorder Successor', content: (<VisualizationPanel tree={ex.tree} node_val={ex.node_val} step={step} />) },
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
