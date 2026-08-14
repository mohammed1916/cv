import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem365Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['bezout-explanation', 'check-divisibility', 'complete', 'edge-case-capacity', 'edge-case-empty', 'gcd-calculate', 'gcd-complete', 'gcd-init', 'invalid-capacity', 'invalid-empty']
const LINE_PATTERN_MAP = {
  2: 'edge-case-capacity',
  3: 'invalid-capacity',
  4: 'edge-case-empty',
  5: 'invalid-empty',
  6: 'gcd-init',
  7: 'gcd-calculate',
  10: 'gcd-complete',
  11: 'bezout-explanation',
  14: 'check-divisibility'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def canMeasureWater(a, b, z):' },
  { line: 2, text: '    if z > a + b:' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    if a == 0 and b == 0:' },
  { line: 5, text: '        return z == 0' },
  { line: 6, text: '    def gcd(x, y):' },
  { line: 7, text: '        while y:' },
  { line: 8, text: '            x, y = y, x % y' },
  { line: 9, text: '        return x' },
  { line: 10, text: '    g = gcd(a, b)' },
  { line: 11, text: '    # Bezout\'s identity: a*i + b*j = n*gcd(a,b)' },
  { line: 12, text: '    # for any integers i, j' },
  { line: 13, text: '    # We can measure z if z % gcd(a,b) == 0' },
  { line: 14, text: '    return z % g == 0' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function gcd(a, b) {
  while (b) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

function generateSteps(a, b, z) {
  const steps = []

  // Step 1: Check edge case - target exceeds capacity
  steps.push({
    activeLine: 2,
    phase: 'edge-case-capacity',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: null,
    isValid: null,
    message: 'Step 1: Check if target exceeds total capacity',
    details: `Is z (${z}) > a + b (${a} + ${b} = ${a + b})? ${z > a + b ? 'Yes → Impossible' : 'No → Continue'}`,
  })

  if (z > a + b) {
    steps.push({
      activeLine: 3,
      phase: 'invalid-capacity',
      jugA: a,
      jugB: b,
      target: z,
      currentWaterA: 0,
      currentWaterB: 0,
      gcdValue: null,
      isValid: false,
      message: 'Cannot measure z liters',
      details: `Target ${z} exceeds maximum capacity ${a + b}. Return False.`,
    })
    return steps
  }

  // Step 2: Check edge case - both jugs are empty
  steps.push({
    activeLine: 4,
    phase: 'edge-case-empty',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: null,
    isValid: null,
    message: 'Step 2: Check if both jugs are empty',
    details: `Are both a and b zero? ${a === 0 && b === 0 ? 'Yes' : 'No'} ${a === 0 && b === 0 ? '→ Return z == 0' : '→ Continue'}`,
  })

  if (a === 0 && b === 0) {
    steps.push({
      activeLine: 5,
      phase: 'invalid-empty',
      jugA: a,
      jugB: b,
      target: z,
      currentWaterA: 0,
      currentWaterB: 0,
      gcdValue: null,
      isValid: z === 0,
      message: z === 0 ? 'Can measure 0 liters' : 'Cannot measure any water',
      details: `Both jugs are empty. Can only measure if target is 0. Return ${z === 0}.`,
    })
    return steps
  }

  // Step 3: Calculate GCD
  steps.push({
    activeLine: 6,
    phase: 'gcd-init',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: null,
    isValid: null,
    message: 'Step 3: Initialize GCD calculation',
    details: `Starting Euclidean algorithm with gcd(${a}, ${b})`,
  })

  // Simulate GCD calculation steps
  let x = a
  let y = b
  let step_count = 0
  while (y !== 0) {
    step_count++
    const remainder = x % y
    steps.push({
      activeLine: 7,
      phase: 'gcd-calculate',
      jugA: a,
      jugB: b,
      target: z,
      currentWaterA: 0,
      currentWaterB: 0,
      gcdValue: null,
      isValid: null,
      message: `GCD iteration ${step_count}`,
      details: `gcd(${x}, ${y}): ${x} = ${y} × ${Math.floor(x / y)} + ${remainder}, so gcd(${y}, ${remainder})`,
    })
    const temp = y
    y = remainder
    x = temp
  }

  const g = gcd(a, b)

  steps.push({
    activeLine: 10,
    phase: 'gcd-complete',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: g,
    isValid: null,
    message: `GCD calculation complete: gcd(${a}, ${b}) = ${g}`,
    details: `The greatest common divisor is ${g}. By Bézout's identity, we can measure any multiple of ${g}.`,
  })

  // Step 4: Apply Bézout's identity
  steps.push({
    activeLine: 11,
    phase: 'bezout-explanation',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: g,
    isValid: null,
    message: "Step 4: Apply Bézout's Identity",
    details: `By Bézout's identity: There exist integers i, j such that a·i + b·j = k·gcd(a,b) for any k.`,
  })

  // Step 5: Check divisibility
  steps.push({
    activeLine: 14,
    phase: 'check-divisibility',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: 0,
    currentWaterB: 0,
    gcdValue: g,
    isValid: null,
    message: 'Step 5: Check if target is divisible by GCD',
    details: `Is z (${z}) divisible by gcd(a,b) (${g})? ${z} % ${g} = ${z % g} ${z % g === 0 ? '✓' : '✗'}`,
  })

  // Final result
  const result = z % g === 0
  steps.push({
    activeLine: 14,
    phase: 'complete',
    jugA: a,
    jugB: b,
    target: z,
    currentWaterA: result ? z : 0,
    currentWaterB: result ? 0 : 0,
    gcdValue: g,
    isValid: result,
    message: result ? `Success: Can measure ${z} liters` : `Impossible: Cannot measure ${z} liters`,
    details: result
      ? `Since ${z} % ${g} = 0, by Bézout's identity we can find operations to measure exactly ${z} liters.`
      : `Since ${z} % ${g} = ${z % g} ≠ 0, no combination of fill/empty/pour operations can measure ${z} liters.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1: Achievable',
    a: 3,
    b: 5,
    z: 4,
    description: 'gcd(3,5)=1, 4%1=0 → Possible (famous puzzle)',
  },
  {
    label: 'Example 2: Impossible',
    a: 2,
    b: 2,
    z: 3,
    description: 'gcd(2,2)=2, 3%2=1 → Impossible',
  },
  {
    label: 'Example 3: Edge Case',
    a: 1,
    b: 2,
    z: 0,
    description: 'Target is 0, always achievable (empty both)',
  },
]

export default function Problem365Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [aInput, setAInput] = useState(JSON.stringify(EXAMPLES[0]?.a ?? []));
  const [bInput, setBInput] = useState("");
  const [zInput, setZInput] = useState("");
  const { a, b, z, inputError } = useMemo(() => {
    try {
      const parsedA = JSON.parse(aInput); if (!Array.isArray(parsedA)) throw new Error('a must be an array');
      const parsedB = JSON.parse(bInput); if (!Array.isArray(parsedB)) throw new Error('b must be an array');
      const parsedZ = JSON.parse(zInput); if (!Array.isArray(parsedZ)) throw new Error('z must be an array');
      return { a: parsedA, b: parsedB, z: parsedZ, inputError: '' };
    } catch (e) {
      return { a: EXAMPLES[exIdx]?.a ?? '', b: EXAMPLES[exIdx]?.b ?? '', z: EXAMPLES[exIdx]?.z ?? '', inputError: e.message };
    }
  }, [aInput, bInput, zInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(a, b, z), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setAInput(JSON.stringify(EXAMPLES[i].a)); setBInput(JSON.stringify(EXAMPLES[i].b)); setZInput(JSON.stringify(EXAMPLES[i].z)); handleReset(); }, [handleReset]);

  // Render jug visualization
  const jugVisualization = step ? (
    <div className="wjp-jugs-container">
      <div className="wjp-jug-pair">
        {/* Jug A */}
        <div className="wjp-jug-wrapper">
          <div className="wjp-jug-label">Jug A</div>
          <div className="wjp-jug-capacity">{step.jugA}L</div>
          <motion.div
            className="wjp-jug-container"
            animate={{
              borderColor: step.phase === 'complete' && step.isValid ? 'var(--wjp-green)' : 'var(--wjp-surface1)',
              boxShadow:
                step.phase === 'complete' && step.isValid
                  ? '0 0 16px rgba(166, 227, 161, 0.3)'
                  : 'none',
            }}
          >
            <motion.div
              className="wjp-water"
              animate={{
                height: `${(step.currentWaterA / step.jugA) * 100}%`,
                backgroundColor:
                  step.currentWaterA > 0
                    ? 'var(--wjp-blue)'
                    : 'transparent',
              }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="wjp-water-label"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: step.currentWaterA > 0 ? 1 : 0,
                }}
              >
                {step.currentWaterA.toFixed(1)}L
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Target indicator */}
        <div className="wjp-target-indicator">
          <motion.div
            className="wjp-target-label"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            Target: {step.target}L
          </motion.div>
          <motion.div
            className={`wjp-target-status ${step.isValid !== null ? (step.isValid ? 'possible' : 'impossible') : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: step.isValid !== null ? 1 : 0,
              y: step.isValid !== null ? 0 : 10,
            }}
          >
            {step.isValid === true && '✓ Possible'}
            {step.isValid === false && '✗ Impossible'}
          </motion.div>
        </div>

        {/* Jug B */}
        <div className="wjp-jug-wrapper">
          <div className="wjp-jug-label">Jug B</div>
          <div className="wjp-jug-capacity">{step.jugB}L</div>
          <motion.div
            className="wjp-jug-container"
            animate={{
              borderColor: step.phase === 'complete' && step.isValid ? 'var(--wjp-green)' : 'var(--wjp-surface1)',
              boxShadow:
                step.phase === 'complete' && step.isValid
                  ? '0 0 16px rgba(166, 227, 161, 0.3)'
                  : 'none',
            }}
          >
            <motion.div
              className="wjp-water"
              animate={{
                height: `${(step.currentWaterB / step.jugB) * 100}%`,
                backgroundColor:
                  step.currentWaterB > 0
                    ? 'var(--wjp-sapphire)'
                    : 'transparent',
              }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className="wjp-water-label"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: step.currentWaterB > 0 ? 1 : 0,
                }}
              >
                {step.currentWaterB.toFixed(1)}L
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  ) : null

  // Render GCD visualization
  const gcdVisualization = step && step.gcdValue !== null ? (
    <motion.div
      className="wjp-gcd-display"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="wjp-gcd-title">GCD (Greatest Common Divisor)</div>
      <div className="wjp-gcd-formula">
        gcd({step.jugA}, {step.jugB}) = <span className="wjp-gcd-value">{step.gcdValue}</span>
      </div>
      <div className="wjp-gcd-info">
        <div className="wjp-gcd-check">
          <div className="wjp-gcd-check-label">Divisibility Test:</div>
          <div className="wjp-gcd-check-formula">
            {step.target} ÷ {step.gcdValue} = {(step.target / step.gcdValue).toFixed(2)} (remainder: {step.target % step.gcdValue})
          </div>
        </div>
      </div>
    </motion.div>
  ) : null

  // Render metrics
  const metricsDisplay = step ? (
    <div className="wjp-metrics">
      <div className="wjp-metric">
        <div className="wjp-metric-label">Jug A Capacity</div>
        <motion.div
          className="wjp-metric-value"
          key={`jugA-${step.jugA}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.jugA}L
        </motion.div>
      </div>
      <div className="wjp-metric">
        <div className="wjp-metric-label">Jug B Capacity</div>
        <motion.div
          className="wjp-metric-value"
          key={`jugB-${step.jugB}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.jugB}L
        </motion.div>
      </div>
      <div className="wjp-metric">
        <div className="wjp-metric-label">Total Capacity</div>
        <motion.div
          className="wjp-metric-value"
          key={`total-${step.jugA + step.jugB}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          {step.jugA + step.jugB}L
        </motion.div>
      </div>
    </div>
  ) : null

  // Render explanation
  const explanationDisplay = step ? (
    <motion.div
      className="wjp-explanation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="wjp-explanation-title">Mathematical Principle: Bézout's Identity</div>
      <div className="wjp-explanation-text">
        For any two integers a and b, there exist integers i and j such that:
        <div className="wjp-formula">a·i + b·j = gcd(a, b)</div>
        This extends to: we can measure exactly z liters if and only if z is divisible by gcd(a, b).
        <div className="wjp-formula-example">
          Can measure z ⟺ z % gcd(a, b) = 0
        </div>
      </div>
    </motion.div>
  ) : null

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>
      ),
    },
    {
      id: 'viz',
      title: '💧 Water Jug Visualization',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div className="wjp-examples">
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                className={`wjp-example-btn ${exIdx === i ? 'active' : ''}`}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
              <div className="wjp-step-info">
                <div className="wjp-step-message">{step.message}</div>
                <div className="wjp-step-details">{step.details}</div>
              </div>

              {jugVisualization}
              {metricsDisplay}
              {gcdVisualization}
              {explanationDisplay}

              <div className="wjp-legend">
                <div className="wjp-legend-item">
                  <div className="wjp-legend-dot water-a" />
                  Jug A Water
                </div>
                <div className="wjp-legend-item">
                  <div className="wjp-legend-dot water-b" />
                  Jug B Water
                </div>
                <div className="wjp-legend-item">
                  <div className="wjp-legend-dot target" />
                  Target Volume
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

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
          prevDisabled={stepIndex <= 0}
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
  )
}
