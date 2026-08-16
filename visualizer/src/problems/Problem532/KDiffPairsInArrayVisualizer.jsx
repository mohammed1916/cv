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
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import './KDiffPairsInArrayVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('k-diff-pairs-in-array')

const PATTERNS = ['check_num', 'count', 'done', 'found_pair', 'init']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'done',
  3: 'count',
  5: 'loop',
  7: 'process',
  9: 'process',
  10: 'done'
}


const EXAMPLES = getExamples('k-diff-pairs-in-array')

const FALLBACK_NUMS = [3, 1, 4, 1, 5]

function generateSteps(nums, k) {
  const steps = []

  steps.push({
    activeLine: 1,
    nums,
    k,
    count: new Map(nums.map(n => [n, (nums.filter(x => x === n).length)])),
    pairs: 0,
    phase: 'init',
    message: `Find k-diff pairs where k=${k}`,
    relatedLines: [1]
  })

  if (k < 0) {
    steps.push({
      activeLine: 2,
      nums,
      k,
      pairs: 0,
      phase: 'done',
      message: `k < 0: no pairs possible`,
      relatedLines: [2],
      done: true,
      result: 0
    })
    return steps
  }

  const count = new Map()
  for (const num of nums) {
    count.set(num, (count.get(num) || 0) + 1)
  }

  steps.push({
    activeLine: 3,
    nums,
    k,
    count,
    pairs: 0,
    phase: 'count',
    message: `Count frequencies of each number`,
    relatedLines: [3]
  })

  let pairs = 0
  const processedNums = new Set()

  for (const num of count.keys()) {
    if (processedNums.has(num)) continue

    steps.push({
      activeLine: 5,
      nums,
      k,
      count,
      num,
      pairs,
      phase: 'check_num',
      message: `Check number ${num}`,
      relatedLines: [5]
    })

    if (k === 0) {
      if (count.get(num) > 1) {
        pairs++
        steps.push({
          activeLine: 7,
          nums,
          k,
          count,
          num,
          pairs,
          phase: 'found_pair',
          message: `Found pair: (${num}, ${num}) - number appears ${count.get(num)} times`,
          relatedLines: [7]
        })
      }
    } else {
      const target = num + k
      if (count.has(target)) {
        pairs++
        steps.push({
          activeLine: 9,
          nums,
          k,
          count,
          num,
          target,
          pairs,
          phase: 'found_pair',
          message: `Found pair: (${num}, ${target})`,
          relatedLines: [9]
        })
      }
    }

    processedNums.add(num)
  }

  steps.push({
    activeLine: 10,
    nums,
    k,
    count,
    pairs,
    phase: 'done',
    message: `Total k-diff pairs: ${pairs}`,
    relatedLines: [10],
    done: true,
    result: pairs
  })

  return steps
}

function VisualizationPanel({ nums, k, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Count unique pairs (a, b) where a and b differ by exactly k."
        </div>
      </div>

      {/* Parameters */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Target Difference</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#027bba' }}>{k}</div>
        </div>
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Array Size</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#027bba' }}>{nums.length}</div>
        </div>
      </div>

      {/* Frequency Map */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Number Frequencies</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {step?.count && Array.from(step.count.entries()).map(([num, freq]) => {
            const isCurrent = step?.num === num
            return (
              <motion.div
                key={`freq-${num}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#dbeafe' : 'var(--surface2)',
                  borderColor: isCurrent ? '#0284c7' : 'var(--border)',
                  color: isCurrent ? '#0c4a6e' : 'var(--border)'
                }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 10, color: '#6b7280' }}>{num}</div>
                <div>×{freq}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pair Info */}
      {step?.phase === 'found_pair' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#0c4a6e', marginBottom: 8, fontWeight: 600 }}>
            Pair Found!
          </div>
          {k === 0 ? (
            <div style={{ color: '#027bba', fontFamily: 'monospace', fontSize: 12 }}>
              ({step.num}, {step.num}) - count: {step.count.get(step.num)}
            </div>
          ) : (
            <div style={{ color: '#027bba', fontFamily: 'monospace', fontSize: 12 }}>
              ({step.num}, {step.target}) - diff: {step.target - step.num}
            </div>
          )}
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
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>K-Diff Pairs</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#027bba' }}>
          {step?.pairs !== undefined ? step.pairs : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#027bba', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function KDiffPairsInArrayVisualizer() {
  const [numsInput, setNumsInput] = useState(JSON.stringify(EXAMPLES[0]?.nums ?? FALLBACK_NUMS))
  const [kInput, setKInput] = useState(String(EXAMPLES[0]?.k ?? 1))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { nums, k, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput)
      if (!Array.isArray(parsedNums) || parsedNums.length === 0) throw new Error('nums must be a non-empty array')
      if (!parsedNums.every((n) => typeof n === 'number' && Number.isFinite(n)))
        throw new Error('nums must contain numbers')

      const parsedK = Number(kInput)
      if (kInput.trim() === '' || !Number.isFinite(parsedK)) throw new Error('k must be a number')

      return { nums: parsedNums, k: parsedK, inputError: '' }
    } catch (e) {
      return { nums: FALLBACK_NUMS, k: 1, inputError: e.message }
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

  const handleFieldChange = useCallback((key, text) => {
    if (key === 'nums') setNumsInput(text)
    else if (key === 'k') setKInput(text)
    setActiveLabel('')
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
    { id: 'viz', title: '📊 K-Diff Pairs in Array', dockMode: 'split-right' },
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
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          nums={nums}
          k={k}
          step={step}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, showPatternOverlay, activeLineDom, nums, k, numsInput, kInput, activeLabel, inputError, applyEx, handleFieldChange])
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
