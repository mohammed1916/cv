import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { generateSteps } from "./algorithm";
import ZigzagStory from "./ZigzagStory";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./BinaryTreeZigzagLevelOrderTraversalVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 4: "init", 7: "loop", 10: "visit", 11: "update", 12: "update", 13: "update", 14: "reverse", 15: "update", 16: "update", 17: "done" };
const PATTERNS = ["init", "loop", "visit", "reverse", "update", "done"];
const EXAMPLES = getExamplesOr("binary-tree-zigzag-level-order-traversal", [
  { label: "Example 1", root: [3, 9, 20, null, null, 15, 7] },
  { label: "Example 2", root: [1] },
  { label: "Example 3", root: [] },
]);

const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def zigzagLevelOrder(root):" },
  { line: 2, text: "    if not root: return []" },
  { line: 3, text: "    result = []" },
  { line: 4, text: "    queue = deque([root])" },
  { line: 5, text: "    leftToRight = True" },
  { line: 6, text: "    while queue:" },
  { line: 7, text: "        levelSize = len(queue)" },
  { line: 8, text: "        level = []" },
  { line: 9, text: "        for i in range(levelSize):" },
  { line: 10, text: "            node = queue.popleft()" },
  { line: 11, text: "            level.append(node.val)" },
  { line: 12, text: "            if node.left: queue.append(node.left)" },
  { line: 13, text: "            if node.right: queue.append(node.right)" },
  { line: 14, text: "        if not leftToRight: level.reverse()" },
  { line: 15, text: "        result.append(level)" },
  { line: 16, text: "        leftToRight = not leftToRight" },
  { line: 17, text: "    return result" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE;

export default function BinaryTreeZigzagLevelOrderTraversalVisualizer() {
  const [rootInput, setRootInput] = useState("[3,9,20,null,null,15,7]");
  const { steps, inputError } = useMemo(() => {
    try { return { steps: generateSteps(rootInput), inputError: '' }; }
    catch (error) { return { steps: [], inputError: error.message }; }
  }, [rootInput]);

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
      setRootInput(JSON.stringify(e.root));
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

  // Extract panels into consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "root", label: "root", type: "array" }]}
        values={{ root: rootInput }}
        onChange={(k, v) => {
          if (k === "root") setRootInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
      <div className="bzlt-panel">
        <div className="bzlt-panel-head">Zigzag Traversal</div>
        <div className="bzlt-panel-body">
          {!inputError && <ZigzagStory step={step ?? steps[0]} />}
        </div>
      </div>
    </>
  );

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

  const statusPanel = (
    <div className="bzlt-status">
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

  // Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "Zigzag Traversal", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell bzlt-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
