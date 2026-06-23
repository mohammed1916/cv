import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def removeKdigits(num_str, k):' },
  { line: 2, text: '    if k >= len(num_str):' },
  { line: 3, text: '        return "0"' },
  { line: 4, text: '    ' },
  { line: 5, text: '    stack = []' },
  { line: 6, text: '    ' },
  { line: 7, text: '    for digit in num_str:' },
  { line: 8, text: '        while stack and k > 0 and stack[-1] > digit:' },
  { line: 9, text: '            stack.pop()  # Remove larger digit' },
  { line: 10, text: '            k -= 1' },
  { line: 11, text: '        stack.append(digit)' },
  { line: 12, text: '    ' },
  { line: 13, text: '    if k > 0:' },
  { line: 14, text: '        stack = stack[:-k]  # Remove remaining from end' },
  { line: 15, text: '    ' },
  { line: 16, text: '    result = "".join(stack).lstrip("0")' },
  { line: 17, text: '    return result if result else "0"' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(numStr, kStr) {
  const steps = []

  try {
    const digits = numStr.split('')
    let k = Number(kStr)

    if (isNaN(k) || k < 0) throw new Error('k must be non-negative')
    if (k > digits.length) k = digits.length

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Remove ${k} digit(s) from "${numStr}" to form smallest number`,
      num: numStr,
      k,
      digits,
      stack: [],
      kRemaining: k,
    })

    if (k >= digits.length) {
      steps.push({
        phase: 'done',
        activeLine: 3,
        message: `k >= length. Result: "0"`,
        num: numStr,
        k,
        result: '0',
      })
      return steps
    }

    steps.push({
      phase: 'init_stack',
      activeLine: 5,
      message: `Initialize empty stack. Use greedy approach: remove larger digits when smaller ones follow.`,
      num: numStr,
      k,
      digits,
      stack: [],
      kRemaining: k,
    })

    let stack = []
    let kRemaining = k

    for (let i = 0; i < digits.length; i++) {
      const digit = digits[i]

      steps.push({
        phase: 'process',
        activeLine: 7,
        message: `Process digit ${i}: "${digit}"`,
        num: numStr,
        k,
        digits,
        currentIdx: i,
        stack: [...stack],
        kRemaining,
        currentDigit: digit,
      })

      while (stack.length > 0 && kRemaining > 0 && stack[stack.length - 1] > digit) {
        const removed = stack.pop()
        kRemaining--

        steps.push({
          phase: 'pop',
          activeLine: 9,
          message: `Top "${removed}" > current "${digit}". Pop and decrement k to ${kRemaining}.`,
          num: numStr,
          k,
          digits,
          currentIdx: i,
          stack: [...stack],
          kRemaining,
          currentDigit: digit,
          removed,
        })
      }

      stack.push(digit)

      steps.push({
        phase: 'push',
        activeLine: 11,
        message: `Push "${digit}". Stack: [${stack.join(', ')}]`,
        num: numStr,
        k,
        digits,
        currentIdx: i,
        stack: [...stack],
        kRemaining,
        currentDigit: digit,
      })
    }

    steps.push({
      phase: 'loop_done',
      activeLine: 13,
      message: `Processed all digits. Remaining k=${kRemaining}`,
      num: numStr,
      k,
      digits,
      stack: [...stack],
      kRemaining,
    })

    if (kRemaining > 0) {
      const originalStack = [...stack]
      stack = stack.slice(0, stack.length - kRemaining)

      steps.push({
        phase: 'trim_end',
        activeLine: 14,
        message: `Still need to remove ${kRemaining} digit(s). Remove from end: [${originalStack.join(', ')}] → [${stack.join(', ')}]`,
        num: numStr,
        k,
        digits,
        stack: [...stack],
        kRemaining: 0,
      })
    }

    let result = stack.join('')
    result = result.replace(/^0+/, '') || '0'

    steps.push({
      phase: 'trim_zeros',
      activeLine: 16,
      message: `Remove leading zeros and return: "${result}"`,
      num: numStr,
      k,
      digits,
      stack,
      result,
    })

    steps.push({
      phase: 'done',
      activeLine: 17,
      message: `Final result: "${result}"`,
      num: numStr,
      k,
      result,
    })

  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamples('remove-k-digits') || [
  { label: 'Example 1', num: '1432219', k: '3' },
  { label: 'Example 2', num: '10200', k: '1' },
  { label: 'Example 3', num: '112', k: '1' },
]

export default function Problem402Visualizer() {
  const [numInput, setNumInput] = useState('1432219')
  const [kInput, setKInput] = useState('3')

  const { num, k, inputError } = useMemo(() => {
    try {
      if (!/^\d+$/.test(numInput)) throw new Error('Number must contain only digits')
      const k_val = Number(kInput)
      if (isNaN(k_val) || k_val < 0) throw new Error('k must be non-negative')
      return { num: numInput, k: k_val, inputError: '' }
    } catch (e) {
      return { num: '1432219', k: 3, inputError: e.message || 'Invalid input' }
    }
  }, [numInput, kInput])

  const steps = useMemo(
    () => generateSteps(numInput, kInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [numInput, kInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumInput(ex.num)
    setKInput(ex.k)
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
          <div style={{ display: 'flex', gap: 12, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Number</div>
              <input
                value={numInput}
                onChange={(e) => { setNumInput(e.target.value); handleReset() }}
                placeholder="1432219"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
            <div style={{ width: '80px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Remove (k)</div>
              <input
                value={kInput}
                onChange={(e) => { setKInput(e.target.value); handleReset() }}
                placeholder="3"
                type="number"
                min="0"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
          </div>

          {inputError && (
            <div style={{ color: '#f87171', fontSize: '12px' }}>{inputError}</div>
          )}

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
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Digits</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {step?.digits?.map((digit, idx) => {
                const inStack = step?.stack?.includes(digit) && idx < step.currentIdx
                const isCurrent = idx === step?.currentIdx

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isCurrent ? 1.2 : 1 }}
                    style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isCurrent ? '#a78bfa' : '#334155',
                      color: '#e2e8f0', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold',
                      border: isCurrent ? '2px solid #8b5cf6' : 'none',
                      opacity: step?.phase === 'trim_end' || step?.phase === 'trim_zeros' || step?.phase === 'done' ? 0.5 : 1
                    }}
                  >
                    {digit}
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Stack</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {(!step?.stack || step.stack.length === 0) ? (
                <div style={{ color: '#64748b', fontSize: '12px' }}>Empty</div>
              ) : (
                step.stack.map((digit, idx) => (
                  <motion.div
                    key={`${digit}-${idx}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: '#06b6d4', color: '#1e293b', borderRadius: '6px',
                      fontSize: '13px', fontWeight: 'bold'
                    }}
                  >
                    {digit}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>K Remaining</div>
                <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', color: '#a78bfa', fontWeight: 'bold', textAlign: 'center' }}>
                  {step?.kRemaining ?? step?.k ?? 0}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Current Index</div>
                <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', color: '#cbd5e1', fontWeight: 'bold', textAlign: 'center' }}>
                  {step?.currentIdx !== undefined ? step.currentIdx : '-'}
                </div>
              </div>
            </div>

            {step?.removed && (
              <div style={{ backgroundColor: '#ef444466', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Removed</div>
                <div style={{ color: '#fca5a5', fontSize: '16px', fontWeight: 'bold' }}>
                  {step.removed}
                </div>
              </div>
            )}

            {step?.result && (
              <div style={{ backgroundColor: '#a78bfa66', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Result</div>
                <div style={{ color: '#a78bfa', fontSize: '20px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {step.result}
                </div>
              </div>
            )}
          </div>
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
        backgroundColor: step?.phase === 'done' ? '#10b98166' : step?.error ? '#ef444466' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.phase === 'done' ? '#86efac' : step?.error ? '#fca5a5' : '#cbd5e1',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div>
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
      </div>

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
