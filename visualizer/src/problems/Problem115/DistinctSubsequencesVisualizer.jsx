import DockableWorkspace from "../../components/shared/DockableWorkspace"
import FloatingPanel from "../../components/shared/FloatingPanel"
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity"
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./DistinctSubsequencesVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE_INLINE = [
  { line: 1,  text: "def numDistinct(s, t):" },
  { line: 2,  text: "    m, n = len(s), len(t)" },
  { line: 3,  text: "    dp = [[0]*(n+1) for _ in range(m+1)]" },
  { line: 4,  text: "    for i in range(m+1): dp[i][0] = 1" },
  { line: 5,  text: "    for i in range(1, m+1):" },
  { line: 6,  text: "        for j in range(1, n+1):" },
  { line: 7,  text: "            dp[i][j] = dp[i-1][j]  # skip s[i]" },
  { line: 8,  text: "            if s[i-1] == t[j-1]:" },
  { line: 9,  text: "                dp[i][j] += dp[i-1][j-1]  # use s[i]" },
  { line: 10, text: "    return dp[m][n]" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('distinct-subsequences');

function generateSteps(s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const steps = [];

  for (let i = 0; i <= m; i++) dp[i][0] = 1;
  steps.push({ activeLine: 4, dp, i: -1, j: -1, phase: "base", message: "dp[i][0]=1 for all i (empty t always matches)" });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = dp[i - 1][j];
      const matched = s[i - 1] === t[j - 1];
      if (matched) dp[i][j] += dp[i - 1][j - 1];
      steps.push({
        activeLine: matched ? 9 : 7,
        dp, i, j, phase: matched ? "match" : "skip",
        message: matched
          ? `s[${i-1}]='${s[i-1]}'==t[${j-1}]='${t[j-1]}': dp[${i}][${j}]=${dp[i][j]}`
          : `s[${i-1}]='${s[i-1]}'≠t[${j-1}]='${t[j-1]}': dp[${i}][${j}]=dp[${i-1}][${j}]=${dp[i][j]}`,
      });
    }
  }

  steps.push({ activeLine: 10, dp, i: m, j: n, phase: "done", done: true, message: `Distinct subsequences = ${dp[m][n]}` });
  return steps;
}

export default function DistinctSubsequencesVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const steps = useMemo(() => generateSteps(ex.s, ex.t), [ex]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);

  const dp = step?.dp ?? Array.from({ length: ex.s.length + 1 }, () => Array(ex.t.length + 1).fill(0));
  const activeI = step?.i ?? -1;
  const activeJ = step?.j ?? -1;
  const phase = step?.phase ?? "init";
  const s = ex.s, t = ex.t;
  const answer = step?.dp?.[step.i]?.[step.j] ?? 0;
  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
    },
    {
      id: 'viz',
      title: '📝 Distinct Subsequences',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 11 }}>
            <div><span style={{ fontWeight: 600 }}>s:</span> {s}</div>
            <div><span style={{ fontWeight: 600 }}>t:</span> {t}</div>
          </div>
          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 10 }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}></th>
                  <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600 }}>ε</th>
                  {t.split("").map((ch, j) => <th key={j} style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, minWidth: 32 }}>{ch}</th>)}
                </tr>
              </thead>
              <tbody>
                {dp.slice(0, Math.min(dp.length, 8)).map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600 }}>{i === 0 ? 'ε' : s[i - 1]}</td>
                    {row.slice(0, Math.min(row.length, 8)).map((val, j) => {
                      const isActive = i === activeI && j === activeJ;
                      return <motion.td key={j} animate={{ scale: isActive ? 1.2 : 1 }} style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: isActive ? '#dbeafe' : val > 0 ? '#f0fdf4' : 'white', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? '#1e40af' : '#1e293b', minWidth: 32, textAlign: 'center' }}>{val}</motion.td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ {answer}</div>}
        </div>
      )
    }
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, s, t, dp, activeI, activeJ, answer]);

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
