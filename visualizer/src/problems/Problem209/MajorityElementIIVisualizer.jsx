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
import "./MajorityElementIIVisualizer.css"

const SOLUTION_CODE = [
  { line: 1, text: "def majorityElement(nums):" },
  { line: 2, text: "    count1, count2 = 0, 0" },
  { line: 3, text: "    cand1, cand2 = None, None" },
  { line: 4, text: "    for num in nums:" },
  { line: 5, text: "        if num == cand1:" },
  { line: 6, text: "            count1 += 1" },
  { line: 7, text: "        elif num == cand2:" },
  { line: 8, text: "            count2 += 1" },
  { line: 9, text: "        elif count1 == 0:" },
  { line: 10, text: "            cand1, count1 = num, 1" },
  { line: 11, text: "        elif count2 == 0:" },
  { line: 12, text: "            cand2, count2 = num, 1" },
  { line: 13, text: "        else:" },
  { line: 14, text: "            count1, count2 = count1 - 1, count2 - 1" },
  { line: 15, text: "    count1, count2 = 0, 0" },
  { line: 16, text: "    for num in nums:" },
  { line: 17, text: "        if num == cand1: count1 += 1" },
  { line: 18, text: "        elif num == cand2: count2 += 1" },
  { line: 19, text: "    res = []" },
  { line: 20, text: "    if count1 > len(nums) // 3: res.append(cand1)" },
  { line: 21, text: "    if count2 > len(nums) // 3: res.append(cand2)" },
  { line: 22, text: "    return res" },
]

function generateSteps(arr) {
  const steps = []
  const n = arr.length
  const threshold = Math.floor(n / 3)
  steps.push({ activeLine: 1, arr, n, threshold, message: `Find elements appearing more than ${threshold} times`, relatedLines: [1] })
  steps.push({ activeLine: 2, arr, message: "Initialize two candidates and their counts", relatedLines: [2, 3] })
  let count1 = 0, count2 = 0, cand1 = null, cand2 = null
  steps.push({ activeLine: 4, arr, message: "First pass: find two candidates", relatedLines: [4] })
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i]
    steps.push({ activeLine: 4, i, num, cand1, cand2, count1, count2, message: `Index ${i}: num = ${num}`, relatedLines: [4] })
    if (num === cand1) {
      count1++
      steps.push({ activeLine: 6, i, num, cand1, count1, message: `Matches cand1, count1++`, relatedLines: [6] })
    } else if (num === cand2) {
      count2++
      steps.push({ activeLine: 8, i, num, cand2, count2, message: `Matches cand2, count2++`, relatedLines: [8] })
    } else if (count1 === 0) {
      cand1 = num
      count1 = 1
      steps.push({ activeLine: 10, i, num, cand1, count1, message: `Set cand1 = ${num}`, relatedLines: [10] })
    } else if (count2 === 0) {
      cand2 = num
      count2 = 1
      steps.push({ activeLine: 12, i, num, cand2, count2, message: `Set cand2 = ${num}`, relatedLines: [12] })
    } else {
      count1--
      count2--
      steps.push({ activeLine: 14, i, num, count1, count2, message: `Both candidates exist, decrement both`, relatedLines: [14] })
    }
  }
  steps.push({ activeLine: 15, cand1, cand2, count1, count2, message: "Second pass: verify candidates", relatedLines: [15] })
  count1 = 0
  count2 = 0
  for (let i = 0; i < arr.length; i++) {
    const num = arr[i]
    if (num === cand1) count1++
    else if (num === cand2) count2++
  }
  steps.push({ activeLine: 16, arr, cand1, cand2, count1, count2, message: `cand1=${cand1} (count=${count1}), cand2=${cand2} (count=${count2})`, relatedLines: [16] })
  const result = []
  if (cand1 !== null && count1 > threshold) result.push(cand1)
  if (cand2 !== null && count2 > threshold) result.push(cand2)
  steps.push({ activeLine: 20, cand1, count1, threshold, pass: count1 > threshold, message: `cand1 passes? ${count1} > ${threshold} = ${count1 > threshold}`, relatedLines: [20] })
  if (cand2 !== null) steps.push({ activeLine: 21, cand2, count2, threshold, pass: count2 > threshold, message: `cand2 passes? ${count2} > ${threshold} = ${count2 > threshold}`, relatedLines: [21] })
  steps.push({ activeLine: 22, result, done: true, message: `Result: [${result.join(", ")}]`, relatedLines: [22] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>Boyer-Moore: track at most 2 candidates per element comparison.</div>
      </div>
      {step.arr && step.arr.length <= 15 && <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 6 }}>Array</div><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{step.arr.map((v, idx) => <div key={idx} style={{ padding: "4px 8px", borderRadius: 3, backgroundColor: step.i === idx ? "#fbbf24" : "#e2e8f0", fontFamily: "monospace", fontWeight: 600, color: step.i === idx ? "#000" : "#334155", fontSize: 12 }}>{v}</div>)}</div></motion.div>}
      {step.cand1 !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Candidate 1: {step.cand1 === null ? "None" : step.cand1} (count: {step.count1})</div></motion.div>}
      {step.cand2 !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#fecdd3", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Candidate 2: {step.cand2 === null ? "None" : step.cand2} (count: {step.count2})</div></motion.div>}
      {step.pass !== undefined && <motion.div style={{ padding: 12, backgroundColor: step.pass ? "#dcfce7" : "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, color: step.pass ? "#065f46" : "#7f1d1d" }}>{step.pass ? "✓ Passes threshold" : "✗ Below threshold"}</div></motion.div>}
      {step.result && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>Result: [{step.result.join(", ")}]</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function MajorityElementIIVisualizer() {
  const [arr, setArr] = useState([3, 2, 3, 1, 2, 4, 5, 5, 6])
  const steps = useMemo(() => generateSteps(arr).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [arr])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: "code", title: "Code", content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: "viz", title: "Majority n/3", content: <VisualizationPanel step={step} /> },
  ], [step, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [["code", "viz"]], minimized: [] }} />
      <FloatingPanel title="Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle /></FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
