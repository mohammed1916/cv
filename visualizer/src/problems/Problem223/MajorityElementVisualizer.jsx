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
import "./MajorityElementVisualizer.css"
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def majorityElement(nums):" },
  { line: 2, text: "    count = 0" },
  { line: 3, text: "    candidate = None" },
  { line: 4, text: "    for num in nums:" },
  { line: 5, text: "        if count == 0:" },
  { line: 6, text: "            candidate = num" },
  { line: 7, text: "        count += 1 if num == candidate else -1" },
  { line: 8, text: "    return candidate" },
]

function generateSteps(nums) {
  const steps = []
  steps.push({
    activeLine: 1,
    nums,
    message: "Find element appearing more than n/2 times",
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Initialize count and candidate",
    relatedLines: [2, 3],
  })

  let count = 0
  let candidate = null

  steps.push({
    activeLine: 4,
    message: "Iterate through array",
    relatedLines: [4],
  })

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 4,
      i,
      num,
      nums,
      count,
      candidate,
      message: `Index ${i}: num = ${num}, count = ${count}`,
      relatedLines: [4],
    })

    if (count === 0) {
      candidate = num
      steps.push({
        activeLine: 6,
        candidate,
        message: `Count is 0, set candidate = ${candidate}`,
        relatedLines: [6],
      })
    }

    if (num === candidate) {
      count++
      steps.push({
        activeLine: 7,
        count,
        candidate,
        message: `${num} == ${candidate}, count++`,
        relatedLines: [7],
      })
    } else {
      count--
      steps.push({
        activeLine: 7,
        count,
        candidate,
        message: `${num} != ${candidate}, count--`,
        relatedLines: [7],
      })
    }
  }

  steps.push({
    activeLine: 8,
    candidate,
    result: candidate,
    done: true,
    message: `Majority element: ${candidate}`,
    relatedLines: [8],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Boyer-Moore: candidate tracking with counter increment/decrement.
        </div>
      </div>

      {step.nums && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Array
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.nums.map((n, idx) => (
              <div
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
              >
                {n}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.num !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fecdd3", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 600 }}>
            Current: {step.num}
          </div>
        </motion.div>
      )}

      {step.candidate !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            Candidate: {step.candidate === null ? "None" : step.candidate}
          </div>
        </motion.div>
      )}

      {step.count !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#0c4a6e", fontWeight: 600 }}>
            Count: {step.count}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
            Majority Element: {step.result}
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

export default function MajorityElementVisualizer() {
  const [nums] = useState([3, 2, 3, 2, 2])
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
        title: "👑 Majority Vote",
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

