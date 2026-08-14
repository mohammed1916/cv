import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./RotateImageVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from "../../components/LuminoDockPanel"

const ROTATE_PATTERNS = ['transpose', 'swap', 'reverse', 'done']

const LINE_PATTERN_MAP = {
  4: 'transpose',
  5: 'transpose',
  6: 'swap',
  7: 'swap',
  9: 'reverse',
  10: 'reverse',
}

const SOLUTION_CODE = [
    { line: 1, text: "def rotate(matrix):" },
    { line: 2, text: "    n = len(matrix)" },
    { line: 3, text: "    # Step 1: Transpose" },
    { line: 4, text: "    for i in range(n):" },
    { line: 5, text: "        for j in range(i+1, n):" },
    { line: 6, text: "            matrix[i][j], matrix[j][i] = \\" },
    { line: 7, text: "                matrix[j][i], matrix[i][j]" },
    { line: 8, text: "    # Step 2: Reverse each row" },
    { line: 9, text: "    for row in matrix:" },
    { line: 10, text: "        row.reverse()" },
];

function generateSteps(initial) {
    const steps = [];
    const n = initial.length;
    const matrix = initial.map((r) => [...r]); // Init copy needed only here

    steps.push({ activeLine: 3, matrix, hi: null, hj: null, phase: "start", message: "Step 1: Transpose the matrix." });

    // Transpose
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            steps.push({ activeLine: 5, matrix, hi: i, hj: j, phase: "swap-pre", message: `Swap [${i}][${j}]=${matrix[i][j]} ↔ [${j}][${i}]=${matrix[j][i]}` });
            const tmp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = tmp;
            steps.push({ activeLine: 6, matrix, hi: i, hj: j, phase: "swap-post", message: `Swapped: [${i}][${j}]=${matrix[i][j]}, [${j}][${i}]=${matrix[j][i]}` });
        }
    }

    steps.push({ activeLine: 8, matrix, hi: null, hj: null, phase: "reverse-start", message: "Transpose done. Step 2: Reverse each row." });

    // Reverse rows
    for (let i = 0; i < n; i++) {
        steps.push({ activeLine: 9, matrix, hi: i, hj: null, phase: "reverse-row-pre", message: `Reverse row ${i}: [${matrix[i].join(",")}]` });
        matrix[i].reverse();
        steps.push({ activeLine: 10, matrix, hi: i, hj: null, phase: "reverse-row-post", message: `Row ${i} reversed → [${matrix[i].join(",")}]` });
    }

    steps.push({ activeLine: 10, matrix, hi: null, hj: null, phase: "done", message: "Done! Matrix rotated 90° clockwise." });
    return steps;
}

const EXAMPLES = getExamples('rotate-image');

const ACCENT = "#f9e2af";

export default function RotateImageVisualizer() {
    const [selected, setSelected] = useState(0);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const initial = EXAMPLES[selected].matrix;
    const steps = useMemo(() => generateSteps(initial), [initial]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];

    const applyExample = useCallback((idx) => { setSelected(idx); handleReset(); }, [handleReset]);

    const matrix = step?.matrix ?? initial;
    const n = matrix.length;

    // Extract panels into consts (step 3)
    const primaryPanel = (
        <div className="ri-panel">
            <div className="ri-panel-label">Original</div>
            <MatrixGrid matrix={initial} n={n} hi={null} hj={null} accent={ACCENT} />
        </div>
    );
    const statePanel = (
        <div className="ri-panel">
            <div className="ri-panel-label">Working matrix</div>
            <MatrixGrid matrix={matrix} n={n} hi={step?.hi} hj={step?.hj} accent={ACCENT} phase={step?.phase} />
        </div>
    );
    const codePanel = (
        <div style={{ position: 'relative', height: '100%' }}>
            <CodeTracePanel
                step={step}
                codeLines={SOLUTION_CODE}
                onActiveLineDomChange={setActiveLineDom}
                disableResizer
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
    const statusPanel = (
        <div className="ri-status">{step?.message ?? "Press Play to begin."}</div>
    );
    const playbackPanel = (
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={ROTATE_PATTERNS} />
            )}
            <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                prevDisabled={stepIndex <= 0} nextDisabled={isDone} resetDisabled={stepIndex <= 0}
                onSpeedChange={(e) => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    );

    // Add state + config (step 4)
    const [panelDivs, setPanelDivs] = useState(null);
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: 'Original', dockMode: 'split-right' },
            { id: 'state', title: 'Working matrix', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    );
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    // Replace return block (step 5)
    return (
        <div className="ri-shell">
            <div className="ri-controls-row">
                <div className="ri-examples">
                    {EXAMPLES.map((ex, i) => (
                        <button key={ex.label} className={`ri-chip ${selected === i ? "active" : ""}`} onClick={() => applyExample(i)}>{ex.label}</button>
                    ))}
                </div>
            </div>

            <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
            {panelDivs && (
                    {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
                    {panelDivs.state && createPortal(statePanel, panelDivs.state)}
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

function MatrixGrid({ matrix, n, hi, hj, phase }) {
    return (
        <div className="ri-grid" style={{ gridTemplateColumns: `repeat(${n}, 48px)` }}>
            {matrix.map((row, i) =>
                row.map((val, j) => {
                    const isHi = i === hi && hj === null;
                    const isSwap = (i === hi && j === hj) || (i === hj && j === hi && hj !== null);
                    return (
                        <motion.div key={`${i}-${j}`}
                            className={`ri-cell ${isHi ? "row-hi" : ""} ${isSwap ? (phase === "swap-post" ? "swapped" : "swapping") : ""}`}
                            animate={{ scale: isSwap ? 1.12 : 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                            {val}
                        </motion.div>
                    );
                })
            )}
        </div>
    );
}
