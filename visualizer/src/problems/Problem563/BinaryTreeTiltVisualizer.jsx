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
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.activeId !== undefined && step?.nodeData?.has(step.activeId) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {(() => {
            const data = step.nodeData.get(step.activeId)
            return (
              <>
                <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Left Subtree Sum</div>
                  <div style={{ fontSize: 16, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
                    {data.leftSum}
                  </div>
                </div>
                <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Right Subtree Sum</div>
                  <div style={{ fontSize: 16, color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
                    {data.rightSum}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}

      {step?.activeId !== undefined && step?.nodeData?.has(step.activeId) && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Node Tilt</div>
          {(() => {
            const data = step.nodeData.get(step.activeId)
            return (
              <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
                |{data.leftSum} - {data.rightSum}| = {data.tilt}
              </div>
            )
          })()}
        </div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#1e293b',
          borderRadius: 6,
          border: '2px solid #a78bfa',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Total Tilt</div>
        <div
          style={{
            fontSize: 20,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: '#a78bfa',
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Tree Input (Array)</div>
              <textarea
                value={arrInput}
                onChange={(e) => {
                  setArrInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>

            <div style={{ position: 'relative', width: CANVAS_W, height: CANVAS_H, margin: '0 auto', backgroundColor: '#0f172a', borderRadius: 6, border: '1px solid #1e293b' }}>
              <TreeSVG edges={edges} positions={positions} canvasWidth={CANVAS_W} canvasHeight={CANVAS_H} />
              {nodes.map((node) => {
                const pos = positions.get(node.id)
                if (!pos) return null
                const isActive = step?.activeId === node.id
                const nodeInfo = step?.nodeData?.get(node.id)
                return (
                  <motion.div
                    key={node.id}
                    style={{
                      position: 'absolute',
                      left: pos.x - NODE_R,
                      top: pos.y - NODE_R,
                      width: NODE_R * 2,
                      height: NODE_R * 2,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      userSelect: 'none',
                      backgroundColor: isActive ? '#a78bfa' : nodeInfo ? '#6366f1' : '#1e293b',
                      color: isActive || nodeInfo ? '#000' : '#e2e8f0',
                      border: isActive ? '3px solid #a78bfa' : '2px solid #475569',
                      boxShadow: isActive ? '0 0 12px rgba(167, 139, 250, 0.5)' : 'none',
                    }}
                    animate={{
                      scale: isActive ? 1.3 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {node.val}
                    {nodeInfo && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -28,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 10,
                          fontWeight: 600,
                          color: '#a78bfa',
                          backgroundColor: '#0f172a',
                          padding: '2px 6px',
                          borderRadius: 3,
                          border: '1px solid #a78bfa',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        tilt: {nodeInfo.tilt}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            <VisualizationPanel step={step} positions={positions} nodes={nodes} applyExample={applyExample} examples={examples} />
          </div>),
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
