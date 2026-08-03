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
import "./SkylineProblemVisualizer.css"
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: "def getSkyline(buildings):" },
  { line: 2, text: "    events = []" },
  { line: 3, text: "    for l, r, h in buildings:" },
  { line: 4, text: "        events.append((l, 0, h))" },
  { line: 5, text: "        events.append((r, 1, h))" },
  { line: 6, text: "    events.sort()" },
  { line: 7, text: "    result = []" },
  { line: 8, text: "    active = {h: 0 for _, _, h in buildings}" },
  { line: 9, text: "    for x, typ, h in events:" },
  { line: 10, text: "        if typ == 0: active[h] += 1" },
  { line: 11, text: "        else: active[h] -= 1" },
  { line: 12, text: "        max_h = max(active)" },
  { line: 13, text: "        if not result or result[-1][1] != max_h:" },
  { line: 14, text: "            result.append((x, max_h))" },
  { line: 15, text: "    return result" },
]

function generateSteps(buildings) {
  const steps = []
  steps.push({
    activeLine: 1,
    buildings,
    message: "Extract key points from overlapping buildings",
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: "Create start (type=0) and end (type=1) events",
    relatedLines: [2, 3, 4, 5],
  })

  const events = []
  for (const [l, r, h] of buildings) {
    events.push([l, 0, h])
    events.push([r, 1, h])
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  steps.push({
    activeLine: 6,
    events: events.slice(0, 8),
    message: "Sort events by x-coordinate",
    relatedLines: [6],
  })

  steps.push({
    activeLine: 8,
    message: "Initialize active heights map",
    relatedLines: [8],
  })

  const result = []
  const active = {}
  for (const [, , h] of buildings) {
    active[h] = 0
  }

  steps.push({
    activeLine: 9,
    message: "Process events left to right",
    relatedLines: [9],
  })

  let prevMaxH = 0
  for (let i = 0; i < events.length && i < 10; i++) {
    const [x, typ, h] = events[i]

    steps.push({
      activeLine: 9,
      x,
      typ,
      h,
      eventType: typ === 0 ? "START" : "END",
      message: `Event at x=${x}: ${typ === 0 ? "start" : "end"} of height ${h}`,
      relatedLines: [9],
    })

    if (typ === 0) {
      active[h]++
      steps.push({
        activeLine: 10,
        h,
        count: active[h],
        message: `Building starts: active[${h}]++`,
        relatedLines: [10],
      })
    } else {
      active[h]--
      steps.push({
        activeLine: 11,
        h,
        count: active[h],
        message: `Building ends: active[${h}]--`,
        relatedLines: [11],
      })
    }

    const maxH = Math.max(...Object.keys(active).map(Number).filter((k) => active[k] > 0), 0)
    steps.push({
      activeLine: 12,
      active: { ...active },
      maxH,
      message: `Max height: ${maxH}`,
      relatedLines: [12],
    })

    if (!result.length || result[result.length - 1][1] !== maxH) {
      result.push([x, maxH])
      steps.push({
        activeLine: 14,
        x,
        maxH,
        message: `Key point: (${x}, ${maxH})`,
        relatedLines: [14],
      })
    }

    prevMaxH = maxH
  }

  steps.push({
    activeLine: 15,
    result,
    done: true,
    message: `Skyline points: ${result.map((p) => `(${p[0]},${p[1]})`).join(" ")}`,
    relatedLines: [15],
  })

  return steps
}

function SkylineVisualization({ buildings, keyPoints }) {
  const maxHeight = Math.max(...buildings.map((b) => b[2]), 10)
  const width = 400
  const height = 200

  return (
    <svg width={width} height={height} style={{ border: "1px solid #64748b", borderRadius: 4 }}>
      {/* Buildings */}
      {buildings.map((b, idx) => (
        <g key={`building-${idx}`}>
          <rect x={b[0] * 20} y={height - b[2] * 15} width={(b[1] - b[0]) * 20} height={b[2] * 15} fill="#cbd5e1" opacity="0.6" stroke="#64748b" strokeWidth="1" />
        </g>
      ))}
      {/* Skyline */}
      {keyPoints.length > 0 && (
        <polyline
          points={keyPoints.map((p) => `${p[0] * 20},${height - p[1] * 15}`).join(" ")}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />
      )}
      {/* Key points */}
      {keyPoints.map((p, idx) => (
        <circle key={`point-${idx}`} cx={p[0] * 20} cy={height - p[1] * 15} r="3" fill="#ef4444" />
      ))}
    </svg>
  )
}

function VisualizationPanel({ step, buildings, keyPoints }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Sweep line: process events, track max height, output height changes.
        </div>
      </div>

      {buildings && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 8 }}>
            Skyline Visualization
          </div>
          <SkylineVisualization buildings={buildings} keyPoints={keyPoints} />
        </motion.div>
      )}

      {step.eventType && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            {step.eventType} at x={step.x}: h={step.h}
          </div>
        </motion.div>
      )}

      {step.active && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3730a3", marginBottom: 4 }}>
            Active heights
          </div>
          <div style={{ fontSize: 11, color: "#3730a3", fontFamily: "monospace" }}>
            {Object.entries(step.active)
              .filter(([, count]) => count > 0)
              .map(([h, count]) => `h${h}:${count}`)
              .join(", ")}
          </div>
        </motion.div>
      )}

      {step.maxH !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            Max Height: {step.maxH}
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 4 }}>
            Key Points ({step.result.length})
          </div>
          <div style={{ fontSize: 11, color: "#065f46", fontFamily: "monospace" }}>
            {step.result.map((p) => `(${p[0]},${p[1]})`).join(" ")}
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

export default function SkylineProblemVisualizer() {
  const [buildings] = useState([
    [0, 2, 3],
    [2, 5, 3],
    [1, 3, 5],
  ])
  const keyPoints = useMemo(() => {
    const events = []
    for (const [l, r, h] of buildings) {
      events.push([l, 0, h])
      events.push([r, 1, h])
    }
    events.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    const result = []
    const active = {}
    for (const [, , h] of buildings) {
      active[h] = 0
    }
    for (const [x, typ, h] of events) {
      if (typ === 0) active[h]++
      else active[h]--
      const maxH = Math.max(...Object.keys(active).map(Number).filter((k) => active[k] > 0), 0)
      if (!result.length || result[result.length - 1][1] !== maxH) result.push([x, maxH])
    }
    return result
  }, [buildings])

  const steps = useMemo(() => generateSteps(buildings).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [buildings])
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
        title: "🏢 Skyline Events",
        content: <VisualizationPanel step={step} buildings={buildings} keyPoints={keyPoints} />,
      },
    ],
    [step, connectivity, setActiveLineDom, buildings, keyPoints]
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

