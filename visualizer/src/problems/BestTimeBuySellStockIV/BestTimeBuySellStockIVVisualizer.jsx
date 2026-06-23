import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from "../../config/examplesRegistry";
import "./BestTimeBuySellStockIVVisualizer.css";

const SOLUTION_CODE_INLINE = [
  { line: 1,  text: "def maxProfit(k, prices):" },
  { line: 2,  text: "    n = len(prices)" },
  { line: 3,  text: "    if k >= n//2: return greedy(prices)" },
  { line: 4,  text: "    # dp[t][i] = max profit using ≤t transactions up to day i" },
  { line: 5,  text: "    dp = [[0]*n for _ in range(k+1)]" },
  { line: 6,  text: "    for t in range(1, k+1):" },
  { line: 7,  text: "        max_so_far = -prices[0]" },
  { line: 8,  text: "        for i in range(1, n):" },
  { line: 9,  text: "            max_so_far = max(max_so_far," },
  { line: 10, text: "                         dp[t-1][i-1] - prices[i-1])" },
  { line: 11, text: "            dp[t][i] = max(dp[t][i-1]," },
  { line: 12, text: "                        prices[i] + max_so_far)" },
  { line: 13, text: "    return dp[k][n-1]" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('best-time-buy-sell-stock-iv');

function generateSteps(k, prices) {
  const n = prices.length;
  const steps = [];
  const dp = Array.from({ length: k + 1 }, () => Array(n).fill(0));

  steps.push({ activeLine: 5, dp, t: -1, i: -1, msf: null, phase: "init", message: `k=${k}, n=${n}. Init dp all zeros.` });

  for (let t = 1; t <= k; t++) {
    let maxSoFar = -prices[0];
    steps.push({ activeLine: 7, dp, t, i: 0, msf: maxSoFar, phase: "t-init", message: `t=${t}: max_so_far = -prices[0] = ${maxSoFar}` });
    for (let i = 1; i < n; i++) {
      const candidate = dp[t - 1][i - 1] - prices[i - 1];
      if (candidate > maxSoFar) maxSoFar = candidate;
      const newVal = Math.max(dp[t][i - 1], prices[i] + maxSoFar);
      dp[t][i] = newVal;
      steps.push({
        activeLine: 12, dp, t, i, msf: maxSoFar, phase: "fill",
        message: `t=${t}, i=${i}: msf=max(${maxSoFar}, dp[${t-1}][${i-1}]-p[${i-1}])=${maxSoFar}; dp[${t}][${i}]=max(dp[${t}][${i-1}], p[${i}]+msf)=${newVal}`,
      });
    }
  }

  steps.push({ activeLine: 13, dp, t: k, i: n - 1, msf: null, phase: "done", done: true, message: `Max profit with ≤${k} transactions = ${dp[k][n - 1]}` });
  return steps;
}

export default function BestTimeBuySellStockIVVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.k, ex.prices), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const dp = step?.dp ?? Array.from({ length: ex.k + 1 }, () => Array(ex.prices.length).fill(0));
  const activeT = step?.t ?? -1;
  const activeI = step?.i ?? -1;
  const msf = step?.msf;
  const prices = ex.prices;
  const k = ex.k;
  const n = prices.length;
  const answer = dp[k]?.[n - 1] ?? 0;

  const maxPrice = Math.max(...prices);
  const SVG_W = 280, SVG_H = 60;
  const xStep = (SVG_W - 20) / (n - 1);
  const yScale = (SVG_H - 10) / maxPrice;
  const polyline = prices.map((p, i) => `${10 + i * xStep},${SVG_H - p * yScale}`).join(" ");

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
      title: '📈 Stock Transactions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(e => (
              <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>
                {e.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Price chart</div>
          <svg width={SVG_W} height={SVG_H + 4} style={{ border: '1px solid #e2e8f0', borderRadius: 4, backgroundColor: '#f8fafc' }}>
            <polyline points={polyline} fill="none" stroke="#0ea5e9" strokeWidth="2" />
            {prices.map((p, i) => (
              <circle key={i} cx={10 + i * xStep} cy={SVG_H - p * yScale} r={i === activeI ? 5 : 3}
                fill={i === activeI ? '#fbbf24' : '#0ea5e9'} />
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: 11, fontWeight: 600 }}>
            {prices.map((p, i) => (
              <span key={i} style={{
                padding: '4px 6px', borderRadius: 3,
                backgroundColor: i === activeI ? '#fbbf24' : '#f3f4f6',
                color: '#1e293b'
              }}>
                {p}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>DP table (partial)</div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>t</th>
                  {prices.slice(0, 5).map((_, i) => <th key={i} style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, minWidth: 32 }}>{i}</th>)}
                  {prices.length > 5 && <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>...</th>}
                </tr>
              </thead>
              <tbody>
                {dp.slice(0, Math.min(k + 1, 4)).map((row, t) => (
                  <tr key={t}>
                    <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600 }}>{t}</th>
                    {row.slice(0, 5).map((val, i) => {
                      const isActive = t === activeT && i === activeI;
                      return (
                        <motion.td key={i} animate={{ scale: isActive ? 1.2 : 1 }} style={{
                          padding: '4px 6px', border: '1px solid #e2e8f0',
                          backgroundColor: isActive ? '#dbeafe' : val > 0 ? '#f0fdf4' : 'white',
                          color: isActive ? '#1e40af' : '#1e293b', fontWeight: isActive ? 'bold' : 'normal',
                          minWidth: 32, textAlign: 'center'
                        }}>
                          {val}
                        </motion.td>
                      );
                    })}
                    {row.length > 5 && <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', color: '#64748b' }}>...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Transactions</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{activeT >= 0 ? activeT : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Day</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{activeI >= 0 ? activeI : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>max_so_far</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#f59e0b' }}>{msf == null ? '—' : msf}</div>
            </div>
          </div>

          {step?.done && (
            <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>
              ✓ Max profit = {answer}
            </div>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, prices, k, n, activeT, activeI, msf, dp, answer]);

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
