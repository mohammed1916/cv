import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../../../components/shared/DockableWorkspace";
import FloatingPanel from "../../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../../components/CodeTracePanel";
import PlaybackControls from "../../../../components/PlaybackControls";
import PatternOverlay from "../../../../components/PatternOverlay";
import { usePlaybackState } from "../../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../../../config/examplesRegistry'
import "./MinSizeSubarraySumVisualizer.css";

const EXAMPLES = getExamples('min-size-subarray-sum');

function generateSteps(target, nums) {
  const steps = [];
  let l = 0, total = 0, res = Infinity;
  steps.push({ activeLine: 2, l, r: -1, total, res, message: `Init l=0, total=0, res=∞, target=${target}` });

  for (let r = 0; r < nums.length; r++) {
    total += nums[r];
    steps.push({ activeLine: 4, l, r, total, res, message: `r=${r}: total += nums[${r}](${nums[r]}) → total=${total}` });
    while (total >= target) {
      const len = r - l + 1;
      if (len < res) res = len;
      steps.push({ activeLine: 6, l, r, total, res, message: `total(${total}) >= target(${target}) → window[${l}..${r}] len=${len}, res=${res}` });
      total -= nums[l];
      l++;
      steps.push({ activeLine: 8, l, r, total, res, message: `Shrink left: l=${l}, total=${total}` });
    }
  }
  const finalRes = res === Infinity ? 0 : res;
  steps.push({ activeLine: 9, l, r: nums.length - 1, total, res: finalRes, result: finalRes, message: res === Infinity ? `res=∞ → return 0 (no valid subarray)` : `return ${finalRes}` });
  return steps;
}

export default function MinSizeSubarraySumVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.target, ex.nums), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '📊 Sliding Window',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Target: <strong>{ex.target}</strong></div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map(e => (
                <button
                  key={e.label}
                  onClick={() => applyEx(e)}
                  style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', paddingBottom: 8 }}>
            {ex.nums.map((v, i) => {
              const inWindow = step != null && step.r >= 0 && i >= step.l && i <= step.r;
              const isL = step?.l === i;
              const isR = step?.r === i;
              return (
                <motion.div
                  key={i}
                  animate={{ scale: inWindow ? 1.15 : 1, y: inWindow ? -8 : 0 }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 6,
                    backgroundColor: inWindow ? (isL || isR ? '#fbbf24' : '#dbeafe') : '#f3f4f6',
                    border: isL || isR ? '3px solid #f59e0b' : inWindow ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: inWindow ? '#1e3a8a' : '#64748b'
                  }}
                >
                  {v}
                </motion.div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: 'l', val: step?.l ?? 0 },
              { label: 'r', val: step?.r === -1 ? '-' : (step?.r ?? '-') },
              { label: 'total', val: step?.total ?? 0 },
              { label: 'res', val: step?.res === Infinity ? '∞' : (step?.res ?? '∞') },
            ].map(({ label, val }) => (
              <div key={label} style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 4, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
                <motion.div key={String(val)} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: 16, fontWeight: 'bold', color: '#0ea5e9', marginTop: 4 }}>{val}</motion.div>
              </div>
            ))}
          </div>

          {step?.result != null && (
            <div style={{ padding: 12, backgroundColor: step.result > 0 ? '#f0fdf4' : '#fee2e2', borderRadius: 6, border: step.result > 0 ? '2px solid #86efac' : '2px solid #fecaca', textAlign: 'center' }}>
              <div style={{ fontWeight: 600, color: step.result > 0 ? '#15803d' : '#991b1b' }}>
                {step.result > 0 ? `✓ Minimum length: ${step.result}` : '✗ No valid subarray (return 0)'}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx]);

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}
