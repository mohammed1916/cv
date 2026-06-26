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
import "./CombinationSumIIIVisualizer.css"

const SOLUTION_CODE = [
  { line: 1, text: "def combinationSum3(k, n):" },
  { line: 2, text: "    result = []" },
  { line: 3, text: "    def backtrack(start, path, target):" },
  { line: 4, text: "        if len(path) == k:" },
  { line: 5, text: "            if target == 0: result.append(path[:])" },
  { line: 6, text: "            return" },
  { line: 7, text: "        if target <= 0: return" },
  { line: 8, text: "        for i in range(start, 10):" },
  { line: 9, text: "            path.append(i)" },
  { line: 10, text: "            backtrack(i + 1, path, target - i)" },
  { line: 11, text: "            path.pop()" },
  { line: 12, text: "    backtrack(1, [], n)" },
  { line: 13, text: "    return result" },
]

function generateSteps(k, n) {
  const steps = []
  steps.push({
    activeLine: 1,
    k,
    n,
    message: `Find ${k} numbers from 1-9 summing to ${n}`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 3,
    message: "Backtracking with three parameters: start, path, remaining target",
    relatedLines: [3],
  })

  const result = []
  let callCount = 0

  function backtrack(start, path, target, depth = 0) {
    if (callCount > 15) return
    callCount++

    steps.push({
      activeLine: 4,
      start,
      path: [...path],
      target,
      depth,
      message: `Check: len(path)=${path.length}, k=${k}`,
      relatedLines: [4],
    })

    if (path.length === k) {
      if (target === 0) {
        result.push([...path])
        steps.push({
          activeLine: 5,
          path: [...path],
          depth,
          found: true,
          message: `Found valid combination: [${path.join(", ")}]`,
          relatedLines: [5],
        })
      }
      return
    }

    if (target <= 0) {
      steps.push({
        activeLine: 7,
        target,
        depth,
        message: `Target <= 0, prune`,
        relatedLines: [7],
      })
      return
    }

    steps.push({
      activeLine: 8,
      start,
      message: `Try numbers from ${start} to 9`,
      relatedLines: [8],
    })

    for (let i = start; i < 10; i++) {
      steps.push({
        activeLine: 9,
        i,
        path: [...path, i],
        target: target - i,
        depth,
        message: `Add ${i}: path=[${[...path, i].join(", ")}], remaining=${target - i}`,
        relatedLines: [9],
      })

      path.push(i)
      backtrack(i + 1, path, target - i, depth + 1)
      path.pop()

      steps.push({
        activeLine: 11,
        i,
        path: [...path],
        message: `Backtrack from ${i}`,
        relatedLines: [11],
      })
    }
  }

  backtrack(1, [], n)

  steps.push({
    activeLine: 13,
    result,
    done: true,
    message: `Found ${result.length} combination(s)`,
    relatedLines: [13],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Backtracking: explore → check constraints → prune → undo
        </div>
      </div>

      {step.k !== undefined && step.n !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#065f46" }}>
            Find {step.k} numbers summing to {step.n}
          </div>
        </motion.div>
      )}

      {step.path && step.path.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#92400e", marginBottom: 6 }}>
            Current Path ({step.path.length}/{step.k})
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {step.path.map((num, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: "#fbbf24",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#000",
                  fontSize: 12,
                }}
              >
                {num}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.target !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#0c4a6e" }}>
            Remaining sum: {step.target}
          </div>
        </motion.div>
      )}

      {step.start !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#3730a3" }}>
            Trying from: {step.start}
          </div>
        </motion.div>
      )}

      {step.i !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fecdd3", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#7f1d1d" }}>
            Current choice: {step.i}
          </div>
        </motion.div>
      )}

      {step.found && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#065f46" }}>
            ✓ Valid combination
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#d1fae5", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 6 }}>
            Results ({step.result.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {step.result.slice(0, 4).map((combo, idx) => (
              <div key={idx} style={{ fontSize: 11, color: "#065f46", fontFamily: "monospace" }}>
                [{combo.join(", ")}]
              </div>
            ))}
            {step.result.length > 4 && <div style={{ fontSize: 11, color: "#065f46" }}>...and {step.result.length - 4} more</div>}
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

export default function CombinationSumIIIVisualizer() {
  const [k] = useState(3)
  const [n] = useState(7)
  const steps = useMemo(() => generateSteps(k, n).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [k, n])
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
        title: "🔢 Combinations",
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
