import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem476Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('number-complement')

const PATTERNS = []

const EXAMPLES = getExamples('number-complement')

function findComplement(num) {
  let highestBit = 1
  while (highestBit <= num) highestBit <<= 1
  return (highestBit - 1) ^ num
}

function generateSteps(num) {
  const steps = []
  const binary = num.toString(2)

  steps.push({
    activeLine: 1,
    num,
    binary,
    index: 0,
    highestBit: 0,
    complement: 0,
    message: `Find complement of ${num} (binary: ${binary})`
  })

  let highestBit = 1
  let bitCount = 0
  let tempNum = num
  while (highestBit <= num) {
    bitCount++
    steps.push({
      activeLine: 2,
      num,
      binary,
      index: bitCount,
      highestBit,
      complement: 0,
      message: `Find highest bit: shifted to ${highestBit}`
    })
    highestBit <<= 1
  }

  const complement = (highestBit - 1) ^ num
  steps.push({
    activeLine: 3,
    num,
    binary,
    index: bitCount,
    highestBit,
    complement,
    message: `XOR with mask: ${(highestBit - 1).toString(2)} ^ ${binary} = ${complement.toString(2)}`
  })

  steps.push({
    activeLine: 4,
    num,
    binary,
    index: bitCount,
    highestBit,
    complement,
    done: true,
    message: `Complement of ${num} is ${complement}`
  })

  return steps
}

function VisualizationPanel({ num, step, applyEx }) {
  const binary = num.toString(2)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find the complement of a number by flipping all bits. Find the highest bit position and XOR with a mask."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
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

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Number</div>
        <div style={{
          padding: 12,
          backgroundColor: 'var(--surface2)',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 14,
          fontWeight: 600
        }}>
          Decimal: {num} | Binary: {binary}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Bits</div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {binary.split('').map((bit, idx) => (
            <motion.div
              key={`bit-${idx}`}
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                border: '2px solid var(--border)',
                fontFamily: 'monospace',
                fontSize: 16,
                fontWeight: 700,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {bit}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Highest Bit</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#0c865d' }}>
            {step?.highestBit ?? 0}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: 6
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Complement</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#a36907' }}>
            {step?.complement ?? 0}
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem476Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numInput, setNumInput] = useState(5);
  const { num, inputError } = useMemo(() => {
    try {
      const parsedNum = Number(numInput); if (isNaN(parsedNum)) throw new Error('num must be a number');
      return { num: parsedNum, inputError: '' };
    } catch (e) {
      return { num: 5, inputError: e.message };
    }
  }, [numInput]);

  const steps = useMemo(
    () =>
      generateSteps(num).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [num]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNumInput(String(e.num)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔄 Number Complement', dockMode: 'split-right' },
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
          num={num}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"num","label":"num","type":"number"}]}
          values={{ num: numInput }}
          onChange={(k, v) => { if (k === 'num') setNumInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
        />
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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
