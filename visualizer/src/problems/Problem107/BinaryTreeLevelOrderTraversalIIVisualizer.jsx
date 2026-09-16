import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { generateSteps } from "./algorithm";
import StoryPanel from "../../components/shared/StoryPanel";
import VisualizationPanel from "../../components/shared/TraversalTreePanel";
import { getExamples } from "../../config/examplesRegistry";
import "./BinaryTreeLevelOrderTraversalII.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 4: "init", 7: "loop", 8: "visit", 9: "update", 10: "update", 11: "update", 12: "update", 13: "reverse" };
const PATTERNS = ["init", "loop", "visit", "update", "reverse"];

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def levelOrderBottom(self, root):" },
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
  { line: 13, text: "        return res[::-1]  # Reverse!" },
];

const EXAMPLES = getExamples("binary-tree-level-order-ii");

function ResultPanel({ step, inputError, LEVEL_COLORS }) {
  return (
    <div className="btloti-result-panel"><StoryPanel title="Collect top-down. Return bottom-up." description={step?.message ?? "Build levels with a FIFO queue, then reverse the level list."}><p>Within each row, left-to-right node order stays unchanged.</p></StoryPanel>
      <div className="btloti-queue-label">
        Queue: [{[...(step?.queueIds ?? [])].join(", ")}]
      </div>
      <div className="btloti-levels">
        <div className="btloti-section-label">
          Top-to-Bottom (before reverse):
        </div>
        {(step?.levels ?? []).map((level, i) => (
          <div
            key={`forward-${i}`}
            className="btloti-level-row"
            style={{ borderLeftColor: LEVEL_COLORS[i % LEVEL_COLORS.length] }}
          >
            <span className="btloti-level-idx">L{i}</span>
            <span className="btloti-level-vals">[{level.join(", ")}]</span>
          </div>
        ))}
        {step?.levels?.length === 0 && (
          <div className="btloti-empty">No levels yet</div>
        )}
      </div>
      <div className="btloti-separator" />
      <div className="btloti-levels">
        <div className="btloti-section-label">
          Bottom-to-Top (after reverse):
        </div>
        {(step?.reversedLevels ?? []).map((level, i) => (
          <div
            key={`reverse-${i}`}
            className="btloti-level-row"
            style={{
              borderLeftColor:
                LEVEL_COLORS[
                  (step?.levels?.length - 1 - i) % LEVEL_COLORS.length
                ],
            }}
          >
            <span className="btloti-level-idx">L{i}</span>
            <span className="btloti-level-vals">[{level.join(", ")}]</span>
          </div>
        ))}
        {step?.reversedLevels?.length === 0 && (
          <div className="btloti-empty">No levels yet</div>
        )}
      </div>
      <div className={`btloti-result ${step?.phase === "done" ? "ok" : ""}`}>
        {step?.phase === "done"
          ? `${step.reversedLevels.length} levels (reversed)`
          : "Running BFS…"}
      </div>
      {inputError && <div className="btloti-error-box">{inputError}</div>}
    </div>
  );
}

export default function BinaryTreeLevelOrderTraversalIIVisualizer() {
  const [arrInput, setArrInput] = useState("[3,9,20,null,null,15,7]");
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();
  const [panelDivs, setPanelDivs] = useState(null);

  const { steps, inputError } = useMemo(() => {
    try { return { steps: generateSteps(arrInput), inputError: '' }; }
    catch(error) { return { steps: [], inputError: error.message }; }
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

      <div className="btloti-panel">
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
    <div className="btloti-panel">
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
        <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLine={step?.activeLine} activeLineDom={activeLineDom} />
      )}
    </div>
  );

  const statusPanel = (
    <div className="btloti-status">
      <div
        className={`btloti-status-message ${step?.phase === "done" ? "ok" : ""}`}
      >
        {step?.message || "Press Play to begin."}
      </div>
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
      {showPatternOverlay && <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />}
    </>
  );

  // Configure Lumino panels
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
    <div className="vis-shell btloti-shell">
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
