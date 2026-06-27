import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import DockableWorkspace from "../../components/shared/DockableWorkspace"
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import { useAutoScroll } from "../../hooks/useAutoScroll"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { getExamples } from "../../config/examplesRegistry"
import "./Visualizer.css"

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def deleteDuplicates(self, head: ListNode) -> ListNode:" },
  { line: 3, text: "        # Count occurrences of each value" },
  { line: 4, text: "        count = {}" },
  { line: 5, text: "        curr = head" },
  { line: 6, text: "        while curr:" },
  { line: 7, text: "            count[curr.val] = count.get(curr.val, 0) + 1" },
  { line: 8, text: "            curr = curr.next" },
  { line: 9, text: "        # Create result list with only non-duplicate values" },
  { line: 10, text: "        dummy = ListNode(0)" },
  { line: 11, text: "        prev = dummy" },
  { line: 12, text: "        curr = head" },
  { line: 13, text: "        while curr:" },
  { line: 14, text: "            if count[curr.val] == 1:" },
  { line: 15, text: "                prev.next = curr" },
  { line: 16, text: "                prev = prev.next" },
  { line: 17, text: "            curr = curr.next" },
  { line: 18, text: "        prev.next = None" },
  { line: 19, text: "        return dummy.next" },
]

function generateSteps(list) {
  const steps = []

  if (!list || list.length === 0) {
    steps.push({
      phase: "done",
      activeLine: 19,
      nodes: [],
      resultList: [],
      count: {},
      currentIdx: -1,
      countedIdx: -1,
      message: "Empty list. Return head.",
    })
    return steps
  }

  // Phase 1: Count occurrences
  steps.push({
    phase: "init_count",
    activeLine: 4,
    nodes: [...list],
    resultList: [...list],
    count: {},
    currentIdx: -1,
    countedIdx: -1,
    message: "Initialize count dictionary.",
  })

  steps.push({
    phase: "init_count",
    activeLine: 5,
    nodes: [...list],
    resultList: [...list],
    count: {},
    currentIdx: 0,
    countedIdx: -1,
    message: "Set current to head.",
  })

  const count = {}
  for (let i = 0; i < list.length; i++) {
    const val = list[i]
    count[val] = (count[val] || 0) + 1

    steps.push({
      phase: "counting",
      activeLine: 7,
      nodes: [...list],
      resultList: [...list],
      count: { ...count },
      currentIdx: i,
      countedIdx: i,
      message: `Count node(${val}): count[${val}] = ${count[val]}`,
    })

    if (i < list.length - 1) {
      steps.push({
        phase: "counting",
        activeLine: 8,
        nodes: [...list],
        resultList: [...list],
        count: { ...count },
        currentIdx: i + 1,
        countedIdx: -1,
        message: `Move to next node.`,
      })
    }
  }

  // Phase 2: Build result list
  steps.push({
    phase: "init_result",
    activeLine: 10,
    nodes: [...list],
    resultList: [...list],
    count: { ...count },
    currentIdx: -1,
    countedIdx: -1,
    message: "Create dummy node for result list.",
  })

  steps.push({
    phase: "init_result",
    activeLine: 11,
    nodes: [...list],
    resultList: [...list],
    count: { ...count },
    currentIdx: -1,
    countedIdx: -1,
    message: "Initialize prev to dummy node.",
  })

  steps.push({
    phase: "init_result",
    activeLine: 12,
    nodes: [...list],
    resultList: [...list],
    count: { ...count },
    currentIdx: 0,
    countedIdx: -1,
    message: "Set current to head.",
  })

  const result = []
  for (let i = 0; i < list.length; i++) {
    const val = list[i]

    steps.push({
      phase: "building",
      activeLine: 14,
      nodes: [...list],
      resultList: [...result],
      count: { ...count },
      currentIdx: i,
      countedIdx: -1,
      message: `Check: count[${val}] == 1? ${count[val] === 1 ? "Yes" : "No"}`,
    })

    if (count[val] === 1) {
      result.push(val)
      steps.push({
        phase: "building",
        activeLine: 15,
        nodes: [...list],
        resultList: [...result],
        count: { ...count },
        currentIdx: i,
        countedIdx: -1,
        message: `Add unique node(${val}) to result.`,
      })
    } else {
      steps.push({
        phase: "building",
        activeLine: 14,
        nodes: [...list],
        resultList: [...result],
        count: { ...count },
        currentIdx: i,
        countedIdx: -1,
        message: `Skip duplicate node(${val}) (appears ${count[val]} times).`,
      })
    }

    if (i < list.length - 1) {
      steps.push({
        phase: "building",
        activeLine: 17,
        nodes: [...list],
        resultList: [...result],
        count: { ...count },
        currentIdx: i + 1,
        countedIdx: -1,
        message: `Move to next node.`,
      })
    }
  }

  // Final state
  steps.push({
    phase: "done",
    activeLine: 19,
    nodes: [...list],
    resultList: [...result],
    count: { ...count },
    currentIdx: -1,
    countedIdx: -1,
    message: `Done! Result: [${result.length > 0 ? result.join(", ") : "empty"}]`,
  })

  return steps
}

function RemoveDuplicatesFromListViz({
  step,
  list,
  inputStr,
  setInputStr,
  handleReset,
  inputError,
}) {
  const handleExampleClick = useCallback((exList) => {
    setInputStr(JSON.stringify(exList))
    handleReset()
  }, [setInputStr, handleReset])

  const examples = [
    { label: "1→2→3→3→4→4→5", list: [1, 2, 3, 3, 4, 4, 5] },
    { label: "1→1→1→2→3", list: [1, 1, 1, 2, 3] },
    { label: "1→2→2→2", list: [1, 2, 2, 2] },
    { label: "1→2→3", list: [1, 2, 3] },
  ]

  return (
    <section className="rdl-panel main">
      <header className="rdl-head">
        <span>Remove Duplicates from Linked List (LC #82)</span>
        {inputError && <span className="rdl-error">{inputError}</span>}
      </header>
      <div className="rdl-body">
        <div className="rdl-examples">
          {examples.map((ex) => (
            <button key={ex.label} className="rdl-chip" onClick={() => handleExampleClick(ex.list)}>
              {ex.label}
            </button>
          ))}
        </div>
        <div className="rdl-input-row">
          <input
            className="rdl-input"
            value={inputStr}
            onChange={(e) => {
              setInputStr(e.target.value)
              handleReset()
            }}
            placeholder="[1,2,3,3,4,4,5]"
          />
        </div>

        <div className="rdl-list-section">
          <div className="rdl-section-label">Original List</div>
          <div className="rdl-canvas">
            <svg className="rdl-arrows-svg" aria-hidden="true">
              {list.map((_, idx) => {
                if (idx < list.length - 1) {
                  const fromX = idx * 90 + 32
                  const toX = (idx + 1) * 90 + 32
                  return (
                    <line
                      key={`arrow-${idx}`}
                      x1={fromX + 20}
                      y1={32}
                      x2={toX - 22}
                      y2={32}
                      className="rdl-arrow-line"
                    />
                  )
                }
                return null
              })}
            </svg>

            <div className="rdl-nodes">
              {list.map((val, idx) => {
                const isCurrent = step?.currentIdx === idx
                const isCounted = step?.countedIdx === idx

                return (
                  <div key={idx} className="rdl-node-wrap">
                    <motion.div
                      className={`rdl-node${isCurrent ? " current" : ""}${isCounted ? " counted" : ""}`}
                      animate={{
                        y: isCurrent ? -10 : 0,
                        scale: isCurrent ? 1.15 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    >
                      {val}
                    </motion.div>
                    <div className="rdl-ptrs">
                      {isCurrent && <span className="rdl-ptr current">curr</span>}
                      {isCounted && <span className="rdl-ptr counted">counted</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {step?.phase === "done" && (
          <div className="rdl-list-section">
            <div className="rdl-section-label">Result (Unique Values Only)</div>
            <div className="rdl-canvas">
              <svg className="rdl-arrows-svg" aria-hidden="true">
                {step?.resultList.map((_, idx) => {
                  if (idx < step.resultList.length - 1) {
                    const fromX = idx * 90 + 32
                    const toX = (idx + 1) * 90 + 32
                    return (
                      <line
                        key={`result-arrow-${idx}`}
                        x1={fromX + 20}
                        y1={32}
                        x2={toX - 22}
                        y2={32}
                        className="rdl-arrow-line result"
                      />
                    )
                  }
                  return null
                })}
              </svg>

              <div className="rdl-nodes">
                <AnimatePresence>
                  {step?.resultList.map((val, idx) => (
                    <motion.div
                      key={`result-${idx}`}
                      className="rdl-node-wrap"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <div className="rdl-node result">{val}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        <div className="rdl-legend">
          <span className="rdl-legend-item current">current</span>
          <span className="rdl-legend-item counted">counted</span>
        </div>
      </div>
    </section>
  )
}

function RemoveDuplicatesFromListState({ step, list }) {
  return (
    <section className="rdl-panel side">
      <header className="rdl-head"><span>Algorithm State</span></header>
      <div className="rdl-body">
        <div className="rdl-state-row">
          <span className="rdl-state-label">Phase</span>
          <span className="rdl-state-val mono">
            {step?.phase === "init_count" && "Init Count"}
            {step?.phase === "counting" && "Counting"}
            {step?.phase === "init_result" && "Init Result"}
            {step?.phase === "building" && "Building"}
            {step?.phase === "done" && "Done"}
          </span>
        </div>

        {step?.count && (
          <div className="rdl-state-section">
            <div className="rdl-state-label">Counts</div>
            <div className="rdl-count-map">
              {Object.entries(step.count)
                .sort((a, b) => a[0] - b[0])
                .map(([val, cnt]) => (
                  <div key={val} className="rdl-count-item">
                    <span className="rdl-count-val">{val}</span>
                    <span className="rdl-count-num">{cnt}x</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="rdl-state-row">
          <span className="rdl-state-label">Current</span>
          <span className="rdl-state-val mono">
            {step?.currentIdx >= 0 ? `idx ${step.currentIdx}` : "done"}
          </span>
        </div>

        {step?.phase === "done" && (
          <motion.div className="rdl-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            ✓ Complete!
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function RemoveDuplicatesFromListVisualizer() {
  const [inputStr, setInputStr] = useState("[1,2,3,3,4,4,5]")

  const { list, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(inputStr)
      if (!Array.isArray(parsed)) throw new Error("Array required")
      if (!parsed.every(x => Number.isInteger(x))) throw new Error("All integers required")
      if (parsed.length > 10) throw new Error("Max 10 elements")
      return { list: parsed, inputError: "" }
    } catch (e) {
      return { list: [1, 2, 3, 3, 4, 4, 5], inputError: e.message || "Invalid" }
    }
  }, [inputStr])

  const steps = useMemo(() => generateSteps(list), [list])

  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone, setStepIndex } =
    usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const dockPanels = useMemo(
    () => [
      {
        id: "code",
        title: "Code",
        content: (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />
        ),
      },
      {
        id: "viz",
        title: "Visualization",
        content: (
          <div className="rdl-top">
            <RemoveDuplicatesFromListViz
              step={step}
              list={list}
              inputStr={inputStr}
              setInputStr={setInputStr}
              handleReset={handleReset}
              inputError={inputError}
            />
            <RemoveDuplicatesFromListState step={step} list={list} />
          </div>
        ),
      },
    ],
    [step, list, inputStr, inputError, autoScrollCode, handleReset, connectivity, SOLUTION_CODE_WITH_CONNECTIVITY, setActiveLineDom],
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [["code", "viz"]], minimized: [] }} />

      <FloatingPanel title="Playback Controls">
        <div className="rdl-status" style={{ marginBottom: "12px" }}>
          {step?.message ?? "Press Play or Step to begin."}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
