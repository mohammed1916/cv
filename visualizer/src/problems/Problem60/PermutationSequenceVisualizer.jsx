import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamplesOr } from "../../config/examplesRegistry";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import "./PermutationSequenceVisualizer.css";

const SOLUTION_CODE = [
  { line: 1, text: "def getPermutation(n, k):" },
  { line: 2, text: "    factorial = [1]" },
  { line: 3, text: "    for i in range(1, n):" },
  { line: 4, text: "        factorial.append(factorial[-1] * i)" },
  { line: 5, text: "    k -= 1" },
  { line: 6, text: "    nums = list(range(1, n+1))" },
  { line: 7, text: "    result = []" },
  { line: 8, text: "    for i in range(n):" },
  { line: 9, text: "        index = k // factorial[n-1-i]" },
  { line: 10, text: "        result.append(nums[index])" },
  { line: 11, text: "        nums.pop(index)" },
  { line: 12, text: "        k %= factorial[n-1-i]" },
  { line: 13, text: '    return "".join(map(str, result))' },
];

const PERMUTATIONSEQUENCE_PATTERNS = [
  "adjust-k",
  "calc-index",
  "done",
  "init-factorial",
  "init-nums",
  "init-result",
  "remove-num",
  "select-num",
  "update-k",
];

const LINE_PATTERN_MAP = {
  2: "init-factorial",
  3: "init-factorial",
  4: "init-factorial",
  5: "adjust-k",
  6: "init-nums",
  7: "init-result",
  8: "calc-index",
  9: "calc-index",
  10: "select-num",
  11: "remove-num",
  12: "update-k",
  13: "done",
};

const EXAMPLES = getExamplesOr("permutation-sequence", [
  { label: "n=4, k=9", n: 4, k: 9 },
  { label: "n=3, k=3", n: 3, k: 3 },
  { label: "n=4, k=14", n: 4, k: 14 },
  { label: "n=3, k=1 (1st)", n: 3, k: 1 },
  { label: "n=3, k=6 (last)", n: 3, k: 6 },
  { label: "n=5, k=60", n: 5, k: 60 },
]);

function generateSteps(n, k) {
  const steps = [];

  // 1. Initialize factorials
  const factorial = [1];
  for (let i = 1; i < n; i++) {
    factorial.push(factorial[factorial.length - 1] * i);
  }

  const initialNums = Array.from({ length: n }, (_, i) => i + 1);

  steps.push({
    phase: "init-factorial",
    activeLine: 2,
    n,
    origK: k,
    k: k,
    currentK: k,
    factorial,
    nums: [...initialNums],
    result: [],
    positionIndex: -1,
    index: -1,
    blockSize: null,
    buckets: [],
    message: `Compute factorials up to (${n}-1)!: [${factorial.map((f, i) => `${i}!=${f}`).join(", ")}]`,
  });

  // 2. Adjust k to 0-based
  const kAdjusted = k - 1;
  steps.push({
    phase: "adjust-k",
    activeLine: 5,
    n,
    origK: k,
    k: kAdjusted,
    currentK: kAdjusted,
    factorial,
    nums: [...initialNums],
    result: [],
    positionIndex: -1,
    index: -1,
    blockSize: null,
    buckets: [],
    mathText: `k = ${k} - 1 = ${kAdjusted} (0-indexed rank)`,
    message: `Convert k to 0-based index: k = ${k} - 1 = ${kAdjusted}.`,
  });

  // 3. Init numbers array
  steps.push({
    phase: "init-nums",
    activeLine: 6,
    n,
    origK: k,
    k: kAdjusted,
    currentK: kAdjusted,
    factorial,
    nums: [...initialNums],
    result: [],
    positionIndex: -1,
    index: -1,
    blockSize: null,
    buckets: [],
    message: `Initialize pool of available digits: [${initialNums.join(", ")}].`,
  });

  // 4. Init result array
  steps.push({
    phase: "init-result",
    activeLine: 7,
    n,
    origK: k,
    k: kAdjusted,
    currentK: kAdjusted,
    factorial,
    nums: [...initialNums],
    result: [],
    positionIndex: -1,
    index: -1,
    blockSize: null,
    buckets: [],
    message: `Initialize empty result sequence. Preparing to place ${n} digits.`,
  });

  // 5. Main loop
  const result = [];
  let currentK = kAdjusted;
  const currentNums = [...initialNums];

  for (let i = 0; i < n; i++) {
    const factorialIdx = n - 1 - i;
    const blockSize = factorial[factorialIdx];
    const index = Math.floor(currentK / blockSize);

    // Build bucket partition descriptions
    const buckets = currentNums.map((num, j) => {
      const startK = j * blockSize;
      const endK = (j + 1) * blockSize - 1;
      return {
        num,
        index: j,
        startK,
        endK,
        size: blockSize,
        isTarget: j === index,
        isBypassed: j < index,
        isBeyond: j > index,
      };
    });

    // Step: Calculate index
    steps.push({
      phase: "calc-index",
      activeLine: 9,
      n,
      origK: k,
      k: currentK,
      currentK,
      factorial,
      factorialIdx,
      nums: [...currentNums],
      result: [...result],
      positionIndex: i,
      index,
      blockSize,
      buckets,
      selectedNum: currentNums[index],
      mathText: `index = ⌊${currentK} / ${blockSize}⌋ = ${index}`,
      message: `Position ${i + 1}/${n}: Block size = ${factorialIdx}! = ${blockSize}. index = ⌊${currentK} / ${blockSize}⌋ = ${index} (Selects bucket "${currentNums[index]}").`,
    });

    const selectedNum = currentNums[index];
    result.push(selectedNum);

    // Step: Select number & append to result
    steps.push({
      phase: "select-num",
      activeLine: 10,
      n,
      origK: k,
      k: currentK,
      currentK,
      factorial,
      factorialIdx,
      nums: [...currentNums],
      result: [...result],
      positionIndex: i,
      index,
      blockSize,
      buckets,
      selectedNum,
      mathText: `result.append(nums[${index}]) → Append "${selectedNum}" to result`,
      message: `Select nums[${index}] = ${selectedNum}. Placed into slot #${i + 1}. Current result = [${result.join(", ")}].`,
    });

    // Step: Remove number from available pool
    currentNums.splice(index, 1);
    steps.push({
      phase: "remove-num",
      activeLine: 11,
      n,
      origK: k,
      k: currentK,
      currentK,
      factorial,
      factorialIdx,
      nums: [...currentNums],
      result: [...result],
      positionIndex: i,
      index: -1,
      blockSize,
      buckets: [],
      selectedNum,
      message: `Remove "${selectedNum}" from available numbers. Remaining pool: [${currentNums.join(", ")}].`,
    });

    // Step: Update k %= factorial[n-1-i]
    const prevK = currentK;
    currentK %= blockSize;
    steps.push({
      phase: "update-k",
      activeLine: 12,
      n,
      origK: k,
      k: currentK,
      currentK,
      prevK,
      factorial,
      factorialIdx,
      nums: [...currentNums],
      result: [...result],
      positionIndex: i,
      index: -1,
      blockSize,
      buckets: [],
      mathText: `k = ${prevK} % ${blockSize} = ${currentK}`,
      message: `Update k for next digit: k = ${prevK} % ${blockSize} = ${currentK}.`,
    });
  }

  const finalResult = result.join("");
  steps.push({
    phase: "done",
    activeLine: 13,
    n,
    origK: k,
    k: currentK,
    currentK,
    factorial,
    nums: [],
    result: [...result],
    finalResult,
    positionIndex: n,
    index: -1,
    blockSize: null,
    buckets: [],
    message: `Done! The ${k}-th permutation of [1..${n}] is "${finalResult}".`,
  });

  return steps;
}

function VisualizationPanel({ n, k, step }) {
  const totalPermutations = useMemo(() => {
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }, [n]);

  const totalSlots = Array.from({ length: n }, (_, i) => i);

  return (
    <div className="ps-viz-panel">
      {/* Top Parameters Bar */}
      <div className="ps-metrics-bar">
        <div className="ps-metric-item">
          <span className="ps-metric-lbl">Total Digits (n)</span>
          <span className="ps-metric-num">{n}</span>
        </div>
        <div className="ps-metric-item">
          <span className="ps-metric-lbl">Target Rank (k)</span>
          <span className="ps-metric-num highlight">{k}</span>
        </div>
        <div className="ps-metric-item">
          <span className="ps-metric-lbl">0-Indexed Rank (k - 1)</span>
          <span className="ps-metric-num">{k - 1}</span>
        </div>
        <div className="ps-metric-item">
          <span className="ps-metric-lbl">Total Permutations (n!)</span>
          <span className="ps-metric-num">{totalPermutations}</span>
        </div>
        <div className="ps-metric-item">
          <span className="ps-metric-lbl">Current Sub-rank (k)</span>
          <span className="ps-metric-num k-active">
            {step?.currentK ?? k - 1}
          </span>
        </div>
      </div>

      {/* Main Permutation Construction Board */}
      <div className="ps-board-section">
        <div className="ps-section-header">
          <span>Permutation Construction Slots</span>
          <span className="ps-subhead">
            Slot{" "}
            {Math.min(
              n,
              (step?.result?.length || 0) +
                (step?.phase === "calc-index" ? 1 : 0),
            )}{" "}
            / {n}
          </span>
        </div>
        <div className="ps-slots-row">
          {totalSlots.map((slotIdx) => {
            const isFilled = step?.result && slotIdx < step.result.length;
            const val = isFilled ? step.result[slotIdx] : null;
            const isActive = step?.positionIndex === slotIdx && !isFilled;

            return (
              <motion.div
                key={`slot-${slotIdx}`}
                className={`ps-slot-card ${isFilled ? "filled" : ""} ${isActive ? "active-slot" : ""}`}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  borderColor: isFilled
                    ? "#10b981"
                    : isActive
                      ? "#6366f1"
                      : "var(--border)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="ps-slot-label">Slot #{slotIdx + 1}</div>
                <div className="ps-slot-val">
                  {isFilled ? (
                    <motion.span
                      key={`val-${val}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="ps-filled-badge"
                    >
                      {val}
                    </motion.span>
                  ) : isActive ? (
                    <span className="ps-pending-pulse">?</span>
                  ) : (
                    <span className="ps-empty-dash">—</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Factorial Decision Buckets (Search Space Partitioning) */}
      {step?.buckets && step.buckets.length > 0 && (
        <motion.div
          className="ps-buckets-section"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="ps-section-header">
            <span>
              🎯 Factorial Decision Buckets (Block Size = {step.blockSize})
            </span>
            <span className="ps-badge-formula">
              index = ⌊k / {step.blockSize}⌋ = ⌊{step.currentK} /{" "}
              {step.blockSize}⌋ = {step.index}
            </span>
          </div>
          <div className="ps-buckets-grid">
            {step.buckets.map((b) => (
              <div
                key={`bucket-${b.num}`}
                className={`ps-bucket-card ${b.isTarget ? "is-target" : b.isBypassed ? "is-bypassed" : "is-beyond"}`}
              >
                <div className="ps-bucket-top">
                  <span className="ps-bucket-num">
                    Starts with: <strong>{b.num}</strong>
                  </span>
                  <span className="ps-bucket-idx">index [{b.index}]</span>
                </div>
                <div className="ps-bucket-range">
                  Sub-rank range:{" "}
                  <code>
                    [{b.startK} .. {b.endK}]
                  </code>
                </div>
                <div className="ps-bucket-status">
                  {b.isTarget && (
                    <span className="ps-target-badge">
                      ★ Target k={step.currentK} is HERE (Pick {b.num})
                    </span>
                  )}
                  {b.isBypassed && (
                    <span className="ps-bypassed-badge">
                      ✓ Bypassed ({b.size} perms)
                    </span>
                  )}
                  {b.isBeyond && (
                    <span className="ps-beyond-badge">— Beyond target</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Numbers Pool & Factorial Table Row */}
      <div className="ps-split-row">
        <div className="ps-pool-card">
          <div className="ps-card-title">
            <span>Available Digits Pool</span>
            <span className="ps-pool-count">
              ({step?.nums?.length ?? 0} remaining)
            </span>
          </div>
          <div className="ps-pool-items">
            {!step?.nums || step.nums.length === 0 ? (
              <div className="ps-pool-empty">
                All digits placed in permutation!
              </div>
            ) : (
              step.nums.map((v, i) => {
                const isSelected = step?.index === i;
                return (
                  <motion.div
                    key={`num-${v}`}
                    className={`ps-pool-badge ${isSelected ? "selected" : ""}`}
                    animate={{
                      scale: isSelected ? 1.15 : 1,
                      backgroundColor: isSelected
                        ? "#6366f1"
                        : "var(--surface3)",
                      color: isSelected ? "#ffffff" : "var(--text)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="ps-pool-idx">[{i}]</span>
                    <span className="ps-pool-val">{v}</span>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="ps-facts-card">
          <div className="ps-card-title">
            <span>Factorials Lookup Table</span>
          </div>
          <div className="ps-facts-chips">
            {(step?.factorial ?? []).map((f, i) => {
              const isCurrent = step?.factorialIdx === i;
              return (
                <div
                  key={i}
                  className={`ps-fact-chip ${isCurrent ? "active-fact" : ""}`}
                >
                  <span className="ps-fact-n">{i}!</span>
                  <span className="ps-fact-eq">=</span>
                  <span className="ps-fact-v">{f}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Math Formula Card if applicable */}
      {step?.mathText && (
        <motion.div
          key={step.mathText}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="ps-math-banner"
        >
          <span className="ps-math-tag">Formula</span>
          <span className="ps-math-body">{step.mathText}</span>
        </motion.div>
      )}

      {/* Final Completed Result Card */}
      {step?.finalResult && (
        <motion.div
          className="ps-final-card"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 20 }}
        >
          <div className="ps-final-title">
            ✨ Final {k}-th Permutation Result
          </div>
          <div className="ps-final-seq">"{step.finalResult}"</div>
        </motion.div>
      )}
    </div>
  );
}

export default function PermutationSequenceVisualizer() {
  const [example, setExample] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(example.n);
  const [kInput, setKInput] = useState(example.k);

  const maxPerms = useMemo(() => {
    let res = 1;
    const nVal = Number(nInput) || 1;
    for (let i = 2; i <= Math.min(nVal, 8); i++) res *= i;
    return res;
  }, [nInput]);

  const { n, k, inputError } = useMemo(() => {
    const nVal = Number(nInput);
    const kVal = Number(kInput);
    if (isNaN(nVal) || nVal < 1 || nVal > 7) {
      return { n: 4, k: 9, inputError: "n must be between 1 and 7" };
    }
    if (isNaN(kVal) || kVal < 1 || kVal > maxPerms) {
      return {
        n: nVal,
        k: 1,
        inputError: `k must be between 1 and ${maxPerms}`,
      };
    }
    return { n: nVal, k: kVal, inputError: "" };
  }, [nInput, kInput, maxPerms]);

  const steps = useMemo(() => generateSteps(n, k), [n, k]);

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
      setExample(ex);
      setNInput(ex.n);
      setKInput(ex.k);
      handleReset();
    },
    [handleReset],
  );

  const primaryPanel = (
    <div className="ps-panel">
      <header className="ps-head">
        <span>🔢 K-th Permutation Sequence (Factorial Number System)</span>
        {inputError && <span className="ps-error">{inputError}</span>}
      </header>
      <div className="ps-body">
        <VisualizationPanel n={n} k={k} step={step} />
      </div>
    </div>
  );

  const inputPanel = (
    <ManualInputPanel
      fields={[
        { key: "n", label: "n (elements 1..n)", type: "number" },
        { key: "k", label: "k (permutation rank)", type: "number" },
      ]}
      values={{ n: nInput, k: kInput }}
      onChange={(field, val) => {
        if (field === "n") setNInput(val);
        if (field === "k") setKInput(val);
        handleReset();
      }}
      examples={EXAMPLES}
      activeLabel={example?.label}
      applyExample={applyExample}
      inputError={inputError}
    />
  );

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
    <div className="ps-status">
      {step?.message || `Ready. Step ${stepIndex + 1} of ${steps.length}`}
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
        autoScroll={autoScrollCode}
        onAutoScrollChange={setAutoScrollCode}
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
      {showPatternOverlay && (
        <PatternLegend
          currentPhase={step?.phase}
          usedPatterns={PERMUTATIONSEQUENCE_PATTERNS}
        />
      )}
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: "input", title: "Input & Examples" },
      {
        id: "primary",
        title: "🔢 K-th Permutation Board",
        dockMode: "split-bottom",
      },
      { id: "code", title: "Code", dockMode: "split-right" },
      { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
    ],
    [],
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="ps-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
