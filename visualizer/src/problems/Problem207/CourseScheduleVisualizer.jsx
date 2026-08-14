import { useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion } from "framer-motion"
import LuminoDockPanel from "../../components/LuminoDockPanel"
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import "./CourseScheduleVisualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def canFinish(numCourses, prereqs):" },
  { line: 2, text: "    graph = [[] for _ in range(numCourses)]" },
  { line: 3, text: "    for course, prereq in prereqs:" },
  { line: 4, text: "        graph[course].append(prereq)" },
  { line: 5, text: "    visited = [0] * numCourses" },
  { line: 6, text: "    def dfs(node):" },
  { line: 7, text: "        if visited[node] == 2: return True" },
  { line: 8, text: "        if visited[node] == 1: return False" },
  { line: 9, text: "        visited[node] = 1" },
  { line: 10, text: "        for neighbor in graph[node]:" },
  { line: 11, text: "            if not dfs(neighbor): return False" },
  { line: 12, text: "        visited[node] = 2" },
  { line: 13, text: "        return True" },
  { line: 14, text: "    for course in range(numCourses):" },
  { line: 15, text: "        if not dfs(course): return False" },
  { line: 16, text: "    return True" },
]

function generateSteps(numCourses, prerequisites) {
  const steps = []
  steps.push({ activeLine: 1, numCourses, message: "Can finish all courses?", relatedLines: [1] })
  const graph = Array.from({ length: numCourses }, () => [])
  for (const [course, prereq] of prerequisites) graph[course].push(prereq)
  steps.push({ activeLine: 2, numCourses, message: "Build adjacency list", relatedLines: [2] })
  steps.push({ activeLine: 3, graph, message: "Populate graph", relatedLines: [3, 4] })
  for (const [course, prereq] of prerequisites) steps.push({ activeLine: 4, course, prereq, graph, message: "Add edge", relatedLines: [4] })
  const visited = Array(numCourses).fill(0)
  steps.push({ activeLine: 5, graph, visited: [...visited], message: "Initialize states", relatedLines: [5] })
  steps.push({ activeLine: 14, graph, visited: [...visited], message: "Start DFS", relatedLines: [14] })
  function dfs(node) {
    if (visited[node] === 2) { steps.push({ activeLine: 7, node, visited: [...visited], message: "Completed", relatedLines: [7] }); return true }
    if (visited[node] === 1) { steps.push({ activeLine: 8, node, visited: [...visited], hasCycle: true, message: "CYCLE!", relatedLines: [8] }); return false }
    visited[node] = 1
    steps.push({ activeLine: 9, node, visited: [...visited], message: "Visiting", relatedLines: [9] })
    steps.push({ activeLine: 10, node, graph, visited: [...visited], message: "Explore", relatedLines: [10] })
    for (const neighbor of graph[node]) {
      steps.push({ activeLine: 11, node, neighbor, visited: [...visited], message: "Check", relatedLines: [11] })
      if (!dfs(neighbor)) return false
    }
    visited[node] = 2
    steps.push({ activeLine: 12, node, visited: [...visited], message: "Done", relatedLines: [12] })
    return true
  }
  for (let course = 0; course < numCourses; course++) {
    if (visited[course] === 0) {
      steps.push({ activeLine: 15, course, message: "DFS", relatedLines: [15] })
      if (!dfs(course)) { steps.push({ activeLine: 15, result: false, done: true, message: "Cycle found", relatedLines: [15] }); return steps }
    }
  }
  steps.push({ activeLine: 16, visited: [...visited], result: true, done: true, message: "No cycles", relatedLines: [16] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>DFS cycle detection with 3 states.</div>
      </div>
      {step.numCourses !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, color: "#065f46" }}>Courses: {step.numCourses}</div></motion.div>}
      {step.node !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, color: "#92400e" }}>Current: {step.node}</div></motion.div>}
      {step.hasCycle && <motion.div style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#7f1d1d" }}>CYCLE!</div></motion.div>}
      {step.visited && <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 11, fontFamily: "monospace", color: "#4f46e5" }}>{step.visited.map((v, i) => i + ":" + v).join(" ")}</div></motion.div>}
      {step.result !== undefined && <motion.div style={{ padding: 12, backgroundColor: step.result ? "#dcfce7" : "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: step.result ? "#10b981" : "#ef4444" }}>{step.result ? "Can Finish" : "Cannot"}</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function CourseScheduleVisualizer() {
  const [numCoursesInput, setNumCoursesInput] = useState(4);
  const [prerequisitesInput, setPrerequisitesInput] = useState("[[1,0],[2,1],[3,2]]");
  const { numCourses, prerequisites, inputError } = useMemo(() => {
    try {
      const parsedNumCourses = Number(numCoursesInput); if (isNaN(parsedNumCourses)) throw new Error('numCourses must be a number');
      const parsedPrerequisites = JSON.parse(prerequisitesInput); if (!Array.isArray(parsedPrerequisites)) throw new Error('prerequisites must be an array');
      return { numCourses: parsedNumCourses, prerequisites: parsedPrerequisites, inputError: '' };
    } catch (e) {
      return { numCourses: 4, prerequisites: [[1,0],[2,1],[3,2]], inputError: e.message };
    }
  }, [numCoursesInput, prerequisitesInput]);
  const steps = useMemo(() => generateSteps(numCourses, prerequisites).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [numCourses, prerequisites])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )
  const vizPanel = (
    <>
    <VisualizationPanel step={step} />
  
    </>)
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: "code", title: "Code" },
    { id: "viz", title: "Cycle Detection", dockMode: "split-right" },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle />
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

