import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem413Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('arithmetic-slices')

const PATTERNS = ['arith_found', 'check_i', 'done', 'init', 'init_dp', 'not_arith', 'update_dp']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'init_dp',
  3: 'check_i',
  4: 'arith_found',
  5: 'update_dp',
  6: 'not_arith',
  7: 'done'
}


const EXAMPLES = [
  { label: 'Small', nums: [1, 2, 3], expected: 1 },
  { label: 'Medium', nums: [1, 2, 3, 4], expected: 3 },
  { label: 'Large', nums: [1, 2, 3, 4, 5, 6], expected: 9 },
]

function generateSteps(nums) {
  const steps = []

  if (nums.length < 3) {
    steps.push({
      activeLine: 1,
      message: 'Array has fewer than 3 elements. Return 0.',
      phase: 'done',
      result: 0,
      count: 0,
      dp: [],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Count arithmetic slices. Array: [${nums.join(', ')}]`,
    phase: 'init',
    result: 0,
    count: 0,
    dp: Array(nums.length).fill(0),
    nums,
  })

  const dp = Array(nums.length).fill(0)
  let count = 0

  steps.push({
    activeLine: 2,
    message: 'Initialize dp array.',
    phase: 'init_dp',
    result: 0,
    count: 0,
    dp: [...dp],
    nums,
  })

  for (let i = 2; i < nums.length; i++) {
    steps.push({
      activeLine: 3,
      message: `Check index i=${i}. nums[${i}]=${nums[i]}`,
      phase: 'check_i',
      result: count,
      count,
      dp: [...dp],
      currentI: i,
      nums,
    })

    if (nums[i] - nums[i - 1] === nums[i - 1] - nums[i - 2]) {
      steps.push({
        activeLine: 4,
        message: `i=${i}: Arithmetic progression found! Diff: ${nums[i] - nums[i - 1]}`,
        phase: 'arith_found',
        result: count,
        count,
        dp: [...dp],
        currentI: i,
        nums,
      })

      dp[i] = dp[i - 1] + 1
      count += dp[i]

      steps.push({
        activeLine: 5,
        message: `dp[${i}] = dp[${i - 1}] + 1 = ${dp[i]}. Count += ${dp[i]} → ${count}`,
        phase: 'update_dp',
        result: count,
        count,
        dp: [...dp],
        currentI: i,
        nums,
      })
    } else {
      steps.push({
        activeLine: 6,
        message: `i=${i}: Not arithmetic progression. dp[${i}] = 0`,
        phase: 'not_arith',
        result: count,
        count,
        dp: [...dp],
        currentI: i,
        nums,
      })
    }
  }

  steps.push({
    activeLine: 7,
    message: `Complete. Total arithmetic slices: ${count}`,
    phase: 'done',
    result: count,
    count,
    dp: [...dp],
    nums,
  })

  return steps
}

function ArithmeticSlicesVisualization({ nums, step }) {
  const count = step?.count || 0
  const dp = step?.dp || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Arithmetic Slices Counting</div>

      {/* Input array */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Input Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((val, idx) => {
            const isCurrent = step?.currentI === idx
            const isProcessed = idx <= step?.currentI && step?.currentI !== undefined

            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isCurrent ? '#c7d2fe' : isProcessed ? '#dbeafe' : '#f1f5f9',
                  borderRadius: 6,
                  border: `2px solid ${isCurrent ? '#6366f1' : isProcessed ? '#0284c7' : '#cbd5e1'}`,
                  textAlign: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: isCurrent ? '#4f46e5' : isProcessed ? '#0284c7' : '#334155',
                  minWidth: 50,
                }}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  boxShadow: isCurrent ? '0 0 10px rgba(99,102,241,0.5)' : 'none',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* DP table */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>DP Table (slices ending at i)</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${nums.length}, minmax(60px, 1fr))`, gap: 8 }}>
          {nums.map((_, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>i={idx}</div>
              <div style={{
                padding: '8px 6px',
                backgroundColor: step?.currentI === idx ? '#fef3c7' : '#f1f5f9',
                borderRadius: 4,
                border: `2px solid ${step?.currentI === idx ? '#f59e0b' : '#cbd5e1'}`,
                fontSize: 13,
                fontWeight: 700,
                color: '#1e293b',
              }}>
                {dp[idx]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current state */}
      {step?.currentI !== undefined && step.currentI >= 2 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Current Slice Check</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#065f46' }}>nums[{step.currentI - 2}]</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{nums[step.currentI - 2]}</div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#065f46' }}>nums[{step.currentI - 1}]</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{nums[step.currentI - 1]}</div>
            </div>
            <div style={{ padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#065f46' }}>nums[{step.currentI}]</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{nums[step.currentI]}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Total Count</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#027bba', fontFamily: 'monospace' }}>{count}</div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem413Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [numsInput, setNumsInput] = useState(JSON.stringify(EXAMPLES[0]?.nums ?? []));
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: EXAMPLES[exIdx]?.nums ?? '', inputError: e.message };
    }
  }, [numsInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setNumsInput(JSON.stringify(EXAMPLES[i].nums)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎯 Arithmetic Slices', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
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
                    border: exIdx === idx ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fef3c7' : '#f1f5f9',
                    color: exIdx === idx ? '#92400e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <ArithmeticSlicesVisualization nums={nums} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"nums","label":"nums","type":"array"}]}
          values={{ nums: numsInput }}
          onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
