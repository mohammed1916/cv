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
import "./ValidParenthesesVisualizer.css"
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
  { line: 1, text: "def isValid(s):" },
  { line: 2, text: "    stack = []" },
  { line: 3, text: "    mapping = {')': '(', '}': '{', ']': '['}" },
  { line: 4, text: "    for char in s:" },
  { line: 5, text: "        if char in mapping:" },
  { line: 6, text: "            if not stack or stack[-1] != mapping[char]:" },
  { line: 7, text: "                return False" },
  { line: 8, text: "            stack.pop()" },
  { line: 9, text: "        else:" },
  { line: 10, text: "            stack.append(char)" },
  { line: 11, text: "    return len(stack) == 0" },
]

function generateSteps(s) {
  const steps = []
  const mapping = { ")": "(", "}": "{", "]": "[" }

  steps.push({
    activeLine: 1,
    s,
    message: "Check if parentheses are valid and balanced",
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Initialize empty stack",
    relatedLines: [2],
  })

  steps.push({
    activeLine: 3,
    message: "Define closing-to-opening bracket mapping",
    relatedLines: [3],
  })

  const stack = []
  steps.push({
    activeLine: 4,
    message: "Iterate through each character",
    relatedLines: [4],
  })

  for (let i = 0; i < s.length; i++) {
    const char = s[i]
    steps.push({
      activeLine: 4,
      i,
      char,
      s,
      stack: [...stack],
      message: `Index ${i}: char = "${char}"`,
      relatedLines: [4],
    })

    if (char in mapping) {
      steps.push({
        activeLine: 5,
        char,
        isClosing: true,
        message: `"${char}" is closing bracket`,
        relatedLines: [5],
      })

      if (stack.length === 0 || stack[stack.length - 1] !== mapping[char]) {
        steps.push({
          activeLine: 6,
          char,
          stack: [...stack],
          expected: mapping[char],
          result: false,
          done: true,
          message: `Mismatch or empty: expected "${mapping[char]}"`,
          relatedLines: [6],
        })
        return steps
      }

      stack.pop()
      steps.push({
        activeLine: 8,
        char,
        stack: [...stack],
        message: `Pop "${stack[stack.length] || ""}"; matched pair`,
        relatedLines: [8],
      })
    } else {
      steps.push({
        activeLine: 9,
        message: `"${char}" is opening bracket`,
        relatedLines: [9],
      })

      stack.push(char)
      steps.push({
        activeLine: 10,
        char,
        stack: [...stack],
        message: `Push "${char}" onto stack`,
        relatedLines: [10],
      })
    }
  }

  const isValid = stack.length === 0
  steps.push({
    activeLine: 11,
    stack: [...stack],
    result: isValid,
    done: true,
    message: isValid
      ? "Stack empty: all brackets matched ✓"
      : `Stack not empty: ${stack.length} unmatched brackets`,
    relatedLines: [11],
  })

  return steps
}

function StackDisplay({ stack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}>
      {stack.map((char, idx) => (
        <motion.div
          key={idx}
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            backgroundColor: "#dbeafe",
            border: "2px solid #0c4a6e",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#0c4a6e",
            fontSize: 14,
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {char}
        </motion.div>
      ))}
      {stack.length === 0 && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            backgroundColor: "#e2e8f0",
            color: "#94a3b8",
            fontFamily: "monospace",
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          empty
        </div>
      )}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Stack: push opening, pop on closing, match required.
        </div>
      </div>

      {step.s && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            String
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.s.split("").map((c, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: idx === step.i ? "#fbbf24" : "#e2e8f0",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: idx === step.i ? "#000" : "#334155",
                  fontSize: 12,
                }}
              >
                {c}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.char !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.isClosing ? "#fecdd3" : "#fed7aa",
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 12,
              color: step.isClosing ? "#7f1d1d" : "#92400e",
              fontWeight: 600,
            }}
          >
            Current: "{step.char}" {step.isClosing ? "(closing)" : "(opening)"}
          </div>
        </motion.div>
      )}

      {step.stack && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 8 }}>
            Stack (top → bottom)
          </div>
          <StackDisplay stack={step.stack} />
        </motion.div>
      )}

      {step.expected !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#7f1d1d" }}>
            Expected match: "{step.expected}" but got: "{step.stack[step.stack.length - 1] || "empty"}"
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? "#dcfce7" : "#fee2e2",
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: step.result ? "#10b981" : "#ef4444",
            }}
          >
            {step.result ? "Valid ✓" : "Invalid ✗"}
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

export default function ValidParenthesesVisualizer() {
  const [s] = useState("({[]})")
  const steps = useMemo(() => generateSteps(s).map((st) => ({ ...st, relatedLines: st.relatedLines ?? [st.activeLine] })), [s])
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
        title: "🔗 Stack Matching",
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
