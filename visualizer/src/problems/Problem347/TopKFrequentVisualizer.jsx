import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./TopKFrequentVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = ['buckets', 'count', 'done']
const LINE_PATTERN_MAP = {
    2: 'count',
    5: 'buckets',
    10: 'done'
}


const SOLUTION_CODE = [
    { line: 1, text: "def topKFrequent(nums, k):" },
    { line: 2, text: "    count = Counter(nums)" },
    { line: 3, text: "    freq = [[] for _ in range(len(nums)+1)]" },
    { line: 4, text: "    for num, cnt in count.items():" },
    { line: 5, text: "        freq[cnt].append(num)" },
    { line: 6, text: "    res = []" },
    { line: 7, text: "    for i in range(len(freq)-1, 0, -1):" },
    { line: 8, text: "        for n in freq[i]:" },
    { line: 9, text: "            res.append(n)" },
    { line: 10, text: "            if len(res) == k: return res" },
];

function generateSteps(nums, k) {
    const steps = [];

    // Build count
    const count = {};
    for (const n of nums) count[n] = (count[n] || 0) + 1;

    steps.push({
        phase: "count", activeLine: 2,
        count: { ...count }, buckets: null, res: [], activeFreq: null, activeNum: null,
        message: `Count frequencies: ${Object.entries(count).map(([n, c]) => `${n}→${c}`).join(", ")}`,
    });

    // Build bucket array
    const freq = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, cnt] of Object.entries(count)) {
        freq[cnt].push(Number(num));
    }
    const bucketsSnap = freq.map((b) => [...b]);

    steps.push({
        phase: "buckets", activeLine: 5,
        count: { ...count }, buckets: bucketsSnap, res: [], activeFreq: null, activeNum: null,
        message: `Bucket sort: freq[i] contains numbers appearing i times`,
    });

    // Collect top k
    const res = [];
    for (let i = freq.length - 1; i >= 1; i--) {
        for (const n of freq[i]) {
            res.push(n);
            steps.push({
                phase: res.length === k ? "found" : "collect", activeLine: res.length === k ? 10 : 9,
                count: { ...count }, buckets: bucketsSnap, res: [...res], activeFreq: i, activeNum: n,
                message: `freq[${i}] contains ${n} — add to result. res=[${res.join(",")}]`,
            });
            if (res.length === k) {
                steps.push({
                    phase: "done", activeLine: 10,
                    count: { ...count }, buckets: bucketsSnap, res: [...res], activeFreq: null, activeNum: null,
                    message: `Found k=${k} elements — return [${res.join(",")}]`,
                });
                return steps;
            }
        }
    }

    steps.push({
        phase: "done", activeLine: 10,
        count: { ...count }, buckets: bucketsSnap, res: [...res], activeFreq: null, activeNum: null,
        message: `Result: [${res.join(",")}]`,
    });
    return steps;
}

const EXAMPLES = getExamples('top-kfrequent');

function parseNums(str) {
    try {
        const nums = JSON.parse(str);
        if (!Array.isArray(nums) || nums.length === 0 || !nums.every(Number.isFinite)) {
            throw new Error('Enter a non-empty JSON array of finite numbers.');
        }
        return { nums, err: "" };
    } catch (error) {
        return { nums: [], err: error.message || 'Enter a valid JSON array of finite numbers.' };
    }
}

export default function TopKFrequentVisualizer() {
    const [numsInput, setNumsInput] = useState("[1,1,1,2,2,3]");
    const [kInput, setKInput] = useState("2");
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const { nums, err: numsError } = useMemo(() => parseNums(numsInput), [numsInput]);
    const { k, err: kError } = useMemo(() => {
        const parsed = Number(kInput);
        if (!Number.isInteger(parsed) || parsed < 1) return { k: 0, err: 'k must be a positive integer.' };
        if (nums.length && parsed > new Set(nums).size) return { k: 0, err: 'k cannot exceed the number of distinct values.' };
        return { k: parsed, err: '' };
    }, [kInput, nums]);
    const inputError = numsError || kError;

    const steps = useMemo(() => {
        return !inputError && nums.length ? generateSteps(nums, k).map((current) => ({
            ...current,
            relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
        })) : []
    }, [inputError, nums, k]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;

    const applyExample = useCallback(
        (ex) => { setNumsInput(JSON.stringify(ex.nums)); setKInput(String(ex.k)); handleReset(); },
        [handleReset]
    );

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        onStepJump: setStepIndex,
    });

    const buckets = step?.buckets ?? [];
    const [panelDivs, setPanelDivs] = useState(null);
    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input' },
        { id: 'viz', title: 'Top K Frequencies', dockMode: 'split-bottom' },
        { id: 'code', title: 'Code', dockMode: 'split-right' },
    ], []);
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    const inputPanel = (
        <ManualInputPanel
            fields={[{ key: 'nums', label: 'Numbers (JSON)', type: 'string' }, { key: 'k', label: 'k', type: 'string' }]}
            values={{ nums: numsInput, k: kInput }}
            onChange={(key, value) => { if (key === 'nums') setNumsInput(value); if (key === 'k') setKInput(value); handleReset(); }}
            examples={EXAMPLES}
            applyExample={applyExample}
            inputError={inputError}
        />
    );

    const codePanel = (
        <div style={{ position: 'relative' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                highlightedLines={connectivity.highlightedLines}
                onLineSelect={connectivity.handleLineSelect}
                onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
                <CodePatternAnnotations
                    linePatterns={LINE_PATTERN_MAP}
                    currentPhase={step?.phase}
                    activeLineDom={activeLineDom}
                    activeLine={step?.activeLine}
                />
            )}
        </div>
    );

    const visualizationPanel = (
        <div className="tkf-shell">
            <div className="tkf-panel">
                <div className="tkf-panel-label">Frequency count</div>
                <div className="tkf-count-row">
                    {Object.entries(step?.count ?? {}).map(([n, c]) => (
                        <div key={n} className={`tkf-count-cell ${step?.activeNum === Number(n) ? "active" : ""}`}>
                            <span className="tkf-count-num">{n}</span>
                            <span className="tkf-count-freq">×{c}</span>
                        </div>
                    ))}
                </div>
            </div>

            {buckets.length > 0 && (
                <div className="tkf-panel">
                    <div className="tkf-panel-label">Bucket (index = frequency)</div>
                    <div className="tkf-buckets-row">
                        {buckets.map((bucket, i) => {
                            if (i === 0 && bucket.length === 0) return null;
                            const isActive = step?.activeFreq === i;
                            return (
                                <div key={i} className={`tkf-bucket ${isActive ? "active" : ""} ${bucket.length === 0 ? "empty" : ""}`}>
                                    <div className="tkf-bucket-idx">{i}</div>
                                    <div className="tkf-bucket-items">
                                        {bucket.map((n) => (
                                            <motion.div key={n}
                                                className={`tkf-bucket-item ${step?.activeNum === n && isActive ? "highlight" : ""}`}
                                                animate={{ scale: step?.activeNum === n && isActive ? 1.2 : 1 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                                                {n}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {(step?.res?.length ?? 0) > 0 && (
                <div className="tkf-panel">
                    <div className="tkf-panel-label">Result (top {k} frequent)</div>
                    <div className="tkf-res-row">
                        <AnimatePresence mode="popLayout">
                            {step.res.map((n, i) => (
                                <motion.div key={i} className="tkf-res-cell"
                                    initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                                    {n}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <div className="tkf-status">{step?.message ?? "Press Play to begin."}</div>
        </div>
    );

    return (
        <div className="problem-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                <>
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.viz && createPortal(visualizationPanel, panelDivs.viz)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">
                    {showPatternOverlay && (
                        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
                    )}
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
                </FloatingPanel>,
                document.body,
            )}
        </div>
    );
}
