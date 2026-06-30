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
import { getExamples } from '../../config/examplesRegistry'
import "./ReorderListVisualizer.css";
const SOLUTION_CODE = [
    { line: 1, text: "def reorderList(head):" },
    { line: 2, text: "    # Find middle" },
    { line: 3, text: "    slow, fast = head, head.next" },
    { line: 4, text: "    while fast and fast.next:" },
    { line: 5, text: "        slow = slow.next; fast = fast.next.next" },
    { line: 6, text: "    second = slow.next; slow.next = None" },
    { line: 7, text: "    # Reverse second half" },
    { line: 8, text: "    prev, curr = None, second" },
    { line: 9, text: "    while curr:" },
    { line: 10, text: "        nxt = curr.next" },
    { line: 11, text: "        curr.next = prev; prev = curr; curr = nxt" },
    { line: 12, text: "    # Merge" },
    { line: 13, text: "    first, second = head, prev" },
    { line: 14, text: "    while second:" },
    { line: 15, text: "        tmp1, tmp2 = first.next, second.next" },
    { line: 16, text: "        first.next = second; second.next = tmp1" },
    { line: 17, text: "        first, second = tmp1, tmp2" },
];

function generateSteps(arr) {
    const steps = [];

    // Build linked list as array of values
    let list = [...arr];

    function snap(activeLine, message, extra = {}) {
        steps.push({ activeLine, list: [...list], message, ...extra });
    }

    snap(3, "Find middle with slow/fast pointers.", { slow: 0, fast: 1, phase: "find_mid" });

    let si = 0, fi = 1;
    while (fi < list.length && fi + 1 < list.length) {
        si++; fi += 2;
        snap(5, `slow→${si} (val=${list[si]}), fast→${fi}`, { slow: si, fast: fi, phase: "find_mid" });
    }
    // si is mid index
    const mid = si;
    snap(6, `Middle is index ${mid}. Split list into two halves.`, { slow: mid, fast: -1, phase: "split" });

    const firstHalf = list.slice(0, mid + 1);
    const secondHalf = list.slice(mid + 1);

    snap(8, `Reverse second half: [${secondHalf.join("→")}]`, { firstHalf: [...firstHalf], secondHalf: [...secondHalf], phase: "reverse_start" });

    const reversed = [...secondHalf].reverse();
    for (let i = 0; i < reversed.length; i++) {
        snap(11, `Reversed so far: [${reversed.slice(0, i + 1).join("→")}]`, { firstHalf: [...firstHalf], secondHalf: reversed.slice(0, i + 1), phase: "reversing" });
    }

    snap(13, `Merge first=[${firstHalf.join("→")}] and reversed=[${reversed.join("→")}]`, { firstHalf: [...firstHalf], secondHalf: [...reversed], phase: "merge_start" });

    // Merge
    const result = [];
    let f = 0, s = 0;
    while (s < reversed.length) {
        result.push(firstHalf[f]);
        snap(16, `Take from first: ${firstHalf[f]}`, { result: [...result, ...firstHalf.slice(f + 1), ...reversed.slice(s)], mergeF: f, mergeS: s, phase: "merging" });
        f++;
        result.push(reversed[s]);
        snap(16, `Take from second: ${reversed[s]}`, { result: [...result, ...firstHalf.slice(f), ...reversed.slice(s + 1)], mergeF: f, mergeS: s, phase: "merging" });
        s++;
    }
    if (f < firstHalf.length) result.push(firstHalf[f]);

    list = [...result];
    snap(17, `Done! Reordered: [${list.join("→")}]`, { phase: "done" });
    return steps;
}

const EXAMPLES = getExamples('reorder-list');

export default function ReorderListVisualizer() {
    const [sel, setSel] = useState(0);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const { arr } = EXAMPLES[sel];
    const steps = useMemo(() => generateSteps(arr), [arr]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback((i) => { setSel(i); handleReset(); }, [handleReset]);

    const displayList = step?.list ?? arr;
    const slow = step?.slow ?? -1, fast = step?.fast ?? -1;

    const dockPanels = useMemo(() => [
        { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
        { id: 'viz', title: '🔗 Reorder', content: (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EXAMPLES.map((ex, i) => <button key={ex.label} onClick={() => applyExample(i)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: sel === i ? '#dbeafe' : '#f1f5f9' }}>{ex.label}</button>)}
                </div>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {displayList.map((v, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <motion.div animate={{ scale: i === slow || i === fast ? 1.15 : 1 }} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#dbeafe', border: '1px solid #0ea5e9', borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b' }}>{v}</motion.div>
                            {i < displayList.length - 1 && <span style={{ color: '#cbd5e1' }}>→</span>}
                        </div>
                    ))}
                </div>
                {step?.firstHalf && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>First</div>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {step.firstHalf.map((v, i) => <div key={i} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: 3, fontSize: 11, fontWeight: 'bold', color: '#1e40af' }}>{v}</div>)}
                            </div>
                        </div>
                        <div style={{ padding: 8, backgroundColor: '#fee2e2', borderRadius: 6 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>Second {step.phase?.includes("revers") ? "(reversed)" : ""}</div>
                            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {step.secondHalf.map((v, i) => <div key={i} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fecaca', border: '1px solid #fca5a5', borderRadius: 3, fontSize: 11, fontWeight: 'bold', color: '#991b1b' }}>{v}</div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, sel, applyExample, displayList, slow, fast]);

    return (
        <div className="problem-shell">
            <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
            <FloatingPanel title="Playback Controls">
                <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex <= 0} nextDisabled={isDone} resetDisabled={stepIndex <= 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
            </FloatingPanel>
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    );
}

