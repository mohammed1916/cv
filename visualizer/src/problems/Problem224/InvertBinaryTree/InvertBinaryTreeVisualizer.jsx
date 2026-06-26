import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import DockableWorkspace from "../../../components/shared/DockableWorkspace"
import FloatingPanel from "../../../components/shared/FloatingPanel"
import CodeTracePanel from "../../../components/CodeTracePanel"
import PlaybackControls from "../../../components/PlaybackControls"
import PatternOverlay from "../../../components/PatternOverlay"
import { usePlaybackState } from "../../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../../hooks/usePatternOverlay"
import "./InvertBinaryTreeVisualizer.css"

const SOLUTION_CODE = [
  { line: 1, text: "def invertTree(root):" },
  { line: 2, text: "    if not root: return None" },
  { line: 3, text: "    root.left, root.right = root.right, root.left" },
  { line: 4, text: "    invertTree(root.left)" },
  { line: 5, text: "    invertTree(root.right)" },
  { line: 6, text: "    return root" },
]

function buildTree(arr) {
  if (!arr || arr.length === 0) return null
  const nodes = arr.map((val) => (val !== null ? { val, left: null, right: null, id: Math.random() } : null))
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

function invertTreeRecursive(node, steps) {
  if (!node) {
    steps.push({
      activeLine: 2,
      message: "Null node reached",
      relatedLines: [2],
    })
    return
  }

  steps.push({
    activeLine: 1,
    node: node.val,
    message: `Process node ${node.val}`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    node: node.val,
    leftVal: node.left?.val || "null",
    rightVal: node.right?.val || "null",
    message: `Swap children of ${node.val}: [${node.left?.val || "null"}, ${node.right?.val || "null"}]`,
    relatedLines: [3],
  })

  [node.left, node.right] = [node.right, node.left]

  steps.push({
    activeLine: 4,
    node: node.val,
    message: `Invert left subtree`,
    relatedLines: [4],
  })
  invertTreeRecursive(node.left, steps)

  steps.push({
    activeLine: 5,
    node: node.val,
    message: `Invert right subtree`,
    relatedLines: [5],
  })
  invertTreeRecursive(node.right, steps)

  steps.push({
    activeLine: 6,
    node: node.val,
    message: `Return ${node.val}`,
    relatedLines: [6],
  })
}

function generateSteps(treeArr) {
  const steps = []
  const root = buildTree(treeArr)

  steps.push({
    activeLine: 1,
    message: "Invert binary tree recursively",
    relatedLines: [1],
  })

  invertTreeRecursive(root, steps)

  steps.push({
    activeLine: 6,
    done: true,
    message: "Tree inversion complete",
    relatedLines: [6],
  })

  return steps
}

function TreeDisplay({ node, depth = 0, inverted = false }) {
  if (!node) return null

  const isHighlighted = false
  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, marginTop: 12 }}>
      <motion.div
        style={{
          display: "inline-block",
          padding: "6px 12px",
          borderRadius: 4,
          backgroundColor: isHighlighted ? "#fbbf24" : "#334155",
          border: "2px solid " + (isHighlighted ? "#f59e0b" : "#64748b"),
          color: "#e2e8f0",
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
        {node.left && <TreeDisplay node={node.left} depth={depth + 1} inverted={inverted} />}
        {node.right && <TreeDisplay node={node.right} depth={depth + 1} inverted={inverted} />}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, originalRoot, invertedRoot }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Recursion: swap left/right, recurse on children, return node.
        </div>
      </div>

      <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
          Original Tree
        </div>
        {originalRoot && (
          <div style={{ fontFamily: "monospace", fontSize: 12 }}>
            <TreeDisplay node={originalRoot} />
          </div>
        )}
      </motion.div>

      {step.node !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            Current node: {step.node}
          </div>
        </motion.div>
      )}

      {step.leftVal !== undefined && step.rightVal !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e" }}>
            Swap: [{step.leftVal}, {step.rightVal}] → [{step.rightVal}, {step.leftVal}]
          </div>
        </motion.div>
      )}

      {step.done && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Inverted Tree
          </div>
          {invertedRoot && (
            <div style={{ fontFamily: "monospace", fontSize: 12 }}>
              <TreeDisplay node={invertedRoot} inverted={true} />
            </div>
          )}
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

export default function InvertBinaryTreeVisualizer() {
  const [treeArr] = useState([4, 2, 7, 1, 3, 6, 9])
  const originalRoot = useMemo(() => buildTree(treeArr), [treeArr])
  const invertedRoot = useMemo(() => {
    const copy = buildTree(treeArr)
    function invert(node) {
      if (!node) return
      [node.left, node.right] = [node.right, node.left]
      invert(node.left)
      invert(node.right)
    }
    invert(copy)
    return copy
  }, [treeArr])

  const steps = useMemo(() => generateSteps(treeArr).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [treeArr])
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
        title: "🌳 Tree Mirror",
        content: <VisualizationPanel step={step} originalRoot={originalRoot} invertedRoot={invertedRoot} />,
      },
    ],
    [step, connectivity, setActiveLineDom, originalRoot, invertedRoot]
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
