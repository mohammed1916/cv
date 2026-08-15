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
import { useCodeVisualConnectivity } from "../../hooks/useCodeVisualConnectivity";
import { getExamples } from '../../config/examplesRegistry'
import "./PlusOneVisualizer.css";
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('plus-one')
const EXAMPLES = getExamples('plus-one');

const PLUSONE_PATTERNS = ['init', 'loop', 'carry', 'append']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'loop',
  6: 'carry',
  7: 'append',
}

function generateSteps(digIn) {
    const steps = [];
    const arr = [...digIn];
    steps.push({ phase: 'init', activeLine: 1, arr: [...arr], i: -1, carry: false, message: `Start: [${arr.join(", ")}] + 1` });
    for (let i = arr.length - 1; i >= 0; i--) {
        steps.push({ phase: 'loop', activeLine: 3, arr: [...arr], i, carry: false, message: `i=${i}: digits[${i}] = ${arr[i]}` });
        if (arr[i] < 9) {
            arr[i] += 1;
            steps.push({ phase: 'append', activeLine: 4, arr: [...arr], i, carry: false, message: `digits[${i}] < 9 → increment to ${arr[i]}` });
            steps.push({ phase: 'append', activeLine: 5, arr: [...arr], i, carry: false, done: true, message: `Return [${arr.join(", ")}]` });
            return steps;
        }
        arr[i] = 0;
        steps.push({ phase: 'carry', activeLine: 6, arr: [...arr], i, carry: true, message: `digits[${i}] = 9 → set to 0, carry` });
    }
    const result = [1, ...arr];
    steps.push({ phase: 'append', activeLine: 7, arr: result, i: -1, carry: false, done: true, message: `All digits were 9 → prepend 1: [${result.join(", ")}]` });
    return steps;
}

function DominoChainVisualization({ arr, step, ex }) {
  const activeI = step?.i ?? -1;
  const carry = step?.carry ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Domino chain */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', justifyContent: 'center', minHeight: 120 }}>
        <AnimatePresence>
          {arr.map((d, idx) => {
            const isActive = idx === activeI;
            // The prepend step is the only one that reports i === -1.
            const isNew = idx === 0 && step?.i === -1;
            const isFalling = isActive && carry;

            return (
              <motion.div
                key={`${idx}-${d}`}
                layout
                initial={isNew ? { opacity: 0, x: -40, y: 40 } : undefined}
                animate={{
                  opacity: 1,
                  x: 0,
                  y: isFalling ? -30 : isActive ? -20 : 0,
                  rotateZ: isFalling ? 15 : 0,
                  scale: isActive ? 1.25 : 1
                }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  width: 50,
                  height: 70,
                  backgroundColor: isNew ? '#10b981' : isFalling ? '#f59e0b' : isActive ? '#3b82f6' : '#dbeafe',
                  border: isActive ? '3px solid #0ea5e9' : '2px solid #cbd5e1',
                  borderRadius: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: isNew ? 'white' : '#1e3a8a',
                  boxShadow: isActive ? '0 8px 16px rgba(59, 130, 246, 0.3)' : 'none',
                  cursor: 'default'
                }}
              >
                {d}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Carry cascade effect */}
      {carry && activeI >= 0 && (
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{ fontSize: 12, color: '#a36907', fontWeight: 'bold' }}
          >
            ⬇️ Carry cascading...
          </motion.div>
        </div>
      )}

      {/* Status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Current Index</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0b7db0' }}>
            {activeI < 0 ? '—' : activeI}
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: carry ? '#fef3c7' : '#f3f4f6',
          borderRadius: 6,
          border: carry ? '1px solid #fcd34d' : '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: 11, color: carry ? '#92400e' : '#64748b', marginBottom: 4 }}>Carry</div>
          <motion.div
            key={String(carry)}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: carry ? '#f59e0b' : '#9ca3af'
            }}
          >
            {carry ? '🔗' : '—'}
          </motion.div>
        </div>
      </div>

      {/* Result */}
      {step?.done && (
        <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6, border: '2px solid #86efac' }}>
          <div style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ Result</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#15803d', marginTop: 6 }}>
            [{arr.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
}

function VisualizationPanel({ arr, step, ex, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <DominoChainVisualization arr={arr} step={step} ex={ex} />
    </div>
  );
}

export default function PlusOneVisualizer() {
    const [ex, setEx] = useState(EXAMPLES[0]);
  const [digitsInput, setDigitsInput] = useState("[1,2,3]");
  const [descInput, setDescInput] = useState("123");
  const { digits, desc, inputError } = useMemo(() => {
    try {
      const parsedDigits = JSON.parse(digitsInput); if (!Array.isArray(parsedDigits)) throw new Error('digits must be an array');
      const parsedDesc = descInput;
      return { digits: parsedDigits, desc: parsedDesc, inputError: '' };
    } catch (e) {
      return { digits: "[1,2,3]", desc: "123", inputError: e.message };
    }
  }, [digitsInput, descInput]);
    const steps = useMemo(() => generateSteps(digits), [digits]);
    const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
        usePlaybackState(steps.length);
    const step = stepIndex >= 0 ? steps[stepIndex] : null;
    const applyEx = useCallback((e) => { setEx(e); setDigitsInput(JSON.stringify(e.digits)); setDescInput(String(e.desc)); handleReset(); }, [handleReset]);;
    const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();
    const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex });

    const arr = step?.arr ?? digits;

    // Extract panels into consts
    const codePanel = (
      <div style={{position: 'relative', height: '100%'}}>
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
    const vizPanel = (
      <>
        <ManualInputPanel
          fields={[{"key":"digits","label":"digits","type":"array"},{"key":"desc","label":"desc","type":"string"}]}
          values={{ digits: digitsInput, desc: descInput }}
          onChange={(k, v) => { if (k === 'digits') setDigitsInput(v); if (k === 'desc') setDescInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
      <div className="po-panel">
        <VisualizationPanel
          arr={arr}
          step={step}
          ex={ex}
          applyEx={applyEx}
        />
      </div>
    
    </>)
    const statusPanel = (
      <div className="po-status">
        {step?.message || 'Ready to start'}
      </div>
    )
    const playbackPanel = (
      <>
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PLUSONE_PATTERNS} />
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
      </>
    )

    const [panelDivs, setPanelDivs] = useState(null)
    const panelConfigs = useMemo(
      () => [
        { id: 'code', title: 'Code', dockMode: 'split-right' },
        { id: 'viz', title: '🧮 Domino Chain', dockMode: 'split-right' },
        { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
      ],
      []
    )
    const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

    return (
      <div className="po-shell">
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

