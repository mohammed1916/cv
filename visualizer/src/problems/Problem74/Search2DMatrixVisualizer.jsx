import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom'
import { motion } from "framer-motion";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./Search2DMatrixVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SEARCH2DMATRIX_PATTERNS = ['init', 'calc', 'found', 'lo', 'hi', 'not_found']

const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'calc',
  8: 'found',
  9: 'lo',
  10: 'hi',
  11: 'not_found',
}
const SOLUTION_CODE = [
    { line: 1, text: "def searchMatrix(matrix, target):" },
    { line: 2, text: "    rows, cols = len(matrix), len(matrix[0])" },
    { line: 3, text: "    lo, hi = 0, rows * cols - 1" },
    { line: 4, text: "    while lo <= hi:" },
    { line: 5, text: "        mid = (lo + hi) // 2" },
    { line: 6, text: "        r, c = mid // cols, mid % cols" },
    { line: 7, text: "        val = matrix[r][c]" },
    { line: 8, text: "        if val == target: return True" },
    { line: 9, text: "        elif val < target: lo = mid + 1" },
    { line: 10, text: "        else: hi = mid - 1" },
    { line: 11, text: "    return False" },
];

function generateSteps(matrix, target) {
    const steps = [];
    const rows = matrix.length, cols = matrix[0].length;
    let lo = 0, hi = rows * cols - 1;

    steps.push({ phase: 'init', activeLine: 3, lo, hi, mid: -1, r: -1, c: -1, found: null, message: `Search for ${target}. Treat ${rows}×${cols} matrix as 1D array, lo=0, hi=${hi}` });

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const r = Math.floor(mid / cols), c = mid % cols;
        const val = matrix[r][c];
        steps.push({ phase: 'calc', activeLine: 5, lo, hi, mid, r, c, val, found: null, message: `lo=${lo}, hi=${hi} → mid=${mid} → [${r}][${c}]=${val}` });

        if (val === target) {
            steps.push({ phase: 'found', activeLine: 8, lo, hi, mid, r, c, val, found: true, message: `Found ${target} at [${r}][${c}]! Return true.` });
            return steps;
        } else if (val < target) {
            lo = mid + 1;
            steps.push({ phase: 'lo', activeLine: 9, lo, hi, mid, r, c, val, found: null, message: `${val} < ${target} → lo = ${lo}` });
        } else {
            hi = mid - 1;
            steps.push({ phase: 'hi', activeLine: 10, lo, hi, mid, r, c, val, found: null, message: `${val} > ${target} → hi = ${hi}` });
        }
    }

    steps.push({ phase: 'not_found', activeLine: 11, lo, hi, mid: -1, r: -1, c: -1, found: false, message: `${target} not found. Return false.` });
    return steps;
}

const EXAMPLES = getExamples('search2-dmatrix');

export default function Search2DMatrixVisualizer() {
    const [sel, setSel] = useState(0);
  const [matrixInput, setMatrixInput] = useState(JSON.stringify(EXAMPLES[0]?.["matrix"] ?? null));
  const [targetInput, setTargetInput] = useState(JSON.stringify(EXAMPLES[0]?.["target"] ?? null));
  const { matrix, target, inputError } = useMemo(() => {
    try {
      const parsedMatrix = JSON.parse(matrixInput); if (!Array.isArray(parsedMatrix)) throw new Error('matrix must be an array');
      const parsedTarget = JSON.parse(targetInput); if (!Array.isArray(parsedTarget)) throw new Error('target must be an array');
      return { matrix: parsedMatrix, target: parsedTarget, inputError: '' };
    } catch (e) {
      return { matrix: EXAMPLES[sel]?.matrix, target: EXAMPLES[sel]?.target, inputError: e.message };
    }
  }, [matrixInput, targetInput]);;

        const steps = useMemo(() => generateSteps(matrix, target), [matrix, target]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback((i) => { setSel(i); setMatrixInput(JSON.stringify(EXAMPLES[i].matrix)); setTargetInput(JSON.stringify(EXAMPLES[i].target)); handleReset(); }, [handleReset]);

    const cols = matrix[0].length;
    const lo = step?.lo ?? 0, hi = step?.hi ?? (matrix.length * cols - 1), mid = step?.mid ?? -1;

    // Step 2: Extract panels into consts
    const primaryPanel = (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                {EXAMPLES.map((ex, i) => (
                    <button key={ex.label} onClick={() => applyExample(i)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: sel === i ? '#dbeafe' : '#f1f5f9' }}>
                        {ex.label}
                    </button>
                ))}
                <span style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b', marginLeft: 'auto' }}>target = {target}</span>
            </div>

            <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Matrix</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(50px, 1fr))`, gap: 4 }}>
                {matrix.map((row, i) =>
                    row.map((val, j) => {
                        const flat = i * cols + j;
                        const isMid = flat === mid;
                        const inRange = flat >= lo && flat <= hi;
                        const isFound = isMid && step?.found === true;
                        return (
                            <motion.div key={`${i}-${j}`} animate={{ scale: isMid ? 1.15 : 1 }} style={{
                                padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isFound ? '#dcfce7' : isMid ? '#fbbf24' : inRange ? '#dbeafe' : '#f3f4f6',
                                border: isMid ? '2px solid #f59e0b' : inRange ? '1px solid #0ea5e9' : '1px solid #cbd5e1',
                                borderRadius: 4, fontSize: 11, fontWeight: 'bold', color: '#1e293b'
                            }}>
                                <span>{val}</span>
                                <span style={{ fontSize: 9, color: '#64748b' }}>[{flat}]</span>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>lo</div>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{lo}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>mid</div>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#f59e0b' }}>{mid >= 0 ? mid : '—'}</div>
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>hi</div>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>{hi}</div>
                </div>
            </div>

            {step?.found !== null && (
                <div style={{ padding: 12, backgroundColor: step?.found ? '#dcfce7' : '#fee2e2', borderRadius: 6, border: step?.found ? '2px solid #86efac' : '2px solid #fecaca', textAlign: 'center', fontWeight: 600, color: step?.found ? '#15803d' : '#991b1b' }}>
                    {step?.found ? `✓ Found ${target}` : `✗ ${target} not found`}
                </div>
            )}
        </div>
    
    </>)

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
            {showPatternOverlay && (
                <CodePatternAnnotations
                    linePatterns={LINE_PATTERN_MAP}
                    currentPhase={step?.phase}
                    activeLineDom={activeLineDom}
                    activeLine={step?.activeLine}
                />
            )}
        </div>
    )

    const statusPanel = (
        <div className="s2m-status">
            {step?.message ?? 'Press Play or Step to begin.'}
        </div>
    )

    const playbackPanel = (
      <>
            {showPatternOverlay && (
                <PatternLegend currentPhase={step?.phase} usedPatterns={SEARCH2DMATRIX_PATTERNS} />
            )}
            <PlaybackControls
                isPlaying={isPlaying}
                isDone={isDone}
                speed={speed}
                onPlayToggle={togglePlay}
                onPrev={stepBack}
                onNext={stepForward}
                onReset={handleReset}
                prevDisabled={stepIndex <= 0}
                nextDisabled={isDone}
                resetDisabled={stepIndex <= 0}
                onSpeedChange={e => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
        </>
    )

    // Step 3: Add state + config
    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
        () => [
            { id: 'primary', title: '🔍 Binary Search', dockMode: 'split-right' },
            { id: 'code', title: 'Code', dockMode: 'split-bottom' },
            { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
        ],
        []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    // Step 4: Replace return with portals
    return (
        <div className="s2m-shell">
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

