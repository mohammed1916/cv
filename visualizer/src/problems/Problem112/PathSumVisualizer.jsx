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
import { getExamples } from '../../config/examplesRegistry'
import './PathSumVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('path-sum') || [
  { label: 'Example 1', root: [5, 4, 8, 11, null, 13, 4, 7, 2, null, 1], targetSum: 22 },
  { label: 'Example 2', root: [1, 2, 3], targetSum: 5 },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def hasPathSum(root, targetSum):' },
  { line: 2, text: '    if not root: return False' },
  { line: 3, text: '    if not root.left and not root.right:' },
  { line: 4, text: '        return root.val == targetSum' },
  { line: 5, text: '    target_left = targetSum - root.val' },
  { line: 6, text: '    return hasPathSum(root.left, target_left) or' },
  { line: 7, text: '           hasPathSum(root.right, target_left)' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const root = { val: arr[0], left: null, right: null, id: 0 }
  const q = [root]
  let i = 1
  let nodeId = 1
  while (q.length && i < arr.length) {
    const node = q.shift()
    if (arr[i] !== null) {
      node.left = { val: arr[i], left: null, right: null, id: nodeId++ }
      q.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i], left: null, right: null, id: nodeId++ }
      q.push(node.right)
    }
    i++
  }
  return root
}

function generateSteps(root, targetSum) {
  const steps = []
  const tree = buildTree(root)

  if (!tree) {
    steps.push({
      activeLine: 2,
      targetSum,
      currentSum: 0,
      message: 'Empty tree → return False',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    targetSum,
    currentSum: 0,
    currentNode: null,
    message: `Find path sum = ${targetSum}`,
    relatedLines: [1],
  })

  let found = false

  const dfs = (node, currentSum, path) => {
    if (!node) return

    const newSum = currentSum + node.val
    const newPath = [...path, node.val]

    steps.push({
      activeLine: 5,
      targetSum,
      currentSum: newSum,
      currentNode: node.val,
      path: newPath,
      message: `Visit node ${node.val}, path sum = ${newSum}`,
      relatedLines: [5],
    })

    if (!node.left && !node.right) {
      const isLeaf = true
      steps.push({
        activeLine: 3,
        targetSum,
        currentSum: newSum,
        path: newPath,
        isLeaf,
        message: `Leaf node: ${node.val}, sum = ${newSum}`,
        relatedLines: [3, 4],
      })

      if (newSum === targetSum) {
        found = true
        steps.push({
          activeLine: 4,
          targetSum,
          currentSum: newSum,
          path: newPath,
          found: true,
          message: `✓ Path found: [${newPath.join(' → ')}] = ${newSum}`,
          relatedLines: [4],
        })
      } else {
        steps.push({
          activeLine: 4,
          targetSum,
          currentSum: newSum,
          path: newPath,
          found: false,
          message: `✗ Path sum ${newSum} ≠ ${targetSum}`,
          relatedLines: [4],
        })
      }
      return
    }

    if (node.left) {
      dfs(node.left, newSum, newPath)
    }
    if (node.right) {
      dfs(node.right, newSum, newPath)
    }
  }

  dfs(tree, 0, [])

  steps.push({
    activeLine: 7,
    targetSum,
    found,
    done: true,
    message: found ? `✓ Path exists with sum ${targetSum}` : `✗ No path with sum ${targetSum}`,
    relatedLines: [6, 7],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#165e4d', fontStyle: 'italic' }}>
          Use DFS to explore all root-to-leaf paths, checking if any sum equals target.
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
          Target: {step.targetSum}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0c4a6e' }}>Current Sum: {step.currentSum}</div>
          <div style={{ fontSize: 12, color: '#0c4a6e' }}>
            {step.currentSum === step.targetSum && step.isLeaf ? '✓ Match!' : step.currentSum > step.targetSum ? 'Too high' : 'Too low'}
          </div>
        </div>
      </div>

      {step.path && step.path.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Current Path
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
            {step.path.map((val, idx) => (
              <motion.span
                key={idx}
                style={{
                  padding: '4px 8px',
                  borderRadius: 3,
                  backgroundColor: '#e9d5ff',
                  border: '1px solid #c084fc',
                  fontWeight: 600,
                }}
                animate={{ scale: 1 }}
              >
                {val}
              </motion.span>
            ))}
            <span style={{ padding: '4px 8px', fontSize: 11, fontWeight: 700, color: '#5b21b6' }}> = {step.currentSum}</span>
          </div>
        </motion.div>
      )}

      {step.found !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.found ? '#dcfce7' : '#fee2e2',
            borderRadius: 6,
            border: step.found ? '2px solid #10b981' : '2px solid #f87171',
            fontSize: 12,
            fontWeight: 600,
            color: step.found ? '#065f46' : '#991b1b',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.found ? '✓ Path found!' : '✗ No matching path'}
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function PathSumVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.root, input.targetSum).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🌳 Path Sum',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
