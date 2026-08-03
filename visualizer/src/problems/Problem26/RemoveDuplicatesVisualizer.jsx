import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import AnimatedIterationList from "../../components/shared/AnimatedIterationList";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from '../../components/shared/FloatingPanel';
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { useProblemCode } from "../../hooks/useProblemCode";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./RemoveDuplicatesVisualizer.css";

const REMOVDUPLICATES_PATTERNS = ['check', 'duplicate', 'init', 'new', 'write']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'duplicate',
  4: 'check',
  5: 'write',
  6: 'new',
  7: 'done',
}

const EXAMPLES = getExamples('remove-duplicates');

function generateSteps(numsIn) {
  const steps = [];
  const arr = [...numsIn];
  let k = 1;
  steps.push({ activeLine: 2, arr: [...arr], k, i: -1, phase: "init", message: "Init k=1 (write pointer at index 1)" });
  for (let i = 1; i < arr.length; i++) {
    steps.push({ activeLine: 4, arr: [...arr], k, i, phase: "check", message: `i=${i}: nums[${i}]=${arr[i]} vs nums[${i - 1}]=${arr[i - 1]}` });
    if (arr[i] !== arr[i - 1]) {
      arr[k] = arr[i];
      steps.push({ activeLine: 5, arr: [...arr], k, i, phase: "write", message: `New value! Write nums[${i}]=${arr[i]} → nums[${k}]` });
      k++;
      steps.push({ activeLine: 6, arr: [...arr], k, i, phase: "new", message: `k++ → k=${k}` });
    } else {
      steps.push({ activeLine: 3, arr: [...arr], k, i, phase: "duplicate", message: `Duplicate: nums[${i}]=${arr[i]}, skip` });
    }
  }
  steps.push({ activeLine: 7, arr: [...arr], k, i: -1, phase: "done", done: true, message: `return k=${k}. First ${k} elements: [${arr.slice(0, k).join(", ")}]` });
  return steps;
}

export default function RemoveDuplicatesVisualizer({ problem }) {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const codeLines = useProblemCode(problem, "remove-duplicates-from-sorted-array");
  const steps = useMemo(
    () =>
      generateSteps(ex.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex],
  );
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const arr = step?.arr ?? ex.nums;
  const k = step?.k ?? 1;
  const i = step?.i ?? -1;

  // Step 3: Extract panels into consts
  const primaryPanel = (
    <div className="rd-panel">
      <div className="rd-panel-label">Array (in-place)</div>
      <AnimatedIterationList
        items={arr}
        styleName="pointer-lane"
        className="rd-arr"
        getItemState={(_, index) => {
          const isI = index === i;
          const isK = index === k;
          const inResult = index < k;
          return {
            stateClass: `${isI ? 'i-cell' : ''} ${isK && !isI ? 'k-cell' : ''} ${inResult && !isI && !isK ? 'result' : ''}`.trim(),
            isActive: isI || isK,
          };
        }}
        renderBelow={(_, index) => {
          const isI = index === i;
          const isK = index === k;
          return (
            <div className="rd-ptrs">
              {isI && <span className="rd-ptr i">i</span>}
              {isK && <span className="rd-ptr k">k</span>}
            </div>
          );
        }}
      />
      <div className="rd-divider-row">
        <div className="rd-divider-label">result zone (0..k-1)</div>
        <div className="rd-divider-bar" style={{ width: `${k * 52}px` }} />
      </div>
      {step?.done && (
        <div className="rd-result">✓ k = {k}  →  unique values: [{arr.slice(0, k).join(", ")}]</div>
      )}
    </div>
  );

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={codeLines}
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
    <div className="rd-status">{step?.message ?? "Press Play to begin."}</div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={REMOVDUPLICATES_PATTERNS} />
      )}
      <PlaybackControls
        isPlaying={isPlaying} isDone={isDone} speed={speed}
        onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
        prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
        onSpeedChange={e => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  );

  // Step 4: Add panelConfigs
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Array (in-place)', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="rd-shell">
      <div className="rd-examples">
        {EXAMPLES.map(e => (
          <button key={e.label} className={`rd-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>{e.label}</button>
        ))}
      </div>

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
