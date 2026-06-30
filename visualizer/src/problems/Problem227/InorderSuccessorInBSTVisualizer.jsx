import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import DockableWorkspace from "../../components/shared/DockableWorkspace"
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import "./InorderSuccessorInBSTVisualizer.css"
const SOLUTION_CODE = [
  { line: 1, text: "def inorderSuccessor(root, p):" },
  { line: 2, text: "    successor = None" },
  { line: 3, text: "    while root:" },
  { line: 4, text: "        if root.val > p.val:" },
  { line: 5, text: "            successor = root" },
  { line: 6, text: "            root = root.left" },
  { line: 7, text: "        else:" },
  { line: 8, text: "            root = root.right" },
  { line: 9, text: "    return successor" },
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

function generateSteps(treeArr, pVal) {
  const steps = []
  const root = buildBST(treeArr)

  steps.push({
    activeLine: 1,
    pVal,
    message: `Find inorder successor of node ${pVal}`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Initialize successor pointer",
    relatedLines: [2],
  })

  let successor = null
  let current = root
  let stepCount = 0

  steps.push({
    activeLine: 3,
    message: "Begin iterative traversal",
    relatedLines: [3],
  })

  while (current && stepCount < 10) {
    stepCount++

    steps.push({
      activeLine: 3,
      current: current.val,
      successor,
      message: `Current node: ${current.val}`,
      relatedLines: [3],
    })

    if (current.val > pVal) {
      successor = current
      steps.push({
        activeLine: 5,
        current: current.val,
        successor: successor.val,
        message: `${current.val} > ${pVal}, update successor`,
        relatedLines: [5],
      })

      steps.push({
        activeLine: 6,
        message: `Go left to find larger successor`,
        relatedLines: [6],
      })

      current = current.left
    } else {
      steps.push({
        activeLine: 7,
        current: current.val,
        message: `${current.val} <= ${pVal}, go right`,
        relatedLines: [7, 8],
      })

      current = current.right
    }
  }

  steps.push({
    activeLine: 9,
    successor: successor?.val || null,
    result: successor?.val || null,
    done: true,
    message: successor ? `Inorder successor: ${successor.val}` : "No successor found",
    relatedLines: [9],
  })

  return steps
}

function TreeDisplay({ node, depth = 0, highlighted = null, successor = null }) {
  if (!node) return null

  const isHighlighted = highlighted && highlighted === node.val
  const isSuccessor = successor && successor === node.val

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12 }}>
      <motion.div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
          backgroundColor: isSuccessor ? "#dcfce7" : isHighlighted ? "#fbbf24" : "#334155",
          border: "2px solid " + (isSuccessor ? "#10b981" : isHighlighted ? "#f59e0b" : "#64748b"),
          color: isSuccessor ? "#065f46" : isHighlighted ? "#000" : "#e2e8f0",
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
        {node.left && <TreeDisplay node={node.left} depth={depth + 1} highlighted={highlighted} successor={successor} />}
        {node.right && <TreeDisplay node={node.right} depth={depth + 1} highlighted={highlighted} successor={successor} />}
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
          BST inorder successor: smallest value greater than p.
        </div>
      </div>

      {step.pVal !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            Finding successor of: {step.pVal}
          </div>
        </motion.div>
      )}

      {root && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            BST Structure
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 12 }}>
            <TreeDisplay node={root} highlighted={step.current} successor={step.successor} />
          </div>
        </motion.div>
      )}

      {step.current !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#0c4a6e" }}>
            Current: {step.current}
          </div>
        </motion.div>
      )}

      {step.successor !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#d1fae5", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#065f46", fontWeight: 600 }}>
            Best successor so far: {step.successor || "None"}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
            Result: {step.result !== null ? step.result : "None"}
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

export default function InorderSuccessorInBSTVisualizer() {
  const [treeArr] = useState([2, 1, 3])
  const [pVal] = useState(1)
  const root = useMemo(() => buildBST(treeArr), [treeArr])
  const steps = useMemo(() => generateSteps(treeArr, pVal).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [treeArr, pVal])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: "code",
        title: "Code",
        content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />,
      },
      {
        id: "viz",
        title: "🌳 BST Successor",
        content: <VisualizationPanel step={step} root={root} />,
      },
    ],
    [step, connectivity, setActiveLineDom, root]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [["code", "viz"]], minimized: [] }} />
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

