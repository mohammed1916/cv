import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../../components/shared/FloatingPanel"
import CodeTracePanel from "../../../components/CodeTracePanel"
import PlaybackControls from "../../../components/PlaybackControls"
import PatternOverlay from "../../../components/PatternOverlay"
import { usePlaybackState } from "../../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../../hooks/usePatternOverlay"
import "./HouseRobberIIIVisualizer.css"
import { createPortal } from 'react-dom'
const SOLUTION_CODE = [
  { line: 1, text: "def rob(root):" },
  { line: 2, text: "    def dfs(node):" },
  { line: 3, text: "        if not node: return [0, 0]" },
  { line: 4, text: "        left_rob, left_not = dfs(node.left)" },
  { line: 5, text: "        right_rob, right_not = dfs(node.right)" },
  { line: 6, text: "        rob_curr = node.val + left_not + right_not" },
  { line: 7, text: "        not_rob_curr = max(left_rob, left_not) + max(right_rob, right_not)" },
  { line: 8, text: "        return [rob_curr, not_rob_curr]" },
  { line: 9, text: "    rob_root, not_rob_root = dfs(root)" },
  { line: 10, text: "    return max(rob_root, not_rob_root)" },
]

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const nodes = arr.map((val) => (val !== null ? { val, left: null, right: null } : null))
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i]) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      if (left < nodes.length) nodes[i].left = nodes[left]
      if (right < nodes.length) nodes[i].right = nodes[right]
    }
  }
  return nodes[0]
}

function generateSteps(treeArr) {
  const steps = []
  const root = buildTree(treeArr)

  steps.push({
    activeLine: 1,
    message: "Rob houses in tree; adjacent cannot both be robbed",
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "DFS returns [can_rob, cannot_rob] for each node",
    relatedLines: [2],
  })

  const results = new Map()

  function dfs(node, depth = 0, idx = 0) {
    if (!node) {
      steps.push({
        activeLine: 3,
        message: "Null node reached",
        relatedLines: [3],
      })
      return [0, 0]
    }

    const nodeKey = `${depth}-${idx}`
    steps.push({
      activeLine: 4,
      val: node.val,
      depth,
      message: `Process node ${node.val} at depth ${depth}`,
      relatedLines: [4],
    })

    const [leftRob, leftNot] = dfs(node.left, depth + 1, idx * 2 + 1)
    const [rightRob, rightNot] = dfs(node.right, depth + 1, idx * 2 + 2)

    steps.push({
      activeLine: 6,
      val: node.val,
      leftRob,
      leftNot,
      rightRob,
      rightNot,
      message: `Children states: left=[${leftRob},${leftNot}], right=[${rightRob},${rightNot}]`,
      relatedLines: [6, 7],
    })

    const robCurr = node.val + leftNot + rightNot
    const notRobCurr = Math.max(leftRob, leftNot) + Math.max(rightRob, rightNot)

    steps.push({
      activeLine: 8,
      val: node.val,
      robCurr,
      notRobCurr,
      message: `Node ${node.val}: rob=${robCurr}, skip=${notRobCurr}`,
      relatedLines: [8],
    })

    results.set(nodeKey, [robCurr, notRobCurr])
    return [robCurr, notRobCurr]
  }

  const [robRoot, notRobRoot] = dfs(root)

  steps.push({
    activeLine: 10,
    robRoot,
    notRobRoot,
    result: Math.max(robRoot, notRobRoot),
    done: true,
    message: `Max money: max(${robRoot}, ${notRobRoot}) = ${Math.max(robRoot, notRobRoot)}`,
    relatedLines: [10],
  })

  return steps
}

function TreeDisplay({ node, depth = 0, isLeft = null, highlighted = null }) {
  if (!node) return null

  const isHighlighted = highlighted && highlighted.val === node.val
  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12 }}>
      <motion.div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
          backgroundColor: isHighlighted ? "#fbbf24" : "#334155",
          border: "2px solid " + (isHighlighted ? "#f59e0b" : "#64748b"),
          color: isHighlighted ? "#000" : "#e2e8f0",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "monospace",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {node.val}
      </motion.div>
      <div style={{ marginLeft: 16, marginTop: 8 }}>
        {node.left && <TreeDisplay node={node.left} depth={depth + 1} isLeft={true} highlighted={highlighted} />}
        {node.right && <TreeDisplay node={node.right} depth={depth + 1} isLeft={false} highlighted={highlighted} />}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, root }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Post-order DFS: process children first, then combine results.
        </div>
      </div>

      {root && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Tree Structure
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12 }}>
            <TreeDisplay node={root} highlighted={step.val ? { val: step.val } : null} />
          </div>
        </motion.div>
      )}

      {step.val !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e" }}>
            Current Node: {step.val}
          </div>
        </motion.div>
      )}

      {step.robCurr !== undefined && step.notRobCurr !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>
            DP States
          </div>
          <div style={{ fontSize: 12, color: "#92400e", fontFamily: "monospace" }}>
            Rob: {step.robCurr} | Skip: {step.notRobCurr}
          </div>
        </motion.div>
      )}

      {step.leftRob !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3730a3", marginBottom: 4 }}>
            Child States
          </div>
          <div style={{ fontSize: 11, color: "#3730a3", fontFamily: "monospace" }}>
            Left: [rob:{step.leftRob}, skip:{step.leftNot}] | Right: [rob:{step.rightRob}, skip:{step.rightNot}]
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0c865d" }}>
            Max Money: {step.result}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function HouseRobberIIIVisualizer() {
  const [treeArr] = useState([3, 2, 3, null, 3, null, 1])
  const root = useMemo(() => buildTree(treeArr), [treeArr])
  const steps = useMemo(() => generateSteps(treeArr).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [treeArr])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: "Code" },
    { id: 'viz', title: "🏠 Tree DP", dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel step={step} root={root} />),
  }), [step, connectivity, setActiveLineDom, root])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Controls">
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
          patternOverlayLabel="Pattern"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

