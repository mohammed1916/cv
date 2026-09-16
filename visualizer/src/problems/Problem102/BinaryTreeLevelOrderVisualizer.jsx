import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { generateSteps } from "./algorithm";
import StoryPanel from "../../components/shared/StoryPanel";
import VisualizationPanel from "../../components/shared/TraversalTreePanel";
import { getExamples } from "../../config/examplesRegistry";
import "./BinaryTreeLevelOrderVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 4: "init", 7: "loop", 8: "visit", 9: "update", 10: "update", 11: "update", 12: "update", 13: "done" };
const PATTERNS = ["init", "loop", "visit", "update", "done"];

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def levelOrder(self, root):" },
  { line: 3, text: "        if not root: return []" },
  { line: 4, text: "        res, queue = [], deque([root])" },
  { line: 5, text: "        while queue:" },
  { line: 6, text: "            level = []" },
  { line: 7, text: "            for _ in range(len(queue)):" },
  { line: 8, text: "                node = queue.popleft()" },
  { line: 9, text: "                level.append(node.val)" },
  { line: 10, text: "                if node.left:  queue.append(node.left)" },
  { line: 11, text: "                if node.right: queue.append(node.right)" },
  { line: 12, text: "            res.append(level)" },
  { line: 13, text: "        return res" },
];

const EXAMPLES = getExamples("binary-tree-level-order");

function ResultPanel({ step, inputError, LEVEL_COLORS }) {
  return (
    <div className="btlo-result-panel">
      <StoryPanel title="Queue: front to back" description="Finish the frozen current-level count before processing the next level.">
        <p>{(step?.queue ?? []).map(n => `${n.val} (#${n.id})`).join(' -> ') || 'Queue empty'}</p>
        <p>Current level: [{(step?.currentLevel ?? []).join(', ')}] | {step?.remaining ?? 0} nodes left to finish.</p>
      </StoryPanel>
      <div className="btlo-levels">
        {(step?.levels ?? []).map((level, i) => (
          <div
            key={i}
            className="btlo-level-row"
            style={{ borderLeftColor: LEVEL_COLORS[i % LEVEL_COLORS.length] }}
          >
            <span className="btlo-level-idx">L{i}</span>
            <span className="btlo-level-vals">[{level.join(", ")}]</span>
          </div>
        ))}
        {step?.levels?.length === 0 && (
          <div className="btlo-empty">No levels yet</div>
        )}
      </div>
      <div className={`btlo-result ${step?.phase === "done" ? "ok" : ""}`}>
        {step?.phase === "done"
          ? `${step.levels.length} levels`
          : "Running BFS…"}
      </div>
      {inputError && <div className="btlo-error-box">{inputError}</div>}
    </div>
  );
}

export default function BinaryTreeLevelOrderVisualizer() {
  const [arrInput, setArrInput] = useState("[3,9,20,null,null,15,7]");
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { steps, inputError } = useMemo(() => {
    try { return { steps: generateSteps(arrInput), inputError: '' }; }
    catch (error) { return { steps: [], inputError: error.message }; }
  }, [arrInput]);

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
    (ex) => {
      setArrInput(JSON.stringify(ex.arr));
      handleReset();
    },
    [handleReset],
  );

  const positions = (step ?? steps[0])?.positions ?? new Map();
  const edges = (step ?? steps[0])?.edges ?? [];
  const allNodes = (step ?? steps[0])?.allNodes ?? [];

  // Color level bands
  const LEVEL_COLORS = [
    "#89b4fa",
    "#a6e3a1",
    "#f9e2af",
    "#cba6f7",
    "#f38ba8",
    "#89dceb",
  ];

  // Extract panels as consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "arr", label: "arr", type: "string" }]}
        values={{ arr: arrInput }}
        onChange={(k, v) => {
          if (k === "arr") setArrInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="btlo-panel">
        <VisualizationPanel
          EXAMPLES={EXAMPLES}
          arrInput={arrInput}
          setArrInput={setArrInput}
          positions={positions}
          edges={edges}
          allNodes={allNodes}
          step={step}
          applyExample={applyExample}
          handleReset={handleReset}
        />
      </div>
    </>
  );

  const statePanel = (
    <div className="btlo-panel">
      <ResultPanel
        step={step}
        inputError={inputError}
        LEVEL_COLORS={LEVEL_COLORS}
      />
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
          step={step}
          activeLineDom={activeLineDom}
          patterns={PATTERNS}
          linePatternMap={LINE_PATTERN_MAP}
        />
      )}
    </div>
  );

  const statusPanel = (
    <div className="btlo-status">
      <span>
        {step?.phase === "done"
          ? `${step.levels.length} levels`
          : "Running BFS…"}
      </span>
      <span className="btlo-status-detail">
        {step?.message || "Press Play to begin."}
      </span>
    </div>
  );

  const playbackPanel = (
    <>
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={togglePlay}
        onNext={stepForward}
        resetDisabled={steps.length === 0}
        prevDisabled={stepIndex <= 0}
        nextDisabled={steps.length === 0 || isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        speedIndicator={`${speed}ms`}
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        autoScrollLabel="Auto-scroll code"
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
    </>
  );

  // Panel state
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "Tree Visualization", dockMode: "split-right" },
      { id: "state", title: "Level Results", dockMode: "split-right" },
      { id: "code", title: "Code Trace", dockMode: "split-bottom" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell btlo-shell">
      <div className="btlo-header">
        <h2>Binary Tree Level Order Traversal</h2>
      </div>

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
