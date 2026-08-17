import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import "./Visualizer.css";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('merge-sorted-array')
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

const EXAMPLES = getExamples('merge-sorted-array');

function VariablesPanel({ step, ex }) {
  return (
    <div className="msa-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="msa-panel-label">Variables</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#252535', borderRadius: 6, border: '1px solid var(--code-line)' }}>
          <span style={{ color: 'var(--code-dim)', fontSize: 12 }}>i</span>
          <span style={{ color: '#c65108', fontWeight: 600 }}>{step?.i ?? (ex?.m - 1 ?? -1)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#252535', borderRadius: 6, border: '1px solid var(--code-line)' }}>
          <span style={{ color: 'var(--code-dim)', fontSize: 12 }}>j</span>
          <span style={{ color: '#1a6df5', fontWeight: 600 }}>{step?.j ?? (ex?.n - 1 ?? -1)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#252535', borderRadius: 6, border: '1px solid var(--code-line)' }}>
          <span style={{ color: 'var(--code-dim)', fontSize: 12 }}>k</span>
          <span style={{ color: '#2f8628', fontWeight: 600 }}>{step?.k ?? (ex ? ex.m + ex.n - 1 : -1)}</span>
        </div>
        <div style={{ padding: '8px 12px', backgroundColor: '#252535', borderRadius: 6, border: '1px solid var(--code-line)', fontSize: 12, color: 'var(--code-dim)' }}>
          <div style={{ marginBottom: 6, color: 'var(--code-dim)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Current Action</div>
          {step?.message || "Initialize pointers"}
        </div>
      </div>
    </div>
  );
}

function VisualizationPanel({ ex, setEx, step, applyEx, nums1Ptrs, nums2Ptrs }) {
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

  return (
    <div className="msa-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="msa-panel-label">Merge Arrays</div>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, overflow: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: ex.label === e.label ? '#dbeafe' : 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
        <div>{renderArray(step?.a ?? ex.nums1, "nums1", nums1Ptrs)}</div>
        <div>{renderArray(step?.b ?? ex.nums2, "nums2", nums2Ptrs)}</div>
        {step?.done && (
          <div style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #86efac',
            textAlign: 'center',
            fontWeight: 600,
            color: '#15803d'
          }}>
            ✓ [{(step?.a ?? []).join(", ")}]
          </div>
        )}
      </div>
    </div>
  );
}

const LINE_PATTERN_MAP = {}

export default function MergeSortedArrayVisualizer() {
  const [inputText, setInputText] = useState(JSON.stringify(EXAMPLES[0] ?? { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }));
  const { ex, inputError } = useMemo(() => { try { const value = JSON.parse(inputText), nums1 = value.nums1, nums2 = value.nums2, m = Number(value.m), n = Number(value.n); if (!Array.isArray(nums1) || !Array.isArray(nums2) || !Number.isInteger(m) || !Number.isInteger(n) || m < 0 || n < 0 || m > nums1.length || n !== nums2.length || nums1.length < m + n || [...nums1, ...nums2].some(value => !Number.isFinite(Number(value)))) throw new Error('Use {nums1, m, nums2, n}; nums1 must have m+n slots and nums2 must have n items.'); return { ex: { nums1: nums1.map(Number), m, nums2: nums2.map(Number), n }, inputError: '' } } catch (error) { return { ex: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 }, inputError: error.message } } }, [inputText]);
  const steps = useMemo(() => generateSteps(ex.nums1, ex.m, ex.nums2, ex.n), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setInputText(JSON.stringify(e)); handleReset(); }, [handleReset]);

  const nums1Ptrs = step ? [
    { name: "i", pos: step.i },
    { name: "k", pos: step.k },
  ].filter(p => p.pos >= 0) : [];
  const nums2Ptrs = step ? [{ name: "j", pos: step.j }].filter(p => p.pos >= 0) : [];

  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
    { id: 'vars', title: 'Variables', dockMode: 'split-bottom' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {showPatternOverlay && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step?.phase}
              activeLineDom={activeLineDom}
              activeLine={step?.activeLine}
            />
          )}
        </div>),
    viz: (<VisualizationPanel
          ex={ex}
          step={step}
          applyEx={applyEx}
          nums1Ptrs={nums1Ptrs}
          nums2Ptrs={nums2Ptrs}
        />),
    vars: (<VariablesPanel step={step} ex={ex} />),
  }), [step, SOLUTION_CODE, connectivity.highlightedLines, connectivity.handleLineSelect, setActiveLineDom, ex, applyEx, nums1Ptrs, nums2Ptrs])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'merge', label: 'Merge input (JSON)', type: 'string' }]} values={{ merge: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES} activeLabel={null} applyExample={applyEx} inputError={inputError} />, panelDivs.input)}
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
            {panelDivs.vars && createPortal(panelContents.vars, panelDivs.vars)}
          </>
        )}
      </>
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
    </div>
  );
}
