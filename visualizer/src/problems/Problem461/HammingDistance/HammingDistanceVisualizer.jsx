import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../../components/shared/FloatingPanel'
import CodeTracePanel from '../../../components/CodeTracePanel'
import PlaybackControls from '../../../components/PlaybackControls'
import PatternOverlay from '../../../components/PatternOverlay'
import { usePlaybackState } from '../../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../../hooks/usePatternOverlay'
import { getExamples } from '../../../config/examplesRegistry'
import './HammingDistanceVisualizer.css'
import { createPortal } from 'react-dom'
const EXAMPLES = getExamples('hamming-distance')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def hammingDistance(x, y):' },
  { line: 2, text: '    xor = x ^ y' },
  { line: 3, text: '    distance = 0' },
  { line: 4, text: '    while xor:' },
  { line: 5, text: '        distance += xor & 1' },
  { line: 6, text: '        xor >>= 1' },
  { line: 7, text: '    return distance' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(x, y) {
  const steps = []
  const xor = x ^ y
  const bits = Math.max(x.toString(2).length, y.toString(2).length)

  steps.push({
    activeLine: 1,
    x,
    y,
    xor,
    bits: bits,
    distance: 0,
    bitIndex: -1,
    message: 'Initialize: XOR the two numbers to find differing bits'
  })

  steps.push({
    activeLine: 2,
    x,
    y,
    xor,
    bits,
    distance: 0,
    bitIndex: -1,
    xorBinary: xor.toString(2),
    message: `XOR result: ${x} ^ ${y} = ${xor} (binary: ${xor.toString(2)})`
  })

  let distance = 0
  for (let i = 0; i < bits; i++) {
    const bit = (xor >> i) & 1

    steps.push({
      activeLine: 3,
      x,
      y,
      xor,
      bits,
      distance,
      bitIndex: i,
      currentBit: bit,
      xorBinary: xor.toString(2),
      message: `Check bit ${i}: ${bit === 1 ? 'DIFFERENT' : 'same'}`
    })

    if (bit === 1) {
      distance++
      steps.push({
        activeLine: 4,
        x,
        y,
        xor,
        bits,
        distance,
        bitIndex: i,
        currentBit: bit,
        xorBinary: xor.toString(2),
        message: `Bit ${i} differs! Distance = ${distance}`
      })
    }
  }

  steps.push({
    activeLine: 5,
    x,
    y,
    xor,
    bits,
    distance,
    bitIndex: -1,
    done: true,
    message: `Hamming distance: ${distance} (${distance} bits differ)`
  })

  return steps
}

function VisualizationPanel({ x, y, step, applyEx }) {
  const xBinary = x.toString(2).padStart(Math.max(x.toString(2).length, y.toString(2).length), '0')
  const yBinary = y.toString(2).padStart(Math.max(x.toString(2).length, y.toString(2).length), '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>
          "How many bits differ between two numbers? The Hamming distance counts differing positions. Use XOR to find all differences instantly!"
        </div>
      </div>

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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7'
          }}
          animate={{ scale: step?.activeLine === 1 ? 1.05 : 1 }}
        >
          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>x = {x}</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#0c4a6e', marginTop: 4, fontWeight: 600 }}>
            {xBinary}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fee2e2',
            borderRadius: 6,
            border: '2px solid #ef4444'
          }}
          animate={{ scale: step?.activeLine === 1 ? 1.05 : 1 }}
        >
          <div style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>y = {y}</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#7f1d1d', marginTop: 4, fontWeight: 600 }}>
            {yBinary}
          </div>
        </motion.div>
      </div>

      {/* Bit Comparison */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f1f5f9',
          borderRadius: 6,
          border: '2px solid #cbd5e1'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Bit-by-Bit Comparison</div>
        <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {xBinary.split('').map((bit, idx) => {
            const yBit = yBinary[idx]
            const differ = bit !== yBit
            const isCurrent = step && idx === step.bitIndex

            return (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}
                animate={{ scale: isCurrent ? 1.2 : 1 }}
              >
                <div style={{
                  padding: '6px 8px',
                  borderRadius: 3,
                  backgroundColor: isCurrent ? '#dbeafe' : '#ffffff',
                  border: `2px solid ${isCurrent ? '#0284c7' : '#cbd5e1'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  {bit}
                </div>
                <div style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#666'
                }}>
                  {differ ? '↓' : '='}
                </div>
                <div style={{
                  padding: '6px 8px',
                  borderRadius: 3,
                  backgroundColor: isCurrent ? '#fee2e2' : '#ffffff',
                  border: `2px solid ${isCurrent ? '#ef4444' : '#cbd5e1'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#334155'
                }}>
                  {yBit}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* XOR Result */}
      {step && step.xor !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f8f4ff',
            borderRadius: 6,
            border: '2px solid #8b5cf6'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>XOR Operation</div>
          <div style={{
            padding: 10,
            backgroundColor: '#e9d5ff',
            borderRadius: 4,
            fontFamily: 'monospace',
            fontSize: 12,
            fontWeight: 600,
            color: '#5b21b6',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            {xBinary} XOR {yBinary} = {step.xor.toString(2).padStart(xBinary.length, '0')}
          </div>
          <div style={{ fontSize: 11, color: '#6b21a8' }}>
            Each '1' in the XOR result represents a differing bit position
          </div>
        </motion.div>
      )}

      {/* Distance Counter */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#dcfce7',
          borderRadius: 6,
          border: '2px solid #22c55e',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#15803d', marginBottom: 8 }}>
          Hamming Distance
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: '#178740',
          marginBottom: 8
        }}>
          {step?.distance ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#15803d' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function HammingDistanceVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { x: 1, y: 4 })

  const steps = useMemo(
    () =>
      generateSteps(ex.x, ex.y).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔢 Hamming Distance', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          x={ex.x}
          y={ex.y}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

