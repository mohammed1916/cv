import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../../components/shared/DockableWorkspace";
import FloatingPanel from "../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./PermutationInStringVisualizer.css";

const SOLUTION_CODE = [
    { line: 1, text: "def checkInclusion(s1, s2):" },
    { line: 2, text: "    if len(s1) > len(s2): return False" },
    { line: 3, text: "    need = Counter(s1)" },
    { line: 4, text: "    have = Counter(s2[:len(s1)])" },
    { line: 5, text: "    if have == need: return True" },
    { line: 6, text: "    for i in range(len(s1), len(s2)):" },
    { line: 7, text: "        have[s2[i]] += 1" },
    { line: 8, text: "        out = s2[i - len(s1)]" },
    { line: 9, text: "        have[out] -= 1" },
    { line: 10, text: "        if have[out] == 0: del have[out]" },
    { line: 11, text: "        if have == need: return True" },
    { line: 12, text: "    return False" },
];

const EXAMPLES = getExamples('permutation-in-string');

function countEq(a, b) {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) { if (a[k] !== b[k]) return false; }
    return true;
}

function generateSteps(s1, s2) {
    const steps = [];
    if (s1.length > s2.length) {
        steps.push({ activeLine: 2, winStart: -1, winEnd: -1, have: {}, need: {}, result: false, matchWin: false, message: "s1 longer than s2 → false" });
        return steps;
    }
    const need = {};
    for (const c of s1) need[c] = (need[c] || 0) + 1;
    const have = {};
    for (let i = 0; i < s1.length; i++) have[s2[i]] = (have[s2[i]] || 0) + 1;

    const initMatch = countEq(have, need);
    steps.push({ activeLine: 5, winStart: 0, winEnd: s1.length - 1, have: { ...have }, need: { ...need }, result: initMatch || null, matchWin: initMatch, message: `Initial window [0..${s1.length - 1}]. Match=${initMatch}` });
    if (initMatch) return steps;

    for (let i = s1.length; i < s2.length; i++) {
        have[s2[i]] = (have[s2[i]] || 0) + 1;
        const out = s2[i - s1.length];
        have[out]--;
        if (have[out] === 0) delete have[out];
        const winStart = i - s1.length + 1;
        const match = countEq(have, need);
        steps.push({
            activeLine: match ? 11 : 10, winStart, winEnd: i, have: { ...have }, need: { ...need },
            result: match ? true : null, matchWin: match,
            message: `Window [${winStart}..${i}]: add '${s2[i]}', remove '${out}'. Match=${match}`,
        });
        if (match) return steps;
    }
    steps.push({ activeLine: 12, winStart: -1, winEnd: -1, have: { ...have }, need: { ...need }, result: false, matchWin: false, message: "No permutation found → return false." });
    return steps;
}

export default function PermutationInStringVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => { try { return generateSteps(ex.s1, ex.s2); } catch { return []; } }, [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const relevantChars = step ? [...new Set([...Object.keys(step.need), ...Object.keys(step.have)])] : [];
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
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
            title: '🔍 Sliding Window',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>s1: <strong>{ex.s1}</strong> | s2: <strong>{ex.s2}</strong></div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {EXAMPLES.map(e => (
                            <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                                {e.label}
                            </button>
                        ))}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginTop: 8 }}>Window</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {ex.s2.split("").map((ch, i) => {
                            const inWin = step && i >= step.winStart && i <= step.winEnd;
                            const isMatch = inWin && step.matchWin;
                            return (
                                <motion.div key={i} animate={{ scale: inWin ? 1.2 : 1 }} style={{
                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isMatch ? '#86efac' : inWin ? '#fbbf24' : '#f3f4f6',
                                    border: inWin ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                                    borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b'
                                }}>
                                    {ch}
                                </motion.div>
                            );
                        })}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 6 }}>Need (s1)</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {relevantChars.map(c => (
                                    <div key={c} style={{ padding: '4px 8px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 3, fontSize: 11, fontWeight: 'bold', color: '#1e40af' }}>
                                        {c}:{step?.need?.[c] ?? 0}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d', marginBottom: 6 }}>Have (window)</div>
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {relevantChars.map(c => {
                                    const ok = (step?.need?.[c] ?? 0) === (step?.have?.[c] ?? 0);
                                    return (
                                        <div key={c} style={{ padding: '4px 8px', backgroundColor: ok ? '#dcfce7' : '#fee2e2', border: ok ? '1px solid #86efac' : '1px solid #fecaca', borderRadius: 3, fontSize: 11, fontWeight: 'bold', color: ok ? '#15803d' : '#991b1b' }}>
                                            {c}:{step?.have?.[c] ?? 0}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {step?.result != null && (
                        <div style={{ padding: 12, backgroundColor: step.result ? '#f0fdf4' : '#fee2e2', borderRadius: 6, border: step.result ? '2px solid #86efac' : '2px solid #fecaca', textAlign: 'center', fontWeight: 600, color: step.result ? '#15803d' : '#991b1b' }}>
                            {step.result ? '✓ Permutation found!' : '✗ No permutation found'}
                        </div>
                    )}
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, relevantChars]);

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
