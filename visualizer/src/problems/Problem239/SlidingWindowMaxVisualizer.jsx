import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./SlidingWindowMaxVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: "def maxSlidingWindow(nums, k):" },
    { line: 2, text: "    res, q = [], deque()  # q stores indices" },
    { line: 3, text: "    l = 0" },
    { line: 4, text: "    for r in range(len(nums)):" },
    { line: 5, text: "        while q and nums[q[-1]] < nums[r]:" },
    { line: 6, text: "            q.pop()" },
    { line: 7, text: "        q.append(r)" },
    { line: 8, text: "        if q[0] < l: q.popleft()" },
    { line: 9, text: "        if r >= k - 1:" },
    { line: 10, text: "            res.append(nums[q[0]])" },
    { line: 11, text: "            l += 1" },
    { line: 12, text: "    return res" },
];

function generateSteps(nums, k) {
    const steps = [];
    const res = [];
    const q = []; // deque of indices
    let l = 0;

    steps.push({ phase: "init", activeLine: 3, l, r: -1, q: [], res: [], message: `Start. k=${k}` });

    for (let r = 0; r < nums.length; r++) {
        // Pop smaller elements from back
        while (q.length > 0 && nums[q[q.length - 1]] < nums[r]) {
            const popped = q.pop();
            steps.push({
                phase: "pop_back", activeLine: 6, l, r, q: [...q], res: [...res],
                message: `nums[${popped}]=${nums[popped]} < nums[${r}]=${nums[r]} — pop from back`,
            });
        }

        q.push(r);
        steps.push({
            phase: "push", activeLine: 7, l, r, q: [...q], res: [...res],
            message: `Push index ${r} (val=${nums[r]}) to deque. deque=[${q.map((i) => `${i}(${nums[i]})`).join(",")}]`,
        });

        // Remove out-of-window front
        if (q[0] < l) {
            q.shift();
            steps.push({
                phase: "pop_front", activeLine: 8, l, r, q: [...q], res: [...res],
                message: `Front index ${q[0]} < l=${l} — remove from front`,
            });
        }

        // Window complete
        if (r >= k - 1) {
            res.push(nums[q[0]]);
            steps.push({
                phase: "record", activeLine: 10, l, r, q: [...q], res: [...res],
                message: `Window [${l},${r}]: max = nums[${q[0]}] = ${nums[q[0]]}`,
            });
            l++;
        }
    }

    steps.push({ phase: "done", activeLine: 12, l, r: nums.length - 1, q: [...q], res: [...res], message: `Result: [${res.join(",")}]` });
    return steps;
}

const EXAMPLES = getExamples('sliding-window-maximum');

function parseNums(str) {
    try { const p = JSON.parse(str); if (!Array.isArray(p)) throw new Error(); return { nums: p.map(Number), err: "" }; }
    catch { return { nums: [], err: "Invalid" }; }
}

export default function SlidingWindowMaxVisualizer() {
    const [numsInput, setNumsInput] = useState("[1,3,-1,-3,5,3,6,7]");
    const [kInput, setKInput] = useState("3");

    const { nums, err } = useMemo(() => parseNums(numsInput), [numsInput]);
    const k = useMemo(() => Math.max(1, parseInt(kInput, 10) || 1), [kInput]);

    const steps = useMemo(() => (nums.length ? generateSteps(nums, k) : []), [nums, k]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const applyExample = useCallback(
        (ex) => { setNumsInput(JSON.stringify(ex.nums)); setKInput(String(ex.k)); handleReset(); },
        [handleReset]
    );

    const l = step?.l ?? 0;
    const r = step?.r ?? -1;
    const qSet = new Set(step?.q ?? []);
    const qFront = (step?.q ?? [])[0] ?? -1;

    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input', dockMode: 'split-top' },
        { id: 'visualization', title: 'Visualization' },
        { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const inputPanel = <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"string"},{"key":"k","label":"k","type":"string"}]}
        values={{ nums: numsInput, k: kInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'k') setKInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
      />
    const visualizationPanel = <div className="swm-shell">
            {/* Array */}
            <div className="swm-panel">
                <div className="swm-panel-label">Array — window [{l}, {r}]</div>
                <div className="swm-cells-row">
                    {nums.map((v, i) => {
                        const inWindow = r >= 0 && i >= l && i <= r;
                        const isR = i === r;
                        const isMax = i === qFront && inWindow;
                        const inDeque = qSet.has(i);
                        return (
                            <motion.div key={i}
                                className={`swm-cell ${inWindow ? "in-window" : ""} ${isR ? "ptr-r" : ""} ${isMax ? "max" : ""} ${inDeque && !isMax ? "in-deque" : ""}`}
                                animate={{ scale: isR ? 1.15 : 1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                                <span className="swm-cell-val">{v}</span>
                                <span className="swm-cell-idx">{i}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Deque */}
            <div className="swm-panel">
                <div className="swm-panel-label">Monotonic deque (indices, front→back, decreasing values)</div>
                <div className="swm-deque-row">
                    {(step?.q ?? []).length === 0 && <span className="swm-empty">empty</span>}
                    {(step?.q ?? []).map((idx, di) => (
                        <motion.div key={idx} className={`swm-deque-cell ${di === 0 ? "front" : ""}`}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                            <span className="swm-deq-idx">[{idx}]</span>
                            <span className="swm-deq-val">{nums[idx]}</span>
                            {di === 0 && <span className="swm-front-tag">max</span>}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Results */}
            {(step?.res?.length ?? 0) > 0 && (
                <div className="swm-panel">
                    <div className="swm-panel-label">Result</div>
                    <div className="swm-res-row">
                        {step.res.map((v, i) => (
                            <div key={i} className={`swm-res-cell ${i === step.res.length - 1 && step.phase === "record" ? "latest" : ""}`}>{v}</div>
                        ))}
                    </div>
                </div>
            )}

    </div>
    const codePanel = <>
      <div className="swm-status">{step?.message ?? "Press Play to begin."}</div>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
    </>
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
          {panelDivs && <>
            {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
            {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          </>}
            <FloatingPanel title="Playback Controls">
        <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
      </FloatingPanel>
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </>
    );
}
