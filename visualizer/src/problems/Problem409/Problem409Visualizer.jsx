import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem409Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('longest-palindrome')

const PATTERNS = []
const LINE_PATTERN_MAP = {}

const EXAMPLES = [
  { label: 'Ex1', s: 'abccccdd', expected: 7 },
  { label: 'Ex2', s: 'Aa', expected: 1 },
  { label: 'Ex3', s: 'a', expected: 1 },
]

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty string. Return 0.',
      phase: 'done',
      length: 0,
      charFreq: {},
      pairs: 0,
      oddCount: 0,
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Build frequency map for "${s}"`,
    phase: 'init',
    length: 0,
    charFreq: {},
    pairs: 0,
    oddCount: 0,
  })

  const freq = {}
  let stepCount = 0

  // Count frequencies
  for (let char of s) {
    if (!freq[char]) freq[char] = 0
    freq[char]++

    if (stepCount < 15) {
      steps.push({
        activeLine: 2,
        message: `Increment freq['${char}'] to ${freq[char]}`,
        phase: 'count',
        charFreq: { ...freq },
        pairs: 0,
        oddCount: 0,
        length: 0,
        currentChar: char,
        stepCount,
      })
      stepCount++
    }
  }

  steps.push({
    activeLine: 3,
    message: `Frequency map complete: ${JSON.stringify(freq)}`,
    phase: 'freq_complete',
    charFreq: { ...freq },
    pairs: 0,
    oddCount: 0,
    length: 0,
  })

  // Calculate palindrome length
  let length = 0
  let oddCount = 0
  const charEntries = Object.entries(freq)

  for (const [char, count] of charEntries) {
    const pairs = Math.floor(count / 2)
    const hasOdd = count % 2 === 1

    steps.push({
      activeLine: 4,
      message: `Process '${char}' with count ${count}: pairs=${pairs}, odd=${hasOdd ? 1 : 0}`,
      phase: 'process_char',
      charFreq: { ...freq },
      pairs: pairs,
      oddCount: oddCount + (hasOdd ? 1 : 0),
      length: length + pairs * 2,
      currentChar: char,
      count,
    })

    length += pairs * 2
    if (hasOdd) oddCount++
  }

  steps.push({
    activeLine: 5,
    message: `Calculated pairs contribute: ${length}. Odd characters: ${oddCount}`,
    phase: 'calculate',
    charFreq: { ...freq },
    pairs: length / 2,
    oddCount,
    length,
  })

  // Add odd character if any
  if (oddCount > 0) {
    length++
    steps.push({
      activeLine: 6,
      message: `Odd characters exist (${oddCount}). Add 1 to center. Final length: ${length}`,
      phase: 'add_odd',
      charFreq: { ...freq },
      pairs: (length - 1) / 2,
      oddCount,
      length,
    })
  }

  steps.push({
    activeLine: 7,
    message: `Final palindrome length: ${length}`,
    phase: 'done',
    charFreq: { ...freq },
    pairs: Math.floor(length / 2),
    oddCount,
    length,
  })

  return steps
}

function PalindromeVisualization({ s, step }) {
  const charFreq = step?.charFreq || {}
  const entries = Object.entries(charFreq).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Palindrome Construction</div>

      {/* Input string */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Input: "{s}"</div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {s.split('').map((char, idx) => {
            const isCurrent = step?.currentChar === char && step?.phase === 'count'
            return (
              <motion.div
                key={idx}
                style={{
                  padding: '6px 8px',
                  backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                  borderRadius: 3,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  fontWeight: 600,
                  border: isCurrent ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  color: isCurrent ? '#0c4a6e' : '#334155',
                }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Frequency map */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Frequency Map</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 8 }}>
          {entries.map(([char, count]) => {
            const pairs = Math.floor(count / 2)
            const hasOdd = count % 2 === 1
            const isCurrent = step?.currentChar === char && step?.phase === 'process_char'

            return (
              <motion.div
                key={char}
                style={{
                  padding: 10,
                  backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                  borderRadius: 6,
                  border: isCurrent ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  textAlign: 'center',
                }}
                animate={{ scale: isCurrent ? 1.05 : 1 }}
              >
                <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b' }}>
                  {char}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  count: {count}
                </div>
                <div style={{ fontSize: 10, color: '#78350f', marginTop: 2 }}>
                  pairs: {pairs} {hasOdd ? '+ 1' : ''}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Calculation breakdown */}
      <motion.div
        style={{
          padding: 12,
          backgroundColor: '#f0fdf4',
          borderRadius: 6,
          border: '2px solid #10b981',
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Calculation</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#065f46' }}>Pairs</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#047857' }}>{Math.floor((step?.length || 0) / 2)}</div>
            <div style={{ fontSize: 10, color: '#065f46', marginTop: 4 }}>× 2 = {step?.length || 0}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: '#831843' }}>Odd Count</div>
            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#be185d' }}>{step?.oddCount || 0}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#dbeafe', borderRadius: 4, border: '2px solid #0284c7' }}>
            <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Final Length</div>
            <div style={{ fontSize: 18, fontWeight: 'bold', color: '#027bba' }}>{step?.length || 0}</div>
          </div>
        </div>
      </motion.div>

      {/* Visual palindrome example */}
      {step?.length && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Example Palindrome (length: {step.length})</div>
          <div style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b',
            fontFamily: 'monospace',
            fontSize: 13,
            color: '#92400e',
            textAlign: 'center',
            wordBreak: 'break-all',
          }}>
            {entries.length > 0 ? (
              <>
                {entries.map(([char]) => char + char.repeat(Math.floor((charFreq[char] || 0) / 2) * 2 - 1)).join('')}
                {step.oddCount > 0 ? entries[0][0] : ''}
              </>
            ) : '(building...)'}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem409Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [sInput, setSInput] = useState(EXAMPLES[0]?.s ?? '');
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: EXAMPLES[exIdx]?.s ?? '', inputError: e.message };
    }
  }, [sInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(s).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setSInput(String(EXAMPLES[i].s)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔤 Longest Palindrome', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
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
                    border: exIdx === idx ? '2px solid #ec4899' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fbf1f9' : '#f1f5f9',
                    color: exIdx === idx ? '#831843' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <PalindromeVisualization s={s} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"}]}
          values={{ s: sInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
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
