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
import "./RandomizedCollectionVisualizer.css";
import { createPortal } from 'react-dom'
const SOLUTION_CODE = [
    { line: 1, text: "class RandomizedCollection:" },
    { line: 2, text: "    def __init__(self):" },
    { line: 3, text: "        self.nums = []  # [val, ...]" },
    { line: 4, text: "        self.idx = defaultdict(set)  # val -> set of indices" },
    { line: 5, text: "    def insert(self, val):" },
    { line: 6, text: "        self.idx[val].add(len(self.nums))" },
    { line: 7, text: "        self.nums.append(val)" },
    { line: 8, text: "        return len(self.idx[val]) == 1  # True if first time" },
    { line: 9, text: "    def remove(self, val):" },
    { line: 10, text: "        idx = self.idx[val].pop()" },
    { line: 11, text: "        last = self.nums[-1]" },
    { line: 12, text: "        self.nums[idx] = last" },
    { line: 13, text: "        self.idx[last].add(idx); self.idx[last].discard(len-1)" },
    { line: 14, text: "        self.nums.pop()" },
    { line: 15, text: "    def getRandom(self):" },
    { line: 16, text: "        return random.choice(self.nums)" },
];

const EXAMPLES = getExamples('randomized-collection');

function generateSteps(ops) {
    const steps = [];
    const nums = [];
    const idx = {}; // val -> array of indices (simulating set)

    function getIdx(val) { return idx[val] ?? []; }
    function addIdx(val, i) { idx[val] = [...getIdx(val), i]; }
    function popIdx(val) {
        const arr = idx[val] ?? [];
        const last = arr[arr.length - 1];
        idx[val] = arr.slice(0, -1);
        return last;
    }
    function removeIdxVal(val, i) { idx[val] = getIdx(val).filter(x => x !== i); }

    steps.push({ activeLine: 3, nums: [...nums], idx, op: "init", result: null, phase: "init", message: "RandomizedCollection initialized." });

    for (const op of ops) {
        if (op.type === "insert") {
            const isFirst = getIdx(op.val).length === 0;
            addIdx(op.val, nums.length);
            nums.push(op.val);
            steps.push({ activeLine: 8, nums: [...nums], idx, op: `insert(${op.val})`, result: isFirst, phase: "insert", message: `insert(${op.val}) → nums=[${nums.join(",")}], return ${isFirst}` });
        } else if (op.type === "remove") {
            if (getIdx(op.val).length === 0) {
                steps.push({ activeLine: 10, nums: [...nums], idx, op: `remove(${op.val})`, result: false, phase: "miss", message: `remove(${op.val}) → not found` });
                continue;
            }
            const i = popIdx(op.val);
            const last = nums[nums.length - 1];
            nums[i] = last;
            if (last !== op.val || getIdx(last).length > 0) {
                removeIdxVal(last, nums.length - 1);
                addIdx(last, i);
            }
            nums.pop();
            steps.push({ activeLine: 14, nums: [...nums], idx, op: `remove(${op.val})`, result: null, phase: "remove", swapI: i, swapLast: last, message: `remove(${op.val}): swap pos ${i} with last(${last}), pop → nums=[${nums.join(",")}]` });
        } else {
            const pick = nums[Math.floor(Math.random() * nums.length)];
            steps.push({ activeLine: 16, nums: [...nums], idx, op: "getRandom()", result: pick, phase: "random", message: `getRandom() → ${pick}  (from [${nums.join(",")}])` });
        }
    }

    steps.push({ activeLine: 3, nums: [...nums], idx, op: "—", result: null, phase: "done", done: true, message: "All operations complete." });
    return steps;
}

export default function RandomizedCollectionVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
    const steps = useMemo(() => generateSteps(ex.ops), [ex]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset]);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const nums = step?.nums ?? [];
    const idx = step?.idx ?? {};
    const phase = step?.phase ?? "init";
    const result = step?.result;
    const opStr = step?.op ?? "—";

    const panelConfigs = useMemo(() => [
      { id: 'code', title: 'Code' },
      { id: 'viz', title: '🎲 Collections', dockMode: 'split-right' },
    ], [])
    const panelContents = useMemo(() => ({
      code: (<CodeTracePanel
                    step={step}
                    codeLines={SOLUTION_CODE}
                    highlightedLines={connectivity.highlightedLines}
                    onLineSelect={connectivity.handleLineSelect}
                    onActiveLineDomChange={setActiveLineDom}
                />),
      viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {EXAMPLES.map(e => (
                            <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, backgroundColor: ex.label === e.label ? '#dbeafe' : 'var(--surface2)' }}>
                                {e.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #0ea5e9' }}>
                            <div style={{ fontSize: 11, color: '#1e40af', marginBottom: 4 }}>Operation</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e40af' }}>{opStr}</div>
                        </div>
                        <div style={{ padding: 8, backgroundColor: phase === "random" ? '#fef3c7' : result === true ? '#dcfce7' : result === false ? '#fee2e2' : 'var(--surface)', borderRadius: 6, border: phase === "random" ? '1px solid #fcd34d' : result === true ? '1px solid #86efac' : result === false ? '1px solid #fecaca' : '1px solid var(--text)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Return</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: phase === "random" ? '#92400e' : result === true ? '#15803d' : result === false ? '#991b1b' : 'var(--surface2)' }}>
                                {result === null || result === undefined ? '—' : String(result)}
                            </div>
                        </div>
                        <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, border: '1px solid var(--text)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Phase</div>
                            <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--surface2)' }}>{phase}</div>
                        </div>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>nums array</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 50, alignItems: 'center' }}>
                        <AnimatePresence>
                            {nums.map((v, i) => (
                                <motion.div key={`${i}-${v}`} layout initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} style={{
                                    width: 50, height: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: i === step?.swapI ? '#fbbf24' : '#dbeafe', border: i === step?.swapI ? '2px solid #f59e0b' : '1px solid #0ea5e9',
                                    borderRadius: 4, fontSize: 11
                                }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{i}</span>
                                    <span style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--surface2)' }}>{v}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {nums.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>empty</span>}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>idx map</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 40 }}>
                        {Object.entries(idx).filter(([, v]) => v.length > 0).map(([k, arr]) => (
                            <div key={k} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
                                <span style={{ fontWeight: 'bold', color: 'var(--surface2)', minWidth: 20 }}>{k}</span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span style={{ padding: '2px 6px', backgroundColor: '#f0fdf4', borderRadius: 3, color: '#15803d', fontFamily: 'monospace', fontWeight: 'bold' }}>
                                    {`{${arr.join(", ")}}`}
                                </span>
                            </div>
                        ))}
                        {Object.values(idx).every(v => v.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>empty</span>}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginTop: 4 }}>Operations log</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1, overflow: 'auto', paddingBottom: 4 }}>
                        {steps.slice(0, stepIndex + 1).filter(s => s.phase !== "init" && s.phase !== "done").map((s, i) => (
                            <span key={i} style={{
                                padding: '4px 8px', borderRadius: 3, fontSize: 11, fontWeight: '600',
                                backgroundColor: s.phase === "insert" ? '#dcfce7' : s.phase === "remove" ? '#fee2e2' : '#fef3c7',
                                color: s.phase === "insert" ? '#15803d' : s.phase === "remove" ? '#991b1b' : '#92400e'
                            }}>
                                {s.op}{s.result !== null && s.result !== undefined ? ` → ${s.result}` : ""}
                            </span>
                        ))}
                    </div>
                </div>),
    }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx, nums, idx, phase, result, opStr, steps, stepIndex])
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

