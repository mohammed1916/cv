import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import PatternOverlay from "../../components/PatternOverlay";
import PatternLegend from "../../components/PatternLegend";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { getExamples } from '../../config/examplesRegistry'
import "./IPOVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  2: 'init',


  7: 'loop',


  9: 'loop',


  10: 'loop',


  11: 'done',


}

const SOLUTION_CODE_INLINE = [
    { line: 1, text: "def findMaximizedCapital(k, w, profits, capital):" },
    { line: 2, text: "    projects = sorted(zip(capital, profits))" },
    { line: 3, text: "    available = []  # max-heap of profits" },
    { line: 4, text: "    i = 0" },
    { line: 5, text: "    for _ in range(k):" },
    { line: 6, text: "        while i < n and projects[i][0] <= w:" },
    { line: 7, text: "            heappush(available, -projects[i][1])" },
    { line: 8, text: "            i += 1" },
    { line: 9, text: "        if not available: break" },
    { line: 10, text: "        w -= heappop(available)  # add best profit" },
    { line: 11, text: "    return w" },
];
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamples('ipo');

function generateSteps(k, initW, profits, capital) {
    const steps = [];
    const projects = profits.map((p, i) => ({ profit: p, capital: capital[i], idx: i }))
        .sort((a, b) => a.capital - b.capital);

    steps.push({ activeLine: 2, w: initW, round: 0, available: [], pickedProfit: null, i: 0, message: `Sorted projects by capital: [${projects.map(p => `(c=${p.capital},p=${p.profit})`).join(", ")}]` });

    let w = initW;
    let i = 0;
    const available = [];

    for (let round = 1; round <= k; round++) {
        // Add all affordable projects
        while (i < projects.length && projects[i].capital <= w) {
            available.push(projects[i].profit);
            available.sort((a, b) => b - a);
            i++;
            steps.push({ activeLine: 7, w, round, available: [...available], pickedProfit: null, i, message: `Round ${round}: push profit=${projects[i - 1].profit} (capital=${projects[i - 1].capital} ≤ w=${w})` });
        }
        if (available.length === 0) {
            steps.push({ activeLine: 9, w, round, available: [...available], pickedProfit: null, i, message: `Round ${round}: no affordable projects, break.` });
            break;
        }
        const best = available.shift();
        w += best;
        steps.push({ activeLine: 10, w, round, available: [...available], pickedProfit: best, i, message: `Round ${round}: pick profit=${best}, capital now w=${w}` });
    }

    steps.push({ activeLine: 11, w, round: k, available: [...available], pickedProfit: null, i, done: true, message: `Final capital = ${w}` });
    return steps;
}

export default function IPOVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
  const [kInput, setKInput] = useState(1);
  const [wInput, setWInput] = useState(0);
  const [profitsInput, setProfitsInput] = useState("[1,2,3]");
  const [capitalInput, setCapitalInput] = useState("[0,1,1]");
  const { k, w: inputW, profits, capital, inputError } = useMemo(() => {
    try {
      const parsedK = Number(kInput); if (isNaN(parsedK)) throw new Error('k must be a number');
      const parsedW = Number(wInput); if (isNaN(parsedW)) throw new Error('w must be a number');
      const parsedProfits = JSON.parse(profitsInput); if (!Array.isArray(parsedProfits)) throw new Error('profits must be an array');
      const parsedCapital = JSON.parse(capitalInput); if (!Array.isArray(parsedCapital)) throw new Error('capital must be an array');
      return { k: parsedK, w: parsedW, profits: parsedProfits, capital: parsedCapital, inputError: '' };
    } catch (e) {
      return { k: 1, w: 0, profits: "[1,2,3]", capital: "[0,1,1]", inputError: e.message };
    }
  }, [kInput, wInput, profitsInput, capitalInput]);
    const steps = useMemo(
    () => generateSteps(k, inputW, profits, capital).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })), [k, inputW, profits, capital]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); setKInput(String(e.k)); setWInput(String(e.w)); setProfitsInput(JSON.stringify(e.profits)); setCapitalInput(JSON.stringify(e.capital)); handleReset(); }, [handleReset]);;

    const w = step?.w ?? inputW;
    const round = step?.round ?? 0;
    const available = step?.available ?? [];
    const pickedProfit = step?.pickedProfit ?? null;

    const projects = profits.map((p, i) => ({ profit: p, capital: capital[i] }))
        .sort((a, b) => a.capital - b.capital);

    return (
        <div className="ipo-shell">
        <ManualInputPanel
          fields={[{"key":"k","label":"k","type":"number"},{"key":"w","label":"w","type":"number"},{"key":"profits","label":"profits","type":"array"},{"key":"capital","label":"capital","type":"array"}]}
          values={{ k: kInput, w: wInput, profits: profitsInput, capital: capitalInput }}
          onChange={(k, v) => { if (k === 'k') setKInput(v); if (k === 'w') setWInput(v); if (k === 'profits') setProfitsInput(v); if (k === 'capital') setCapitalInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      
            <div className="ipo-examples">
                {EXAMPLES.map(e => (
                    <button key={e.label} className={`ipo-chip ${ex.label === e.label ? "active" : ""}`} onClick={() => applyEx(e)}>
                        {e.label}
                    </button>
                ))}
            </div>

            <div className="ipo-row">
                <div className="ipo-panel ipo-info">
                    <div className="ipo-panel-label">Capital (w)</div>
                    <motion.div className="ipo-big ipo-w" key={w} animate={{ scale: [1.3, 1] }} transition={{ duration: 0.3 }}>{w}</motion.div>
                </div>
                <div className="ipo-panel ipo-info">
                    <div className="ipo-panel-label">Round</div>
                    <div className="ipo-big">{round}/{k}</div>
                </div>
                {pickedProfit !== null && (
                    <motion.div className="ipo-panel ipo-info" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="ipo-panel-label">Picked profit</div>
                        <div className="ipo-big ipo-pick">+{pickedProfit}</div>
                    </motion.div>
                )}
            </div>

            <div className="ipo-panel">
                <div className="ipo-panel-label">Projects (sorted by capital)</div>
                <div className="ipo-projects">
                    {projects.map((p, i) => (
                        <div key={i} className={`ipo-proj ${p.capital <= w ? "affordable" : "locked"}`}>
                            <span className="ipo-proj-c">c={p.capital}</span>
                            <span className="ipo-proj-p">p={p.profit}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ipo-panel">
                <div className="ipo-panel-label">Available max-heap (profits)</div>
                <div className="ipo-heap">
                    <AnimatePresence>
                        {available.map((v, i) => (
                            <motion.div key={`${v}-${i}`}
                                className={`ipo-heap-item ${i === 0 ? "top" : ""}`}
                                layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                                {v}
                            </motion.div>
                        ))}
                        {available.length === 0 && <span className="ipo-empty">empty</span>}
                    </AnimatePresence>
                </div>
            </div>

            {step?.done && <div className="ipo-result">✓ Final capital = {w}</div>}

            <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
            <div className="ipo-status">{step?.message ?? "Press Play to begin."}</div>
            <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
      {showPatternOverlay && (<CodePatternAnnotations linePatterns={LINE_PATTERN_MAP} currentPhase={step?.phase} activeLineDom={activeLineDom} activeLine={step?.activeLine} />)}
        </div>
    );
}

