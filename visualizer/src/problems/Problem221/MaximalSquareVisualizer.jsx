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
import "./MaximalSquareVisualizer.css"
const SOLUTION_CODE = [
  { line: 1, text: "def maximalSquare(matrix):" },
  { line: 2, text: "    if not matrix: return 0" },
  { line: 3, text: "    m, n = len(matrix), len(matrix[0])" },
  { line: 4, text: "    dp = [[0] * n for _ in range(m)]" },
  { line: 5, text: "    max_side = 0" },
  { line: 6, text: "    for i in range(m):" },
  { line: 7, text: "        for j in range(n):" },
  { line: 8, text: "            if matrix[i][j] == '1':" },
  { line: 9, text: "                if i == 0 or j == 0:" },
  { line: 10, text: "                    dp[i][j] = 1" },
  { line: 11, text: "                else:" },
  { line: 12, text: "                    dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1" },
  { line: 13, text: "                max_side = max(max_side, dp[i][j])" },
  { line: 14, text: "    return max_side * max_side" },
]

function generateSteps(matrix) {
  const steps = []
  const m = matrix.length
  const n = matrix[0].length

  steps.push({
    activeLine: 1,
    m,
    n,
    message: `Find maximal square in ${m}x${n} grid`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 4,
    message: "Initialize DP table",
    relatedLines: [4],
  })

  const dp = Array(m)
    .fill()
    .map(() => Array(n).fill(0))
  let maxSide = 0

  steps.push({
    activeLine: 6,
    message: "Fill DP table row by row",
    relatedLines: [6, 7],
  })

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === "1") {
        if (i === 0 || j === 0) {
          dp[i][j] = 1
          steps.push({
            activeLine: 10,
            i,
            j,
            matrix,
            dp: dp.map((row) => [...row]),
            maxSide,
            message: `Edge cell (${i},${j}): dp[${i}][${j}] = 1`,
            relatedLines: [10],
          })
        } else {
          const top = dp[i - 1][j]
          const left = dp[i][j - 1]
          const diag = dp[i - 1][j - 1]
          dp[i][j] = Math.min(top, left, diag) + 1

          steps.push({
            activeLine: 12,
            i,
            j,
            top,
            left,
            diag,
            dpValue: dp[i][j],
            matrix,
            dp: dp.map((row) => [...row]),
            message: `(${i},${j}): min(${top},${left},${diag})+1 = ${dp[i][j]}`,
            relatedLines: [12],
          })
        }

        maxSide = Math.max(maxSide, dp[i][j])
        steps.push({
          activeLine: 13,
          i,
          j,
          maxSide,
          dp: dp.map((row) => [...row]),
          message: `Max side updated: ${maxSide}`,
          relatedLines: [13],
        })
      }
    }
  }

  steps.push({
    activeLine: 14,
    maxSide,
    result: maxSide * maxSide,
    done: true,
    message: `Max square area: ${maxSide}² = ${maxSide * maxSide}`,
    relatedLines: [14],
  })

  return steps
}

function MatrixDisplay({ matrix, dp, highlightedCell }) {
  return (
    <div style={{ display: "inline-block", backgroundColor: "#1e293b", padding: 8, borderRadius: 4 }}>
      {matrix.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
          {row.map((cell, j) => (
            <motion.div
              key={`${i}-${j}`}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor:
                  highlightedCell && highlightedCell[0] === i && highlightedCell[1] === j
                    ? "#fbbf24"
                    : cell === "1"
                      ? "#d1fae5"
                      : "#e2e8f0",
                borderRadius: 4,
                fontFamily: "monospace",
                fontWeight: 700,
                color: "#334155",
                fontSize: 14,
                border: "1px solid #64748b",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {cell}
            </motion.div>
          ))}
          {dp && dp[i] && (
            <>
              <div style={{ width: 2, marginX: 4 }} />
              {dp[i].map((val, j) => (
                <motion.div
                  key={`dp-${i}-${j}`}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: val > 0 ? "#fecdd3" : "#e2e8f0",
                    borderRadius: 4,
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: val > 0 ? "#7f1d1d" : "#94a3b8",
                    fontSize: 12,
                    border: "1px solid #94a3b8",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {val}
                </motion.div>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function VisualizationPanel({ step, matrix }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          DP: dp[i][j] = min of 3 neighbors + 1 if current is 1.
        </div>
      </div>

      {step.m !== undefined && step.n !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#065f46" }}>
            Matrix: {step.m}x{step.n}
          </div>
        </motion.div>
      )}

      {step.dp && (
        <motion.div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#5b21b6", marginBottom: 8 }}>
            Matrix (left) | DP Table (right)
          </div>
          <MatrixDisplay matrix={step.matrix} dp={step.dp} highlightedCell={[step.i, step.j]} />
        </motion.div>
      )}

      {step.top !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 4 }}>
            Neighbors
          </div>
          <div style={{ fontSize: 12, color: "#0c4a6e", fontFamily: "monospace" }}>
            top={step.top} | left={step.left} | diag={step.diag} | result={step.dpValue}
          </div>
        </motion.div>
      )}

      {step.maxSide !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            Max side length: {step.maxSide}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
            Max square area: {step.result}
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

export default function MaximalSquareVisualizer() {
  const [matrix] = useState([
    ["1", "0", "1", "0", "0"],
    ["1", "0", "1", "1", "1"],
    ["1", "1", "1", "1", "1"],
    ["1", "0", "0", "1", "0"],
  ])

  const steps = useMemo(() => generateSteps(matrix).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [matrix])
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
        title: "⬜ Maximal Square",
        content: <VisualizationPanel step={step} matrix={matrix} />,
      },
    ],
    [step, connectivity, setActiveLineDom, matrix]
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

