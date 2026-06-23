import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isSubsequence(self, s: str, t: str) -> bool:' },
  { line: 3, text: '        if not s:' },
  { line: 4, text: '            return True' },
  { line: 5, text: '        ' },
  { line: 6, text: '        s_idx = 0' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for char in t:' },
  { line: 9, text: '            if char == s[s_idx]:' },
  { line: 10, text: '                s_idx += 1' },
  { line: 11, text: '            ' },
  { line: 12, text: '            if s_idx == len(s):' },
  { line: 13, text: '                return True' },
  { line: 14, text: '        ' },
  { line: 15, text: '        return False' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s, t) {
  const steps = []

  if (!s) {
    steps.push({
      phase: 'done', activeLine: 4, message: 's is empty. Any string is a subsequence of empty string. Return True.',
      isSubsequence: true, sIdx: 0, tIdx: 0
    })
    return steps
  }

  steps.push({
    phase: 'init', activeLine: 6, message: `Initialize s_idx = 0. Looking for "${s}" in "${t}".`,
    s, t, sIdx: 0, tIdx: 0
  })

  let sIdx = 0
  let found = false

  for (let tIdx = 0; tIdx < t.length; tIdx++) {
    steps.push({
      phase: 'loop', activeLine: 8,
      message: `Iterate: char = t[${tIdx}] = '${t[tIdx]}'`,
      s, t, sIdx, tIdx, currentChar: t[tIdx]
    })

    if (t[tIdx] === s[sIdx]) {
      steps.push({
        phase: 'match', activeLine: 9,
        message: `Match! '${t[tIdx]}' == s[${sIdx}] = '${s[sIdx]}'. Advance s_idx.`,
        s, t, sIdx, tIdx, currentChar: t[tIdx], matched: true
      })

      sIdx++

      steps.push({
        phase: 'increment', activeLine: 10,
        message: `s_idx incremented to ${sIdx}.`,
        s, t, sIdx, tIdx, currentChar: t[tIdx]
      })

      if (sIdx === s.length) {
        steps.push({
          phase: 'found', activeLine: 12,
          message: `s_idx (${sIdx}) == len(s) (${s.length}). All characters matched! Return True.`,
          s, t, sIdx, tIdx, isSubsequence: true
        })
        return steps
      }
    } else {
      steps.push({
        phase: 'no_match', activeLine: 9,
        message: `No match: '${t[tIdx]}' != s[${sIdx}] = '${s[sIdx]}'. Continue.`,
        s, t, sIdx, tIdx, currentChar: t[tIdx], matched: false
      })
    }
  }

  steps.push({
    phase: 'done', activeLine: 15,
    message: `End of t reached. Not all characters matched. Return False.`,
    s, t, sIdx, tIdx: t.length, isSubsequence: false
  })

  return steps
}

const EXAMPLES = getExamples('is-subsequence') || [
  { label: 'Example 1', s: 'abc', t: 'ahbgdc' },
  { label: 'Example 2', s: 'axc', t: 'ahbgdc' },
  { label: 'Example 3', s: '', t: 'abc' },
]

export default function Problem392Visualizer() {
  const [sInput, setSInput] = useState('abc')
  const [tInput, setTInput] = useState('ahbgdc')

  const { s, t, inputError } = useMemo(() => {
    try {
      return { s: sInput, t: tInput, inputError: '' }
    } catch (e) {
      return { s: 'abc', t: 'ahbgdc', inputError: e.message || 'Invalid input' }
    }
  }, [sInput, tInput])

  const steps = useMemo(
    () => generateSteps(s, t).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, t],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSInput(ex.s)
    setTInput(ex.t)
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
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Subsequence (s)</div>
              <input
                value={sInput}
                onChange={(e) => { setSInput(e.target.value); handleReset() }}
                placeholder="abc"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Text (t)</div>
              <input
                value={tInput}
                onChange={(e) => { setTInput(e.target.value); handleReset() }}
                placeholder="ahbgdc"
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
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Subsequence: {s}</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {s.split('').map((char, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: idx < (step?.sIdx ?? 0) ? '#10b981' : '#334155',
                    color: '#e2e8f0', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold'
                  }}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', flex: 1, overflowY: 'auto' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Text: {t}</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {t.split('').map((char, idx) => {
                const isCurrentChar = idx === step?.tIdx
                const isMatched = step?.matched && idx === step?.tIdx
                const isProcessed = idx < (step?.tIdx ?? 0)

                let bgColor = '#334155'
                if (isMatched) bgColor = '#10b981'
                else if (isCurrentChar) bgColor = '#f59e0b'
                else if (isProcessed) bgColor = '#64748b'

                return (
                  <div
                    key={idx}
                    style={{
                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: bgColor, color: '#e2e8f0', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold',
                      border: isCurrentChar ? '2px solid #fbbf24' : 'none'
                    }}
                  >
                    {char}
                  </div>
                )
              })}
            </div>
          </div>

          {step && (
            <div style={{ display: 'flex', gap: 12, fontSize: '13px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: '#64748b' }}>s_idx: </span>
                <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{step.sIdx}/{s.length}</span>
              </div>
              <div style={{ backgroundColor: step?.isSubsequence ? '#10b98166' : step?.isSubsequence === false ? '#ef444466' : '#1e293b', padding: '8px', borderRadius: '4px', flex: 1, textAlign: 'center' }}>
                <span style={{ color: step?.isSubsequence ? '#86efac' : step?.isSubsequence === false ? '#fca5a5' : '#cbd5e1', fontWeight: 'bold' }}>
                  {step?.isSubsequence === true ? 'Subsequence Found' : step?.isSubsequence === false ? 'Not Subsequence' : '...'}
                </span>
              </div>
            </div>
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
        backgroundColor: step?.isSubsequence === true ? '#10b98166' : step?.isSubsequence === false ? '#ef444466' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.isSubsequence === true ? '#86efac' : step?.isSubsequence === false ? '#fca5a5' : '#cbd5e1',
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
