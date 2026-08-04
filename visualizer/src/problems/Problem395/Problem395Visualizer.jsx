import { useState, useCallback, useMemo } from 'react'
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

const PATTERNS = ['count', 'done', 'init', 'invalid', 'recurse', 'sub_invalid', 'sub_valid', 'valid']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  4: 'done',
  7: 'init',
  8: 'count',
  11: 'invalid',
  13: 'done',
  14: 'recurse',
  15: 'done',
  18: 'valid',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def longestSubstring(self, s: str, k: int) -> int:' },
  { line: 3, text: '        if len(s) < k:' },
  { line: 4, text: '            return 0' },
  { line: 5, text: '        ' },
  { line: 6, text: '        # Use divide and conquer' },
  { line: 7, text: '        from collections import Counter' },
  { line: 8, text: '        counter = Counter(s)' },
  { line: 9, text: '        ' },
  { line: 10, text: '        for char, count in counter.items():' },
  { line: 11, text: '            if count < k:' },
  { line: 12, text: '                # Split by this character' },
  { line: 13, text: '                return max(' },
  { line: 14, text: '                    (self.longestSubstring(sub, k) for sub in s.split(char)),' },
  { line: 15, text: '                    default=0' },
  { line: 16, text: '                )' },
  { line: 17, text: '        ' },
  { line: 18, text: '        return len(s)  # All chars meet requirement' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s, k) {
  const steps = []

  if (s.length < k) {
    steps.push({
      phase: 'done', activeLine: 4, message: `String length (${s.length}) < k (${k}). Return 0.`,
      result: 0, k, currentStr: s, isValid: false
    })
    return steps
  }

  steps.push({
    phase: 'init', activeLine: 7, message: `Initialize. Looking for longest substring where all chars repeat ≥ ${k} times.`,
    s, k, currentStr: s, depth: 0
  })

  // Simple recursive simulation
  const freq = {}
  for (const char of s) {
    freq[char] = (freq[char] || 0) + 1
  }

  steps.push({
    phase: 'count', activeLine: 8, message: `Count frequencies: ${Object.entries(freq).map(([c, f]) => `'${c}':${f}`).join(', ')}`,
    s, k, currentStr: s, freq, depth: 0
  })

  const invalidChars = Object.entries(freq).filter(([_, count]) => count < k).map(([char]) => char)

  if (invalidChars.length === 0) {
    steps.push({
      phase: 'valid', activeLine: 18, message: `All characters appear ≥ ${k} times. Return length: ${s.length}.`,
      s, k, currentStr: s, freq, isValid: true, result: s.length, depth: 0
    })
  } else {
    steps.push({
      phase: 'invalid', activeLine: 11, message: `Characters appearing < ${k} times: ${invalidChars.join(', ')}. Split by '${invalidChars[0]}'.`,
      s, k, currentStr: s, freq, invalidChars, depth: 0
    })

    const substrings = s.split(invalidChars[0]).filter(sub => sub.length > 0)

    if (substrings.length === 0) {
      steps.push({
        phase: 'done', activeLine: 15, message: `No valid substrings after split. Return 0.`,
        s, k, isValid: false, result: 0, depth: 1
      })
    } else {
      let maxLen = 0

      substrings.forEach((sub, idx) => {
        steps.push({
          phase: 'recurse', activeLine: 14, message: `Recursively check substring[${idx}]: "${sub}"`,
          s, k, currentStr: sub, depth: 1
        })

        const subFreq = {}
        for (const char of sub) {
          subFreq[char] = (subFreq[char] || 0) + 1
        }

        const subInvalidChars = Object.entries(subFreq).filter(([_, count]) => count < k)

        if (subInvalidChars.length === 0) {
          maxLen = Math.max(maxLen, sub.length)
          steps.push({
            phase: 'sub_valid', activeLine: 18, message: `Substring "${sub}" is valid. Length: ${sub.length}`,
            s, k, currentStr: sub, freq: subFreq, isValid: true, depth: 1
          })
        } else {
          steps.push({
            phase: 'sub_invalid', activeLine: 11, message: `Substring "${sub}" has invalid chars. Length: 0`,
            s, k, currentStr: sub, freq: subFreq, depth: 1
          })
        }
      })

      steps.push({
        phase: 'done', activeLine: 13, message: `Maximum length among valid substrings: ${maxLen}. Return ${maxLen}.`,
        s, k, isValid: maxLen > 0, result: maxLen
      })
    }
  }

  return steps
}

const EXAMPLES = getExamplesOr('longest-substring-k-repeating', [
  { label: 'Example 1', s: 'aaab', k: 3 },
  { label: 'Example 2', s: 'ababbc', k: 2 },
  { label: 'Example 3', s: 'aaabccccaabbaac', k: 3 },
])

export default function Problem395Visualizer() {
  const [sInput, setSInput] = useState('aaab')
  const [kInput, setKInput] = useState('3')

  const { s, k, inputError } = useMemo(() => {
    try {
      const k_val = Number(kInput)
      if (isNaN(k_val) || k_val < 1) throw new Error('k must be a positive number')
      return { s: sInput, k: k_val, inputError: '' }
    } catch (e) {
      return { s: 'aaab', k: 3, inputError: e.message || 'Invalid input' }
    }
  }, [sInput, kInput])

  const steps = useMemo(
    () => generateSteps(s, k).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, k],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSInput(ex.s)
    setKInput(String(ex.k))
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
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>String (s)</div>
              <input
                value={sInput}
                onChange={(e) => { setSInput(e.target.value); handleReset() }}
                placeholder="aaab"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
            <div style={{ width: '80px' }}>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>Min Count (k)</div>
              <input
                value={kInput}
                onChange={(e) => { setKInput(e.target.value); handleReset() }}
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
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>String: {s}</div>
            <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
              {s.split('').map((char, idx) => {
                const inCurrentStr = step?.currentStr?.includes(char)
                const freq = step?.freq?.[char] ?? 0

                return (
                  <div
                    key={idx}
                    style={{
                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: inCurrentStr ? (freq >= k ? '#10b981' : '#ef4444') : '#334155',
                      color: '#e2e8f0', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold',
                      position: 'relative'
                    }}
                  >
                    {char}
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>Character Frequencies</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {step?.freq && Object.entries(step.freq).map(([char, count]) => (
                  <div
                    key={char}
                    style={{
                      backgroundColor: count >= k ? '#10b98166' : '#ef444466',
                      padding: '6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>'{char}'</span>
                    <span style={{ color: count >= k ? '#86efac' : '#fca5a5', fontWeight: 'bold' }}>
                      {count} {count >= k ? '✓' : '✗'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {step?.result !== undefined && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Result</div>
                <div style={{ color: '#60a5fa', fontSize: '18px', fontWeight: 'bold' }}>
                  {step.result}
                </div>
              </div>
            )}
          </div>

          {step && (
            <div style={{ display: 'flex', gap: 12, fontSize: '13px' }}>
              <div style={{ backgroundColor: '#1e293b', padding: '8px', borderRadius: '4px', flex: 1 }}>
                <span style={{ color: '#64748b' }}>K: </span>
                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{k}</span>
              </div>
              <div style={{ backgroundColor: step?.isValid ? '#10b98166' : step?.isValid === false ? '#ef444466' : '#1e293b', padding: '8px', borderRadius: '4px', flex: 1, textAlign: 'center' }}>
                <span style={{ color: step?.isValid ? '#86efac' : step?.isValid === false ? '#fca5a5' : '#cbd5e1', fontWeight: 'bold' }}>
                  {step?.isValid === true ? 'Valid' : step?.isValid === false ? 'Invalid' : 'Checking...'}
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
        backgroundColor: step?.isValid === true ? '#10b98166' : step?.isValid === false ? '#ef444466' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.isValid === true ? '#86efac' : step?.isValid === false ? '#fca5a5' : '#cbd5e1',
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
