import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './BinaryTreeZigzagLevelOrderTraversalVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('binary-tree-zigzag-level-order-traversal', [
  { label: 'Example 1', root: [3, 9, 20, null, null, 15, 7] },
  { label: 'Example 2', root: [1] },
  { label: 'Example 3', root: [] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def zigzagLevelOrder(root):' },
  { line: 2, text: '    if not root: return []' },
  { line: 3, text: '    result = []' },
  { line: 4, text: '    queue = deque([root])' },
  { line: 5, text: '    leftToRight = True' },
  { line: 6, text: '    while queue:' },
  { line: 7, text: '        levelSize = len(queue)' },
  { line: 8, text: '        level = []' },
  { line: 9, text: '        for i in range(levelSize):' },
  { line: 10, text: '            node = queue.popleft()' },
  { line: 11, text: '            level.append(node.val)' },
  { line: 12, text: '            if node.left: queue.append(node.left)' },
  { line: 13, text: '            if node.right: queue.append(node.right)' },
  { line: 14, text: '        if not leftToRight: level.reverse()' },
  { line: 15, text: '        result.append(level)' },
  { line: 16, text: '        leftToRight = not leftToRight' },
  { line: 17, text: '    return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const root = { val: arr[0], left: null, right: null, idx: 0 }
  const queue = [root]
  let i = 1
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift()
    if (arr[i] !== null) {
      node.left = { val: arr[i], left: null, right: null, idx: i }
      queue.push(node.left)
    }
    i++
    if (i < arr.length && arr[i] !== null) {
      node.right = { val: arr[i], left: null, right: null, idx: i }
      queue.push(node.right)
    }
    i++
  }
  return root
}

function generateSteps(root) {
  const steps = []
  const tree = buildTree(root)
  if (!tree) {
    steps.push({
      activeLine: 2,
      result: [],
      queue: [],
      level: [],
      leftToRight: true,
      levelNum: 0,
      message: 'Empty tree',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    result: [],
    queue: [tree.val],
    level: [],
    leftToRight: true,
    levelNum: 0,
    message: 'Initialize queue with root',
    relatedLines: [1],
  })

  const result = []
  const queue = [tree]
  let leftToRight = true
  let levelNum = 0

  while (queue.length > 0) {
    const levelSize = queue.length
    const level = []

    steps.push({
      activeLine: 7,
      result: [...result],
      queue: queue.map((n) => n.val),
      level: [],
      leftToRight,
      levelNum,
      message: `Process level ${levelNum} (${levelSize} nodes, direction: ${leftToRight ? 'L→R' : 'R→L'})`,
      relatedLines: [7],
    })

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      level.push(node.val)

      steps.push({
        activeLine: 10,
        result: [...result],
        queue: queue.map((n) => n.val),
        level: [...level],
        leftToRight,
        levelNum,
        currentNode: node.val,
        message: `Add node ${node.val} to level`,
        relatedLines: [10],
      })

      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    const finalLevel = leftToRight ? [...level] : [...level].reverse()

    steps.push({
      activeLine: 14,
      result: [...result, finalLevel],
      queue: queue.map((n) => n.val),
      level: finalLevel,
      leftToRight,
      levelNum,
      message: `Level ${levelNum} complete: [${finalLevel.join(', ')}]${!leftToRight ? ' (reversed)' : ''}`,
      relatedLines: [14, 15],
    })

    result.push(finalLevel)
    leftToRight = !leftToRight
    levelNum++
  }

  steps.push({
    activeLine: 17,
    result,
    queue: [],
    level: [],
    leftToRight,
    levelNum,
    done: true,
    message: `Traversal complete: ${JSON.stringify(result)}`,
    relatedLines: [17],
  })

  return steps
}

function VisualizationPanel({ step, applyEx }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play to start</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, borderLeft: '4px solid #10b981' }}>
        <div style={{ fontSize: 12, color: '#065f46', fontStyle: 'italic' }}>
          Traverse tree level-by-level, alternating direction: left→right, right→left, left→right...
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
          Level {step.levelNum} {step.leftToRight ? '(L→R)' : '(R→L)'}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {step.level.map((val, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 12px',
                backgroundColor: '#bfdbfe',
                borderRadius: 4,
                border: '1px solid #0c4a6e',
                fontSize: 12,
                fontWeight: 600,
              }}
              animate={{ scale: step.currentNode === val ? 1.15 : 1 }}
            >
              {val}
            </motion.div>
          ))}
        </div>
      </div>

      {step.result && step.result.length > 0 && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Result So Far
          </div>
          <div style={{ fontSize: 11, color: '#6b21b6', fontFamily: 'monospace' }}>
            {JSON.stringify(step.result)}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function BinaryTreeZigzagLevelOrderTraversalVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.root || [3, 9, 20, null, null, 15, 7])
  const steps = useMemo(() => generateSteps(input).map((s) => ({
    ...s,
    relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
  })), [input])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.root); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels into consts
  const primaryPanel = (
    <div className="bzlt-panel">
      <div className="bzlt-panel-head">Zigzag Traversal</div>
      <div className="bzlt-panel-body">
        <VisualizationPanel step={step} applyEx={applyEx} />
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
  )

  const statusPanel = (
    <div className="bzlt-status">
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
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
    </>
  )

  // Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Zigzag Traversal', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="bzlt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
