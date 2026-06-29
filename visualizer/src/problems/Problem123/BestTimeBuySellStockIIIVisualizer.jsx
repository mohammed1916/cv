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
import { getExamples } from "../../config/examplesRegistry";
import "./BestTimeBuySellStockIIIVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE_INLINE = [
    { line: 1, text: "def maxProfit(prices):" },
    { line: 2, text: "    b1 = b2 = -inf  # best profit after 1st/2nd buy" },
    { line: 3, text: "    s1 = s2 = 0     # best profit after 1st/2nd sell" },
    { line: 4, text: "    for p in prices:" },
    { line: 5, text: "        b1 = max(b1, -p)         # buy at p (tx1)" },
    { line: 6, text: "        s1 = max(s1, b1 + p)     # sell at p (tx1)" },
    { line: 7, text: "        b2 = max(b2, s1 - p)     # buy at p (tx2)" },
    { line: 8, text: "        s2 = max(s2, b2 + p)     # sell at p (tx2)" },
    { line: 9, text: "    return s2" },
];

const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('best-time-buy-sell-stock-iii');

function generateSteps(prices) {
    const steps = [];
    let b1 = -Infinity, b2 = -Infinity, s1 = 0, s2 = 0;

    steps.push({ activeLine: 2, b1, b2, s1, s2, idx: -1, phase: "init", message: "Init: b1=b2=-∞, s1=s2=0" });

    for (let i = 0; i < prices.length; i++) {
        const p = prices[i];
        b1 = Math.max(b1, -p);
        s1 = Math.max(s1, b1 + p);
        b2 = Math.max(b2, s1 - p);
        s2 = Math.max(s2, b2 + p);
        steps.push({
            activeLine: 8, b1, b2, s1, s2, idx: i, phase: "update",
            message: `p=${p}: b1=${b1 === Number.NEGATIVE_INFINITY ? "−∞" : b1} s1=${s1} b2=${b2 === Number.NEGATIVE_INFINITY ? "−∞" : b2} s2=${s2}`,
        });
    }

    steps.push({ activeLine: 9, b1, b2, s1, s2, idx: -1, phase: "done", done: true, message: `Max profit = s2 = ${s2}` });
    return steps;
}

export default function BestTimeBuySellStockIIIVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => generateSteps(ex.prices), [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const prices = ex.prices;
    const idx = step?.idx ?? -1;
    const b1 = step?.b1 ?? -Infinity;
    const b2 = step?.b2 ?? -Infinity;
    const s1 = step?.s1 ?? 0;
    const s2 = step?.s2 ?? 0;
    const phase = step?.phase ?? "init";

    const maxP = Math.max(...prices);
    const SVG_W = 300, SVG_H = 70;
    const xStep = prices.length > 1 ? (SVG_W - 20) / (prices.length - 1) : SVG_W;
    const yScale = (SVG_H - 10) / maxP;
    const polyline = prices.map((p, i) => `${10 + i * xStep},${SVG_H - p * yScale}`).join(" ");

    const fmt = v => v === -Infinity || v === Number.NEGATIVE_INFINITY ? "−∞" : v;

    const dockPanels = useMemo(() => [
        {
            id: 'code',
            title: 'Code',
            content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        },
        {
            id: 'viz',
            title: '📈 2 Transactions',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>)}
                    </div>
                    <svg width={SVG_W} height={SVG_H + 4} style={{ border: '1px solid #e2e8f0', borderRadius: 4 }}>
                        <polyline points={polyline} fill="none" stroke="#0ea5e9" strokeWidth="2" />
                        {prices.map((p, i) => <circle key={i} cx={10 + i * xStep} cy={SVG_H - p * yScale} r={i === idx ? 5 : 3} fill={i === idx ? '#fbbf24' : '#0ea5e9'} />)}
                        {idx >= 0 && <line x1={10 + idx * xStep} y1={0} x2={10 + idx * xStep} y2={SVG_H} stroke="#f9e2af44" strokeWidth="1" strokeDasharray="3,3" />}
                    </svg>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        {[{ label: 'b1', val: fmt(b1), cls: '#fee2e2' }, { label: 's1', val: fmt(s1), cls: '#dcfce7' }, { label: 'b2', val: fmt(b2), cls: '#fee2e2' }, { label: 's2', val: fmt(s2), cls: '#dbeafe' }].map(({ label, val, cls }) => (
                            <div key={label} style={{ padding: 8, backgroundColor: cls, borderRadius: 6, textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: '600', color: '#1e293b', marginBottom: 4 }}>{label}</div>
                                <motion.div key={String(val)} initial={{ scale: 1.2 }} animate={{ scale: 1 }} style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{val}</motion.div>
                            </div>
                        ))}
                    </div>
                    {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ Max profit = {s2}</div>}
                </div>
            )
        }
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, prices, idx, b1, b2, s1, s2, fmt]);

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
