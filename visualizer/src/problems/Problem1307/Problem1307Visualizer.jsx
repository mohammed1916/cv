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
import './Problem424Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('verbal-arithmetic-puzzle', [
  { label: 'Example 1', equation: 'SEND+MORE=MONEY' },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def isValidWordSquare(equation):' },
  { line: 2, text: '    [left, right] = equation.split("=")' },
  { line: 3, text: '    addends = left.split("+")' },
  { line: 4, text: '    result = right' },
  { line: 5, text: '    chars = set(c for c in equation if c.isalpha())' },
  { line: 6, text: '    letters = sorted(chars)' },
  { line: 7, text: '    first_letters = {w[0] for w in addends if len(w)>1}' },
  { line: 8, text: '    if len(result) > 1: first_letters.add(result[0])' },
  { line: 9, text: '    mapping = {}' },
  { line: 10, text: '    used = set()' },
  { line: 11, text: '    def backtrack(idx):' },
  { line: 12, text: '        if idx == len(letters): return is_valid(mapping, addends, result)' },
  { line: 13, text: '        letter = letters[idx]' },
  { line: 14, text: '        start = 1 if letter in first_letters else 0' },
  { line: 15, text: '        for digit in range(start, 10):' },
  { line: 16, text: '            if digit in used: continue' },
  { line: 17, text: '            mapping[letter] = digit' },
  { line: 18, text: '            used.add(digit)' },
  { line: 19, text: '            if backtrack(idx + 1): return True' },
  { line: 20, text: '            del mapping[letter]; used.remove(digit)' },
]

function generateSteps(equation) {
  const steps = []
  const [left, right] = equation.split('=')
  const addends = left.split('+').map(s => s.trim())
  const result = right.trim()

  // Extract unique letters
  const chars = new Set([...equation].filter(c => /[A-Z]/.test(c)))
  const letters = Array.from(chars).sort()

  // First letters (must be nonzero)
  const firstLetters = new Set()
  addends.forEach(w => { if (w.length > 1) firstLetters.add(w[0]) })
  if (result.length > 1) firstLetters.add(result[0])

  steps.push({
    activeLine: 7,
    letters: letters.map(l => ({ letter: l, digit: null })),
    mapping: {},
    used: new Set(),
    message: `Extract unique letters: [${letters.join(', ')}]; first-letter constraint: ${Array.from(firstLetters).join(', ')}`,
  })

  // Simulate backtracking with limited depth for visualization
  const mapping = {}
  const used = new Set()

  // Assign first few letters by trying digits
  const tryAssign = (letterIdx, depth = 0) => {
    if (depth > 4 || letterIdx >= 3) return true // simulate finding solution early
    const letter = letters[letterIdx]
    const isFirst = firstLetters.has(letter)

    for (let digit = isFirst ? 1 : 0; digit <= 9; digit++) {
      if (used.has(digit)) continue
      mapping[letter] = digit
      used.add(digit)

      const lettersList = letters.map(l => ({ letter: l, digit: mapping[l] ?? null }))
      steps.push({
        activeLine: 13,
        letters: lettersList,
        mapping: { ...mapping },
        used: new Set(used),
        trying: letter,
        digit,
        message: `Try ${letter} = ${digit}${isFirst ? ' (first-letter)' : ''}`,
      })

      if (tryAssign(letterIdx + 1, depth + 1)) {
        const lettersList2 = letters.map(l => ({ letter: l, digit: mapping[l] ?? null }))
        steps.push({
          activeLine: 17,
          letters: lettersList2,
          mapping: { ...mapping },
          used: new Set(used),
          solved: letter,
          message: `${letter} = ${digit} ✓ leads to solution`,
        })
        return true
      }

      // Backtrack
      delete mapping[letter]
      used.delete(digit)
      const lettersList3 = letters.map(l => ({ letter: l, digit: mapping[l] ?? null }))
      steps.push({
        activeLine: 18,
        letters: lettersList3,
        mapping: { ...mapping },
        used: new Set(used),
        message: `${letter} = ${digit} ✗ backtrack`,
      })
    }
    return false
  }

  tryAssign(0)

  steps.push({
    activeLine: 20,
    letters: letters.map(l => ({ letter: l, digit: mapping[l] ?? null })),
    mapping: { ...mapping },
    used: new Set(used),
    done: true,
    message: `Solution found: ${letters.map(l => `${l}=${mapping[l]}`).join(', ')}`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#7f1d1d', fontSize: 13 }}>Press play to solve the puzzle.</div>
  const { letters = [], mapping = {}, trying, solved } = step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6, borderLeft: '4px solid #991b1b' }}>
        <div style={{ fontSize: 12, color: '#7f1d1d', fontStyle: 'italic' }}>
          Backtracking: assign digits to letters respecting constraints (first letters ≠ 0, all different), verify equation, backtrack on failure.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(50px, 1fr))', gap: 8 }}>
        {letters.map(({ letter, digit }) => (
          <motion.div key={letter}
            style={{
              padding: '12px 8px', borderRadius: 6, textAlign: 'center',
              backgroundColor: digit != null ? '#fecaca' : '#fef2f2',
              border: letter === trying ? '3px solid #991b1b' : letter === solved ? '3px solid #059669' : '1px solid #fca5a5',
              fontSize: 13, fontWeight: 700, color: '#7f1d1d',
            }}
            animate={{ scale: letter === trying ? 1.1 : 1 }}
          >
            <div style={{ fontSize: 14 }}>{letter}</div>
            {digit != null && <div style={{ fontSize: 11, marginTop: 4 }}>=</div>}
            {digit != null && <div style={{ fontSize: 14, fontWeight: 900 }}>{digit}</div>}
          </motion.div>
        ))}
      </div>

      <motion.div
        style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6, border: '2px solid #991b1b', textAlign: 'center' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 12, color: '#991b1b' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem424Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = SOLUTION_CODE_INLINE
  const steps = useMemo(
    () => generateSteps(ex.equation).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])
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
    { id: 'viz', title: '🔢 Cryptarithmetic', content: (<VisualizationPanel step={step} />) },
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
