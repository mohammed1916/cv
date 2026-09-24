import { getExamples } from "../../config/examplesRegistry";
import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LinkedListGraph from "../../components/shared/LinkedListGraph";
import "./Visualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

const PATTERNS = [
  "init",
  "measure",
  "form_ring",
  "locate",
  "break_ring",
  "done",
];

const SOLUTION_CODE = [
  { line: 1, text: "def rotateRight(head, k):" },
  { line: 2, text: "    if not head or not head.next: return head" },
  { line: 3, text: "    n, tail = 1, head" },
  { line: 4, text: "    while tail.next:" },
  { line: 5, text: "        tail = tail.next; n += 1" },
  { line: 6, text: "    tail.next = head            # form a ring" },
  { line: 7, text: "    k = k % n" },
  { line: 8, text: "    steps = n - k - 1" },
  { line: 9, text: "    newTail = head" },
  { line: 10, text: "    for _ in range(steps):" },
  { line: 11, text: "        newTail = newTail.next" },
  { line: 12, text: "    newHead = newTail.next" },
  { line: 13, text: "    newTail.next = None         # break the ring" },
  { line: 14, text: "    return newHead" },
];

const LINE_PATTERN_MAP = {
  2: "init",
  3: "measure",
  4: "measure",
  5: "measure",
  6: "form_ring",
  7: "locate",
  8: "locate",
  9: "locate",
  10: "locate",
  11: "locate",
  12: "break_ring",
  13: "break_ring",
  14: "done",
};

const EXAMPLES = getExamples("rotate-list");

function generateSteps(list, k) {
  const steps = [];
  if (!list || list.length === 0) {
    steps.push({
      activeLine: 2,
      phase: "init",
      nodes: [],
      pointers: [{ label: "head", nodeId: null }],
      highlightedIds: [],
      cycleStart: -1,
      ringStatus: "empty",
      k,
      effectiveK: 0,
      n: 0,
      message: "Empty list (head is None). Return None.",
    });
    return steps;
  }

  // Build node objects with stable IDs
  const nodes = list.map((val, i) => ({
    id: `node-${i}`,
    val,
    label: i === 0 ? "head" : `n${i}`,
  }));
  const n = nodes.length;

  if (n === 1) {
    steps.push({
      activeLine: 2,
      phase: "init",
      nodes: [...nodes],
      pointers: [{ label: "head", nodeId: nodes[0].id }],
      highlightedIds: [nodes[0].id],
      cycleStart: -1,
      ringStatus: "single",
      k,
      effectiveK: 0,
      n: 1,
      result: [nodes[0].val],
      message: "Single node (not head.next). Return head unchanged.",
    });
    return steps;
  }

  // Step 1: Initial state
  steps.push({
    activeLine: 2,
    phase: "init",
    nodes: [...nodes],
    pointers: [{ label: "head", nodeId: nodes[0].id }],
    highlightedIds: [nodes[0].id],
    cycleStart: -1,
    ringStatus: "linear",
    k,
    effectiveK: null,
    n,
    message: `List has ${n} nodes. Prepare to rotate right by k = ${k}.`,
  });

  // Measure length + find tail
  steps.push({
    activeLine: 3,
    phase: "measure",
    nodes: [...nodes],
    pointers: [
      { label: "head", nodeId: nodes[0].id },
      { label: "tail", nodeId: nodes[0].id },
    ],
    highlightedIds: [nodes[0].id],
    cycleStart: -1,
    ringStatus: "linear",
    k,
    effectiveK: null,
    n: 1,
    message: `Initialize: n = 1, tail = head (node ${nodes[0].val}).`,
  });

  for (let i = 1; i < n; i++) {
    steps.push({
      activeLine: 5,
      phase: "measure",
      nodes: [...nodes],
      pointers: [
        { label: "head", nodeId: nodes[0].id },
        { label: "tail", nodeId: nodes[i].id },
      ],
      highlightedIds: [nodes[i].id],
      cycleStart: -1,
      ringStatus: "linear",
      k,
      effectiveK: null,
      n: i + 1,
      message: `Advance tail -> node ${nodes[i].val}; count n = ${i + 1}.`,
    });
  }

  const tailIdx = n - 1;

  // Form the ring: tail.next = head
  steps.push({
    activeLine: 6,
    phase: "form_ring",
    nodes: [...nodes],
    pointers: [
      { label: "head", nodeId: nodes[0].id },
      { label: "tail", nodeId: nodes[tailIdx].id },
    ],
    highlightedIds: [nodes[0].id, nodes[tailIdx].id],
    cycleStart: 0,
    ringStatus: "ring",
    k,
    effectiveK: null,
    n,
    operation: `tail.next = head (node ${nodes[tailIdx].val} ➔ node ${nodes[0].val})`,
    message: `Connect tail (node ${nodes[tailIdx].val}) -> head (node ${nodes[0].val}) to form a closed ring of size ${n}.`,
  });

  // Effective rotation: k = k % n
  const effectiveK = ((k % n) + n) % n;
  steps.push({
    activeLine: 7,
    phase: "locate",
    nodes: [...nodes],
    pointers: [
      { label: "head", nodeId: nodes[0].id },
      { label: "tail", nodeId: nodes[tailIdx].id },
    ],
    highlightedIds: [],
    cycleStart: 0,
    ringStatus: "ring",
    k,
    effectiveK,
    n,
    message: `Calculate effective rotation: k = ${k} % ${n} = ${effectiveK}.`,
  });

  if (effectiveK === 0) {
    steps.push({
      activeLine: 13,
      phase: "break_ring",
      nodes: [...nodes],
      pointers: [
        { label: "newHead / head", nodeId: nodes[0].id },
        { label: "newTail", nodeId: nodes[tailIdx].id },
      ],
      highlightedIds: [nodes[tailIdx].id],
      cycleStart: -1,
      ringStatus: "broken",
      k,
      effectiveK,
      n,
      operation: `newTail.next = None (break ring at tail)`,
      message: "k % n == 0 (no rotation needed). Break ring at original tail.",
    });

    const res = nodes.map((nd) => nd.val);
    steps.push({
      activeLine: 14,
      phase: "done",
      nodes: [...nodes],
      pointers: [{ label: "return head", nodeId: nodes[0].id }],
      highlightedIds: nodes.map((nd) => nd.id),
      cycleStart: -1,
      ringStatus: "linear",
      k,
      effectiveK,
      n,
      result: res,
      message: `Done! Result: [${res.join(" → ")}].`,
    });
    return steps;
  }

  const walk = n - effectiveK - 1;

  steps.push({
    activeLine: 8,
    phase: "locate",
    nodes: [...nodes],
    pointers: [
      { label: "head", nodeId: nodes[0].id },
      { label: "tail", nodeId: nodes[tailIdx].id },
    ],
    highlightedIds: [],
    cycleStart: 0,
    ringStatus: "ring",
    k,
    effectiveK,
    walk,
    n,
    message: `New tail position: steps = n - k - 1 = ${n} - ${effectiveK} - 1 = ${walk}. Walk ${walk} step(s) from head.`,
  });

  // Walk to newTail from head
  let pos = 0;
  steps.push({
    activeLine: 9,
    phase: "locate",
    nodes: [...nodes],
    pointers: [
      { label: "head", nodeId: nodes[0].id },
      { label: "newTail", nodeId: nodes[0].id },
      { label: "tail", nodeId: nodes[tailIdx].id },
    ],
    highlightedIds: [nodes[0].id],
    cycleStart: 0,
    ringStatus: "ring",
    k,
    effectiveK,
    walk,
    n,
    message: `newTail = head (starts at node ${nodes[0].val}, index 0).`,
  });

  for (let i = 0; i < walk; i++) {
    pos = i + 1;
    steps.push({
      activeLine: 11,
      phase: "locate",
      nodes: [...nodes],
      pointers: [
        { label: "head", nodeId: nodes[0].id },
        { label: "newTail", nodeId: nodes[pos].id },
        { label: "tail", nodeId: nodes[tailIdx].id },
      ],
      highlightedIds: [nodes[pos].id],
      cycleStart: 0,
      ringStatus: "ring",
      k,
      effectiveK,
      walk,
      n,
      message: `Advance newTail to node ${nodes[pos].val} (step ${i + 1}/${walk}).`,
    });
  }

  const newTailIdx = walk;
  const newHeadIdx = walk + 1;

  // newHead = newTail.next
  steps.push({
    activeLine: 12,
    phase: "break_ring",
    nodes: [...nodes],
    pointers: [
      { label: "newTail", nodeId: nodes[newTailIdx].id },
      { label: "newHead", nodeId: nodes[newHeadIdx].id },
    ],
    highlightedIds: [nodes[newTailIdx].id, nodes[newHeadIdx].id],
    cycleStart: 0,
    ringStatus: "ring",
    k,
    effectiveK,
    walk,
    n,
    operation: `newHead = newTail.next (node ${nodes[newHeadIdx].val})`,
    message: `Identify newHead = newTail.next (node ${nodes[newHeadIdx].val} at index ${newHeadIdx}).`,
  });

  // Break the ring: newTail.next = None
  steps.push({
    activeLine: 13,
    phase: "break_ring",
    nodes: [...nodes],
    pointers: [
      { label: "newTail (end)", nodeId: nodes[newTailIdx].id },
      { label: "newHead", nodeId: nodes[newHeadIdx].id },
    ],
    highlightedIds: [nodes[newTailIdx].id],
    cycleStart: -1,
    ringStatus: "broken",
    k,
    effectiveK,
    walk,
    n,
    operation: `newTail.next = None (cut link after node ${nodes[newTailIdx].val})`,
    message: `Break the ring: newTail.next = None. Cut after node ${nodes[newTailIdx].val}.`,
  });

  // Rotated result ordering starting at newHead
  const resultNodes = [];
  for (let i = 0; i < n; i++) {
    const orig = nodes[(newHeadIdx + i) % n];
    resultNodes.push({
      id: `rot-${orig.id}`,
      val: orig.val,
      label: i === 0 ? "head" : `n${i}`,
    });
  }

  steps.push({
    activeLine: 14,
    phase: "done",
    nodes: resultNodes,
    pointers: [{ label: "head", nodeId: resultNodes[0].id }],
    highlightedIds: resultNodes.map((nd) => nd.id),
    cycleStart: -1,
    ringStatus: "linear",
    k,
    effectiveK,
    walk,
    n,
    result: resultNodes.map((nd) => nd.val),
    message: `Done! Return newHead: [${resultNodes.map((nd) => nd.val).join(" → ")}].`,
  });

  return steps;
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div className="problem61-empty">
        Press Play or Step to rotate the linked list.
      </div>
    );
  }

  const ringBadgeText =
    {
      empty: "List Empty",
      single: "Single Node",
      linear: "Linear List (Unlinked tail)",
      ring: "Closed Ring (tail ➔ head)",
      broken: "Ring Cut at newTail",
    }[step.ringStatus] || "Linear";

  return (
    <div className="problem61-viz-body">
      {/* Top Metrics Banner */}
      <div className="problem61-metrics">
        <div className="problem61-metric-chip">
          <span className="p61-metric-label">Target k</span>
          <span className="p61-metric-val">{step.k}</span>
        </div>
        <div className="problem61-metric-chip">
          <span className="p61-metric-label">Length n</span>
          <span className="p61-metric-val">{step.n ?? "—"}</span>
        </div>
        <div className="problem61-metric-chip">
          <span className="p61-metric-label">Effective k (k % n)</span>
          <span className="p61-metric-val highlight">
            {step.effectiveK == null ? "?" : step.effectiveK}
          </span>
        </div>
        <div className="problem61-metric-chip">
          <span className="p61-metric-label">Steps (n - k - 1)</span>
          <span className="p61-metric-val">
            {step.walk != null ? step.walk : "—"}
          </span>
        </div>
        <div className={`problem61-metric-chip ring-status ${step.ringStatus}`}>
          <span className="p61-metric-label">Ring State</span>
          <span className="p61-metric-val ring-val">{ringBadgeText}</span>
        </div>
      </div>

      {/* Pointer operation callout */}
      {step.operation && (
        <motion.div
          key={step.operation}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="problem61-op-banner"
        >
          <span className="problem61-op-badge">Pointer Step</span>
          <code>{step.operation}</code>
        </motion.div>
      )}

      {/* Modular LinkedListGraph Component */}
      <div className="problem61-canvas-box">
        <LinkedListGraph
          nodes={step.nodes || []}
          pointers={step.pointers || []}
          highlightedIds={step.highlightedIds || []}
          cycleStart={step.cycleStart ?? -1}
          tone={step.ringStatus === "ring" ? "accent" : "main"}
          label="Rotate List Linked List"
          emptyText="head → null"
        />
      </div>

      {/* Final Result Card */}
      {step.result && (
        <motion.div
          className="problem61-result-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          ✨ Rotated Result: <strong>[{step.result.join(" → ")}]</strong>
        </motion.div>
      )}

      {/* Status message */}
      <div className="problem61-step-msg">{step.message}</div>
    </div>
  );
}

export default function Problem61Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [listInput, setListInput] = useState("[1,2,3,4,5]");
  const [kInput, setKInput] = useState(2);

  const { list, k, inputError } = useMemo(() => {
    try {
      const parsedList = JSON.parse(listInput);
      if (!Array.isArray(parsedList)) throw new Error("list must be an array");
      if (parsedList.length > 8) throw new Error("Max 8 nodes for clarity");
      const parsedK = Number(kInput);
      if (isNaN(parsedK) || parsedK < 0)
        throw new Error("k must be a non-negative number");
      return { list: parsedList, k: parsedK, inputError: "" };
    } catch (e) {
      return { list: [1, 2, 3, 4, 5], k: 2, inputError: e.message };
    }
  }, [listInput, kInput]);

  const steps = useMemo(
    () =>
      generateSteps(list, k).map((c) => ({
        ...c,
        relatedLines:
          c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
      })),
    [list, k],
  );

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyEx = useCallback(
    (e) => {
      setEx(e);
      setListInput(JSON.stringify(e.list));
      setKInput(String(e.k));
      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const codePanel = (
    <div style={{ position: "relative", height: "100%" }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
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

  const primaryPanel = (
    <div
      className="problem61-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <header className="problem61-panel-head">
        <span>🔄 Rotate Linked List by k Places</span>
        {inputError && <span className="problem61-error">{inputError}</span>}
      </header>
      <div className="problem61-panel-body">
        <VisualizationPanel step={step} />
      </div>
    </div>
  );

  const inputPanel = (
    <ManualInputPanel
      fields={[
        { key: "list", label: "List values (JSON)", type: "array" },
        { key: "k", label: "k (rotations)", type: "number" },
      ]}
      values={{ list: listInput, k: kInput }}
      onChange={(k, v) => {
        if (k === "list") setListInput(v);
        if (k === "k") setKInput(v);
        handleReset();
      }}
      examples={EXAMPLES}
      activeLabel={ex?.label}
      applyExample={applyEx}
      inputError={inputError}
    />
  );

  const statusPanel = (
    <div className="problem61-status">
      {step?.message || `Ready. Step ${stepIndex + 1} of ${steps.length}`}
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
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "input", title: "Input & Examples" },
      {
        id: "primary",
        title: "🔄 Rotate List Graph",
        dockMode: "split-bottom",
      },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="problem61-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
