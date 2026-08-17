import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./ReverseBitsVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
    { line: 1, text: "def reverseBits(n):" },
    { line: 2, text: "    result = 0" },
    { line: 3, text: "    for i in range(32):" },
    { line: 4, text: "        result = (result << 1) | (n & 1)" },
    { line: 5, text: "        n >>= 1" },
    { line: 6, text: "    return result" },
];

const EXAMPLES = getExamples('reverse-bits');

function toBin32(n) { return (n >>> 0).toString(2).padStart(32, "0"); }

function generateSteps(nIn) {
    const steps = [];
    let n = nIn >>> 0;
    let result = 0;
    steps.push({ activeLine: 2, n, result, i: -1, lsb: null, message: `Init: n = ${toBin32(n)}, result = 0` });
    for (let i = 0; i < 32; i++) {
        const lsb = n & 1;
        const newResult = ((result << 1) | lsb) >>> 0;
        steps.push({
            activeLine: 4, n, result: newResult, i, lsb,
            message: `i=${i}: LSB=${lsb} → result = (${toBin32(result)} << 1) | ${lsb} = ${toBin32(newResult)}`
        });
        result = newResult;
        n = n >>> 1;
        steps.push({ activeLine: 5, n, result, i, lsb: null, message: `Shift n right → ${toBin32(n)}` });
    }
    steps.push({ activeLine: 6, n, result, i: 31, lsb: null, done: true, message: `Result: ${result >>> 0} (${toBin32(result)})` });
    return steps;
}

export default function ReverseBitsVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(43261596);
  const [descInput, setDescInput] = useState("43261596");
  const { n, desc, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      const parsedDesc = descInput;
      return { n: parsedN, desc: parsedDesc, inputError: '' };
    } catch (e) {
      return { n: 43261596, desc: "43261596", inputError: e.message };
    }
  }, [nInput, descInput]);
    const steps = useMemo(() => generateSteps(n), [n]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); setDescInput(String(e.desc)); handleReset(); }, [handleReset]);;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

    const displayN = step !== null ? step.n : (n >>> 0);
    const displayR = step !== null ? step.result : 0;
    const i = step?.i ?? -1;
    const lsb = step?.lsb;

    const panelConfigs = useMemo(() => [
        { id: 'input', title: 'Input', dockMode: 'split-top' },
        { id: 'visualization', title: 'Visualization' },
        { id: 'code', title: 'Code Trace', dockMode: 'split-right' },
    ], [])
    const [panelDivs, setPanelDivs] = useState(null)
    const inputPanel = <>
      <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"},{"key":"desc","label":"desc","type":"string"}]}
          values={{ n: nInput, desc: descInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); if (k === 'desc') setDescInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
      />
    </>
    const visualizationPanel = <div className="rb-shell">
            <div className="rb-panel">
                <div className="rb-panel-label">Input n</div>
                <div className="rb-bits">
                    {toBin32(displayN).split("").map((bit, idx) => (
                        <div key={idx} className={`rb-bit ${bit === "1" ? "one" : "zero"} ${idx === 31 && lsb !== null ? "lsb" : ""}`}>{bit}</div>
                    ))}
                </div>
                <div className="rb-bit-labels"><span>31 (MSB)</span><span>0 (LSB)</span></div>
            </div>

            <div className="rb-panel">
                <div className="rb-panel-label">Result (reversed so far)</div>
                <div className="rb-bits">
                    {toBin32(displayR).split("").map((bit, idx) => (
                        <motion.div
                            key={`r-${idx}`}
                            className={`rb-bit ${bit === "1" ? "one-res" : "zero"} ${idx === 31 && lsb !== null ? "new-bit" : ""}`}
                            animate={{ scale: idx === 31 && lsb !== null ? 1.2 : 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >{bit}</motion.div>
                    ))}
                </div>
                <div className="rb-bit-labels"><span>31</span><span>0</span></div>
            </div>

            <div className="rb-trackers">
                <div className="rb-tracker">
                    <span className="rb-tracker-label">Iteration</span>
                    <span className="rb-tracker-val">{i < 0 ? "—" : i}</span>
                </div>
                <div className="rb-tracker">
                    <span className="rb-tracker-label">LSB taken</span>
                    <motion.span key={lsb === null ? "n" : lsb} className={`rb-tracker-val ${lsb === 1 ? "lsb-one" : ""}`}
                        initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
                        {lsb === null ? "—" : lsb}
                    </motion.span>
                </div>
                <div className="rb-tracker">
                    <span className="rb-tracker-label">Result (decimal)</span>
                    <span className="rb-tracker-val rb-small">{displayR >>> 0}</span>
                </div>
            </div>

            {step?.done && <div className="rb-result">✓ Reversed: {displayR >>> 0}</div>}

    </div>
    const codePanel = <>
      <div className="rb-status">{step?.message ?? "Press Play to begin."}</div>
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
    </>
    return (
        <>
          <LuminoDockPanel panels={panelConfigs} onPanelReady={setPanelDivs} />
          {panelDivs && <>
            {panelDivs.input && createPortal(inputPanel, panelDivs.input)}
            {panelDivs.visualization && createPortal(visualizationPanel, panelDivs.visualization)}
            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          </>}
            <FloatingPanel title="Playback Controls">
        <PlaybackControls
                isPlaying={isPlaying} isDone={isDone} speed={speed}
                onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
                prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0}
                onSpeedChange={e => setSpeed(Number(e.target.value))}
                showPatternOverlay={showPatternOverlay}
                onShowPatternOverlayChange={setShowPatternOverlay}
                patternOverlayLabel="Show pattern overlay"
                showPatternOverlayToggle
            />
      </FloatingPanel>
            {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
        </>
    );
}
