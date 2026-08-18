import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './GeneralizedAbbreviationVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'def generate_abbreviations(word):' },
  { line: 2, text: '    res = []' },
  { line: 3, text: '    def backtrack(i, cur, count):' },
  { line: 4, text: '        if i == len(word):' },
  { line: 5, text: "            res.append(cur + (str(count) if count else ''))" },
  { line: 6, text: '            return' },
  { line: 7, text: '        # Choice 1: abbreviate word[i] (count it)' },
  { line: 8, text: '        backtrack(i + 1, cur, count + 1)' },
  { line: 9, text: '        # Choice 2: keep word[i] (flush count first)' },
  { line: 10, text: "        kept = cur + (str(count) if count else '') + word[i]" },
  { line: 11, text: '        backtrack(i + 1, kept, 0)' },
  { line: 12, text: '    backtrack(0, "", 0)' },
  { line: 13, text: '    return res' },
]

const MAX_LEN = 6

// Trace the backtracking on a short word. Each step exposes the current
// index, the partial abbreviation, the running count, per-char decisions,
// and the growing list of completed abbreviations.
function generateSteps(word) {
  const steps = []
  const results = []
  const n = word.length
  const decisions = [] // decisions[k] = 'abbr' | 'keep' for committed indices < depth

  const snapshot = (i, currentChoice) => ({
    chars: word.split('').map((ch, idx) => {
      let state = 'pending'
      if (idx < i) state = decisions[idx] || 'pending'
      else if (idx === i && currentChoice) state = currentChoice
      return { ch, idx, state, isCurrent: idx === i }
    }),
  })

  const backtrack = (i, cur, count) => {
    steps.push({
      phase: 'enter',
      activeLine: 3,
      relatedLines: [3, 4],
      message: `Visit index ${i} — prefix "${cur || '·'}", pending count = ${count}`,
      index: i,
      partial: cur,
      count,
      results: [...results],
      highlightResult: -1,
      ...snapshot(i, null),
    })

    if (i === n) {
      const abbr = cur + (count > 0 ? String(count) : '')
      results.push(abbr)
      steps.push({
        phase: 'record-result',
        activeLine: 5,
        relatedLines: [4, 5, 6],
        message: `End of word — flush count and record "${abbr || '(empty)'}"`,
        index: i,
        partial: cur,
        count,
        recorded: abbr,
        results: [...results],
        highlightResult: results.length - 1,
        ...snapshot(i, null),
      })
      return
    }

    // Choice 1: abbreviate word[i] — increment count.
    steps.push({
      phase: 'choose-abbreviate',
      activeLine: 8,
      relatedLines: [7, 8],
      message: `Abbreviate '${word[i]}' at index ${i} — count ${count} → ${count + 1}`,
      index: i,
      partial: cur,
      count: count + 1,
      results: [...results],
      highlightResult: -1,
      ...snapshot(i, 'abbr'),
    })
    decisions[i] = 'abbr'
    backtrack(i + 1, cur, count + 1)

    // Choice 2: keep word[i] — flush the count, then append the char.
    const kept = cur + (count > 0 ? String(count) : '') + word[i]
    steps.push({
      phase: 'choose-keep',
      activeLine: 11,
      relatedLines: [9, 10, 11],
      message: `Keep '${word[i]}' at index ${i} — flush count, append '${word[i]}' → "${kept}"`,
      index: i,
      partial: kept,
      count: 0,
      results: [...results],
      highlightResult: -1,
      ...snapshot(i, 'keep'),
    })
    decisions[i] = 'keep'
    backtrack(i + 1, kept, 0)

    decisions.length = i // pop this index's decision when unwinding
  }

  backtrack(0, '', 0)

  steps.push({
    phase: 'done',
    activeLine: 13,
    relatedLines: [12, 13],
    message: `Done — generated ${results.length} generalized abbreviation${results.length === 1 ? '' : 's'}`,
    index: n,
    partial: '',
    count: 0,
    results: [...results],
    highlightResult: -1,
    chars: word.split('').map((ch, idx) => ({ ch, idx, state: 'pending', isCurrent: false })),
  })

  return steps
}

const WORD_EXAMPLES = [
  { label: '"word"', word: 'word' },
  { label: '"abc"', word: 'abc' },
  { label: '"ab"', word: 'ab' },
  { label: '"a"', word: 'a' },
]

const REGISTRY_EXAMPLES = getExamples('generalized-abbreviation')
const EXAMPLES =
  Array.isArray(REGISTRY_EXAMPLES) && REGISTRY_EXAMPLES.length > 0
    ? REGISTRY_EXAMPLES
    : WORD_EXAMPLES

const STATE_COLORS = {
  keep: '#22c55e',
  abbr: '#a78bfa',
  pending: 'var(--text-muted)',
}

function CharBox({ ch, state, isCurrent }) {
  const color = STATE_COLORS[state] || STATE_COLORS.pending
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <div
        style={{
          width: 40,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 20,
          fontWeight: 700,
          color: state === 'pending' ? 'var(--text-muted)' : '#0b1120',
          background: state === 'pending' ? 'rgba(100,116,139,0.15)' : color,
          border: `2px solid ${isCurrent ? 'var(--surface)' : color}`,
          boxShadow: isCurrent ? '0 0 0 3px rgba(248,250,252,0.35)' : 'none',
          borderRadius: 8,
          transition: 'all 0.2s ease',
        }}
      >
        {ch}
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        {state === 'keep' ? 'keep' : state === 'abbr' ? 'skip' : ''}
      </span>
    </div>
  )
}

function VisualizationPanel({ stepIndex, step, chars, previewAbbrev, results }) {
  return (
    <div className="generalized-abbreviation-panel-body" style={{ height: '100%', overflow: 'auto' }}>
      <AnimatePresence mode="wait"><motion.div key={stepIndex} className="generalized-abbreviation-viz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        <div className="generalized-abbreviation-step-info"><h3>{step?.message || 'Press play to trace the backtracking'}</h3></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>{chars.map((character) => <CharBox key={character.idx} ch={character.ch} state={character.state} isCurrent={character.isCurrent} />)}</div>
        {step && step.phase !== 'done' && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 8, background: 'rgba(167,139,250,0.10)', border: '1px solid rgba(167,139,250,0.35)', flexWrap: 'wrap' }}><span style={{ fontSize: 12, color: '#627794' }}>Building</span><span style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#5577a4' }}>{previewAbbrev}</span><span style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12, color: '#627794' }}><span>index <b style={{ color: '#5577a4' }}>{step.index}</b></span><span>count <b style={{ color: step.count > 0 ? '#a78bfa' : 'var(--text)' }}>{step.count}</b></span></span></div>}
        <div><div style={{ fontSize: 12, color: '#627794', marginBottom: 8 }}>Completed abbreviations ({results.length})</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{results.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>none yet</span>}{results.map((result, index) => { const isNewest = index === step?.highlightResult; return <motion.span key={`${result}-${index}`} initial={isNewest ? { scale: 0.6, opacity: 0 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} style={{ padding: '6px 10px', borderRadius: 6, fontFamily: 'monospace', fontSize: 14, fontWeight: isNewest ? 700 : 500, color: isNewest ? '#0b1120' : 'var(--text)', background: isNewest ? '#22c55e' : 'rgba(148,163,184,0.12)', border: `1px solid ${isNewest ? '#22c55e' : 'rgba(148,163,184,0.25)'}` }}>{result === '' ? 'empty' : result}</motion.span> })}</div></div>
      </motion.div></AnimatePresence>
    </div>
  )
}

export default function GeneralizedAbbreviationVisualizer() {
  const [inputValue, setInputValue] = useState('word')

  const word = useMemo(() => inputValue.trim().slice(0, MAX_LEN), [inputValue])

  const inputError = useMemo(() => {
    const raw = inputValue.trim()
    if (!raw) return 'Enter a non-empty word.'
    if (raw.length > MAX_LEN) return `Word clamped to first ${MAX_LEN} chars ("${word}") to keep the trace short.`
    return ''
  }, [inputValue, word])

  const isFatal = inputValue.trim().length === 0

  const steps = useMemo(() => (isFatal ? [] : generateSteps(word)), [word, isFatal])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const chars = step?.chars || word.split('').map((ch, idx) => ({ ch, idx, state: 'pending', isCurrent: false }))
  const results = step?.results || []
  const previewAbbrev =
    step && step.phase !== 'done'
      ? `${step.partial}${step.count > 0 ? step.count : ''}` || '(empty so far)'
      : ''
  const applyExample = useCallback((example) => { setInputValue(example.word || example.inputs?.word || example.label?.replace(/"/g, '') || ''); handleReset() }, [handleReset])
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Generalized Abbreviation', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="generalized-abbreviation-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && <>
        {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'word', label: 'Word (max 6 chars)', type: 'string' }]} values={{ word: inputValue }} onChange={(_, value) => { setInputValue(value); handleReset() }} examples={EXAMPLES} applyExample={applyExample} inputError={inputError} />, panelDivs.input)}
        {panelDivs.viz && createPortal(<VisualizationPanel stepIndex={stepIndex} step={step} chars={chars} previewAbbrev={previewAbbrev} results={results} />, panelDivs.viz)}
        {panelDivs.code && createPortal(<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} />, panelDivs.code)}
      </>}

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
        />
      </FloatingPanel>
    </div>
  )
}
