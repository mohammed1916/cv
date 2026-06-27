import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import ResizableSplitPanels from '../../components/shared/ResizableSplitPanels'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ValidParenthesesVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def isValid(self, s: str) -> bool:' },
  { line: 3, text: '        stack = []' },
  { line: 4, text: '        pairs = {")": "(", "]": "[", "}": "{"}' },
  { line: 5, text: '        for char in s:' },
  { line: 6, text: '            if char in pairs:' },
  { line: 7, text: '                if not stack or stack[-1] != pairs[char]:' },
  { line: 8, text: '                    return False' },
  { line: 9, text: '                stack.pop()' },
  { line: 10, text: '            else:' },
  { line: 11, text: '                stack.append(char)' },
  { line: 12, text: '        return len(stack) == 0' },
]

function generateSteps(s) {
  const steps = []
  const stack = []
  const pairs = { ')': '(', ']': '[', '}': '{' }

  steps.push({ phase: 'init', i: -1, stack: [], char: null, activeLine: 3, message: 'Initialize empty stack.' })

  for (let i = 0; i < s.length; i++) {
    const char = s[i]
    steps.push({ phase: 'check', i, stack: [...stack], char, activeLine: 5, message: `Check position ${i}: "${char}"` })

    if (char in pairs) {
      const expectedOpen = pairs[char]
      steps.push({ phase: 'is_closing', i, stack: [...stack], char, activeLine: 6, message: `"${char}" is closing.` })

      if (stack.length === 0 || stack[stack.length - 1] !== expectedOpen) {
        steps.push({ phase: 'invalid', i, stack: [...stack], char, activeLine: 8, message: 'No match. Invalid!' })
        return steps
      }

      steps.push({ phase: 'match', i, stack: [...stack], char, matchIdx: stack.length - 1, activeLine: 9, message: 'Match!' })
      stack.pop()
    } else {
      steps.push({ phase: 'is_opening', i, stack: [...stack], char, activeLine: 11, message: `"${char}" is opening.` })
      stack.push(char)
    }
  }

  steps.push(stack.length === 0
    ? { phase: 'valid', i: s.length, stack: [], char: null, activeLine: 12, message: 'Valid!' }
    : { phase: 'invalid', i: s.length, stack: [...stack], char: null, activeLine: 12, message: 'Invalid!' })

  return steps
}

const EXAMPLES = getExamples('valid-parentheses')

export default function ValidParenthesesVisualizer() {
  const [input, setInput] = useState('()[]{}')

  const steps = useMemo(() => generateSteps(input).map((current) => ({
    ...current, relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
  })), [input])

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => { setInput(ex.input); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  return (
    <div className="validparen-shell">
      <ResizableSplitPanels className="validparen-top-split" storageKey="cpviz.split.validparen.top" initialLeftPercent={60} minLeftPx={360} minRightPx={280}
        left={(<div className="validparen-panel"><div className="validparen-panel-head">Bracket Dance</div><div className="validparen-panel-body">
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>{EXAMPLES.map((ex) => (<button key={ex.label} onClick={() => applyExample(ex)} className="validparen-example-btn">{ex.label}</button>))}</div>
          <input value={input} onChange={(e) => { setInput(e.target.value); handleReset() }} placeholder="Enter" className="validparen-input" style={{ width: '100%', marginBottom: 24 }} />
          <div className="validparen-string-display">{input.split('').map((char, idx) => (<motion.div key={idx} className={`validparen-char ${step?.i === idx ? 'active' : ''} ${step?.phase === 'match' && (step.i === idx || step.matchIdx === idx) ? 'matched' : ''}`} animate={step?.i === idx ? { scale: 1.3 } : { scale: 1 }}>{char}</motion.div>))}</div>
          {step?.message && <div className="validparen-narrative">{step.message}</div>}
        </div></div>)}
        right={(<div className="validparen-panel"><div className="validparen-panel-head">Stack</div><div className="validparen-panel-body">
          <div className="validparen-stack-container">
            <AnimatePresence>{step?.stack?.length > 0 ? step.stack.map((bracket, idx) => (<motion.div key={idx} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="validparen-stack-item"><span className="validparen-stack-bracket">{bracket}</span></motion.div>)) : (<div className="validparen-stack-empty">Empty</div>)}</AnimatePresence>
          </div>
        </div></div>)}
      />
      <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
      <div className={`validparen-status ${step?.phase === 'valid' ? 'success' : step?.phase === 'invalid' ? 'fail' : ''}`}>{step?.message ?? 'Play!'}</div>
      <div className="validparen-dock"><PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={(e) => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Pattern" showPatternOverlayToggle /></div>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
