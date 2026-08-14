import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./Problem394Visualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE = [
    { line: 1, text: "def decodeString(s):" },
    { line: 2, text: "    stack = []  # (count, current_str)" },
    { line: 3, text: "    cur = ''; k = 0" },
    { line: 4, text: "    for c in s:" },
    { line: 5, text: "        if c.isdigit():" },
    { line: 6, text: "            k = k * 10 + int(c)" },
    { line: 7, text: "        elif c == '[':" },
    { line: 8, text: "            stack.append((k, cur))" },
    { line: 9, text: "            cur = ''; k = 0" },
    { line: 10, text: "        elif c == ']':" },
    { line: 11, text: "            k, prev = stack.pop()" },
    { line: 12, text: "            cur = prev + cur * k" },
    { line: 13, text: "        else:" },
    { line: 14, text: "            cur += c" },
    { line: 15, text: "    return cur" },
];

function generateSteps(s) {
    const steps = [];
    const stack = []; // [{k, prev}]
    let cur = "", k = 0;

    steps.push({ activeLine: 3, ci: -1, cur, k, stack: [], message: `Start. s="${s}"` });

    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (/\d/.test(c)) {
            k = k * 10 + parseInt(c, 10);
            steps.push({ activeLine: 6, ci: i, cur, k, stack: [...stack], c, message: `Digit '${c}': k=${k}` });
        } else if (c === "[") {
            stack.push({ k, prev: cur });
            steps.push({ activeLine: 8, ci: i, cur, k, stack: [...stack], c, message: `'[': push (k=${k}, cur="${cur}"). Reset cur, k.` });
            cur = ""; k = 0;
        } else if (c === "]") {
            const { k: pk, prev } = stack.pop();
            const repeated = cur.repeat(pk);
            cur = prev + repeated;
            steps.push({ activeLine: 12, ci: i, cur, k, stack: [...stack], c, message: `']': pop k=${pk}, prev="${prev}". cur="${prev}"+"${repeated}"="${cur}"` });
        } else {
            cur += c;
            steps.push({ activeLine: 14, ci: i, cur, k, stack: [...stack], c, message: `Letter '${c}': cur="${cur}"` });
        }
    }

    steps.push({ activeLine: 15, ci: s.length, cur, k, stack: [], message: `Done! Result: "${cur}"` });
    return steps;
}

const EXAMPLES = getExamples('decode-string');

export default function Problem394Visualizer() {
    const [sInput, setSInput] = useState("3[a]2[bc]");
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const steps = useMemo(() => { try { return generateSteps(sInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })); } catch { return []; } }, [sInput]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback((ex) => { setSInput(ex.s); handleReset(); }, [handleReset]);

    const dockPanels = useMemo(() => [
        {
            id: 'code',
            title: 'Code',
            content: (
                <div style={{ position: "relative" }}>
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
            ),
        },
        {
            id: 'viz',
            title: '📦 Stack Unboxing',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {EXAMPLES.map(e => (
                                <button key={e.label} onClick={() => applyExample(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <input style={{ padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }} value={sInput}
                        onChange={(e) => { setSInput(e.target.value); handleReset(); }} placeholder="encoded string" />

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Input</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40 }}>
                        {sInput.split("").map((ch, i) => {
                            const isCur = step?.ci === i;
                            const type = /\d/.test(ch) ? 'digit' : ch === '[' ? 'open' : ch === ']' ? 'close' : 'letter';
                            const colors = { digit: '#dbeafe', open: '#fecaca', close: '#fecaca', letter: '#dcfce7' };
                            return (
                                <motion.div key={i} animate={{ scale: isCur ? 1.3 : 1 }} style={{
                                    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: colors[type], border: isCur ? '3px solid #0ea5e9' : '1px solid #cbd5e1',
                                    borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: '#1e293b'
                                }}>
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
{ch}</motion.div>
                            );
                        })}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Stack</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', minHeight: 50, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                        <AnimatePresence mode="popLayout">
                            {(step?.stack ?? []).map((item, i) => (
                                <motion.div key={`${i}-${item.k}`} initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
                                    padding: '8px', backgroundColor: '#f8fafc', border: i === (step?.stack?.length - 1) ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                                    borderRadius: 4, fontSize: 11, fontFamily: 'monospace'
                                }}>
                                    <div>k={item.k}</div>
                                    <div>"{item.prev}"</div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(step?.stack?.length ?? 0) === 0 && <span style={{ color: '#64748b', fontSize: 12 }}>empty</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #86efac' }}>
                            <div style={{ fontSize: 11, color: '#65a30d' }}>Current String</div>
                            <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#15803d', marginTop: 4 }}>"{step?.cur ?? ''}"</div>
                        </div>
                        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '1px solid #0ea5e9' }}>
                            <div style={{ fontSize: 11, color: '#1e40af' }}>Multiplier</div>
                            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9', marginTop: 4 }}>{step?.k ?? 0}</div>
                        </div>
                    </div>
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, sInput, applyExample]);

    return (
        <div className="problem-shell">
            <DockableWorkspace
                panels={dockPanels}
                initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
            />
            <FloatingPanel title="Playback Controls">
                {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
                    onSpeedChange={e => setSpeed(Number(e.target.value))}
                    showPatternOverlay={showPatternOverlay}
                    onShowPatternOverlayChange={setShowPatternOverlay}
                    patternOverlayLabel="Show pattern overlay"
                    showPatternOverlayToggle
                />
            </FloatingPanel>
        </div>
    );
}

