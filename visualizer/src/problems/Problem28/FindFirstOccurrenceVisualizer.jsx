import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './FindFirstOccurrenceVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def strStr(self, haystack: str, needle: str) -> int:' },
  { line: 3, text: '        if not needle:' },
  { line: 4, text: '            return 0' },
  { line: 5, text: '        ' },
  { line: 6, text: '        n, m = len(haystack), len(needle)' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for i in range(n - m + 1):' },
  { line: 9, text: '            if haystack[i:i+m] == needle:' },
  { line: 10, text: '                return i' },
  { line: 11, text: '        ' },
  { line: 12, text: '        return -1' },
]

const FINDFIRSTOCCURRENCE_PATTERNS = ['compare', 'done', 'empty_needle', 'init', 'loop_check', 'match_found', 'mismatch', 'return_zero']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'empty_needle',
  4: 'return_zero',
  6: 'init',
  8: 'loop_check',
  9: 'compare',
  10: 'match_found',
  12: 'done',
}

function generateSteps(haystack, needle) {
  const steps = []

  if (!needle) {
    steps.push({
      phase: 'empty_needle', i: null, matched: 0,
      activeLine: 3, message: 'Needle is empty.'
    })
    steps.push({
      phase: 'return_zero', i: null, matched: 0,
      activeLine: 4, message: 'Return 0 for empty needle.'
    })
    return steps
  }

  const n = haystack.length
  const m = needle.length

  if (m > n) {
    steps.push({
      phase: 'init', i: 0, matched: 0,
      activeLine: 6, message: `Initialize n = ${n}, m = ${m}.`
    })
    steps.push({
      phase: 'done', i: null, matched: 0,
      activeLine: 12, message: `Needle length (${m}) > haystack length (${n}). Return -1.`
    })
    return steps
  }

  steps.push({
    phase: 'init', i: 0, matched: 0,
    activeLine: 6, message: `Initialize n = ${n}, m = ${m}.`
  })

  for (let i = 0; i <= n - m; i++) {
    steps.push({
      phase: 'loop_check', i, matched: 0,
      activeLine: 8, message: `Check position i = ${i}. Is ${i} <= ${n - m}?`
    })

    let isMatch = true
    for (let j = 0; j < m; j++) {
      const haystackChar = haystack[i + j]
      const needleChar = needle[j]

      steps.push({
        phase: 'compare', i, matched: j, haystackChar, needleChar,
        activeLine: 9, message: `Compare haystack[${i + j}] = '${haystackChar}' with needle[${j}] = '${needleChar}'.`
      })

      if (haystackChar !== needleChar) {
        steps.push({
          phase: 'mismatch', i, matched: j, haystackChar, needleChar,
          activeLine: 9, message: `Mismatch! '${haystackChar}' !== '${needleChar}'. Move to next position.`
        })
        isMatch = false
        break
      }
    }

    if (isMatch) {
      steps.push({
        phase: 'match_found', i, matched: m,
        activeLine: 10, message: `All characters matched! Needle found at index ${i}. Return ${i}.`
      })
      return steps
    }
  }

  steps.push({
    phase: 'done', i: null, matched: 0,
    activeLine: 12, message: `Loop complete. Needle not found. Return -1.`
  })

  return steps
}

const EXAMPLES = getExamples('find-first-occurrence')

export default function FindFirstOccurrenceVisualizer({ problem }) {
  const [haystackInput, setHaystackInput] = useState('"sadbutsad"')
  const [needleInput, setNeedleInput] = useState('"sad"')

  const { haystack, needle, inputError } = useMemo(() => {
    try {
      let h = haystackInput.trim()
      let n = needleInput.trim()

      if (h.startsWith('"') && h.endsWith('"')) {
        h = h.slice(1, -1)
      }
      if (n.startsWith('"') && n.endsWith('"')) {
        n = n.slice(1, -1)
      }

      return { haystack: h, needle: n, inputError: '' }
    } catch {
      return { haystack: 'sadbutsad', needle: 'sad', inputError: 'Invalid input' }
    }
  }, [haystackInput, needleInput])

  const steps = useMemo(
    () => generateSteps(haystack, needle).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [haystack, needle],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setHaystackInput(`"${ex.haystack}"`)
    setNeedleInput(`"${ex.needle}"`)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div className="ffo-shell">
      <div className="ffo-top">
        <div className="ffo-panel" style={{ flex: 1 }}>
          <div className="ffo-panel-head">
            String Matching
            {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
          </div>
          <div className="ffo-panel-body">
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => applyExample(ex)}
                  className="ffo-example-btn"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace', minWidth: 70 }}>haystack:</span>
                <input
                  value={haystackInput}
                  onChange={(e) => { setHaystackInput(e.target.value);

 handleReset() }}
                  placeholder='"sadbutsad"'
                  className="ffo-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
                <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace', minWidth: 70 }}>needle:</span>
                <input
                  value={needleInput}
                  onChange={(e) => { setNeedleInput(e.target.value); handleReset() }}
                  placeholder='"sad"'
                  className="ffo-input"
                  style={{ flex: 1, margin: 0 }}
                />
              </div>
            </div>

            <div className="ffo-haystack-container">
              <div className="ffo-label">Haystack:</div>
              <div className="ffo-string-display">
                {haystack.split('').map((char, i) => {
                  const currentPos = step?.i ?? -1
                  const matchedChars = step?.matched ?? 0
                  const isInCurrentWindow = i >= currentPos && i < currentPos + needle.length && currentPos >= 0
                  const isMatchedChar = isInCurrentWindow && i < currentPos + matchedChars
                  const isMismatchChar = isInCurrentWindow && step?.phase === 'mismatch' && i === currentPos + step.matched
                  const isFoundChar = step?.phase === 'match_found' && i >= currentPos && i < currentPos + needle.length

                  let charClass = 'ffo-char'
                  if (isFoundChar) charClass += ' found'
                  else if (isMatchedChar) charClass += ' matched'
                  else if (isMismatchChar) charClass += ' mismatch'
                  else if (isInCurrentWindow) charClass += ' current-window'

                  return (
                    <motion.div
                      key={`h-${i}`}
                      className={charClass}
                      animate={{
                        scale: isFoundChar ? 1.1 : isMismatchChar ? 0.95 : 1,
                      }}
                    >
                      {char}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="ffo-needle-container">
              <div className="ffo-label">Needle:</div>
              <div className="ffo-string-display">
                {needle.split('').map((char, i) => {
                  const matchedChars = step?.matched ?? 0
                  const isMatched = i < matchedChars

                  return (
                    <motion.div
                      key={`n-${i}`}
                      className={`ffo-char${isMatched ? ' matched' : ''}`}
                      animate={{
                        scale: isMatched ? 1 : 1,
                      }}
                    >
                      {char}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div className="ffo-stats">
              <div className="ffo-stat-box">
                <span className="ffo-stat-label">Haystack Length</span>
                <span className="ffo-stat-val">{haystack.length}</span>
              </div>
              <div className="ffo-stat-box">
                <span className="ffo-stat-label">Needle Length</span>
                <span className="ffo-stat-val">{needle.length}</span>
              </div>
              <div className="ffo-stat-box">
                <span className="ffo-stat-label">Current Position</span>
                <span className="ffo-stat-val">{step?.i ?? '-'}</span>
              </div>
              <div className="ffo-stat-box">
                <span className="ffo-stat-label">Matched Characters</span>
                <span className="ffo-stat-val">{step?.matched ?? 0} / {needle.length}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="ffo-middle">
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

      <div className={`ffo-status ${step?.phase === 'match_found' ? 'success' : step?.phase === 'done' ? 'fail' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={FINDFIRSTOCCURRENCE_PATTERNS} />
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
  )
}
