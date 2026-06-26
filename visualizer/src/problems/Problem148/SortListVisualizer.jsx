import DockableWorkspace from "../../../components/shared/DockableWorkspace"
import FloatingPanel from "../../../components/shared/FloatingPanel"
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity"
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./SortListVisualizer.css";

const SOLUTION_CODE = [
    { line: 1, text: "def sortList(head):" },
    { line: 2, text: "    if not head or not head.next: return head" },
    { line: 3, text: "    # Find middle" },
    { line: 4, text: "    slow, fast = head, head.next" },
    { line: 5, text: "    while fast and fast.next:" },
    { line: 6, text: "        slow = slow.next; fast = fast.next.next" },
    { line: 7, text: "    mid = slow.next; slow.next = None" },
    { line: 8, text: "    left = sortList(head)" },
    { line: 9, text: "    right = sortList(mid)" },
    { line: 10, text: "    # Merge sorted halves" },
    { line: 11, text: "    dummy = ListNode(0); cur = dummy" },
    { line: 12, text: "    while left and right:" },
    { line: 13, text: "        if left.val <= right.val:" },
    { line: 14, text: "            cur.next = left; left = left.next" },
    { line: 15, text: "        else:" },
    { line: 16, text: "            cur.next = right; right = right.next" },
    { line: 17, text: "        cur = cur.next" },
    { line: 18, text: "    cur.next = left or right" },
    { line: 19, text: "    return dummy.next" },
];

// Simulate merge sort steps iteratively for visualization
function generateSteps(initial) {
    const steps = [];

    function snap(activeLine, arr, leftArr, rightArr, mergedArr, message) {
        steps.push({ activeLine, arr: [...arr], left: leftArr ? [...leftArr] : null, right: rightArr ? [...rightArr] : null, merged: mergedArr ? [...mergedArr] : null, message });
    }

    function mergeSort(arr) {
        if (arr.length <= 1) return arr;

        const mid = Math.floor(arr.length / 2);
        const leftHalf = arr.slice(0, mid);
        const rightHalf = arr.slice(mid);

        snap(7, arr, leftHalf, rightHalf, null, `Split [${arr.join("→")}] → [${leftHalf.join(",")}] | [${rightHalf.join(",")}]`);

        const left = mergeSort(leftHalf);
        const right = mergeSort(rightHalf);

        // Merge
        const merged = [];
        let l = 0, r = 0;
        snap(11, arr, [...left], [...right], [], `Merge [${left.join(",")}] and [${right.join(",")}]`);
        while (l < left.length && r < right.length) {
            if (left[l] <= right[r]) {
                merged.push(left[l]);
                snap(14, arr, left.slice(l + 1), right.slice(r), [...merged], `Take ${left[l]} from left`);
                l++;
            } else {
                merged.push(right[r]);
                snap(16, arr, left.slice(l), right.slice(r + 1), [...merged], `Take ${right[r]} from right`);
                r++;
            }
        }
        while (l < left.length) { merged.push(left[l++]); }
        while (r < right.length) { merged.push(right[r++]); }
        snap(18, arr, [], [], [...merged], `Merged: [${merged.join("→")}]`);
        return merged;
    }

    snap(1, initial, null, null, null, `Sort linked list: [${initial.join("→")}]`);
    const result = mergeSort([...initial]);
    snap(19, result, null, null, null, `Done! Sorted: [${result.join("→")}]`);
    return steps;
}

const EXAMPLES = getExamples('sort-list');

export default function SortListVisualizer() {
    const [sel, setSel] = useState(0);

    const initial = EXAMPLES[sel].arr;
    const steps = useMemo(() => generateSteps(initial), [initial]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback((i) => { setSel(i); handleReset(); }, [handleReset]);

    const dockPanels = useMemo(() => [
        { id: 'code', title: 'Code', content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} /> },
        { id: 'viz', title: '🔀 Merge Sort', content: (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {EXAMPLES.map((ex, i) => <button key={ex.label} onClick={() => applyExample(i)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: sel === i ? '#dbeafe' : '#f1f5f9' }}>{ex.label}</button>)}
                </div>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Array</div>
                    <LinkedListRow vals={step?.arr ?? initial} color="main" />
                </div>
                {step?.left && <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Merge</div>
                    <LinkedListRow vals={step.left} color="left" /> ↔ <LinkedListRow vals={step.right} color="right" />
                    {step?.merged && <div style={{ marginTop: 8 }}><LinkedListRow vals={step.merged} color="merged" /></div>}
                </div>}
            </div>
        )}
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, sel, applyExample, initial]);

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

function LinkedListRow({ vals, color }) {
    if (!vals || vals.length === 0) return <span className="sl-empty">empty</span>;
    return (
        <div className="sl-list-row">
            {vals.map((v, i) => (
                <div key={i} className="sl-node-wrap">
                    <motion.div className={`sl-node ${color}`}
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 22 }}>
                        {v}
                    </motion.div>
                    {i < vals.length - 1 && <span className="sl-arrow">→</span>}
                </div>
            ))}
        </div>
    );
}
