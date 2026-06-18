import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DockableWorkspace from '../../components/shared/DockableWorkspace';
import FloatingPanel from '../../components/shared/FloatingPanel';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity';
import { useSolutionCode } from '../../hooks/useSolutionCode';
import { getExamples } from '../../config/examplesRegistry';
import './DivideTwoIntegers.css';

const SOLUTION_CODE = [
  { line: 1, text: 'def divide(dividend: int, divisor: int) -> int:' },
  { line: 2, text: '    INT_MAX = 2**31 - 1' },
  { line: 3, text: '    INT_MIN = -2**31' },
  { line: 4, text: '    ' },
  { line: 5, text: '    if dividend == 0: return 0' },
  { line: 6, text: '    if divisor == 0: return INT_MAX' },
  { line: 7, text: '    ' },
  { line: 8, text: '    sign = 1 if (dividend > 0) == (divisor > 0) else -1' },
  { line: 9, text: '    dividend, divisor = abs(dividend), abs(divisor)' },
  { line: 10, text: '    ' },
  { line: 11, text: '    quotient = 0' },
  { line: 12, text: '    while dividend >= divisor:' },
  { line: 13, text: '        temp = divisor' },
  { line: 14, text: '        power = 1' },
  { line: 15, text: '        ' },
  { line: 16, text: '        while dividend >= (temp << 1):' },
  { line: 17, text: '            temp <<= 1' },
  { line: 18, text: '            power <<= 1' },
  { line: 19, text: '        ' },
  { line: 20, text: '        dividend -= temp' },
  { line: 21, text: '        quotient += power' },
  { line: 22, text: '    ' },
  { line: 23, text: '    result = sign * quotient' },
  { line: 24, text: '    if result > INT_MAX: result = INT_MAX' },
  { line: 25, text: '    if result < INT_MIN: result = INT_MIN' },
  { line: 26, text: '    return result' },
];

const EXAMPLES = getExamples('divide-two-integers');

function generateSteps(dividend, divisor) {
  const steps = [];
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;

  // Handle edge cases
  if (dividend === 0) {
    steps.push({
      activeLine: 5,
      phase: 'edge-case',
      message: 'dividend = 0, return 0 immediately',
      result: 0,
      quotient: 0,
      dividend,
      divisor,
      sign: 1,
    });
    return steps;
  }

  if (divisor === 0) {
    steps.push({
      activeLine: 6,
      phase: 'edge-case',
      message: 'divisor = 0, return INT_MAX',
      result: INT_MAX,
      quotient: 0,
      dividend,
      divisor,
      sign: 1,
    });
    return steps;
  }

  // Determine sign
  const sign = (dividend > 0) === (divisor > 0) ? 1 : -1;
  steps.push({
    activeLine: 8,
    phase: 'sign',
    message: `Determine sign: (dividend > 0) == (divisor > 0) = ${sign === 1 ? 'true' : 'false'}, sign = ${sign}`,
    sign,
    dividend,
    divisor,
    quotient: 0,
    result: 0,
    powers: [],
  });

  // Make both positive
  let absDividend = Math.abs(dividend);
  let absDivisor = Math.abs(divisor);
  steps.push({
    activeLine: 9,
    phase: 'abs',
    message: `Convert to positive: dividend = ${absDividend}, divisor = ${absDivisor}`,
    sign,
    dividend: absDividend,
    divisor: absDivisor,
    quotient: 0,
    result: 0,
    powers: [],
  });

  // Initialize quotient
  let quotient = 0;
  steps.push({
    activeLine: 11,
    phase: 'init-quotient',
    message: 'Initialize quotient = 0',
    sign,
    dividend: absDividend,
    divisor: absDivisor,
    quotient: 0,
    result: 0,
    powers: [],
  });

  // Main division loop
  let stepNum = 1;
  while (absDividend >= absDivisor) {
    steps.push({
      activeLine: 12,
      phase: 'main-loop-check',
      message: `Check: dividend (${absDividend}) >= divisor (${absDivisor})? Yes, continue`,
      sign,
      dividend: absDividend,
      divisor: absDivisor,
      quotient,
      result: 0,
      powers: [],
      stepNum,
    });

    let temp = absDivisor;
    let power = 1;
    const powers = [{ power: 1, temp: absDivisor }];

    steps.push({
      activeLine: 13,
      phase: 'init-temp',
      message: `Initialize: temp = ${temp}, power = ${power}`,
      sign,
      dividend: absDividend,
      divisor: absDivisor,
      quotient,
      result: 0,
      powers,
      stepNum,
    });

    // Find largest power of 2
    while (absDividend >= (temp << 1)) {
      temp <<= 1;
      power <<= 1;
      powers.push({ power, temp });
      steps.push({
        activeLine: 17,
        phase: 'double-temp',
        message: `Double: temp = ${temp}, power = ${power}`,
        sign,
        dividend: absDividend,
        divisor: absDivisor,
        quotient,
        result: 0,
        powers,
        stepNum,
      });
    }

    // Check if we can double further
    steps.push({
      activeLine: 16,
      phase: 'power-check',
      message: `Check: dividend (${absDividend}) >= temp*2 (${temp << 1})? No, stop doubling`,
      sign,
      dividend: absDividend,
      divisor: absDivisor,
      quotient,
      result: 0,
      powers,
      stepNum,
    });

    // Subtract and update quotient
    absDividend -= temp;
    quotient += power;

    steps.push({
      activeLine: 20,
      phase: 'subtract',
      message: `Subtract: dividend = ${absDividend}, quotient = ${quotient}`,
      sign,
      dividend: absDividend,
      divisor: absDivisor,
      quotient,
      result: 0,
      powers,
      stepNum,
    });

    stepNum++;
  }

  steps.push({
    activeLine: 12,
    phase: 'loop-end',
    message: `Loop ends: dividend (${absDividend}) < divisor (${absDivisor})`,
    sign,
    dividend: absDividend,
    divisor: absDivisor,
    quotient,
    result: 0,
    powers: [],
  });

  // Apply sign and clamp
  let result = sign * quotient;
  steps.push({
    activeLine: 23,
    phase: 'apply-sign',
    message: `Apply sign: ${sign} * ${quotient} = ${result}`,
    sign,
    dividend: absDividend,
    divisor: absDivisor,
    quotient,
    result,
    powers: [],
  });

  if (result > INT_MAX) result = INT_MAX;
  if (result < INT_MIN) result = INT_MIN;

  steps.push({
    activeLine: 26,
    phase: 'done',
    message: `Final result: ${result}`,
    sign,
    dividend: absDividend,
    divisor: absDivisor,
    quotient,
    result,
    powers: [],
    done: true,
  });

  return steps;
}

export default function DivideTwoIntegersVisualizer() {
  const [dividendInput, setDividendInput] = useState('10');
  const [divisorInput, setDivisorInput] = useState('3');

  const SOLUTION_CODE = useSolutionCode('divide-two-integers');

  const { dividend, divisor, inputError } = useMemo(() => {
    try {
      const d = Number(dividendInput);
      const v = Number(divisorInput);
      if (isNaN(d) || isNaN(v)) throw new Error('Both inputs must be numbers');
      return { dividend: d, divisor: v, inputError: '' };
    } catch (e) {
      return { dividend: 10, divisor: 3, inputError: e.message || 'Invalid input' };
    }
  }, [dividendInput, divisorInput]);

  const steps = useMemo(
    () => generateSteps(dividend, divisor).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [dividend, divisor],
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

  const step = stepIndex >= 0 ? steps[stepIndex] : null;

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay();

  const applyExample = useCallback(
    (ex) => {
      setDividendInput(String(ex.dividend));
      setDivisorInput(String(ex.divisor));
      handleReset();
    },
    [handleReset],
  );

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  });

  const dockPanels = useMemo(
    () => [
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
        title: '➗ Division Visualizer',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
            {/* Input Section */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Examples
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => applyExample(ex)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontSize: 12,
                      backgroundColor: '#f1f5f9',
                    }}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
                  Dividend
                </label>
                <input
                  value={dividendInput}
                  onChange={(e) => {
                    setDividendInput(e.target.value);
                    handleReset();
                  }}
                  placeholder="10"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' }}>
                  Divisor
                </label>
                <input
                  value={divisorInput}
                  onChange={(e) => {
                    setDivisorInput(e.target.value);
                    handleReset();
                  }}
                  placeholder="3"
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            {inputError && <div style={{ color: '#ef4444', fontSize: 11 }}>{inputError}</div>}

            {/* State Display */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                  Current State
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    padding: 8,
                    backgroundColor: '#f8fafc',
                    borderRadius: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Dividend</span>
                    <motion.span
                      key={step?.dividend}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      style={{ fontWeight: 'bold', color: '#3b82f6' }}
                    >
                      {step?.dividend ?? dividend}
                    </motion.span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Divisor</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{step?.divisor ?? divisor}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Quotient</span>
                    <motion.span
                      key={step?.quotient}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      style={{ fontWeight: 'bold', color: '#8b5cf6' }}
                    >
                      {step?.quotient ?? 0}
                    </motion.span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#64748b' }}>Sign</span>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: step?.sign === 1 ? '#10b981' : '#ef4444',
                      }}
                    >
                      {step?.sign === 1 ? '+' : '−'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Powers Table */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                  Powers of 2 in Loop
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    padding: 8,
                    backgroundColor: '#f8fafc',
                    borderRadius: 4,
                    maxHeight: 120,
                    overflowY: 'auto',
                  }}
                >
                  <AnimatePresence>
                    {step?.powers && step.powers.length > 0 ? (
                      step.powers.map((p, i) => (
                        <motion.div
                          key={`power-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 11,
                            padding: '4px 6px',
                            backgroundColor: '#dbeafe',
                            borderRadius: 3,
                          }}
                        >
                          <span style={{ color: '#1e3a8a', fontFamily: 'monospace' }}>power: {p.power}</span>
                          <span style={{ color: '#1e3a8a', fontFamily: 'monospace' }}>temp: {p.temp}</span>
                        </motion.div>
                      ))
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: 11 }}>—</span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Result Display */}
            {step?.done && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: 12,
                  backgroundColor: '#f0fdf4',
                  borderRadius: 6,
                  border: '2px solid #86efac',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#15803d',
                }}
              >
                ✓ Final Result: {step.result}
              </motion.div>
            )}

            {/* Message Display */}
            <div
              style={{
                padding: 10,
                backgroundColor: '#f1f5f9',
                borderRadius: 4,
                borderLeft: '3px solid #3b82f6',
                fontSize: 12,
                color: '#1e293b',
                minHeight: 40,
              }}
            >
              {step?.message ?? 'Press Play or Step to begin.'}
            </div>
          </div>
        ),
      },
    ],
    [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyExample, inputError],
  );

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
