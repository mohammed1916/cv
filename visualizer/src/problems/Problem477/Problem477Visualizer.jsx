import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem477Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const EXAMPLES = getExamplesOr('total-hamming-distance', [
  { label: 'Example 1', nums: [4, 14, 2] },
  { label: 'Example 2', nums: [1, 3, 5] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def totalHammingDistance(nums):' },
  { line: 2, text: '    distance=0' },
  { line: 3, text: '    n=len(nums)' },
  { line: 4, text: '    for i in range(32):' },
  { line: 5, text: '        ones=sum(1 for num in nums if num&(1<<i))' },
  { line: 6, text: '        zeros=n-ones' },
  { line: 7, text: '        contribution=ones*zeros' },
  { line: 8, text: '        distance+=contribution' },
  { line: 9, text: '        if ones==0:break' },
  { line: 10, text: '    return distance' },
  { line: 11, text: '' },
  { line: 12, text: '' },
]

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({ activeLine: 1, message: 'Empty array → 0 distance', done: true, result: 0 })
    return steps
  }

  steps.push({ activeLine: 1, message: `Calculate total Hamming distance for [${nums.join(', ')}]`, nums })
  steps.push({ activeLine: 2, message: `Convert numbers to binary for bit-level analysis` })

  const binaries = nums.map(n => n.toString(2).padStart(8, '0'))
  steps.push({ activeLine: 3, message: `Binary representations: ${binaries.map((b, i) => `${nums[i]}=${b}`).join(', ')}`, binaries })
  steps.push({ activeLine: 4, message: 'Insight: For each bit position, count 0s and 1s. Pairs that differ = ones × zeros' })

  const maxBits = Math.max(...nums).toString(2).length
  steps.push({ activeLine: 5, message: `Max bits needed: ${maxBits}` })

  let totalDistance = 0

  for (let bitPos = 0; bitPos < Math.min(maxBits, 5); bitPos++) {
    steps.push({ activeLine: 6, message: `Process bit position ${bitPos}:` })

    let ones = 0
    const bitValues = []

    for (let i = 0; i < nums.length; i++) {
      const bit = (nums[i] >> bitPos) & 1
      bitValues.push(bit)
      if (bit) ones++
    }

    steps.push({ activeLine: 7, message: `Count bits at position ${bitPos}: [${bitValues.join(', ')}]`, bitPos, bitValues })

    const zeros = nums.length - ones
    steps.push({ activeLine: 8, message: `Ones: ${ones}, Zeros: ${zeros}`, ones, zeros })

    const contribution = ones * zeros
    steps.push({ activeLine: 9, message: `Pairs where bits differ: ${ones} × ${zeros} = ${contribution}`, contribution })

    totalDistance += contribution
    steps.push({ activeLine: 10, message: `Running total: ${totalDistance}`, totalDistance })
  }

  steps.push({ activeLine: 11, message: `Complete bit analysis`, totalDistance })
  steps.push({ activeLine: 12, message: `Final total Hamming distance: ${totalDistance}`, done: true, result: totalDistance, totalDistance })

  return steps
}

function BinaryVisualization({ nums, binaries, bitPos }) {
  if (!binaries) return null

  return (
    <div style={{ padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Binary View</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {binaries.map((bin, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 10 }}>
            <div style={{ fontWeight: 600, color: '#1e293b', minWidth: 40 }}>{nums[i]}</div>
            <div style={{ fontFamily: 'monospace', display: 'flex', gap: 1 }}>
              {bin.split('').map((bit, j) => (
                <div
                  key={j}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 3,
                    backgroundColor: j === bitPos ? (bit === '1' ? '#dcfce7' : '#fee2e2') : '#f1f5f9',
                    border: j === bitPos ? `2px solid ${bit === '1' ? '#10b981' : '#dc2626'}` : '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: j === bitPos ? (bit === '1' ? '#166534' : '#991b1b') : '#475569',
                  }}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Algorithm</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          For each bit position: count 1s and 0s. Each bit position contributes (ones × zeros) differing pairs. Sum all positions.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Numbers</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          {nums.map((num, i) => (
            <motion.div
              key={i}
              style={{
                width: 45,
                height: 45,
                borderRadius: 6,
                backgroundColor: '#dbeafe',
                border: '1px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#0c4a6e',
              }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {step?.binaries && (
        <BinaryVisualization nums={nums} binaries={step.binaries} bitPos={step.bitPos} />
      )}

      {step?.bitValues && (
        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #d8b4fe' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>
            Bit Position {step.bitPos}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.bitValues.map((bit, i) => (
              <div
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor: bit === 1 ? '#dcfce7' : '#fee2e2',
                  border: `2px solid ${bit === 1 ? '#10b981' : '#dc2626'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: bit === 1 ? '#166534' : '#991b1b',
                }}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.ones !== undefined && step?.zeros !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
          <div style={{ padding: 10, backgroundColor: '#dcfce7', borderRadius: 6, border: '1px solid #10b981' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#166534' }}>Ones</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
              {step.ones}
            </div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 6, border: '1px solid #dc2626' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#991b1b' }}>Zeros</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
              {step.zeros}
            </div>
          </div>
          <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Pairs Differ</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
              {step.contribution}
            </div>
          </div>
        </div>
      )}

      {step?.totalDistance !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#ede9fe', borderRadius: 6, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4c1d95' }}>Running Total</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
            {step.totalDistance}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>Total Hamming Distance</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a', marginTop: 4 }}>
            {step.result}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem477Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(ex.nums).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
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
      title: '🔢 Total Hamming Distance',
      content: <VisualizationPanel nums={ex.nums} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

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
