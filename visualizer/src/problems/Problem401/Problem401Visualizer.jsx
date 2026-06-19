import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE = [
  { line: 1, text: 'def readBinaryWatch(n):' },
  { line: 2, text: '    def countBits(num):' },
  { line: 3, text: '        return bin(num).count("1")' },
  { line: 4, text: '    ' },
  { line: 5, text: '    times = []' },
  { line: 6, text: '    for h in range(12):  # Hours: 0-11' },
  { line: 7, text: '        for m in range(60):  # Minutes: 0-59' },
  { line: 8, text: '            if countBits(h) + countBits(m) == n:' },
  { line: 9, text: '                times.append(f"{h}:{m:02d}")' },
  { line: 10, text: '    return times' },
]

function generateSteps(nStr) {
  const steps = []

  try {
    const n = Number(nStr)
    if (isNaN(n) || n < 0 || n > 11) throw new Error('n must be between 0 and 11')

    steps.push({
      phase: 'init',
      activeLine: 1,
      message: `Find all times with exactly ${n} LED(s) lit`,
      n,
      validTimes: [],
      totalChecked: 0,
    })

    const validTimes = []
    let checked = 0

    // Check hours
    const hourBitCounts = {}
    for (let h = 0; h < 12; h++) {
      const bits = h.toString(2).split('').filter(b => b === '1').length
      hourBitCounts[h] = bits
    }

    steps.push({
      phase: 'hour_bits',
      activeLine: 6,
      message: `Hour LED counts: ${Object.entries(hourBitCounts).map(([h, c]) => `${h}:${c}`).join(', ')}`,
      n,
      hourBitCounts,
      validTimes: [],
      totalChecked: 0,
    })

    // Check all hours and minutes
    for (let h = 0; h < 12; h++) {
      const hBits = hourBitCounts[h]

      for (let m = 0; m < 60; m++) {
        const mBits = m.toString(2).split('').filter(b => b === '1').length
        const totalBits = hBits + mBits

        checked++

        if (totalBits === n) {
          const timeStr = `${h}:${m < 10 ? '0' + m : m}`
          validTimes.push(timeStr)

          steps.push({
            phase: 'match_found',
            activeLine: 8,
            message: `Match! ${h}:${m < 10 ? '0' + m : m} → ${h} (${hBits} bits) + ${m} (${mBits} bits) = ${totalBits}`,
            n,
            currentH: h,
            currentM: m,
            hBits,
            mBits,
            validTimes: [...validTimes],
            totalChecked: checked,
          })
        }
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 10,
      message: `Found ${validTimes.length} valid time(s) from ${checked} combinations`,
      n,
      validTimes,
      totalChecked: checked,
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

const EXAMPLES = getExamples('binary-watch') || [
  { label: 'Example 1: n=1', n: '1' },
  { label: 'Example 2: n=0', n: '0' },
  { label: 'Example 3: n=3', n: '3' },
]

export default function Problem401Visualizer() {
  const [nInput, setNInput] = useState('1')

  const { n, inputError } = useMemo(() => {
    try {
      const val = Number(nInput)
      if (isNaN(val) || val < 0 || val > 11) throw new Error('n must be 0-11')
      return { n: val, inputError: '' }
    } catch (e) {
      return { n: 1, inputError: e.message || 'Invalid input' }
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

  const renderBinaryWatch = (hour, minute) => {
    const hourBits = hour.toString(2).padStart(4, '0')
    const minuteBits = minute.toString(2).padStart(6, '0')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {hourBits.split('').map((bit, idx) => (
            <div
              key={`h${idx}`}
              style={{
                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: bit === '1' ? '#10b981' : '#334155',
                color: '#e2e8f0', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold'
              }}
            >
              {bit}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {minuteBits.split('').map((bit, idx) => (
            <div
              key={`m${idx}`}
              style={{
                width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: bit === '1' ? '#10b981' : '#334155',
                color: '#e2e8f0', borderRadius: '3px', fontSize: '11px', fontWeight: 'bold'
              }}
            >
              {bit}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ width: '120px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>LEDs Count (n)</div>
              <input
                value={nInput}
                onChange={(e) => { setNInput(e.target.value); handleReset() }}
                placeholder="1"
                type="number"
                min="0"
                max="11"
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

          {step?.currentH !== undefined && step?.currentM !== undefined && (
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>
                Current Time: {step.currentH}:{step.currentM < 10 ? '0' + step.currentM : step.currentM}
              </div>
              {renderBinaryWatch(step.currentH, step.currentM)}
              {step?.hBits !== undefined && step?.mBits !== undefined && (
                <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '12px' }}>
                  Hour bits: {step.hBits}, Minute bits: {step.mBits}, Total: {step.hBits + step.mBits}
                </div>
              )}
            </div>
          )}

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Valid Times ({step?.validTimes?.length || 0})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: '200px', overflow: 'auto' }}>
                {step?.validTimes?.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '12px' }}>No valid times yet</div>
                ) : (
                  step?.validTimes?.map((time, idx) => (
                    <motion.div
                      key={time + idx}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      style={{
                        backgroundColor: '#334155', padding: '6px 8px', borderRadius: '4px',
                        color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '12px'
                      }}
                    >
                      {time}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {step?.totalChecked !== undefined && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Progress</div>
                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
                  {step.totalChecked} / 720 combinations checked
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#1e293b', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', backgroundColor: '#10b981',
                    width: `${(step.totalChecked / 720) * 100}%`
                  }} />
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
