import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./ValidPalindromeVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import PointerRail from '../../components/shared/PointerRail'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: "def isPalindrome(s):" },
    { line: 2, text: "    s = ''.join(c.lower() for c in s" },
    { line: 3, text: "                if c.isalnum())" },
    { line: 4, text: "    l, r = 0, len(s) - 1" },
    { line: 5, text: "    while l < r:" },
    { line: 6, text: "        if s[l] != s[r]: return False" },
    { line: 7, text: "        l += 1; r -= 1" },
    { line: 8, text: "    return True" },
];

function generateSteps(raw) {
    const steps = [];
    const cleaned = raw
        .split("")
        .filter((c) => /[a-z0-9]/i.test(c))
        .map((c) => c.toLowerCase())
        .join("");

    steps.push({
        phase: "clean",
        activeLine: 2,
        cleaned,
        l: 0,
        r: cleaned.length - 1,
        result: null,
        message: `Cleaned string: "${cleaned}" (${cleaned.length} chars)`,
    });

    let l = 0,
        r = cleaned.length - 1;

    steps.push({
        phase: "init",
        activeLine: 4,
        cleaned,
        l,
        r,
        result: null,
        message: `l=0, r=${r}`,
    });

    while (l < r) {
        const match = cleaned[l] === cleaned[r];
        steps.push({
            phase: match ? "match" : "mismatch",
            activeLine: match ? 7 : 6,
            cleaned,
            l,
            r,
            result: match ? null : false,
            message: match
                ? `s[${l}]='${cleaned[l]}' == s[${r}]='${cleaned[r]}' ✓ — move pointers`
                : `s[${l}]='${cleaned[l]}' != s[${r}]='${cleaned[r]}' ✗ — return False`,
        });
        if (!match) return steps;
        l++;
        r--;
    }

    steps.push({
        phase: "done",
        activeLine: 8,
        cleaned,
        l,
        r,
        result: true,
        message: "Pointers crossed — return True",
    });
    return steps;
}

const EXAMPLES = getExamples('valid-palindrome');

export default function ValidPalindromeVisualizer() {
    const [input, setInput] = useState("A man, a plan, a canal: Panama");
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const steps = useMemo(
        () =>
            generateSteps(input).map((current) => ({
                ...current,
                relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
            })),
        [input]
    );
    const {
        stepIndex,
        setStepIndex,
        stepForward,
        stepBack,
        togglePlay,
        handleReset,
        isPlaying,
        speed,
        setSpeed,
        isDone,
    } = usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;

    const connectivity = useCodeVisualConnectivity({
        steps,
        stepIndex,
        onStepJump: setStepIndex,
    });

    const applyExample = useCallback(
        (ex) => {
            setInput(ex.s);
            handleReset();
        },
        [handleReset]
    );

    const cleaned = step?.cleaned ?? "";

    // ─── Extract panels ────────────────────────────────────────────────────
    const primaryPanel = (
        <div className="vp-panel">
            <div className="vp-controls-row">
                <div className="vp-examples">
                    {EXAMPLES.map((ex) => (
                        <button
                            key={ex.label}
                            className="vp-chip"
                            onClick={() => applyExample(ex)}
                        >
                            {ex.label}
                        </button>
                    ))}
                </div>
                <input
                    className="vp-input"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        handleReset();
                    }}
                />
            </div>

            {/* Cleaned string with two-pointer highlights */}
            <div className="vp-chars-panel">
                <div className="vp-panel-label">Cleaned string (alphanumeric, lowercase)</div>
                <PointerRail
                    title="Two-pointer comparison lane"
                    values={cleaned.split("")}
                    range={step ? { start: step.l, end: step.r } : null}
                    pointers={step ? [
                        { id: "left", label: `L ${step.l}`, index: step.l, tone: "info" },
                        { id: "right", label: `R ${step.r}`, index: step.r, tone: "warning" },
                    ] : []}
                    note={step?.result === false
                        ? "Mismatch: these two pointers identify the characters that end the search."
                        : step?.result === true
                            ? "Pointers crossed after every mirrored pair matched."
                            : "Compare the two endpoints, then move both pointers inward when they match."}
                />
            </div>

            {step?.result != null && (
                <div className={`vp-result ${step.result ? "true" : "false"}`}>
                    {step.result ? "✓ isPalindrome = true" : "✗ isPalindrome = false"}
                </div>
            )}
        </div>
    );

    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                highlightedLines={connectivity.highlightedLines}
                onLineSelect={connectivity.handleLineSelect}
                onActiveLineDomChange={setActiveLineDom}
                disableResizer
            />
            {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} />}
        </div>
    );

    const statusPanel = (
        <div className="vp-status">{step?.message ?? "Press Play to begin."}</div>
    );

    const playbackPanel = (
      <>
            {showPatternOverlay && <PatternLegend />}
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
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    );

    // ─── Panel configuration ────────────────────────────────────────────────
    const [panelDivs, setPanelDivs] = useState(null);
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'String & Pointers', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    );
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    return (
        <div className="vp-shell">
            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
              <>
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.code && createPortal(codePanel, panelDivs.code)}
                    {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
                </>
            )}
            {createPortal(
                <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
                document.body
            )}
        </div>
    );
}
