import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './ThreeSumVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def threeSum(self, nums: List[int]) -> List[List[int]]:' },
  { line: 3, text: '        nums.sort()' },
  { line: 4, text: '        result = []' },
  { line: 5, text: '        for i in range(len(nums) - 2):' },
  { line: 6, text: '            if i > 0 and nums[i] == nums[i - 1]:' },
  { line: 7, text: '                continue  # skip i-duplicates' },
  { line: 8, text: '            l, r = i + 1, len(nums) - 1' },
  { line: 9, text: '            while l < r:' },
  { line: 10, text: '                s = nums[i] + nums[l] + nums[r]' },
  { line: 11, text: '                if s == 0:' },
  { line: 12, text: '                    result.append([nums[i], nums[l], nums[r]])' },
  { line: 13, text: '                    l += 1' },
  { line: 14, text: '                    while l < r and nums[l] == nums[l-1]: l += 1' },
  { line: 15, text: '                elif s < 0:' },
  { line: 16, text: '                    l += 1' },
  { line: 17, text: '                else:' },
  { line: 18, text: '                    r -= 1' },
  { line: 19, text: '        return result' },
]

function generateSteps(nums) {
  const steps = []
  const n = nums.length

  if (n < 3) {
    steps.push({
      phase: 'done',
      activeLine: 19,
      sorted: [...nums],
      i: null,
      l: null,
      r: null,
      sum: null,
      result: [],
      message: 'Need at least 3 elements. Return [].',
    })
    return steps
  }

  const sorted = [...nums].sort((a, b) => a - b)
  const snapshot = () => result.map((t) => [...t])

  steps.push({
    phase: 'sort',
    activeLine: 3,
    sorted: [...sorted],
    i: null,
    l: null,
    r: null,
    sum: null,
    result: [],
    message: `Sort array → [${sorted.join(', ')}]`,
  })

  const result = []

  for (let i = 0; i <= n - 3; i++) {
    if (i > 0 && sorted[i] === sorted[i - 1]) {
      steps.push({
        phase: 'skip_i',
        activeLine: 7,
        sorted: [...sorted],
        i,
        l: null,
        r: null,
        sum: null,
        result: snapshot(),
        message: `Skip duplicate at i=${i}: nums[${i}]=${sorted[i]} equals nums[${i - 1}]=${sorted[i - 1]}.`,
      })
      continue
    }

    let l = i + 1
    let r = n - 1

    steps.push({
      phase: 'fix_i',
      activeLine: 8,
      sorted: [...sorted],
      i,
      l,
      r,
      sum: null,
      result: snapshot(),
      message: `Fix i=${i} (nums[i]=${sorted[i]}). Set l=${l}, r=${r}.`,
    })

    while (l < r) {
      const s = sorted[i] + sorted[l] + sorted[r]

      steps.push({
        phase: 'calc',
        activeLine: 10,
        sorted: [...sorted],
        i,
        l,
        r,
        sum: s,
        result: snapshot(),
        message: `nums[${i}]=${sorted[i]} + nums[${l}]=${sorted[l]} + nums[${r}]=${sorted[r]} = ${s}.`,
      })

      if (s === 0) {
        result.push([sorted[i], sorted[l], sorted[r]])
        steps.push({
          phase: 'found',
          activeLine: 12,
          sorted: [...sorted],
          i,
          l,
          r,
          sum: s,
          result: snapshot(),
          message: `Sum is 0! Triplet [${sorted[i]}, ${sorted[l]}, ${sorted[r]}] added. Total: ${result.length}.`,
        })
        l++
        while (l < r && sorted[l] === sorted[l - 1]) {
          steps.push({
            phase: 'skip_l',
            activeLine: 14,
            sorted: [...sorted],
            i,
            l,
            r,
            sum: s,
            result: snapshot(),
            message: `Skip l-duplicate: nums[${l}]=${sorted[l]} == nums[${l - 1}]=${sorted[l - 1]}. l → ${l + 1}.`,
          })
          l++
        }
      } else if (s < 0) {
        steps.push({
          phase: 'move_l',
          activeLine: 16,
          sorted: [...sorted],
          i,
          l,
          r,
          sum: s,
          result: snapshot(),
          message: `Sum ${s} < 0. Need bigger value. Move l right: ${l} → ${l + 1}.`,
        })
        l++
      } else {
        steps.push({
          phase: 'move_r',
          activeLine: 18,
          sorted: [...sorted],
          i,
          l,
          r,
          sum: s,
          result: snapshot(),
          message: `Sum ${s} > 0. Need smaller value. Move r left: ${r} → ${r - 1}.`,
        })
        r--
      }
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 19,
    sorted: [...sorted],
    i: null,
    l: null,
    r: null,
    sum: null,
    result: snapshot(),
    message: `Done! Found ${result.length} unique triplet(s).`,
  })

  return steps
}

const EXAMPLES = getExamples('three-sum')

export default function ThreeSumVisualizer() {
  const [numsInput, setNumsInput] = useState('[-1,0,1,2,-1,-4]')
  const SOLUTION_CODE_HOOK = useSolutionCode('three-sum')
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { nums, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      if (!Array.isArray(n)) throw new Error('nums must be an array')
      if (n.length > 12) throw new Error('Max 12 elements for clarity')
      return { nums: n, inputError: '' }
    } catch (e) {
      return { nums: [-1, 0, 1, 2, -1, -4], inputError: e.message || 'Invalid input' }
    }
  }, [numsInput])

  const steps = useMemo(() => generateSteps(nums), [nums])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const applyExample = useCallback(
    (ex) => {
      setNumsInput(JSON.stringify(ex.nums))
      handleReset()
    },
    [handleReset],
  )

  const sorted = step?.sorted ?? [...nums].sort((a, b) => a - b)

  const dockPanels = useMemo(
    () => [
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
        title: '🔍 Array & Triplets',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: '#f1f5f9',
                    fontWeight: 500,
                  }}
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Input Array</div>
                <input
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid #cbd5e1',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                  value={numsInput}
                  onChange={(e) => {
                    setNumsInput(e.target.value)
                    handleReset()
                  }}
                  placeholder="[-1,0,1,2,-1,-4]"
                />
                {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Sorted Array · Pointers</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sorted.map((val, idx) => {
                    const isI = step?.i === idx
                    const isL = step?.l === idx
                    const isR = step?.r === idx
                    const isFound = step?.phase === 'found' && (isI || isL || isR)
                    const lifted = isI || isL || isR
                    return (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <motion.div
                          style={{
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 8,
                            fontWeight: 600,
                            fontSize: 14,
                            fontFamily: 'monospace',
                            border: '2px solid',
                            backgroundColor: isFound
                              ? '#dcfce7'
                              : isI
                                ? '#fef3c7'
                                : isL
                                  ? '#dbeafe'
                                  : isR
                                    ? '#fed7aa'
                                    : '#f1f5f9',
                            borderColor: isFound ? '#22c55e' : isI ? '#f59e0b' : isL ? '#0ea5e9' : isR ? '#f97316' : '#cbd5e1',
                            color: isFound ? '#22c55e' : isI ? '#d97706' : isL ? '#0284c7' : isR ? '#ea580c' : '#1e293b',
                          }}
                          animate={{ y: lifted ? -12 : 0, scale: lifted ? 1.15 : 1 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        >
                          {val}
                        </motion.div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{idx}</div>
                        <div style={{ display: 'flex', gap: 2, minHeight: 18 }}>
                          {isI && (
                            <span style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#d97706', padding: '1px 5px', borderRadius: 4 }}>
                              i
                            </span>
                          )}
                          {isL && (
                            <span style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'rgba(14, 165, 233, 0.2)', color: '#0284c7', padding: '1px 5px', borderRadius: 4 }}>
                              l
                            </span>
                          )}
                          {isR && (
                            <span style={{ fontSize: 9, fontWeight: 700, backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#ea580c', padding: '1px 5px', borderRadius: 4 }}>
                              r
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {step?.sum != null && (
                <div style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Sum Calculation</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 13 }}>nums[i] + nums[l] + nums[r] =</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{step.sum}</span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 4,
                        backgroundColor:
                          step.sum === 0 ? 'rgba(34, 197, 94, 0.18)' : step.sum < 0 ? 'rgba(14, 165, 233, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                        color: step.sum === 0 ? '#22c55e' : step.sum < 0 ? '#0284c7' : '#ea580c',
                      }}
                    >
                      {step.sum === 0 ? '= 0 ✓' : step.sum < 0 ? '< 0 → l →' : '> 0 → ← r'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Triplets Found</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <AnimatePresence>
                    {(step?.result ?? []).length > 0 ? (
                      (step?.result ?? []).map((triplet) => (
                        <motion.div
                          key={triplet.join(',')}
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: 6,
                            color: '#22c55e',
                            fontSize: 12,
                            fontFamily: 'monospace',
                          }}
                        >
                          [{triplet.join(', ')}]
                        </motion.div>
                      ))
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
                        No triplets yet
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {step?.message && (
                <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11, color: '#0c4a6e', border: '1px solid #0ea5e9' }}>
                  {step.message}
                </div>
              )}
            </div>
          </div>
        ),
      },
    ],
    [step, sorted, inputError, applyExample, SOLUTION_CODE, connectivity, setActiveLineDom],
  )

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
