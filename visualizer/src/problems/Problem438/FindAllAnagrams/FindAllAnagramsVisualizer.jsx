import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../../config/examplesRegistry'
import "./FindAllAnagramsVisualizer.css";
import { createPortal } from 'react-dom'
const SOLUTION_CODE_INLINE = [
    { line: 1, text: "def findAnagrams(s, p):" },
    { line: 2, text: "    need = Counter(p)" },
    { line: 3, text: "    have = Counter(s[:len(p)])" },
    { line: 4, text: "    result = []" },
    { line: 5, text: "    if have == need: result.append(0)" },
    { line: 6, text: "    for i in range(len(p), len(s)):" },
    { line: 7, text: "        have[s[i]] += 1" },
    { line: 8, text: "        have[s[i-len(p)]] -= 1" },
    { line: 9, text: "        if have[s[i-len(p)]] == 0: del have[s[i-len(p)]]" },
    { line: 10, text: "        winStart = i - len(p) + 1" },
    { line: 11, text: "        if have == need: result.append(winStart)" },
    { line: 12, text: "    return result" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('find-all-anagrams');

function countEq(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) return false;
    for (const k of Object.keys(a)) { if (a[k] !== b[k]) return false; }
    return true;
}

function generateSteps(s, p) {
    const steps = [];
    const need = {};
    for (const c of p) need[c] = (need[c] || 0) + 1;

    const have = {};
    for (let i = 0; i < p.length; i++) {
        const c = s[i];
        if (c !== undefined) have[c] = (have[c] || 0) + 1;
    }

    const result = [];
    const win0 = countEq(have, need);
    if (win0) result.push(0);

    steps.push({
        activeLine: 5, winStart: 0, winEnd: p.length - 1, have: { ...have }, need: { ...need },
        result: [...result], matchWin: win0,
        message: `Initial window [0..${p.length - 1}]. Match=${win0}`,
    });

    for (let i = p.length; i < s.length; i++) {
        have[s[i]] = (have[s[i]] || 0) + 1;
        const outChar = s[i - p.length];
        have[outChar]--;
        if (have[outChar] === 0) delete have[outChar];
        const winStart = i - p.length + 1;
        const match = countEq(have, need);
        if (match) result.push(winStart);
        steps.push({
            activeLine: match ? 11 : 9, winStart, winEnd: i, have: { ...have }, need: { ...need },
            result: [...result], matchWin: match,
            message: `Slide to [${winStart}..${i}]: add '${s[i]}', remove '${outChar}'. Match=${match}${match ? ` → push ${winStart}` : ""}`,
        });
    }

    steps.push({
        activeLine: 12, winStart: -1, winEnd: -1, have: { ...have }, need: { ...need },
        result: [...result], matchWin: false,
        message: `Done. Anagram starts at: [${result.join(", ")}]`,
    });
    return steps;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

export default function FindAllAnagramsVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => { try { return generateSteps(ex.s, ex.p); } catch { return []; } }, [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    // Only show letters present in need or have
    const relevantChars = step ? [...new Set([...Object.keys(step.need), ...Object.keys(step.have)])] : [];

    const panelConfigs = useMemo(() => [
      { id: 'code', title: 'Code' },
      { id: 'viz', title: '🔍 Anagrams', dockMode: 'split-right' },
    ], [])
    const panelContents = useMemo(() => ({
      code: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />),
      viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EXAMPLES.map(e => <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : '#f1f5f9' }}>{e.label}</button>)}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1e293b' }}>s = "{ex.s}" | p = "{ex.p}"</div>
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {ex.s.split("").map((ch, i) => {
                        const inWin = step && i >= step.winStart && i <= step.winEnd;
                        const isMatch = inWin && step.matchWin;
                        const isResult = step?.result?.includes(i);
                        return (
                            <motion.div key={i} animate={{ scale: inWin ? 1.12 : 1 }} style={{
                                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isResult ? '#dcfce7' : inWin ? (isMatch ? '#86efac' : '#fbbf24') : '#f3f4f6',
                                border: inWin ? '2px solid #0ea5e9' : '1px solid #cbd5e1', borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b'
                            }}>
                                {ch}
                            </motion.div>
                        );
                    })}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: '#1e40af' }}>need (p)</div>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {relevantChars.map(c => <span key={c} style={{ padding: '2px 6px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 3, color: '#1e40af', fontWeight: 'bold' }}>{c}:{step?.need?.[c] ?? 0}</span>)}
                        </div>
                    </div>
                    <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, color: '#15803d' }}>have (window)</div>
                        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {relevantChars.map(c => {
                                const ok = (step?.need?.[c] ?? 0) === (step?.have?.[c] ?? 0);
                                return <span key={c} style={{ padding: '2px 6px', backgroundColor: ok ? '#dcfce7' : '#fee2e2', border: ok ? '1px solid #86efac' : '1px solid #fecaca', borderRadius: 3, color: ok ? '#15803d' : '#991b1b', fontWeight: 'bold' }}>{c}:{step?.have?.[c] ?? 0}</span>;
                            })}
                        </div>
                    </div>
                </div>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Results: {(step?.result ?? []).join(', ') || 'none'}</div>
                </div>
            </div>),
    }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, relevantChars])
    const [panelDivs, setPanelDivs] = useState(null)
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
        <div className="problem-shell">
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
                <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
            </FloatingPanel>
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    );
}

