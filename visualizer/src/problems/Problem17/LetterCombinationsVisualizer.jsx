import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./LetterCombinationsVisualizer.css";

const SOLUTION_CODE_INLINE = [
    { line: 1, text: "def letterCombinations(digits):" },
    { line: 2, text: "    if not digits: return []" },
    { line: 3, text: "    phone = {'2':'abc','3':'def','4':'ghi'," },
    { line: 4, text: "             '5':'jkl','6':'mno','7':'pqrs'," },
    { line: 5, text: "             '8':'tuv','9':'wxyz'}" },
    { line: 6, text: "    res = []" },
    { line: 7, text: "    def backtrack(i, path):" },
    { line: 8, text: "        if i == len(digits):" },
    { line: 9, text: "            res.append(''.join(path))" },
    { line: 10, text: "            return" },
    { line: 11, text: "        for c in phone[digits[i]]:" },
    { line: 12, text: "            path.append(c)" },
    { line: 13, text: "            backtrack(i+1, path)" },
    { line: 14, text: "            path.pop()" },
    { line: 15, text: "    backtrack(0, [])" },
    { line: 16, text: "    return res" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const PHONE_MAP = {
    "2": "abc", "3": "def", "4": "ghi", "5": "jkl",
    "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz",
};

function generateSteps(digits) {
    const steps = [];
    const res = [];

    function backtrack(i, path) {
        if (i === digits.length) {
            res.push(path.join(""));
            steps.push({
                phase: "record", activeLine: 9,
                i, path: [...path], res: [...res], activeChar: null, activeDigit: null,
                message: `Complete: "${path.join("")}"`,
            });
            return;
        }

        const letters = PHONE_MAP[digits[i]] ?? "";
        for (const c of letters) {
            path.push(c);
            steps.push({
                phase: "choose", activeLine: 12,
                i, path: [...path], res: [...res], activeChar: c, activeDigit: digits[i],
                message: `digit '${digits[i]}' → try '${c}', path="${path.join("")}"`,
            });
            backtrack(i + 1, path);
            path.pop();
            steps.push({
                phase: "unchoose", activeLine: 14,
                i, path: [...path], res: [...res], activeChar: c, activeDigit: digits[i],
                message: `backtrack: remove '${c}', path="${path.join("")}"`,
            });
        }
    }

    steps.push({ phase: "init", activeLine: 15, i: 0, path: [], res: [], activeChar: null, activeDigit: null, message: `Start for digits="${digits}"` });
    backtrack(0, []);
    steps.push({ phase: "done", activeLine: 16, i: digits.length, path: [], res: [...res], activeChar: null, activeDigit: null, message: `Done. ${res.length} combinations.` });
    return steps;
}

const EXAMPLES = getExamples('letter-combinations');

export default function LetterCombinationsVisualizer() {
    const [digits, setDigits] = useState("23");

    const validDigits = useMemo(() => digits.replace(/[^2-9]/g, "").slice(0, 4), [digits]);
    const steps = useMemo(() => (validDigits.length ? generateSteps(validDigits) : []), [validDigits]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback(
        (ex) => { setDigits(ex.digits); handleReset(); },
        [handleReset]
    );

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
            title: '☎️ Backtracking Paths',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {EXAMPLES.map(ex => (
                                <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                                    {ex.label}
                                </button>
                            ))}
                        </div>
                        <input style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }} value={digits} onChange={e => { setDigits(e.target.value); handleReset(); }} placeholder="digits (e.g. 23)" maxLength={4} />
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Phone keypad</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                        {Object.entries(PHONE_MAP).map(([d, letters]) => (
                            <div key={d} style={{
                                padding: 8, borderRadius: 6, border: validDigits.includes(d) ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                                backgroundColor: step?.activeDigit === d ? '#dbeafe' : '#f8fafc', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 4 }}>{d}</div>
                                <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    {letters.split("").map(l => (
                                        <span key={l} style={{
                                            fontSize: 12, fontWeight: 'bold', padding: '2px 4px',
                                            backgroundColor: step?.activeChar === l && step?.activeDigit === d ? '#fbbf24' : '#f3f4f6',
                                            borderRadius: 3, color: '#1e293b'
                                        }}>
                                            {l}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Current path</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
                        <AnimatePresence mode="popLayout">
                            {(step?.path ?? []).map((c, i) => (
                                <motion.div key={`${i}-${c}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} style={{
                                    padding: '8px 12px', backgroundColor: '#dbeafe', border: '1px solid #0ea5e9', borderRadius: 4,
                                    fontSize: 13, fontWeight: 'bold', color: '#1e40af'
                                }}>
                                    {c}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(step?.path?.length ?? 0) === 0 && <span style={{ color: '#64748b', fontSize: 12 }}>empty</span>}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Results ({step?.res?.length ?? 0})</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1, overflow: 'auto', paddingBottom: 8 }}>
                        <AnimatePresence mode="popLayout">
                            {(step?.res ?? []).map((s, i) => (
                                <motion.div key={s} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} style={{
                                    padding: '8px 12px', backgroundColor: i === (step?.res?.length ?? 0) - 1 && step?.phase === "record" ? '#86efac' : '#f0fdf4',
                                    border: i === (step?.res?.length ?? 0) - 1 && step?.phase === "record" ? '2px solid #22c55e' : '1px solid #86efac',
                                    borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#15803d'
                                }}>
                                    {s}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, digits, setDigits, validDigits, applyExample]);

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
