import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";

import { getExamples } from "../../config/examplesRegistry";

import "./NextPermutationVisualizer.css";

const SOLUTION_CODE = [
  { line: 1, text: "def nextPermutation(nums):" },
  { line: 2, text: "    i = len(nums) - 2" },
  { line: 3, text: "    while i >= 0 and nums[i] >= nums[i+1]:" },
  { line: 4, text: "        i -= 1" },
  { line: 5, text: "    if i >= 0:" },
  { line: 6, text: "        j = len(nums) - 1" },
  { line: 7, text: "        while nums[j] <= nums[i]:" },
  { line: 8, text: "            j -= 1" },
  { line: 9, text: "        nums[i], nums[j] = nums[j], nums[i]" },
  { line: 10, text: "    nums[i+1:] = reversed(nums[i+1:])" },
  { line: 11, text: "    return nums" },
];

const PATTERNS = [
  "find-pivot",
  "found-pivot",
  "found-swap",
  "swapped",
  "reverse",
  "done",
];

const LINE_PATTERN_MAP = {
  2: "find-pivot",
  3: "find-pivot",
  4: "find-pivot",
  5: "found-pivot",
  8: "found-swap",
  9: "swapped",
  10: "reverse",
  11: "done",
};

const EXAMPLES = getExamples("next-permutation");

function generateSteps(input) {
  const nums = [...input];
  const steps = [];
  const n = nums.length;

  let i = n - 2;

  steps.push({
    activeLine: 2,
    nums: [...nums],
    i,
    j: -1,
    pivotI: -1,
    swapJ: -1,
    reverseStart: -1,
    phase: "find-pivot",
    message:
      `Start: find the rightmost i where nums[i] < nums[i+1]. ` +
      `Start with i=${i}.`,
  });

  while (i >= 0 && nums[i] >= nums[i + 1]) {
    steps.push({
      activeLine: 3,
      nums: [...nums],
      i,
      j: -1,
      pivotI: -1,
      swapJ: -1,
      reverseStart: -1,
      phase: "find-pivot",
      message:
        `nums[${i}]=${nums[i]} >= ` +
        `nums[${i + 1}]=${nums[i + 1]}, so decrement i.`,
    });

    i--;
  }

  /*
   * No pivot means the permutation is currently the
   * largest possible permutation.
   *
   * Reversing it gives the smallest permutation.
   */
  if (i < 0) {
    nums.reverse();

    steps.push({
      activeLine: 10,
      nums: [...nums],
      i: -1,
      j: -1,
      pivotI: -1,
      swapJ: -1,
      reverseStart: 0,
      phase: "reverse",
      message:
        `No pivot exists because the array is fully descending. ` +
        `Reverse the entire array → [${nums.join(", ")}].`,
    });

    steps.push({
      activeLine: 11,
      nums: [...nums],
      i: -1,
      j: -1,
      pivotI: -1,
      swapJ: -1,
      reverseStart: -1,
      phase: "done",
      message: `Done. Next permutation: [${nums.join(", ")}].`,
    });

    return steps;
  }

  steps.push({
    activeLine: 5,
    nums: [...nums],
    i,
    j: -1,
    pivotI: i,
    swapJ: -1,
    reverseStart: -1,
    phase: "found-pivot",
    message: `Pivot found at index ${i}: nums[${i}]=${nums[i]}.`,
  });

  /*
   * Find the rightmost value greater than the pivot.
   */
  let j = n - 1;

  while (nums[j] <= nums[i]) {
    j--;
  }

  steps.push({
    activeLine: 8,
    nums: [...nums],
    i,
    j,
    pivotI: i,
    swapJ: j,
    reverseStart: -1,
    phase: "found-swap",
    message:
      `Swap target found at index ${j}: ` +
      `nums[${j}]=${nums[j]} > nums[${i}]=${nums[i]}.`,
  });

  /*
   * Swap the pivot and the chosen successor.
   */
  [nums[i], nums[j]] = [nums[j], nums[i]];

  steps.push({
    activeLine: 9,
    nums: [...nums],
    i,
    j,
    pivotI: i,
    swapJ: j,
    reverseStart: -1,
    phase: "swapped",
    message: `Swap nums[${i}] and nums[${j}] → ` + `[${nums.join(", ")}].`,
  });

  /*
   * Reverse the suffix so that it becomes the smallest
   * possible ordering after the pivot.
   */
  let lo = i + 1;
  let hi = n - 1;

  while (lo < hi) {
    [nums[lo], nums[hi]] = [nums[hi], nums[lo]];

    lo++;
    hi--;
  }

  steps.push({
    activeLine: 10,
    nums: [...nums],
    i,
    j,
    pivotI: i,
    swapJ: -1,
    reverseStart: i + 1,
    phase: "reverse",
    message:
      `Reverse the suffix starting at index ${i + 1} → ` +
      `[${nums.join(", ")}].`,
  });

  steps.push({
    activeLine: 11,
    nums: [...nums],
    i: -1,
    j: -1,
    pivotI: -1,
    swapJ: -1,
    reverseStart: -1,
    phase: "done",
    message: `Done. Next permutation: [${nums.join(", ")}].`,
  });

  return steps;
}

function cellClass(idx, step) {
  if (!step) {
    return "";
  }

  if (step.pivotI === idx) {
    return "pivot";
  }

  if (step.swapJ === idx) {
    return "swap";
  }

  if (step.reverseStart >= 0 && idx >= step.reverseStart) {
    return "reversed";
  }

  return "";
}

function ArrayVisualizationPanel({ step, exampleNums }) {
  const displayedNums = step?.nums ?? exampleNums;

  return (
    <div className="np-array-visualization">
      <div className="np-panel-label">Array</div>

      <div className="np-array-row">
        <AnimatePresence mode="popLayout">
          {displayedNums.map((val, idx) => (
            <motion.div
              key={idx}
              layout
              className={`np-cell ${cellClass(idx, step)}`}
              animate={{
                y: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
              }}
            >
              {val}

              <div className="np-idx">{idx}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="np-legend">
        <span className="np-leg pivot">■ pivot (i)</span>

        <span className="np-leg swap">■ swap target (j)</span>

        <span className="np-leg reversed">■ reversed suffix</span>
      </div>
    </div>
  );
}

function StatusPanel({ step }) {
  return (
    <div className="np-status-message">
      {step?.message ?? "Press Play to begin."}
    </div>
  );
}

export default function NextPermutationVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);

  const [numsInput, setNumsInput] = useState(
    EXAMPLES[0]?.nums ? JSON.stringify(EXAMPLES[0].nums) : "[1,2,3]",
  );

  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput);

      if (!Array.isArray(parsedNums)) {
        throw new Error("nums must be an array");
      }

      return {
        nums: parsedNums,
        inputError: "",
      };
    } catch (error) {
      return {
        nums: [],
        inputError: error instanceof Error ? error.message : String(error),
      };
    }
  }, [numsInput]);

  const steps = useMemo(() => generateSteps(nums), [nums]);

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

  const applyEx = useCallback(
    (example) => {
      setEx(example);

      setNumsInput(JSON.stringify(example.nums));

      handleReset();
    },
    [handleReset],
  );

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  /*
   * INPUT + ARRAY PANEL
   *
   * ManualInputPanel is now the ONLY place where
   * examples are rendered.
   */
  const arrayPanel = (
    <div className="np-panel">
      <ManualInputPanel
        fields={[
          {
            key: "nums",
            label: "nums",
            type: "array",
          },
        ]}
        values={{
          nums: numsInput,
        }}
        onChange={(key, value) => {
          /*
           * Manual editing means we are no longer
           * using one of the predefined examples.
           */
          setEx(null);

          if (key === "nums") {
            setNumsInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />

      <ArrayVisualizationPanel step={step} exampleNums={nums} />
    </div>
  );

  /*
   * CODE TRACE PANEL
   */
  const codePanel = (
    <div
      style={{
        position: "relative",
        height: "100%",
      }}
    >
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
        autoScroll={autoScrollCode}
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

  /*
   * STATUS PANEL
   */
  const statusPanel = (
    <div className="np-status">
      <StatusPanel step={step} />
    </div>
  );

  /*
   * FLOATING PLAYBACK PANEL
   */
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
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
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

  const [panelDivs, setPanelDivs] = useState(null);

  /*
   * There is NO separate Examples panel anymore.
   *
   * Examples belong to ManualInputPanel inside the
   * Array Visualization panel.
   */
  const panelConfigs = useMemo(
    () => [
      {
        id: "array",
        title: "Array Visualization",
        dockMode: "split-right",
      },
      {
        id: "code",
        title: "Code Trace",
        dockMode: "split-right",
      },
      {
        id: "status",
        title: "Status",
        dockMode: "split-bottom",
        ratio: 0.08,
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  return (
    <div className="np-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.array && createPortal(arrayPanel, panelDivs.array)}

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
