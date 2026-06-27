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
import "./HappyNumberVisualizer.css"

const EXAMPLES = [{ label: "Example 1", n: 19 }]
const SOLUTION_CODE = [
  { line: 1, text: "def isHappy(n):" },
  { line: 2, text: "    seen = set()" },
  { line: 3, text: "    while n != 1 and n not in seen:" },
  { line: 4, text: "        seen.add(n)" },
  { line: 5, text: "        n = sum(int(d)**2 for d in str(n))" },
  { line: 6, text: "    return n == 1" },
]

function generateSteps(n) {
  const steps = []
  steps.push({ activeLine: 1, n, message: `Check if ${n} is happy`, relatedLines: [1] })
  steps.push({ activeLine: 2, message: "Initialize seen set", relatedLines: [2] })
  const seen = new Set()
  const sequence = [n]
  let current = n
  while (current !== 1 && !seen.has(current) && sequence.length < 20) {
    seen.add(current)
    const digits = String(current).split("").map(Number)
    steps.push({ activeLine: 4, current, digits, seen: Array.from(seen), message: `Digits: ${digits.join(", ")}`, relatedLines: [4] })
    const sumSq = digits.reduce((sum, d) => sum + d * d, 0)
    steps.push({ activeLine: 5, current, sumSq, message: `Sum of squares = ${sumSq}`, relatedLines: [5] })
    current = sumSq
    sequence.push(current)
  }
  steps.push({ activeLine: 6, result: current === 1, sequence, done: true, message: current === 1 ? "HAPPY!" : "SAD", relatedLines: [6] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }}>
        <div style={{ fontSize: 12, color: "#92400e", fontStyle: "italic" }}>Square digits, track cycles.</div>
      </div>
      {step.n && <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }}>{step.n}</div>}
      {step.digits && <div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }}>Digits: {step.digits.join(", ")}</div>}
      {step.sumSq && <div style={{ padding: 12, backgroundColor: "#f3e8ff", borderRadius: 6 }}>Sum: {step.sumSq}</div>}
      {step.sequence && <div style={{ padding: 12, backgroundColor: "#d1fae5", borderRadius: 6 }}>Sequence: {step.sequence.slice(0, 6).join(" → ")}</div>}
      {step.message && <div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12 }}>{step.message}</div>}
    </div>
  )
}

export default function HappyNumberVisualizer() {
  const [input, setInput] = useState(19)
  const steps = useMemo(() => generateSteps(input).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [input])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: "code", title: "Code", content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: "viz", title: "😊 Happy", content: <VisualizationPanel step={step} /> },
  ], [step, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [["code", "viz"]], minimized: [] }} />
      <FloatingPanel title="Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle /></FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
