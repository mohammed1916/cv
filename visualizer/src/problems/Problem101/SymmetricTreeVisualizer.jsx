import { generateSteps } from "./algorithm";
import MirrorTreeStory from "./MirrorTreeStory";
import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from "../../config/examplesRegistry";
import "./SymmetricTreeVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 4: "check", 6: "check", 8: "compare", 10: "visit", 11: "visit", 12: "done" };
const PATTERNS = ["check", "compare", "visit", "done"];




// ─── Python solution ──────────────────────────────────────────────────────────
const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def isSymmetric(self, root):" },
  { line: 3, text: "        def isMirror(left, right):" },
  { line: 4, text: "            if not left and not right:" },
  { line: 5, text: "                return True" },
  { line: 6, text: "            if not left or not right:" },
  { line: 7, text: "                return False" },
  { line: 8, text: "            if left.val != right.val:" },
  { line: 9, text: "                return False" },
  { line: 10, text: "            return (isMirror(left.left, right.right)" },
  { line: 11, text: "                and isMirror(left.right, right.left))" },
  { line: 12, text: "        return not root or isMirror(root.left, root.right)" },
];

// ─── Preset examples ──────────────────────────────────────────────────────────
const EXAMPLES = getExamples("symmetric-tree");

// ─── Tree utilities ───────────────────────────────────────────────────────────
export default function SymmetricTreeVisualizer() {
  const [selected, setSelected] = useState(0);
  const [treeInput, setTreeInput] = useState(JSON.stringify(EXAMPLES[0].tree));

  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { steps, inputError } = useMemo(() => {
    try { return { steps: generateSteps(JSON.parse(treeInput)), inputError: '' }; }
    catch (error) { return { steps: [], inputError: error.message }; }
  }, [treeInput]);

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
      setTreeInput(JSON.stringify(EXAMPLES[idx].tree));
      handleReset();
    },
    [handleReset],
  );

  const finalResult = step?.finalResult;
  const hasFinal = finalResult !== null && finalResult !== undefined;

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "tree", label: "tree", type: "string" }]}
        values={{ tree: treeInput }}
        onChange={(k, v) => {
          if (k === "tree") setTreeInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={EXAMPLES[selected]?.label}
        applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
        inputError={inputError}
      />

      <div
        className="sym-panel"
        style={{ position: "relative", height: "100%" }}
      >
        <div className="sym-panel-head">Symmetric Tree Mirror Check</div>
        <div className="sym-panel-body">
          {/* Canvas */}
          <div className="sym-canvas-wrap">
            <div className="sym-canvas-label">Tree visualization</div>
            {!inputError && <MirrorTreeStory
              positions={(step ?? steps[0])?.positions ?? new Map()}
              edges={(step ?? steps[0])?.edges ?? []}
              nodes={(step ?? steps[0])?.nodes ?? []}
              activeLeftId={step?.activeLeftId}
              activeRightId={step?.activeRightId}
              nodeStates={step?.nodeStates}
            />}
            {hasFinal && (
              <motion.div
                className={`sym-result-badge ${finalResult ? "symmetric" : "not-symmetric"}`}
                initial={false}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {finalResult ? "SYMMETRIC" : "NOT SYMMETRIC"}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const statePanel = (
    <div className="sym-panel" style={{ position: "relative", height: "100%" }}>
      <div className="sym-panel-head">State</div>
      <div className="sym-panel-body">
        <div className="sym-legend">
          <div className="sym-legend-item">
            <div className="sym-dot active" />
            <span>Current pair</span>
          </div>
          <div className="sym-legend-item">
            <div className="sym-dot mirror-ok" />
            <span>Pair matches</span>
          </div>
          <div className="sym-legend-item">
            <div className="sym-dot mirror-fail" />
            <span>Pair differs</span>
          </div>
        </div>

        <div className="sym-state-row">
          <span className="sym-state-label">Left node</span>
          <span className="sym-state-val">
            {step?.activeLeftId != null
              ? (step.nodes?.find((n) => n.id === step.activeLeftId)?.val ??
                "null")
              : "—"}
          </span>
        </div>
        <div className="sym-state-row">
          <span className="sym-state-label">Right node</span>
          <span className="sym-state-val">
            {step?.activeRightId != null
              ? (step.nodes?.find((n) => n.id === step.activeRightId)?.val ??
                "null")
              : "—"}
          </span>
        </div>
        <div className="sym-state-row">
          <span className="sym-state-label">Pairs OK</span>
          <span className="sym-state-val">
            {Object.values(step?.nodeStates ?? {}).filter(
              (s) => s === "mirror-ok",
            ).length / 2}
          </span>
        </div>
        <div className="sym-state-row">
          <span className="sym-state-label">Pairs failed</span>
          <span className="sym-state-val sym-fail-count">
            {Object.values(step?.nodeStates ?? {}).filter(
              (s) => s === "mirror-fail",
            ).length / 2}
          </span>
        </div>

        <div
          className={`sym-result-box ${hasFinal ? (finalResult ? "symmetric" : "not-symmetric") : ""}`}
        >
          {hasFinal
            ? `isSymmetric → ${finalResult}`
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
    <div className="sym-status">
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
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && <PatternLegend usedPatterns={PATTERNS} />}
    </>
  );

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: "Symmetric Tree Mirror Check",
        dockMode: "split-right",
      },
      { id: "state", title: "State", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-bottom" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 4: Replace return with portals
  return (
    <div className="vis-shell sym-shell">
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
