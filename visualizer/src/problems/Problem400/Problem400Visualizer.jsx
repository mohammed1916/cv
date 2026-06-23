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
  { line: 1, text: 'def findNthDigit(n):' },
  { line: 2, text: '    # Length of numbers: 1-9 (len 1), 10-99 (len 2), etc.' },
  { line: 3, text: '    length = 1' },
  { line: 4, text: '    count = 9  # Count of numbers with this length' },
  { line: 5, text: '    start = 1  # First number with this length' },
  { line: 6, text: '    ' },
  { line: 7, text: '    while n > length * count:' },
  { line: 8, text: '        n -= length * count' },
  { line: 9, text: '        length += 1' },
  { line: 10, text: '        count *= 10' },
  { line: 11, text: '        start *= 10' },
  { line: 12, text: '    ' },
  { line: 13, text: '    num = start + (n - 1) // length' },
  { line: 14, text: '    digit_index = (n - 1) % length' },
  { line: 15, text: '    return int(str(num)[digit_index])' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nStr) {
  const steps = []

  try {
    const n = Number(nStr)
    if (isNaN(n) || n < 1) throw new Error('n must be a positive integer')

    // Build sequence for visualization
    let sequence = ''
    let sequenceData = []
    for (let i = 1; i <= 100 && sequence.length < 200; i++) {
      const str = i.toString()
      for (const ch of str) {
        sequence += ch
        sequenceData.push({ digit: ch, source: i })
      }
    }

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Find the ${n}th digit in sequence: 123456789101112131415...`,
      n,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    // Simulate algorithm
    let remaining = n
    let length = 1
    let count = 9
    let start = 1

    steps.push({
      phase: 'init_vars',
      activeLine: 3,
      message: `Initialize: length=1 (1-digit numbers), count=9, start=1`,
      n,
      length,
      count,
      start,
      remaining,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    // Find which length group contains n
    while (remaining > length * count) {
      const totalDigits = length * count
      steps.push({
        phase: 'check_range',
        activeLine: 7,
        message: `${remaining} > ${length} × ${count} = ${totalDigits}? Yes. Move to next range.`,
        n,
        length,
        count,
        start,
        remaining,
        currentRange: { start, end: start + count - 1, digitCount: length },
        skipped: totalDigits,
      })

      remaining -= totalDigits
      length += 1
      count *= 10
      start *= 10

      steps.push({
        phase: 'range_update',
        activeLine: 9,
        message: `Now checking ${start}-digit numbers (${start} to ${start + count - 1}). Remaining: ${remaining}`,
        n,
        length,
        count,
        start,
        remaining,
        currentRange: { start, end: start + count - 1, digitCount: length },
      })
    }

    // Find exact position
    steps.push({
      phase: 'find_number',
      activeLine: 13,
      message: `Found range! Length=${length}, Count=${count}, Start=${start}. Remaining=${remaining}`,
      n,
      length,
      count,
      start,
      remaining,
      currentRange: { start, end: start + count - 1, digitCount: length },
    })

    const num = start + Math.floor((remaining - 1) / length)
    const digitIdx = (remaining - 1) % length

    steps.push({
      phase: 'calculate',
      activeLine: 13,
      message: `Number: ${start} + ⌊(${remaining} - 1) / ${length}⌋ = ${num}`,
      n,
      length,
      count,
      start,
      remaining,
      num,
      digitIdx,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    const numStr = num.toString()
    const result = parseInt(numStr[digitIdx])

    steps.push({
      phase: 'extract_digit',
      activeLine: 15,
      message: `Number ${num}: [${numStr.split('').join(', ')}]. Index ${digitIdx} → Digit: ${result}`,
      n,
      num,
      numStr,
      digitIdx,
      result,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
    })

    steps.push({
      phase: 'done',
      activeLine: 15,
      message: `The ${n}th digit is: ${result}`,
      n,
      result,
      sequence: sequence.substring(0, Math.min(n + 20, sequence.length)),
      targetPos: n - 1,
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

const EXAMPLES = getExamples('nth-digit') || [
  { label: 'Example 1', n: '3' },
  { label: 'Example 2', n: '10' },
  { label: 'Example 3', n: '15' },
]

export default function Problem400Visualizer() {
  const [nInput, setNInput] = useState('3')

  const { n, inputError } = useMemo(() => {
    try {
      const val = Number(nInput)
      if (isNaN(val) || val < 1) throw new Error('n must be a positive integer')
      return { n: val, inputError: '' }
    } catch (e) {
      return { n: 3, inputError: e.message || 'Invalid input' }
    }
  }, [nInput])

  const steps = useMemo(
    () => generateSteps(nInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [nInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNInput(ex.n)
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
            <div style={{ width: '120px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Position (n)</div>
              <input
                value={nInput}
                onChange={(e) => { setNInput(e.target.value); handleReset() }}
                placeholder="3"
                type="number"
                min="1"
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
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Digit Sequence</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', fontFamily: 'monospace', fontSize: '12px' }}>
              {step?.sequence?.split('').map((digit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: idx === step?.targetPos ? 1.2 : 1 }}
                  style={{
                    width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: idx === step?.targetPos ? '#fbbf24' : '#334155',
                    color: idx === step?.targetPos ? '#1e293b' : '#e2e8f0',
                    borderRadius: '3px', fontWeight: 'bold',
                    border: idx === step?.targetPos ? '2px solid #f59e0b' : 'none',
                  }}
                >
                  {digit}
                </motion.div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Algorithm State</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {step?.length !== undefined && (
                  <div style={{ backgroundColor: '#334155', padding: '6px', borderRadius: '3px', color: '#cbd5e1', fontSize: '11px' }}>
                    <span style={{ color: '#94a3b8' }}>Length:</span> {step.length}
                  </div>
                )}
                {step?.count !== undefined && (
                  <div style={{ backgroundColor: '#334155', padding: '6px', borderRadius: '3px', color: '#cbd5e1', fontSize: '11px' }}>
                    <span style={{ color: '#94a3b8' }}>Count:</span> {step.count}
                  </div>
                )}
                {step?.start !== undefined && (
                  <div style={{ backgroundColor: '#334155', padding: '6px', borderRadius: '3px', color: '#cbd5e1', fontSize: '11px' }}>
                    <span style={{ color: '#94a3b8' }}>Start:</span> {step.start}
                  </div>
                )}
                {step?.remaining !== undefined && (
                  <div style={{ backgroundColor: '#334155', padding: '6px', borderRadius: '3px', color: '#fbbf24', fontSize: '11px' }}>
                    <span style={{ color: '#94a3b8' }}>Remaining:</span> {step.remaining}
                  </div>
                )}
              </div>
            </div>

            {step?.currentRange && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Current Range</div>
                <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', fontSize: '12px', color: '#cbd5e1' }}>
                  Numbers: {step.currentRange.start} - {step.currentRange.end}
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Each has {step.currentRange.digitCount} digit(s)
                  </div>
                </div>
              </div>
            )}

            {step?.num !== undefined && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Target Number</div>
                <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', fontSize: '14px', color: '#fbbf24', fontWeight: 'bold' }}>
                  {step.num}
                </div>
              </div>
            )}

            {step?.numStr && (
              <div>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '4px' }}>Digits in Number</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {step.numStr.split('').map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: idx === step.digitIdx ? '#fbbf24' : '#334155',
                        color: idx === step.digitIdx ? '#1e293b' : '#e2e8f0',
                        borderRadius: '4px', fontWeight: 'bold', fontSize: '12px'
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step?.result !== undefined && (
              <div style={{ backgroundColor: '#fbbf2466', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Result</div>
                <div style={{ color: '#fbbf24', fontSize: '24px', fontWeight: 'bold' }}>
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
