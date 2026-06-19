import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './Problem431Visualizer.css'

const EXAMPLES = getExamples('encode-nary-to-binary-tree')

function generateSteps(naryNodes) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    naryNodes,
    binaryTree: [],
    encodedPairs: [],
    currentNode: null,
    message: `Start encoding N-ary tree to binary tree`,
  })

  let binaryTree = []
  let encodedPairs = []

  for (let i = 0; i < Math.min(naryNodes.length, 6); i++) {
    const node = naryNodes[i]
    const left = i * 2 + 1 < naryNodes.length ? naryNodes[i * 2 + 1] : null
    const right = i + 1 < naryNodes.length ? naryNodes[i + 1] : null

    encodedPairs.push({ parent: node, left, right })
    binaryTree.push(node)

    steps.push({
      activeLine: 2,
      phase: 'encode_node',
      naryNodes,
      binaryTree: [...binaryTree],
      encodedPairs: [...encodedPairs],
      currentNode: node,
      message: `Encode node ${node}: left=${left}, right=${right}`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'complete',
    naryNodes,
    binaryTree: [...binaryTree],
    encodedPairs: [...encodedPairs],
    currentNode: null,
    isComplete: true,
    message: `N-ary tree encoded to binary tree`,
  })

  return steps
}

function NaryTreeVisualization({ nodes, currentNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>N-ary Tree Nodes</div>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {nodes.map((node, idx) => (
          <motion.div
            key={idx}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              border: node === currentNode ? '3px solid #dc2626' : '2px solid #cbd5e1',
              backgroundColor: node === currentNode ? '#fee2e2' : '#f1f5f9',
              color: node === currentNode ? '#991b1b' : '#64748b',
            }}
            animate={{
              scale: node === currentNode ? 1.1 : 1,
            }}
          >
            {node}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function EncodingVisualization({ pairs, currentNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Encoding Rules</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {pairs.slice(0, 4).map((pair, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: '10px 12px',
              borderRadius: 4,
              border: pair.parent === currentNode ? '3px solid #0284c7' : '2px solid #cbd5e1',
              backgroundColor: pair.parent === currentNode ? '#dbeafe' : '#f1f5f9',
              fontSize: 11,
              fontFamily: 'monospace',
              color: pair.parent === currentNode ? '#0c4a6e' : '#475569',
            }}
            animate={{
              scale: pair.parent === currentNode ? 1.02 : 1,
            }}
          >
            <div style={{ fontWeight: 600 }}>Node {pair.parent}</div>
            <div style={{ marginTop: 4, fontSize: 10 }}>
              left: {pair.left ?? 'null'}, right: {pair.right ?? 'null'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function BinaryTreeVisualization({ tree, isComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Binary Tree Result {isComplete && '✓'}
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {tree.length > 0 ? (
          tree.map((node, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                backgroundColor: '#ecfdf5',
                border: '2px solid #10b981',
                fontSize: 12,
                fontWeight: 600,
                color: '#047857',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {node}
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>encoding...</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <NaryTreeVisualization
          nodes={step?.naryNodes || []}
          currentNode={step?.currentNode}
        />

        <EncodingVisualization
          pairs={step?.encodedPairs || []}
          currentNode={step?.currentNode}
        />

        <BinaryTreeVisualization
          tree={step?.binaryTree || []}
          isComplete={step?.isComplete || false}
        />
      </div>
    </div>
  )
}

export default function Problem431Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { naryNodes: [1, 2, 3, 4, 5, 6], label: 'NaryTree' })
  const SOLUTION_CODE = useSolutionCode('encode-nary-to-binary-tree')

  const steps = useMemo(
    () =>
      generateSteps(ex.naryNodes).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '🌳 N-ary to Binary',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
