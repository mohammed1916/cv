import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { buildSortedArrayStory } from "./algorithm";
import SortedTreeStory from "../../components/shared/SortedTreeStory.jsx";
import StoryPanel from "../../components/shared/StoryPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import "./ConvertSortedArrayToBinarySearchTreeVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 3: "return", 4: "compare", 5: "update", 6: "visit", 7: "visit", 8: "return", 9: "done" };
const PATTERNS = ["compare", "update", "visit", "return", "done"];

const SOLUTION_CODE = [
  { line: 1, text: "def sortedArrayToBST(nums):" },
  { line: 2, text: "    def build(left, right):" },
  { line: 3, text: "        if left >= right: return None" },
  { line: 4, text: "        mid = (left + right) // 2" },
  { line: 5, text: "        node = TreeNode(nums[mid])" },
  { line: 6, text: "        node.left = build(left, mid)" },
  { line: 7, text: "        node.right = build(mid + 1, right)" },
  { line: 8, text: "        return node" },
  { line: 9, text: "    return build(0, len(nums))" },
];

const EXAMPLES = [
  { label: "Example 1", arr: [-10, -3, 0, 5, 9] },
  { label: "Example 2", arr: [0, 1, 2, 3] },
  { label: "Example 3", arr: [1, 2, 3, 4, 5] },
  { label: "Example 4", arr: [-100, -50, 0, 50, 100] },
];

export default function ConvertSortedArrayToBinarySearchTreeVisualizer() {
  const [arrInput, setArrInput] = useState("[-10, -3, 0, 5, 9]");

  const { story, inputError } = useMemo(() => {
    try { return { story: buildSortedArrayStory(arrInput), inputError: '' }; }
    catch(error) { return { story: null, inputError: error.message }; }
  }, [arrInput]);
  const steps = story?.frames ?? [];

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
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  const applyExample = useCallback(
    (ex) => {
      setArrInput(JSON.stringify(ex.arr));
      handleReset();
    },
    [handleReset],
  );

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "arr", label: "arr", type: "array" }]}
        values={{ arr: arrInput }}
        onChange={(k, v) => {
          if (k === "arr") setArrInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      {story && <SortedTreeStory story={story} values={story.values} stepIndex={stepIndex} sourceKind="array" />}
    </>
  );

  const statePanel = (
    <div className="csatbst-panel" style={{ flex: 1 }}>
      <div className="csatbst-panel-head">State</div>
      <div className="csatbst-panel-body">
        <StoryPanel title="Divide by index" description={step?.message ?? "Choose a midpoint, then build its left and right intervals."}><p>Created nodes: {story?.nodes.filter(n=>n.createdAt<=stepIndex).length ?? 0}</p></StoryPanel>
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
        autoScroll={autoScrollCode}
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
    <div className="csatbst-status">
      {step?.message || "Press Play to begin."}
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
        prevDisabled={stepIndex < 0}
        nextDisabled={isDone}
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
    </>
  );

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "Binary Search Tree", dockMode: "split-right" },
      { id: "state", title: "State", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 4: Replace return with portals
  return (
    <div className="vis-shell csatbst-shell">
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
