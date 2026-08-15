import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../../components/shared/FloatingPanel";
import CodeTracePanel from "../../../components/CodeTracePanel";
import PlaybackControls from "../../../components/PlaybackControls";
import PatternOverlay from "../../../components/PatternOverlay";
import { usePlaybackState } from "../../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../../config/examplesRegistry'
import "./Visualizer.css";
import { createPortal } from 'react-dom'
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
    if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
        steps.push({ activeLine: 11, lo: 0, hi: -1, mid: -1, r: -1, c: -1, found: false, message: 'Matrix is empty. Return False.' });
        return steps;
    }

    const rows = matrix.length, cols = matrix[0].length;
    let lo = 0, hi = rows * cols - 1;

    steps.push({ activeLine: 3, lo, hi, mid: -1, r: -1, c: -1, found: null, message: `Search for ${target}. Treat ${rows}×${cols} matrix as 1D array, lo=0, hi=${hi}` });

    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        const r = Math.floor(mid / cols), c = mid % cols;
        const val = matrix[r][c];
        steps.push({ activeLine: 5, lo, hi, mid, r, c, val, found: null, message: `lo=${lo}, hi=${hi} → mid=${mid} → [${r}][${c}]=${val}` });

        if (val === target) {
            steps.push({ activeLine: 8, lo, hi, mid, r, c, val, found: true, message: `Found ${target} at [${r}][${c}]! Return True.` });
            return steps;
        } else if (val < target) {
            lo = mid + 1;
            steps.push({ activeLine: 9, lo, hi, mid, r, c, val, found: null, message: `${val} < ${target} → lo = ${lo}` });
        } else {
            hi = mid - 1;
            steps.push({ activeLine: 10, lo, hi, mid, r, c, val, found: null, message: `${val} > ${target} → hi = ${hi}` });
        }
    }

    steps.push({ activeLine: 11, lo, hi, mid: -1, r: -1, c: -1, found: false, message: `${target} not found. Return False.` });
    return steps;
}

const EXAMPLES = getExamples('search-a-2d-matrix');

export default function SearchA2DMatrixVisualizer() {
    const [sel, setSel] = useState(0);

    const { matrix, target } = EXAMPLES[sel];
    const steps = useMemo(() => generateSteps(matrix, target), [matrix, target]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];

    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback((i) => { setSel(i); handleReset(); }, [handleReset]);

    const cols = matrix[0].length;
    const lo = step?.lo ?? 0, hi = step?.hi ?? (matrix.length * cols - 1), mid = step?.mid ?? -1;

    const panelConfigs = useMemo(() => [
      { id: 'code', title: 'Code' },
      { id: 'viz', title: '🔍 Binary Search', dockMode: 'split-right' },
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
                </div>),
    }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, matrix, cols, lo, hi, mid, target, sel, applyExample])
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
                    prevDisabled={stepIndex <= 0}
                    nextDisabled={isDone}
                    resetDisabled={stepIndex <= 0}
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

