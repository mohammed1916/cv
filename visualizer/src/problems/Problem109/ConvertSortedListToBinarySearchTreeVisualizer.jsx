import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { parseSortedList, buildSortedListStory } from "./algorithm";
import ListToTreeStory from "./ListToTreeStory";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./ConvertSortedListToBinarySearchTreeVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 3: "return", 4: "compare", 5: "update", 6: "visit", 7: "visit", 8: "return", 12: "visit", 14: "done" };
const PATTERNS = ["visit", "compare", "update", "return", "done"];
const EXAMPLES = getExamplesOr("convert-sorted-list-to-binary-search-tree", [
  { label: "Example 1", list: [1, 2, 3, 4, 5, 6] },
  { label: "Example 2", list: [-10, -3, 0, 5, 9] },
  { label: "Example 3", list: [] },
]);

const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def sortedListToBST(head):" },
  { line: 2, text: "    def build(nodes):" },
  { line: 3, text: "        if not nodes: return None" },
  { line: 4, text: "        mid = len(nodes) // 2" },
  { line: 5, text: "        node = TreeNode(nodes[mid])" },
  { line: 6, text: "        node.left = build(nodes[:mid])" },
  { line: 7, text: "        node.right = build(nodes[mid+1:])" },
  { line: 8, text: "        return node" },
  { line: 9, text: "    nodes = []" },
  { line: 10, text: "    curr = head" },
  { line: 11, text: "    while curr:" },
  { line: 12, text: "        nodes.append(curr.val)" },
  { line: 13, text: "        curr = curr.next" },
  { line: 14, text: "    return build(nodes)" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE;

export default function ConvertSortedListToBinarySearchTreeVisualizer() {
  const [listInput, setListInput] = useState("[1, 2, 3, 4, 5, 6]");

  const { list, inputError } = useMemo(() => {
    try {
      return { list: parseSortedList(listInput), inputError: "" };
    } catch (e) {
      return { list: [], inputError: e.message };
    }
  }, [listInput]);

  const story = useMemo(() => buildSortedListStory(list), [list]);
  const steps = inputError ? [] : story.frames;

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

  const applyExample = useCallback(
    (ex) => {
      setListInput(JSON.stringify(ex.list));
      handleReset();
    },
    [handleReset],
  );

  // Extract panel consts
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
          activeLine={step?.activeLine}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  );

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "list", label: "list", type: "array" }]}
        values={{ list: listInput }}
        onChange={(k, v) => {
          if (k === "list") setListInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      {!inputError && <ListToTreeStory story={story} values={list} stepIndex={stepIndex} />}
    </>
  );

  const statusPanel = (
    <div className="cslbtbst-status">
      <div style={{ fontSize: 11, color: "#627794", padding: "4px 8px" }}>
        Step {stepIndex >= 0 ? stepIndex + 1 : 0} / {steps.length}
      </div>
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
      {showPatternOverlay && <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />}
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "🌳 List to BST", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-bottom" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell cslbtbst-shell">
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
      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
