import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";

import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";

import { getExamples } from "../../config/examplesRegistry";
import { getSolutionCode } from "../../config/solutionCodeRegistry";

import "./SortColorsVisualizer.css";

const SOLUTION_CODE = getSolutionCode("sort-colors");

const EXAMPLES = getExamples("sort-colors");

const SORTCOLORS_PATTERNS = [
  "init",
  "check",
  "place_lo",
  "skip",
  "place_hi",
  "done",
];

const LINE_PATTERN_MAP = {
  2: "init",
  3: "check",
  4: "place_lo",
  6: "place_lo",
  7: "skip",
  9: "place_hi",
  11: "place_hi",
};

const COLOR_META = {
  0: {
    name: "Red",
    short: "R",
  },
  1: {
    name: "White",
    short: "W",
  },
  2: {
    name: "Blue",
    short: "B",
  },
};

function generateSteps(initial) {
  const steps = [];
  const nums = [...initial];

  let lo = 0;
  let mid = 0;
  let hi = nums.length - 1;

  steps.push({
    phase: "init",
    action: "init",
    activeLine: 2,
    nums: [...nums],
    lo,
    mid,
    hi,
    inspectIndex: null,
    swapA: null,
    swapB: null,
    message:
      `Initialize lo = 0, mid = 0, hi = ${hi}. ` +
      "Everything is initially in the unknown region.",
  });

  while (mid <= hi) {
    const current = nums[mid];

    steps.push({
      phase: "check",
      action: "inspect",
      activeLine: 3,
      nums: [...nums],
      lo,
      mid,
      hi,
      inspectIndex: mid,
      swapA: null,
      swapB: null,
      message:
        `Inspect nums[${mid}] = ${current}. ` +
        `It represents ${COLOR_META[current].name}.`,
    });

    if (current === 0) {
      steps.push({
        phase: "place_lo",
        action: "swap-preview",
        activeLine: 4,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: mid,
        swapA: lo,
        swapB: mid,
        message:
          `nums[mid] is 0 (Red). Swap indices ${mid} and ${lo} ` +
          "so this value joins the red region.",
      });
      [nums[lo], nums[mid]] = [nums[mid], nums[lo]];

      const oldLo = lo;
      const oldMid = mid;

      lo += 1;
      mid += 1;

      steps.push({
        phase: "place_lo",
        action: "swap-complete",
        activeLine: 6,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: null,
        swapA: oldLo,
        swapB: oldMid,
        message:
          `Swap complete. The red region grows. ` +
          `Move lo to ${lo} and mid to ${mid}.`,
      });
    } else if (current === 1) {
      steps.push({
        phase: "skip",
        action: "skip",
        activeLine: 7,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: mid,
        swapA: null,
        swapB: null,
        message:
          `nums[${mid}] is 1 (White). It already belongs between ` +
          "the red and unknown regions, so only mid moves right.",
      });

      mid += 1;

      steps.push({
        phase: "skip",
        action: "advance",
        activeLine: 7,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: null,
        swapA: null,
        swapB: null,
        message: `White value accepted. mid = ${mid}.`,
      });
    } else {
      steps.push({
        phase: "place_hi",
        action: "swap-preview",
        activeLine: 9,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: mid,
        swapA: mid,
        swapB: hi,
        message:
          `nums[mid] is 2 (Blue). Swap indices ${mid} and ${hi} ` +
          "so this value joins the blue region.",
      });

      const oldMid = mid;
      const oldHi = hi;

      [nums[mid], nums[hi]] = [nums[hi], nums[mid]];

      hi -= 1;

      steps.push({
        phase: "place_hi",
        action: "swap-complete",
        activeLine: 11,
        nums: [...nums],
        lo,
        mid,
        hi,
        inspectIndex: mid,
        swapA: oldMid,
        swapB: oldHi,
        message:
          `Swap complete. The blue region grows and hi becomes ${hi}. ` +
          `mid stays at ${mid} because the value swapped in from the right ` +
          "has not been inspected yet.",
      });
    }
  }

  steps.push({
    phase: "done",
    action: "done",
    activeLine: 11,
    nums: [...nums],
    lo,
    mid,
    hi,
    inspectIndex: null,
    swapA: null,
    swapB: null,
    message:
      `mid (${mid}) is now greater than hi (${hi}). ` +
      `The unknown region is empty. Sorted array: [${nums.join(", ")}].`,
  });

  return steps;
}

function RegionBracket({ label, description, count, tone, empty = false }) {
  return (
    <div
      className={[
        "sc-region-card",
        `sc-region-card--${tone}`,
        empty ? "is-empty" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="sc-region-card__top">
        <span className="sc-region-card__label">{label}</span>

        <span className="sc-region-card__count">{count}</span>
      </div>

      <span className="sc-region-card__description">{description}</span>
    </div>
  );
}

function PointerBadge({ name, value, tone }) {
  return (
    <div className={`sc-pointer-card sc-pointer-card--${tone}`}>
      <span className="sc-pointer-card__name">{name}</span>

      <strong className="sc-pointer-card__value">{value}</strong>
    </div>
  );
}

function DutchFlagArray({ nums, step }) {
  const lo = step?.lo ?? 0;
  const mid = step?.mid ?? 0;
  const hi = step?.hi ?? nums.length - 1;

  const redCount = Math.max(0, Math.min(lo, nums.length));

  const whiteStart = Math.max(0, Math.min(lo, nums.length));
  const whiteEnd = Math.max(whiteStart, Math.min(mid, nums.length));

  const whiteCount = Math.max(0, whiteEnd - whiteStart);

  const unknownStart = Math.max(0, Math.min(mid, nums.length));

  const unknownEnd = Math.max(unknownStart, Math.min(hi + 1, nums.length));

  const unknownCount = Math.max(0, unknownEnd - unknownStart);

  const blueStart = Math.max(0, Math.min(hi + 1, nums.length));

  const blueCount = Math.max(0, nums.length - blueStart);

  const getRegion = (index) => {
    if (index < lo) {
      return "red";
    }

    if (index < mid) {
      return "white";
    }

    if (index <= hi) {
      return "unknown";
    }

    return "blue";
  };

  return (
    <div className="sc-algorithm">
      <div className="sc-explanation">
        <div className="sc-explanation__title">
          Dutch National Flag invariant
        </div>

        <div className="sc-explanation__formula">
          <span className="red">[0 .. lo-1] = Red</span>

          <span className="white">[lo .. mid-1] = White</span>

          <span className="unknown">[mid .. hi] = Unknown</span>

          <span className="blue">[hi+1 .. n-1] = Blue</span>
        </div>
      </div>

      <div className="sc-region-summary">
        <RegionBracket
          label="Red"
          description="[0 .. lo-1]"
          count={redCount}
          tone="red"
          empty={redCount === 0}
        />

        <RegionBracket
          label="White"
          description="[lo .. mid-1]"
          count={whiteCount}
          tone="white"
          empty={whiteCount === 0}
        />

        <RegionBracket
          label="Unknown"
          description="[mid .. hi]"
          count={unknownCount}
          tone="unknown"
          empty={unknownCount === 0}
        />

        <RegionBracket
          label="Blue"
          description="[hi+1 .. n-1]"
          count={blueCount}
          tone="blue"
          empty={blueCount === 0}
        />
      </div>

      <section className="sc-array-panel">
        <div className="sc-array-panel__head">
          <div>
            <div className="sc-array-panel__title">In-place array</div>

            <div className="sc-array-panel__subtitle">
              The regions change by moving lo, mid and hi. No secondary arrays
              are created.
            </div>
          </div>

          <div className="sc-array-panel__size">n = {nums.length}</div>
        </div>

        <div className="sc-array-scroll">
          <div className="sc-array">
            {nums.map((value, index) => {
              const region = getRegion(index);

              const isLo = index === lo && lo < nums.length;

              const isMid = index === mid && mid < nums.length;

              const isHi = index === hi && hi >= 0 && hi < nums.length;

              const isInspect = index === step?.inspectIndex;

              const isSwapA = index === step?.swapA;

              const isSwapB = index === step?.swapB;

              const isSwap = isSwapA || isSwapB;

              return (
                <div key={index} className="sc-cell-column">
                  <span className="sc-index">{index}</span>

                  <motion.div
                    layout
                    className={[
                      "sc-array-cell",
                      `sc-array-cell--${region}`,
                      isInspect ? "is-inspecting" : "",
                      isSwap ? "is-swapping" : "",
                      isMid ? "has-mid" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    animate={{
                      y: isInspect ? -7 : 0,
                      scale: isSwap ? 1.1 : isInspect ? 1.07 : 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 25,
                    }}
                  >
                    <span className="sc-array-cell__value">{value}</span>

                    <span className="sc-array-cell__name">
                      {COLOR_META[value].name}
                    </span>

                    {isInspect && (
                      <span className="sc-inspect-badge">inspect</span>
                    )}

                    {isSwap && <span className="sc-swap-badge">swap</span>}
                  </motion.div>

                  <div className="sc-cell-pointers">
                    {isLo && (
                      <span className="sc-cell-pointer sc-cell-pointer--lo">
                        lo
                      </span>
                    )}

                    {isMid && (
                      <span className="sc-cell-pointer sc-cell-pointer--mid">
                        mid
                      </span>
                    )}

                    {isHi && (
                      <span className="sc-cell-pointer sc-cell-pointer--hi">
                        hi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {mid === nums.length && (
              <div className="sc-end-pointer">
                <span>mid</span>

                <strong>{mid}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="sc-array-brackets">
          <div
            className="sc-array-bracket sc-array-bracket--red"
            style={{
              flexGrow: redCount,
              display: redCount > 0 ? "flex" : "none",
            }}
          >
            <span>Red</span>
          </div>

          <div
            className="sc-array-bracket sc-array-bracket--white"
            style={{
              flexGrow: whiteCount,
              display: whiteCount > 0 ? "flex" : "none",
            }}
          >
            <span>White</span>
          </div>

          <div
            className="sc-array-bracket sc-array-bracket--unknown"
            style={{
              flexGrow: unknownCount,
              display: unknownCount > 0 ? "flex" : "none",
            }}
          >
            <span>Unknown</span>
          </div>

          <div
            className="sc-array-bracket sc-array-bracket--blue"
            style={{
              flexGrow: blueCount,
              display: blueCount > 0 ? "flex" : "none",
            }}
          >
            <span>Blue</span>
          </div>
        </div>
      </section>

      <div className="sc-pointer-row">
        <PointerBadge name="lo" value={lo} tone="lo" />

        <PointerBadge name="mid" value={mid} tone="mid" />

        <PointerBadge name="hi" value={hi} tone="hi" />
      </div>

      <AnimatePresence mode="wait">
        {step?.action === "inspect" && step?.inspectIndex != null && (
          <motion.div
            key={`inspect-${stepIndexKey(step)}`}
            className="sc-decision"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -4,
            }}
          >
            <div className="sc-decision__eyebrow">Inspect nums[mid]</div>

            <div className="sc-decision__expression">
              nums[{mid}]<span>=</span>
              <strong className={`value-${nums[mid]}`}>{nums[mid]}</strong>
            </div>

            <div className="sc-decision__branches">
              <div
                className={[
                  "sc-branch",
                  nums[mid] === 0 ? "is-active" : "",
                  "sc-branch--red",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <strong>0</strong>

                <span>swap(mid, lo)</span>
              </div>

              <div
                className={[
                  "sc-branch",
                  nums[mid] === 1 ? "is-active" : "",
                  "sc-branch--white",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <strong>1</strong>

                <span>mid++</span>
              </div>

              <div
                className={[
                  "sc-branch",
                  nums[mid] === 2 ? "is-active" : "",
                  "sc-branch--blue",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <strong>2</strong>

                <span>swap(mid, hi)</span>
              </div>
            </div>
          </motion.div>
        )}

        {step?.action === "swap-preview" && (
          <motion.div
            key={`swap-${step.swapA}-${step.swapB}`}
            className="sc-operation sc-operation--swap"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <div className="sc-operation__label">Swap operation</div>

            <div className="sc-swap-expression">
              <div>
                <span>index</span>

                <strong>{step.swapA}</strong>

                <small>{COLOR_META[nums[step.swapA]]?.name}</small>
              </div>

              <div className="sc-swap-arrow">⇄</div>

              <div>
                <span>index</span>

                <strong>{step.swapB}</strong>

                <small>{COLOR_META[nums[step.swapB]]?.name}</small>
              </div>
            </div>
          </motion.div>
        )}

        {step?.action === "swap-complete" && (
          <motion.div
            key={`complete-${step.lo}-${step.mid}-${step.hi}`}
            className="sc-operation sc-operation--complete"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <span className="sc-operation__check">✓</span>

            <div>
              <strong>Partition updated</strong>

              <span>The array was modified in place.</span>
            </div>
          </motion.div>
        )}

        {step?.action === "done" && (
          <motion.div
            key="done"
            className="sc-operation sc-operation--done"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <span className="sc-operation__check">✓</span>

            <div>
              <strong>All regions resolved</strong>

              <span>Unknown region is empty. The array is sorted.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function stepIndexKey(step) {
  return [step?.lo, step?.mid, step?.hi, step?.inspectIndex].join("-");
}

function VisualizationPanel({ nums, step }) {
  return (
    <div className="sc-viz">
      <DutchFlagArray nums={nums} step={step} />
    </div>
  );
}

export default function SortColorsVisualizer() {
  const [sel, setSel] = useState(0);

  const [initialInput, setInitialInput] = useState(
    JSON.stringify(
      EXAMPLES[0]?.nums ?? EXAMPLES[0]?.input ?? [2, 0, 2, 1, 1, 0],
    ),
  );

  const [panelDivs, setPanelDivs] = useState(null);

  const {
    showPatternOverlay,
    setShowPatternOverlay,
    activeLineDom,
    setActiveLineDom,
  } = usePatternOverlay();

  const { initial, inputError } = useMemo(() => {
    try {
      const parsedInitial = JSON.parse(initialInput);

      if (!Array.isArray(parsedInitial)) {
        throw new Error("Enter a JSON array containing only 0, 1, and 2.");
      }

      if (parsedInitial.length === 0) {
        throw new Error("Array must contain at least one value.");
      }

      if (parsedInitial.length > 24) {
        throw new Error("Use at most 24 elements for visualization clarity.");
      }

      const normalized = parsedInitial.map(Number);

      if (
        normalized.some(
          (value) => !Number.isInteger(value) || ![0, 1, 2].includes(value),
        )
      ) {
        throw new Error("Enter a JSON array containing only 0, 1, and 2.");
      }

      return {
        initial: normalized,
        inputError: "",
      };
    } catch (error) {
      return {
        initial: EXAMPLES[sel]?.nums ??
          EXAMPLES[sel]?.input ?? [2, 0, 2, 1, 1, 0],

        inputError: error.message || "Invalid input.",
      };
    }
  }, [initialInput, sel]);

  const steps = useMemo(
    () =>
      generateSteps(initial).map((current) => ({
        ...current,
        relatedLines:
          current.relatedLines ??
          (current.activeLine != null ? [current.activeLine] : []),
      })),
    [initial],
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

  const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const applyExample = useCallback(
    (index) => {
      const example = EXAMPLES[index];

      if (!example) {
        return;
      }

      setSel(index);

      setInitialInput(JSON.stringify(example.nums ?? example.input ?? []));

      handleReset();
    },
    [handleReset],
  );

  const nums = step?.nums ?? initial;

  const inputPanel = (
    <div className="sc-input-panel">
      <ManualInputPanel
        fields={[
          {
            key: "initial",
            label: "Colors",
            type: "array",
          },
        ]}
        values={{
          initial: initialInput,
        }}
        onChange={(key, value) => {
          if (key === "initial") {
            setInitialInput(value);
          }

          handleReset();
        }}
        examples={EXAMPLES}
        activeLabel={EXAMPLES[sel]?.label}
        applyExample={(example) => applyExample(EXAMPLES.indexOf(example))}
        inputError={inputError}
      />
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

  const vizPanel = <VisualizationPanel nums={nums} step={step} />;

  const statusPanel = (
    <div
      className={["sc-status", step?.phase === "done" ? "is-done" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="sc-status__phase">
        {step?.phase ? step.phase.replaceAll("_", " ") : "ready"}
      </span>

      <span className="sc-status__message">
        {step?.message ?? "Press Play or Step to begin."}
      </span>
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
          usedPatterns={SORTCOLORS_PATTERNS}
        />
      )}
    </>
  );

  const panelConfigs = useMemo(
    () => [
      {
        id: "input",
        title: "Input",
        size: "compact",
      },
      {
        id: "viz",
        title: "Visualization",
        dockMode: "split-bottom",
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
        size: "status",
      },
    ],
    [],
  );

  const handlePanelReady = useCallback((divs) => {
    setPanelDivs(divs);
  }, []);

  return (
    <div className="sc-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />

      {panelDivs && (
        <>
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}

          {panelDivs.code && createPortal(codePanel, panelDivs.code)}

          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}

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
