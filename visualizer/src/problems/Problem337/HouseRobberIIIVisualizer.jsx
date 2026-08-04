import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import {
  buildTree,
  buildEdges,
  collectNodes,
  computeLayout,
  parseTreeInput,
  TreeSVG,
} from '../../components/treeUtils'
import './HouseRobberIIIVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def rob(self, root):' },
  { line: 3, text: '        def dfs(node):' },
  { line: 4, text: '            if not node:' },
  { line: 5, text: '                return (0, 0)' },
  { line: 6, text: '            left = dfs(node.left)' },
  { line: 7, text: '            right = dfs(node.right)' },
  { line: 8, text: '            rob = node.val + left[1] + right[1]' },
  { line: 9, text: '            skip = max(left) + max(right)' },
  { line: 10, text: '            return (rob, skip)' },
  { line: 11, text: '        return max(dfs(root))' },
]

const CANVAS_WIDTH = 640
const LEVEL_H = 88

// Build the tree from a level-order array and trace the postorder DP.
// dfs(node) returns (rob, skip):
//   rob  = node.val + left.skip + right.skip     (can't rob children)
//   skip = max(left) + max(right)                (children free to choose)
function generateSteps(treeArray) {
  const steps = []
  const root = buildTree(treeArray)

  if (!root) {
    steps.push({
      phase: 'done',
      activeLine: 11,
      relatedLines: [11],
      message: 'The tree is empty, so no money can be robbed. Answer = 0.',
      currentId: null,
      answer: 0,
      dp: {},
      robbedIds: [],
    })
    return steps
  }

  const dp = new Map()
  const snapshot = () => {
    const obj = {}
    for (const [id, v] of dp.entries()) obj[id] = v
    return obj
  }

  steps.push({
    phase: 'init',
    activeLine: 11,
    relatedLines: [2, 3, 11],
    message: 'Run a postorder DFS from the root. Each node returns a pair (rob, skip).',
    currentId: root.id,
    answer: null,
    dp: {},
    robbedIds: [],
  })

  function dfs(node) {
    if (!node) {
      steps.push({
        phase: 'base',
        activeLine: 5,
        relatedLines: [4, 5],
        message: 'Reached a null child → return (0, 0).',
        currentId: null,
        answer: null,
        dp: snapshot(),
        robbedIds: [],
      })
      return { rob: 0, skip: 0 }
    }

    steps.push({
      phase: 'enter',
      activeLine: 3,
      relatedLines: [3, 4, 6, 7],
      message: `Enter node ${node.val}. Postorder: evaluate both children before deciding this node.`,
      currentId: node.id,
      answer: null,
      dp: snapshot(),
      robbedIds: [],
    })

    const left = dfs(node.left)
    const right = dfs(node.right)

    const rob = node.val + left.skip + right.skip
    const skip = Math.max(left.rob, left.skip) + Math.max(right.rob, right.skip)
    dp.set(node.id, { rob, skip })

    const isRoot = node.id === root.id
    steps.push({
      phase: 'compute',
      activeLine: 8,
      relatedLines: [8, 9, 10],
      message: `Node ${node.val}: rob = ${node.val} + ${left.skip} + ${right.skip} = ${rob}; skip = max(${left.rob}, ${left.skip}) + max(${right.rob}, ${right.skip}) = ${skip}.`,
      currentId: node.id,
      answer: isRoot ? Math.max(rob, skip) : null,
      dp: snapshot(),
      robbedIds: [],
    })

    return { rob, skip }
  }

  const result = dfs(root)
  const answer = Math.max(result.rob, result.skip)

  // Reconstruct which nodes are actually robbed in the optimal plan.
  const robbedIds = []
  function reconstruct(node, mustSkip) {
    if (!node) return
    const v = dp.get(node.id)
    const takeIt = !mustSkip && v.rob >= v.skip
    if (takeIt) {
      robbedIds.push(node.id)
      reconstruct(node.left, true)
      reconstruct(node.right, true)
    } else {
      reconstruct(node.left, false)
      reconstruct(node.right, false)
    }
  }
  reconstruct(root, false)

  steps.push({
    phase: 'done',
    activeLine: 11,
    relatedLines: [11],
    message: `Answer = max(rob=${result.rob}, skip=${result.skip}) = ${answer}. Robbed nodes are highlighted in green.`,
    currentId: null,
    answer,
    dp: snapshot(),
    robbedIds,
  })

  return steps
}

const REGISTRY_EXAMPLES = getExamplesOr('house-robber-iii', [])
const DEFAULT_EXAMPLES = [
  { label: 'Example 1 (=7)', inputs: [3, 2, 3, null, 3, null, 1] },
  { label: 'Example 2 (=9)', inputs: [3, 4, 5, 1, 3, null, 1] },
  { label: 'Left chain', inputs: [4, 1, null, 2, null, 3] },
  { label: 'Single node', inputs: [5] },
]
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : DEFAULT_EXAMPLES

export default function HouseRobberIIIVisualizer() {
  const [inputValue, setInputValue] = useState(
    JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]),
  )

  const treeArray = useMemo(() => {
    try { return parseTreeInput(inputValue) } catch { return null }
  }, [inputValue])

  const inputError = useMemo(() => {
    try { parseTreeInput(inputValue); return '' } catch (e) { return e.message }
  }, [inputValue])

  const steps = useMemo(() => generateSteps(treeArray || []), [treeArray])

  const layout = useMemo(() => {
    const root = buildTree(treeArray || [])
    const positions = computeLayout(root, CANVAS_WIDTH, LEVEL_H)
    const edges = buildEdges(root)
    const nodes = collectNodes(root)
    let maxY = 0
    positions.forEach((p) => { if (p.y > maxY) maxY = p.y })
    return { positions, edges, nodes, canvasHeight: maxY + 96 }
  }, [treeArray])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  return (
    <div className="house-robber-i-i-i-shell">
      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Input — binary tree (level-order, nulls allowed)</div>
        <div className="house-robber-i-i-i-panel-body">
          <textarea
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); handleReset() }}
            className="house-robber-i-i-i-textarea"
            placeholder="e.g. [3,2,3,null,3,null,1]"
          />
          {inputError && <div className="house-robber-i-i-i-error">{inputError}</div>}
        </div>
      </div>

      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Visualization</div>
        <div className="house-robber-i-i-i-panel-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="house-robber-i-i-i-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="house-robber-i-i-i-step-info">
                <h3>{step?.message || 'Press play (or Next) to trace the tree DP.'}</h3>
              </div>

              <div className="house-robber-i-i-i-legend">
                <span className="house-robber-i-i-i-legend-item">
                  <span className="house-robber-i-i-i-dot current" /> current node
                </span>
                <span className="house-robber-i-i-i-legend-item">
                  <span className="house-robber-i-i-i-dot robbed" /> robbed
                </span>
                <span className="house-robber-i-i-i-legend-item">
                  <span className="house-robber-i-i-i-badge-chip rob">rob</span> = take node + skip children
                </span>
                <span className="house-robber-i-i-i-legend-item">
                  <span className="house-robber-i-i-i-badge-chip skip">skip</span> = best of each child
                </span>
              </div>

              <div className="house-robber-i-i-i-canvas-wrap">
                {layout.nodes.length === 0 ? (
                  <div className="house-robber-i-i-i-empty">Empty tree — answer is 0.</div>
                ) : (
                  <div
                    className="house-robber-i-i-i-canvas"
                    style={{ width: CANVAS_WIDTH, height: layout.canvasHeight }}
                  >
                    <TreeSVG
                      edges={layout.edges}
                      positions={layout.positions}
                      canvasWidth={CANVAS_WIDTH}
                      canvasHeight={layout.canvasHeight}
                    />
                    {layout.nodes.map((node) => {
                      const pos = layout.positions.get(node.id)
                      if (!pos) return null
                      const entry = step?.dp?.[node.id]
                      const isCurrent = step?.currentId === node.id
                      const isRobbed = step?.robbedIds?.includes(node.id)
                      const cls = [
                        'house-robber-i-i-i-node',
                        isCurrent ? 'current' : '',
                        isRobbed ? 'robbed' : '',
                      ].filter(Boolean).join(' ')
                      return (
                        <div
                          key={node.id}
                          className="house-robber-i-i-i-node-wrap"
                          style={{ left: pos.x, top: pos.y - 24 }}
                        >
                          <div className={cls}>{node.val}</div>
                          {entry && (
                            <div className={`house-robber-i-i-i-node-badges${isCurrent ? ' active' : ''}`}>
                              <span className="house-robber-i-i-i-badge rob">rob {entry.rob}</span>
                              <span className="house-robber-i-i-i-badge skip">skip {entry.skip}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {step?.answer != null && (
                <div className="house-robber-i-i-i-answer">
                  Maximum money robbed: <strong>{step.answer}</strong>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="house-robber-i-i-i-panel">
        <div className="house-robber-i-i-i-panel-head">Code</div>
        <div className="house-robber-i-i-i-panel-body">
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />
        </div>
      </div>

      {EXAMPLES.length > 0 && (
        <div className="house-robber-i-i-i-examples">
          {EXAMPLES.map((example, i) => {
            const value = JSON.stringify(example.inputs || example)
            return (
              <button
                key={i}
                className={`house-robber-i-i-i-example-btn${inputValue === value ? ' active' : ''}`}
                onClick={() => { setInputValue(value); handleReset() }}
              >
                {example.label || `Example ${i + 1}`}
              </button>
            )
          })}
        </div>
      )}

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        />
      </FloatingPanel>
    </div>
  )
}
