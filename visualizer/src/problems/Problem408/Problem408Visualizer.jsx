import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem408Visualizer.css'

const EXAMPLES = [
  { label: 'Valid', word: 'internationalization', abbr: 'i18n', expected: true },
  { label: 'Invalid', word: 'apple', abbr: 'apl', expected: false },
  { label: 'Simple', word: 'abc', abbr: 'a1c', expected: true },
]

function generateSteps(word, abbr) {
  const steps = []

  if (!word || !abbr) {
    steps.push({
      activeLine: 1,
      message: 'Invalid input. Return false.',
      phase: 'done',
      valid: false,
      wIdx: -1,
      aIdx: -1,
      skipped: 0,
      matched: '',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Compare word "${word}" with abbr "${abbr}"`,
    phase: 'init',
    valid: null,
    wIdx: 0,
    aIdx: 0,
    skipped: 0,
    matched: '',
    word,
    abbr,
  })

  let wIdx = 0
  let aIdx = 0
  let matched = ''

  while (aIdx < abbr.length) {
    const aChar = abbr[aIdx]

    steps.push({
      activeLine: 2,
      message: `Check abbr[${aIdx}] = '${aChar}'. Is it a digit?`,
      phase: 'check_char',
      valid: null,
      wIdx,
      aIdx,
      skipped: 0,
      matched,
      word,
      abbr,
      currentAbbr: aChar,
    })

    if (/\d/.test(aChar)) {
      // Digit found, parse number
      let num = 0
      const digitStart = aIdx

      while (aIdx < abbr.length && /\d/.test(abbr[aIdx])) {
        num = num * 10 + parseInt(abbr[aIdx])
        aIdx++
      }

      steps.push({
        activeLine: 3,
        message: `Parsed number: ${num}. Skip ${num} characters in word.`,
        phase: 'parse_number',
        valid: null,
        wIdx,
        aIdx,
        skipped: num,
        matched,
        word,
        abbr,
        number: num,
      })

      // Skip num characters
      wIdx += num

      if (wIdx > word.length) {
        steps.push({
          activeLine: 4,
          message: `Word index ${wIdx} exceeds word length ${word.length}. Invalid!`,
          phase: 'invalid_skip',
          valid: false,
          wIdx,
          aIdx,
          skipped: num,
          matched,
          word,
          abbr,
        })
        return steps
      }

      steps.push({
        activeLine: 5,
        message: `After skip: wIdx=${wIdx}. Continue.`,
        phase: 'after_skip',
        valid: null,
        wIdx,
        aIdx,
        skipped: num,
        matched,
        word,
        abbr,
      })
    } else {
      // Character match
      if (wIdx >= word.length || word[wIdx] !== aChar) {
        steps.push({
          activeLine: 6,
          message: `Character mismatch: word[${wIdx}]="${word[wIdx]}" != abbr[${aIdx}]="${aChar}". Invalid!`,
          phase: 'char_mismatch',
          valid: false,
          wIdx,
          aIdx,
          skipped: 0,
          matched,
          word,
          abbr,
        })
        return steps
      }

      matched += aChar

      steps.push({
        activeLine: 7,
        message: `Character match: word[${wIdx}]="${aChar}". Advance both pointers.`,
        phase: 'char_match',
        valid: null,
        wIdx,
        aIdx,
        skipped: 0,
        matched,
        word,
        abbr,
      })

      wIdx++
      aIdx++
    }
  }

  // Check if we consumed entire word
  if (wIdx === word.length) {
    steps.push({
      activeLine: 8,
      message: `Successfully matched entire word and abbr. Valid!`,
      phase: 'done',
      valid: true,
      wIdx,
      aIdx,
      skipped: 0,
      matched,
      word,
      abbr,
    })
  } else {
    steps.push({
      activeLine: 9,
      message: `Word index ${wIdx} != word length ${word.length}. Invalid!`,
      phase: 'done',
      valid: false,
      wIdx,
      aIdx,
      skipped: 0,
      matched,
      word,
      abbr,
    })
  }

  return steps
}

function AbbreviationVisualization({ word, abbr, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Matching Process</div>

      {/* Word alignment */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Word: "{word}"</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {word.split('').map((char, idx) => {
            const isPassed = step?.wIdx > idx
            const isCurrent = step?.wIdx === idx
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 10px',
                  backgroundColor: isCurrent ? '#fee2e2' : isPassed ? '#d1fae5' : '#f1f5f9',
                  borderRadius: 4,
                  border: isCurrent ? '2px solid #dc2626' : isPassed ? '1px solid #10b981' : '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: isCurrent ? '#7f1d1d' : isPassed ? '#065f46' : '#334155',
                  minWidth: 30,
                  textAlign: 'center',
                }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Abbreviation alignment */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Abbr: "{abbr}"</div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {abbr.split('').map((char, idx) => {
            const isPassed = step?.aIdx > idx
            const isCurrent = step?.aIdx === idx
            const isDigit = /\d/.test(char)
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '8px 10px',
                  backgroundColor: isCurrent ? '#dbeafe' : isPassed ? '#d1fae5' : '#f1f5f9',
                  borderRadius: 4,
                  border: isCurrent ? '2px solid #0284c7' : isPassed ? '1px solid #10b981' : '1px solid #cbd5e1',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 700,
                  color: isCurrent ? '#0c4a6e' : isPassed ? '#065f46' : isDigit ? '#7c3aed' : '#334155',
                  minWidth: 30,
                  textAlign: 'center',
                }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current operation */}
      {step && step.phase !== 'init' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.valid ? '#d1fae5' : step.valid === false ? '#fee2e2' : '#fef3c7',
            borderRadius: 6,
            border: `2px solid ${step.valid ? '#10b981' : step.valid === false ? '#dc2626' : '#f59e0b'}`,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: step.valid ? '#065f46' : step.valid === false ? '#7f1d1d' : '#92400e',
            marginBottom: 8,
          }}>
            {step.phase === 'check_char' && 'Checking Character'}
            {step.phase === 'parse_number' && 'Parsing Number'}
            {step.phase === 'char_match' && 'Character Match'}
            {step.phase === 'char_mismatch' && 'Mismatch!'}
            {step.phase === 'invalid_skip' && 'Invalid Skip!'}
            {step.phase === 'done' && (step.valid ? 'Valid!' : 'Invalid!')}
          </div>
          <div style={{ fontSize: 12, color: step.valid ? '#047857' : step.valid === false ? '#991b1b' : '#92400e' }}>
            {step.message}
          </div>
        </motion.div>
      )}

      {/* Pointers and counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#7f1d1d', fontWeight: 600 }}>Word Index</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#991b1b' }}>{step?.wIdx ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Abbr Index</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#0284c7' }}>{step?.aIdx ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fce7f3', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#831843', fontWeight: 600 }}>Skipped</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#be185d' }}>{step?.skipped ?? 0}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>Matched</div>
          <div style={{ fontSize: 12, fontWeight: 'bold', color: '#047857', fontFamily: 'monospace' }}>{step?.matched || '—'}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem408Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(example.word, example.abbr).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((idx) => { setExIdx(idx); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
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
      ),
    },
    {
      id: 'viz',
      title: '📝 Abbreviation Validation',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #06b6d4' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#cffafe' : '#f1f5f9',
                    color: exIdx === idx ? '#164e63' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label} {e.expected ? '✓' : '✗'}
                </button>
              ))}
            </div>
          </div>
          <AbbreviationVisualization word={example.word} abbr={example.abbr} step={step} />
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
