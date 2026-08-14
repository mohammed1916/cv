import { useState, useMemo, useCallback } from "react";
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { getExamples } from '../../config/examplesRegistry'
import "./InsertIntervalVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const INSERTINTERVAL_PATTERNS = ['after', 'before', 'check', 'done', 'done_early', 'init', 'merge']

const LINE_PATTERN_MAP = {
  3: 'check',
  4: 'before',
  6: 'done_early',
  7: 'after',
  8: 'after',
  10: 'merge',
  11: 'merge',
  12: 'done',
  13: 'done',
}

const SOLUTION_CODE = [
    { line: 1, text: "def insert(intervals, newInterval):" },
    { line: 2, text: "    res = []" },
    { line: 3, text: "    for i, (s, e) in enumerate(intervals):" },
    { line: 4, text: "        if newInterval[1] < s:" },
    { line: 5, text: "            res.append(newInterval)" },
    { line: 6, text: "            return res + intervals[i:]" },
    { line: 7, text: "        elif e < newInterval[0]:" },
    { line: 8, text: "            res.append([s, e])" },
    { line: 9, text: "        else:  # overlap" },
    { line: 10, text: "            newInterval[0] = min(newInterval[0], s)" },
    { line: 11, text: "            newInterval[1] = max(newInterval[1], e)" },
    { line: 12, text: "    res.append(newInterval)" },
    { line: 13, text: "    return res" },
];

function generateSteps(intervals, newInterval) {
    const steps = [];
    const res = [];
    let ni = [...newInterval];

    steps.push({ activeLine: 2, res: [], ni: [...ni], ci: -1, phase: "init", message: `Insert [${ni}] into ${intervals.length} intervals.` });

    for (let i = 0; i < intervals.length; i++) {
        const [s, e] = intervals[i];
        steps.push({ activeLine: 3, res: [...res], ni: [...ni], ci: i, phase: "check", message: `Check interval [${s},${e}]` });

        if (ni[1] < s) {
            steps.push({ activeLine: 4, res: [...res], ni: [...ni], ci: i, phase: "before", message: `new [${ni}] ends before [${s},${e}] starts → insert new, then append rest` });
            res.push([...ni]);
            const result = [...res, ...intervals.slice(i)];
            steps.push({ activeLine: 6, res: result, ni: [...ni], ci: i, phase: "done_early", message: `Done: ${result.map((x) => `[${x}]`).join(", ")}` });
            return steps;
        } else if (e < ni[0]) {
            steps.push({ activeLine: 7, res: [...res], ni: [...ni], ci: i, phase: "after", message: `[${s},${e}] ends before new [${ni}] starts → append [${s},${e}]` });
            res.push([s, e]);
        } else {
            const prev = [...ni];
            ni[0] = Math.min(ni[0], s);
            ni[1] = Math.max(ni[1], e);
            steps.push({ activeLine: 10, res: [...res], ni: [...ni], ci: i, phase: "merge", message: `Overlap: merge [${prev}] with [${s},${e}] → [${ni}]` });
        }
    }

    res.push([...ni]);
    steps.push({ activeLine: 12, res: [...res], ni: [...ni], ci: -1, phase: "done", message: `Append remaining new: [${ni}]. Result: ${res.map((x) => `[${x}]`).join(", ")}` });
    return steps;
}

const EXAMPLES = getExamples('insert-interval');

const BAR_SCALE = 14; // px per unit

function IntervalVisualization({ intervals, newInterval, step, maxVal }) {
    const res = step?.res ?? [];
    const ni = step?.ni ?? newInterval;
    const ci = step?.ci ?? -1;

    return (
        <div>
            <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>Input intervals</div>
                <div className="ii-bars-col">
                    {intervals.map(([s, e], i) => (
                        <div key={i} className="ii-bar-row">
                            <span className="ii-bar-idx">[{i}]</span>
                            <div className="ii-bar-track" style={{ width: maxVal * BAR_SCALE }}>
                                <motion.div
                                    className={`ii-bar interval ${i === ci ? "active" : ""} ${step?.phase === "after" && i < ci ? "done" : ""}`}
                                    style={{ left: s * BAR_SCALE, width: (e - s) * BAR_SCALE }}
                                    animate={{ scale: i === ci ? 1.05 : 1 }}
                                    transition={{ type: "spring", stiffness: 380, damping: 22 }}>
                                    [{s},{e}]
                                </motion.div>
                            </div>
                        </div>
                    ))}
                    {/* New interval */}
                    <div className="ii-bar-row">
                        <span className="ii-bar-idx new">new</span>
                        <div className="ii-bar-track" style={{ width: maxVal * BAR_SCALE }}>
                            <motion.div
                                className="ii-bar new-iv"
                                style={{ left: ni[0] * BAR_SCALE, width: Math.max((ni[1] - ni[0]) * BAR_SCALE, 24) }}
                                layout transition={{ type: "spring", stiffness: 280, damping: 20 }}>
                                [{ni[0]},{ni[1]}]
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Result */}
            {res.length > 0 && (
                <div>
                    <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>Result</div>
                    <div className="ii-bars-col">
                        <div className="ii-bar-row">
                            <span className="ii-bar-idx"> </span>
                            <div className="ii-bar-track" style={{ width: maxVal * BAR_SCALE }}>
                                <AnimatePresence>
                                    {res.map(([s, e], i) => (
                                        <motion.div key={`${s}-${e}-${i}`}
                                            className="ii-bar result"
                                            style={{ left: s * BAR_SCALE, width: Math.max((e - s) * BAR_SCALE, 24) }}
                                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                                            [{s},{e}]
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: "16px", fontSize: "13px", color: "#666" }}>
                {step?.message ?? "Press Play to begin."}
            </div>
        </div>
    );
}

export default function InsertIntervalVisualizer() {
    const [sel, setSel] = useState(0);
  const [intervalsInput, setIntervalsInput] = useState(JSON.stringify(EXAMPLES[0]?.["intervals"] ?? null));
  const [newIntervalInput, setNewIntervalInput] = useState(JSON.stringify(EXAMPLES[0]?.["newInterval"] ?? null));
  const { intervals, newInterval, inputError } = useMemo(() => {
    try {
      const parsedIntervals = JSON.parse(intervalsInput); if (!Array.isArray(parsedIntervals)) throw new Error('intervals must be an array');
      const parsedNewInterval = JSON.parse(newIntervalInput); if (!Array.isArray(parsedNewInterval)) throw new Error('newInterval must be an array');
      return { intervals: parsedIntervals, newInterval: parsedNewInterval, inputError: '' };
    } catch (e) {
      return { intervals: EXAMPLES[sel]?.intervals, newInterval: EXAMPLES[sel]?.newInterval, inputError: e.message };
    }
  }, [intervalsInput, newIntervalInput]);;
    const [autoScrollCode, setAutoScrollCode] = useAutoScroll();
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

        const steps = useMemo(() => generateSteps(intervals, newInterval), [intervals, newInterval]);
    const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];

    const applyExample = useCallback((i) => { setSel(i); setIntervalsInput(JSON.stringify(EXAMPLES[i].intervals)); setNewIntervalInput(JSON.stringify(EXAMPLES[i].newInterval)); handleReset(); }, [handleReset]);

    const maxVal = useMemo(() => {
      const allIntervals = [...intervals];
      return Math.max(...allIntervals.flat(), ...newInterval) + 1;
    }, [intervals, newInterval]);

    // Step 3: Extract panels into consts
    const primaryPanel = (
      <div className="ii-panel">
        <div className="ii-controls-row">
          <div className="ii-examples">
            {EXAMPLES.map((ex, i) => (
              <button key={ex.label} className={`ii-chip ${sel === i ? "active" : ""}`} onClick={() => applyExample(i)}>
                {ex.label}
              </button>
            ))}
          </div>
          <span className="ii-new-tag">new = [{newInterval.join(",")}]</span>
        </div>
        <IntervalVisualization intervals={intervals} newInterval={newInterval} step={step} maxVal={maxVal} />
      </div>
    
    </>);

    const codePanel = (
      <div style={{ position: 'relative', height: '100%' }}>
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
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
      <div className="ii-status">
        {step?.message ?? "Press Play to begin."}
      </div>
    );

    const playbackPanel = (
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={INSERTINTERVAL_PATTERNS} />
        )}
        <PlaybackControls
          isPlaying={isPlaying} isDone={isDone} speed={speed}
          onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset}
          prevDisabled={stepIndex <= 0} nextDisabled={isDone} resetDisabled={stepIndex <= 0}
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          autoScroll={autoScrollCode} onAutoScrollChange={setAutoScrollCode} showAutoScroll
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
        { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
        { id: 'code', title: 'Code', dockMode: 'split-bottom' },
        { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
      ],
      []
    );
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    // Step 5: Replace return with portals
    return (
      <div className="ii-shell">
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
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

