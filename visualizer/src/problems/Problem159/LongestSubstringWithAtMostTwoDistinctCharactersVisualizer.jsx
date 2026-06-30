import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './LongestSubstringWithAtMostTwoDistinctCharactersVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('longest-substring-with-at-most-two-distinct-characters') || [
  { label: 'Example 1', s: 'eceba' },
  { label: 'Example 2', s: 'ccaabbb' },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def lengthOfLongestSubstring(s):' },
  { line: 2, text: '    left = 0' },
  { line: 3, text: '    char_count = {}' },
  { line: 4, text: '    max_len = 0' },
  { line: 5, text: '    for right in range(len(s)):' },
  { line: 6, text: '        ch = s[right]' },
  { line: 7, text: '        char_count[ch] = char_count.get(ch, 0) + 1' },
  { line: 8, text: '        while len(char_count) > 2:' },
  { line: 9, text: '            left_ch = s[left]' },
  { line: 10, text: '            char_count[left_ch] -= 1' },
  { line: 11, text: '            if char_count[left_ch] == 0:' },
  { line: 12, text: '                del char_count[left_ch]' },
  { line: 13, text: '            left += 1' },
  { line: 14, text: '        max_len = max(max_len, right - left + 1)' },
  { line: 15, text: '    return max_len' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty string',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    s,
    message: 'Find longest substring with at most 2 distinct characters',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    s,
    left: 0,
    charCount: {},
    maxLen: 0,
    message: 'Initialize: left = 0, sliding window with char count map',
    relatedLines: [2, 3, 4],
  })

  let left = 0
  const charCount = {}
  let maxLen = 0
  let maxSubstring = ''

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]

    steps.push({
      activeLine: 5,
      s,
      left,
      right,
      charCount: { ...charCount },
      maxLen,
      message: `Expand right pointer to ${right} (char: '${ch}')`,
      relatedLines: [5, 6],
    })

    charCount[ch] = (charCount[ch] || 0) + 1

    steps.push({
      activeLine: 7,
      s,
      left,
      right,
      charCount: { ...charCount },
      maxLen,
      message: `Add '${ch}': charCount = ${JSON.stringify(charCount)}`,
      relatedLines: [7],
    })

    while (Object.keys(charCount).length > 2) {
      steps.push({
        activeLine: 8,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Window has ${Object.keys(charCount).length} distinct chars, shrink window`,
        relatedLines: [8],
      })

      const leftCh = s[left]

      charCount[leftCh] -= 1

      steps.push({
        activeLine: 10,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Remove '${leftCh}' from left`,
        relatedLines: [10],
      })

      if (charCount[leftCh] === 0) {
        delete charCount[leftCh]

        steps.push({
          activeLine: 12,
          s,
          left,
          right,
          charCount: { ...charCount },
          maxLen,
          message: `Delete '${leftCh}' (count = 0)`,
          relatedLines: [12],
        })
      }

      left += 1

      steps.push({
        activeLine: 13,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Move left to ${left}`,
        relatedLines: [13],
      })
    }

    const currentLen = right - left + 1
    if (currentLen > maxLen) {
      maxLen = currentLen
      maxSubstring = s.substring(left, right + 1)
    }

    steps.push({
      activeLine: 14,
      s,
      left,
      right,
      charCount: { ...charCount },
      currentLen,
      maxLen,
      maxSubstring,
      message: `Window: "${s.substring(left, right + 1)}" (len=${currentLen}), max=${maxLen}`,
      relatedLines: [14],
    })
  }

  steps.push({
    activeLine: 15,
    s,
    maxLen,
    maxSubstring,
    done: true,
    message: `Result: longest substring = "${maxSubstring}" (length ${maxLen})`,
    relatedLines: [15],
  })

  return steps
}

function StringVisualization({ s, left, right }) {
  if (!s) return null

  return (
    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {s.split('').map((char, idx) => {
        const inWindow = idx >= left && idx <= right

        return (
          <motion.div
            key={idx}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              backgroundColor: inWindow ? '#a5b4fc' : '#e2e8f0',
              border: idx === left || idx === right ? '3px solid #4f46e5' : '1px solid #cbd5e1',
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'monospace',
            }}
            animate={{ scale: inWindow ? 1.1 : 1 }}
          >
            {char}
          </motion.div>
        )
      })}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          Sliding window: expand right, shrink left to maintain ≤2 distinct chars.
        </div>
      </div>

      {step.s && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            String
          </div>
          <StringVisualization s={step.s} left={step.left} right={step.right} />
        </motion.div>
      )}

      {step.left !== undefined && step.right !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Window Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#065f46' }}>
            <div>left: {step.left}, right: {step.right}</div>
            {step.currentLen && <div>current length: {step.currentLen}</div>}
          </div>
        </motion.div>
      )}

      {step.charCount && Object.keys(step.charCount).length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Character Count ({Object.keys(step.charCount).length} distinct)
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(step.charCount).map(([char, count]) => (
              <div key={char} style={{ fontSize: 11, color: '#5b21b6', fontFamily: 'monospace', fontWeight: 600 }}>
                '{char}': {count}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.maxLen !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Maximum Length
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#065f46' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{step.maxLen}</div>
            {step.maxSubstring && <div>"{step.maxSubstring}"</div>}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function LongestSubstringWithAtMostTwoDistinctCharactersVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]?.s || 'eceba')
  const steps = useMemo(
    () =>
      generateSteps(input).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e.s); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🪟 Longest Substring 2 Chars',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
