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
import "./KthSmallestElementBSTVisualizer.css"
import { createPortal } from 'react-dom'
const SOLUTION_CODE = [
  { line: 1, text: "def kthSmallest(root, k):" },
  { line: 2, text: "    self.count = 0" },
  { line: 3, text: "    self.result = None" },
  { line: 4, text: "    def inorder(node):" },
  { line: 5, text: "        if not node: return" },
  { line: 6, text: "        inorder(node.left)" },
  { line: 7, text: "        self.count += 1" },
  { line: 8, text: "        if self.count == k:" },
  { line: 9, text: "            self.result = node.val" },
  { line: 10, text: "        inorder(node.right)" },
  { line: 11, text: "    inorder(root)" },
  { line: 12, text: "    return self.result" },
]

function buildBST(arr) {
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

function generateSteps(treeArr, k) {
  const steps = []
  const root = buildBST(treeArr)

  steps.push({
    activeLine: 1,
    k,
    message: `Find kth (k=${k}) smallest element in BST`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 4,
    message: "In-order traversal visits nodes in sorted order",
    relatedLines: [4, 5, 6],
  })

  const sequence = []
  let count = 0
  let result = null

  function inorder(node, depth = 0) {
    if (!node) {
      steps.push({
        activeLine: 5,
        message: "Null node",
        relatedLines: [5],
      })
      return
    }

    steps.push({
      activeLine: 6,
      val: node.val,
      depth,
      message: `Go left from ${node.val}`,
      relatedLines: [6],
    })
    inorder(node.left, depth + 1)

    count++
    steps.push({
      activeLine: 7,
      count,
      val: node.val,
      sequence: [...sequence, node.val],
      message: `Visit node ${node.val}, count=${count}`,
      relatedLines: [7],
    })

    sequence.push(node.val)

    if (count === k) {
      result = node.val
      steps.push({
        activeLine: 9,
        result,
        message: `Found kth smallest: ${result}`,
        relatedLines: [9],
      })
    }

    steps.push({
      activeLine: 10,
      val: node.val,
      depth,
      message: `Go right from ${node.val}`,
      relatedLines: [10],
    })
    inorder(node.right, depth + 1)
  }

  inorder(root)

  steps.push({
    activeLine: 12,
    result,
    sequence,
    done: true,
    message: `Sorted sequence: [${sequence.join(", ")}], kth=${result}`,
    relatedLines: [12],
  })

  return steps
}

function TreeDisplay({ node, depth = 0, highlighted = null, sequence = [] }) {
  if (!node) return null

  const isHighlighted = highlighted && highlighted.val === node.val
  const isInSequence = sequence.includes(node.val)

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12 }}>
      <motion.div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
          backgroundColor: isHighlighted ? "#fbbf24" : isInSequence ? "#d1fae5" : "#334155",
          border: "2px solid " + (isHighlighted ? "#f59e0b" : isInSequence ? "#10b981" : "#64748b"),
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
        {node.left && <TreeDisplay node={node.left} depth={depth + 1} highlighted={highlighted} sequence={sequence} />}
        {node.right && <TreeDisplay node={node.right} depth={depth + 1} highlighted={highlighted} sequence={sequence} />}
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
          In-order: left → node → right visits BST in ascending order.
        </div>
      </div>

      {step.k !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#065f46" }}>
            Finding: {step.k}th smallest element
          </div>
        </motion.div>
      )}

      {root && (
        <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 8 }}>
            BST Structure
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12 }}>
            <TreeDisplay node={root} highlighted={step.val ? { val: step.val } : null} sequence={step.sequence || []} />
          </div>
        </motion.div>
      )}

      {step.count !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e" }}>
            Count: {step.count}
          </div>
        </motion.div>
      )}

      {step.sequence && step.sequence.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3730a3", marginBottom: 4 }}>
            Visited so far
          </div>
          <div style={{ fontSize: 12, color: "#3730a3", fontFamily: "monospace" }}>
            [{step.sequence.join(", ")}]
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
            Result: {step.result}
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

export default function KthSmallestElementBSTVisualizer() {
  const [treeArr] = useState([3, 1, 4, null, 2])
  const [k] = useState(1)
  const root = useMemo(() => buildBST(treeArr), [treeArr])
  const steps = useMemo(() => generateSteps(treeArr, k).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [treeArr, k])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: "Code" },
    { id: 'viz', title: "🌳 In-order Traversal", dockMode: 'split-right' },
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

