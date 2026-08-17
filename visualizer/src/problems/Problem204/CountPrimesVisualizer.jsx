import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import "./CountPrimesVisualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = [{ label: "Example 1", n: 10 }, { label: "Example 2", n: 20 }]
const SOLUTION_CODE = [
  { line: 1, text: "def countPrimes(n):" },
  { line: 2, text: "    if n <= 2: return 0" },
  { line: 3, text: "    is_prime = [True] * n" },
  { line: 4, text: "    is_prime[0] = is_prime[1] = False" },
  { line: 5, text: "    for i in range(2, int(n**0.5) + 1):" },
  { line: 6, text: "        if is_prime[i]:" },
  { line: 7, text: "            for j in range(i*i, n, i):" },
  { line: 8, text: "                is_prime[j] = False" },
  { line: 9, text: "    return sum(is_prime)" },
]

function generateSteps(n) {
    const steps = []
  steps.push({ activeLine: 1, n, message: `Count primes less than ${n}`, relatedLines: [1] })
  if (n <= 2) { steps.push({ activeLine: 2, result: 0, done: true, message: "n <= 2, no primes", relatedLines: [2] }); return steps }
  steps.push({ activeLine: 3, n, message: "Initialize array to mark primes", relatedLines: [3, 4] })
  const is_prime = Array(n).fill(true)
  is_prime[0] = is_prime[1] = false
  const marked = []
  steps.push({ activeLine: 5, n, is_prime: [...is_prime], message: "Start sieving from 2", relatedLines: [5] })
  for (let i = 2; i * i < n; i++) {
    if (is_prime[i]) {
      steps.push({ activeLine: 6, i, message: `${i} is prime, mark multiples`, relatedLines: [6] })
      for (let j = i * i; j < n; j += i) {
        if (is_prime[j]) { is_prime[j] = false; marked.push(j) }
        steps.push({ activeLine: 8, i, j, marked: [...marked], is_prime: [...is_prime], message: `Mark ${j} as not prime`, relatedLines: [8] })
      }
    }
  }
  const count = is_prime.filter(Boolean).length
  const primes = is_prime.map((p, i) => p ? i : null).filter(p => p !== null)
  steps.push({ activeLine: 9, result: count, primes, done: true, message: `${count} primes: ${primes.slice(0, 10).join(", ")}${primes.length > 10 ? "..." : ""}`, relatedLines: [9] })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>Sieve: mark multiples of each prime as composite.</div>
      </div>
      {step.n && <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Range: 0 to {step.n - 1}</div></motion.div>}
      {step.i && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Processing Prime: {step.i}</div></motion.div>}
      {step.j && <motion.div style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12 }}>Marking {step.j} as composite</div></motion.div>}
      {step.marked && step.marked.length > 0 && <motion.div style={{ padding: 12, backgroundColor: "#fee2e2", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>Marked ({step.marked.length}): {step.marked.slice(0, 8).join(", ")}{step.marked.length > 8 ? "..." : ""}</div></motion.div>}
      {step.primes && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#065f46" }}>Primes ({step.primes.length}): {step.primes.slice(0, 12).join(", ")}{step.primes.length > 12 ? "..." : ""}</div></motion.div>}
      {step.result !== undefined && <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div style={{ fontSize: 16, fontWeight: 700, color: "#0c865d" }}>Result: {step.result}</div></motion.div>}
      {step.message && <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6, fontSize: 12, color: "#92400e" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{step.message}</motion.div>}
    </div>
  )
}

export default function CountPrimesVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","n":10});
  const [nInput, setNInput] = useState("10");
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 10, inputError: e.message };
    }
  }, [nInput]);  const steps = useMemo(() => generateSteps(n).map(s => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [n])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const panelConfigs = useMemo(() => [
    { id: 'code', title: "Code" },
    { id: 'viz', title: "🔢 Count Primes", dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
    viz: (<VisualizationPanel step={step} />),
  }), [step, connectivity, setActiveLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
          showExamples={false}
          inputError={inputError}
        />
      
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
