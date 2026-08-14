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
import './Problem411Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('minimum-unique-word-abbreviation')

// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}
const PATTERNS = ['check_abbr', 'done', 'found_unique', 'generate_len', 'init', 'match_check', 'not_unique']  // Auto-generated: maps line numbers to phase names

const EXAMPLES = [
  { label: 'Ex1', word: 'apple', dictionary: ['banana'], expected: 'a3e' },
  { label: 'Ex2', word: 'banana', dictionary: ['band', 'can', 'fan'], expected: 'ba2' },
  { label: 'Simple', word: 'dog', dictionary: ['cat'], expected: 'd1g' },
]

function abbreviationMatches(abbr, word) {
  let aIdx = 0, wIdx = 0
  while (aIdx < abbr.length && wIdx < word.length) {
    if (abbr[aIdx].match(/\d/)) {
      let num = 0
      while (aIdx < abbr.length && abbr[aIdx].match(/\d/)) {
        num = num * 10 + parseInt(abbr[aIdx])
        aIdx++
      }
      wIdx += num
    } else {
      if (abbr[aIdx] !== word[wIdx]) return false
      aIdx++
      wIdx++
    }
  }
  return aIdx === abbr.length && wIdx === word.length
}

function generateSteps(word, dictionary) {
  const steps = []

  steps.push({
    activeLine: 1,
    message: `Find shortest unique abbreviation for "${word}". Dictionary: [${dictionary.join(', ')}]`,
    phase: 'init',
    word,
    dictionary,
    candidates: [],
    checked: [],
    unique: null,
    result: null,
  })

  // Generate abbreviation candidates by length
  const candidates = []
  const checked = []

  // Try abbreviations starting with length 1
  for (let len = 1; len <= word.length; len++) {
    steps.push({
      activeLine: 2,
      message: `Generate abbreviations of length ${len}`,
      phase: 'generate_len',
      word,
      dictionary,
      candidates: [...candidates],
      checked: [...checked],
      unique: null,
      result: null,
      currentLen: len,
    })

    if (len === 1) {
      candidates.push(word[0] + (word.length - 1))
    } else {
      // Simple pattern for demo - try first char + count + last char for len 3
      if (len === 3 && word.length > 2) {
        candidates.push(word[0] + (word.length - 2) + word[word.length - 1])
      }
    }

    // Check each candidate for uniqueness
    for (const abbr of candidates.slice(-1)) {
      let isUnique = true

      steps.push({
        activeLine: 3,
        message: `Check abbreviation "${abbr}" against dictionary`,
        phase: 'check_abbr',
        word,
        dictionary,
        candidates: [...candidates],
        checked: [...checked],
        unique: null,
        result: null,
        currentAbbr: abbr,
      })

      for (const dictWord of dictionary) {
        const matches = abbreviationMatches(abbr, dictWord)

        steps.push({
          activeLine: 4,
          message: `Does "${abbr}" match "${dictWord}"? ${matches ? 'YES' : 'NO'}`,
          phase: 'match_check',
          word,
          dictionary,
          candidates: [...candidates],
          checked: [...checked],
          unique: null,
          result: null,
          currentAbbr: abbr,
          compareWord: dictWord,
          matches,
        })

        if (matches) {
          isUnique = false
          break
        }
      }

      if (isUnique) {
        checked.push({ abbr, isUnique: true })

        steps.push({
          activeLine: 5,
          message: `"${abbr}" is UNIQUE! No dictionary word matches.`,
          phase: 'found_unique',
          word,
          dictionary,
          candidates: [...candidates],
          checked: [...checked],
          unique: abbr,
          result: abbr,
          currentAbbr: abbr,
        })

        return steps
      } else {
        checked.push({ abbr, isUnique: false })

        steps.push({
          activeLine: 6,
          message: `"${abbr}" matches a dictionary word. Not unique.`,
          phase: 'not_unique',
          word,
          dictionary,
          candidates: [...candidates],
          checked: [...checked],
          unique: null,
          result: null,
          currentAbbr: abbr,
        })
      }
    }
  }

  steps.push({
    activeLine: 7,
    message: `No abbreviation found. Return full word or default: ${word}`,
    phase: 'done',
    word,
    dictionary,
    candidates: [...candidates],
    checked: [...checked],
    unique: null,
    result: word,
  })

  return steps
}

function AbbreviationExplorer({ word, dictionary, step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Abbreviation Search</div>

      {/* Word display */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Word: "{word}"</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {word.split('').map((char, idx) => (
            <div
              key={idx}
              style={{
                padding: '8px 10px',
                backgroundColor: '#f1f5f9',
                borderRadius: 4,
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                color: '#334155',
                minWidth: 30,
                textAlign: 'center',
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Dictionary display */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Dictionary</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dictionary.map((dictWord, idx) => {
            const matches = step?.compareWord === dictWord
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: matches ? '#dbeafe' : '#f1f5f9',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: matches ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  color: matches ? '#0c4a6e' : '#334155',
                  fontFamily: 'monospace',
                }}
                animate={{ scale: matches ? 1.1 : 1 }}
              >
                {dictWord}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current abbreviation check */}
      {step?.currentAbbr && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.unique === step.currentAbbr ? '#d1fae5' : step.matches ? '#fee2e2' : '#fef3c7',
            borderRadius: 6,
            border: `2px solid ${step.unique === step.currentAbbr ? '#10b981' : step.matches ? '#dc2626' : '#f59e0b'}`,
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: step.unique === step.currentAbbr ? '#065f46' : step.matches ? '#7f1d1d' : '#92400e',
            marginBottom: 8,
          }}>
            Checking: "{step.currentAbbr}"
          </div>
          {step.phase === 'match_check' && (
            <div style={{ fontSize: 11, color: step.matches ? '#991b1b' : '#92400e' }}>
              {step.matches ? `Matches "${step.compareWord}"` : `Does not match "${step.compareWord}"`}
            </div>
          )}
          {step.phase === 'found_unique' && (
            <div style={{ fontSize: 11, color: '#047857', fontWeight: 'bold' }}>UNIQUE! No matches found.</div>
          )}
          {step.phase === 'not_unique' && (
            <div style={{ fontSize: 11, color: '#991b1b' }}>Not unique - matches found.</div>
          )}
        </motion.div>
      )}

      {/* Candidates checked */}
      {step?.checked && step.checked.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Candidates Checked</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.checked.map((item, idx) => (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: item.isUnique ? '#d1fae5' : '#fee2e2',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  border: item.isUnique ? '2px solid #10b981' : '2px solid #dc2626',
                  color: item.isUnique ? '#065f46' : '#7f1d1d',
                  fontFamily: 'monospace',
                }}
              >
                {item.abbr} {item.isUnique ? '✓' : '✗'}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {step?.result && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '2px solid #0284c7',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 4 }}>Result</div>
          <div style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 'bold', color: '#0284c7' }}>"{step.result}"</div>
        </motion.div>
      )}

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem411Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [wordInput, setWordInput] = useState(EXAMPLES[0]?.word ?? '');
  const [dictionaryInput, setDictionaryInput] = useState("");
  const { word, dictionary, inputError } = useMemo(() => {
    try {
      const parsedWord = wordInput;
      const parsedDictionary = JSON.parse(dictionaryInput); if (!Array.isArray(parsedDictionary)) throw new Error('dictionary must be an array');
      return { word: parsedWord, dictionary: parsedDictionary, inputError: '' };
    } catch (e) {
      return { word: EXAMPLES[exIdx]?.word ?? '', dictionary: EXAMPLES[exIdx]?.dictionary ?? '', inputError: e.message };
    }
  }, [wordInput, dictionaryInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(word, dictionary).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setWordInput(String(EXAMPLES[i].word)); setDictionaryInput(JSON.stringify(EXAMPLES[i].dictionary)); handleReset(); }, [handleReset]);

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
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '🔤 Min Unique Abbreviation',
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
                    border: exIdx === idx ? '2px solid #f97316' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#ffedd5' : '#f1f5f9',
                    color: exIdx === idx ? '#92400e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <AbbreviationExplorer word={word} dictionary={dictionary} step={step} />
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
