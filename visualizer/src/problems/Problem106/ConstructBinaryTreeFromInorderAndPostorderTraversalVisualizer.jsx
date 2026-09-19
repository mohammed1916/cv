import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { reconstructTreeStory } from "../../components/shared/reconstructTreeStory";
import ReconstructionStory from "../../components/shared/ReconstructionStory";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./ConstructBinaryTreeFromInorderAndPostorderTraversalVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 3: "visit", 4: "update", 5: "compare", 6: "visit", 9: "visit", 12: "return" };
const PATTERNS = ["visit", "compare", "update", "return"];
const EXAMPLES = getExamplesOr(
  "construct-binary-tree-from-inorder-and-postorder-traversal",
  [
    {
      label: "Example 1",
      inorder: [9, 3, 15, 20, 7],
      postorder: [9, 15, 7, 20, 3],
    },
    { label: "Example 2", inorder: [1], postorder: [1] },
  ],
);

const SOLUTION_CODE_INLINE = [
  { line: 1, text: "def buildTree(inorder, postorder):" },
  { line: 2, text: "    if not inorder: return None" },
  { line: 3, text: "    root_val = postorder[-1]" },
  { line: 4, text: "    root = TreeNode(root_val)" },
  { line: 5, text: "    root_idx = inorder.index(root_val)" },
  { line: 6, text: "    root.left = buildTree(" },
  { line: 7, text: "        inorder[:root_idx]," },
  { line: 8, text: "        postorder[:root_idx])" },
  { line: 9, text: "    root.right = buildTree(" },
  { line: 10, text: "        inorder[root_idx+1:]," },
  { line: 11, text: "        postorder[root_idx:-1])" },
  { line: 12, text: "    return root" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE;

export default function ConstructBinaryTreeFromInorderAndPostorderTraversalVisualizer() {
  const [inorderInput, setInorderInput] = useState("[9,3,15,20,7]");
  const [postorderInput, setPostorderInput] = useState("[9,15,7,20,3]");
  const { story, inputError } = useMemo(() => {
    try { return { story: reconstructTreeStory(inorderInput, postorderInput, 'postorder'), inputError: '' }; }
    catch(error) { return { story: null, inputError: error.message }; }
  }, [inorderInput, postorderInput]);
  const steps=story?.frames ?? [];

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
      setInorderInput(JSON.stringify(e.inorder));
      setPostorderInput(JSON.stringify(e.postorder));
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

  // Step 2: Extract panel consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[
          { key: "inorder", label: "inorder", type: "array" },
          { key: "postorder", label: "postorder", type: "array" },
        ]}
        values={{ inorder: inorderInput, postorder: postorderInput }}
        onChange={(k, v) => {
          if (k === "inorder") setInorderInput(v);
          if (k === "postorder") setPostorderInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
      <div className="cbtipt-panel">
        {story && <ReconstructionStory story={story} stepIndex={stepIndex} />}
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
        <CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLine={step?.activeLine} activeLineDom={activeLineDom} />
      )}
    </div>
  );

  const statusPanel = (
    <div className="cbtipt-status">
      {step?.message && <span>{step.message}</span>}
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

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "primary", title: "🌳 Tree Construction", dockMode: "split-right" },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 4: Replace return with portals
  return (
    <div className="vis-shell cbtipt-shell">
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
