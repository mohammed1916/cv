import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import CodeTracePanel from "../CodeTracePanel";
import PlaybackControls from "../PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import ManualInputPanel from "./ManualInputPanel";
import FloatingPanel from "./FloatingPanel";
import CodePatternAnnotations from "../CodePatternAnnotations";
import PatternLegend from "../PatternLegend";
import LuminoDockPanel from "../LuminoDockPanel";

function fieldValues(definition, example) {
  const source = example?.values ?? example?.input ?? example ?? {};
  return Object.fromEntries(definition.fields.map(field => [field.key,
    source[field.key] ?? definition.initialValues?.[field.key] ?? field.defaultValue ?? '',
  ]));
}

// The shell owns inputs, docking and playback; each definition owns its algorithm and scene.
export default function AlgorithmStoryWorkspace({ definition }) {
  const {
    code: SOLUTION_CODE,
    linePatterns: LINE_PATTERN_MAP,
    patterns: PATTERNS,
    examples: EXAMPLES,
  } = definition;
  const isMultiField = Boolean(
    definition.fields && definition.fields.length > 0,
  );
  const [inputValues, setInputValues] = useState(() => {
    if (isMultiField) {
      return fieldValues(definition, definition.initialValues ?? EXAMPLES?.[0]);
    }
    return { arr: definition.initialInput };
  });
  const [activeLabel, setActiveLabel] = useState(EXAMPLES?.[0]?.label);

  const { story, inputError } = useMemo(() => {
    try {
      const storyResult = isMultiField
        ? definition.build(inputValues)
        : definition.build(inputValues.arr);
      return { story: storyResult, inputError: "" };
    } catch (error) {
      return { story: null, inputError: error.message };
    }
  }, [inputValues, definition, isMultiField]);
  const steps = story?.frames ?? [];
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
      setActiveLabel(ex.label);
      if (isMultiField) {
        setInputValues(fieldValues(definition, ex));
      } else {
        setInputValues({ arr: ex.input });
      }
      handleReset();
    },
    [handleReset, isMultiField, definition],
  );

  const fields = isMultiField
    ? definition.fields
    : [
        {
          key: "arr",
          label: definition.inputLabel,
          type: definition.inputType ?? "string",
        },
      ];

  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={fields}
        values={inputValues}
        onChange={(key, value) => {
          setActiveLabel("");
          setInputValues((prev) => ({ ...prev, [key]: value }));
          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={activeLabel}
        applyExample={applyExample}
        inputError={inputError}
      />
      {story &&
        definition.renderStory({
          story,
          step: story.frames[Math.max(0, stepIndex)],
          stepIndex,
        })}
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
          activeLine={step?.activeLine}
          activeLineDom={activeLineDom}
        />
      )}
    </div>
  );

  const statusPanel = (
    <div className="story-panel">{step?.message ?? "Press Play to begin."}</div>
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
        <PatternLegend usedPatterns={PATTERNS} currentPhase={step?.phase} />
      )}
    </>
  );

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: definition.title,
        dockMode: "split-right",
        ratio: 0.6,
      },
      {
        id: "code",
        title: "Code",
        dockMode: "split-right",
        ratio: 0.4,
      },
      {
        id: "status",
        title: "Status",
        dockMode: "split-bottom",
        ratio: 0.08,
      },
    ],
    [definition.title],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return block
  return (
    <div className="vis-shell">
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
