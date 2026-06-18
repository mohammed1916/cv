import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeTracePanel from '../../components/CodeTracePanel';
import PlaybackControls from '../../components/PlaybackControls';
import PatternOverlay from '../../components/PatternOverlay';
import { usePlaybackState } from '../../hooks/usePlaybackState';
import { usePatternOverlay } from '../../hooks/usePatternOverlay';
import { getExamples } from '../../config/examplesRegistry';
import './Powxn.css';

const SOLUTION_CODE = [
  { line: 1, text: 'def myPow(x: float, n: int) -> float:' },
  { line: 2, text: '    def helper(x, n):' },
  { line: 3, text: '        if n == 0:' },
  { line: 4, text: '            return 1.0' },
  { line: 5, text: '        if n < 0:' },
  { line: 6, text: '            x = 1 / x' },
  { line: 7, text: '            n = -n' },
  { line: 8, text: '        ' },
  { line: 9, text: '        result = helper(x, n // 2)' },
  { line: 10, text: '        result = result * result' },
  { line: 11, text: '        ' },
  { line: 12, text: '        if n % 2 == 1:' },
  { line: 13, text: '            result = result * x' },
  { line: 14, text: '        ' },
  { line: 15, text: '        return result' },
  { line: 16, text: '    ' },
  { line: 17, text: '    return helper(x, n)' },
];

const EXAMPLES = [
  { label: 'x=2, n=10', x: 2, n: 10, desc: '1024' },
  { label: 'x=2.0, n=-2', x: 2.0, n: -2, desc: '0.25' },
  { label: 'x=2, n=3', x: 2, n: 3, desc: '8' },
  { label: 'x=0.5, n=3', x: 0.5, n: 3, desc: '0.125' },
  { label: 'x=-2, n=4', x: -2, n: 4, desc: '16' },
];

function generateSteps(x, n) {
  const steps = [];
  const originalN = n;

  // Helper function to generate recursion steps
  function helperSteps(currentX, currentN, depth = 0) {
    const indent = '  '.repeat(depth);

    // Base case: n == 0
    if (currentN === 0) {
      steps.push({
        activeLine: 3,
        phase: 'base-case',
        depth,
        x: currentX,
        n: currentN,
        result: 1.0,
        message: `${indent}Base case: n = 0, return 1.0`,
      });
      return 1.0;
    }

    // Handle negative exponent
    if (currentN < 0) {
      const newX = 1 / currentX;
      const newN = -currentN;
      steps.push({
        activeLine: 5,
        phase: 'negative-check',
        depth,
        x: currentX,
        n: currentN,
        transformedX: newX,
        transformedN: newN,
        message: `${indent}n < 0: Convert x = 1/${currentX} = ${newX.toFixed(6)}, n = ${newN}`,
      });
      currentX = newX;
      currentN = newN;
    }

    // Recurse on n // 2
    steps.push({
      activeLine: 9,
      phase: 'recurse',
      depth,
      x: currentX,
      n: currentN,
      subN: Math.floor(currentN / 2),
      message: `${indent}Recurse: helper(${currentX}, ${Math.floor(currentN / 2)})`,
    });

    const halfResult = helperSteps(currentX, Math.floor(currentN / 2), depth + 1);

    // Square the result
    const squared = halfResult * halfResult;
    steps.push({
      activeLine: 10,
      phase: 'square',
      depth,
      x: currentX,
      n: currentN,
      halfResult,
      squared,
      message: `${indent}Square result: ${halfResult.toFixed(6)} * ${halfResult.toFixed(6)} = ${squared.toFixed(6)}`,
    });

    let finalResult = squared;

    // Check if n is odd
    if (currentN % 2 === 1) {
      finalResult = squared * currentX;
      steps.push({
        activeLine: 12,
        phase: 'multiply',
        depth,
        x: currentX,
        n: currentN,
        squared,
        finalResult,
        message: `${indent}n is odd: multiply by x: ${squared.toFixed(6)} * ${currentX} = ${finalResult.toFixed(6)}`,
      });
    } else {
      steps.push({
        activeLine: 12,
        phase: 'check-odd',
        depth,
        x: currentX,
        n: currentN,
        squared,
        finalResult: squared,
        message: `${indent}n is even, no multiply needed`,
      });
    }

    steps.push({
      activeLine: 15,
      phase: 'return',
      depth,
      x: currentX,
      n: currentN,
      result: finalResult,
      message: `${indent}Return: ${finalResult.toFixed(6)}`,
    });

    return finalResult;
  }

  // Initial call
  steps.push({
    activeLine: 1,
    phase: 'start',
    x,
    n,
    message: `Call myPow(${x}, ${n})`,
  });

  const result = helperSteps(x, n);

  steps.push({
    activeLine: 17,
    phase: 'final',
    x,
    n: originalN,
    result,
    message: `Final result: ${x}^${originalN} = ${result.toFixed(6)}`,
  });

  return steps;
}

export default function PowxnVisualizer() {
  const [exampleIdx, setExampleIdx] = useState(0);
  const example = EXAMPLES[exampleIdx];

  const steps = useMemo(
    () => generateSteps(example.x, example.n),
    [example]
  );

  const {
    stepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length);

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } =
    usePatternOverlay();

  const step = stepIndex >= 0 ? steps[stepIndex] : null;
  const applyExample = useCallback(
    (idx) => {
      setExampleIdx(idx);
      handleReset();
    },
    [handleReset]
  );

  return (
    <div className="powxn-shell">
      {/* Example selector */}
      <div className="powxn-examples">
        {EXAMPLES.map((ex, idx) => (
          <button
            key={idx}
            className={`powxn-chip ${exampleIdx === idx ? 'active' : ''}`}
            onClick={() => applyExample(idx)}
          >
            {ex.label} <span className="powxn-chip-desc">{ex.desc}</span>
          </button>
        ))}
      </div>

      {/* Insight card */}
      <div className="powxn-insight">
        <span className="powxn-insight-icon">💡</span>
        <span>
          Fast exponentiation reduces time from O(n) to O(log n) by repeatedly
          squaring. For odd exponents, multiply by x one extra time.
        </span>
      </div>

      {/* Main visualization panel */}
      <div className="powxn-panel">
        <div className="powxn-panel-label">Exponentiation by Squaring</div>

        <div className="powxn-trackers">
          <div className="powxn-tracker">
            <span className="powxn-tracker-label">x</span>
            <motion.span
              key={step?.x}
              className="powxn-tracker-val"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {typeof step?.x === 'number' ? step.x.toFixed(2) : '—'}
            </motion.span>
          </div>

          <div className="powxn-tracker">
            <span className="powxn-tracker-label">n</span>
            <motion.span
              key={step?.n}
              className="powxn-tracker-val"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {typeof step?.n === 'number' ? step.n : '—'}
            </motion.span>
          </div>

          <div className="powxn-tracker">
            <span className="powxn-tracker-label">transformed x</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step?.transformedX ?? 'none'}
                className="powxn-tracker-val"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {typeof step?.transformedX === 'number'
                  ? step.transformedX.toFixed(6)
                  : '—'}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="powxn-tracker">
            <span className="powxn-tracker-label">result</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={step?.result ?? 'none'}
                className={`powxn-tracker-val ${step?.phase === 'final' ? 'val-green' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                {typeof step?.result === 'number'
                  ? step.result.toFixed(6)
                  : '—'}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Recursion tree visualization */}
        <div className="powxn-recursion-tree">
          {step && step.phase !== 'start' && step.phase !== 'final' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="powxn-call-stack"
            >
              <div className="powxn-call-label">Depth: {step.depth}</div>
              {step.halfResult !== undefined && (
                <div className="powxn-calc-row">
                  <span>half result:</span>
                  <span className="powxn-calc-val">
                    {step.halfResult.toFixed(6)}
                  </span>
                </div>
              )}
              {step.squared !== undefined && (
                <div className="powxn-calc-row">
                  <span>squared:</span>
                  <span className="powxn-calc-val">{step.squared.toFixed(6)}</span>
                </div>
              )}
              {step.finalResult !== undefined && (
                <div className="powxn-calc-row highlight">
                  <span>final result:</span>
                  <span className="powxn-calc-val">
                    {step.finalResult.toFixed(6)}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Result banner */}
        <AnimatePresence>
          {step?.phase === 'final' && (
            <motion.div
              className="powxn-result-banner"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {example.x}^{example.n} = {step.result.toFixed(6)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        onActiveLineDomChange={setActiveLineDom}
      />
      <div className="powxn-status">
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
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
      {showPatternOverlay && step && (
        <PatternOverlay step={step} activeLineDom={activeLineDom} />
      )}
    </div>
  );
}
