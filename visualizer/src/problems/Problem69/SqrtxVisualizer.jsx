import { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import './SqrtxVisualizer.css';
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def mySqrt(x: int) -> int:' },
  { line: 3, text: '        if x < 2:' },
  { line: 4, text: '            return x' },
  { line: 5, text: '        ' },
  { line: 6, text: '        left, right = 2, x // 2' },
  { line: 7, text: '        ' },
  { line: 8, text: '        while left <= right:' },
  { line: 9, text: '            mid = left + (right - left) // 2' },
  { line: 10, text: '            square = mid * mid' },
  { line: 11, text: '            ' },
  { line: 12, text: '            if square == x:' },
  { line: 13, text: '                return mid' },
  { line: 14, text: '            elif square < x:' },
  { line: 15, text: '                left = mid + 1' },
  { line: 16, text: '            else:' },
  { line: 17, text: '                right = mid - 1' },
  { line: 18, text: '        ' },
  { line: 19, text: '        return right' },
];



const EXAMPLES = [
  { label: 'x = 4', x: 4, desc: 'answer = 2' },
  { label: 'x = 8', x: 8, desc: 'answer = 2' },
  { label: 'x = 1', x: 1, desc: 'answer = 1' },
  { label: 'x = 16', x: 16, desc: 'answer = 4' },
  { label: 'x = 100', x: 100, desc: 'answer = 10' },
  { label: 'x = 2', x: 2, desc: 'answer = 1' },
];

const SQRTX_PATTERNS = ['calc-mid', 'calc-square', 'check-greater', 'check-less', 'done', 'early-return', 'found', 'init', 'update-left', 'update-right', 'while-check']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'early-return',
  6: 'init',
  8: 'while-check',
  9: 'calc-mid',
  10: 'calc-square',
  12: 'found',
  14: 'check-less',
  15: 'update-left',
  16: 'check-greater',
  17: 'update-right',
  19: 'done',
}

function generateSteps(x) {
  const steps = [];

  if (x < 2) {
    steps.push({
      phase: 'early-return',
      activeLine: 3,
      x,
      left: null,
      right: null,
      mid: null,
      square: null,
      result: x,
      message: `x < 2, return ${x}`,
    });
    return steps;
  }

  steps.push({
    phase: 'init',
    activeLine: 6,
    x,
    left: 2,
    right: Math.floor(x / 2),
    mid: null,
    square: null,
    result: null,
    message: `Initialize left = 2, right = ${Math.floor(x / 2)} (x // 2)`,
  });

  let left = 2;
  let right = Math.floor(x / 2);
  let result = right;

  while (left <= right) {
    steps.push({
      phase: 'while-check',
      activeLine: 8,
      x,
      left,
      right,
      mid: null,
      square: null,
      result: null,
      message: `Check left (${left}) <= right (${right}). Yes, continue.`,
    });

    const mid = Math.floor(left + (right - left) / 2);
    const square = mid * mid;

    steps.push({
      phase: 'calc-mid',
      activeLine: 9,
      x,
      left,
      right,
      mid,
      square: null,
      result: null,
      message: `Calculate mid = ${left} + (${right} - ${left}) // 2 = ${mid}`,
    });

    steps.push({
      phase: 'calc-square',
      activeLine: 10,
      x,
      left,
      right,
      mid,
      square,
      result: null,
      message: `Calculate square = ${mid} * ${mid} = ${square}`,
    });

    if (square === x) {
      steps.push({
        phase: 'found',
        activeLine: 12,
        x,
        left,
        right,
        mid,
        square,
        result: mid,
        message: `square (${square}) == x (${x})! Return ${mid}.`,
      });
      return steps;
    }

    steps.push({
      phase: 'check-less',
      activeLine: 14,
      x,
      left,
      right,
      mid,
      square,
      result: null,
      message: `Is square (${square}) < x (${x})?`,
    });

    if (square < x) {
      result = mid;
      left = mid + 1;
      steps.push({
        phase: 'update-left',
        activeLine: 15,
        x,
        left,
        right,
        mid,
        square,
        result: null,
        message: `Yes, update left = mid + 1 = ${left}. Track result = ${mid}.`,
      });
    } else {
      steps.push({
        phase: 'check-greater',
        activeLine: 16,
        x,
        left,
        right,
        mid,
        square,
        result: null,
        message: `No, square (${square}) > x (${x}).`,
      });

      right = mid - 1;
      steps.push({
        phase: 'update-right',
        activeLine: 17,
        x,
        left,
        right,
        mid,
        square,
        result: null,
        message: `Update right = mid - 1 = ${right}.`,
      });
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 19,
    x,
    left,
    right,
    mid: null,
    square: null,
    result,
    message: `Loop ends (left > right). Return right = ${result}.`,
  });

  return steps;
}

export default function SqrtxVisualizer() {
  const [exampleIdx, setExampleIdx] = useState(0)
  const [xInput, setXInput] = useState(String(EXAMPLES[0]?.x ?? 0));
  const { x, inputError } = useMemo(() => {
    try {
      const parsedX = Number(xInput); if (isNaN(parsedX)) throw new Error('x must be a number');
      return { x: parsedX, inputError: '' };
    } catch (e) {
      return { x: EXAMPLES[exampleIdx]?.x ?? '', inputError: e.message };
    }
  }, [xInput]);;
  const example = EXAMPLES[exampleIdx];

  const steps = useMemo(
    () =>
      generateSteps(x).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  );

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const applyExample = useCallback((i) => { setExampleIdx(i); setXInput(String(EXAMPLES[i].x)); handleReset(); }, [handleReset]);;

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const searchRangeSize = step && step.left != null && step.right != null
    ? Math.max(0, step.right - step.left + 1)
    : x;

  // Panel consts
  const primaryPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"x","label":"x","type":"number"}]}
        values={{ x: xInput }}
        onChange={(k, v) => { if (k === 'x') setXInput(v); handleReset() }}
        examples={EXAMPLES}
        activeLabel={EXAMPLES[exampleIdx]?.label}
        applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
        inputError={inputError}
      />
    <div className="sqrtx-panel">
      {/* Example selector */}
      <div className="sqrtx-examples">
        {EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            className={`sqrtx-chip ${exampleIdx === idx ? 'active' : ''}`}
            onClick={() => applyExample(idx)}
          >
            {ex.label} <span className="sqrtx-chip-desc">{ex.desc}</span>
          </button>
        ))}
      </div>

      {/* Insight card */}
      <div className="sqrtx-insight">
        <span className="sqrtx-insight-icon">💡</span>
        <span>
          Binary search efficiently finds integer square root. When mid² ≠ x,
          keep track of the largest mid where mid² &lt; x—that's the answer.
        </span>
      </div>

      {/* Main visualization */}
      <div className="sqrtx-visualization">
        <div className="sqrtx-panel-label">Binary Search for Square Root</div>

        <div className="sqrtx-search-space">
          <div className="sqrtx-search-label">Search Space: [{step?.left ?? '2'}, {step?.right ?? Math.floor(x / 2)}]</div>
          <motion.div
            className="sqrtx-search-bar"
            layout
          >
            <div
              className="sqrtx-bar-track"
              style={{
                width: '100%',
                height: 8,
                backgroundColor: 'var(--text)',
                borderRadius: 4,
                position: 'relative',
              }}
            >
              {step?.left != null && step?.right != null && (
                <>
                  <motion.div
                    className="sqrtx-bar-left"
                    animate={{
                      left: `${(step.left / (Math.floor(x / 2) + 1)) * 100}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      position: 'absolute',
                      width: 6,
                      height: 8,
                      backgroundColor: '#3b82f6',
                      borderRadius: 2,
                      top: 0,
                    }}
                  />
                  <motion.div
                    className="sqrtx-bar-right"
                    animate={{
                      right: `${(1 - (step.right / (Math.floor(x / 2) + 1))) * 100}%`,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={{
                      position: 'absolute',
                      width: 6,
                      height: 8,
                      backgroundColor: '#ef4444',
                      borderRadius: 2,
                      top: 0,
                    }}
                  />
                  {step?.mid != null && (
                    <motion.div
                      className="sqrtx-bar-mid"
                      animate={{
                        left: `${(step.mid / (Math.floor(x / 2) + 1)) * 100}%`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      style={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        backgroundColor: '#fbbf24',
                        borderRadius: 2,
                        top: 0,
                        marginLeft: -4,
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Trackers */}
        <div className="sqrtx-trackers">
          <div className="sqrtx-tracker">
            <span className="sqrtx-tracker-label">left</span>
            <motion.span
              key={step?.left ?? 'none'}
              className="sqrtx-tracker-val"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {typeof step?.left === 'number' ? step.left : '—'}
            </motion.span>
          </div>

          <div className="sqrtx-tracker">
            <span className="sqrtx-tracker-label">right</span>
            <motion.span
              key={step?.right ?? 'none'}
              className="sqrtx-tracker-val"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {typeof step?.right === 'number' ? step.right : '—'}
            </motion.span>
          </div>

          <div className="sqrtx-tracker">
            <span className="sqrtx-tracker-label">mid</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step?.mid ?? 'none'}
                className="sqrtx-tracker-val"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {typeof step?.mid === 'number' ? step.mid : '—'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="sqrtx-tracker">
            <span className="sqrtx-tracker-label">mid²</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step?.square ?? 'none'}
                className="sqrtx-tracker-val"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {typeof step?.square === 'number' ? step.square : '—'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="sqrtx-tracker">
            <span className="sqrtx-tracker-label">answer</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step?.result ?? 'none'}
                className={`sqrtx-tracker-val ${step?.phase === 'found' || step?.phase === 'done' ? 'val-green' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {typeof step?.result === 'number' ? step.result : '—'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Stats */}
        <div className="sqrtx-stats">
          <div className="sqrtx-stat-box">
            <span className="sqrtx-stat-label">Search Space Size</span>
            <motion.span
              key={searchRangeSize}
              className="sqrtx-stat-val"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {searchRangeSize}
            </motion.span>
          </div>
          <div className="sqrtx-stat-box">
            <span className="sqrtx-stat-label">Target</span>
            <span className="sqrtx-stat-val">{x}</span>
          </div>
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {(step?.phase === 'found' || step?.phase === 'done') && (
            <motion.div
              className="sqrtx-result-banner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              √{x} = {step.result}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  
    </>);

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

  const statusPanel = (
    <div className="sqrtx-status">
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  );

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={SQRTX_PATTERNS} />
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
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  );

  // Panel state + config
  const [panelDivs, setPanelDivs] = useState(null);
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Binary Search Visualizer', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  );
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), []);

  return (
    <div className="sqrtx-shell">
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
