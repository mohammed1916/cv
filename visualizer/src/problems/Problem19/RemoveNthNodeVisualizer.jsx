import { useState, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import LuminoDockPanel from "../../components/LuminoDockPanel"
import FloatingPanel from "../../components/shared/FloatingPanel"
import CodeTracePanel from "../../components/CodeTracePanel"
import PlaybackControls from "../../components/PlaybackControls"
import PatternOverlay from "../../components/PatternOverlay"
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import { usePlaybackState } from "../../hooks/usePlaybackState"
import { usePatternOverlay } from "../../hooks/usePatternOverlay"
import { useAutoScroll } from "../../hooks/useAutoScroll"
import { getExamples } from "../../config/examplesRegistry"
import "./RemoveNthNodeVisualizer.css"
const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def removeNthFromEnd(self, head, n):" },
  { line: 3, text: "        dummy = ListNode(0, head)" },
  { line: 4, text: "        fast, slow = dummy, dummy" },
  { line: 5, text: "        for _ in range(n + 1):" },
  { line: 6, text: "            fast = fast.next" },
  { line: 7, text: "        while fast:" },
  { line: 8, text: "            fast, slow = fast.next, slow.next" },
  { line: 9, text: "            slow.next = slow.next.next" },
  { line: 10, text: "        return dummy.next" },
]

const REMOVENTHNODE_PATTERNS = ['init', 'pointers_init', 'fast_advance', 'fast_step', 'gap_ready', 'both_advance', 'found_target', 'removing', 'done']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',         // dummy = ListNode(0, head)
  4: 'pointers_init', // fast, slow = dummy, dummy
  5: 'fast_advance', // for _ in range(n + 1):
  6: 'fast_advance', // fast = fast.next
  7: 'gap_ready',    // while fast:
  8: 'both_advance', // fast, slow = fast.next, slow.next
  9: 'removing',     // slow.next = slow.next.next
  10: 'done',        // return dummy.next
}

function generateSteps(list, n) {
  const steps = []

  if (!list || list.length === 0) {
    steps.push({
      phase: "done",
      activeLine: 10,
      nodes: [],
      listCopy: [],
      dummy: -1,
      fast: -1,
      slow: -1,
      targetIdx: -1,
      removed: false,
      message: "Empty list. Return None.",
    })
    return steps
  }

  const targetIdx = list.length - n

  if (targetIdx < 0 || targetIdx >= list.length) {
    steps.push({
      phase: "done",
      activeLine: 10,
      nodes: [...list],
      listCopy: [...list],
      dummy: -1,
      fast: -1,
      slow: -1,
      targetIdx,
      removed: false,
      message: "Invalid n. Return original list.",
    })
    return steps
  }

  steps.push({
    phase: "init",
    activeLine: 3,
    nodes: [...list],
    listCopy: [...list],
    dummy: -1,
    fast: -1,
    slow: -1,
    targetIdx,
    removed: false,
    message: `Initialize dummy. Target: index ${targetIdx} (${list[targetIdx]})`,
  })

  steps.push({
    phase: "pointers_init",
    activeLine: 4,
    nodes: [...list],
    listCopy: [...list],
    dummy: -1,
    fast: -1,
    slow: -1,
    targetIdx,
    removed: false,
    message: "Initialize fast and slow at dummy.",
  })

  steps.push({
    phase: "fast_advance",
    activeLine: 5,
    nodes: [...list],
    listCopy: [...list],
    dummy: -1,
    fast: -1,
    slow: -1,
    targetIdx,
    removed: false,
    message: `Advance fast ${n + 1} steps ahead.`,
  })

  for (let i = 0; i < n + 1; i++) {
    const newFast = i < list.length ? i : list.length
    steps.push({
      phase: "fast_step",
      activeLine: 6,
      nodes: [...list],
      listCopy: [...list],
      dummy: -1,
      fast: newFast,
      slow: -1,
      targetIdx,
      removed: false,
      message: `Fast at index ${newFast}${newFast >= list.length ? " (beyond)" : ` (${list[newFast]})`}`,
    })
  }

  const fastIdx = n + 1 >= list.length ? list.length : n + 1

  steps.push({
    phase: "gap_ready",
    activeLine: 7,
    nodes: [...list],
    listCopy: [...list],
    dummy: -1,
    fast: fastIdx,
    slow: -1,
    targetIdx,
    removed: false,
    message: "Gap created. Move both pointers.",
  })

  let fastPos = fastIdx
  let slowPos = -1

  while (fastPos < list.length) {
    steps.push({
      phase: "both_advance",
      activeLine: 8,
      nodes: [...list],
      listCopy: [...list],
      dummy: -1,
      fast: fastPos,
      slow: slowPos,
      targetIdx,
      removed: false,
      message: `fast=${fastPos}, slow=${slowPos}`,
    })

    fastPos++
    slowPos++
  }

  steps.push({
    phase: "found_target",
    activeLine: 8,
    nodes: [...list],
    listCopy: [...list],
    dummy: -1,
    fast: fastPos,
    slow: slowPos,
    targetIdx,
    removed: false,
    message: `Found. Slow at ${slowPos}.`,
  })

  const resultList = list.filter((_, i) => i !== targetIdx)

  steps.push({
    phase: "removing",
    activeLine: 9,
    nodes: [...list],
    listCopy: resultList,
    dummy: -1,
    fast: fastPos,
    slow: slowPos,
    targetIdx,
    removed: true,
    message: `Remove node ${targetIdx}.`,
  })

  steps.push({
    phase: "done",
    activeLine: 10,
    nodes: resultList,
    listCopy: resultList,
    dummy: -1,
    fast: -1,
    slow: -1,
    targetIdx: -1,
    removed: true,
    message: "Return dummy.next.",
  })

  return steps
}

const EXAMPLES = getExamples("remove-nth-node")

function RemoveNthNodeViz({
  step,
  list,
  resultList,
  EXAMPLES,
  inputStr,
  setInputStr,
  handleReset,
  inputError,
}) {
  const handleExampleClick = useCallback((ex) => {
    setInputStr(ex.input)
    handleReset()
  }, [setInputStr, handleReset])

  return (
    <section className="rnn-panel main">
      <header className="rnn-head">
        <span>Remove Nth Node from End</span>
        {inputError && <span className="rnn-error">{inputError}</span>}
      </header>
      <div className="rnn-body">
        <div className="rnn-examples">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} className="rnn-chip" onClick={() => handleExampleClick(ex)}>
              {ex.label}
            </button>
          ))}
        </div>
        <div className="rnn-input-row">
          <input
            className="rnn-input"
            value={inputStr}
            onChange={(e) => {
              setInputStr(e.target.value)
              handleReset()
            }}
            placeholder="[1,2,3,4,5]; 2"
          />
        </div>

        <div className="rnn-list-section">
          <div className="rnn-section-label">Original List</div>
          <div className="rnn-canvas">
            <svg className="rnn-arrows-svg" aria-hidden="true">
              {list.map((_, idx) => {
                if (idx < list.length - 1) {
                  const fromX = idx * 90 + 32
                  const toX = (idx + 1) * 90 + 32
                  const isTarget = idx === step?.targetIdx
                  return (
                    <line
                      key={`arrow-${idx}`}
                      x1={fromX + 20}
                      y1={32}
                      x2={toX - 22}
                      y2={32}
                      className={`rnn-arrow-line${isTarget ? " target" : ""}`}
                      strokeDasharray={isTarget ? "5,5" : undefined}
                    />
                  )
                }
                return null
              })}
            </svg>

            <div className="rnn-nodes">
              {list.map((val, idx) => {
                const isFast = step?.fast === idx
                const isSlow = step?.slow === idx
                const isTarget = idx === step?.targetIdx && step?.phase !== "done"
                const isRemoved = step?.removed && idx === step?.targetIdx
                return (
                  <div key={idx} className="rnn-node-wrap">
                    <motion.div
                      className={`rnn-node${isFast ? " fast" : ""}${isSlow ? " slow" : ""}${
                        isTarget ? " target" : ""
                      }${isRemoved ? " removed-visual" : ""}`}
                      animate={{
                        y: isFast ? -10 : isSlow ? -8 : 0,
                        scale: isFast ? 1.15 : isSlow ? 1.1 : isTarget ? 1.08 : 1,
                        opacity: isRemoved ? 0.3 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 26 }}
                    >
                      {val}
                    </motion.div>
                    <div className="rnn-ptrs">
                      {isFast && <span className="rnn-ptr rnn-ptr-fast">fast</span>}
                      {isSlow && <span className="rnn-ptr rnn-ptr-slow">slow</span>}
                      {isTarget && !isRemoved && <span className="rnn-ptr rnn-ptr-target">x</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {step?.removed && (
          <div className="rnn-list-section">
            <div className="rnn-section-label">Result</div>
            <div className="rnn-canvas">
              <div className="rnn-nodes">
                <AnimatePresence>
                  {resultList.map((val, idx) => (
                    <motion.div
                      key={`result-${idx}`}
                      className="rnn-node-wrap"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <div className="rnn-node result">{val}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        <div className="rnn-legend">
          <span className="rnn-legend-item fast">fast</span>
          <span className="rnn-legend-item slow">slow</span>
          <span className="rnn-legend-item target">target</span>
        </div>
      </div>
    </section>
  )
}

function RemoveNthNodeState({ step }) {
  return (
    <section className="rnn-panel side">
      <header className="rnn-head"><span>State</span></header>
      <div className="rnn-body">
        <div className="rnn-state-row">
          <span className="rnn-state-label fast">fast</span>
          <span className="rnn-state-val mono">
            {step?.fast != null && step.fast >= 0 ? `idx ${step.fast}` : "init"}
          </span>
        </div>
        <div className="rnn-state-row">
          <span className="rnn-state-label slow">slow</span>
          <span className="rnn-state-val mono">
            {step?.slow >= 0 ? `idx ${step.slow}` : "dummy"}
          </span>
        </div>
        <div className="rnn-state-row">
          <span className="rnn-state-label target">target</span>
          <span className="rnn-state-val mono">
            {step?.targetIdx >= 0 ? `idx ${step.targetIdx}` : "N/A"}
          </span>
        </div>

        {step?.phase === "done" && (
          <motion.div className="rnn-result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            Done!
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function RemoveNthNodeVisualizer() {
  const [inputStr, setInputStr] = useState("[1,2,3,4,5]; 2")

  const { list, n, inputError } = useMemo(() => {
    try {
      const parts = inputStr.split(";").map((s) => s.trim())
      if (parts.length !== 2) throw new Error("Format: [array]; n")
      const parsed = JSON.parse(parts[0])
      const nVal = parseInt(parts[1], 10)
      if (!Array.isArray(parsed)) throw new Error("Array required")
      if (!Number.isInteger(nVal) || nVal < 1) throw new Error("n >= 1")
      if (nVal > parsed.length) throw new Error("n <= length")
      return { list: parsed, n: nVal, inputError: "" }
    } catch (e) {
      return { list: [1, 2, 3, 4, 5], n: 2, inputError: e.message || "Invalid" }
    }
  }, [inputStr])

  const steps = useMemo(() => generateSteps(list, n), [list, n])

  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const resultList = step?.listCopy ?? list

  // Extract panels into consts
  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
        disableResizer
      />
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  )

  const primaryPanel = (
    <div className="rnn-panel main">
      <RemoveNthNodeViz
        step={step}
        list={list}
        resultList={resultList}
        EXAMPLES={EXAMPLES}
        inputStr={inputStr}
        setInputStr={setInputStr}
        handleReset={handleReset}
        inputError={inputError}
      />
    </div>
  )

  const statePanel = (
    <div className="rnn-panel side">
      <RemoveNthNodeState step={step} />
    </div>
  )

  const statusPanel = (
    <div className="rnn-status">
      {step?.message ?? "Play or Step to begin."}
    </div>
  )

  const playbackPanel = (
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={REMOVENTHNODE_PATTERNS} />
      )}
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
        patternOverlayLabel="Pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  // Panel state and config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="rnn-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

