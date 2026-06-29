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
import "./ContainsDuplicateVisualizer.css"
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: "def containsDuplicate(nums):" },
  { line: 2, text: "    seen = set()" },
  { line: 3, text: "    for num in nums:" },
  { line: 4, text: "        if num in seen:" },
  { line: 5, text: "            return True" },
  { line: 6, text: "        seen.add(num)" },
  { line: 7, text: "    return False" },
]

function generateSteps(nums) {
  const steps = []
  steps.push({
    activeLine: 1,
    nums,
    message: "Check if array contains any duplicate",
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Initialize empty set",
    relatedLines: [2],
  })

  const seen = new Set()
  steps.push({
    activeLine: 3,
    message: "Iterate through array",
    relatedLines: [3],
  })

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    steps.push({
      activeLine: 3,
      i,
      num,
      nums,
      seen: Array.from(seen),
      message: `Index ${i}: num = ${num}`,
      relatedLines: [3],
    })

    if (seen.has(num)) {
      steps.push({
        activeLine: 4,
        i,
        num,
        seen: Array.from(seen),
        message: `Found ${num} in set`,
        relatedLines: [4],
      })

      steps.push({
        activeLine: 5,
        result: true,
        done: true,
        message: `Duplicate found: ${num}`,
        relatedLines: [5],
      })
      return steps
    }

    seen.add(num)
    steps.push({
      activeLine: 6,
      i,
      num,
      seen: Array.from(seen),
      message: `Add ${num} to set`,
      relatedLines: [6],
    })
  }

  steps.push({
    activeLine: 7,
    result: false,
    done: true,
    message: "No duplicates found",
    relatedLines: [7],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Hash set lookup: O(1) average, detect duplicates in O(n) time.
        </div>
      </div>

      {step.nums && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Array
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.nums.map((n, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: "6px 10px",
                  borderRadius: 4,
                  backgroundColor: idx === step.i ? "#fbbf24" : "#e2e8f0",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: idx === step.i ? "#000" : "#334155",
                  fontSize: 12,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {n}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step.num !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fecdd3", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 600 }}>
            Current element: {step.num}
          </div>
        </motion.div>
      )}

      {step.seen && step.seen.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 6 }}>
            Seen Set ({step.seen.length})
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {step.seen.map((val, idx) => (
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
                {val}
              </div>
            ))}
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
            {step.result ? "Contains Duplicate ✗" : "No Duplicate ✓"}
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

export default function ContainsDuplicateVisualizer() {
  const [nums] = useState([1, 2, 3, 1])
  const steps = useMemo(() => generateSteps(nums).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [nums])
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
        title: "🔍 Hash Set",
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
