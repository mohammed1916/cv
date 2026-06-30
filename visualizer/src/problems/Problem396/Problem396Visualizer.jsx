import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def rotateFunction(nums: list) -> int:' },
  { line: 2, text: '    n = len(nums)' },
  { line: 3, text: '    total_sum = sum(nums)' },
  { line: 4, text: '    current_f = sum(i * nums[i] for i in range(n))' },
  { line: 5, text: '    max_f = current_f' },
  { line: 6, text: '    ' },
  { line: 7, text: '    for k in range(1, n):' },
  { line: 8, text: '        current_f = current_f + total_sum - n * nums[n-k]' },
  { line: 9, text: '        max_f = max(max_f, current_f)' },
  { line: 10, text: '    ' },
  { line: 11, text: '    return max_f' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(numsStr) {
  const steps = []

  try {
    const nums = numsStr.split(',').map(x => {
      const n = Number(x.trim())
      if (isNaN(n)) throw new Error('Invalid number')
      return n
    })

    if (nums.length === 0) {
      steps.push({
        phase: 'done',
        activeLine: 11,
        message: 'Empty array. Return 0.',
        nums: [],
        result: 0,
      })
      return steps
    }

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Initialize. Array: [${nums.join(', ')}], Length: ${nums.length}`,
      nums,
      n: nums.length,
    })

    const n = nums.length
    const totalSum = nums.reduce((a, b) => a + b, 0)

    steps.push({
      phase: 'sum',
      activeLine: 3,
      message: `Calculate total sum: ${nums.join(' + ')} = ${totalSum}`,
      nums,
      n,
      totalSum,
    })

    let currentF = 0
    for (let i = 0; i < n; i++) {
      currentF += i * nums[i]
    }

    steps.push({
      phase: 'initial_f',
      activeLine: 4,
      message: `Calculate F(0): ${Array.from({ length: n }, (_, i) => `${i}*${nums[i]}`).join(' + ')} = ${currentF}`,
      nums,
      n,
      totalSum,
      currentK: 0,
      currentF,
      rotatedNums: [...nums],
      allF: [currentF],
      maxF: currentF,
    })

    let maxF = currentF
    const allF = [currentF]

    for (let k = 1; k < n; k++) {
      steps.push({
        phase: 'rotate_announce',
        activeLine: 7,
        message: `Rotate array. New F(${k}): F(${k-1}) + ${totalSum} - ${n} * nums[${n - k}] (${nums[n - k]})`,
        nums,
        n,
        totalSum,
        currentK: k,
        previousF: currentF,
        removedNum: nums[n - k],
        rotatedNums: Array.from({ length: n }, (_, i) => nums[(i - k + n) % n]),
        allF,
        maxF,
      })

      currentF = currentF + totalSum - n * nums[n - k]
      allF.push(currentF)

      steps.push({
        phase: 'update_f',
        activeLine: 8,
        message: `F(${k}) = ${allF[k - 1]} + ${totalSum} - ${n * nums[n - k]} = ${currentF}`,
        nums,
        n,
        totalSum,
        currentK: k,
        currentF,
        rotatedNums: Array.from({ length: n }, (_, i) => nums[(i - k + n) % n]),
        allF,
        maxF,
      })

      if (currentF > maxF) {
        maxF = currentF

        steps.push({
          phase: 'new_max',
          activeLine: 9,
          message: `New maximum found! F(${k}) = ${currentF} > previous max ${allF[k - 1]}`,
          nums,
          n,
          totalSum,
          currentK: k,
          currentF,
          rotatedNums: Array.from({ length: n }, (_, i) => nums[(i - k + n) % n]),
          allF,
          maxF,
          isNewMax: true,
        })
      } else {
        steps.push({
          phase: 'compare',
          activeLine: 9,
          message: `F(${k}) = ${currentF}. Max remains ${maxF}.`,
          nums,
          n,
          totalSum,
          currentK: k,
          currentF,
          rotatedNums: Array.from({ length: n }, (_, i) => nums[(i - k + n) % n]),
          allF,
          maxF,
        })
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 11,
      message: `Completed. Checked all rotations. Maximum F value: ${maxF}`,
      nums,
      n,
      totalSum,
      currentK: n - 1,
      currentF: allF[n - 1],
      rotatedNums: Array.from({ length: n }, (_, i) => nums[(i - (n - 1) + n) % n]),
      allF,
      maxF,
      result: maxF,
    })

    return steps
  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 0,
      message: `Error: ${e.message}`,
      error: true,
    })
    return steps
  }
}

const EXAMPLES = getExamples('rotate-function') || [
  { label: 'Example 1', nums: '1,2,3,4' },
  { label: 'Example 2', nums: '6,9,28,34,14' },
  { label: 'Example 3', nums: '100,200,300' },
]

export default function Problem396Visualizer() {
  const [numsInput, setNumsInput] = useState('1,2,3,4')

  const { nums, inputError } = useMemo(() => {
    try {
      const parsed = numsInput.split(',').map(x => {
        const n = Number(x.trim())
        if (isNaN(n)) throw new Error('Invalid number in array')
        return n
      })
      return { nums: parsed, inputError: '' }
    } catch (e) {
      return { nums: [1, 2, 3, 4], inputError: e.message }
    }
  }, [numsInput])

  const steps = useMemo(
    () => generateSteps(numsInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [numsInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(ex.nums)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
              Array (comma-separated) {inputError && <span style={{ color: '#f87171' }}>— {inputError}</span>}
            </div>
            <input
              value={numsInput}
              onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
              placeholder="1,2,3,4"
              style={{
                width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px', backgroundColor: '#334155', color: '#e2e8f0',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>
              Current Array (Rotation {step?.currentK ?? 0})
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '50px' }}>
              {step?.rotatedNums && step.rotatedNums.map((num, idx) => (
                <motion.div
                  key={idx}
                  layoutId={`array-${idx}`}
                  style={{
                    width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#334155', color: '#e2e8f0', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 'bold', border: '1px solid #475569'
                  }}
                  animate={{ backgroundColor: '#475569' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {num}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>Index Multipliers</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '50px' }}>
              {step?.rotatedNums && step.rotatedNums.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#1a365d', color: '#60a5fa', borderRadius: '6px', fontSize: '13px',
                    fontWeight: 'bold', border: '1px solid #1e3a8a'
                  }}
                >
                  {idx}
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                Current F Value
              </div>
              <div style={{
                backgroundColor: '#0f172a', padding: '12px', borderRadius: '4px',
                color: '#60a5fa', fontSize: '18px', fontWeight: 'bold', textAlign: 'center'
              }}>
                {step?.currentF ?? '-'}
              </div>
              {step?.currentK !== undefined && (
                <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>
                  F({step.currentK})
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>All F Values</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '40px' }}>
                {step?.allF && step.allF.map((f, k) => (
                  <motion.div
                    key={k}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: step?.maxF === f ? 1.15 : 1, opacity: 1 }}
                    style={{
                      padding: '6px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: step?.maxF === f ? '#10b981' : '#334155',
                      color: step?.maxF === f ? '#ecfdf5' : '#cbd5e1',
                      border: step?.maxF === f ? '2px solid #6ee7b7' : 'none'
                    }}
                  >
                    F({k}):{f}
                  </motion.div>
                ))}
              </div>
            </div>

            {step?.maxF !== undefined && (
              <motion.div
                style={{
                  backgroundColor: '#1f2937', padding: '12px', borderRadius: '8px',
                  border: '2px solid #10b981'
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div style={{ color: '#6ee7b7', fontSize: '11px', marginBottom: '4px' }}>Maximum F</div>
                <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                  {step.maxF}
                </div>
              </motion.div>
            )}
          </div>

          {step?.isNewMax && (
            <motion.div
              style={{
                backgroundColor: '#065f46', padding: '10px', borderRadius: '6px',
                color: '#a7f3d0', fontSize: '12px', textAlign: 'center', fontWeight: 'bold'
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              New Maximum Found!
            </motion.div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
        </div>
      </div>

      <div style={{
        backgroundColor: step?.isNewMax ? '#10b98166' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.isNewMax ? '#86efac' : '#cbd5e1',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div>
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      </div>
    </div>
  )
}
