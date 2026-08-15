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
import "./HappyNumberVisualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
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
  const [nInput, setNInput] = useState("19");
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 19, inputError: e.message };
    }
  }, [nInput]);  const steps = useMemo(() => generateSteps(n).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [n])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )
  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"n","label":"n","type":"number"}]}
        values={{ n: nInput }}
        onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
        showExamples={false}
        inputError={inputError}
      />
    <VisualizationPanel step={step} />
  
    </>)

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: "code", title: "Code" },
    { id: "viz", title: "😊 Happy", dockMode: "split-right" },
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

