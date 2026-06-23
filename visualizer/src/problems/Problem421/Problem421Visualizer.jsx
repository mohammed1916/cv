import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem421Visualizer.css'

const EXAMPLES = [
  { label: 'Small', nums: [3, 10, 5, 25, 2, 8], expected: 28 },
  { label: 'Medium', nums: [8, 10, 2], expected: 10 },
  { label: 'Large', nums: [14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70], expected: 127 },
]

function generateSteps(nums) {
  const steps = []

  steps.push({
    activeLine: 1,
    message: `Find max XOR. Array: [${nums.join(', ')}]`,
    phase: 'init',
    result: 0,
    maxXor: 0,
    nums,
  })

  let maxXor = 0
  const pairs = []

  steps.push({
    activeLine: 2,
    message: `Compare all pairs to find maximum XOR.`,
    phase: 'start',
    result: 0,
    maxXor: 0,
    nums,
  })

  for (let i = 0; i < Math.min(nums.length, 6); i++) {
    for (let j = i + 1; j < Math.min(nums.length, 6); j++) {
      const xorVal = nums[i] ^ nums[j]
      pairs.push({
        i,
        j,
        a: nums[i],
        b: nums[j],
        xor: xorVal,
      })

      steps.push({
        activeLine: 3,
        message: `Compare nums[${i}]=${nums[i]} and nums[${j}]=${nums[j]}. XOR: ${xorVal}`,
        phase: 'check_pair',
        result: maxXor,
        maxXor,
        currentPair: { i, j, a: nums[i], b: nums[j], xor: xorVal },
        nums,
      })

      if (xorVal > maxXor) {
        maxXor = xorVal

        steps.push({
          activeLine: 4,
          message: `New max XOR: ${maxXor}`,
          phase: 'new_max',
          result: maxXor,
          maxXor,
          currentPair: { i, j, a: nums[i], b: nums[j], xor: xorVal },
          nums,
        })
      }
    }
  }

  steps.push({
    activeLine: 5,
    message: `Complete. Maximum XOR: ${maxXor}`,
    phase: 'done',
    result: maxXor,
    maxXor,
    pairs: pairs.slice(0, 6),
    nums,
  })

  return steps
}

function toBinary(num) {
  return num.toString(2).padStart(8, '0')
}

function MaxXORVisualization({ nums, step }) {
  const result = step?.result || 0
  const currentPair = step?.currentPair

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Maximum XOR of Two Numbers</div>

      {/* Input array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Array</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {nums.map((val, idx) => {
            const isCurrent = currentPair && (currentPair.i === idx || currentPair.j === idx)
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 10px',
                  backgroundColor: isCurrent ? '#c7d2fe' : '#f1f5f9',
                  borderRadius: 4,
                  border: `2px solid ${isCurrent ? '#6366f1' : '#cbd5e1'}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: isCurrent ? '#4f46e5' : '#334155',
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current pair visualization */}
      {currentPair && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#cffafe',
            borderRadius: 6,
            border: '2px solid #06b6d4',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#164e63', marginBottom: 10 }}>Current Pair XOR</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#164e63', fontWeight: 600 }}>Num1</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#06b6d4', fontFamily: 'monospace' }}>
                {currentPair.a}
              </div>
              <div style={{ fontSize: 9, color: '#164e63', marginTop: 4, fontFamily: 'monospace' }}>
                {toBinary(currentPair.a)}
              </div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#164e63', fontWeight: 600 }}>Num2</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#06b6d4', fontFamily: 'monospace' }}>
                {currentPair.b}
              </div>
              <div style={{ fontSize: 9, color: '#164e63', marginTop: 4, fontFamily: 'monospace' }}>
                {toBinary(currentPair.b)}
              </div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
              <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Result</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0284c7', fontFamily: 'monospace' }}>
                {currentPair.xor}
              </div>
              <div style={{ fontSize: 9, color: '#0c4a6e', marginTop: 4, fontFamily: 'monospace' }}>
                {toBinary(currentPair.xor)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bit representation legend */}
      <div style={{ padding: 10, backgroundColor: '#f1f5f9', borderRadius: 6, border: '1px solid #cbd5e1' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>XOR Rule: 1⊕1=0, 0⊕0=0, 1⊕0=1</div>
        <div style={{ fontSize: 9, color: '#64748b' }}>Result 1 when bits differ, 0 when same</div>
      </div>

      {/* Pairs table */}
      {step?.pairs && step.pairs.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>All Pairs (first 6)</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 6,
            maxHeight: 200,
            overflowY: 'auto',
            padding: 8,
            backgroundColor: '#f1f5f9',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
          }}>
            {step.pairs.map((pair, idx) => {
              const isMax = pair.xor === step.result
              return (
                <div
                  key={idx}
                  style={{
                    padding: '8px',
                    backgroundColor: isMax ? '#dbeafe' : '#ffffff',
                    borderRadius: 4,
                    border: `1px solid ${isMax ? '#0284c7' : '#e2e8f0'}`,
                    textAlign: 'center',
                    fontSize: 11,
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {pair.a} ^ {pair.b}
                  </div>
                  <div style={{ fontSize: 10, color: isMax ? '#0284c7' : '#64748b', fontWeight: 700, marginTop: 4 }}>
                    = {pair.xor}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, border: '2px solid #06b6d4' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#164e63', marginBottom: 4 }}>Maximum XOR</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#06b6d4', fontFamily: 'monospace' }}>
          {result}
        </div>
        <div style={{ fontSize: 10, color: '#164e63', marginTop: 6, fontFamily: 'monospace' }}>
          {toBinary(result)}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem421Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

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
      title: '🎯 Max XOR',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#cffafe' : '#f1f5f9',
                    color: exIdx === idx ? '#164e63' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <MaxXORVisualization nums={example.nums} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
