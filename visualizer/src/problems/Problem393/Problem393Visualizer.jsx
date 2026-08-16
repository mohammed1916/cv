import ManualInputPanel from '../../components/shared/ManualInputPanel'
﻿import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = ['ascii', 'check_start', 'continuation', 'decrement', 'done', 'final_check', 'init', 'invalid', 'loop', 'multibyte']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'loop',
  8: 'check_start',
  9: 'ascii',
  11: 'multibyte',
  14: 'invalid',
  15: 'continuation',
  16: 'invalid',
  18: 'decrement',
  20: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def validUtf8(self, data: List[int]) -> bool:' },
  { line: 3, text: '        n_bytes = 0' },
  { line: 4, text: '        ' },
  { line: 5, text: '        for num in data:' },
  { line: 6, text: '            byte = num & 0xFF  # Get last 8 bits' },
  { line: 7, text: '            ' },
  { line: 8, text: '            if n_bytes == 0:' },
  { line: 9, text: '                if (byte >> 7) & 1 == 0:' },
  { line: 10, text: '                    continue  # 1-byte char' },
  { line: 11, text: '                elif (byte >> 6) & 0b11 == 0b11:' },
  { line: 12, text: '                    n_bytes = bin(byte).count("1") - 1' },
  { line: 13, text: '                else:' },
  { line: 14, text: '                    return False' },
  { line: 15, text: '            else:' },
  { line: 16, text: '                if (byte >> 6) & 0b11 != 0b10:' },
  { line: 17, text: '                    return False' },
  { line: 18, text: '                n_bytes -= 1' },
  { line: 19, text: '        ' },
  { line: 20, text: '        return n_bytes == 0' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(data) {
  const steps = []

  if (!data || data.length === 0) {
    steps.push({
      phase: 'done', activeLine: 20, message: 'No bytes provided. Valid UTF-8. Return True.',
      isValid: true, nBytes: 0, processedCount: 0
    })
    return steps
  }

  steps.push({
    phase: 'init', activeLine: 3, message: 'Initialize n_bytes = 0. Start validating UTF-8 sequences.',
    data, nBytes: 0, processedCount: 0
  })

  let nBytes = 0
  let isValid = true

  for (let i = 0; i < data.length; i++) {
    const num = data[i]
    const byte = num & 0xFF
    const bits = byte.toString(2).padStart(8, '0')

    steps.push({
      phase: 'loop', activeLine: 5,
      message: `Process byte ${i}: ${byte} (${bits})`,
      data, nBytes, processedCount: i, currentIdx: i, currentByte: byte, byteStr: bits
    })

    if (nBytes === 0) {
      steps.push({
        phase: 'check_start', activeLine: 8,
        message: `n_bytes == 0. Check if this is a start byte.`,
        data, nBytes, processedCount: i, currentIdx: i, currentByte: byte, byteStr: bits
      })

      const isASCII = (byte >> 7) & 1
      if (!isASCII) {
        steps.push({
          phase: 'ascii', activeLine: 9,
          message: `Start bit is 0. This is a 1-byte ASCII character.`,
          data, nBytes, processedCount: i + 1, currentIdx: i, currentByte: byte, byteStr: bits
        })
        continue
      }

      const top2Bits = (byte >> 6) & 0b11
      if (top2Bits === 0b11) {
        const numOnes = bits.split('').findIndex((b, idx) => idx > 0 && b === '0') || bits.length
        nBytes = numOnes - 1

        steps.push({
          phase: 'multibyte', activeLine: 11,
          message: `Top 2 bits are 11. This is a ${nBytes + 1}-byte character. Set n_bytes = ${nBytes}.`,
          data, nBytes, processedCount: i + 1, currentIdx: i, currentByte: byte, byteStr: bits
        })
      } else {
        steps.push({
          phase: 'invalid', activeLine: 14,
          message: `Invalid start byte. Return False.`,
          data, nBytes, processedCount: i, isValid: false, currentIdx: i, currentByte: byte, byteStr: bits
        })
        return steps
      }
    } else {
      steps.push({
        phase: 'continuation', activeLine: 15,
        message: `n_bytes = ${nBytes}. Expecting continuation byte (10xxxxxx).`,
        data, nBytes, processedCount: i, currentIdx: i, currentByte: byte, byteStr: bits
      })

      const top2Bits = (byte >> 6) & 0b11
      if (top2Bits !== 0b10) {
        steps.push({
          phase: 'invalid', activeLine: 16,
          message: `Top 2 bits are not 10. Invalid UTF-8. Return False.`,
          data, nBytes, processedCount: i, isValid: false, currentIdx: i, currentByte: byte, byteStr: bits
        })
        return steps
      }

      nBytes--
      steps.push({
        phase: 'decrement', activeLine: 18,
        message: `Valid continuation byte. n_bytes decremented to ${nBytes}.`,
        data, nBytes, processedCount: i + 1, currentIdx: i, currentByte: byte, byteStr: bits
      })
    }
  }

  steps.push({
    phase: 'final_check', activeLine: 20,
    message: `All bytes processed. n_bytes = ${nBytes}. ${nBytes === 0 ? 'Valid UTF-8. Return True.' : 'Incomplete sequence. Return False.'}`,
    data, nBytes, processedCount: data.length, isValid: nBytes === 0
  })

  return steps
}

const EXAMPLES = getExamplesOr('utf-8-validation', [
  { label: 'Example 1', data: [197, 130, 1] },
  { label: 'Example 2', data: [235, 140, 4] },
  { label: 'Example 3', data: [145] },
])

export default function Problem393Visualizer() {
  const [dataInput, setDataInput] = useState('[197, 130, 1]')

  const { data, inputError } = useMemo(() => {
    try {
      const d = JSON.parse(dataInput)
      if (!Array.isArray(d)) throw new Error('Input must be an array')
      if (d.some(x => !Number.isInteger(x) || x < 0 || x > 255)) {
        throw new Error('Each element must be 0-255')
      }
      return { data: d, inputError: '' }
    } catch (e) {
      return { data: [197, 130, 1], inputError: e.message || 'Invalid input' }
    }
  }, [dataInput])

  const steps = useMemo(
    () => generateSteps(data).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [data],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setDataInput(JSON.stringify(ex.data))
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <ManualInputPanel
        fields={[{"key":"data","label":"data","type":"array"}]}
        values={{ data: dataInput }}
        onChange={(k, v) => { if (k === 'data') setDataInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ backgroundColor: 'var(--surface2)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>
              Byte Array {inputError && <span style={{ color: '#ea0c0c' }}>— {inputError}</span>}
            </div>
            <input
              value={dataInput}
              onChange={(e) => { setDataInput(e.target.value); handleReset() }}
              placeholder="[197, 130, 1]"
              style={{
                width: '100%', padding: '8px', backgroundColor: 'var(--code-bg)', color: 'var(--text)',
                border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px', backgroundColor: 'var(--border)', color: 'var(--text)',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: 'var(--surface2)', padding: '12px', borderRadius: '8px', flex: 1, overflowY: 'auto' }}>
            <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>Bytes</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.map((byte, idx) => {
                const bits = byte.toString(2).padStart(8, '0')
                const isCurrentIdx = idx === step?.currentIdx
                const isProcessed = idx < (step?.processedCount ?? 0)

                let bgColor = 'var(--border)'
                if (isCurrentIdx) bgColor = '#f59e0b'
                else if (isProcessed) bgColor = '#10b98166'

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: bgColor, padding: '8px', borderRadius: '4px',
                      border: isCurrentIdx ? '2px solid #fbbf24' : 'none'
                    }}
                  >
                    <div style={{ color: '#5577a4', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                      [{idx}] {byte.toString().padStart(3, ' ')} = {bits}
                    </div>
                    {isCurrentIdx && step?.byteStr && (
                      <div style={{ color: '#5a779b', fontSize: '11px', marginTop: '4px' }}>
                        Binary: {step.byteStr}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {step && (
            <div style={{ display: 'flex', gap: 12, fontSize: '13px' }}>
              <div style={{ backgroundColor: 'var(--surface2)', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)' }}>n_bytes: </span>
                <span style={{ color: '#0870f0', fontWeight: 'bold' }}>{step.nBytes}</span>
              </div>
              <div style={{ backgroundColor: step?.isValid ? '#10b98166' : step?.isValid === false ? '#ef444466' : 'var(--surface2)', padding: '8px', borderRadius: '4px', flex: 1, textAlign: 'center' }}>
                <span style={{ color: step?.isValid ? '#86efac' : step?.isValid === false ? '#fca5a5' : 'var(--border)', fontWeight: 'bold' }}>
                  {step?.isValid === true ? 'Valid UTF-8' : step?.isValid === false ? 'Invalid UTF-8' : '...'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
                    <div style={{ position: "relative" }}>
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
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: step?.isValid === true ? '#10b98166' : step?.isValid === false ? '#ef444466' : 'var(--surface2)',
        padding: '12px', borderRadius: '6px', color: step?.isValid === true ? '#86efac' : step?.isValid === false ? '#fca5a5' : 'var(--border)',
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
