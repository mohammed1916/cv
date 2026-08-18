import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import './PalindromePairsVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def is_pal(s):' },
  { line: 2, text: '    return s == s[::-1]' },
  { line: 3, text: 'def palindrome_pairs(words):' },
  { line: 4, text: '    lookup = {w: i for i, w in enumerate(words)}' },
  { line: 5, text: '    result = []' },
  { line: 6, text: '    for i, word in enumerate(words):' },
  { line: 7, text: '        for k in range(len(word) + 1):' },
  { line: 8, text: '            prefix, suffix = word[:k], word[k:]' },
  { line: 9, text: '            if is_pal(prefix):' },
  { line: 10, text: '                back = suffix[::-1]' },
  { line: 11, text: '                if back != word and back in lookup:' },
  { line: 12, text: '                    result.append([lookup[back], i])' },
  { line: 13, text: '            if k != len(word) and is_pal(suffix):' },
  { line: 14, text: '                back = prefix[::-1]' },
  { line: 15, text: '                if back != word and back in lookup:' },
  { line: 16, text: '                    result.append([i, lookup[back]])' },
  { line: 17, text: '    return result' },
]

const reverseStr = (s) => s.split('').reverse().join('')
const isPal = (s) => s === reverseStr(s)

function generateSteps(words) {
  const steps = []
  const lookup = {}
  words.forEach((w, i) => { lookup[w] = i })

  const pairs = [] // array of [a, b]
  const labelOf = (a, b) => `${words[a] === '' ? 'ε' : words[a]}+${words[b] === '' ? 'ε' : words[b]}`
  const snapshot = () => pairs.map(([a, b]) => ({ a, b, label: labelOf(a, b) }))

  steps.push({
    phase: 'init', activeLine: 4, relatedLines: [3, 4],
    message: `Build lookup map word -> index for ${words.length} word(s).`,
    words, lookup: { ...lookup }, i: -1, pairs: snapshot(),
  })
  steps.push({
    phase: 'init', activeLine: 5, relatedLines: [5],
    message: 'Start with an empty result list of palindrome pairs.',
    words, i: -1, pairs: snapshot(),
  })

  words.forEach((word, i) => {
    const n = word.length
    const display = word === '' ? 'ε' : word
    steps.push({
      phase: 'word', activeLine: 6, relatedLines: [6],
      message: `Examine word #${i} = "${display}". Try every split point.`,
      words, i, word, pairs: snapshot(),
    })

    for (let k = 0; k <= n; k++) {
      const prefix = word.slice(0, k)
      const suffix = word.slice(k)
      const prefixIsPal = isPal(prefix)
      const suffixIsPal = isPal(suffix)

      steps.push({
        phase: 'split', activeLine: 8, relatedLines: [7, 8],
        message: `Split "${display}" at ${k}: prefix "${prefix === '' ? 'ε' : prefix}" | suffix "${suffix === '' ? 'ε' : suffix}".`,
        words, i, word, k, prefix, suffix, prefixIsPal, suffixIsPal, pairs: snapshot(),
      })

      // Case A: prefix is a palindrome -> need a word equal to reverse(suffix)
      if (prefixIsPal) {
        const back = reverseStr(suffix)
        const found = back !== word && Object.prototype.hasOwnProperty.call(lookup, back)
        let newPair = null
        if (found) {
          pairs.push([lookup[back], i])
          newPair = { a: lookup[back], b: i }
        }
        steps.push({
          phase: 'check-prefix',
          activeLine: found ? 12 : 9,
          relatedLines: found ? [9, 10, 11, 12] : [9, 10, 11],
          message: `prefix "${prefix === '' ? 'ε' : prefix}" is a palindrome -> need word = reverse(suffix) = "${back === '' ? 'ε' : back}". ${found ? `Found at index ${lookup[back]} -> pair (${lookup[back]}, ${i}).` : 'Not present.'}`,
          words, i, word, k, prefix, suffix, prefixIsPal, suffixIsPal,
          matchCase: 'prefix', back, found, newPair, pairs: snapshot(),
        })
      }

      // Case B: suffix is a palindrome (k != n) -> need a word equal to reverse(prefix)
      if (k !== n && suffixIsPal) {
        const back = reverseStr(prefix)
        const found = back !== word && Object.prototype.hasOwnProperty.call(lookup, back)
        let newPair = null
        if (found) {
          pairs.push([i, lookup[back]])
          newPair = { a: i, b: lookup[back] }
        }
        steps.push({
          phase: 'check-suffix',
          activeLine: found ? 16 : 13,
          relatedLines: found ? [13, 14, 15, 16] : [13, 14, 15],
          message: `suffix "${suffix === '' ? 'ε' : suffix}" is a palindrome -> need word = reverse(prefix) = "${back === '' ? 'ε' : back}". ${found ? `Found at index ${lookup[back]} -> pair (${i}, ${lookup[back]}).` : 'Not present.'}`,
          words, i, word, k, prefix, suffix, prefixIsPal, suffixIsPal,
          matchCase: 'suffix', back, found, newPair, pairs: snapshot(),
        })
      }
    }
  })

  steps.push({
    phase: 'done', activeLine: 17, relatedLines: [17],
    message: `Done. Found ${pairs.length} palindrome pair(s): ${pairs.map(([a, b]) => `(${a},${b})`).join(', ') || 'none'}.`,
    words, i: -1, pairs: snapshot(), done: true,
  })

  return steps
}

const DEFAULT_WORDS = ['abcd', 'dcba', 'lls', 's', 'sssll']
const REGISTRY_EXAMPLES = getExamplesOr('palindrome-pairs', [])
const EXAMPLES = REGISTRY_EXAMPLES.length > 0 ? REGISTRY_EXAMPLES : [
  { label: 'Classic', inputs: DEFAULT_WORDS },
  { label: 'bat / tab', inputs: ['bat', 'tab', 'cat'] },
  { label: 'abc / cba', inputs: ['abc', 'cba'] },
  { label: 'empty + a', inputs: ['a', ''] },
]

const LABEL = { fontSize: 12, fontWeight: 600, color: '#627794', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }
const GREEN = '#22c55e'
const RED = '#ef4444'

function Badge({ ok, children }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 700, marginLeft: 6,
      color: ok ? GREEN : RED,
      background: ok ? `${GREEN}22` : `${RED}22`,
      border: `1px solid ${ok ? GREEN : RED}`,
    }}>{children}</span>
  )
}

function Segment({ text, color }) {
  if (text === '') {
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: 'monospace' }}>ε</span>
  }
  return (
    <span style={{ fontFamily: 'monospace' }}>
      {text.split('').map((c, idx) => (
        <span key={idx} style={{
          display: 'inline-block', padding: '3px 6px', margin: 1, borderRadius: 4,
          background: 'var(--code-bg)', border: `1px solid ${color}`, color,
        }}>{c}</span>
      ))}
    </span>
  )
}

function VizBody({ step, words }) {
  const pairs = step?.pairs || []
  const showSplit = step && step.prefix !== undefined
  const showLookup = step && step.matchCase

  return (
    <>
      <div>
        <div style={LABEL}>Words</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {words.map((w, idx) => {
            const active = step && step.i === idx
            return (
              <div key={idx} style={{
                padding: '6px 10px', borderRadius: 8, fontFamily: 'monospace', fontSize: 13,
                border: `2px solid ${active ? GREEN : 'var(--border)'}`,
                background: active ? `${GREEN}1f` : 'var(--surface2)',
                color: active ? GREEN : 'var(--text)',
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 10, marginRight: 6 }}>{idx}</span>
                {w === '' ? 'ε' : w}
              </div>
            )
          })}
        </div>
      </div>

      {showSplit && (
        <div>
          <div style={LABEL}>Current split at position {step.k}</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 11, color: '#627794', marginBottom: 6 }}>
                prefix
                <Badge ok={step.prefixIsPal}>{step.prefixIsPal ? 'palindrome' : 'not palindrome'}</Badge>
              </div>
              <Segment text={step.prefix} color={step.prefixIsPal ? GREEN : 'var(--text-muted)'} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#627794', marginBottom: 6 }}>
                suffix
                <Badge ok={step.suffixIsPal}>{step.suffixIsPal ? 'palindrome' : 'not palindrome'}</Badge>
              </div>
              <Segment text={step.suffix} color={step.suffixIsPal ? GREEN : 'var(--text-muted)'} />
            </div>
          </div>
        </div>
      )}

      {showLookup && (
        <div>
          <div style={LABEL}>Reverse lookup</div>
          <div style={{
            padding: 12, borderRadius: 8, background: 'var(--code-bg)',
            border: `1px solid ${step.found ? GREEN : 'var(--border)'}`,
            color: 'var(--text)', fontSize: 13,
          }}>
            <span style={{ color: '#627794' }}>
              {step.matchCase === 'prefix' ? 'reverse(suffix)' : 'reverse(prefix)'} =
            </span>{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {step.back === '' ? 'ε' : `"${step.back}"`}
            </span>
            <Badge ok={step.found}>{step.found ? 'exists as another word' : 'not found'}</Badge>
          </div>
        </div>
      )}

      <div>
        <div style={LABEL}>Found pairs ({pairs.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {pairs.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>none yet</span>
          )}
          {pairs.map((p, idx) => {
            const justAdded = step?.newPair && idx === pairs.length - 1 &&
              step.newPair.a === p.a && step.newPair.b === p.b
            return (
              <motion.div
                key={`${p.a}-${p.b}-${idx}`}
                initial={{ scale: justAdded ? 0.6 : 1, opacity: justAdded ? 0 : 1 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontFamily: 'monospace', fontSize: 13,
                  fontWeight: 700,
                  border: `2px solid ${justAdded ? GREEN : 'var(--border)'}`,
                  background: justAdded ? `${GREEN}22` : 'var(--surface2)',
                  color: justAdded ? GREEN : 'var(--text)',
                }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: 10, marginRight: 6 }}>({p.a},{p.b})</span>
                {p.label}
              </motion.div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default function PalindromePairsVisualizer() {
  const [inputValue, setInputValue] = useState(
    JSON.stringify(EXAMPLES[0].inputs || EXAMPLES[0]),
  )

  const parsed = useMemo(() => {
    try {
      const value = JSON.parse(inputValue)
      if (!Array.isArray(value) || value.some((w) => typeof w !== 'string')) {
        return { words: null, error: 'Input must be a JSON array of strings, e.g. ["abcd","dcba"].' }
      }
      if (value.length > 12) {
        return { words: value.slice(0, 12), error: 'Only the first 12 words are visualized.' }
      }
      return { words: value, error: '' }
    } catch (e) {
      return { words: null, error: e.message }
    }
  }, [inputValue])

  const words = parsed.words
  const inputError = parsed.error

  const steps = useMemo(() => (words ? generateSteps(words) : []), [words])
  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const vizWords = step?.words || words || []
  const applyExample = useCallback((example) => {
    setInputValue(JSON.stringify(example.inputs || example))
    handleReset()
  }, [handleReset])
  const panelConfigs = useMemo(() => [
    { id: 'input', title: 'Input' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-bottom' },
    { id: 'code', title: 'Code', dockMode: 'split-right' },
  ], [])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="palindrome-pairs-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.input && createPortal(
            <ManualInputPanel
              fields={[{ key: 'words', label: 'Words (JSON)', type: 'array', placeholder: '["abcd","dcba","lls","s","sssll"]' }]}
              values={{ words: inputValue }}
              onChange={(key, value) => { if (key === 'words') { setInputValue(value); handleReset() } }}
              examples={EXAMPLES}
              activeLabel={EXAMPLES.find((example) => JSON.stringify(example.inputs || example) === inputValue)?.label}
              applyExample={applyExample}
              inputError={inputError}
            />,
            panelDivs.input,
          )}
          {panelDivs.viz && createPortal(
            <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              className="palindrome-pairs-viz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="palindrome-pairs-step-info">
                <h3>{step?.message || 'Press play (or Next) to trace the split-and-lookup algorithm.'}</h3>
              </div>
              <VizBody step={step} words={vizWords} />
            </motion.div>
            </AnimatePresence>,
            panelDivs.viz,
          )}
          {panelDivs.code && createPortal(
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
          />,
            panelDivs.code,
          )}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
