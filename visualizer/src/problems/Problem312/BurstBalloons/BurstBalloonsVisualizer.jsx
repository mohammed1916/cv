import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import DockableWorkspace from "../../../components/shared/DockableWorkspace";
import FloatingPanel from "../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./BurstBalloonsVisualizer.css";

const SOLUTION_CODE_INLINE = [
    { line: 1, text: "def maxCoins(nums):" },
    { line: 2, text: "    nums = [1] + nums + [1]" },
    { line: 3, text: "    n = len(nums)" },
    { line: 4, text: "    dp = [[0]*n for _ in range(n)]" },
    { line: 5, text: "    for length in range(2, n):" },
    { line: 6, text: "        for left in range(0, n-length):" },
    { line: 7, text: "            right = left + length" },
    { line: 8, text: "            for k in range(left+1, right):" },
    { line: 9, text: "                coins = nums[left]*nums[k]*nums[right]" },
    { line: 10, text: "                val = dp[left][k] + coins + dp[k][right]" },
    { line: 11, text: "                dp[left][right] = max(dp[left][right], val)" },
    { line: 12, text: "    return dp[0][n-1]" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('burst-balloons');

function generateSteps(numsOrig) {
    const nums = [1, ...numsOrig, 1];
    const n = nums.length;
    const dp = Array.from({ length: n }, () => Array(n).fill(0));
    const steps = [];

    steps.push({ activeLine: 4, dp, left: -1, right: -1, k: -1, phase: "init", message: `Padded nums = [${nums.join(", ")}], dp is ${n}×${n}` });

    for (let length = 2; length < n; length++) {
        for (let left = 0; left < n - length; left++) {
            const right = left + length;
            for (let k = left + 1; k < right; k++) {
                const coins = nums[left] * nums[k] * nums[right];
                const val = dp[left][k] + coins + dp[k][right];
                const improved = val > dp[left][right];
                if (improved) dp[left][right] = val;
                steps.push({
                    activeLine: improved ? 11 : 10,
                    dp, left, right, k, coins, val, phase: "fill",
                    message: `dp[${left}][${right}]: k=${k}, ${nums[left]}×${nums[k]}×${nums[right]}=${coins}, total=${val}${improved ? ` → dp[${left}][${right}]=${dp[left][right]}` : ""}`,
                });
            }
        }
    }

    steps.push({ activeLine: 12, dp, left: 0, right: n - 1, k: -1, phase: "done", done: true, message: `Max coins = dp[0][${n - 1}] = ${dp[0][n - 1]}` });
    return steps;
}

export default function BurstBalloonsVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => generateSteps(ex.nums), [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const nums = [1, ...ex.nums, 1];
    const n = nums.length;
    const dp = step?.dp ?? Array.from({ length: n }, () => Array(n).fill(0));
    const activeL = step?.left ?? -1;
    const activeR = step?.right ?? -1;
    const activeK = step?.k ?? -1;

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
            title: '💥 Balloon Bursting',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {EXAMPLES.map(e => (
                            <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>
                                {e.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 4 }}>Padded array</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        {nums.map((v, i) => (
                            <motion.div key={i} animate={{ scale: i === activeK ? 1.3 : 1 }} style={{
                                width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: i === 0 || i === n - 1 ? '#e5e7eb' : i === activeK ? '#fbbf24' : '#f3f4f6',
                                border: i === activeK ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                                borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b'
                            }}>
                                {v}
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 8 }}>DP table</div>
                    <div style={{ overflowX: 'auto', flex: 1 }}>
                        <table style={{ borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}></th>
                                    {Array.from({ length: n }, (_, c) => <th key={c} style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600, minWidth: 32 }}>{c}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {dp.slice(0, n).map((row, r) => (
                                    <tr key={r}>
                                        <th style={{ padding: '4px 6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: 600 }}>{r}</th>
                                        {row.slice(0, n).map((v, c) => {
                                            const isActive = r === activeL && c === activeR;
                                            const isK = (r === activeL && c === activeK) || (c === activeR && r === activeK);
                                            return (
                                                <motion.td key={c}
                                                    animate={{ scale: isActive ? 1.2 : 1 }}
                                                    style={{
                                                        padding: '6px 8px', border: '1px solid #e2e8f0',
                                                        backgroundColor: isActive ? '#dbeafe' : isK ? '#fef3c7' : v > 0 ? '#f0fdf4' : 'white',
                                                        fontWeight: isActive ? 'bold' : 'normal',
                                                        color: isActive ? '#1e40af' : '#1e293b',
                                                        minWidth: 32, textAlign: 'center'
                                                    }}>
                                                    {v || '·'}
                                                </motion.td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Window</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>[{activeL},{activeR}]</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Pivot k</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{activeK >= 0 ? activeK : '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Coins</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#f59e0b' }}>{step?.coins ?? '—'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Total</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#0ea5e9' }}>{step?.val ?? '—'}</div>
                        </div>
                    </div>

                    {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ Max coins = {dp[0]?.[n - 1]}</div>}
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, nums, n, dp, activeL, activeR, activeK]);

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
