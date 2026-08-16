import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from "../../config/examplesRegistry";
import "./BasicCalculatorVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1,  text: "def calculate(s):" },
  { line: 2,  text: "    stack, result, num, sign = [], 0, 0, 1" },
  { line: 3,  text: "    for ch in s:" },
  { line: 4,  text: "        if ch.isdigit():" },
  { line: 5,  text: "            num = num * 10 + int(ch)" },
  { line: 6,  text: "        elif ch in '+-':" },
  { line: 7,  text: "            result += sign * num" },
  { line: 8,  text: "            num = 0; sign = 1 if ch=='+' else -1" },
  { line: 9,  text: "        elif ch == '(':" },
  { line: 10, text: "            stack.append(result); stack.append(sign)" },
  { line: 11, text: "            result = 0; sign = 1" },
  { line: 12, text: "        elif ch == ')':" },
  { line: 13, text: "            result += sign * num; num = 0" },
  { line: 14, text: "            result *= stack.pop()  # sign" },
  { line: 15, text: "            result += stack.pop()  # prev result" },
  { line: 16, text: "    return result + sign * num" },
];

const EXAMPLES = getExamples('basic-calculator');

function generateSteps(s) {
  const steps = [];
  const chars = s.split("");
  let stack = [], result = 0, num = 0, sign = 1;

  steps.push({ activeLine: 2, stack: [], result: 0, num: 0, sign: 1, charIdx: -1, phase: "init", message: "Init: result=0, num=0, sign=+1, stack=[]" });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === " ") continue;

    if (/\d/.test(ch)) {
      num = num * 10 + parseInt(ch);
      steps.push({ activeLine: 5, stack: [...stack], result, num, sign, charIdx: i, phase: "digit", message: `Digit '${ch}' → num=${num}` });
    } else if (ch === "+" || ch === "-") {
      result += sign * num;
      num = 0;
      sign = ch === "+" ? 1 : -1;
      steps.push({ activeLine: 8, stack: [...stack], result, num, sign, charIdx: i, phase: "op", message: `'${ch}' → result=${result}, sign=${sign > 0 ? "+1" : "-1"}` });
    } else if (ch === "(") {
      stack.push(result);
      stack.push(sign);
      result = 0; sign = 1;
      steps.push({ activeLine: 10, stack: [...stack], result, num, sign, charIdx: i, phase: "open", message: `'(' → push result/sign, reset. stack=[${stack.join(",")}]` });
    } else if (ch === ")") {
      result += sign * num;
      num = 0;
      const prevSign = stack.pop();
      const prevResult = stack.pop();
      result = prevResult + prevSign * result;
      steps.push({ activeLine: 15, stack: [...stack], result, num, sign, charIdx: i, phase: "close", message: `')' → pop sign/result → result=${result}` });
    }
  }

  result += sign * num;
  steps.push({ activeLine: 16, stack: [], result, num, sign, charIdx: -1, phase: "done", done: true, message: `Final: result + sign*num = ${result}` });
  return steps;
}

export default function BasicCalculatorVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("1 + 1");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "1 + 1", inputError: e.message };
    }
  }, [sInput]);
  const steps = useMemo(() => generateSteps(s), [s]);
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length);
  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); handleReset(); }, [handleReset]);;
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

  const stack = step?.stack ?? [];
  const result = step?.result ?? 0;
  const num = step?.num ?? 0;
  const sign = step?.sign ?? 1;
  const charIdx = step?.charIdx ?? -1;
  const phase = step?.phase ?? "init";
  const chars = s.split("");

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🧮 Math Evaluator', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map(e => (
                <button key={e.label} onClick={() => applyEx(e)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, backgroundColor: 'var(--surface2)' }}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 4 }}>Expression</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, minHeight: 40, padding: 8, backgroundColor: 'var(--surface)', borderRadius: 4 }}>
            {chars.map((ch, i) => (
              <motion.span key={i} animate={{ scale: i === charIdx ? 1.4 : 1 }} style={{
                fontSize: 14, fontWeight: 'bold', padding: '4px 8px',
                backgroundColor: i === charIdx ? '#fbbf24' : /\d/.test(ch) ? '#dbeafe' : ch === '(' || ch === ')' ? '#fee2e2' : '#f3f4f6',
                borderRadius: 4, color: 'var(--surface2)'
              }}>
                {ch}
              </motion.span>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 6 }}>Stack (top→bottom)</div>
              <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 4, minHeight: 60, padding: 8, backgroundColor: 'var(--surface)', borderRadius: 4 }}>
                <AnimatePresence>
                  {stack.map((v, i) => (
                    <motion.div key={`${i}-${v}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{
                      padding: '6px 10px', backgroundColor: '#dbeafe', border: '1px solid #0ea5e9', borderRadius: 4,
                      fontSize: 12, fontWeight: 'bold', color: '#1e3a8a'
                    }}>
                      {v}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {stack.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>empty</span>}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 6 }}>State</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 8, backgroundColor: 'var(--surface)', borderRadius: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>result</span>
                  <motion.span key={result} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontWeight: 'bold', color: '#0b7db0' }}>{result}</motion.span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>num</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--surface2)' }}>{num}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>sign</span>
                  <span style={{ fontWeight: 'bold', color: sign > 0 ? '#10b981' : '#ef4444' }}>{sign > 0 ? '+1' : '−1'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>phase</span>
                  <span style={{ fontWeight: 'bold', color: '#8553f6' }}>{phase}</span>
                </div>
              </div>
            </div>
          </div>

          {step?.done && <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac', textAlign: 'center', fontWeight: 600, color: '#15803d' }}>✓ Result = {result}</div>}
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, stack, result, num, sign, charIdx, phase, chars, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"}]}
          values={{ s: sInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
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

