import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import ManualInputPanel from "../../components/shared/ManualInputPanel";
import "./ValidSudokuVisualizer.css";

const SOLUTION_CODE = [
    { line: 1, text: "def isValidSudoku(board):" },
    { line: 2, text: "    rows = [set() for _ in range(9)]" },
    { line: 3, text: "    cols = [set() for _ in range(9)]" },
    { line: 4, text: "    boxes = [set() for _ in range(9)]" },
    { line: 5, text: "    for r in range(9):" },
    { line: 6, text: "        for c in range(9):" },
    { line: 7, text: "            v = board[r][c]" },
    { line: 8, text: "            if v == '.': continue" },
    { line: 9, text: "            b = (r//3)*3 + c//3" },
    { line: 10, text: "            if v in rows[r] or v in cols[c] or v in boxes[b]:" },
    { line: 11, text: "                return False" },
    { line: 12, text: "            rows[r].add(v); cols[c].add(v); boxes[b].add(v)" },
    { line: 13, text: "    return True" },
];

const EXAMPLES = {
    valid: {
        label: "Valid",
        board: [
            ["5", "3", ".", ".", "7", ".", ".", ".", "."],
            ["6", ".", ".", "1", "9", "5", ".", ".", "."],
            [".", "9", "8", ".", ".", ".", ".", "6", "."],
            ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
            ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
            ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
            [".", "6", ".", ".", ".", ".", "2", "8", "."],
            [".", ".", ".", "4", "1", "9", ".", ".", "5"],
            [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ],
    },
    invalid: {
        label: "Invalid (dup col)",
        board: [
            ["8", "3", ".", ".", "7", ".", ".", ".", "."],
            ["6", ".", ".", "1", "9", "5", ".", ".", "."],
            [".", "9", "8", ".", ".", ".", ".", "6", "."],
            ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
            ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
            ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
            [".", "6", ".", ".", ".", ".", "2", "8", "."],
            [".", ".", ".", "4", "1", "9", ".", ".", "5"],
            [".", ".", ".", ".", "8", ".", ".", "7", "9"],
        ],
    },
};

const EXAMPLE_LIST = Object.values(EXAMPLES);

const VALIDSUDOKU_PATTERNS =['check', 'continue', 'duplicate', 'done', 'init', 'mark'];

const LINE_PATTERN_MAP = {
    7: 'check',
    8: 'continue',
    10: 'duplicate',
    12: 'mark',
    13: 'done',
};

function generateSteps(board) {
    const steps = [];
    const rows = Array.from({ length: 9 }, () => new Set());
    const cols = Array.from({ length: 9 }, () => new Set());
    const boxes = Array.from({ length: 9 }, () => new Set());
    const conflictCells = new Set(); // "r,c"

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const v = board[r][c];
            steps.push({
                phase: 'check',
                activeLine: 7,
                curR: r, curC: c,
                conflictCells: new Set(conflictCells),
                result: null,
                message: `Check cell (${r},${c}) = "${v}"`,
            });
            if (v === ".") {
                steps.push({
                    phase: 'continue',
                    activeLine: 8,
                    curR: r, curC: c,
                    conflictCells: new Set(conflictCells),
                    result: null,
                    message: `Cell (${r},${c}) is empty — skip.`,
                });
                continue;
            }
            const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
            if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) {
                conflictCells.add(`${r},${c}`);
                steps.push({
                    phase: 'duplicate',
                    activeLine: 11,
                    curR: r, curC: c,
                    conflictCells: new Set(conflictCells),
                    result: false,
                    message: `Duplicate "${v}" at (${r},${c})! Board is INVALID.`,
                });
                return steps;
            }
            rows[r].add(v);
            cols[c].add(v);
            boxes[b].add(v);
            steps.push({
                phase: 'mark',
                activeLine: 12,
                curR: r, curC: c,
                conflictCells: new Set(conflictCells),
                result: null,
                message: `"${v}" at (${r},${c}) is unique in row, col, box. Added.`,
            });
        }
    }
    steps.push({
        phase: 'done',
        activeLine: 13,
        curR: -1, curC: -1,
        conflictCells: new Set(),
        result: true,
        message: "All cells valid — board is VALID!",
    });
    return steps;
}

export default function ValidSudokuVisualizer() {
    const [activeLabel, setActiveLabel] = useState(EXAMPLES.valid.label);
    const [boardInput, setBoardInput] = useState(JSON.stringify(EXAMPLES.valid.board));

    const { board, inputError } = useMemo(() => {
        try {
            const parsed = JSON.parse(boardInput);
            if (!Array.isArray(parsed) || parsed.length !== 9) {
                throw new Error("board must be an array of 9 rows");
            }
            parsed.forEach((row) => {
                if (!Array.isArray(row) || row.length !== 9) {
                    throw new Error("each row must be an array of 9 cells");
                }
                row.forEach((cell) => {
                    if (typeof cell !== "string" || !/^[1-9.]$/.test(cell)) {
                        throw new Error('each cell must be "1"-"9" or "."');
                    }
                });
            });
            return { board: parsed, inputError: "" };
        } catch (e) {
            return { board: EXAMPLES.valid.board, inputError: e.message };
        }
    }, [boardInput]);

    const steps = useMemo(() => generateSteps(board), [board]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const step = stepIndex >= 0 ? steps[stepIndex] : null;

    const applyExample = useCallback((ex) => {
        if (!ex) return;
        setActiveLabel(ex.label);
        setBoardInput(JSON.stringify(ex.board));
        handleReset();
    }, [handleReset]);

    const handleInputChange = useCallback((key, text) => {
        if (key === "board") setBoardInput(text);
        setActiveLabel("");
        handleReset();
    }, [handleReset]);

    // Step 3: Extract panels into consts
    const primaryPanel = (
        <div className="vs-panel">
            <ManualInputPanel
                fields={[{ key: "board", label: "board (9x9)", type: "array" }]}
                values={{ board: boardInput }}
                onChange={handleInputChange}
                examples={EXAMPLE_LIST}
                activeLabel={activeLabel}
                applyExample={applyExample}
                inputError={inputError}
            />
            <div className="vs-panel-label">Board</div>
            <div className="vs-grid">
                {board.map((row, r) =>
                    row.map((cell, c) => {
                        const isCur = step?.curR === r && step?.curC === c;
                        const isConflict = step?.conflictCells?.has(`${r},${c}`);
                        const boxR = Math.floor(r / 3);
                        const boxC = Math.floor(c / 3);
                        const boxShade = (boxR + boxC) % 2 === 0 ? "even" : "odd";
                        return (
                            <motion.div
                                key={`${r}-${c}`}
                                className={`vs-cell ${isCur ? "current" : ""} ${isConflict ? "conflict" : ""} box-${boxShade}`}
                                animate={{ scale: isCur ? 1.18 : 1, backgroundColor: isConflict ? "#3d0000" : isCur ? "#1a2a3a" : undefined }}
                                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                style={{
                                    borderRight: (c + 1) % 3 === 0 && c !== 8 ? "2px solid #585b70" : undefined,
                                    borderBottom: (r + 1) % 3 === 0 && r !== 8 ? "2px solid #585b70" : undefined,
                                }}
                            >
                                {cell !== "." ? cell : ""}
                            </motion.div>
                        );
                    })
                )}
            </div>
            {step?.result != null && (
                <AnimatePresence>
                    <motion.div
                        className={`vs-result ${step.result ? "valid" : "invalid"}`}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {step.result ? "✓ Valid Sudoku" : "✗ Invalid Sudoku"}
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );

    const codePanel = (
        <div style={{ position: "relative", height: "100%" }}>
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
        <div className="vs-status">{step?.message ?? "Press Play to begin."}</div>
    );

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={VALIDSUDOKU_PATTERNS} />
            )}
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

    // Step 4: Add state + config
    const [panelDivs, setPanelDivs] = useState(null);
    const panelConfigs = useMemo(
        () => [
            { id: "primary", title: "Board", dockMode: "split-right" },
            { id: "code", title: "Code", dockMode: "split-bottom" },
            { id: "status", title: "Status", dockMode: "split-bottom", ratio: 0.08 },
        ],
        []
    );
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    // Step 5: Replace return block
    return (
        <div className="vs-shell">
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
