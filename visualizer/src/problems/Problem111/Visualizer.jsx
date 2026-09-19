import { createPortal } from "react-dom";
import { useState, useMemo, useCallback } from "react";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./Visualizer.css";
import { buildMinimumDepth, parseMinimumDepth } from "./algorithm";
import MinimumDepthStory, { MinimumDepthComparison } from "./MinimumDepthStory";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 1: "init", 4: "done", 6: "visit", 7: "leaf", 9: "missing_child", 10: "return", 11: "missing_child", 12: "return", 14: "compare" };
const PATTERNS = ["init", "visit", "missing_child", "leaf", "compare", "return", "done"];
const SOLUTION_CODE = [
  { line: 1, text: "def minDepth(root):" },
  { line: 2, text: "    # base case: empty subtree" },
  { line: 3, text: "    if not root:" },
  { line: 4, text: "        return 0" },
  { line: 5, text: "    # leaf node" },
  { line: 6, text: "    if not root.left and not root.right:" },
  { line: 7, text: "        return 1" },
  { line: 8, text: "    # only one child: recurse into the non-empty side" },
  { line: 9, text: "    if not root.left:" },
  { line: 10, text: "        return 1 + minDepth(root.right)" },
  { line: 11, text: "    if not root.right:" },
  { line: 12, text: "        return 1 + minDepth(root.left)" },
  { line: 13, text: "    # two children: take the smaller depth" },
  {
    line: 14,
    text: "    return 1 + min(minDepth(root.left), minDepth(root.right))",
  },
];
const EXAMPLES = [...getExamplesOr("minimum-depth-of-binary-tree", [
  { label: "Unequal routes", arr: [3,9,20,null,null,15,7] },
  { label: "Empty tree", arr: [] },
]), { label: "Missing child trap", arr: [2,null,3,null,4,null,5] }, { label: "Equal routes", arr: [1,1,1] }];

export default function MinimumDepthOfBinaryTreeVisualizer() {
  const [arrInput, setArrInput] = useState("[3,9,20,null,null,15,7]");
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  // Load solution code from registry

  const { run, inputError } = useMemo(() => {
    try { return { run: buildMinimumDepth(parseMinimumDepth(arrInput)), inputError: '' }; }
    catch (error) { return { run: null, inputError: error.message }; }
  }, [arrInput]);
  const steps = useMemo(() => run?.frames || [], [run]);
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

  const applyExample = useCallback(
    (ex) => {
      setArrInput(JSON.stringify(ex.arr));
      handleReset();
    },
    [handleReset],
  );


  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  // Extract panel JSX into consts
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

      <div className="mdbt-panel">
        {run ? <MinimumDepthStory run={run} stepIndex={stepIndex} /> : <p role="alert">Correct the input above to explore the tree.</p>}
      </div>
    </>
  );

  const statePanel = (
    <div className="mdbt-panel">
      <MinimumDepthComparison run={run} stepIndex={stepIndex} />
    </div>
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
          activeLine={step?.activeLine}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  );

  const statusPanel = (
    <div className="mdbt-status">
      <span>
        Step {stepIndex + 1} / {steps.length}
      </span>
    </div>
  );

  const playbackPanel = (
    <>
      <PlaybackControls
        onReset={handleReset}
        onPrev={stepBack}
        onPlayToggle={() => { if (run) togglePlay() }}
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
      {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
    </>
  );

  // Add state + config for Lumino
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "Tree Visualization", dockMode: "split-right" },
      { id: "state", title: "Leaf route comparison", dockMode: "split-right" },
      { id: "code", title: "Code Trace", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell mdbt-shell">
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
