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
import "./RemoveLinkedListElementsVisualizer.css"

const EXAMPLES = [{ label: "Example", head: [1, 2, 6, 3, 4, 5, 6], val: 6 }]
const SOLUTION_CODE = [
  { line: 1, text: "def removeElements(head, val):" },
  { line: 2, text: "    dummy = ListNode(0)" },
  { line: 3, text: "    dummy.next = head" },
  { line: 4, text: "    prev = dummy" },
  { line: 5, text: "    while prev.next:" },
  { line: 6, text: "        if prev.next.val == val:" },
  { line: 7, text: "            prev.next = prev.next.next" },
  { line: 8, text: "        else:" },
  { line: 9, text: "            prev = prev.next" },
  { line: 10, text: "    return dummy.next" },
]

function buildList(arr) {
  if (!arr.length) return null
  const head = { val: arr[0], next: null, id: 0 }
  let cur = head
  for (let i = 1; i < arr.length; i++) { cur.next = { val: arr[i], next: null, id: i }; cur = cur.next }
  return head
}

function generateSteps(head, val) {
  const steps = []
  steps.push({ activeLine: 1, head, val, message: `Remove all ${val} from list`, relatedLines: [1] })
  steps.push({ activeLine: 2, message: "Create dummy node", relatedLines: [2, 3] })
  const dummy = { val: 0, next: head, id: -1 }
  let prev = dummy
  const removed = []
  let index = 0
  while (prev.next) {
    const nodeVal = prev.next.val
    steps.push({ activeLine: 5, prev: prev.val, curr: nodeVal, val, removed, message: `Check node ${nodeVal}`, relatedLines: [5] })
    if (nodeVal === val) {
      removed.push(nodeVal)
      steps.push({ activeLine: 6, prev: prev.val, curr: nodeVal, val, removed, message: `Match! Skip node ${nodeVal}`, relatedLines: [6, 7] })
      prev.next = prev.next.next
      steps.push({ activeLine: 7, prev: prev.val, removed, message: `Removed: ${removed.length} nodes so far`, relatedLines: [7] })
    } else {
      steps.push({ activeLine: 9, prev: prev.val, curr: nodeVal, message: `Keep node ${nodeVal}, advance`, relatedLines: [9] })
      prev = prev.next
    }
  }
  steps.push({ activeLine: 10, done: true, removed, message: `Complete! Removed ${removed.length} nodes.`, relatedLines: [10] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#cffafe", borderRadius: 6, borderLeft: "4px solid #06b6d4" }}>
        <div style={{ fontSize: 12, color: "#164e63", fontStyle: "italic" }}>Use dummy node, skip matching values.</div>
      </div>
      {step.val && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>Target Value: {step.val}</div></motion.div>}
      {step.curr && <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Current Node: {step.curr}</div></motion.div>}
      {step.removed && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>Removed ({step.removed.length}): {step.removed.join(", ") || "none"}</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function RemoveLinkedListElementsVisualizer() {
  const [input, setInput] = useState({ head: [1, 2, 6, 3, 4, 5, 6], val: 6 })
  const steps = useMemo(() => generateSteps(buildList(input.head), input.val).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [input])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
    { id: "code", title: "Code", content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
    { id: "viz", title: "🔗 Remove Elements", content: <VisualizationPanel step={step} /> },
  ], [step, connectivity, setActiveLineDom])
  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [["code", "viz"]], minimized: [] }} />
      <FloatingPanel title="Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle /></FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
