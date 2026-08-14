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
import "./ContainsDuplicateIIVisualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def containsNearbyDuplicate(nums, k):" },
  { line: 2, text: "    window = set()" },
  { line: 3, text: "    for i in range(len(nums)):" },
  { line: 4, text: "        if nums[i] in window: return True" },
  { line: 5, text: "        window.add(nums[i])" },
  { line: 6, text: "        if len(window) > k:" },
  { line: 7, text: "            window.remove(nums[i - k])" },
  { line: 8, text: "    return False" },
]

function generateSteps(nums, k) {
  const steps = []
  steps.push({
    activeLine: 1,
    nums,
    k,
    message: `Find duplicates within distance ${k}`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Initialize sliding window set",
    relatedLines: [2],
  })

  const window = new Set()
  steps.push({
    activeLine: 3,
    message: "Iterate through array",
    relatedLines: [3],
  })

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    steps.push({
      activeLine: 3,
      i,
      num,
      nums,
      window: Array.from(window),
      windowStart: Math.max(0, i - k),
      windowEnd: i,
      message: `Index ${i}: num = ${num}`,
      relatedLines: [3],
    })

    if (window.has(num)) {
      steps.push({
        activeLine: 4,
        i,
        num,
        nums,
        window: Array.from(window),
        result: true,
        done: true,
        message: `Found duplicate ${num} within distance ${k}!`,
        relatedLines: [4],
      })
      return steps
    }

    steps.push({
      activeLine: 5,
      i,
      num,
      window: Array.from([...window, num]),
      message: `Add ${num} to window`,
      relatedLines: [5],
    })
    window.add(num)

    steps.push({
      activeLine: 6,
      i,
      windowSize: window.size,
      k,
      message: `Window size: ${window.size}, max allowed: ${k}`,
      relatedLines: [6],
    })

    if (window.size > k) {
      const removed = nums[i - k]
      steps.push({
        activeLine: 7,
        i,
        removed,
        message: `Remove nums[${i - k}] = ${removed}`,
        relatedLines: [7],
      })
      window.delete(removed)
      steps.push({
        activeLine: 7,
        i,
        window: Array.from(window),
        message: `Window after removal: {${Array.from(window).join(", ")}}`,
        relatedLines: [7],
      })
    }
  }

  steps.push({
    activeLine: 8,
    result: false,
    done: true,
    message: "No duplicates found within distance k",
    relatedLines: [8],
  })

  return steps
}

const EXAMPLES = [
  { label: "Duplicate found", nums: [1, 2, 3, 1], k: 3 },
  { label: "No duplicate", nums: [1, 2, 3, 1, 2, 3], k: 2 },
  { label: "Adjacent duplicate", nums: [99, 99, 2, 4, 5, 3, 9], k: 3 },
  { label: "Duplicate too far apart", nums: [1, 0, 1, 1], k: 1 },
]

function ArrayDisplay({ nums, windowStart, windowEnd, highlighted }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
      {nums.map((num, idx) => {
        const inWindow = idx >= windowStart && idx <= windowEnd
        const isHighlighted = idx === highlighted
        return (
          <motion.div
            key={idx}
            style={{
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: isHighlighted
                ? "#fbbf24"
                : inWindow
                  ? "#93c5fd"
                  : "#e2e8f0",
              border: inWindow ? "2px solid #3b82f6" : "1px solid #94a3b8",
              fontFamily: "monospace",
              fontWeight: 600,
              color: isHighlighted ? "#000" : "#334155",
              fontSize: 12,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {num}
          </motion.div>
        )
      })}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Sliding window: maintain set of last k elements. O(n) time, O(min(n,k)) space.
        </div>
      </div>

      {step.nums && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Array
          </div>
          <ArrayDisplay nums={step.nums} windowStart={step.windowStart ?? 0} windowEnd={step.windowEnd ?? -1} highlighted={step.i} />
        </motion.div>
      )}

      {step.k !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e" }}>
            Max distance allowed: {step.k}
          </div>
        </motion.div>
      )}

      {step.num !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fecdd3", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#7f1d1d", fontWeight: 600 }}>
            Current element: {step.num}
          </div>
        </motion.div>
      )}

      {step.window && step.window.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 6 }}>
            Window Set ({step.window.length}/{step.k})
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {step.window.map((val, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: "#dbeafe",
                  border: "2px solid #0c4a6e",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "#0c4a6e",
                  fontSize: 11,
                }}
              >
                {val}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.windowSize !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#3730a3" }}>
            Window size: {step.windowSize} {step.windowSize > step.k && " (exceeds k, remove oldest)"}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? "#fee2e2" : "#dcfce7",
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: step.result ? "#ef4444" : "#10b981",
            }}
          >
            {step.result ? "Contains Duplicate ✗" : "No Duplicate ✓"}
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

export default function ContainsDuplicateIIVisualizer() {
  const [numsInput, setNumsInput] = useState("[99,99,2,4,5,3,9]")
  const [kInput, setKInput] = useState("3")

  const { nums, k, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput)
      if (!Array.isArray(parsedNums) || parsedNums.some((n) => typeof n !== "number" || Number.isNaN(n))) {
        throw new Error("nums must be an array of numbers")
      }
      const parsedK = Number(kInput)
      if (!Number.isInteger(parsedK) || parsedK < 0) {
        throw new Error("k must be a non-negative integer")
      }
      return { nums: parsedNums, k: parsedK, inputError: "" }
    } catch (e) {
      return { nums: [99, 99, 2, 4, 5, 3, 9], k: 3, inputError: e.message }
    }
  }, [numsInput, kInput])

  const steps = useMemo(() => generateSteps(nums, k).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [nums, k])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    setKInput(String(ex.k))
    handleReset()
  }, [handleReset])

  const codePanel = (
    <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
  )

  const vizPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"},{"key":"k","label":"k","type":"number"}]}
        values={{ nums: numsInput, k: kInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'k') setKInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 16, borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              style={{
                padding: "6px 12px", borderRadius: 6, border: "1px solid #cbd5e1",
                background: "#f1f5f9", color: "#1e293b", fontSize: 12, cursor: "pointer",
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#475569" }}>
            nums:
            <input
              value={numsInput}
              onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
              style={{ minWidth: 220, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontFamily: "monospace", fontSize: 12 }}
            />
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#475569" }}>
            k:
            <input
              value={kInput}
              onChange={(e) => { setKInput(e.target.value); handleReset() }}
              style={{ width: 60, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontFamily: "monospace", fontSize: 12 }}
            />
          </label>
          {inputError && <span style={{ color: "#ef4444", fontSize: 12 }}>{inputError}</span>}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <VisualizationPanel step={step} />
      </div>
    </div>
  
    </>)

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: "code", title: "Code" },
      { id: "viz", title: "🪟 Sliding Window", dockMode: "split-right" },
    ],
    []
  )
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
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

