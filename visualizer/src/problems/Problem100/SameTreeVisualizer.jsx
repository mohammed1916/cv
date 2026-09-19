import StoryPanel from "../../components/shared/StoryPanel";
import { generateSteps } from "./algorithm";
import { parseLevelOrderTree } from "../../components/shared/levelOrderTree";
import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";
import "./SameTreeVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";



const NODE_R = 22;

// ─── Python solution ──────────────────────────────────────────────────────────
const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def isSameTree(self, p, q):" },
  { line: 3, text: "        if not p and not q:" },
  { line: 4, text: "            return True" },
  { line: 5, text: "        if not p or not q:" },
  { line: 6, text: "            return False" },
  { line: 7, text: "        if p.val != q.val:" },
  { line: 8, text: "            return False" },
  { line: 9, text: "        left  = self.isSameTree(p.left,  q.left)" },
  { line: 10, text: "        right = self.isSameTree(p.right, q.right)" },
  { line: 11, text: "        return left and right" },
];

const LINE_PATTERN_MAP = {
  1: "init",
  2: "init",
  3: "check_loop",
  4: "found",
  5: "check_loop",
  6: "found",
  7: "check_loop",
  8: "found",
  9: "loop",
  10: "loop",
  11: "check_loop",
};

// ─── Preset examples ──────────────────────────────────────────────────────────
const EXAMPLES = getExamples("same-tree");

// ─── Tree utilities ───────────────────────────────────────────────────────────
function TreeCanvas({
  positions,
  edges,
  nodes,
  activePId,
  activeQId,
  nodeStates,
  label,
  prefix,
}) {
  const reduceMotion = useReducedMotion();
  const width = Math.max(320, ...[...positions.values()].map(p => p.x + 48));
  const height = Math.max(240, ...[...positions.values()].map(p => p.y + 48));
  return (
    <div className="st-tree-wrap" tabIndex={0} aria-label={`${label} tree; scroll to explore`}>
      <div className="st-tree-label">{label}</div>
      <div className="st-canvas" style={{ width, height }}>
        <svg
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none",
          }}
          width={width}
          height={height}
        >
          {edges.map(({ fromId, toId }) => {
            const from = positions.get(fromId);
            const to = positions.get(toId);
            if (!from || !to) return null;
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--code-line)"
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
        {nodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isActive =
            prefix === "p" ? activePId === node.id : activeQId === node.id;
          const state = nodeStates?.[node.id];
          return (
            <motion.div
              key={node.id}
              className={[
                "st-node",
                isActive ? "active" : "",
                state === "match" ? "match" : "",
                state === "mismatch" ? "mismatch" : "",
              ].join(" ")}
              animate={{
                left: pos.x - NODE_R,
                top: pos.y - NODE_R,
                scale: isActive && !reduceMotion ? 1.18 : 1,
              }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 22 }}
              style={{ left: pos.x - NODE_R, top: pos.y - NODE_R }}
            >
              {node.val}
            </motion.div>
          );
        })}
        {nodes.length === 0 && <div className="st-empty-tree">null</div>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SameTreeVisualizer() {
  const [selected, setSelected] = useState(0);
  const [pInput, setPInput] = useState(JSON.stringify(EXAMPLES[0].p));
  const [qInput, setQInput] = useState(JSON.stringify(EXAMPLES[0].q));

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { steps, inputError } = useMemo(() => {
    try {
      parseLevelOrderTree(pInput); parseLevelOrderTree(qInput);
      return { steps: generateSteps(JSON.parse(pInput), JSON.parse(qInput)), inputError: '' };
    } catch (error) { return { steps: [], inputError: error.message }; }
  }, [pInput, qInput]);

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

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyExample = useCallback(
    (idx) => {
      setSelected(idx);
      setPInput(JSON.stringify(EXAMPLES[idx].p));
      setQInput(JSON.stringify(EXAMPLES[idx].q));
      handleReset();
    },
    [handleReset],
  );

  const finalResult = step?.finalResult;
  const hasFinal = finalResult !== null && finalResult !== undefined;

  // ─── Extract panels for Lumino layout ─────────────────────────────────────
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[
          { key: "p", label: "p", type: "string" },
          { key: "q", label: "q", type: "string" },
        ]}
        values={{ p: pInput, q: qInput }}
        onChange={(k, v) => {
          if (k === "p") setPInput(v);
          if (k === "q") setQInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={EXAMPLES[selected]?.label}
        applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
        inputError={inputError}
      />

      <div className="st-panel main">
        <header className="st-head">
          <span>Two Tree DFS Comparison</span>
          {inputError && <span className="st-error">{inputError}</span>}
        </header>
        <div className="st-body">
          {/* Side-by-side trees */}
          <div className="st-trees">
            <TreeCanvas
              positions={(step ?? steps[0])?.pPositions ?? new Map()}
              edges={(step ?? steps[0])?.pEdges ?? []}
              nodes={(step ?? steps[0])?.pNodes ?? []}
              activePId={step?.activePId}
              activeQId={step?.activeQId}
              nodeStates={step?.nodeStates}
              label="p"
              prefix="p"
            />
            <div className="st-vs">
              {hasFinal ? (
                <motion.span
                  className={`st-vs-badge ${finalResult ? "true" : "false"}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  {finalResult ? "true" : "false"}
                </motion.span>
              ) : (
                <span className="st-vs-label">vs</span>
              )}
            </div>
            <TreeCanvas
              positions={(step ?? steps[0])?.qPositions ?? new Map()}
              edges={(step ?? steps[0])?.qEdges ?? []}
              nodes={(step ?? steps[0])?.qNodes ?? []}
              activePId={step?.activePId}
              activeQId={step?.activeQId}
              nodeStates={step?.nodeStates}
              label="q"
              prefix="q"
            />
          </div>
        </div>
      </div>
    </>
  );

  const statePanel = (
    <div className="st-panel side">
      <header className="st-head">
        <span>State</span>
      </header>
      <div className="st-body">
        <StoryPanel title="Match positions, then values" description={step?.message ?? 'Trees must have the same shape and the same value at every corresponding position.'}>
          {step && <p>Current pair: p = {step.pNodes.find(n => n.id === step.activePId)?.val ?? 'missing'}; q = {step.qNodes.find(n => n.id === step.activeQId)?.val ?? 'missing'}.</p>}
          <p>{step?.activeLine === 6 ? 'Structure differs: exactly one corresponding child exists.' : step?.activeLine === 8 ? 'Values differ at the same position.' : 'A matching value is provisional until both child comparisons return true.'}</p>
        </StoryPanel>
        <div className="st-legend">
          <div className="st-legend-item">
            <div className="st-dot active" />
            <span>Current comparison</span>
          </div>
          <div className="st-legend-item">
            <div className="st-dot match" />
            <span>Values matched</span>
          </div>
          <div className="st-legend-item">
            <div className="st-dot mismatch" />
            <span>Mismatch found</span>
          </div>
        </div>

        <div className="st-state-row">
          <span className="st-state-label">p node</span>
          <span className="st-state-val">
            {step?.activePId != null
              ? (step.pNodes?.find((n) => n.id === step.activePId)?.val ??
                "null")
              : "—"}
          </span>
        </div>
        <div className="st-state-row">
          <span className="st-state-label">q node</span>
          <span className="st-state-val">
            {step?.activeQId != null
              ? (step.qNodes?.find((n) => n.id === step.activeQId)?.val ??
                "null")
              : "—"}
          </span>
        </div>
        <div className="st-state-row">
          <span className="st-state-label">Matched</span>
          <span className="st-state-val">
            {Object.values(step?.nodeStates ?? {}).filter((s) => s === "match")
              .length / 2}
          </span>
        </div>
        <div className="st-state-row">
          <span className="st-state-label">Mismatched</span>
          <span className="st-state-val st-mismatch-count">
            {Object.values(step?.nodeStates ?? {}).filter(
              (s) => s === "mismatch",
            ).length / 2}
          </span>
        </div>

        <div
          className={`st-result-box ${hasFinal ? (finalResult ? "true" : "false") : ""}`}
        >
          {hasFinal
            ? `isSameTree → ${finalResult}`
            : step
              ? "Running…"
              : "Press Play"}
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
    <div
      className={`st-status ${hasFinal ? (finalResult ? "ok" : "bad") : ""}`}
    >
      {step?.message || "Press Play or Step to begin."}
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
      {showPatternOverlay && <PatternLegend />}
    </>
  );

  // ─── Lumino state + config ───────────────────────────────────────────────
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: "Two Tree DFS Comparison",
        dockMode: "split-right",
      },
      { id: "state", title: "State", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell st-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
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
