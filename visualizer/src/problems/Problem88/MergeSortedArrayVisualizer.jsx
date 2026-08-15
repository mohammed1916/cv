import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./MergeSortedArrayVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const MERGEARRAY_PATTERNS = ['init', 'compare', 'copy_nums1', 'copy_nums2', 'done']

const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'compare',
  5: 'copy_nums1',
  7: 'copy_nums2',
  10: 'copy_nums2',
}

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
    phase: 'init',
    activeLine: 2, a: [...a], b: [...nums2], i, j, k,
    message: `Init i=${i}, j=${j}, k=${k}`,
  });

  while (i >= 0 && j >= 0) {
    steps.push({
      phase: 'compare',
      activeLine: 4, a: [...a], b: [...nums2], i, j, k,
      message: `Compare nums1[${i}]=${a[i]} vs nums2[${j}]=${nums2[j]}`,
    });
    if (a[i] >= nums2[j]) {
      a[k] = a[i];
      steps.push({
        phase: 'copy_nums1',
        activeLine: 5, a: [...a], b: [...nums2], i, j, k,
        message: `nums1[${i}](${a[i]}) >= nums2[${j}](${nums2[j]}) → place ${a[i]} at pos ${k}`,
      });
      i--;
    } else {
      a[k] = nums2[j];
      steps.push({
        phase: 'copy_nums2',
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
      phase: 'copy_nums2',
      activeLine: 10, a: [...a], b: [...nums2], i, j, k,
      message: `Remaining nums2[${j}]=${nums2[j]} → place at pos ${k}`,
    });
    j--; k--;
  }

  steps.push({
    phase: 'done',
    activeLine: 1, a: [...a], b: [...nums2], i, j, k, done: true,
    message: `Done! Merged: [${a.join(", ")}]`,
  });
  return steps;
}

export default function MergeSortedArrayVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nums1Input, setNums1Input] = useState("[1,2,3,0,0,0]");
  const [mInput, setMInput] = useState(3);
  const [nums2Input, setNums2Input] = useState("[2,5,6]");
  const [nInput, setNInput] = useState(3);
  const { nums1, m, nums2, n, inputError } = useMemo(() => {
    try {
      const parsedNums1 = JSON.parse(nums1Input); if (!Array.isArray(parsedNums1)) throw new Error('nums1 must be an array');
      const parsedM = Number(mInput); if (isNaN(parsedM)) throw new Error('m must be a number');
      const parsedNums2 = JSON.parse(nums2Input); if (!Array.isArray(parsedNums2)) throw new Error('nums2 must be an array');
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { nums1: parsedNums1, m: parsedM, nums2: parsedNums2, n: parsedN, inputError: '' };
    } catch (e) {
      return { nums1: "[1,2,3,0,0,0]", m: 3, nums2: "[2,5,6]", n: 3, inputError: e.message };
    }
  }, [nums1Input, mInput, nums2Input, nInput]);
  const steps = useMemo(() => generateSteps(nums1, m, nums2, n), [nums1, m, nums2, n]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setNums1Input(JSON.stringify(e.nums1)); setMInput(String(e.m)); setNums2Input(JSON.stringify(e.nums2)); setNInput(String(e.n)); handleReset(); }, [handleReset]);;

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
                {v === 0 && label === "nums1" && idx >= m && !step?.done ? <span className="msa-zero">0</span> : v}
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

  // Extract panels into consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"nums1","label":"nums1","type":"array"},{"key":"m","label":"m","type":"number"},{"key":"nums2","label":"nums2","type":"array"},{"key":"n","label":"n","type":"number"}]}
        values={{ nums1: nums1Input, m: mInput, nums2: nums2Input, n: nInput }}
        onChange={(k, v) => { if (k === 'nums1') setNums1Input(v); if (k === 'm') setMInput(v); if (k === 'nums2') setNums2Input(v); if (k === 'n') setNInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>)}
      </div>
      <div>{renderArray(step?.a ?? nums1, "nums1", nums1Ptrs)}</div>
      <div>{renderArray(step?.b ?? nums2, "nums2", nums2Ptrs)}</div>
      {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ [{(step?.a ?? []).join(", ")}]</div>}
    </div>
  
    </>);

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
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

  const statusPanel = (
    <div className="msa-status">
      {step?.message || 'Ready'}
    </div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={MERGEARRAY_PATTERNS} />
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
        onSpeedChange={e => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  );

  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🔀 Merge Arrays', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="msa-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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

