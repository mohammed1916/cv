import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import { buildTree, computeLayout, collectNodes, buildEdges, TreeSVG } from '../../components/treeUtils'
import "./FindMedianVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: "class MedianFinder:" },
    { line: 2, text: "    # small = max-heap (inverted), large = min-heap" },
    { line: 3, text: "    def addNum(self, num):" },
    { line: 4, text: "        heappush(small, -num)" },
    { line: 5, text: "        if small and large and -small[0] > large[0]:" },
    { line: 6, text: "            heappush(large, -heappop(small))" },
    { line: 7, text: "        if len(small) > len(large) + 1:" },
    { line: 8, text: "            heappush(large, -heappop(small))" },
    { line: 9, text: "        if len(large) > len(small):" },
    { line: 10, text: "            heappush(small, -heappop(large))" },
    { line: 11, text: "    def findMedian(self):" },
    { line: 12, text: "        if len(small) == len(large):" },
    { line: 13, text: "            return (-small[0] + large[0]) / 2" },
    { line: 14, text: "        return -small[0]" },
];

// Min-heap helpers
function heapPush(heap, val) {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
        const p = Math.floor((i - 1) / 2);
        if (heap[p] <= heap[i]) break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
    }
}
function heapPop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
        heap[0] = last;
        let i = 0;
        while (true) {
            let s = i, l = 2 * i + 1, r = 2 * i + 2;
            if (l < heap.length && heap[l] < heap[s]) s = l;
            if (r < heap.length && heap[r] < heap[s]) s = r;
            if (s === i) break;
            [heap[i], heap[s]] = [heap[s], heap[i]];
            i = s;
        }
    }
    return top;
}

function generateSteps(nums) {
    const steps = [];
    const small = []; // max-heap via negation stored as min-heap of negatives
    const large = []; // min-heap

    steps.push({ phase: "init", activeLine: 1, small: [], large: [], median: null, message: "Initialize two heaps" });

    for (const num of nums) {
        // push to small (max-heap)
        heapPush(small, -num);
        steps.push({
            phase: "push_small", activeLine: 4,
            small: [...small], large: [...large], median: null,
            activeSide: "small", activeValue: num,
            message: `Push ${num} to small (max-heap). small=[${small.map((v) => -v).join(",")}]`,
        });

        // balance: if small's max > large's min
        if (small.length > 0 && large.length > 0 && -small[0] > large[0]) {
            const moved = -heapPop(small);
            heapPush(large, moved);
            steps.push({
                phase: "balance_order", activeLine: 6,
                small: [...small], large: [...large], median: null,
                activeSide: "large", activeValue: moved,
                message: `Order fix: move ${moved} from small to large`,
            });
        }

        // size balance
        if (small.length > large.length + 1) {
            const moved = -heapPop(small);
            heapPush(large, moved);
            steps.push({
                phase: "balance_size_sl", activeLine: 8,
                small: [...small], large: [...large], median: null,
                activeSide: "large", activeValue: moved,
                message: `Size fix: move ${moved} from small to large`,
            });
        }
        if (large.length > small.length) {
            const moved = heapPop(large);
            heapPush(small, -moved);
            steps.push({
                phase: "balance_size_ls", activeLine: 10,
                small: [...small], large: [...large], median: null,
                activeSide: "small", activeValue: moved,
                message: `Size fix: move ${moved} from large to small`,
            });
        }

        const median =
            small.length === large.length
                ? (-small[0] + large[0]) / 2
                : -small[0];
        steps.push({
            phase: "median", activeLine: small.length === large.length ? 13 : 14,
            small: [...small], large: [...large], median,
            activeSide: "both", activeValue: null,
            message: `After adding ${num}: median = ${median}`,
        });
    }

    return steps;
}

const EXAMPLES = getExamples('find-median-data-stream');

const HEAP_TREE_W = 240;
const HEAP_TREE_H = 180;
const HEAP_NODE_R = 18;

function HeapTree({ label, values, isMax, accent, isActiveSide, activeValue, isMedianRoot }) {
    const display = isMax ? values.map((v) => -v) : values;

    const { positions, edges, nodes } = useMemo(() => {
        // A binary heap's array IS already a level-order layout (parent i ->
        // children 2i+1, 2i+2), the same shape buildTree expects — no nulls
        // to worry about since heap arrays are always dense.
        const builtRoot = buildTree(display);
        return {
            positions: computeLayout(builtRoot, HEAP_TREE_W, 52),
            edges: buildEdges(builtRoot),
            nodes: collectNodes(builtRoot),
        };
    }, [display]);

    return (
        <div className="fm-heap-panel" style={{ borderColor: accent }}>
            <div className="fm-heap-label" style={{ color: accent }}>{label}</div>
            <div className="fm-heap-canvas" style={{ width: HEAP_TREE_W, height: HEAP_TREE_H }}>
                <TreeSVG edges={edges} positions={positions} canvasWidth={HEAP_TREE_W} canvasHeight={HEAP_TREE_H} />
                <AnimatePresence>
                    {nodes.map((node) => {
                        const pos = positions.get(node.id);
                        if (!pos) return null;
                        const isRoot = node.id === 0;
                        const isActive = isActiveSide && node.val === activeValue;
                        return (
                            <motion.div
                                key={`${node.id}-${node.val}`}
                                className={`fm-heap-node ${isRoot ? "root" : ""} ${isActive ? "active" : ""} ${isRoot && isMedianRoot ? "median-source" : ""}`}
                                style={{
                                    left: pos.x - HEAP_NODE_R, top: pos.y - HEAP_NODE_R,
                                    borderColor: isRoot ? accent : "#45475a",
                                    color: isRoot ? accent : "#cdd6f4",
                                }}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: isActive ? 1.25 : 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ type: "spring", stiffness: 380, damping: 22 }}
                            >
                                {node.val}
                                {isRoot && <span className="fm-top-tag">{isMax ? "max" : "min"}</span>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {nodes.length === 0 && <div className="fm-heap-empty">empty</div>}
            </div>
        </div>
    );
}

function HeapList({ label, values, isMax, accent, isActiveSide, activeValue }) {
    const display = isMax ? values.map((v) => -v) : values;
    return (
        <div className="fm-heap-panel" style={{ borderColor: accent }}>
            <div className="fm-heap-label" style={{ color: accent }}>{label}</div>
            <div className="fm-heap-cells">
                <AnimatePresence mode="popLayout">
                    {display.map((v, i) => {
                        const isActive = isActiveSide && v === activeValue;
                        return (
                            <motion.div key={`${i}-${v}`} className={`fm-heap-cell ${isActive ? "active" : ""}`}
                                style={{ borderColor: i === 0 ? accent : "#45475a", color: i === 0 ? accent : "#cdd6f4" }}
                                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: isActive ? 1.15 : 1 }} exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                                {v}
                                {i === 0 && <span className="fm-top-tag">{isMax ? "max" : "min"}</span>}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {display.length === 0 && <div className="fm-heap-empty">empty</div>}
            </div>
        </div>
    );
}

export default function FindMedianVisualizer() {
    const [numsInput, setNumsInput] = useState("[1,2,3]");
    const [heapView, setHeapView] = useState("tree"); // "tree" | "list"
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const { nums, inputErr } = useMemo(() => {
        try {
            const p = JSON.parse(numsInput);
            if (!Array.isArray(p)) throw new Error("Must be array");
            return { nums: p.map(Number).slice(0, 12), inputErr: "" };
        } catch (e) {
            return { nums: [1, 2, 3], inputErr: e.message };
        }
    }, [numsInput]);

    const steps = useMemo(() => generateSteps(nums), [nums]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;

    const applyExample = useCallback(
        (ex) => { setNumsInput(JSON.stringify(ex.nums)); handleReset(); },
        [handleReset]
    );

    return (
        <div className="fm-shell">
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"}]}
        values={{ nums: numsInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
      />

            <div className="fm-controls-row">
                <div className="fm-examples">
                    {EXAMPLES.map((ex) => (
                        <button key={ex.label} className="fm-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input className="fm-input" value={numsInput}
                        onChange={(e) => { setNumsInput(e.target.value); handleReset(); }} />
                    {inputErr && <span className="fm-error">{inputErr}</span>}
                </div>
                <div className="fm-view-toggle">
                    <button
                        className={`fm-view-btn ${heapView === "tree" ? "active" : ""}`}
                        onClick={() => setHeapView("tree")}
                    >
                        Tree view
                    </button>
                    <button
                        className={`fm-view-btn ${heapView === "list" ? "active" : ""}`}
                        onClick={() => setHeapView("list")}
                    >
                        Priority list
                    </button>
                </div>
            </div>

            <div className="fm-heaps-row">
                {heapView === "tree" ? (
                    <HeapTree
                        label="small (max-heap)" values={step?.small ?? []} isMax accent="#f38ba8"
                        isActiveSide={step?.activeSide === "small" || step?.activeSide === "both"}
                        activeValue={step?.activeValue}
                        isMedianRoot={step?.phase === "median"}
                    />
                ) : (
                    <HeapList
                        label="small (max-heap)" values={step?.small ?? []} isMax accent="#f38ba8"
                        isActiveSide={step?.activeSide === "small" || step?.activeSide === "both"}
                        activeValue={step?.activeValue}
                    />
                )}
                <div className="fm-median-col">
                    <div className="fm-median-label">median</div>
                    <motion.div className="fm-median-val"
                        key={step?.median}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}>
                        {step?.median ?? "—"}
                    </motion.div>
                </div>
                {heapView === "tree" ? (
                    <HeapTree
                        label="large (min-heap)" values={step?.large ?? []} isMax={false} accent="#89b4fa"
                        isActiveSide={step?.activeSide === "large" || step?.activeSide === "both"}
                        activeValue={step?.activeValue}
                        isMedianRoot={step?.phase === "median"}
                    />
                ) : (
                    <HeapList
                        label="large (min-heap)" values={step?.large ?? []} isMax={false} accent="#89b4fa"
                        isActiveSide={step?.activeSide === "large" || step?.activeSide === "both"}
                        activeValue={step?.activeValue}
                    />
                )}
            </div>

            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
            <div className="fm-status">{step?.message ?? "Press Play to begin."}</div>
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
        </div>
    );
}
