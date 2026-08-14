import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SplitStringsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def splitConcatenatedStrings(self, strs: List[str]) -> str:' },
  { line: 3, text: '        result = ""' },
  { line: 4, text: '        ' },
  { line: 5, text: '        for s in strs:' },
  { line: 6, text: '            word = ""' },
  { line: 7, text: '            for c in s:' },
  { line: 8, text: '                if c.isdigit():' },
  { line: 9, text: '                    # Process word: generate rotations' },
  { line: 10, text: '                    if word:' },
  { line: 11, text: '                        rotations = generate_rotations(word)' },
  { line: 12, text: '                        max_rot = max(rotations)' },
  { line: 13, text: '                        result = max(result, max_rot)' },
  { line: 14, text: '                        word = ""' },
  { line: 15, text: '                        skip = int(c)' },
  { line: 16, text: '                else:' },
  { line: 17, text: '                    word += c' },
  { line: 18, text: '        ' },
  { line: 19, text: '        # Process final word' },
  { line: 20, text: '        if word:' },
  { line: 21, text: '            rotations = generate_rotations(word)' },
  { line: 22, text: '            result = max(result, max(rotations))' },
  { line: 23, text: '        ' },
  { line: 24, text: '        return result' },
]

const PATTERNS = ['parse', 'split', 'rotate', 'compare', 'track_max']
const LINE_PATTERN_MAP = {
  5: 'parse',
  8: 'split',
  11: 'rotate',
  12: 'compare',
  13: 'track_max',
}

function generateRotations(word) {
  if (!word || word.length === 0) return []
  const rotations = []
  for (let i = 0; i < word.length; i++) {
    rotations.push(word.slice(i) + word.slice(0, i))
  }
  return rotations
}

function parseString(s) {
  const segments = []
  let word = ''
  let idx = 0

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (/\d/.test(c)) {
      if (word) {
        segments.push({ type: 'word', value: word, index: idx })
        word = ''
      }
      const skipNum = parseInt(c)
      segments.push({ type: 'skip', value: skipNum, index: idx })
      idx += 1
    } else {
      word += c
      idx += 1
    }
  }

  if (word) {
    segments.push({ type: 'word', value: word, index: idx })
  }

  return segments
}

function generateSteps(strs) {
  const steps = []

  if (!Array.isArray(strs) || strs.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 24,
      relatedLines: [24],
      message: 'No input strings',
      result: '',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'parse',
    activeLine: 3,
    relatedLines: [3],
    message: 'Initialize result as empty string',
    result: '',
    totalStrings: strs.length,
  })

  let globalMax = ''
  let stringIndex = 0

  for (const s of strs) {
    steps.push({
      phase: 'parse',
      activeLine: 5,
      relatedLines: [5],
      message: `Processing string: "${s}"`,
      currentString: s,
      stringIndex,
    })

    const segments = parseString(s)
    let segmentIndex = 0

    for (const segment of segments) {
      if (segment.type === 'skip') {
        steps.push({
          phase: 'split',
          activeLine: 8,
          relatedLines: [8],
          message: `Split marker: ${segment.value}`,
          currentString: s,
          splitNum: segment.value,
          stringIndex,
        })
      } else if (segment.type === 'word') {
        const word = segment.value

        steps.push({
          phase: 'rotate',
          activeLine: 11,
          relatedLines: [11],
          message: `Found word: "${word}". Generating rotations...`,
          currentWord: word,
          stringIndex,
        })

        const rotations = generateRotations(word)

        for (let i = 0; i < rotations.length; i++) {
          steps.push({
            phase: 'rotate',
            activeLine: 11,
            relatedLines: [11],
            message: `Rotation ${i + 1}/${rotations.length}: "${rotations[i]}"`,
            currentWord: word,
            rotations,
            currentRotationIndex: i,
            stringIndex,
          })
        }

        const maxRotation = rotations.reduce((max, r) => (r > max ? r : max), '')

        steps.push({
          phase: 'compare',
          activeLine: 12,
          relatedLines: [12],
          message: `Max rotation of "${word}": "${maxRotation}"`,
          currentWord: word,
          rotations,
          maxRotation,
          stringIndex,
        })

        if (maxRotation > globalMax) {
          steps.push({
            phase: 'track_max',
            activeLine: 13,
            relatedLines: [13],
            message: `Update global max: "${globalMax}" → "${maxRotation}"`,
            globalMax: maxRotation,
            maxRotation,
            stringIndex,
          })
          globalMax = maxRotation
        } else {
          steps.push({
            phase: 'compare',
            activeLine: 13,
            relatedLines: [13],
            message: `"${maxRotation}" ≤ current max "${globalMax}", no update`,
            globalMax,
            maxRotation,
            stringIndex,
          })
        }
      }

      segmentIndex++
    }

    stringIndex++
  }

  steps.push({
    phase: 'done',
    activeLine: 24,
    relatedLines: [24],
    message: `Final result: "${globalMax}"`,
    result: globalMax,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.currentString && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#38bdf8', marginBottom: 6 }}>Current String</div>
          <div style={{ fontSize: 14, color: '#38bdf8', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.currentString}
          </div>
        </div>
      )}

      {step?.currentWord && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6 }}>Current Word</div>
          <div style={{ fontSize: 14, color: '#22c55e', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.currentWord}
          </div>
        </div>
      )}

      {step?.rotations && step?.rotations.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 8 }}>
            Rotations ({step.rotations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step.rotations.map((rot, i) => (
              <div
                key={i}
                style={{
                  padding: 6,
                  backgroundColor: step.currentRotationIndex === i ? '#0f172a' : '#0f172a',
                  borderLeft: `3px solid ${step.currentRotationIndex === i ? '#f59e0b' : '#475569'}`,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: step.currentRotationIndex === i ? '#f59e0b' : '#e2e8f0',
                }}
              >
                {rot}
              </div>
            ))}
          </div>
        </div>
      )}

      {step?.maxRotation && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6 }}>Max Rotation</div>
          <div style={{ fontSize: 14, color: '#f59e0b', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.maxRotation}
          </div>
        </div>
      )}

      {step?.globalMax !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #06b6d4' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#06b6d4', marginBottom: 6 }}>Global Maximum</div>
          <div style={{ fontSize: 14, color: '#06b6d4', fontFamily: 'monospace', fontWeight: 700 }}>
            {step.globalMax || '(empty)'}
          </div>
        </div>
      )}

      {step?.splitNum !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Split Marker</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>Skip next {step.splitNum} character(s)</div>
        </div>
      )}

      {step?.result !== undefined && step?.done && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div
            style={{
              fontSize: 18,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#22c55e',
            }}
          >
            "{step.result || '(empty)'}"
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function SplitStringsVisualizer() {
  const examples = useMemo(() => getExamplesOr('split-strings', []), [])
  const [strsInput, setStrsInput] = useState('["ab1de","xyz"]')

  const { strs, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(strsInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array')
      if (!parsed.every((item) => typeof item === 'string')) throw new Error('All items must be strings')
      return { strs: parsed, inputError: '' }
    } catch (e) {
      return { strs: [], inputError: e.message }
    }
  }, [strsInput])

  const steps = useMemo(() => generateSteps(strs), [strs])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setStrsInput(JSON.stringify(ex.strs || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
        title: '📝 Split Strings',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>
                Input Strings (JSON array)
              </div>
              <textarea
                value={strsInput}
                onChange={(e) => {
                  setStrsInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 80,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, strsInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"strs","label":"strs","type":"array"}]}
        values={{ strs: strsInput }}
        onChange={(k, v) => { if (k === 'strs') setStrsInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        
      />

      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
