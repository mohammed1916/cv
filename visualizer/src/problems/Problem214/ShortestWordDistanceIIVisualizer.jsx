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
import "./ShortestWordDistanceIIVisualizer.css"
const SOLUTION_CODE = [
  { line: 1, text: "class WordDistance:" },
  { line: 2, text: "    def __init__(self, words):" },
  { line: 3, text: "        self.word_indices = {}" },
  { line: 4, text: "        for i, word in enumerate(words):" },
  { line: 5, text: "            if word not in self.word_indices:" },
  { line: 6, text: "                self.word_indices[word] = []" },
  { line: 7, text: "            self.word_indices[word].append(i)" },
  { line: 8, text: "    def shortest(self, word1, word2):" },
  { line: 9, text: "        idx1 = self.word_indices[word1]" },
  { line: 10, text: "        idx2 = self.word_indices[word2]" },
  { line: 11, text: "        i, j, min_dist = 0, 0, float(inf)" },
  { line: 12, text: "        while i < len(idx1) and j < len(idx2):" },
  { line: 13, text: "            min_dist = min(min_dist, abs(idx1[i] - idx2[j]))" },
  { line: 14, text: "            if idx1[i] < idx2[j]: i += 1" },
  { line: 15, text: "            else: j += 1" },
  { line: 16, text: "        return min_dist" },
]

function generateSteps(words, word1, word2) {
  const steps = []
  steps.push({
    activeLine: 2,
    words,
    message: `Initialize with ${words.length} words`,
    relatedLines: [2],
  })

  const wordIndices = {}
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    if (!wordIndices[word]) wordIndices[word] = []
    wordIndices[word].push(i)
  }

  steps.push({
    activeLine: 4,
    words,
    message: "Build index mapping word -> positions",
    relatedLines: [4, 5, 6, 7],
  })

  for (const w of [word1, word2]) {
    steps.push({
      activeLine: 7,
      word: w,
      indices: wordIndices[w],
      message: `Word "${w}" at positions: [${wordIndices[w].join(", ")}]`,
      relatedLines: [7],
    })
  }

  steps.push({
    activeLine: 8,
    word1,
    word2,
    message: `Find shortest distance between "${word1}" and "${word2}"`,
    relatedLines: [8],
  })

  const idx1 = wordIndices[word1]
  const idx2 = wordIndices[word2]

  steps.push({
    activeLine: 9,
    word1,
    indices1: idx1,
    message: `Indices of "${word1}": [${idx1.join(", ")}]`,
    relatedLines: [9, 10],
  })

  steps.push({
    activeLine: 11,
    indices1: idx1,
    indices2: idx2,
    message: "Initialize two pointers",
    relatedLines: [11],
  })

  let i = 0,
    j = 0
  let minDist = Infinity

  steps.push({
    activeLine: 12,
    message: "Two-pointer traversal",
    relatedLines: [12],
  })

  let step_num = 0
  while (i < idx1.length && j < idx2.length && step_num < 10) {
    step_num++
    const pos1 = idx1[i]
    const pos2 = idx2[j]
    const dist = Math.abs(pos1 - pos2)

    steps.push({
      activeLine: 13,
      i,
      j,
      pos1,
      pos2,
      dist,
      minDist,
      indices1: idx1,
      indices2: idx2,
      message: `Compare positions ${pos1} and ${pos2}, distance = ${dist}`,
      relatedLines: [13],
    })

    if (dist < minDist) {
      minDist = dist
      steps.push({
        activeLine: 13,
        minDist,
        message: `Update min distance: ${minDist}`,
        relatedLines: [13],
      })
    }

    if (pos1 < pos2) {
      i++
      steps.push({
        activeLine: 14,
        i,
        message: `pos1 < pos2, move pointer1`,
        relatedLines: [14],
      })
    } else {
      j++
      steps.push({
        activeLine: 15,
        j,
        message: `pos1 >= pos2, move pointer2`,
        relatedLines: [15],
      })
    }
  }

  steps.push({
    activeLine: 16,
    minDist,
    result: minDist,
    done: true,
    message: `Shortest distance: ${minDist}`,
    relatedLines: [16],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6, borderLeft: "4px solid #3b82f6" }}>
        <div style={{ fontSize: 12, color: "#0c4a6e", fontStyle: "italic" }}>
          Preprocessing: O(n) init. Query: O(m+n) two-pointer on stored indices.
        </div>
      </div>

      {step.words && (
        <motion.div style={{ padding: 12, backgroundColor: "#f0fdf4", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#065f46", marginBottom: 6 }}>
            Words Array ({step.words.length} items)
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {step.words.slice(0, 12).map((w, idx) => (
              <div
                key={idx}
                style={{
                  padding: "4px 8px",
                  borderRadius: 3,
                  backgroundColor: "#d1fae5",
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#065f46",
                  fontWeight: 600,
                }}
              >
                {idx}: {w}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.word && step.indices && (
        <motion.div style={{ padding: 12, backgroundColor: "#fed7aa", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            "{step.word}" at indices: {step.indices.join(", ")}
          </div>
        </motion.div>
      )}

      {step.indices1 && step.indices2 && (
        <motion.div style={{ padding: 12, backgroundColor: "#dbeafe", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0c4a6e", marginBottom: 6 }}>
            Index Lists
          </div>
          <div style={{ fontSize: 11, color: "#0c4a6e", fontFamily: "monospace" }}>
            word1: [{step.indices1.join(", ")}]
            <br />
            word2: [{step.indices2.join(", ")}]
          </div>
        </motion.div>
      )}

      {step.i !== undefined && step.j !== undefined && step.pos1 !== undefined && step.pos2 !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#fef3c7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#92400e" }}>
            Pointers: i={step.i} (pos={step.pos1}), j={step.j} (pos={step.pos2})
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#92400e", marginTop: 4 }}>
            Distance: |{step.pos1} - {step.pos2}| = {step.dist}
          </div>
        </motion.div>
      )}

      {step.minDist !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#e0e7ff", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: "#3730a3", fontWeight: 600 }}>
            Min Distance: {step.minDist === Infinity ? "∞" : step.minDist}
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "#dcfce7", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
            Result: {step.result}
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

export default function ShortestWordDistanceIIVisualizer() {
  const [words] = useState(["practice", "makes", "perfect", "coding", "makes"])
  const [word1] = useState("makes")
  const [word2] = useState("coding")
  const steps = useMemo(() => generateSteps(words, word1, word2).map((s) => ({ ...s, relatedLines: s.relatedLines ?? [s.activeLine] })), [words, word1, word2])
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
        title: "📏 Word Distance",
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

