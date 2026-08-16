import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './LongestWordDictionaryVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('longest-word-dictionary')

const PATTERNS = ['init', 'loop']

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop'
}


const REGISTRY_EXAMPLES = getExamples('longest-word-dictionary')

// The registry entry for this slug only carries a `words` list, which does not
// match this visualizer's (s, dictionary) input. Fall back to correctly shaped
// local examples whenever the registry rows are missing those fields.
const EXAMPLES =
  REGISTRY_EXAMPLES.length > 0 &&
  REGISTRY_EXAMPLES.every((e) => typeof e.s === 'string' && Array.isArray(e.dictionary))
    ? REGISTRY_EXAMPLES
    : [
        { label: 'Example 1', s: 'abpcplea', dictionary: ['ale', 'apple', 'monkey', 'plea'] },
        { label: 'Example 2', s: 'abpcplea', dictionary: ['a', 'b', 'c'] },
      ]

function generateSteps(s, dictionary) {
  const steps = []

  steps.push({
    activeLine: 1,
    s,
    dictionary: [...dictionary],
    wordIdx: -1,
    message: `Find longest word from dictionary that is subsequence of "${s}"`,
    relatedLines: [1]
  })

  function isSubsequence(word, str) {
    let j = 0
    for (let i = 0; i < str.length && j < word.length; i++) {
      if (str[i] === word[j]) j++
    }
    return j === word.length
  }

  const sorted = [...dictionary].sort((a, b) => b.length - a.length || a.localeCompare(b))

  steps.push({
    activeLine: 2,
    s,
    dictionary: sorted,
    wordIdx: -1,
    message: 'Sort by length (descending) then lexicographically',
    relatedLines: [2]
  })

  let result = ''

  for (let i = 0; i < sorted.length; i++) {
    const word = sorted[i]

    steps.push({
      activeLine: 3,
      s,
      dictionary: sorted,
      wordIdx: i,
      currentWord: word,
      message: `Check if "${word}" is subsequence of "${s}"`,
      relatedLines: [3]
    })

    if (isSubsequence(word, s)) {
      result = word

      steps.push({
        activeLine: 4,
        s,
        dictionary: sorted,
        wordIdx: i,
        currentWord: word,
        result,
        done: true,
        message: `Found! "${word}" is a valid subsequence`,
        relatedLines: [4]
      })

      return steps
    }
  }

  steps.push({
    activeLine: 5,
    s,
    dictionary: sorted,
    done: true,
    result,
    message: `Result: "${result}" (empty if not found)`,
    relatedLines: [5]
  })

  return steps
}

function VisualizationPanel({ s, dictionary, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#faf5ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#6b21a8', fontStyle: 'italic' }}>
          "Find the longest word from dictionary that can be formed by deleting characters from the string."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* String */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>String: {s}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s.split('').map((char, idx) => (
            <div
              key={`char-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid var(--border)',
                fontFamily: 'monospace',
                fontWeight: 600,
                backgroundColor: 'var(--surface2)',
                color: 'var(--border)'
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Dictionary */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Dictionary</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', maxHeight: 150, overflowY: 'auto' }}>
          {(step?.dictionary ?? dictionary)?.map((word, idx) => {
            const isActive = step && idx === step.wordIdx && !step.done
            const isResult = step && word === step.result
            return (
              <motion.div
                key={`word-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: isResult ? '#e9d5ff' : isActive ? '#ede9fe' : 'var(--surface2)',
                  borderColor: isResult ? '#8b5cf6' : isActive ? '#c084fc' : 'var(--border)',
                  color: isResult ? '#5b21b6' : isActive ? '#7c3aed' : 'var(--border)'
                }}
                animate={{ scale: isActive || isResult ? 1.15 : 1 }}
              >
                {word}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current Check */}
      {step?.currentWord && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#ede9fe',
            borderRadius: 6,
            border: '1px solid #c084fc'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Testing: "{step.currentWord}"
          </div>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#faf5ff',
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            color: '#6b21a8'
          }}>
            Checking if subsequence of "{s}"
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#faf5ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 22, fontWeight: 'bold', color: '#8553f6', fontFamily: 'monospace' }}>
          "{step?.result !== undefined ? step.result : '...'}"
        </div>
        <div style={{ fontSize: 12, color: '#8553f6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function LongestWordDictionaryVisualizer() {
  const DEFAULT_S = EXAMPLES[0]?.s ?? 'abpcplea'
  const DEFAULT_DICT = EXAMPLES[0]?.dictionary ?? ['ale', 'apple', 'monkey', 'plea']

  const [sInput, setSInput] = useState(DEFAULT_S)
  const [dictionaryInput, setDictionaryInput] = useState(JSON.stringify(DEFAULT_DICT))
  const [activeLabel, setActiveLabel] = useState(EXAMPLES[0]?.label ?? '')

  const { s, dictionary, inputError } = useMemo(() => {
    try {
      const parsedDict = JSON.parse(dictionaryInput)
      if (!Array.isArray(parsedDict) || parsedDict.some((w) => typeof w !== 'string')) {
        throw new Error('dictionary must be an array of strings, e.g. ["ale","apple"]')
      }
      return { s: sInput, dictionary: parsedDict, inputError: '' }
    } catch (e) {
      return { s: sInput, dictionary: [], inputError: e.message }
    }
  }, [sInput, dictionaryInput])

  const steps = useMemo(
    () =>
      generateSteps(s, dictionary).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s, dictionary]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setSInput(e.s)
    setDictionaryInput(JSON.stringify(e.dictionary))
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset, setSInput, setDictionaryInput, setActiveLabel])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📖 Longest Word in Dictionary', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

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

        </div>),
    viz: (<>
        <ManualInputPanel
          fields={[
            { key: 's', label: 's', type: 'string' },
            { key: 'dictionary', label: 'dictionary', type: 'array' },
          ]}
          values={{ s: sInput, dictionary: dictionaryInput }}
          onChange={(key, text) => {
            if (key === 's') setSInput(text)
            else if (key === 'dictionary') setDictionaryInput(text)
            setActiveLabel('')
            handleReset()
          }}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          s={s}
          dictionary={dictionary}
          step={step}
          applyEx={applyEx}
        />
      </>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, s, dictionary, sInput, dictionaryInput, activeLabel, inputError, applyEx, handleReset])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
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
