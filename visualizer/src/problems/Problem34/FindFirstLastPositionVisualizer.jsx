import { useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";
import "./FindFirstLastPositionVisualizer.css";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import WeightedComparison from "../../components/shared/WeightedComparison";

const SOLUTION_CODE = [
  { line: 1, text: "class Solution:" },
  {
    line: 2,
    text: "    def searchRange(self, nums: List[int], target: int) -> List[int]:",
  },
  { line: 3, text: "        def findFirst(target):" },
  { line: 4, text: "            left, right = 0, len(nums) - 1" },
  { line: 5, text: "            res = -1" },
  { line: 6, text: "            while left <= right:" },
  { line: 7, text: "                mid = left + (right - left) // 2" },
  { line: 8, text: "                if nums[mid] == target:" },
  { line: 9, text: "                    res = mid" },
  {
    line: 10,
    text: "                    right = mid - 1  # keep searching left",
  },
  { line: 11, text: "                elif nums[mid] < target:" },
  { line: 12, text: "                    left = mid + 1" },
  { line: 13, text: "                else:" },
  { line: 14, text: "                    right = mid - 1" },
  { line: 15, text: "            return res" },
  { line: 16, text: "" },
  { line: 17, text: "        def findLast(target):" },
  { line: 18, text: "            left, right = 0, len(nums) - 1" },
  { line: 19, text: "            res = -1" },
  { line: 20, text: "            while left <= right:" },
  { line: 21, text: "                mid = left + (right - left) // 2" },
  { line: 22, text: "                if nums[mid] == target:" },
  { line: 23, text: "                    res = mid" },
  {
    line: 24,
    text: "                    left = mid + 1  # keep searching right",
  },
  { line: 25, text: "                elif nums[mid] < target:" },
  { line: 26, text: "                    left = mid + 1" },
  { line: 27, text: "                else:" },
  { line: 28, text: "                    right = mid - 1" },
  { line: 29, text: "            return res" },
  { line: 30, text: "" },
  { line: 31, text: "        return [findFirst(target), findLast(target)]" },
];

const FINDFIRSTLASTPOSITION_PATTERNS = [
  "calc_mid_first",
  "calc_mid_last",
  "check_greater_first",
  "check_greater_last",
  "check_less_first",
  "check_less_last",
  "check_target_first",
  "check_target_last",
  "done",
  "done_first",
  "done_last",
  "found_target_first",
  "found_target_last",
  "init_first",
  "init_last",
  "search_left_first",
  "search_right_last",
  "update_left_first",
  "update_left_last",
  "update_right_first",
  "update_right_last",
  "while_check_first",
  "while_check_last",
];

const LINE_PATTERN_MAP = {
  3: "init_first",
  6: "while_check_first",
  7: "calc_mid_first",
  8: "check_target_first",
  9: "found_target_first",
  10: "search_left_first",
  11: "check_less_first",
  12: "update_left_first",
  13: "check_greater_first",
  14: "update_right_first",
  15: "done_first",

  17: "init_last",
  20: "while_check_last",
  21: "calc_mid_last",
  22: "check_target_last",
  23: "found_target_last",
  24: "search_right_last",
  25: "check_less_last",
  26: "update_left_last",
  27: "check_greater_last",
  28: "update_right_last",

  31: "done",
};

function createWindowComparison(left, right, mode) {
  return {
    title:
      mode === "first"
        ? "Can first-position search continue?"
        : "Can last-position search continue?",

    subtitle: "Binary search continues while left ≤ right.",

    operands: [
      {
        id: "left-index",
        label: "left",
        value: left,
        tone: "lo",
        active: true,
      },
      {
        id: "right-index",
        label: "right",
        value: right,
        tone: "hi",
        active: true,
      },
    ],

    operators: ["<="],

    result: left <= right,
  };
}

function createTargetComparison(nums, mid, target) {
  return {
    title: "Compare midpoint with target",
    subtitle: "Check whether nums[mid] equals target.",

    operands: [
      {
        id: "mid-value",
        label: "nums[mid]",
        sublabel: `index ${mid}`,
        value: nums[mid],
        tone: "mid",
        active: true,
      },
      {
        id: "target",
        label: "target",
        value: target,
        tone: "target",
        active: true,
      },
    ],

    operators: ["=="],

    result: nums[mid] === target,
  };
}

function createLessComparison(nums, mid, target) {
  return {
    title: "Which direction contains the target?",
    subtitle: "Check whether nums[mid] is below the target.",

    operands: [
      {
        id: "mid-value",
        label: "nums[mid]",
        sublabel: `index ${mid}`,
        value: nums[mid],
        tone: "mid",
        active: true,
      },
      {
        id: "target",
        label: "target",
        value: target,
        tone: "target",
        active: true,
      },
    ],

    operators: ["<"],

    result: nums[mid] < target,
  };
}

function createGreaterComparison(nums, mid, target) {
  return {
    title: "Which direction contains the target?",
    subtitle: "nums[mid] is above the target, so search left.",

    operands: [
      {
        id: "mid-value",
        label: "nums[mid]",
        sublabel: `index ${mid}`,
        value: nums[mid],
        tone: "mid",
        active: true,
      },
      {
        id: "target",
        label: "target",
        value: target,
        tone: "target",
        active: true,
      },
    ],

    operators: [">"],

    result: nums[mid] > target,
  };
}

function generateSteps(nums, target) {
  const steps = [];

  if (!nums || nums.length === 0) {
    steps.push({
      phase: "done",
      left: 0,
      right: -1,
      mid: null,
      mode: "done",

      activeLine: 31,

      message: "Array is empty. Return [-1, -1].",

      firstPos: -1,
      lastPos: -1,

      result: [-1, -1],
      comparison: null,
    });

    return steps;
  }

  let left = 0;
  let right = nums.length - 1;
  let firstPos = -1;

  /*
   * =========================================================
   * FIND FIRST
   * =========================================================
   */

  steps.push({
    phase: "init_first",

    left,
    right,
    mid: null,

    mode: "first",

    activeLine: 3,

    message:
      `Finding first occurrence of ${target}. ` +
      `Initialize left = ${left}, right = ${right}.`,

    firstPos: -1,
    lastPos: -1,

    comparison: null,
  });

  while (left <= right) {
    steps.push({
      phase: "while_check_first",

      left,
      right,
      mid: null,

      mode: "first",

      activeLine: 6,

      message: `left (${left}) ≤ right (${right}), so the first-position search continues.`,

      firstPos,
      lastPos: -1,

      comparison: createWindowComparison(left, right, "first"),
    });

    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      phase: "calc_mid_first",

      left,
      right,
      mid,

      mode: "first",

      activeLine: 7,

      message:
        `mid = ${left} + (${right} - ${left}) // 2 = ${mid}. ` +
        `nums[mid] = ${nums[mid]}.`,

      firstPos,
      lastPos: -1,

      comparison: null,
    });

    const isTarget = nums[mid] === target;

    steps.push({
      phase: "check_target_first",

      left,
      right,
      mid,

      mode: "first",

      activeLine: 8,

      message: isTarget
        ? `nums[${mid}] = ${nums[mid]} equals target ${target}.`
        : `nums[${mid}] = ${nums[mid]} does not equal target ${target}.`,

      firstPos,
      lastPos: -1,

      comparison: createTargetComparison(nums, mid, target),
    });

    if (isTarget) {
      firstPos = mid;

      steps.push({
        phase: "found_target_first",

        left,
        right,
        mid,

        mode: "first",

        activeLine: 9,

        message:
          `Target found at index ${mid}. ` +
          `Record ${mid} as the current first-position candidate.`,

        firstPos,
        lastPos: -1,

        candidateIndex: mid,
        candidateType: "first",

        comparison: null,
      });

      const previousRight = right;
      const nextRight = mid - 1;

      steps.push({
        phase: "search_left_first",

        left,
        right: nextRight,
        mid,

        previousLeft: left,
        previousRight,

        mode: "first",

        activeLine: 10,

        message:
          `A match was found, but there may be an earlier one. ` +
          `Move right from ${previousRight} to ${nextRight}.`,

        firstPos,
        lastPos: -1,

        candidateIndex: firstPos,
        candidateType: "first",

        eliminatedStart: mid,
        eliminatedEnd: previousRight,

        searchDirection: "left",

        comparison: null,
      });

      right = nextRight;
    } else if (nums[mid] < target) {
      steps.push({
        phase: "check_less_first",

        left,
        right,
        mid,

        mode: "first",

        activeLine: 11,

        message:
          `nums[${mid}] = ${nums[mid]} < target ${target}. ` +
          `Target must lie to the right.`,

        firstPos,
        lastPos: -1,

        comparison: createLessComparison(nums, mid, target),
      });

      const previousLeft = left;
      const nextLeft = mid + 1;

      left = nextLeft;

      steps.push({
        phase: "update_left_first",

        left,
        right,
        mid,

        previousLeft,
        previousRight: right,

        mode: "first",

        activeLine: 12,

        message:
          `Discard indices ${previousLeft}..${mid}. ` + `Move left to ${left}.`,

        firstPos,
        lastPos: -1,

        eliminatedStart: previousLeft,
        eliminatedEnd: mid,

        searchDirection: "right",

        comparison: null,
      });
    } else {
      steps.push({
        phase: "check_greater_first",

        left,
        right,
        mid,

        mode: "first",

        activeLine: 13,

        message:
          `nums[${mid}] = ${nums[mid]} > target ${target}. ` +
          `Target must lie to the left.`,

        firstPos,
        lastPos: -1,

        comparison: createGreaterComparison(nums, mid, target),
      });

      const previousRight = right;
      const nextRight = mid - 1;

      right = nextRight;

      steps.push({
        phase: "update_right_first",

        left,
        right,
        mid,

        previousLeft: left,
        previousRight,

        mode: "first",

        activeLine: 14,

        message:
          `Discard indices ${mid}..${previousRight}. ` +
          `Move right to ${right}.`,

        firstPos,
        lastPos: -1,

        eliminatedStart: mid,
        eliminatedEnd: previousRight,

        searchDirection: "left",

        comparison: null,
      });
    }
  }

  steps.push({
    phase: "done_first",

    left,
    right,
    mid: null,

    mode: "first",

    activeLine: 15,

    message:
      firstPos >= 0
        ? `First-position search complete. Earliest occurrence is index ${firstPos}.`
        : `First-position search complete. Target was not found.`,

    firstPos,
    lastPos: -1,

    candidateIndex: firstPos >= 0 ? firstPos : null,

    candidateType: "first",

    comparison: createWindowComparison(left, right, "first"),
  });

  /*
   * =========================================================
   * FIND LAST
   * =========================================================
   */

  left = 0;
  right = nums.length - 1;

  let lastPos = -1;

  steps.push({
    phase: "init_last",

    left,
    right,
    mid: null,

    mode: "last",

    activeLine: 17,

    message:
      `Finding last occurrence of ${target}. ` +
      `Reset left = ${left}, right = ${right}.`,

    firstPos,
    lastPos: -1,

    candidateIndex: null,

    comparison: null,
  });

  while (left <= right) {
    steps.push({
      phase: "while_check_last",

      left,
      right,
      mid: null,

      mode: "last",

      activeLine: 20,

      message: `left (${left}) ≤ right (${right}), so the last-position search continues.`,

      firstPos,
      lastPos,

      comparison: createWindowComparison(left, right, "last"),
    });

    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      phase: "calc_mid_last",

      left,
      right,
      mid,

      mode: "last",

      activeLine: 21,

      message:
        `mid = ${left} + (${right} - ${left}) // 2 = ${mid}. ` +
        `nums[mid] = ${nums[mid]}.`,

      firstPos,
      lastPos,

      comparison: null,
    });

    const isTarget = nums[mid] === target;

    steps.push({
      phase: "check_target_last",

      left,
      right,
      mid,

      mode: "last",

      activeLine: 22,

      message: isTarget
        ? `nums[${mid}] = ${nums[mid]} equals target ${target}.`
        : `nums[${mid}] = ${nums[mid]} does not equal target ${target}.`,

      firstPos,
      lastPos,

      comparison: createTargetComparison(nums, mid, target),
    });

    if (isTarget) {
      lastPos = mid;

      steps.push({
        phase: "found_target_last",

        left,
        right,
        mid,

        mode: "last",

        activeLine: 23,

        message:
          `Target found at index ${mid}. ` +
          `Record ${mid} as the current last-position candidate.`,

        firstPos,
        lastPos,

        candidateIndex: mid,
        candidateType: "last",

        comparison: null,
      });

      const previousLeft = left;
      const nextLeft = mid + 1;

      steps.push({
        phase: "search_right_last",

        left: nextLeft,
        right,
        mid,

        previousLeft,
        previousRight: right,

        mode: "last",

        activeLine: 24,

        message:
          `A match was found, but there may be a later one. ` +
          `Move left from ${previousLeft} to ${nextLeft}.`,

        firstPos,
        lastPos,

        candidateIndex: lastPos,
        candidateType: "last",

        eliminatedStart: previousLeft,
        eliminatedEnd: mid,

        searchDirection: "right",

        comparison: null,
      });

      left = nextLeft;
    } else if (nums[mid] < target) {
      steps.push({
        phase: "check_less_last",

        left,
        right,
        mid,

        mode: "last",

        activeLine: 25,

        message:
          `nums[${mid}] = ${nums[mid]} < target ${target}. ` +
          `Target must lie to the right.`,

        firstPos,
        lastPos,

        comparison: createLessComparison(nums, mid, target),
      });

      const previousLeft = left;
      const nextLeft = mid + 1;

      left = nextLeft;

      steps.push({
        phase: "update_left_last",

        left,
        right,
        mid,

        previousLeft,
        previousRight: right,

        mode: "last",

        activeLine: 26,

        message:
          `Discard indices ${previousLeft}..${mid}. ` + `Move left to ${left}.`,

        firstPos,
        lastPos,

        eliminatedStart: previousLeft,
        eliminatedEnd: mid,

        searchDirection: "right",

        comparison: null,
      });
    } else {
      steps.push({
        phase: "check_greater_last",

        left,
        right,
        mid,

        mode: "last",

        activeLine: 27,

        message:
          `nums[${mid}] = ${nums[mid]} > target ${target}. ` +
          `Target must lie to the left.`,

        firstPos,
        lastPos,

        comparison: createGreaterComparison(nums, mid, target),
      });

      const previousRight = right;
      const nextRight = mid - 1;

      right = nextRight;

      steps.push({
        phase: "update_right_last",

        left,
        right,
        mid,

        previousLeft: left,
        previousRight,

        mode: "last",

        activeLine: 28,

        message:
          `Discard indices ${mid}..${previousRight}. ` +
          `Move right to ${right}.`,

        firstPos,
        lastPos,

        eliminatedStart: mid,
        eliminatedEnd: previousRight,

        searchDirection: "left",

        comparison: null,
      });
    }
  }

  steps.push({
    phase: "done_last",

    left,
    right,
    mid: null,

    mode: "done",

    activeLine: 31,

    message: `Both searches complete. Result = [${firstPos}, ${lastPos}].`,

    firstPos,
    lastPos,

    result: [firstPos, lastPos],

    comparison: createWindowComparison(left, right, "last"),
  });

  return steps;
}

const EXAMPLES = getExamples("find-first-last-position");

export default function FindFirstLastPositionVisualizer() {
  const [numsInput, setNumsInput] = useState("[5, 7, 7, 8, 8, 10]");

  const [targetInput, setTargetInput] = useState("8");

  const { nums, target, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput);

      const parsedTarget = Number(targetInput);

      if (!Array.isArray(parsedNums)) {
        throw new Error("nums must be an array");
      }

      if (
        !parsedNums.every(
          (value) => typeof value === "number" && Number.isFinite(value),
        )
      ) {
        throw new Error("nums must contain only numbers");
      }

      if (!Number.isFinite(parsedTarget)) {
        throw new Error("target must be a number");
      }

      const isSorted = parsedNums.every(
        (value, index, array) => index === 0 || value >= array[index - 1],
      );

      if (!isSorted) {
        return {
          nums: [...parsedNums].sort((a, b) => a - b),
          target: parsedTarget,
          inputError: "Input array was automatically sorted.",
        };
      }

      return {
        nums: parsedNums,
        target: parsedTarget,
        inputError: "",
      };
    } catch (error) {
      return {
        nums: [5, 7, 7, 8, 8, 10],
        target: 8,
        inputError: error.message || "Invalid input",
      };
    }
  }, [numsInput, targetInput]);

  const steps = useMemo(
    () =>
      generateSteps(nums, target).map((current) => ({
        ...current,

        relatedLines:
          current.relatedLines ??
          (current.activeLine != null ? [current.activeLine] : []),
      })),
    [nums, target],
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

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyExample = useCallback(
    (example) => {
      setNumsInput(JSON.stringify(example.nums));

      setTargetInput(String(example.target));

      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const left = step?.left ?? 0;

  const right = step?.right ?? nums.length - 1;

  const mid = step?.mid ?? null;

  const currentCandidate =
    step?.mode === "first"
      ? step?.firstPos
      : step?.mode === "last"
        ? step?.lastPos
        : null;

  const hasSearchWindow = step && left >= 0 && right >= 0 && left <= right;

  const modeLabel =
    step?.mode === "first"
      ? "Finding First"
      : step?.mode === "last"
        ? "Finding Last"
        : step?.mode === "done"
          ? "Complete"
          : "Ready";

  /*
   * =========================================================
   * PRIMARY PANEL
   * =========================================================
   */

  const primaryPanel = (
    <div className="ffp-primary">
      <ManualInputPanel
        fields={[
          {
            key: "nums",
            label: "nums",
            type: "array",
          },
          {
            key: "target",
            label: "target",
            type: "number",
          },
        ]}
        values={{
          nums: numsInput,
          target: targetInput,
        }}
        onChange={(key, value) => {
          if (key === "nums") {
            setNumsInput(value);
          }

          if (key === "target") {
            setTargetInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <section className="ffp-panel">
        <header className="ffp-panel-head">
          <div>
            <div className="ffp-panel-title">First & Last Position</div>

            <div className="ffp-panel-subtitle">
              Two directional binary searches
            </div>
          </div>

          <div className="ffp-target-badge">
            target
            <strong>{target}</strong>
          </div>
        </header>

        <div className="ffp-panel-body">
          {/* ===============================================
              SEARCH MODE
             =============================================== */}

          <div
            className={[
              "ffp-mode-banner",
              step?.mode === "first" ? "first" : "",
              step?.mode === "last" ? "last" : "",
              step?.mode === "done" ? "done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="ffp-mode-icon">
              {step?.mode === "first" ? "←" : step?.mode === "last" ? "→" : "✓"}
            </div>

            <div>
              <strong>{modeLabel}</strong>

              <span>
                {step?.mode === "first"
                  ? "Keep searching left after every match."
                  : step?.mode === "last"
                    ? "Keep searching right after every match."
                    : step?.mode === "done"
                      ? "Both boundaries have been determined."
                      : "Press Play or Step to begin."}
              </span>
            </div>
          </div>

          {/* ===============================================
              SEARCH WINDOW
             =============================================== */}

          <section className="ffp-array-section">
            <div className="ffp-section-heading">
              <span>Sorted array</span>

              {step && (
                <span className="ffp-window-readout">
                  window [{left}..{right}]
                </span>
              )}
            </div>

            <div className="ffp-array-scroll">
              <div className="ffp-array-stage">
                {hasSearchWindow && (
                  <motion.div
                    className="ffp-window-rail"
                    initial={false}
                    animate={{
                      left: `calc(${left} * 68px)`,
                      width: `calc(${right - left + 1} * 68px - 16px)`,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 28,
                    }}
                  >
                    <span>search window</span>
                  </motion.div>
                )}

                {currentCandidate != null && currentCandidate >= 0 && (
                  <motion.div
                    className={[
                      "ffp-candidate-rail",
                      step?.mode === "first" ? "first" : "last",
                    ].join(" ")}
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                      left: `calc(${currentCandidate} * 68px)`,
                    }}
                  >
                    <span>candidate</span>
                  </motion.div>
                )}

                <div className="ffp-array-container">
                  {nums.map((num, index) => {
                    const isLeft = step?.left === index;

                    const isRight = step?.right === index;

                    const isMid = step?.mid === index;

                    const isTarget = num === target;

                    const isFirst =
                      step?.firstPos === index && step?.firstPos >= 0;

                    const isLast =
                      step?.lastPos === index && step?.lastPos >= 0;

                    const inWindow = !step || (index >= left && index <= right);

                    const explicitlyEliminated =
                      step?.eliminatedStart !== undefined &&
                      step?.eliminatedEnd !== undefined &&
                      index >= step.eliminatedStart &&
                      index <= step.eliminatedEnd;

                    const classes = [
                      "ffp-cell",

                      isLeft ? "left" : "",

                      isRight ? "right" : "",

                      isMid ? "mid" : "",

                      isTarget ? "target" : "",

                      isFirst ? "first-candidate" : "",

                      isLast ? "last-candidate" : "",

                      !inWindow ? "out-of-bounds" : "",

                      explicitlyEliminated ? "eliminated" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");

                    return (
                      <div key={index} className="ffp-cell-wrapper">
                        <motion.div
                          className={classes}
                          animate={{
                            y: isMid ? -7 : 0,

                            scale: isMid ? 1.08 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 26,
                          }}
                        >
                          {num}

                          {isFirst && (
                            <span className="ffp-candidate-dot first" />
                          )}

                          {isLast && (
                            <span className="ffp-candidate-dot last" />
                          )}
                        </motion.div>

                        <span className="ffp-index">{index}</span>

                        <div className="ffp-pointers">
                          {isLeft && <span className="ffp-ptr left">L</span>}

                          {isMid && <span className="ffp-ptr mid">M</span>}

                          {isRight && <span className="ffp-ptr right">R</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ===============================================
              WEIGHTED COMPARISON
             =============================================== */}

          <AnimatePresence mode="wait">
            {step?.comparison && (
              <motion.div
                key={`${stepIndex}-${step.phase}`}
                className="ffp-comparison-wrap"
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -6,
                }}
                transition={{
                  duration: 0.18,
                }}
              >
                <WeightedComparison
                  title={step.comparison.title}
                  subtitle={step.comparison.subtitle}
                  operands={step.comparison.operands}
                  operators={step.comparison.operators}
                  result={step.comparison.result}
                  showScale
                  showExpression
                  showPairResults
                  showOverallResult
                  animate
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===============================================
              BOUNDARY RESULTS
             =============================================== */}

          <div className="ffp-boundaries">
            <div
              className={[
                "ffp-boundary-card",
                "first",
                step?.firstPos >= 0 ? "has-value" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span className="ffp-boundary-direction">←</span>

              <div>
                <span className="ffp-boundary-label">First position</span>

                <strong>{step?.firstPos ?? "-"}</strong>
              </div>
            </div>

            <div
              className={[
                "ffp-boundary-card",
                "last",
                step?.lastPos >= 0 ? "has-value" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div>
                <span className="ffp-boundary-label">Last position</span>

                <strong>{step?.lastPos ?? "-"}</strong>
              </div>

              <span className="ffp-boundary-direction">→</span>
            </div>
          </div>

          {/* ===============================================
              FINAL RESULT
             =============================================== */}

          <AnimatePresence>
            {step?.result && (
              <motion.div
                className="ffp-result"
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
              >
                <span>result</span>

                <strong>
                  [{step.result[0]}, {step.result[1]}]
                </strong>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );

  /*
   * =========================================================
   * CODE
   * =========================================================
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

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const statusPanel = (
    <div className="ffp-status">
      {step?.message ?? "Press Play or Step to begin."}
    </div>
  );

  /*
   * =========================================================
   * PLAYBACK
   * =========================================================
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
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />

      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={FINDFIRSTLASTPOSITION_PATTERNS}
        />
      )}
    </>
  );

  /*
   * =========================================================
   * LUMINO
   * =========================================================
   */

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: "Sorted Array & Search Range",
        dockMode: "split-right",
      },
      {
        id: "code",
        title: "Code",
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

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="ffp-shell">
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
