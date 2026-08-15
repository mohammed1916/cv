import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from "../../config/examplesRegistry";
import "./BestTimeBuySellStockIVVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
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
  const [kInput, setKInput] = useState(2);
  const [pricesInput, setPricesInput] = useState("[3,2,6,5,0,3]");
  const { k, prices, inputError } = useMemo(() => {
    try {
      const parsedK = Number(kInput); if (isNaN(parsedK)) throw new Error('k must be a number');
      const parsedPrices = JSON.parse(pricesInput); if (!Array.isArray(parsedPrices)) throw new Error('prices must be an array');
      return { k: parsedK, prices: parsedPrices, inputError: '' };
    } catch (e) {
      return { k: 2, prices: "[3,2,6,5,0,3]", inputError: e.message };
    }
  }, [kInput, pricesInput]);
  const steps = useMemo(() => generateSteps(k, prices), [k, prices]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setKInput(String(e.k)); setPricesInput(JSON.stringify(e.prices)); handleReset(); }, [handleReset]);;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const dp = step?.dp ?? Array.from({ length: k + 1 }, () => Array(prices.length).fill(0));
  const activeT = step?.t ?? -1;
  const activeI = step?.i ?? -1;
  const msf = step?.msf;
  const n = prices.length;
  const answer = dp[k]?.[n - 1] ?? 0;

  const maxPrice = Math.max(...prices);
  const SVG_W = 280, SVG_H = 60;
  const xStep = (SVG_W - 20) / (n - 1);
  const yScale = (SVG_H - 10) / maxPrice;
  const polyline = prices.map((p, i) => `${10 + i * xStep},${SVG_H - p * yScale}`).join(" ");

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📈 Stock Transactions', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(e => (
              <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : 'var(--surface2)' }}>
                {e.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>Price chart</div>
          <svg width={SVG_W} height={SVG_H + 4} style={{ border: '1px solid var(--text)', borderRadius: 4, backgroundColor: 'var(--surface)' }}>
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
                color: 'var(--surface2)'
              }}>
                {p}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginTop: 4 }}>DP table (partial)</div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 6px', border: '1px solid var(--text)', backgroundColor: 'var(--surface)' }}>t</th>
                  {prices.slice(0, 5).map((_, i) => <th key={i} style={{ padding: '4px 6px', border: '1px solid var(--text)', backgroundColor: 'var(--surface)', fontWeight: 600, minWidth: 32 }}>{i}</th>)}
                  {prices.length > 5 && <th style={{ padding: '4px 6px', border: '1px solid var(--text)', backgroundColor: 'var(--surface)' }}>...</th>}
                </tr>
              </thead>
              <tbody>
                {dp.slice(0, Math.min(k + 1, 4)).map((row, t) => (
                  <tr key={t}>
                    <th style={{ padding: '4px 6px', border: '1px solid var(--text)', backgroundColor: 'var(--surface)', fontWeight: 600 }}>{t}</th>
                    {row.slice(0, 5).map((val, i) => {
                      const isActive = t === activeT && i === activeI;
                      return (
                        <motion.td key={i} animate={{ scale: isActive ? 1.2 : 1 }} style={{
                          padding: '4px 6px', border: '1px solid var(--text)',
                          backgroundColor: isActive ? '#dbeafe' : val > 0 ? '#f0fdf4' : 'white',
                          color: isActive ? '#1e40af' : 'var(--surface2)', fontWeight: isActive ? 'bold' : 'normal',
                          minWidth: 32, textAlign: 'center'
                        }}>
      
                          {val}
                        </motion.td>
                      );
                    })}
                    {row.length > 5 && <td style={{ padding: '4px 6px', border: '1px solid var(--text)', color: 'var(--text-muted)' }}>...</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Transactions</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--surface2)' }}>{activeT >= 0 ? activeT : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Day</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--surface2)' }}>{activeI >= 0 ? activeI : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>max_so_far</div>
              <div style={{ fontSize: 13, fontWeight: 'bold', color: '#a36907' }}>{msf == null ? '—' : msf}</div>
            </div>
          </div>

          {step?.done && (
            <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>
              ✓ Max profit = {answer}
            </div>
          )}
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, prices, k, n, activeT, activeI, msf, dp, answer])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"k","label":"k","type":"number"},{"key":"prices","label":"prices","type":"array"}]}
          values={{ k: kInput, prices: pricesInput }}
          onChange={(k, v) => { if (k === 'k') setKInput(v); if (k === 'prices') setPricesInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  );
}

