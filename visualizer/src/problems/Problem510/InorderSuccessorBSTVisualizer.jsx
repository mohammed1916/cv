import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './InorderSuccessorBSTVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('inorder-successor-bst')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'loop',


  7: 'loop',


  8: 'done',


}

const EXAMPLES = getExamples('inorder-successor-bst')

function generateSteps(values, target) {
  const steps = []

  const tree = buildTree(values)
  if (!tree) {
    steps.push({
      activeLine: 1,
      tree,
      visited: new Set(),
      current: null,
      message: 'Empty tree',
      relatedLines: [1]
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    tree,
    visited: new Set(),
    current: null,
    targetNode: target,
    message: `Find inorder successor of node ${target}`,
    relatedLines: [1]
  })

  const visited = new Set()
  let current = findNode(tree, target)
  let result = null

  if (!current) {
    steps.push({
      activeLine: 2,
      tree,
      visited,
      current: null,
      done: true,
      message: 'Target node not found',
      relatedLines: [2]
    })
    return steps
  }

  steps.push({
    activeLine: 3,
    tree,
    visited,
    current: current.val,
    targetNode: target,
    message: `Found target node ${target}`,
    relatedLines: [3]
  })

  if (current.right) {
    steps.push({
      activeLine: 4,
      tree,
      visited,
      current: current.val,
      message: 'Right subtree exists, find leftmost node in right subtree',
      relatedLines: [4]
    })

    let node = current.right
    while (node.left) {
      node = node.left
    }
    result = node.val

    steps.push({
      activeLine: 5,
      tree,
      visited,
      current: node.val,
      result,
      message: `Inorder successor is rightmost node: ${result}`,
      relatedLines: [5]
    })
  } else {
    steps.push({
      activeLine: 6,
      tree,
      visited,
      current: current.val,
      message: 'No right subtree, traverse up to find successor',
      relatedLines: [6]
    })

    let node = current
    let parent = current.parent
    while (parent && node === parent.right) {
      node = parent
      parent = parent.parent
    }
    if (parent) {
      result = parent.val
    }

    steps.push({
      activeLine: 7,
      tree,
      visited,
      current: result,
      result,
      message: `Inorder successor: ${result || 'null'}`,
      relatedLines: [7]
    })
  }

  steps.push({
    activeLine: 8,
    tree,
    visited,
    current: result,
    result,
    done: true,
    message: `Result: ${result !== null ? result : 'null'}`,
    relatedLines: [8]
  })

  return steps
}

function buildTree(values) {
  if (!values || values.length === 0) return null
  const nodes = values.map((val) => val !== null ? { val, left: null, right: null, parent: null } : null)
  nodes.forEach((node, idx) => {
    if (node) {
      const leftIdx = 2 * idx + 1
      const rightIdx = 2 * idx + 2
      if (leftIdx < nodes.length && nodes[leftIdx]) {
        node.left = nodes[leftIdx]
        nodes[leftIdx].parent = node
      }
      if (rightIdx < nodes.length && nodes[rightIdx]) {
        node.right = nodes[rightIdx]
        nodes[rightIdx].parent = node
      }
    }
  })
  return nodes[0]
}

function findNode(tree, val) {
  if (!tree) return null
  if (tree.val === val) return tree
  const left = findNode(tree.left, val)
  if (left) return left
  return findNode(tree.right, val)
}

function TreeNode({ node, x, y, offset, step, targetNode, resultNode }) {
  if (!node) return null

  const isTarget = step && step.targetNode === node.val
  const isResult = step && step.result === node.val
  const isCurrent = step && step.current === node.val

  return (
    <g key={`tree-${node.val}-${x}-${y}`}>
      {node.left && (
          <line x1={x} y1={y} x2={x - offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.left} x={x - offset} y={y + 80} offset={offset / 2} step={step} targetNode={targetNode} resultNode={resultNode} />
        </>
      )}
      {node.right && (
          <line x1={x} y1={y} x2={x + offset} y2={y + 80} stroke="#cbd5e1" strokeWidth="2" />
          <TreeNode node={node.right} x={x + offset} y={y + 80} offset={offset / 2} step={step} targetNode={targetNode} resultNode={resultNode} />
        </>
      )}
      <motion.circle
        cx={x}
        cy={y}
        r="28"
        fill={isResult ? '#fce7f3' : isTarget ? '#fce7f3' : isCurrent ? '#fce7f3' : '#f1f5f9'}
        stroke={isResult ? '#ec4899' : isTarget ? '#ec4899' : isCurrent ? '#ec4899' : '#cbd5e1'}
        strokeWidth={isResult || isTarget ? '3' : '2'}
        animate={{ scale: isTarget || isResult ? 1.2 : 1 }}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dy="0.3em"
        fontFamily="monospace"
        fontSize="14"
        fontWeight="600"
        fill={isTarget || isResult ? '#be185d' : '#334155'}
      >
        {node.val}
      </text>
    </g>
  )
}

function VisualizationPanel({ values, target, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#fce7f3', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          "Given a node in a BST with parent pointers, find its inorder successor. The inorder successor is the node with the smallest value greater than the given node."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tree Visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Binary Search Tree</div>
        <svg width="100%" height="400" viewBox="0 0 500 400" style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
          <TreeNode
            node={step?.tree || (values && values.length > 0 ? buildTree(values) : null)}
            x={250}
            y={40}
            offset={100}
            step={step}
            targetNode={target}
          />
        </svg>
      </div>

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fce7f3',
          borderRadius: 6,
          border: '2px solid #ec4899',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ec4899' }}>
          Successor of {target}: {step?.result !== undefined ? step.result : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#ec4899', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function InorderSuccessorBSTVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [valuesInput, setValuesInput] = useState("[2,1,3]");
  const [targetInput, setTargetInput] = useState(1);
  const { values, target, inputError } = useMemo(() => {
    try {
      const parsedValues = JSON.parse(valuesInput); if (!Array.isArray(parsedValues)) throw new Error('values must be an array');
      const parsedTarget = Number(targetInput); if (isNaN(parsedTarget)) throw new Error('target must be a number');
      return { values: parsedValues, target: parsedTarget, inputError: '' };
    } catch (e) {
      return { values: "[2,1,3]", target: 1, inputError: e.message };
    }
  }, [valuesInput, targetInput]);

  const steps = useMemo(
    () =>
      generateSteps(values, target).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [values, target]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setValuesInput(JSON.stringify(e.values)); setTargetInput(String(e.target)); handleReset(); }, [handleReset]);

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
      title: '🌳 Inorder Successor in BST',
      content: (
        <VisualizationPanel
          values={values}
          target={target}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
          onSpeedChange={e => setSpeed(Number(e.target.value
    </>))}
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

