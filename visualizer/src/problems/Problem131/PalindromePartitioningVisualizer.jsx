import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./PalindromePartitioningVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// ─── Solution code ────────────────────────────────────────────────────────
const SOLUTION_CODE = [
    { line: 1, text: "def partition(s):" },
    { line: 2, text: "    res, part = [], []" },
    { line: 3, text: "    def backtrack(i):" },
    { line: 4, text: "        if i == len(s):" },
    { line: 5, text: "            res.append(part[:]); return" },
    { line: 6, text: "        for j in range(i, len(s)):" },
    { line: 7, text: "            sub = s[i:j+1]" },
    { line: 8, text: "            if sub == sub[::-1]:  # isPalin" },
    { line: 9, text: "                part.append(sub)" },
    { line: 10, text: "                backtrack(j+1)" },
    { line: 11, text: "                part.pop()" },
    { line: 12, text: "    backtrack(0)" },
    { line: 13, text: "    return res" },
];

function isPalin(s) { return s === s.split("").reverse().join(""); }

function generateSteps(s) {
    const steps = [];
    const res = [];
    const part = [];

    function backtrack(i) {
        if (i === s.length) {
            res.push([...part]);
            steps.push({ activeLine: 5, i, j: -1, part: [...part], res, sub: null, valid: null, message: `Complete partition: [${part.join(" | ")}]` });
            return;
        }
        for (let j = i; j < s.length; j++) {
            const sub = s.slice(i, j + 1);
            const valid = isPalin(sub);
            steps.push({ activeLine: 8, i, j, part: [...part], res, sub, valid, message: valid ? `"${sub}" is palindrome ✓` : `"${sub}" not palindrome ✗` });
            if (valid) {
                part.push(sub);
                steps.push({ activeLine: 9, i, j, part: [...part], res, sub, valid, message: `Append "${sub}". path=[${part.join(",")}]` });
                backtrack(j + 1);
                part.pop();
                steps.push({ activeLine: 11, i, j, part: [...part], res, sub, valid, message: `Backtrack: pop "${sub}". path=[${part.join(",")}]` });
            }
        }
    }

    steps.push({ activeLine: 12, i: 0, j: -1, part: [], res: [], sub: null, valid: null, message: `Start. s="${s}"` });
    backtrack(0);
    steps.push({ activeLine: 13, i: s.length, j: -1, part: [], res, sub: null, valid: null, message: `Done. ${res.length} partitions.` });
    return steps;
}

const EXAMPLES = getExamples('palindrome-partitioning');

export default function PalindromePartitioningVisualizer() {
    const [sInput, setSInput] = useState("aab");

    const s = sInput.replace(/[^a-z]/gi, "").slice(0, 7);
    const steps = useMemo(() => (s.length ? generateSteps(s) : []), [s]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll();

    const applyExample = useCallback((ex) => { setSInput(ex.s); handleReset(); }, [handleReset]);

    const i = step?.i ?? 0, j = step?.j ?? -1;

    // ─── Lumino DockPanel conversion ────────────────────────────────────────
    const [panelDivs, setPanelDivs] = useState(null);

    const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"}]}
        values={{ s: sInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

        <div className="pp-panel-body">
            <div className="pp-controls-row">
                <div className="pp-examples">
                    {EXAMPLES.map((ex) => (
                        <button key={ex.label} className="pp-chip" onClick={() => applyExample(ex)}>{ex.label}</button>
                    ))}
                </div>
                <input className="pp-input" value={sInput}
                    onChange={(e) => { setSInput(e.target.value); handleReset(); }} maxLength={7} placeholder="string" />
            </div>

            {/* String with highlight */}
            <div className="pp-panel">
                <div className="pp-panel-label">String — current window [{i}, {j}]</div>
                <div className="pp-str-row">
                    {s.split("").map((ch, idx) => {
                        const inWindow = j >= 0 && idx >= i && idx <= j;
                        return (
                            <motion.div key={idx}
                                className={`pp-ch ${inWindow ? (step?.valid ? "palin" : "not-palin") : ""} ${idx === i ? "start" : ""}`}
                                animate={{ scale: inWindow ? 1.12 : 1 }}
                                transition={{ type: "spring", stiffness: 380, damping: 20 }}>
                                {ch}
                            </motion.div>
                        );
                    })}
                </div>
                {step?.sub && (
                    <div className={`pp-sub-tag ${step.valid ? "valid" : "invalid"}`}>
                        "{step.sub}" {step.valid ? "✓ palindrome" : "✗ not palindrome"}
                    </div>
                )}
            </div>

            {/* Current path */}
            <div className="pp-panel">
                <div className="pp-panel-label">Current path</div>
                <div className="pp-path-row">
                    {(step?.part ?? []).length === 0 && <span className="pp-empty">empty</span>}
                    {(step?.part ?? []).map((seg, idx) => (
                        <motion.div key={`${idx}-${seg}`} className="pp-seg"
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                            {seg}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Results */}
            {(step?.res?.length ?? 0) > 0 && (
                <div className="pp-panel">
                    <div className="pp-panel-label">Results ({step.res.length})</div>
                    <div className="pp-results">
                        <AnimatePresence mode="popLayout">
                            {step.res.map((r, i) => (
                                <motion.div key={r.join("|")}
                                    className={`pp-result-row ${i === step.res.length - 1 && step.activeLine === 5 ? "latest" : ""}`}
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 320, damping: 22 }}>
                                    [{r.map((seg, si) => <span key={si} className="pp-res-seg">"{seg}"</span>)}]
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    
    </>);

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                autoScroll={autoScrollCode}
                disableResizer
            />
            {showPatternOverlay && <CodePatternAnnotations
                step={step}
                activeLineDom={activeLineDom}
            />}
        </div>
    );

    const statusPanel = (
        <div className="pp-status">
            {step?.message ?? "Press Play to begin."}
        </div>
    );

    const playbackPanel = (
      <>
            {showPatternOverlay && <PatternLegend />}
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
        </>
    );

    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Input & Visualization', dockMode: 'split-right' },
            { id: 'code',    title: 'Code Trace',          dockMode: 'split-bottom' },
            { id: 'status',  title: 'Status',              dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    );

    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    return (
        <div className="pp-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.code    && createPortal(codePanel,    panelDivs.code)}
                    {panelDivs.status  && createPortal(statusPanel,  panelDivs.status)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
                document.body
            )}
        </div>
    );
}

