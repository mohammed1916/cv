import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import { buildTree, computeLayout, collectNodes, buildEdges, parseTreeInput, TreeSVG } from '../../components/treeUtils'
import './BinaryTreeTiltVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findTilt(self, root: TreeNode) -> int:' },
  { line: 3, text: '        self.total_tilt = 0' },
  { line: 4, text: '        ' },
  { line: 5, text: '        def postOrder(node):' },
  { line: 6, text: '            if not node:' },
  { line: 7, text: '                return 0' },
  { line: 8, text: '            ' },
  { line: 9, text: '            left_sum = postOrder(node.left)' },
  { line: 10, text: '            right_sum = postOrder(node.right)' },
  { line: 11, text: '            ' },
  { line: 12, text: '            tilt = abs(left_sum - right_sum)' },
  { line: 13, text: '            self.total_tilt += tilt' },
  { line: 14, text: '            ' },
  { line: 15, text: '            return node.val + left_sum + right_sum' },
  { line: 16, text: '        ' },
  { line: 17, text: '        postOrder(root)' },
  { line: 18, text: '        return self.total_tilt' },
]

const PATTERNS = ['traverse', 'calculate_sums', 'compute_tilt', 'accumulate', 'return_sum']
const LINE_PATTERN_MAP = {
  9: 'traverse',
  10: 'traverse',
  12: 'compute_tilt',
  13: 'accumulate',
  15: 'return_sum',
}

const CANVAS_W = 480
const CANVAS_H = 320
const NODE_R = 24

function generateSteps(arr) {
  const steps = []
  const root = buildTree(arr)
  const positions = computeLayout(root, CANVAS_W, 80)
  const edges = buildEdges(root)

  if (!root) {
    steps.push({
      phase: 'done',
      activeLine: 18,
      relatedLines: [18],
      message: 'Empty tree → total tilt = 0',
      totalTilt: 0,
      done: true,
    })
    return { steps, positions, edges, nodes: collectNodes(root) }
  }

  const nodeData = new Map() // nodeId -> { leftSum, rightSum, tilt, subtreeSum }
  let totalTilt = 0

  steps.push({
    phase: 'start',
    activeLine: 3,
    relatedLines: [3],
    message: 'Initialize total_tilt = 0',
    totalTilt: 0,
  })

  function dfs(node, callStack) {
    if (!node) {
      steps.push({
        phase: 'traverse',
        activeLine: 7,
        relatedLines: [7],
        message: 'Null node → return 0',
        callStack: callStack.slice(),
        totalTilt,
      })
      return 0
    }

    const nodeId = node.id
    const nodeName = `node ${node.val}`

    steps.push({
      phase: 'traverse',
      activeLine: 9,
      relatedLines: [9],
      message: `Visit node ${node.val}: explore left subtree`,
      activeId: nodeId,
      callStack: [...callStack, node.val],
      totalTilt,
    })

    const leftSum = dfs(node.left, [...callStack, node.val])

    steps.push({
      phase: 'traverse',
      activeLine: 10,
      relatedLines: [10],
      message: `Back at ${node.val}: leftSum=${leftSum} → explore right subtree`,
      activeId: nodeId,
      callStack: [...callStack, node.val],
      totalTilt,
    })

    const rightSum = dfs(node.right, [...callStack, node.val])

    const tilt = Math.abs(leftSum - rightSum)
    totalTilt += tilt

    steps.push({
      phase: 'compute_tilt',
      activeLine: 12,
      relatedLines: [12],
      message: `Node ${node.val}: tilt = |${leftSum} - ${rightSum}| = ${tilt}`,
      activeId: nodeId,
      callStack: [...callStack, node.val],
      leftSum,
      rightSum,
      tilt,
      totalTilt,
    })

    steps.push({
      phase: 'accumulate',
      activeLine: 13,
      relatedLines: [13],
      message: `Accumulate: total_tilt = ${totalTilt - tilt} + ${tilt} = ${totalTilt}`,
      activeId: nodeId,
      callStack: [...callStack, node.val],
      currentNodeTilt: tilt,
      totalTilt,
    })

    const subtreeSum = node.val + leftSum + rightSum

    steps.push({
      phase: 'return_sum',
      activeLine: 15,
      relatedLines: [15],
      message: `Return from ${node.val}: ${node.val} + ${leftSum} + ${rightSum} = ${subtreeSum}`,
      activeId: nodeId,
      callStack: [...callStack, node.val],
      subtreeSum,
      totalTilt,
    })

    nodeData.set(nodeId, {
      leftSum,
      rightSum,
      tilt,
      subtreeSum,
    })

    return subtreeSum
  }

  dfs(root, [])

  steps.push({
    phase: 'done',
    activeLine: 18,
    relatedLines: [18],
    message: `Final result: total_tilt = ${totalTilt}`,
    totalTilt,
    done: true,
  })

  return {
    steps: steps.map((s) => ({
      ...s,
      nodeData: new Map(nodeData),
    })),
    positions,
    edges,
    nodes: collectNodes(root),
  }
}

function VisualizationPanel({ step, positions, nodes, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>

      {step?.activeId !== undefined && step?.nodeData?.has(step.activeId) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(() => {
            const data = step.nodeData.get(step.activeId)
            return (
              <>
                <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #38bdf8' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Left Subtree Sum</div>
                  <div style={{ fontSize: 16, color: '#067db1', fontFamily: 'monospace', fontWeight: 700 }}>
                    {data.leftSum}
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #f59e0b' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Right Subtree Sum</div>
                  <div style={{ fontSize: 16, color: '#a36907', fontFamily: 'monospace', fontWeight: 700 }}>
                    {data.rightSum}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {step?.activeId !== undefined && step?.nodeData?.has(step.activeId) && (
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7e56f8', marginBottom: 6 }}>Node Tilt</div>
          {(() => {
            const data = step.nodeData.get(step.activeId)
            return (
              <div style={{ fontSize: 13, color: '#5577a4', fontFamily: 'monospace' }}>
                |{data.leftSum} - {data.rightSum}| = {data.tilt}
              </div>
            )
          })()}
        </div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: 'var(--surface2)',
          borderRadius: 6,
          border: '2px solid #a78bfa',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Total Tilt</div>
        <div
          style={{
            fontSize: 20,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#7e56f8',
          }}
        >
          {step?.totalTilt ?? 0}
        </div>
      </motion.div>
    </div>
  )
}

export default function BinaryTreeTiltVisualizer() {
  const examples = useMemo(() => getExamplesOr('binary-tree-tilt', []), [])
  const [arrInput, setArrInput] = useState('[1,0,1]')

  const { arr, inputError } = useMemo(() => {
    try {
      const parsed = parseTreeInput(arrInput)
      return { arr: parsed, inputError: '' }
    } catch (e) {
      return { arr: [], inputError: e.message }
    }
  }, [arrInput])

  const { steps, positions, edges, nodes } = useMemo(() => generateSteps(arr), [arr])

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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Binary Tree Tilt', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<VisualizationPanel step={step} positions={positions} nodes={nodes} applyExample={applyExample} examples={examples} />),
  }), [step, connectivity, setActiveLineDom, arrInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom, positions, nodes, edges])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"arr","label":"arr","type":"array"}]}
          values={{ arr: arrInput }}
          onChange={(k, v) => { if (k === 'arr') setArrInput(v); handleReset() }}
          examples={examples}
          applyExample={applyExample}
          inputError={inputError}
        />
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
      </FloatingPanel>
    </div>
  )
}
