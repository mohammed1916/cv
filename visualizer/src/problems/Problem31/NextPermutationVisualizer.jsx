import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./NextPermutationVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
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

const PATTERNS = ['find-pivot', 'found-pivot', 'found-swap', 'swapped', 'reversed', 'reverse', 'done']

const LINE_PATTERN_MAP = {
  2: 'find-pivot',
  3: 'find-pivot',
  5: 'found-pivot',
  8: 'found-swap',
  9: 'swapped',
  10: 'reversed',
  10: 'reverse',
  11: 'done',
}

const EXAMPLES = getExamples('next-permutation');

function generateSteps(input) {
  const nums = [...input];
  const steps = [];
  const n = nums.length;

  let i = n - 2;
  steps.push({ activeLine: 2, nums: [...nums], i, j: -1, pivotI: -1, swapJ: -1, reverseStart: -1, phase: "find-pivot", message: `Start: find rightmost i where nums[i] < nums[i+1]. i=${i}` });

  while (i >= 0 && nums[i] >= nums[i + 1]) {
    steps.push({ activeLine: 3, nums: [...nums], i, j: -1, pivotI: -1, swapJ: -1, reverseStart: -1, phase: "find-pivot", message: `nums[${i}]=${nums[i]} >= nums[${i+1}]=${nums[i+1]} → decrement i` });
    i--;
  }

  if (i < 0) {
    // Entirely descending – just reverse
    nums.reverse();
    steps.push({ activeLine: 10, nums: [...nums], i: -1, j: -1, pivotI: -1, swapJ: -1, reverseStart: 0, phase: "reverse", message: `No pivot found (fully descending). Reverse entire array → [${nums.join(",")}]` });
    steps.push({ activeLine: 11, nums: [...nums], i: -1, j: -1, pivotI: -1, swapJ: -1, reverseStart: -1, phase: "done", message: `Done: [${nums.join(",")}]` });
    return steps;
  }

  steps.push({ activeLine: 5, nums: [...nums], i, j: -1, pivotI: i, swapJ: -1, reverseStart: -1, phase: "found-pivot", message: `Pivot found: i=${i}, nums[${i}]=${nums[i]}` });

  // Find j: rightmost nums[j] > nums[i]
  let j = n - 1;
  while (nums[j] <= nums[i]) j--;
  steps.push({ activeLine: 8, nums: [...nums], i, j, pivotI: i, swapJ: j, reverseStart: -1, phase: "found-swap", message: `Swap target: j=${j}, nums[${j}]=${nums[j]} > nums[${i}]=${nums[i]}` });

  // Swap
  [nums[i], nums[j]] = [nums[j], nums[i]];
  steps.push({ activeLine: 9, nums: [...nums], i, j, pivotI: i, swapJ: j, reverseStart: -1, phase: "swapped", message: `Swapped nums[${i}] and nums[${j}] → [${nums.join(",")}]` });

  // Reverse suffix
  let lo = i + 1, hi = n - 1;
  while (lo < hi) { [nums[lo], nums[hi]] = [nums[hi], nums[lo]]; lo++; hi--; }
  steps.push({ activeLine: 10, nums: [...nums], i, j, pivotI: i, swapJ: -1, reverseStart: i + 1, phase: "reversed", message: `Reverse suffix from index ${i+1} → [${nums.join(",")}]` });
  steps.push({ activeLine: 11, nums: [...nums], i: -1, j: -1, pivotI: -1, swapJ: -1, reverseStart: -1, phase: "done", message: `Done: [${nums.join(",")}]` });
  return steps;
}

function cellClass(idx, step) {
  if (!step) return "";
  if (step.pivotI === idx) return "pivot";
  if (step.swapJ === idx) return "swap";
  if (step.reverseStart >= 0 && idx >= step.reverseStart) return "reversed";
  return "";
}

// ArrayVisualizationPanel: renders the array with states
function ArrayVisualizationPanel({ step, exampleNums }) {
  return (
    <div className="np-panel">
      <div className="np-panel-label">Array</div>
      <div className="np-array-row">
        <AnimatePresence mode="popLayout">
          {(step?.nums ?? exampleNums).map((val, idx) => (
            <motion.div key={idx} layout className={`np-cell ${cellClass(idx, step)}`}
              animate={{ y: 0 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}>
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

// ExamplesPanel: for selecting input examples
function ExamplesPanel({ examples, currentExample, onExampleChange }) {
  return (
    <div className="np-examples-panel">
      <div className="np-panel-label">Examples</div>
      <div className="np-examples">
        {examples.map((e) => (
          <button key={e.label} className={`np-chip ${currentExample.label === e.label ? "active" : ""}`} onClick={() => onExampleChange(e)}>{e.label}</button>
        ))}
      </div>
    </div>
  );
}

// StatusPanel: shows the current step message
function StatusPanel({ step }) {
  return (
    <div className="np-status">{step?.message ?? "Press Play to begin."}</div>
  );
}

export default function NextPermutationVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[1,2,3]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: "[1,2,3]", inputError: e.message };
    }
  }, [numsInput]);
  const steps = useMemo(() => generateSteps(nums), [nums]);
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

  // Step 2: Extract panel consts
  const examplesPanel = (
    <div className="np-panel">
      <ExamplesPanel examples={EXAMPLES} currentExample={ex} onExampleChange={applyEx} />
    </div>
  );

  const arrayPanel = (
    <div className="np-panel">
      <ArrayVisualizationPanel step={step} exampleNums={nums} />
    </div>
  );

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
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
    <div className="np-status">
      <StatusPanel step={step} />
    </div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
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
        autoScrollLabel="Auto-scroll code"
        showAutoScroll
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  );

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'examples', title: 'Examples', dockMode: 'split-right' },
      { id: 'array', title: 'Array Visualization', dockMode: 'split-right' },
      { id: 'code', title: 'Code Trace', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  // Step 5: Replace return block
  return (
    <div className="np-shell">
      
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.examples && createPortal(examplesPanel, panelDivs.examples)}
          {panelDivs.array && createPortal(arrayPanel, panelDivs.array)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  );
}

