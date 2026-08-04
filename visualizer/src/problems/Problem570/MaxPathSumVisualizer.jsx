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
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput } from '../../components/treeUtils'
import { TreeCanvas3D } from '../../components/viz3d'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MaxPathSumVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def maxPathSum(self, root):' },
  { line: 3, text: '        self.maxSum = float("-inf")' },
  { line: 4, text: '        def dfs(node):' },
  { line: 5, text: '            if not node:' },
  { line: 6, text: '                return 0' },
  { line: 7, text: '            left = max(dfs(node.left), 0)' },
  { line: 8, text: '            right = max(dfs(node.right), 0)' },
  { line: 9, text: '            pathSum = node.val + left + right' },
  { line: 10, text: '            self.maxSum = max(self.maxSum, pathSum)' },
  { line: 11, text: '            return node.val + max(left, right)' },
  { line: 12, text: '        dfs(root)' },
  { line: 13, text: '        return self.maxSum' },
]

const PATTERNS = ['init', 'dfs_enter', 'dfs_compute', 'dfs_update', 'dfs_return', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'dfs_enter',
  7: 'dfs_compute',
  9: 'dfs_compute',
  10: 'dfs_update',
  11: 'dfs_return',
  13: 'done',
}

const CANVAS_W = 520
const CANVAS_H = 320
const NODE_R = 22

function generateSteps(arr) {
  const root = buildTree(arr)
  const positions = computeLayout(root, CANVAS_W, 80)
  const edges = buildEdges(root)
  const allNodes = collectNodes(root)
  const steps = []

  if (!root) {
    return [
      {
        phase: 'done',
        activeLine: 13,
        activeIds: new Set(),
        visitedIds: new Set(),
        pathNodeIds: new Set(),
        maxPathNodeIds: new Set(),
        positions,
        edges,
        allNodes,
        message: 'Empty tree → return -∞',
        maxSum: -Infinity,
        currentNodeSum: 0,
        currentNodePath: [],
        done: true,
      },
    ]
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    activeIds: new Set(),
    visitedIds: new Set(),
    pathNodeIds: new Set(),
    maxPathNodeIds: new Set(),
    positions,
    edges,
    allNodes,
    message: 'Initialize maxSum = -∞',
    maxSum: -Infinity,
    currentNodeSum: 0,
    currentNodePath: [],
  })

  let maxSum = -Infinity
  let maxPathNodes = []
  const callStack = []
  const visitOrder = []

  function dfs(node, isReturning = false) {
    if (!node) {
      steps.push({
        phase: 'dfs_enter',
        activeLine: 5,
        activeIds: new Set(),
        visitedIds: new Set(visitOrder.map((n) => n.id)),
        pathNodeIds: new Set(callStack.length > 0 ? [callStack[callStack.length - 1]?.id].filter(Boolean) : []),
        maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
        positions,
        edges,
        allNodes,
        message: 'Reached null node, return 0',
        maxSum,
        currentNodeSum: 0,
        currentNodePath: [],
      })
      return 0
    }

    if (!isReturning) {
      visitOrder.push(node)
      callStack.push(node)

      steps.push({
        phase: 'dfs_enter',
        activeLine: 4,
        activeIds: new Set([node.id]),
        visitedIds: new Set(visitOrder.map((n) => n.id)),
        pathNodeIds: new Set(callStack.map((n) => n.id)),
        maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
        positions,
        edges,
        allNodes,
        message: `Enter DFS for node ${node.val}`,
        maxSum,
        currentNodeSum: node.val,
        currentNodePath: [node.val],
        currentNodeId: node.id,
      })
    }

    // Process left subtree
    const leftGain = Math.max(dfs(node.left), 0)

    steps.push({
      phase: 'dfs_compute',
      activeLine: 7,
      activeIds: new Set([node.id]),
      visitedIds: new Set(visitOrder.map((n) => n.id)),
      pathNodeIds: new Set(callStack.map((n) => n.id)),
      maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
      positions,
      edges,
      allNodes,
      message: `Left gain from node ${node.val}: max(dfs(left), 0) = ${leftGain}`,
      maxSum,
      currentNodeSum: node.val + leftGain,
      currentNodePath: [node.val],
      currentNodeId: node.id,
      leftGain,
    })

    // Process right subtree
    const rightGain = Math.max(dfs(node.right), 0)

    steps.push({
      phase: 'dfs_compute',
      activeLine: 8,
      activeIds: new Set([node.id]),
      visitedIds: new Set(visitOrder.map((n) => n.id)),
      pathNodeIds: new Set(callStack.map((n) => n.id)),
      maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
      positions,
      edges,
      allNodes,
      message: `Right gain from node ${node.val}: max(dfs(right), 0) = ${rightGain}`,
      maxSum,
      currentNodeSum: node.val + rightGain,
      currentNodePath: [node.val],
      currentNodeId: node.id,
      rightGain,
    })

    // Calculate path sum through this node
    const pathSum = node.val + leftGain + rightGain

    steps.push({
      phase: 'dfs_compute',
      activeLine: 9,
      activeIds: new Set([node.id]),
      visitedIds: new Set(visitOrder.map((n) => n.id)),
      pathNodeIds: new Set(callStack.map((n) => n.id)),
      maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
      positions,
      edges,
      allNodes,
      message: `Path sum at node ${node.val}: ${node.val} + ${leftGain} + ${rightGain} = ${pathSum}`,
      maxSum,
      currentNodeSum: pathSum,
      currentNodePath: [node.val, `(+${leftGain}`, `+${rightGain})`],
      currentNodeId: node.id,
      pathSum,
    })

    // Update global maximum
    if (pathSum > maxSum) {
      maxSum = pathSum
      maxPathNodes = [node]

      steps.push({
        phase: 'dfs_update',
        activeLine: 10,
        activeIds: new Set([node.id]),
        visitedIds: new Set(visitOrder.map((n) => n.id)),
        pathNodeIds: new Set(callStack.map((n) => n.id)),
        maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
        positions,
        edges,
        allNodes,
        message: `NEW MAXIMUM! maxSum = ${maxSum} (was ${maxSum - pathSum + pathSum})`,
        maxSum,
        currentNodeSum: pathSum,
        currentNodePath: [node.val],
        currentNodeId: node.id,
        pathSum,
      })
    } else {
      steps.push({
        phase: 'dfs_update',
        activeLine: 10,
        activeIds: new Set([node.id]),
        visitedIds: new Set(visitOrder.map((n) => n.id)),
        pathNodeIds: new Set(callStack.map((n) => n.id)),
        maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
        positions,
        edges,
        allNodes,
        message: `maxSum = ${maxSum} (no update needed)`,
        maxSum,
        currentNodeSum: pathSum,
        currentNodePath: [node.val],
        currentNodeId: node.id,
        pathSum,
      })
    }

    // Return maximum gain for parent
    const returnValue = node.val + Math.max(leftGain, rightGain)

    steps.push({
      phase: 'dfs_return',
      activeLine: 11,
      activeIds: new Set(),
      visitedIds: new Set(visitOrder.map((n) => n.id)),
      pathNodeIds: new Set(
        callStack.slice(0, -1).map((n) => n.id)
      ),
      maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
      positions,
      edges,
      allNodes,
      message: `Return from node ${node.val}: ${node.val} + max(${leftGain}, ${rightGain}) = ${returnValue}`,
      maxSum,
      currentNodeSum: returnValue,
      currentNodePath: [node.val],
      currentNodeId: node.id,
      returnValue,
    })

    callStack.pop()
    return returnValue
  }

  dfs(root)

  steps.push({
    phase: 'done',
    activeLine: 13,
    activeIds: new Set(),
    visitedIds: new Set(visitOrder.map((n) => n.id)),
    pathNodeIds: new Set(),
    maxPathNodeIds: new Set(maxPathNodes.map((n) => n.id)),
    positions,
    edges,
    allNodes,
    message: `DFS complete! Maximum path sum = ${maxSum}`,
    maxSum,
    currentNodeSum: maxSum,
    currentNodePath: [],
    done: true,
  })

  return steps
}

function VisualizationPanel({
  examples,
  arrInput,
  setArrInput,
  positions,
  edges,
  allNodes,
  step,
  applyExample,
  handleReset,
}) {
  return (
    <div className="mps-viz-panel">
      {examples?.length > 0 && (
        <div className="mps-examples">
          {examples.map((ex, i) => (
            <button
              key={i}
              onClick={() => applyExample(ex)}
              className="mps-chip"
            >
              {ex.label || `Example ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Tree (level-order array)</div>
        <input
          className="mps-input"
          value={arrInput}
          onChange={(e) => {
            setArrInput(e.target.value)
            handleReset()
          }}
          placeholder="[1,2,3] or [1,null,2,null,3]"
        />
      </div>
      <div className="mps-canvas" style={{ width: CANVAS_W, height: CANVAS_H }}>
        <TreeCanvas3D
          positions={positions}
          edges={edges}
          allNodes={allNodes}
          activeIds={step?.activeIds ?? new Set()}
          visitedIds={step?.visitedIds ?? new Set()}
          canvasWidth={CANVAS_W}
          canvasHeight={CANVAS_H}
          nodeRadius={NODE_R}
        />
      </div>
    </div>
  )
}

function ResultPanel({ step, inputError }) {
  return (
    <div className="mps-result-panel">
      {step?.currentNodeId && (
        <div className="mps-info-row">
          <span className="mps-info-label">Current Node:</span>
          <span>{step.currentNodeId}</span>
        </div>
      )}

      {step?.leftGain !== undefined && (
        <div className="mps-info-row">
          <span className="mps-info-label">Left Gain:</span>
          <span>{step.leftGain}</span>
        </div>
      )}

      {step?.rightGain !== undefined && (
        <div className="mps-info-row">
          <span className="mps-info-label">Right Gain:</span>
          <span>{step.rightGain}</span>
        </div>
      )}

      {step?.pathSum !== undefined && (
        <div className="mps-info-row">
          <span className="mps-info-label">Path Sum:</span>
          <span>{step.pathSum}</span>
        </div>
      )}

      {step?.returnValue !== undefined && (
        <div className="mps-info-row">
          <span className="mps-info-label">Return Value:</span>
          <span>{step.returnValue}</span>
        </div>
      )}

      <div className="mps-stats">
        <div className="mps-stat-box">
          <div className="mps-stat-label">Current Max</div>
          <div className={`mps-stat-value ${step?.maxSum !== -Infinity ? 'max' : ''}`}>
            {step?.maxSum === -Infinity ? '-∞' : step?.maxSum}
          </div>
        </div>
        <div className="mps-stat-box">
          <div className="mps-stat-label">Current Path Sum</div>
          <div className="mps-stat-value">{step?.currentNodeSum ?? 0}</div>
        </div>
      </div>

      <motion.div
        className={`mps-result ${step?.phase === 'done' ? 'complete' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ fontSize: 12, color: '#a6adc8' }}>
          {step?.phase === 'done' ? 'Maximum Path Sum Found' : 'Computing...'}
        </div>
        <div className="mps-result-value">{step?.maxSum === -Infinity ? '-∞' : step?.maxSum}</div>
      </motion.div>

      {inputError && <div className="mps-error-box">{inputError}</div>}
    </div>
  )
}

export default function MaxPathSumVisualizer() {
  const examples = useMemo(() => getExamplesOr('max-path-sum', []), [])
  const [arrInput, setArrInput] = useState('[1,2,3]')

  const { arr, inputError } = useMemo(() => {
    try {
      return { arr: parseTreeInput(arrInput), inputError: '' }
    } catch (e) {
      return { arr: [1, 2, 3], inputError: e.message || 'Invalid input' }
    }
  }, [arrInput])

  const steps = useMemo(() => generateSteps(arr), [arr])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setArrInput(JSON.stringify(ex.arr || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>
        ),
      },
      {
        id: 'viz',
        title: '🌳 Tree Visualization',
        content: (
          <VisualizationPanel
            examples={examples}
            arrInput={arrInput}
            setArrInput={setArrInput}
            positions={step?.positions ?? new Map()}
            edges={step?.edges ?? []}
            allNodes={step?.allNodes ?? []}
            step={step}
            applyExample={applyExample}
            handleReset={handleReset}
          />
        ),
      },
      {
        id: 'result',
        title: '📊 Path Sum Details',
        content: (
          <ResultPanel
            step={step}
            inputError={inputError}
          />
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, examples, arrInput, setArrInput, applyExample, handleReset, showPatternOverlay, activeLineDom, inputError]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz', 'result']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  )
}
