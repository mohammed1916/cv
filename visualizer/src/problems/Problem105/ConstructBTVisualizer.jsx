import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { reconstructTreeStory } from "../../components/shared/reconstructTreeStory";
import ReconstructionStory from "../../components/shared/ReconstructionStory";
import StoryPanel from "../../components/shared/StoryPanel";
import PatternOverlay from "../../components/PatternOverlay";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";
import "./ConstructBTVisualizer.css";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = { 3: "visit", 4: "compare", 5: "update", 6: "visit", 8: "visit", 10: "return" };
const PATTERNS = ["visit", "compare", "update", "return"];
const SOLUTION_CODE = [
  { line: 1, text: "def buildTree(preorder, inorder):" },
  { line: 2, text: "    if not preorder: return None" },
  { line: 3, text: "    root_val = preorder[0]" },
  { line: 4, text: "    mid = inorder.index(root_val)" },
  { line: 5, text: "    root = TreeNode(root_val)" },
  { line: 6, text: "    root.left = buildTree(" },
  { line: 7, text: "        preorder[1:mid+1], inorder[:mid])" },
  { line: 8, text: "    root.right = buildTree(" },
  { line: 9, text: "        preorder[mid+1:], inorder[mid+1:])" },
  { line: 10, text: "    return root" },
];

const EXAMPLES = getExamples("construct-binary-tree");

export default function ConstructBTVisualizer() {
  const [preInput, setPreInput] = useState("[3,9,20,15,7]");
  const [inoInput, setInoInput] = useState("[9,3,15,20,7]");

  const { story, inputError } = useMemo(() => {
    try { return { story: reconstructTreeStory(inoInput, preInput), inputError: '' }; }
    catch(error) { return { story: null, inputError: error.message }; }
  }, [preInput, inoInput]);
  const steps=story?.frames ?? [];

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
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const applyExample = useCallback(
    (ex) => {
      setPreInput(JSON.stringify(ex.pre));
      setInoInput(JSON.stringify(ex.ino));
      handleReset();
    },
    [handleReset],
  );

  // Extract panel consts for Lumino DockPanel
  const inputPanel = (
    <div className="ctpi-panel-body">
      <ManualInputPanel
        fields={[
          { key: "pre", label: "pre", type: "string" },
          { key: "ino", label: "ino", type: "string" },
        ]}
        values={{ pre: preInput, ino: inoInput }}
        onChange={(k, v) => {
          if (k === "pre") setPreInput(v);
          if (k === "ino") setInoInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    </div>
  );

  const arraysPanel = story ? <ReconstructionStory story={story} stepIndex={stepIndex} /> : null;
  const treePanel = <StoryPanel title="Construction proof" description="Each root splits the inorder interval into disjoint left and right subtrees.">
    <p>{story?.nodes.filter(n=>n.createdAt<=stepIndex).length ?? 0}/{story?.nodes.length ?? 0} nodes created.</p>
    <p>{step?.phase==='done'?'Both input traversals are reproduced by the completed tree.':'A subtree is complete only after both child intervals return.'}</p>
  </StoryPanel>;

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
    <div className="ctpi-status-panel">
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
    </div>
  );

  // Panel config for Lumino DockPanel
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "input", title: "Input Playground", dockMode: "split-right" },
      { id: "tree", title: "Tree Visualization", dockMode: "split-right" },
      { id: "arrays", title: "Array Slices", dockMode: "split-bottom" },
      { id: "code", title: "Code Trace", dockMode: "split-bottom" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="vis-shell ctpi-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.tree && createPortal(treePanel, panelDivs.tree)}
          {panelDivs.arrays && createPortal(arraysPanel, panelDivs.arrays)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">
          <div style={{ display: "none" }}>
            {/* floating panel content moved to status panel */}
          </div>
        </FloatingPanel>,
        document.body,
      )}
      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
