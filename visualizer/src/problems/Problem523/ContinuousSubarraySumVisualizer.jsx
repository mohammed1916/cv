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
import './ContinuousSubarraySumVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('continuous-subarray-sum')

const PATTERNS = ['init', 'loop', 'process']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop',
  6: 'process',
  7: 'process'
}


const EXAMPLES = getExamples('continuous-subarray-sum')

function generateSteps(nums, k) {
  const steps = []

  if (k === 0) {
    steps.push({
      activeLine: 1,
      nums: [...nums],
      k,
      message: 'k = 0, check if consecutive equal elements exist',
      relatedLines: [1]
    })

    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] === 0 && nums[i + 1] === 0) {
        steps.push({
          activeLine: 2,
          nums: [...nums],
          k,
          done: true,
          result: true,
          message: `Found two consecutive zeros at indices ${i}, ${i + 1}`,
          relatedLines: [2]
        })
        return steps
      }
    }

    steps.push({
      activeLine: 3,
      nums: [...nums],
      k,
      done: true,
      result: false,
      message: 'No consecutive zeros found',
      relatedLines: [3]
    })
    return steps
  }

  steps.push({
    activeLine: 4,
    nums: [...nums],
    k,
    sumMod: new Map(),
    prefixSum: 0,
    idx: -1,
    message: `Find subarray with sum divisible by ${k}`,
    relatedLines: [4]
  })

  const sumMod = new Map()
  sumMod.set(0, -1)
  let prefixSum = 0

  for (let i = 0; i < nums.length; i++) {
    prefixSum += nums[i]
    const mod = ((prefixSum % k) + k) % k

    steps.push({
      activeLine: 5,
      nums: [...nums],
      k,
      sumMod: new Map(sumMod),
      prefixSum,
      idx: i,
      currentMod: mod,
      message: `Index ${i}: prefix_sum=${prefixSum}, mod=${mod}`,
      relatedLines: [5]
    })

    if (sumMod.has(mod)) {
      const lastIdx = sumMod.get(mod)

      steps.push({
        activeLine: 6,
        nums: [...nums],
        k,
        sumMod,
        done: true,
        result: true,
        message: `Found! Same mod at indices ${lastIdx + 1} to ${i} (length ${i - lastIdx})`,
        relatedLines: [6]
      })
      return steps
    }

    sumMod.set(mod, i)
  }

  steps.push({
    activeLine: 7,
    nums: [...nums],
    k,
    sumMod,
    done: true,
    result: false,
    message: 'No valid subarray found',
    relatedLines: [7]
  })

  return steps
}

function VisualizationPanel({ nums, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find a contiguous subarray of length &gt;= 2 whose sum is divisible by k using prefix sums."
        </div>
      </div>

      {/* Examples */}
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

      {/* Array */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
          Array (k={k})
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(step?.nums ?? nums)?.map((val, idx) => {
            const isActive = step && idx === step.idx
            return (
              <motion.div
                key={`num-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#dbeafe' : 'var(--surface2)',
                  borderColor: isActive ? '#0284c7' : 'var(--border)',
                  color: isActive ? '#0c4a6e' : 'var(--border)'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Prefix Sum Info */}
      {step?.prefixSum !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Current State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#bfdbfe',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              color: '#0c4a6e'
            }}>
              Prefix Sum: {step.prefixSum}
            </div>
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#bfdbfe',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 600,
              color: '#0c4a6e'
            }}>
              Mod: {step.currentMod}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mod Map */}
      {step?.sumMod && step.sumMod.size > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0f9ff',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Mod Map
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Array.from(step.sumMod.entries()).map(([mod, idx]) => (
              <div key={mod} style={{
                padding: '6px 12px',
                backgroundColor: '#dbeafe',
                borderRadius: 4,
                border: '1px solid #0284c7',
                fontSize: 11,
                fontWeight: 600,
                color: '#0c4a6e'
              }}>
                mod {mod}: idx {idx}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Result</div>
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: step?.result ? '#10b981' : '#ef4444'
        }}>
          {step?.result ? '✓ Found' : '✗ Not Found'}
        </div>
        <div style={{ fontSize: 12, color: '#027bba', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function ContinuousSubarraySumVisualizer() {
  const DEFAULT_NUMS = EXAMPLES[0]?.nums ?? [23, 2, 4, 6, 7]
  const DEFAULT_K = EXAMPLES[0]?.k ?? 6

  const [numsInput, setNumsInput] = useState(JSON.stringify(DEFAULT_NUMS))
  const [kInput, setKInput] = useState(String(DEFAULT_K))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { nums, k, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput)
      if (!Array.isArray(parsedNums) || parsedNums.some((n) => typeof n !== 'number' || !Number.isFinite(n))) {
        throw new Error('nums must be an array of numbers, e.g. [23,2,4,6,13]')
      }
      const parsedK = Number(kInput.trim())
      if (kInput.trim() === '' || !Number.isFinite(parsedK)) {
        throw new Error('k must be a number')
      }
      return { nums: parsedNums, k: parsedK, inputError: '' }
    } catch (e) {
      return { nums: [23, 2, 4, 6, 7], k: 6, inputError: e.message }
    }
  }, [numsInput, kInput])

  const steps = useMemo(
    () =>
      generateSteps(nums, k).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [nums, k]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setNumsInput(JSON.stringify(e.nums))
    setKInput(String(e.k))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📊 Continuous Subarray Sum', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

          <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />


          {showPatternOverlay && (

            <CodePatternAnnotations

              linePatterns={LINE_PATTERN_MAP}

              currentPhase={step?.phase}

              activeLineDom={activeLineDom}

              activeLine={step?.activeLine}

            />

          )}

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 'nums', label: 'nums', type: 'array' },
            { key: 'k', label: 'k', type: 'number' },
          ]}
          values={{ nums: numsInput, k: kInput }}
          onChange={(key, text) => {
            if (key === 'nums') setNumsInput(text)
            else if (key === 'k') setKInput(text)
            setActiveLabel('')
            handleReset()
          }}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          nums={nums}
          k={k}
          step={step}
          applyEx={applyEx}
        />
      </>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, nums, k, numsInput, kInput, activeLabel, inputError, applyEx, handleReset])
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
