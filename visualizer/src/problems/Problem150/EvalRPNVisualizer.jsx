import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DockableWorkspace from "../../components/shared/DockableWorkspace";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./EvalRPNVisualizer.css";
import FloatingPanel from '../../components/shared/FloatingPanel'

const SOLUTION_CODE = [
    { line: 1, text: "def evalRPN(tokens):" },
    { line: 2, text: "    stack = []" },
    { line: 3, text: "    for t in tokens:" },
    { line: 4, text: "        if t in '+-*/':" },
    { line: 5, text: "            b, a = stack.pop(), stack.pop()" },
    { line: 6, text: "            if t == '+': stack.append(a + b)" },
    { line: 7, text: "            elif t == '-': stack.append(a - b)" },
    { line: 8, text: "            elif t == '*': stack.append(a * b)" },
    { line: 9, text: "            else: stack.append(int(a / b))" },
    { line: 10, text: "        else:" },
    { line: 11, text: "            stack.append(int(t))" },
    { line: 12, text: "    return stack[0]" },
];

function generateSteps(tokens) {
    const steps = [];
    const stack = [];
    steps.push({ activeLine: 2, ti: -1, stack: [], message: "Initialize empty stack." });

    for (let ti = 0; ti < tokens.length; ti++) {
        const t = tokens[ti];
        if (["+", "-", "*", "/"].includes(t)) {
            steps.push({ activeLine: 4, ti, stack: [...stack], message: `Token "${t}" is an operator.` });
            const b = stack.pop(), a = stack.pop();
            steps.push({ activeLine: 5, ti, stack: [...stack], a, b, op: t, message: `Pop b=${b}, a=${a}` });
            let result;
            if (t === "+") { result = a + b; steps.push({ activeLine: 6, ti, stack: [...stack], a, b, op: t, message: `${a} + ${b} = ${result}` }); }
            else if (t === "-") { result = a - b; steps.push({ activeLine: 7, ti, stack: [...stack], a, b, op: t, message: `${a} - ${b} = ${result}` }); }
            else if (t === "*") { result = a * b; steps.push({ activeLine: 8, ti, stack: [...stack], a, b, op: t, message: `${a} * ${b} = ${result}` }); }
            else { result = Math.trunc(a / b); steps.push({ activeLine: 9, ti, stack: [...stack], a, b, op: t, message: `trunc(${a} / ${b}) = ${result}` }); }
            stack.push(result);
            steps.push({ activeLine: t === "+" ? 6 : t === "-" ? 7 : t === "*" ? 8 : 9, ti, stack: [...stack], message: `Push ${result}. Stack: [${stack.join(",")}]` });
        } else {
            steps.push({ activeLine: 11, ti, stack: [...stack], message: `Token "${t}" is a number — push ${parseInt(t, 10)}` });
            stack.push(parseInt(t, 10));
            steps.push({ activeLine: 11, ti, stack: [...stack], message: `Stack: [${stack.join(",")}]` });
        }
    }
    steps.push({ activeLine: 12, ti: tokens.length, stack: [...stack], message: `Result = ${stack[0]}` });
    return steps;
}

const EXAMPLES = getExamples('eval-rpn');

function parseTokens(str) {
    try { const p = JSON.parse(str); if (!Array.isArray(p)) throw new Error(); return { tokens: p.map(String), err: "" }; }
    catch { return { tokens: [], err: "Invalid JSON array" }; }
}

export default function EvalRPNVisualizer() {
    const [input, setInput] = useState('["2","1","+","3","*"]');

    const { tokens, err } = useMemo(() => parseTokens(input), [input]);
    const steps = useMemo(() => (tokens.length ? generateSteps(tokens) : []), [tokens]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const applyExample = useCallback(
        (ex) => { setInput(JSON.stringify(ex.tokens)); handleReset(); },
        [handleReset]
    );

    const dockPanels = useMemo(() => [
        {
            id: 'code',
            title: 'Code',
            content: (
                <CodeTracePanel
                    step={step}
                    codeLines={SOLUTION_CODE}
                    highlightedLines={connectivity.highlightedLines}
                    onLineSelect={connectivity.handleLineSelect}
                    onActiveLineDomChange={setActiveLineDom}
                />
            ),
        },
        {
            id: 'viz',
            title: '🧮 RPN Calculator',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {EXAMPLES.map(ex => (
                                <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                                    {ex.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <input style={{ padding: '8px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }} value={input} onChange={(e) => { setInput(e.target.value); handleReset(); }} placeholder='["2","1","+","3","*"]' />
                    {err && <div style={{ padding: 8, backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 12 }}>{err}</div>}

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Tokens</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', minHeight: 40 }}>
                        {tokens.map((t, i) => {
                            const isOp = ['+', '-', '*', '/'].includes(t);
                            const isCurrent = step?.ti === i;
                            return (
                                <motion.div key={i} animate={{ scale: isCurrent ? 1.3 : 1 }} style={{
                                    padding: '6px 10px',
                                    backgroundColor: isOp ? '#fee2e2' : '#dbeafe',
                                    border: isCurrent ? '3px solid #0ea5e9' : '1px solid #cbd5e1',
                                    borderRadius: 4, fontSize: 12, fontWeight: 'bold', color: isOp ? '#991b1b' : '#1e3a8a'
                                }}>
                                    {t}
                                </motion.div>
                            );
                        })}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Stack</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', minHeight: 60, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                        <AnimatePresence mode="popLayout">
                            {(step?.stack ?? []).map((v, i) => (
                                <motion.div key={`${i}-${v}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{
                                    padding: '8px 12px',
                                    backgroundColor: i === (step?.stack?.length ?? 0) - 1 ? '#dbeafe' : '#f3f4f6',
                                    border: i === (step?.stack?.length ?? 0) - 1 ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                                    borderRadius: 4, fontSize: 14, fontWeight: 'bold', color: '#1e293b'
                                }}>
                                    {v}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(step?.stack?.length ?? 0) === 0 && <span style={{ color: '#64748b', fontSize: 12 }}>empty</span>}
                    </div>

                    {step?.a != null && (
                        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #fcd34d', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold' }}>
                            <span>{step.a}</span>
                            <span style={{ color: '#f59e0b' }}>{step.op}</span>
                            <span>{step.b}</span>
                        </div>
                    )}
                </div>
            ),
        },
    ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, input, tokens, err, applyExample]);

    return (
        <div className="problem-shell">
            <DockableWorkspace
                panels={dockPanels}
                initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
            />
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
