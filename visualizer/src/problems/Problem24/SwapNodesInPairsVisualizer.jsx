import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LinkedListGraph from "../../components/shared/LinkedListGraph";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from "../../config/examplesRegistry";
import "./SwapNodesInPairsVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def swapPairs(self, head: ListNode) -> ListNode:" },
  { line: 3, text: "        dummy = ListNode(0, head)" },
  { line: 4, text: "        prev = dummy" },
  { line: 5, text: "        while prev.next and prev.next.next:" },
  { line: 6, text: "            first = prev.next" },
  { line: 7, text: "            second = prev.next.next" },
  { line: 8, text: "            prev.next = second" },
  { line: 9, text: "            first.next = second.next" },
  { line: 10, text: "            second.next = first" },
  { line: 11, text: "            prev = first" },
  { line: 12, text: "        return dummy.next" },
];

const SWAPNODESINPAIRS_PATTERNS = [
  "advance",
  "check_end",
  "check_pair",
  "done",
  "identify",
  "init",
  "swap_done",
  "swap_start",
];

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: "init",
  4: "init",
  5: "check_pair",
  6: "identify",
  7: "identify",
  8: "swap_start",
  9: "swap_start",
  10: "swap_done",
  11: "advance",
  12: "done",
};

const EXAMPLES = [
  ...getExamples("swap-nodes-in-pairs"),
  { label: "Example: [1,2,3,4]", values: [1, 2, 3, 4] },
  { label: "Example: [1,2,3,4,5]", values: [1, 2, 3, 4, 5] },
  { label: "Single node [1]", values: [1] },
  { label: "Empty list []", values: [] },
];

function generateSteps(values) {
  const steps = [];

  if (!values || values.length === 0) {
    steps.push({
      phase: "init",
      activeLine: 3,
      nodes: [{ id: "dummy", val: "0", label: "dummy" }],
      pointers: [{ label: "dummy/prev", nodeId: "dummy" }],
      highlightedIds: ["dummy"],
      swaps: [],
      prevVal: "dummy",
      firstVal: null,
      secondVal: null,
      message: "Empty list: dummy = ListNode(0, None). prev = dummy.",
    });
    steps.push({
      phase: "done",
      activeLine: 12,
      nodes: [],
      pointers: [{ label: "return", nodeId: null }],
      highlightedIds: [],
      swaps: [],
      prevVal: "dummy",
      firstVal: null,
      secondVal: null,
      message: "dummy.next is None. Return None (empty list).",
    });
    return steps;
  }

  // Build initial nodes with dummy node included at the head
  const dummyNode = { id: "dummy", val: "0", label: "dummy" };
  let currentListNodes = [
    dummyNode,
    ...values.map((val, idx) => ({
      id: `node-${idx + 1}`,
      val,
      label: idx === 0 ? "head" : `n${idx + 1}`,
    })),
  ];

  const swaps = [];

  steps.push({
    phase: "init",
    activeLine: 3,
    nodes: currentListNodes.map((n) => ({ ...n })),
    pointers: [
      { label: "dummy", nodeId: "dummy" },
      { label: "head", nodeId: currentListNodes[1]?.id ?? null },
    ],
    highlightedIds: ["dummy"],
    swaps: [],
    prevVal: "dummy",
    firstVal: null,
    secondVal: null,
    message: "Create dummy node: dummy = ListNode(0, head).",
  });

  steps.push({
    phase: "init",
    activeLine: 4,
    nodes: currentListNodes.map((n) => ({ ...n })),
    pointers: [
      { label: "prev", nodeId: "dummy" },
      { label: "head", nodeId: currentListNodes[1]?.id ?? null },
    ],
    highlightedIds: ["dummy"],
    swaps: [],
    prevVal: "dummy",
    firstVal: null,
    secondVal: null,
    message: "prev = dummy. Ready to iterate through pairs.",
  });

  let prevNode = dummyNode;

  while (true) {
    const prevIndex = currentListNodes.findIndex((n) => n.id === prevNode.id);
    const firstNode = currentListNodes[prevIndex + 1];
    const secondNode = currentListNodes[prevIndex + 2];

    if (!firstNode || !secondNode) {
      steps.push({
        phase: "check_end",
        activeLine: 5,
        nodes: currentListNodes.map((n) => ({ ...n })),
        pointers: [
          { label: "prev", nodeId: prevNode.id },
          ...(firstNode ? [{ label: "first", nodeId: firstNode.id }] : []),
        ],
        highlightedIds: [prevNode.id],
        swaps: [...swaps],
        prevVal: prevNode.label || prevNode.id,
        firstVal: firstNode ? firstNode.val : null,
        secondVal: null,
        message: firstNode
          ? `Only 1 node (${firstNode.val}) left after prev. Loop ends.`
          : "No nodes left after prev. Loop ends.",
      });
      break;
    }

    // while condition check
    steps.push({
      phase: "check_pair",
      activeLine: 5,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "first", nodeId: firstNode.id },
        { label: "second", nodeId: secondNode.id },
      ],
      highlightedIds: [firstNode.id, secondNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      message: `Found pair after prev: node(${firstNode.val}) and node(${secondNode.val}).`,
    });

    // identify first & second
    steps.push({
      phase: "identify",
      activeLine: 6,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "first", nodeId: firstNode.id },
        { label: "second", nodeId: secondNode.id },
      ],
      highlightedIds: [firstNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      message: `first = prev.next (node ${firstNode.val})`,
    });

    steps.push({
      phase: "identify",
      activeLine: 7,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "first", nodeId: firstNode.id },
        { label: "second", nodeId: secondNode.id },
      ],
      highlightedIds: [secondNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      message: `second = prev.next.next (node ${secondNode.val})`,
    });

    // swap step 1: prev.next = second
    steps.push({
      phase: "swap_start",
      activeLine: 8,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "first", nodeId: firstNode.id },
        { label: "second", nodeId: secondNode.id },
      ],
      highlightedIds: [prevNode.id, secondNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      operation: `prev.next = second (points ${prevNode.label || prevNode.id} -> ${secondNode.val})`,
      message: `Step 1/3: prev.next = second (connect ${prevNode.label || prevNode.id} -> node ${secondNode.val})`,
    });

    // swap step 2: first.next = second.next
    const nextTarget = currentListNodes[prevIndex + 3];
    steps.push({
      phase: "swap_start",
      activeLine: 9,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "first", nodeId: firstNode.id },
        { label: "second", nodeId: secondNode.id },
      ],
      highlightedIds: [firstNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      operation: `first.next = second.next (points ${firstNode.val} -> ${nextTarget ? nextTarget.val : "null"})`,
      message: `Step 2/3: first.next = second.next (node ${firstNode.val} points to ${nextTarget ? `node ${nextTarget.val}` : "null"})`,
    });

    // swap step 3: second.next = first
    // Reorder list in state: [..., prevNode, secondNode, firstNode, ...]
    const newList = [...currentListNodes];
    newList[prevIndex + 1] = secondNode;
    newList[prevIndex + 2] = firstNode;
    currentListNodes = newList;
    swaps.push([firstNode.val, secondNode.val]);

    steps.push({
      phase: "swap_done",
      activeLine: 10,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [
        { label: "prev", nodeId: prevNode.id },
        { label: "second", nodeId: secondNode.id },
        { label: "first", nodeId: firstNode.id },
      ],
      highlightedIds: [secondNode.id, firstNode.id],
      swaps: [...swaps],
      prevVal: prevNode.label || prevNode.id,
      firstVal: firstNode.val,
      secondVal: secondNode.val,
      operation: `second.next = first (points ${secondNode.val} -> ${firstNode.val})`,
      message: `Step 3/3: second.next = first. Swapped pair: [${secondNode.val}, ${firstNode.val}]!`,
    });

    // advance prev = first
    prevNode = firstNode;
    steps.push({
      phase: "advance",
      activeLine: 11,
      nodes: currentListNodes.map((n) => ({ ...n })),
      pointers: [{ label: "prev", nodeId: prevNode.id }],
      highlightedIds: [prevNode.id],
      swaps: [...swaps],
      prevVal: `node(${prevNode.val})`,
      firstVal: null,
      secondVal: null,
      message: `Advance prev = first (prev is now at node ${prevNode.val})`,
    });
  }

  // final done step
  const resultValues = currentListNodes.slice(1).map((n) => n.val);
  steps.push({
    phase: "done",
    activeLine: 12,
    nodes: currentListNodes.slice(1).map((n) => ({ ...n })),
    pointers: [{ label: "head", nodeId: currentListNodes[1]?.id ?? null }],
    highlightedIds: currentListNodes.slice(1).map((n) => n.id),
    swaps: [...swaps],
    prevVal: "dummy",
    firstVal: null,
    secondVal: null,
    result: resultValues,
    message: `Done! Returning dummy.next: [${resultValues.join(", ")}]`,
  });

  return steps;
}

export default function SwapNodesInPairsVisualizer() {
  const [valInput, setValInput] = useState("[1,2,3,4,5]");

  const { values, inputError } = useMemo(() => {
    try {
      const v = JSON.parse(valInput);
      if (!Array.isArray(v)) throw new Error("Must be an array");
      if (v.length > 8) throw new Error("Max 8 nodes for clarity");
      return { values: v, inputError: "" };
    } catch (e) {
      return {
        values: [1, 2, 3, 4, 5],
        inputError: e.message || "Invalid input",
      };
    }
  }, [valInput]);

  const steps = useMemo(() => generateSteps(values), [values]);

  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  // Primary Panel
  const primaryPanel = (
    <div className="snip-panel main">
      <header className="snip-head">
        <span>Linked List · Pair Swaps</span>
        {inputError && <span className="snip-error">{inputError}</span>}
      </header>
      <div className="snip-body">
        {/* Visual Step Callout */}
        {step?.operation && (
          <motion.div
            key={step.operation}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="snip-op-banner"
          >
            <span className="snip-op-badge">Pointer Rewire</span>
            <code>{step.operation}</code>
          </motion.div>
        )}

        {/* Modular LinkedListGraph Component */}
        <div className="snip-canvas-container">
          <LinkedListGraph
            nodes={step?.nodes ?? []}
            pointers={step?.pointers ?? []}
            highlightedIds={step?.highlightedIds ?? []}
            tone="main"
            label="Swap Nodes in Pairs Linked List"
            emptyText="List is empty (head → null)"
          />
        </div>

        {/* Result banner if done */}
        {step?.phase === "done" && step.result && (
          <motion.div
            className="snip-result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            ✨ Final Swapped List: <strong>[{step.result.join(" → ")}]</strong>
          </motion.div>
        )}

        {/* Legend */}
        <div className="snip-legend">
          <span className="snip-legend-item prev">prev — tracking pointer</span>
          <span className="snip-legend-item first">
            first — 1st node in pair
          </span>
          <span className="snip-legend-item second">
            second — 2nd node in pair
          </span>
          <span className="snip-legend-item swapped">
            swapped — {step?.swaps?.length ?? 0} pairs swapped
          </span>
        </div>
      </div>
    </div>
  );

  const statePanel = (
    <div className="snip-panel side">
      <header className="snip-head">
        <span>Swap State</span>
      </header>
      <div className="snip-body">
        {[
          { label: "prev", val: step?.prevVal ?? "—", cls: "prev" },
          {
            label: "first",
            val: step?.firstVal != null ? `node(${step.firstVal})` : "—",
            cls: "first",
          },
          {
            label: "second",
            val: step?.secondVal != null ? `node(${step.secondVal})` : "—",
            cls: "second",
          },
        ].map(({ label, val, cls }) => (
          <div key={label} className="snip-state-row">
            <span className={`snip-state-label ${cls}`}>{label}</span>
            <span className="snip-state-val mono">{val}</span>
          </div>
        ))}

        <div className="snip-swap-history">
          <span className="snip-hist-title">Swaps Log:</span>
          {!step?.swaps || step.swaps.length === 0 ? (
            <span className="snip-hist-empty">None yet</span>
          ) : (
            <div className="snip-hist-badges">
              {step.swaps.map(([a, b], idx) => (
                <span key={idx} className="snip-hist-chip">
                  ({a} ⇄ {b})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const codePanel = (
    <div style={{ position: "relative", height: "100%" }}>
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
          activeLine={step?.activeLine}
        />
      )}
    </div>
  );

  const statusPanel = (
    <div className="snip-status">
      {step?.message ?? "Press Play or Step to begin."}
    </div>
  );

  const playbackPanel = (
    <>
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
      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={SWAPNODESINPAIRS_PATTERNS}
        />
      )}
    </>
  );

  // Lumino state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "input", title: "Input" },
      {
        id: "primary",
        title: "Linked List · Pair Swaps",
        dockMode: "split-bottom",
      },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "state", title: "Swap State", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="snip-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input &&
            createPortal(
              <ManualInputPanel
                fields={[
                  {
                    key: "values",
                    label: "List values (JSON)",
                    type: "string",
                  },
                ]}
                values={{ values: valInput }}
                onChange={(_, value) => {
                  setValInput(value);
                  handleReset();
                }}
                examples={EXAMPLES}
                activeLabel={null}
                applyExample={(example) => {
                  setValInput(JSON.stringify(example.values));
                  handleReset();
                }}
                inputError={inputError}
              />,
              panelDivs.input,
            )}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          {playbackPanel}
        </FloatingPanel>,
        document.body,
      )}
    </div>
  );
}
