import { useState, useMemo, useCallback } from "react";

import { createPortal } from "react-dom";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import FloatingPanel from "../../components/shared/FloatingPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import PointerRail from "../../components/shared/PointerRail";
import PointerStateBand from "../../components/shared/PointerStateBand";
import ProgressBand from "../../components/shared/ProgressBand";
import FrequencyComparison from "../../components/shared/FrequencyComparison";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";

import { getExamples } from "../../config/examplesRegistry";

import "./PermutationInStringVisualizer.css";

const SOLUTION_CODE = [
  {
    line: 1,
    text: "def checkInclusion(s1, s2):",
  },
  {
    line: 2,
    text: "    if len(s1) > len(s2): return False",
  },
  {
    line: 3,
    text: "    need = Counter(s1)",
  },
  {
    line: 4,
    text: "    have = Counter(s2[:len(s1)])",
  },
  {
    line: 5,
    text: "    if have == need: return True",
  },
  {
    line: 6,
    text: "    for i in range(len(s1), len(s2)):",
  },
  {
    line: 7,
    text: "        have[s2[i]] += 1",
  },
  {
    line: 8,
    text: "        out = s2[i - len(s1)]",
  },
  {
    line: 9,
    text: "        have[out] -= 1",
  },
  {
    line: 10,
    text: "        if have[out] == 0: del have[out]",
  },
  {
    line: 11,
    text: "        if have == need: return True",
  },
  {
    line: 12,
    text: "    return False",
  },
];

const EXAMPLES = getExamples("permutation-in-string");

const PHASE_META = {
  initialize: {
    label: "Initialize",
    color: "info",
  },

  expand: {
    label: "Expand",
    color: "primary",
  },

  shrink: {
    label: "Shrink",
    color: "warning",
  },

  compare: {
    label: "Compare",
    color: "info",
  },

  match: {
    label: "Match Found",
    color: "success",
  },

  done: {
    label: "Complete",
    color: "success",
  },
};

function cloneCounter(counter) {
  return { ...counter };
}

function countEq(a, b) {
  const ka = Object.keys(a);
  const kb = Object.keys(b);

  if (ka.length !== kb.length) {
    return false;
  }

  for (const key of ka) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

function generateSteps(s1, s2) {
  const steps = [];

  /*
   * s1 cannot be a permutation contained in a shorter s2.
   */
  if (s1.length > s2.length) {
    steps.push({
      phase: "done",

      left: -1,
      right: -1,

      addedIndex: null,
      removedIndex: null,

      need: {},
      have: {},

      match: false,
      result: false,

      activeLine: 2,

      message: "s1 is longer than s2, so no permutation can exist.",
    });

    return steps;
  }

  /*
   * Empty s1.
   *
   * This also avoids awkward pointer values when there is no
   * window to display.
   */
  if (s1.length === 0) {
    steps.push({
      phase: "match",

      left: -1,
      right: -1,

      addedIndex: null,
      removedIndex: null,

      need: {},
      have: {},

      match: true,
      result: true,

      activeLine: 5,

      message: "The empty string is trivially contained.",
    });

    return steps;
  }

  /*
   * Build required frequencies.
   */
  const need = {};

  for (const char of s1) {
    need[char] = (need[char] || 0) + 1;
  }

  /*
   * Build initial fixed-size window.
   */
  const have = {};

  for (let i = 0; i < s1.length; i++) {
    const char = s2[i];

    have[char] = (have[char] || 0) + 1;
  }

  steps.push({
    phase: "initialize",

    left: 0,
    right: s1.length - 1,

    addedIndex: null,
    removedIndex: null,

    need: cloneCounter(need),
    have: cloneCounter(have),

    match: false,
    result: null,

    activeLine: 4,

    message: `Create the initial window s2[0..${s1.length - 1}].`,
  });

  /*
   * Compare initial window.
   */
  const initialMatch = countEq(have, need);

  steps.push({
    phase: initialMatch ? "match" : "compare",

    left: 0,
    right: s1.length - 1,

    addedIndex: null,
    removedIndex: null,

    need: cloneCounter(need),
    have: cloneCounter(have),

    match: initialMatch,
    result: initialMatch ? true : null,

    activeLine: 5,

    message: initialMatch
      ? "The initial window has exactly the required frequencies."
      : "The initial window does not match s1.",
  });

  if (initialMatch) {
    return steps;
  }

  /*
   * Slide the fixed-size window.
   */
  for (let right = s1.length; right < s2.length; right++) {
    const previousLeft = right - s1.length;

    const nextLeft = previousLeft + 1;

    const addedChar = s2[right];

    /*
     * EXPAND
     *
     * Temporarily the visual range contains one extra
     * character. This makes the window movement easy to see.
     */
    have[addedChar] = (have[addedChar] || 0) + 1;

    steps.push({
      phase: "expand",

      left: previousLeft,
      right,

      addedIndex: right,
      removedIndex: null,

      need: cloneCounter(need),
      have: cloneCounter(have),

      match: false,
      result: null,

      activeLine: 7,

      message: `Add '${addedChar}' at index ${right}.`,
    });

    /*
     * SHRINK
     */
    const removedIndex = previousLeft;

    const removedChar = s2[removedIndex];

    have[removedChar]--;

    if (have[removedChar] === 0) {
      delete have[removedChar];
    }

    steps.push({
      phase: "shrink",

      left: nextLeft,
      right,

      addedIndex: null,
      removedIndex,

      need: cloneCounter(need),
      have: cloneCounter(have),

      match: false,
      result: null,

      activeLine: have[removedChar] == null ? 10 : 9,

      message: `Remove '${removedChar}' at index ${removedIndex}.`,
    });

    /*
     * COMPARE
     */
    const match = countEq(have, need);

    steps.push({
      phase: match ? "match" : "compare",

      left: nextLeft,
      right,

      addedIndex: null,
      removedIndex: null,

      need: cloneCounter(need),
      have: cloneCounter(have),

      match,
      result: match ? true : null,

      activeLine: 11,

      message: match
        ? `Window [${nextLeft}..${right}] matches s1.`
        : `Window [${nextLeft}..${right}] does not match s1.`,
    });

    if (match) {
      return steps;
    }
  }

  /*
   * No window matched.
   */
  steps.push({
    phase: "done",

    left: s2.length >= s1.length ? s2.length - s1.length : -1,

    right: s2.length > 0 ? s2.length - 1 : -1,

    addedIndex: null,
    removedIndex: null,

    need: cloneCounter(need),
    have: cloneCounter(have),

    match: false,
    result: false,

    activeLine: 12,

    message: "All windows were checked. No permutation was found.",
  });

  return steps;
}

export default function PermutationInStringVisualizer() {
  const initialExample = EXAMPLES[0] ?? {
    label: "Default",
    s1: "ab",
    s2: "eidbaooo",
  };

  /*
   * ------------------------------------------------------------
   * Input
   * ------------------------------------------------------------
   */

  const [ex, setEx] = useState(initialExample);

  const [s1Input, setS1Input] = useState(String(initialExample.s1 ?? "ab"));

  const [s2Input, setS2Input] = useState(
    String(initialExample.s2 ?? "eidbaooo"),
  );

  const { s1, s2, inputError } = useMemo(() => {
    try {
      return {
        s1: s1Input,
        s2: s2Input,
        inputError: "",
      };
    } catch (error) {
      return {
        s1: "",
        s2: "",
        inputError: error instanceof Error ? error.message : "Invalid input",
      };
    }
  }, [s1Input, s2Input]);

  /*
   * ------------------------------------------------------------
   * Steps
   * ------------------------------------------------------------
   */

  const steps = useMemo(() => {
    if (inputError) {
      return [];
    }

    try {
      return generateSteps(s1, s2);
    } catch {
      return [];
    }
  }, [s1, s2, inputError]);

  /*
   * ------------------------------------------------------------
   * Playback
   * ------------------------------------------------------------
   */

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

  /*
   * ------------------------------------------------------------
   * Input handlers
   * ------------------------------------------------------------
   */

  const applyEx = useCallback(
    (example) => {
      setEx(example);

      setS1Input(String(example.s1 ?? ""));

      setS2Input(String(example.s2 ?? ""));

      handleReset();
    },
    [handleReset],
  );

  const handleInputChange = useCallback(
    (key, value) => {
      /*
       * A manual change means the current values no
       * longer necessarily correspond to an example.
       */
      setEx(null);

      if (key === "s1") {
        setS1Input(value);
      }

      if (key === "s2") {
        setS2Input(value);
      }

      handleReset();
    },
    [handleReset],
  );

  /*
   * ------------------------------------------------------------
   * Pattern overlay
   * ------------------------------------------------------------
   */

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  /*
   * ------------------------------------------------------------
   * Code ↔ visualization connectivity
   * ------------------------------------------------------------
   */

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  /*
   * ------------------------------------------------------------
   * Progress
   * ------------------------------------------------------------
   */

  const progress =
    steps.length > 0 && stepIndex >= 0
      ? Math.min(100, ((stepIndex + 1) / steps.length) * 100)
      : 0;

  const phaseMeta = step?.phase ? PHASE_META[step.phase] : null;

  /*
   * ------------------------------------------------------------
   * PointerRail
   * ------------------------------------------------------------
   */

  const pointers = useMemo(() => {
    if (!step) {
      return [];
    }

    const result = [];

    if (Number.isFinite(step.left) && step.left >= 0) {
      result.push({
        id: "left",
        label: "L",
        index: step.left,
        tone: step.phase === "shrink" ? "warning" : "primary",
      });
    }

    if (Number.isFinite(step.right) && step.right >= 0) {
      result.push({
        id: "right",
        label: "R",
        index: step.right,
        tone: step.match
          ? "success"
          : step.phase === "expand"
            ? "primary"
            : "warning",
      });
    }

    return result;
  }, [step]);

  const range =
    step && step.left >= 0 && step.right >= 0
      ? {
          start: step.left,
          end: step.right,
        }
      : null;

  /*
   * ============================================================
   * INPUT PANEL
   * ============================================================
   */

  const inputPanel = (
    <div className="pis-input-panel">
      <ManualInputPanel
        fields={[
          {
            key: "s1",
            label: "s1",
            type: "string",
          },
          {
            key: "s2",
            label: "s2",
            type: "string",
          },
        ]}
        values={{
          s1: s1Input,
          s2: s2Input,
        }}
        onChange={handleInputChange}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    </div>
  );

  /*
   * ============================================================
   * CODE PANEL
   * ============================================================
   */

  const codePanel = (
    <CodeTracePanel
      step={step}
      codeLines={SOLUTION_CODE}
      highlightedLines={connectivity.highlightedLines}
      onLineSelect={connectivity.handleLineSelect}
      onActiveLineDomChange={setActiveLineDom}
    />
  );

  /*
   * ============================================================
   * VISUALIZATION PANEL
   * ============================================================
   */

  const vizPanel = (
    <div className="pis-shell">
      <ProgressBand
        progress={progress}
        stepIndex={stepIndex}
        stepCount={steps.length}
        isDone={isDone}
        resultText={
          step?.result === true
            ? "Permutation found"
            : step?.result === false
              ? "No permutation found"
              : undefined
        }
        phaseMeta={phaseMeta}
      />

      <div className="pis-problem-summary">
        <div className="pis-string-summary">
          <span className="pis-string-label">Pattern</span>

          <code>{s1}</code>
        </div>

        <div className="pis-string-summary">
          <span className="pis-string-label">Search string</span>

          <code>{s2}</code>
        </div>
      </div>

      {step && <PointerStateBand step={step} />}

      <PointerRail
        title="Sliding Window"
        values={s2.split("")}
        pointers={pointers}
        range={range}
        note={step?.message ?? "Press Play or step forward to begin."}
      />

      <div className="pis-section">
        <div className="pis-section-heading">Frequency comparison</div>

        <FrequencyComparison
          leftTitle="Need"
          rightTitle="Window"
          left={step?.need ?? {}}
          right={step?.have ?? {}}
          emptyText="Start the visualization to compare frequencies."
        />
      </div>

      {step?.phase === "expand" && step.addedIndex != null && (
        <div className="pis-operation-card add">
          <span className="pis-operation-symbol">+</span>

          <div>
            <strong>Add</strong>

            <span>
              {" "}
              s2[
              {step.addedIndex}] = "{s2[step.addedIndex]}"
            </span>
          </div>
        </div>
      )}

      {step?.phase === "shrink" && step.removedIndex != null && (
        <div className="pis-operation-card remove">
          <span className="pis-operation-symbol">−</span>

          <div>
            <strong>Remove</strong>

            <span>
              {" "}
              s2[
              {step.removedIndex}] = "{s2[step.removedIndex]}"
            </span>
          </div>
        </div>
      )}

      {step?.result != null && (
        <div className={`pis-result ${step.result ? "true" : "false"}`}>
          <span className="pis-result-icon">{step.result ? "✓" : "✗"}</span>

          <span>
            {step.result ? "Permutation found" : "No permutation found"}
          </span>
        </div>
      )}
    </div>
  );

  /*
   * ------------------------------------------------------------
   * Lumino panels
   * ------------------------------------------------------------
   */

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "code",
        title: "Code",
      },
      {
        id: "input",
        title: "Input",
        dockMode: "split-right",
      },
      {
        id: "viz",
        title: "🔍 Sliding Window",
        dockMode: "split-bottom",
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  /*
   * ------------------------------------------------------------
   * Render
   * ------------------------------------------------------------
   */

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}

      {createPortal(
        <FloatingPanel title="Playback Controls">
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
        </FloatingPanel>,
        document.body,
      )}

      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
