import { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { generateSteps } from "./algorithm";
import WaterContainerStory from "./WaterContainerStory";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";
import "./ContainerWithMostWaterVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import PointerRail from "../../components/shared/PointerRail";

const CMW_PATTERNS = ["init", "compute", "update", "skip", "move"];

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: "init", // left, right = 0, len(height) - 1
  4: "init", // max_area = 0
  5: "compute", // while left < right:
  6: "compute", // area = min(height[left], height[right]) * (right - left)
  7: "update", // max_area = max(max_area, area)
  8: "skip", // if height[left] < height[right]:
  9: "move", // left += 1
  10: "skip", // else:
  11: "move", // right -= 1
  12: "compute", // return max_area
};

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  { line: 2, text: "    def maxArea(self, height: List[int]) -> int:" },
  { line: 3, text: "        left, right = 0, len(height) - 1" },
  { line: 4, text: "        max_area = 0" },
  { line: 5, text: "        while left < right:" },
  {
    line: 6,
    text: "            area = min(height[left], height[right]) * (right - left)",
  },
  { line: 7, text: "            max_area = max(max_area, area)" },
  { line: 8, text: "            if height[left] < height[right]:" },
  { line: 9, text: "                left += 1" },
  { line: 10, text: "            else:" },
  { line: 11, text: "                right -= 1" },
  { line: 12, text: "        return max_area" },
];

const EXAMPLES = getExamples("container-with-most-water");

export default function ContainerWithMostWaterVisualizer() {
  const [heightInput, setHeightInput] = useState("[1, 8, 6, 2, 5, 4, 8, 3, 7]");
  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { height, inputError } = useMemo(() => {
    try {
      const h = JSON.parse(heightInput);
      if (!Array.isArray(h) || h.some((x) => !Number.isSafeInteger(x) || x < 0 || x > 10000))
        throw new Error();
      if (h.length < 2) throw new Error("Array must have at least 2 elements");
      return { height: h, inputError: "" };
    } catch {
      return {
        height: [],
        inputError: "Invalid input array",
      };
    }
  }, [heightInput]);

  const steps = useMemo(
    () =>
      (inputError ? [] : generateSteps(height)).map((current) => ({
        ...current,
        relatedLines:
          current.relatedLines ??
          (current.activeLine != null ? [current.activeLine] : []),
      })),
    [height, inputError],
  );

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
      setHeightInput(JSON.stringify(ex.height));
      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  // Extract panels into consts (Step 3)
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{ key: "height", label: "height", type: "array" }]}
        values={{ height: heightInput }}
        onChange={(k, v) => {
          if (k === "height") setHeightInput(v);
          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div className="vis-panel cw-panel">
        <div className="vis-panel-head cw-panel-head">
          Input Array (Heights)
          {inputError && (
            <span style={{ color: "#ea0c0c", marginLeft: 8 }}>
              {inputError}
            </span>
          )}
        </div>
        <div className="vis-panel-body cw-panel-body">
          <PointerRail
            title="Two-pointer lane"
            values={height}
            pointers={
              step
                ? [
                    {
                      id: "left",
                      label: `L ${step.left}`,
                      index: step.left,
                      tone: "info",
                    },
                    {
                      id: "right",
                      label: `R ${step.right}`,
                      index: step.right,
                      tone: "warning",
                    },
                  ]
                : []
            }
            range={step ? { start: step.left, end: step.right } : null}
            note={
              step?.phase === "move"
                ? step.message
                : "The shorter wall moves inward; the wider container is already being considered."
            }
          />

          {!inputError && <WaterContainerStory heights={height} step={step} />}
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

  const statePanel = (
    <div className="vis-panel cw-panel">
      <div className="vis-panel-head cw-panel-head">Variables</div>
      <div className="vis-panel-body cw-panel-body">
        <div className="cw-vars">
          <div className="cw-var-row">
            <span className="cw-var-name">left</span>
            <span className="cw-var-val">{step?.left ?? "–"}</span>
          </div>
          <div className="cw-var-row">
            <span className="cw-var-name">right</span>
            <span className="cw-var-val">{step?.right ?? "–"}</span>
          </div>
          <div className="cw-var-row">
            <span className="cw-var-name">height[left]</span>
            <span className="cw-var-val">{step ? height[step.left] : "–"}</span>
          </div>
          <div className="cw-var-row">
            <span className="cw-var-name">height[right]</span>
            <span className="cw-var-val">
              {step ? height[step.right] : "–"}
            </span>
          </div>
          <div className="cw-var-row">
            <span className="cw-var-name">current_area</span>
            <span className="cw-var-val">{step?.currentArea ?? "–"}</span>
          </div>
          <div className="cw-var-row" style={{ borderColor: "#22c55e" }}>
            <span className="cw-var-name">max_area</span>
            <span className="cw-var-val highlight">{step?.maxArea ?? "–"}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const statusPanel = (
    <div className={`cw-status ${step?.phase === "update" ? "found" : ""}`}>
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
        <PatternLegend currentPhase={step?.phase} usedPatterns={CMW_PATTERNS} />
      )}
    </>
  );

  // State + config for Lumino (Step 4)
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: "Input Array (Heights)",
        dockMode: "split-right",
      },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "state", title: "Variables", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Replace return with portals (Step 5)
  return (
    <div className="vis-shell container-water-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
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
