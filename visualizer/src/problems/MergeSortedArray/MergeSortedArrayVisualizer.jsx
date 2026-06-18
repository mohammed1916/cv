import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { useSolutionCode } from "../../hooks/useSolutionCode";
import { getExamples } from '../../config/examplesRegistry'
import "./MergeSortedArrayVisualizer.css";

const SOLUTION_CODE = [
  { line: 1,  text: "def merge(nums1, m, nums2, n):" },
  { line: 2,  text: "    i, j, k = m-1, n-1, m+n-1" },
  { line: 3,  text: "    while i >= 0 and j >= 0:" },
  { line: 4,  text: "        if nums1[i] >= nums2[j]:" },
  { line: 5,  text: "            nums1[k] = nums1[i]; i -= 1" },
  { line: 6,  text: "        else:" },
  { line: 7,  text: "            nums1[k] = nums2[j]; j -= 1" },
  { line: 8,  text: "        k -= 1" },
  { line: 9,  text: "    while j >= 0:" },
  { line: 10, text: "        nums1[k] = nums2[j]; j -= 1; k -= 1" },
];

const EXAMPLES = getExamples('merge-sorted-array');

function generateSteps(nums1Init, m, nums2, n) {
  const steps = [];
  const a = [...nums1Init];
  let i = m - 1, j = n - 1, k = m + n - 1;

  steps.push({
    activeLine: 2, a: [...a], b: [...nums2], i, j, k,
    message: `Init i=${i}, j=${j}, k=${k}`,
  });

  while (i >= 0 && j >= 0) {
    steps.push({
      activeLine: 4, a: [...a], b: [...nums2], i, j, k,
      message: `Compare nums1[${i}]=${a[i]} vs nums2[${j}]=${nums2[j]}`,
    });
    if (a[i] >= nums2[j]) {
      a[k] = a[i];
      steps.push({
        activeLine: 5, a: [...a], b: [...nums2], i, j, k,
        message: `nums1[${i}](${a[i]}) >= nums2[${j}](${nums2[j]}) → place ${a[i]} at pos ${k}`,
      });
      i--;
    } else {
      a[k] = nums2[j];
      steps.push({
        activeLine: 7, a: [...a], b: [...nums2], i, j, k,
        message: `nums2[${j}](${nums2[j]}) > nums1[${i}](${a[i]}) → place ${nums2[j]} at pos ${k}`,
      });
      j--;
    }
    k--;
  }

  while (j >= 0) {
    a[k] = nums2[j];
    steps.push({
      activeLine: 10, a: [...a], b: [...nums2], i, j, k,
      message: `Remaining nums2[${j}]=${nums2[j]} → place at pos ${k}`,
    });
    j--; k--;
  }

  steps.push({
    activeLine: 1, a: [...a], b: [...nums2], i, j, k, done: true,
    message: `Done! Merged: [${a.join(", ")}]`,
  });
  return steps;
}

export default function MergeSortedArrayVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const SOLUTION_CODE = useSolutionCode('merge-sorted-array');
  const steps = useMemo(() => generateSteps(ex.nums1, ex.m, ex.nums2, ex.n), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);

  const renderArray = (arr, label, pointers) => (
    <div className="msa-arr-block">
      <div className="msa-arr-label">{label}</div>
      <div className="msa-arr-row">
        {arr.map((v, idx) => {
          const ptrs = pointers.filter(p => p.pos === idx);
          return (
            <div key={idx} className="msa-cell-col">
              <motion.div
                className={`msa-cell ${ptrs.some(p => p.name === "k") ? "k-cell" : ""} ${ptrs.some(p => p.name === "i") ? "i-cell" : ""}`}
                animate={{ scale: ptrs.length > 0 ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                {v === 0 && label === "nums1" && idx >= ex.m && !step?.done ? <span className="msa-zero">0</span> : v}
              </motion.div>
              <div className="msa-idx">{idx}</div>
              <div className="msa-ptrs">
                {ptrs.map(p => <span key={p.name} className={`msa-ptr ${p.name}`}>{p.name}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const nums1Ptrs = step ? [
    { name: "i", pos: step.i },
    { name: "k", pos: step.k },
  ].filter(p => p.pos >= 0) : [];
  const nums2Ptrs = step ? [{ name: "j", pos: step.j }].filter(p => p.pos >= 0) : [];

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
    },
    {
      id: 'viz',
      title: '🔀 Merge Arrays',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>)}
          </div>
          <div>{renderArray(step?.a ?? ex.nums1, "nums1", nums1Ptrs)}</div>
          <div>{renderArray(step?.b ?? ex.nums2, "nums2", nums2Ptrs)}</div>
          {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ [{(step?.a ?? []).join(", ")}]</div>}
        </div>
      )
    }
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, renderArray, nums1Ptrs, nums2Ptrs]);

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}
