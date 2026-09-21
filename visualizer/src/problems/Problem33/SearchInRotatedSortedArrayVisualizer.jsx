import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from "../../config/examplesRegistry";
import "./SearchInRotatedSortedArrayVisualizer.css";
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
    text: "    def search(self, nums: List[int], target: int) -> int:",
  },
  { line: 3, text: "        lo, hi = 0, len(nums) - 1" },
  { line: 4, text: "" },
  { line: 5, text: "        while lo <= hi:" },
  { line: 6, text: "            mid = (lo + hi) // 2" },
  { line: 7, text: "            if nums[mid] == target:" },
  { line: 8, text: "                return mid" },
  { line: 9, text: "" },
  { line: 10, text: "            # Left half is sorted" },
  { line: 11, text: "            if nums[lo] <= nums[mid]:" },
  { line: 12, text: "                if nums[lo] <= target < nums[mid]:" },
  { line: 13, text: "                    hi = mid - 1" },
  { line: 14, text: "                else:" },
  { line: 15, text: "                    lo = mid + 1" },
  { line: 16, text: "            # Right half is sorted" },
  { line: 17, text: "            else:" },
  { line: 18, text: "                if nums[mid] < target <= nums[hi]:" },
  { line: 19, text: "                    lo = mid + 1" },
  { line: 20, text: "                else:" },
  { line: 21, text: "                    hi = mid - 1" },
  { line: 22, text: "" },
  { line: 23, text: "        return -1" },
];

const SEARCHINROTATEDSORTEDARRAY_PATTERNS = [
  "calc_mid",
  "check_loop",
  "found",
  "init",
  "move_hi",
  "move_lo",
  "not_found",
];

const LINE_PATTERN_MAP = {
  3: "init",
  5: "check_loop",
  6: "calc_mid",
  8: "found",
  13: "move_hi",
  15: "move_lo",
  19: "move_lo",
  21: "move_hi",
  23: "not_found",
};

function generateSteps(nums, target) {
  const steps = [];

  let lo = 0;
  let hi = nums.length - 1;

  steps.push({
    phase: "init",
    activeLine: 3,

    lo,
    hi,
    mid: -1,

    result: null,
    comparison: null,

    message: `Initialize lo=${lo}, hi=${hi}. Target=${target}.`,
  });

  while (lo <= hi) {
    /*
     * Search-window comparison.
     *
     * This compares INDICES, not array values.
     */
    steps.push({
      phase: "check_loop",
      activeLine: 5,

      lo,
      hi,
      mid: -1,

      result: null,

      comparison: {
        title: "Search window valid?",
        subtitle: "Continue while lo ≤ hi.",

        operands: [
          {
            id: "lo-index",
            label: "lo",
            value: lo,
            tone: "lo",
            active: true,
          },
          {
            id: "hi-index",
            label: "hi",
            value: hi,
            tone: "hi",
            active: true,
          },
        ],

        operators: ["<="],

        result: lo <= hi,
      },

      message: `lo=${lo} ≤ hi=${hi}. Search window is still valid.`,
    });

    const mid = Math.floor((lo + hi) / 2);

    steps.push({
      phase: "calc_mid",
      activeLine: 6,

      lo,
      hi,
      mid,

      result: null,
      comparison: null,

      message: `mid = (${lo} + ${hi}) // 2 = ${mid}. nums[mid] = ${nums[mid]}.`,
    });

    /*
     * Compare nums[mid] with target.
     */
    const found = nums[mid] === target;

    steps.push({
      phase: found ? "found" : "compare_target",
      activeLine: 7,

      lo,
      hi,
      mid,

      result: found ? mid : null,

      comparison: {
        title: "Target comparison",
        subtitle: "Does nums[mid] equal the target?",

        operands: [
          {
            id: "mid",
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

        result: found,
      },

      message: found
        ? `nums[${mid}] = ${nums[mid]} equals target ${target}.`
        : `nums[${mid}] = ${nums[mid]} does not equal target ${target}.`,
    });

    if (found) {
      steps.push({
        phase: "found",
        activeLine: 8,

        lo,
        hi,
        mid,

        result: mid,
        comparison: null,

        message: `Found target ${target} at index ${mid}. Return ${mid}.`,
      });

      return steps;
    }

    /*
     * Determine which half is sorted.
     */
    const leftSorted = nums[lo] <= nums[mid];

    steps.push({
      phase: leftSorted ? "left_sorted" : "right_sorted",
      activeLine: 11,

      lo,
      hi,
      mid,

      result: null,

      sortedSide: leftSorted ? "left" : "right",
      sortedStart: leftSorted ? lo : mid,
      sortedEnd: leftSorted ? mid : hi,

      comparison: {
        title: "Which half is sorted?",
        subtitle: "Compare nums[lo] with nums[mid].",

        operands: [
          {
            id: "lo",
            label: "nums[lo]",
            sublabel: `index ${lo}`,
            value: nums[lo],
            tone: "lo",
            active: true,
          },
          {
            id: "mid",
            label: "nums[mid]",
            sublabel: `index ${mid}`,
            value: nums[mid],
            tone: "mid",
            active: true,
          },
        ],

        operators: ["<="],

        result: leftSorted,
      },

      message: leftSorted
        ? `nums[lo]=${nums[lo]} ≤ nums[mid]=${nums[mid]}. Left half [${lo}..${mid}] is sorted.`
        : `nums[lo]=${nums[lo]} > nums[mid]=${nums[mid]}. Right half [${mid}..${hi}] is sorted.`,
    });

    if (leftSorted) {
      /*
       * LEFT HALF:
       *
       * nums[lo] <= target < nums[mid]
       */
      const targetInLeft = nums[lo] <= target && target < nums[mid];

      steps.push({
        phase: "check_left_range",
        activeLine: 12,

        lo,
        hi,
        mid,

        result: null,

        sortedSide: "left",
        sortedStart: lo,
        sortedEnd: mid,

        targetInSortedHalf: targetInLeft,

        comparison: {
          title: "Target inside sorted left half?",
          subtitle: "Check nums[lo] ≤ target < nums[mid].",

          operands: [
            {
              id: "lo",
              label: "nums[lo]",
              sublabel: `index ${lo}`,
              value: nums[lo],
              tone: "lo",
            },
            {
              id: "target",
              label: "target",
              value: target,
              tone: "target",
              active: true,
            },
            {
              id: "mid",
              label: "nums[mid]",
              sublabel: `index ${mid}`,
              value: nums[mid],
              tone: "mid",
            },
          ],

          operators: ["<=", "<"],

          result: targetInLeft,
        },

        message: targetInLeft
          ? `${nums[lo]} ≤ ${target} < ${nums[mid]}. Target lies inside the sorted left half.`
          : `${nums[lo]} ≤ ${target} < ${nums[mid]} is false. Target is not inside the sorted left half.`,
      });

      if (targetInLeft) {
        const oldHi = hi;
        const nextHi = mid - 1;

        steps.push({
          phase: "move_hi",
          activeLine: 13,

          lo,
          hi: nextHi,
          mid,

          previousLo: lo,
          previousHi: oldHi,

          result: null,
          comparison: null,

          sortedSide: "left",

          eliminatedStart: mid,
          eliminatedEnd: oldHi,

          message: `Keep the left side. Move hi from ${oldHi} to ${nextHi}.`,
        });

        hi = nextHi;
      } else {
        const oldLo = lo;
        const nextLo = mid + 1;

        steps.push({
          phase: "move_lo",
          activeLine: 15,

          lo: nextLo,
          hi,
          mid,

          previousLo: oldLo,
          previousHi: hi,

          result: null,
          comparison: null,

          sortedSide: "left",

          eliminatedStart: oldLo,
          eliminatedEnd: mid,

          message: `Discard the sorted left half. Move lo from ${oldLo} to ${nextLo}.`,
        });

        lo = nextLo;
      }
    } else {
      /*
       * RIGHT HALF:
       *
       * nums[mid] < target <= nums[hi]
       */
      const targetInRight = nums[mid] < target && target <= nums[hi];

      steps.push({
        phase: "check_right_range",
        activeLine: 18,

        lo,
        hi,
        mid,

        result: null,

        sortedSide: "right",
        sortedStart: mid,
        sortedEnd: hi,

        targetInSortedHalf: targetInRight,

        comparison: {
          title: "Target inside sorted right half?",
          subtitle: "Check nums[mid] < target ≤ nums[hi].",

          operands: [
            {
              id: "mid",
              label: "nums[mid]",
              sublabel: `index ${mid}`,
              value: nums[mid],
              tone: "mid",
            },
            {
              id: "target",
              label: "target",
              value: target,
              tone: "target",
              active: true,
            },
            {
              id: "hi",
              label: "nums[hi]",
              sublabel: `index ${hi}`,
              value: nums[hi],
              tone: "hi",
            },
          ],

          operators: ["<", "<="],

          result: targetInRight,
        },

        message: targetInRight
          ? `${nums[mid]} < ${target} ≤ ${nums[hi]}. Target lies inside the sorted right half.`
          : `${nums[mid]} < ${target} ≤ ${nums[hi]} is false. Target is not inside the sorted right half.`,
      });

      if (targetInRight) {
        const oldLo = lo;
        const nextLo = mid + 1;

        steps.push({
          phase: "move_lo",
          activeLine: 19,

          lo: nextLo,
          hi,
          mid,

          previousLo: oldLo,
          previousHi: hi,

          result: null,
          comparison: null,

          sortedSide: "right",

          eliminatedStart: oldLo,
          eliminatedEnd: mid,

          message: `Keep the right side. Move lo from ${oldLo} to ${nextLo}.`,
        });

        lo = nextLo;
      } else {
        const oldHi = hi;
        const nextHi = mid - 1;

        steps.push({
          phase: "move_hi",
          activeLine: 21,

          lo,
          hi: nextHi,
          mid,

          previousLo: lo,
          previousHi: oldHi,

          result: null,
          comparison: null,

          sortedSide: "right",

          eliminatedStart: mid,
          eliminatedEnd: oldHi,

          message: `Discard the sorted right half. Move hi from ${oldHi} to ${nextHi}.`,
        });

        hi = nextHi;
      }
    }
  }

  steps.push({
    phase: "not_found",
    activeLine: 23,

    lo,
    hi,
    mid: -1,

    result: -1,
    comparison: null,

    message: `lo(${lo}) > hi(${hi}). Target ${target} was not found. Return -1.`,
  });

  return steps;
}

const EXAMPLES = getExamples("search-in-rotated-sorted-array");

export default function SearchInRotatedSortedArrayVisualizer() {
  const [numsInput, setNumsInput] = useState("[4,5,6,7,0,1,2]");
  const [targetInput, setTargetInput] = useState("0");

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { nums, target, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput);
      const t = Number(targetInput);

      if (!Array.isArray(n) || n.length === 0) {
        throw new Error("nums must be a non-empty array");
      }

      if (n.length > 14) {
        throw new Error("Max 14 elements for clarity");
      }

      if (
        !n.every((value) => typeof value === "number" && Number.isFinite(value))
      ) {
        throw new Error("nums must contain only numbers");
      }

      if (!Number.isFinite(t)) {
        throw new Error("target must be a number");
      }

      return {
        nums: n,
        target: t,
        inputError: "",
      };
    } catch (e) {
      return {
        nums: [4, 5, 6, 7, 0, 1, 2],
        target: 0,
        inputError: e.message,
      };
    }
  }, [numsInput, targetInput]);

  const steps = useMemo(() => generateSteps(nums, target), [nums, target]);

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

  const applyExample = useCallback(
    (example) => {
      setNumsInput(JSON.stringify(example.nums));
      setTargetInput(String(example.target));
      handleReset();
    },
    [handleReset],
  );

  const lo = step?.lo ?? 0;

  const hi = step?.hi ?? nums.length - 1;

  const mid = step?.mid ?? -1;

  const result = step?.result;

  const sortedSide = step?.sortedSide ?? null;

  const sortedStart = step?.sortedStart ?? -1;

  const sortedEnd = step?.sortedEnd ?? -1;

  /*
   * We deliberately get sorted-side information directly
   * from the step instead of recalculating it from the current
   * array state.
   *
   * That means the visualization represents exactly what the
   * algorithm knew at that point.
   */
  const hasSortedRange =
    sortedSide !== null && sortedStart >= 0 && sortedEnd >= 0;

  const primaryPanel = (
    <div className="sirsa-primary">
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
            type: "string",
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

      <section className="sirsa-panel">
        <header className="sirsa-head">
          <div>
            <div className="sirsa-head-title">Rotated Array</div>

            <div className="sirsa-head-subtitle">
              Binary search over the current search window
            </div>
          </div>

          <div className="sirsa-target-badge">
            target
            <strong>{target}</strong>
          </div>
        </header>

        <div className="sirsa-body">
          {/* =====================================================
                        SEARCH WINDOW
                       ===================================================== */}

          <div className="sirsa-array-section">
            <div className="sirsa-section-heading">
              <span>Search window</span>

              {step && (
                <span className="sirsa-window-readout">
                  [{lo}..{hi}]
                </span>
              )}
            </div>

            <div className="sirsa-array-stage">
              {step && lo <= hi && (
                <motion.div
                  className="sirsa-window-rail"
                  initial={false}
                  animate={{
                    left: `calc(${lo} * 68px)`,
                    width: `calc(${hi - lo + 1} * 68px - 10px)`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                >
                  <span className="sirsa-window-rail-label">
                    current search window
                  </span>
                </motion.div>
              )}

              {hasSortedRange && (
                <motion.div
                  className={`sirsa-sorted-rail ${sortedSide}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    left: `calc(${sortedStart} * 68px)`,
                    width: `calc(${sortedEnd - sortedStart + 1} * 68px - 10px)`,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 28,
                  }}
                >
                  <span>
                    {sortedSide === "left"
                      ? "sorted left half"
                      : "sorted right half"}
                  </span>
                </motion.div>
              )}

              <div className="sirsa-array-wrap">
                {nums.map((value, index) => {
                  const isLo = index === lo;

                  const isHi = index === hi;

                  const isMid = index === mid;

                  const isFound =
                    result !== null &&
                    result !== undefined &&
                    result >= 0 &&
                    index === result;

                  const inSearchWindow = step
                    ? index >= lo && index <= hi
                    : true;

                  const inSortedRange =
                    hasSortedRange &&
                    index >= sortedStart &&
                    index <= sortedEnd;

                  const explicitlyEliminated =
                    step?.eliminatedStart !== undefined &&
                    step?.eliminatedEnd !== undefined &&
                    index >= step.eliminatedStart &&
                    index <= step.eliminatedEnd;

                  return (
                    <div key={index} className="sirsa-col">
                      <motion.div
                        className={[
                          "sirsa-cell",
                          isMid ? "mid" : "",
                          isFound ? "found" : "",
                          inSortedRange && sortedSide === "left"
                            ? "sorted-left"
                            : "",
                          inSortedRange && sortedSide === "right"
                            ? "sorted-right"
                            : "",
                          !inSearchWindow ? "dim" : "",
                          explicitlyEliminated ? "eliminated" : "",
                          result === -1 ? "eliminated" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        animate={{
                          y: isMid || isFound ? -8 : 0,
                          scale: isMid || isFound ? 1.1 : 1,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 26,
                        }}
                      >
                        {value}
                      </motion.div>

                      <span className="sirsa-idx">{index}</span>

                      <div className="sirsa-ptrs">
                        {isLo && <span className="sirsa-ptr lo-ptr">lo</span>}

                        {isMid && (
                          <span className="sirsa-ptr mid-ptr">mid</span>
                        )}

                        {isHi && <span className="sirsa-ptr hi-ptr">hi</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =====================================================
                        COMPARISON MACHINE
                       ===================================================== */}

          <AnimatePresence mode="wait">
            {step?.comparison && (
              <motion.div
                key={`${stepIndex}-${step.phase}`}
                className="sirsa-comparison-wrap"
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

          {/* =====================================================
                        SORTED HALF EXPLANATION
                       ===================================================== */}

          {hasSortedRange && (
            <motion.div
              className={`sirsa-half-badge ${sortedSide}`}
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <span className="sirsa-half-badge-icon">
                {sortedSide === "left" ? "←" : "→"}
              </span>

              <div>
                <strong>
                  {sortedSide === "left"
                    ? "Left half is sorted"
                    : "Right half is sorted"}
                </strong>

                <span>
                  indices {sortedStart}..{sortedEnd}
                </span>
              </div>
            </motion.div>
          )}

          {/* =====================================================
                        RESULT
                       ===================================================== */}

          <AnimatePresence>
            {result !== null && result !== undefined && (
              <motion.div
                className={`sirsa-result ${
                  result >= 0 ? "found" : "not-found"
                }`}
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
                {result >= 0
                  ? `Found at index ${result} ✓`
                  : "Not found — return -1"}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );

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

  const statusPanel = (
    <div
      className={`sirsa-status${
        result !== null && result !== undefined
          ? result >= 0
            ? " ok"
            : " fail"
          : ""
      }`}
    >
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
        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />

      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={SEARCHINROTATEDSORTEDARRAY_PATTERNS}
        />
      )}
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const panelConfigs = useMemo(
    () => [
      {
        id: "primary",
        title: "Search in Rotated Sorted Array",
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
    <div className="sirsa-shell">
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
