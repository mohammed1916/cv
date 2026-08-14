import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem371Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('sum-of-two-integers')

const PATTERNS = ['and-operation', 'binary-representation', 'complete', 'shift-carry', 'update-variables', 'xor-operation']
const LINE_PATTERN_MAP = {
  1: 'binary-representation',
  3: 'xor-operation',
  4: 'and-operation',
  5: 'shift-carry',
  6: 'update-variables',
  7: 'complete'
}


const EXAMPLES = getExamples('sum-of-two-integers')

function getSignBit(n) {
  return (n >>> 31) & 1
}

function numberToBinary(n, bits = 32) {
  if (n >= 0) {
    return n.toString(2).padStart(bits, '0')
  }
  // Two's complement for negative numbers
  const binary = (n >>> 0).toString(2)
  return binary.padStart(bits, '0')
}

function generateSteps(a, b) {
  const steps = []

  // Step 1: Show binary representations
  steps.push({
    activeLine: 1,
    phase: 'binary-representation',
    a,
    b,
    a_binary: numberToBinary(a),
    b_binary: numberToBinary(b),
    xor: null,
    and: null,
    carry: null,
    sum: null,
    iteration: 0,
    message: `Binary representation: a=${a} (${numberToBinary(a)}), b=${b} (${numberToBinary(b)})`
  })

  let x = a
  let y = b
  let iteration = 0

  // Step 2-5: Iteration loop
  while (y !== 0) {
    iteration++

    // XOR operation
    const xor = x ^ y
    steps.push({
      activeLine: 3,
      phase: 'xor-operation',
      a,
      b,
      a_binary: numberToBinary(a),
      b_binary: numberToBinary(b),
      x,
      y,
      x_binary: numberToBinary(x),
      y_binary: numberToBinary(y),
      xor,
      xor_binary: numberToBinary(xor),
      and: null,
      carry: null,
      sum: null,
      iteration,
      message: `Iteration ${iteration}: XOR operation (sum without carry): x ^ y = ${xor}`
    })

    // AND operation
    const and = (x & y)
    steps.push({
      activeLine: 4,
      phase: 'and-operation',
      a,
      b,
      a_binary: numberToBinary(a),
      b_binary: numberToBinary(b),
      x,
      y,
      x_binary: numberToBinary(x),
      y_binary: numberToBinary(y),
      xor,
      xor_binary: numberToBinary(xor),
      and,
      and_binary: numberToBinary(and),
      carry: null,
      sum: null,
      iteration,
      message: `AND operation (find carry bits): x & y = ${and}`
    })

    // Carry shift
    const carry = (and << 1)
    steps.push({
      activeLine: 5,
      phase: 'shift-carry',
      a,
      b,
      a_binary: numberToBinary(a),
      b_binary: numberToBinary(b),
      x,
      y,
      x_binary: numberToBinary(x),
      y_binary: numberToBinary(y),
      xor,
      xor_binary: numberToBinary(xor),
      and,
      and_binary: numberToBinary(and),
      carry,
      carry_binary: numberToBinary(carry),
      sum: null,
      iteration,
      message: `Shift carry left: (x & y) << 1 = ${carry}`
    })

    // Update x and y
    x = xor
    y = carry

    steps.push({
      activeLine: 6,
      phase: 'update-variables',
      a,
      b,
      a_binary: numberToBinary(a),
      b_binary: numberToBinary(b),
      x,
      y,
      x_binary: numberToBinary(x),
      y_binary: numberToBinary(y),
      xor,
      xor_binary: numberToBinary(xor),
      and,
      and_binary: numberToBinary(and),
      carry,
      carry_binary: numberToBinary(carry),
      sum: null,
      iteration,
      message: `Update: x = ${x}, y = ${y}`
    })
  }

  // Final result
  steps.push({
    activeLine: 7,
    phase: 'complete',
    a,
    b,
    a_binary: numberToBinary(a),
    b_binary: numberToBinary(b),
    x,
    y,
    x_binary: numberToBinary(x),
    y_binary: numberToBinary(y),
    xor: null,
    and: null,
    carry: null,
    sum: x,
    sum_binary: numberToBinary(x),
    done: true,
    message: `Complete: Sum of ${a} and ${b} is ${x}`
  })

  return steps
}

function BinaryRepresentation({ label, number, binary, highlight = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
        {label}
      </div>
      <div style={{
        padding: '10px 12px',
        backgroundColor: highlight ? '#dbeafe' : '#f1f5f9',
        borderRadius: 6,
        border: `2px solid ${highlight ? '#0284c7' : '#cbd5e1'}`,
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#1e293b'
      }}>
        {number}
      </div>
      <div style={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        padding: '8px 0'
      }}>
        {binary.split('').map((bit, idx) => (
          <motion.div
            key={`${label}-${idx}`}
            style={{
              padding: '6px 8px',
              borderRadius: 4,
              border: '2px solid',
              fontFamily: 'monospace',
              fontSize: 11,
              fontWeight: 600,
              backgroundColor: bit === '1' ? '#ecfdf5' : '#f1f5f9',
              borderColor: bit === '1' ? '#10b981' : '#cbd5e1',
              color: bit === '1' ? '#047857' : '#64748b'
            }}
            animate={{ scale: highlight ? 1.05 : 1 }}
          >
            {bit}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ a, b, step, applyEx }) {
  const resultStyle = (label) => ({
    padding: '12px 14px',
    borderRadius: 6,
    border: '2px solid',
    backgroundColor: '#f8fafc',
    ...(() => {
      switch (label) {
        case 'XOR':
          return { borderColor: '#f59e0b', backgroundColor: '#fffbeb' }
        case 'AND':
          return { borderColor: '#8b5cf6', backgroundColor: '#faf5ff' }
        case 'CARRY':
          return { borderColor: '#ef4444', backgroundColor: '#fef2f2' }
        default:
          return { borderColor: '#10b981', backgroundColor: '#f0fdf4' }
      }
    })()
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16 }}>
      {/* Examples */}
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
                backgroundColor: '#f1f5f9',
                fontWeight: 500
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input representations */}
      {step && (
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            padding: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 8,
            border: '2px solid #e2e8f0'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <BinaryRepresentation label="a (input)" number={step.a} binary={step.a_binary} />
          <BinaryRepresentation label="b (input)" number={step.b} binary={step.b_binary} />
        </motion.div>
      )}

      {/* Iteration info */}
      {step && step.iteration > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            fontSize: 13,
            color: '#78350f'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontWeight: 600 }}>Iteration {step.iteration}</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            x = {step.x}, y = {step.y}
          </div>
        </motion.div>
      )}

      {/* XOR Result */}
      {step && step.xor !== null && (
        <motion.div
          style={{
            ...resultStyle('XOR'),
            padding: 16
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>XOR (Sum without Carry)</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#b45309', marginBottom: 8 }}>
            x ^ y = {step.xor}
          </div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {step.xor_binary.split('').map((bit, idx) => (
              <div
                key={`xor-${idx}`}
                style={{
                  padding: '4px 6px',
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: bit === '1' ? '#ecfdf5' : '#fef3c7',
                  color: bit === '1' ? '#047857' : '#92400e',
                  border: '1px solid #f59e0b'
                }}
              >
                {bit}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AND Result */}
      {step && step.and !== null && (
        <motion.div
          style={{
            ...resultStyle('AND'),
            padding: 16
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6d28d9', marginBottom: 8 }}>AND (Find Carry Bits)</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#7c3aed', marginBottom: 8 }}>
            x & y = {step.and}
          </div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {step.and_binary.split('').map((bit, idx) => (
              <div
                key={`and-${idx}`}
                style={{
                  padding: '4px 6px',
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: bit === '1' ? '#ecfdf5' : '#faf5ff',
                  color: bit === '1' ? '#047857' : '#6d28d9',
                  border: '1px solid #8b5cf6'
                }}
              >
                {bit}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Carry Result */}
      {step && step.carry !== null && (
        <motion.div
          style={{
            ...resultStyle('CARRY'),
            padding: 16
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Carry (Shifted Left)</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#dc2626', marginBottom: 8 }}>
            (x & y) &lt;&lt; 1 = {step.carry}
          </div>
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {step.carry_binary.split('').map((bit, idx) => (
              <div
                key={`carry-${idx}`}
                style={{
                  padding: '4px 6px',
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: bit === '1' ? '#ecfdf5' : '#fef2f2',
                  color: bit === '1' ? '#047857' : '#991b1b',
                  border: '1px solid #ef4444'
                }}
              >
                {bit}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Final Result */}
      {step && step.done && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>Result</div>
          <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 'bold', color: '#047857' }}>
            {step.a} + {step.b} = {step.sum}
          </div>
          <div style={{ fontSize: 12, color: '#4b7c47', marginTop: 8 }}>
            Binary: {step.sum_binary}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Problem371Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [aInput, setAInput] = useState(1);
  const [bInput, setBInput] = useState(1);
  const { a, b, inputError } = useMemo(() => {
    try {
      const parsedA = Number(aInput); if (isNaN(parsedA)) throw new Error('a must be a number');
      const parsedB = Number(bInput); if (isNaN(parsedB)) throw new Error('b must be a number');
      return { a: parsedA, b: parsedB, inputError: '' };
    } catch (e) {
      return { a: 1, b: 1, inputError: e.message };
    }
  }, [aInput, bInput]);

  const steps = useMemo(
    () =>
      generateSteps(a, b).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [a, b]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setAInput(String(e.a)); setBInput(String(e.b)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const codePanel = (
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
  )

  const vizPanel = (
    <>
    <VisualizationPanel
      a={a}
      b={b}
      step={step}
      applyEx={applyEx}
    />
  
    </>)

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⚙️ Bit Manipulation', dockMode: 'split-right' },
  ], [])
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
