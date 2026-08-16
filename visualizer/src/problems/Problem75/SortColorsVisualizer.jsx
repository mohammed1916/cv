import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LuminoDockPanel from "../../components/LuminoDockPanel";
import FloatingPanel from "../../components/shared/FloatingPanel";
import CodeTracePanel from "../../components/CodeTracePanel";
import PlaybackControls from "../../components/PlaybackControls";
import CodePatternAnnotations from "../../components/CodePatternAnnotations";
import PatternLegend from "../../components/PatternLegend";
import { usePlaybackState } from "../../hooks/usePlaybackState";
import { usePatternOverlay } from "../../hooks/usePatternOverlay";
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./SortColorsVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('sort-colors')
const COLOR_LABEL = ["🔴", "⚪", "🔵"];
const COLOR_NAME = ["Red", "White", "Blue"];
const COLOR_HEX = ["#ef4444", "#f3f4f6", "#3b82f6"];

const SORTCOLORS_PATTERNS = ['check', 'done', 'init', 'place_lo', 'place_hi', 'skip'];

const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'check',
  4: 'place_lo',
  6: 'skip',
  9: 'place_hi',
  11: 'done',
};

function generateSteps(initial) {
    const steps = [];
    const nums = [...initial];
    let lo = 0, mid = 0, hi = nums.length - 1;

    steps.push({ phase: 'init', activeLine: 2, nums: [...nums], lo, mid, hi, message: `Dutch National Flag. lo=0, mid=0, hi=${hi}` });

    while (mid <= hi) {
        steps.push({ phase: 'check', activeLine: 3, nums: [...nums], lo, mid, hi, message: `mid=${mid} ≤ hi=${hi}. nums[mid]=${nums[mid]}` });

        if (nums[mid] === 0) {
            steps.push({ phase: 'place_lo', activeLine: 4, nums: [...nums], lo, mid, hi, message: `nums[mid]=0 → swap with lo=${lo}` });
            [nums[lo], nums[mid]] = [nums[mid], nums[lo]];
            lo++; mid++;
            steps.push({ phase: 'place_lo', activeLine: 6, nums: [...nums], lo, mid, hi, message: `After swap. lo=${lo}, mid=${mid}` });
        } else if (nums[mid] === 1) {
            steps.push({ phase: 'skip', activeLine: 7, nums: [...nums], lo, mid, hi, message: `nums[mid]=1 → already white, mid++` });
            mid++;
        } else {
            steps.push({ phase: 'place_hi', activeLine: 9, nums: [...nums], lo, mid, hi, message: `nums[mid]=2 → swap with hi=${hi}` });
            [nums[mid], nums[hi]] = [nums[hi], nums[mid]];
            hi--;
            steps.push({ phase: 'place_hi', activeLine: 11, nums: [...nums], lo, mid, hi, message: `After swap. hi=${hi} (don't move mid yet)` });
        }
    }

    steps.push({ phase: 'done', activeLine: 11, nums: [...nums], lo, mid, hi, message: `Done! Sorted: [${nums.join(",")}]` });
    return steps;
}

function DutchFlagVisualization({ nums, step }) {
  const lo = step?.lo ?? 0, mid = step?.mid ?? 0, hi = step?.hi ?? (nums.length - 1);
  const redCount = lo;
  const whiteCount = mid - lo;
  const blueCount = nums.length - 1 - hi;
  const unknownCount = hi - mid + 1;

  // Partition into lanes
  const reds = nums.slice(0, lo);
  const whites = nums.slice(lo, mid);
  const unknown = nums.slice(mid, hi + 1);
  const blues = nums.slice(hi + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
      {/* Three-lane visualization */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Red lane */}
        <div style={{
          padding: 16,
          backgroundColor: '#fee2e2',
          borderRadius: 8,
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>🔴 Red Lane</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 60 }}>
            <AnimatePresence>
              {reds.map((v, i) => (
                <motion.div
                  key={`red-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: '#ef4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18
                  }}
                >
                  {COLOR_LABEL[v]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#991b1b', fontWeight: 600 }}>
            ✓ {redCount}
          </div>
        </div>

        {/* White lane */}
        <div style={{
          padding: 16,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          border: '2px solid #6b7280'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>⚪ White Lane</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 60 }}>
            <AnimatePresence>
              {whites.map((v, i) => (
                <motion.div
                  key={`white-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: '#e5e7eb',
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    border: '2px solid #9ca3af'
                  }}
                >
                  {COLOR_LABEL[v]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#374151', fontWeight: 600 }}>
            ✓ {whiteCount}
          </div>
        </div>

        {/* Blue lane */}
        <div style={{
          padding: 16,
          backgroundColor: '#dbeafe',
          borderRadius: 8,
          border: '2px solid #3b82f6'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e40af', marginBottom: 8 }}>🔵 Blue Lane</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 60 }}>
            <AnimatePresence>
              {blues.map((v, i) => (
                <motion.div
                  key={`blue-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18
                  }}
                >
                  {COLOR_LABEL[v]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
            ✓ {blueCount}
          </div>
        </div>
      </div>

      {/* Unknown/processing area */}
      {unknownCount > 0 && (
        <div style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 8,
          border: '2px dashed #f59e0b'
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>⚙️ Processing {unknownCount} elements</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <AnimatePresence>
              {unknown.map((v, i) => (
                <motion.div
                  key={`unknown-${mid + i}`}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    backgroundColor: '#fbbf24',
                    color: '#78350f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 18,
                    border: mid + i === step?.cur ? '3px solid #f59e0b' : '2px solid transparent'
                  }}
                >
                  {COLOR_LABEL[v]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Pointers status */}
      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>Pointers</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 12 }}>
          <div>lo = <strong>{lo}</strong></div>
          <div>mid = <strong>{mid}</strong></div>
          <div>hi = <strong>{hi}</strong></div>
        </div>
      </div>
    </div>
  );
}

function VisualizationPanel({ nums, step, applyExample }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((e, i) => (
            <button
              key={e.label}
              onClick={() => applyExample(i)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <DutchFlagVisualization nums={nums} step={step} />
    </div>
  );
}

const EXAMPLES = getExamples('sort-colors');

export default function SortColorsVisualizer() {
    const [sel, setSel] = useState(0);
  const [initialInput, setInitialInput] = useState(JSON.stringify(EXAMPLES[0]?.["nums"] ?? null));
  const { initial, inputError } = useMemo(() => {
    try {
      const parsedInitial = JSON.parse(initialInput); if (!Array.isArray(parsedInitial)) throw new Error('initial must be an array');
      return { initial: parsedInitial, inputError: '' };
    } catch (e) {
      return { initial: EXAMPLES[sel]?.nums, inputError: e.message };
    }
  }, [initialInput]);;
    const [panelDivs, setPanelDivs] = useState(null);
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

        const steps = useMemo(() => generateSteps(initial), [initial]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : steps[0];
    const applyExample = useCallback((i) => { setSel(i); setInitialInput(JSON.stringify(EXAMPLES[i].nums)); handleReset(); }, [handleReset]);
    const connectivity = useCodeVisualConnectivity({
      steps,
      stepIndex,
      onStepJump: setStepIndex,
    });

    const nums = step?.nums ?? initial;

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
    );

    const vizPanel = (
      <>
        <ManualInputPanel
          fields={[{"key":"initial","label":"initial","type":"string"}]}
          values={{ initial: initialInput }}
          onChange={(k, v) => { if (k === 'initial') setInitialInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[sel]?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      <VisualizationPanel
        nums={nums}
        step={step}
        applyExample={applyExample}
      />
    
    </>);

    const statusPanel = (
      <div className="sc-status" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px' }}>
        <span>{step?.message || 'Ready to start'}</span>
      </div>
    );

    const playbackPanel = (
      <>
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={SORTCOLORS_PATTERNS} />
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </>
    );

    const panelConfigs = useMemo(
      () => [
        { id: 'code', title: 'Code', dockMode: 'split-right' },
        { id: 'viz', title: '🌈 Three Lanes', dockMode: 'split-right' },
        { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
      ],
      []
    );

    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

    return (
      <div className="sc-shell">
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(codePanel, panelDivs.code)}
            {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
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

