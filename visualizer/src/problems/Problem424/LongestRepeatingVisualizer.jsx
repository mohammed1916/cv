import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import FloatingPanel from "../../components/shared/FloatingPanel";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./LongestRepeatingVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
const SOLUTION_CODE = [
    { line: 1, text: "def characterReplacement(s, k):" },
    { line: 2, text: "    count = {}" },
    { line: 3, text: "    l, maxCount, res = 0, 0, 0" },
    { line: 4, text: "    for r in range(len(s)):" },
    { line: 5, text: "        count[s[r]] = count.get(s[r], 0) + 1" },
    { line: 6, text: "        maxCount = max(maxCount, count[s[r]])" },
    { line: 7, text: "        while (r - l + 1) - maxCount > k:" },
    { line: 8, text: "            count[s[l]] -= 1" },
    { line: 9, text: "            l += 1" },
    { line: 10, text: "        res = max(res, r - l + 1)" },
    { line: 11, text: "    return res" },
];

function generateSteps(s, k) {
    const steps = [];
    const count = {};
    let l = 0, maxCount = 0, res = 0;

    steps.push({ phase: "init", activeLine: 3, l, r: -1, count: {}, maxCount, res, message: "Initialize window" });

    for (let r = 0; r < s.length; r++) {
        count[s[r]] = (count[s[r]] || 0) + 1;
        maxCount = Math.max(maxCount, count[s[r]]);

        steps.push({
            phase: "expand", activeLine: 5,
            l, r, count: { ...count }, maxCount, res,
            message: `r=${r} s[r]='${s[r]}': count[${s[r]}]=${count[s[r]]}, maxCount=${maxCount}`,
        });

        while (r - l + 1 - maxCount > k) {
            count[s[l]] -= 1;
            steps.push({
                phase: "shrink", activeLine: 8,
                l, r, count: { ...count }, maxCount, res,
                message: `Window size ${r - l + 1} - maxCount ${maxCount} > k=${k} — shrink: l=${l} → ${l + 1}`,
            });
            l++;
        }

        res = Math.max(res, r - l + 1);
        steps.push({
            phase: "update", activeLine: 10,
            l, r, count: { ...count }, maxCount, res,
            message: `Window [${l},${r}] "${s.slice(l, r + 1)}" size=${r - l + 1}, res=${res}`,
        });
    }

    steps.push({ phase: "done", activeLine: 11, l, r: s.length - 1, count: { ...count }, maxCount, res, message: `Result = ${res}` });
    return steps;
}

const EXAMPLES = getExamples('longest-repeating-char-replace');

export default function LongestRepeatingVisualizer() {
    const [sInput, setSInput] = useState("AABABBA");
    const [kInput, setKInput] = useState("1");

    const k = useMemo(() => Math.max(0, parseInt(kInput, 10) || 0), [kInput]);
    const steps = useMemo(() => generateSteps(sInput.toUpperCase(), k), [sInput, k]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

    const applyExample = useCallback(
        (ex) => { setSInput(ex.s); setKInput(String(ex.k)); handleReset(); },
        [handleReset]
    );

    const str = sInput.toUpperCase();
    const l = step?.l ?? 0;
    const r = step?.r ?? -1;

    // SlidingWindowVisualization component
    const SlidingWindowVisualization = () => (
        <div className="lr-panel">
            <div className="lr-panel-label">Sliding window</div>
            <div className="lr-chars-row">
                {str.split("").map((c, i) => {
                    const inWindow = i >= l && i <= r;
                    const isL = i === l;
                    const isR = i === r;
                    return (
                        <motion.div key={i} className={`lr-char ${inWindow ? "in-window" : ""} ${isL ? "ptr-l" : ""} ${isR ? "ptr-r" : ""}`}
                            animate={{ scale: inWindow ? 1.08 : 1 }}
                            transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                            {c}
                            {isL && <span className="lr-ptr-label">L</span>}
                            {isR && <span className="lr-ptr-label">R</span>}
                        </motion.div>
                    );
                })}
            </div>

            <div className="lr-info-row">
                <span>window: <strong>{r >= 0 ? `"${str.slice(l, r + 1)}"` : "—"}</strong></span>
                <span>size: <strong>{r >= l ? r - l + 1 : 0}</strong></span>
                <span>maxCount: <strong>{step?.maxCount ?? 0}</strong></span>
                <span>k: <strong>{k}</strong></span>
                <span className="lr-res">res = <strong>{step?.res ?? 0}</strong></span>
            </div>
        </div>
    );

    // CharacterCountsVisualization component
    const CharacterCountsVisualization = () => (
        <div className="lr-panel">
            <div className="lr-panel-label">Character counts</div>
            <div className="lr-count-row">
                {Object.entries(step?.count ?? {}).filter(([, v]) => v > 0).map(([c, v]) => (
                    <div key={c} className={`lr-count-cell ${v === step?.maxCount ? "max" : ""}`}>
                        <span className="lr-count-char">{c}</span>
                        <span className="lr-count-val">{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const inputPanel = (
        <div className="lr-panel-body">
            <div className="lr-examples">
                {EXAMPLES.map((ex) => (
                    <button key={ex.label} className="lr-chip" onClick={() => applyExample(ex)}>
                        {ex.label}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
                <input
                    className="lr-input"
                    value={sInput}
                    onChange={(e) => { setSInput(e.target.value); handleReset(); }}
                    placeholder="String"
                />
                <label className="lr-k-label">
                    k=
                    <input
                        className="lr-k-input"
                        type="number"
                        min={0}
                        value={kInput}
                        onChange={(e) => { setKInput(e.target.value); handleReset(); }}
                    />
                </label>
            </div>
        </div>
    );

    const vizPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"},{"key":"k","label":"k","type":"string"}]}
        values={{ s: sInput, k: kInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 'k') setKInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

        <div className="lr-panel-body">
            <SlidingWindowVisualization />
            <CharacterCountsVisualization />
            <div className="lr-status">{step?.message ?? "Press Play to begin."}</div>
        </div>
    
    </>);

    const codePanel = (
        <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
        />
    );

    const [panelDivs, setPanelDivs] = useState(null);
    const panelConfigs = useMemo(
        () => [
            { id: "input", title: "Input Playground" },
            { id: "viz", title: "Visualization", dockMode: "split-right" },
            { id: "code", title: "Code Trace", dockMode: "split-bottom" },
        ],
        []
    );
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    return (
        <div className="lr-shell">
            <section className="lr-hero">
                <div className="lr-hero-copy">
                    <span className="lr-kicker">Longest Repeating Character Replacement</span>
                    <h2>Sliding window with dynamic character replacement.</h2>
                    <p>
                        Track how the window expands and shrinks, character counts update, and the maximum
                        length grows as we find optimal replacements at each step.
                    </p>
                </div>
            </section>

            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
                    {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                </>
            )}

            {createPortal(
                <FloatingPanel title="Playback Controls">
                    <PlaybackControls
                        onReset={handleReset}
                        onPrev={stepBack}
                        onPlayToggle={togglePlay}
                        onNext={stepForward}
                        resetDisabled={steps.length === 0}
                        prevDisabled={stepIndex <= 0}
                        nextDisabled={steps.length === 0 || isDone}
                        isPlaying={isPlaying}
                        isDone={isDone}
                        speed={speed}
                        onSpeedChange={(event) => setSpeed(Number(event.target.value))}
                        speedIndicator={`${speed}ms`}
                        autoScroll={autoScrollCode}
                        onAutoScrollChange={setAutoScrollCode}
                        autoScrollLabel="Auto-scroll code"
                        showAutoScroll
                        showPatternOverlay={showPatternOverlay}
                        onShowPatternOverlayChange={setShowPatternOverlay}
                        patternOverlayLabel="Show pattern overlay"
                        showPatternOverlayToggle
                    />
                </FloatingPanel>,
                document.body
            )}

            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </div>
    );
}

