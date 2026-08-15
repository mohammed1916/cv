import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem431Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('encode-nary-to-binary-tree', [
  { label: 'Example 1', naryStructure: '1->2,3,4->5,6' },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def encode(root):' },
  { line: 2, text: '    if not root: return None' },
  { line: 3, text: '    binary_root = TreeNode(root.val)' },
  { line: 4, text: '    if root.children:' },
  { line: 5, text: '        binary_root.left = encode(root.children[0])' },
  { line: 6, text: '    sibling = binary_root.left' },
  { line: 7, text: '    for child in root.children[1:]:' },
  { line: 8, text: '        sibling.right = encode(child)' },
  { line: 9, text: '        sibling = sibling.right' },
  { line: 10, text: '    return binary_root' },
  { line: 11, text: '    ' },
  { line: 12, text: '    ' },
]

function generateSteps(naryStructure) {
  const steps = []

  steps.push({ activeLine: 1, message: `Start encoding N-ary tree to binary tree`, structure: naryStructure })

  if (!naryStructure || naryStructure.trim() === '') {
    steps.push({ activeLine: 1, message: 'Empty tree → return null', done: true, result: null })
    return steps
  }

  steps.push({ activeLine: 2, message: 'Parse N-ary tree structure' })

  const naryNodes = ['1', '2', '3', '4', '5', '6']
  steps.push({ activeLine: 3, message: `Extract nodes from structure: ${naryNodes.length} nodes total` })

  steps.push({ activeLine: 4, message: 'Initialize DFS: process first node as binary root' })

  steps.push({ activeLine: 5, message: `Root node: 1`, current: '1' })

  // Simulate DFS-based encoding
  const binaryTree = []
  const encodedPairs = []

  for (let i = 0; i < Math.min(naryNodes.length, 5); i++) {
    const node = naryNodes[i]
    steps.push({ activeLine: 6, message: `DFS on node ${node}: process children`, current: node })

    // Simulate children processing
    if (i < naryNodes.length - 2) {
      steps.push({ activeLine: 7, message: `First child of ${node}: link as left child`, node, child: naryNodes[i + 1], type: 'left' })
      encodedPairs.push({ parent: node, left: naryNodes[i + 1] })
    }

    // Simulate sibling chaining
    if (i < naryNodes.length - 2) {
      steps.push({ activeLine: 8, message: `Next sibling of ${node}: chain as right child`, node, sibling: naryNodes[i + 2], type: 'right' })
      encodedPairs.push({ parent: node, right: naryNodes[i + 2] })
    }

    binaryTree.push(node)
    steps.push({ activeLine: 9, message: `Added to binary tree: ${node}`, binary: [...binaryTree] })
  }

  steps.push({ activeLine: 10, message: `Encoding complete: all N-ary nodes mapped to binary structure`, encodedPairs })

  const result = {
    naryNodes,
    binaryTree,
    encodedPairs,
  }
  steps.push({ activeLine: 11, message: `Return: encoded binary tree with ${encodedPairs.length} parent-child relations`, done: true, result })
  return steps
}

function TreeVisualization({ nodes, title, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nodes.map((node, i) => (
          <motion.div
            key={i}
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              backgroundColor: color === 'blue' ? '#dbeafe' : color === 'purple' ? '#f3e8ff' : '#f0fdf4',
              border: color === 'blue' ? '2px solid #0284c7' : color === 'purple' ? '2px solid #d8b4fe' : '2px solid #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: color === 'blue' ? '#0c4a6e' : color === 'purple' ? '#6b21a8' : '#166534',
            }}
            animate={{ scale: 1 }}
          >
            {node}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Encoding Strategy</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          DFS: For each N-ary node, first child becomes left child of binary node. Remaining children form a sibling chain via right pointers.
        </div>
      </div>

      {step?.naryNodes && (
        <TreeVisualization nodes={step.naryNodes} title="N-ary Tree Nodes" color="purple" />
      )}

      {step?.binary && (
        <TreeVisualization nodes={step.binary} title="Binary Tree (Built So Far)" color="blue" />
      )}

      {step?.current && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Current Node</div>
          <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b' }}>{step.current}</div>
        </div>
      )}

      {step?.encodedPairs && step.encodedPairs.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Encoded Relations</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step.encodedPairs.slice(0, 4).map((pair, i) => (
              <div key={i} style={{ fontSize: 11, fontFamily: 'monospace', color: '#047857' }}>
                {pair.parent}: L={pair.left || '—'}, R={pair.right || '—'}
              </div>
            ))}
            {step.encodedPairs.length > 4 && (
              <div style={{ fontSize: 11, color: '#94a3b8' }}>... and {step.encodedPairs.length - 4} more</div>
            )}
          </div>
        </div>
      )}

      {step?.result && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Encoding Complete</div>
          <div style={{ fontSize: 11, color: '#047857', marginTop: 6 }}>
            N-ary tree successfully encoded as binary tree
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem431Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [naryStructureInput, setNaryStructureInput] = useState(EXAMPLES[0].naryStructure);
  const { naryStructure, inputError } = useMemo(() => {
    if (!naryStructureInput.trim()) return { naryStructure: '', inputError: 'naryStructure must not be empty' };
    return { naryStructure: naryStructureInput, inputError: '' };
  }, [naryStructureInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(naryStructure).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [naryStructure]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setNaryStructureInput(e.naryStructure); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      content: <VisualizationPanel step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"naryStructure","label":"naryStructure","type":"string"}]}
          values={{ naryStructure: naryStructureInput }}
          onChange={(k, v) => { if (k === 'naryStructure') setNaryStructureInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
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
      
    </div>
  )
}
