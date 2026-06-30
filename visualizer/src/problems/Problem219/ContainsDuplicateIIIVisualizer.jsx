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
import "./ContainsDuplicateIIIVisualizer.css"
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def containsNearbyAlmostDuplicate(nums, k, t):" },
  { line: 2, text: "    if t < 0: return False" },
  { line: 3, text: "    bst = set()" },
  { line: 4, text: "    for i in range(len(nums)):" },
  { line: 5, text: "        if i > k: bst.remove(nums[i - k - 1])" },
  { line: 6, text: "        for elem in bst:" },
  { line: 7, text: "            if abs(nums[i] - elem) <= t:" },
  { line: 8, text: "                return True" },
  { line: 9, text: "        bst.add(nums[i])" },
  { line: 10, text: "    return False" },
]

function generateSteps(nums, k, t) {
  const steps = []
  steps.push({
    activeLine: 1,
    nums,
    k,
    t,
    message: `Find duplicates within distance k and value diff t`,
    relatedLines: [1],
  })

  if (t < 0) {
    steps.push({
      activeLine: 2,
      result: false,
      done: true,
      message: "t < 0, impossible",
      relatedLines: [2],
    })
    return steps
  }

  const bst = new Set()
  steps.push({
    activeLine: 3,
    message: "Initialize BST (using Set for simplified demo)",
    relatedLines: [3],
  })

  steps.push({
    activeLine: 4,
    message: "Sliding window of size k",
    relatedLines: [4],
  })

  for (let i = 0; i < nums.length; i++) {
    steps.push({
      activeLine: 4,
      i,
      num: nums[i],
      nums,
      bst: Array.from(bst),
      windowStart: Math.max(0, i - k),
      message: `Index ${i}: num = ${nums[i]}`,
      relatedLines: [4],
    })

    if (i > k) {
      const removed = nums[i - k - 1]
      steps.push({
        activeLine: 5,
        i,
        removed,
        message: `Remove nums[${i - k - 1}] = ${removed}`,
        relatedLines: [5],
      })
      bst.delete(removed)
    }

    steps.push({
      activeLine: 6,
      i,
      num: nums[i],
      bst: Array.from(bst),
      message: "Check all elements in window",
      relatedLines: [6],
    })

    for (const elem of bst) {
      const diff = Math.abs(nums[i] - elem)
      steps.push({
        activeLine: 7,
        i,
        elem,
        num: nums[i],
        diff,
        t,
        message: `Check |${nums[i]} - ${elem}| = ${diff}`,
        relatedLines: [7],
      })

      if (diff <= t) {
        steps.push({
          activeLine: 8,
          result: true,
          done: true,
          message: `Found: |${nums[i]} - ${elem}| = ${diff} <= ${t}`,
          relatedLines: [8],
        })
        return steps
      }
    }

    bst.add(nums[i])
    steps.push({
      activeLine: 9,
      i,
      num: nums[i],
      bst: Array.from(bst),
      message: `Add ${nums[i]} to window`,
      relatedLines: [9],
    })
  }

  steps.push({
    activeLine: 10,
    result: false,
    done: true,
    message: "No duplicates found",
    relatedLines: [10],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Sliding window with element-value difference checking.
        </div>
      </div>

      {step.k !== undefined && step.t !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#065f46" }}>
            Max index distance: {step.k} | Max value diff: {step.t}
          </div>
        </motion.div>
      )}

      {step.nums && (
        <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 6 }}>
            Array
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.nums.map((num, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: idx === step.i ? "#fbbf24" : "#e2e8f0",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: idx === step.i ? "#000" : "#334155",
                  fontSize: 11,
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.bst && step.bst.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 6 }}>
            Window elements
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.bst.map((elem, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: "#dbeafe",
                  border: "2px solid #0c4a6e",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#0c4a6e",
                  fontSize: 11,
                }}
              >
                {elem}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.diff !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: step.diff <= step.t ? "#fee2e2" : "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: step.diff <= step.t ? "#7f1d1d" : "#3730a3" }}>
            |{step.num} - {step.elem}| = {step.diff} {step.diff <= step.t ? `<= ${step.t}` : `> ${step.t}`}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? "#fee2e2" : "#dcfce7",
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: step.result ? "#ef4444" : "#10b981",
            }}
          >
            {step.result ? "Found Duplicate ✗" : "No Duplicate ✓"}
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

export default function ContainsDuplicateIIIVisualizer() {
  const [nums] = useState([1, 2, 3, 1, 2, 3])
  const [k] = useState(2)
  const [t] = useState(0)
  const steps = useMemo(() => generateSteps(nums, k, t).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [nums, k, t])
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
        title: "📊 Value Range",
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
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

