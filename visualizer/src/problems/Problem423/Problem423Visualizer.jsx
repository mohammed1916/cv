import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem423Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []



const EXAMPLES = getExamplesOr('reconstruct-original-digits', [
  { label: 'Example 1', s: 'owoztneoer' },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def originalDigits(s):' },
  { line: 2, text: '    count = [0] * 10' },
  { line: 3, text: '    char_count = {}' },
  { line: 4, text: '    for c in s: char_count[c] = char_count.get(c, 0) + 1' },
  { line: 5, text: '    ' },
  { line: 6, text: '    count[0] = char_count.get("z", 0)' },
  { line: 7, text: '    count[2] = char_count.get("w", 0)' },
  { line: 8, text: '    count[4] = char_count.get("u", 0)' },
  { line: 9, text: '    count[6] = char_count.get("x", 0)' },
  { line: 10, text: '    count[8] = char_count.get("g", 0)' },
  { line: 11, text: '    ' },
  { line: 12, text: '    count[3] = char_count.get("h", 0) - count[8]' },
  { line: 13, text: '    count[5] = char_count.get("f", 0) - count[4]' },
  { line: 14, text: '    count[7] = char_count.get("s", 0) - count[6] - count[2]' },
  { line: 15, text: '    count[9] = char_count.get("i", 0) - count[5] - count[6] - count[8]' },
  { line: 16, text: '    count[1] = char_count.get("o", 0) - count[0] - count[2] - count[4]' },
  { line: 17, text: '    ' },
  { line: 18, text: '    result = ""' },
  { line: 19, text: '    for digit in range(10):' },
  { line: 20, text: '        result += str(digit) * count[digit]' },
  { line: 21, text: '    return result' },
  { line: 22, text: '' },
  { line: 23, text: '' },
  { line: 24, text: '' },
  { line: 25, text: '' },
]

function generateSteps(s) {
  const steps = []

  steps.push({ activeLine: 2, message: `Process string: "${s}"` })

  const count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  steps.push({ activeLine: 3, message: 'Initialize count[0..9] = 0' })

  const charCount = {}
  steps.push({ activeLine: 4, message: 'Initialize char_count dictionary' })

  for (const c of s) {
    charCount[c] = (charCount[c] ?? 0) + 1
  }
  steps.push({ activeLine: 6, message: `Count characters: ${JSON.stringify(charCount)}` })

  // Unique digit extraction (lines 9-13)
  const uniqueDigits = [
    { digit: 0, char: 'z' },
    { digit: 2, char: 'w' },
    { digit: 4, char: 'u' },
    { digit: 6, char: 'x' },
    { digit: 8, char: 'g' },
  ]

  for (const { digit, char } of uniqueDigits) {
    const cnt = charCount[char] ?? 0
    count[digit] = cnt
    steps.push({ activeLine: 9 + (digit === 0 ? 0 : digit === 2 ? 1 : digit === 4 ? 2 : digit === 6 ? 3 : 4), message: `count[${digit}] = char_count["${char}"] = ${cnt}` })
  }

  // Subtract used characters (lines 16-20)
  const dependentDigits = [
    { digit: 3, unique: [8] },
    { digit: 5, unique: [4] },
    { digit: 7, unique: [6, 2] },
    { digit: 9, unique: [5, 6, 8] },
    { digit: 1, unique: [0, 2, 4] },
  ]

  for (const { digit, unique } of dependentDigits) {
    let subtracted = 0
    for (const u of unique) subtracted += count[u]
    const finalCount = (charCount['ohfsi'[digit - 1]] ?? 0) - subtracted
    count[digit] = finalCount
    const line = digit === 3 ? 16 : digit === 5 ? 17 : digit === 7 ? 18 : digit === 9 ? 19 : 20
    steps.push({ activeLine: line, message: `count[${digit}] -= dependent digits: ${finalCount}` })
  }

  // Build result (lines 22-24)
  steps.push({ activeLine: 22, message: 'Initialize result string' })

  let result = ''
  for (let i = 0; i < 10; i++) {
    steps.push({ activeLine: 23, message: `for i=${i}: append '${i}' ${count[i]} times` })
    result += String(i).repeat(count[i])
  }

  steps.push({ activeLine: 25, message: `Return: "${result}"`, done: true, result })
  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#6b21a8', fontSize: 13 }}>Press play.</div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div style={{ padding: 10, backgroundColor: '#f3e8ff', borderRadius: 6, border: '1px solid #d8b4fe', fontSize: 12, color: '#581c87' }}>
        {step.message}
      </div>
      {step.result && (
        <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed', fontFamily: 'monospace' }}>
          Result: {step.result}
        </div>
      )}
    </div>
  )
}

export default function Problem423Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [tokensInput, setTokensInput] = useState("zerozerozerozerotwotwotwotwo");
  const { tokens, inputError } = useMemo(() => {
    try {
      const parsedTokens = tokensInput;
      return { tokens: parsedTokens, inputError: '' };
    } catch (e) {
      return { tokens: "zerozerozerozerotwotwotwotwo", inputError: e.message };
    }
  }, [tokensInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE
  const steps = useMemo(
    () => generateSteps(s).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [s]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setTokensInput(String(e.tokens)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const dockPanels = useMemo(() => [
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
    { id: 'viz', title: '🔢 Reconstruct', content: (<VisualizationPanel step={step} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom])
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
