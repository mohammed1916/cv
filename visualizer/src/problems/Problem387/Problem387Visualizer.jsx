import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem387Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const PATTERNS = ['complete', 'count', 'found', 'init', 'search']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'count',
  5: 'count',
  7: 'search',
  8: 'search',
  9: 'found',
  10: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def firstUniqChar(s):' },
  { line: 2, text: '    # Count character frequencies' },
  { line: 3, text: '    char_count = {}' },
  { line: 4, text: '    for char in s:' },
  { line: 5, text: '        char_count[char] = char_count.get(char, 0) + 1' },
  { line: 6, text: '    # Find first unique' },
  { line: 7, text: '    for i, char in enumerate(s):' },
  { line: 8, text: '        if char_count[char] == 1:' },
  { line: 9, text: '            return i' },
  { line: 10, text: '    return -1' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s) {
  const steps = []
  const charCount = {}

  // Step 1: Initialize
  steps.push({
    activeLine: 1,
    phase: 'init',
    s,
    charCount: {},
    currentIdx: -1,
    result: null,
    message: `Find first unique character in "${s}"`,
  })

  // Step 2: Count frequencies
  steps.push({
    activeLine: 4,
    phase: 'count',
    s,
    charCount: {},
    currentIdx: -1,
    result: null,
    message: 'Count frequency of each character',
  })

  s.split('').forEach((char, idx) => {
    charCount[char] = (charCount[char] || 0) + 1
    steps.push({
      activeLine: 5,
      phase: 'count',
      s,
      charCount: { ...charCount },
      currentIdx: idx,
      result: null,
      highlighted: char,
      message: `Process s[${idx}]='${char}': count[${char}] = ${charCount[char]}`,
    })
  })

  // Step 3: Find first unique
  steps.push({
    activeLine: 7,
    phase: 'search',
    s,
    charCount: { ...charCount },
    currentIdx: -1,
    result: null,
    message: 'Search for first character with count = 1',
  })

  let foundIdx = -1
  for (let i = 0; i < s.length; i++) {
    const char = s[i]

    steps.push({
      activeLine: 8,
      phase: 'search',
      s,
      charCount: { ...charCount },
      currentIdx: i,
      result: null,
      highlighted: char,
      message: `Check s[${i}]='${char}': count=${charCount[char]}`,
    })

    if (charCount[char] === 1) {
      foundIdx = i

      steps.push({
        activeLine: 9,
        phase: 'found',
        s,
        charCount: { ...charCount },
        currentIdx: i,
        result: i,
        highlighted: char,
        message: `Found! First unique character '${char}' at index ${i}`,
      })

      break
    }
  }

  // Complete
  steps.push({
    activeLine: 10,
    phase: 'complete',
    s,
    charCount: { ...charCount },
    currentIdx: -1,
    result: foundIdx,
    message: foundIdx >= 0 ? `Result: ${foundIdx}` : 'No unique character found: -1',
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'With Unique',
    s: 'leetcode',
  },
  {
    label: 'All Repeat',
    s: 'aabb',
  },
  {
    label: 'Single Unique',
    s: 'abacabad',
  },
]

export default function Problem387Visualizer() {
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
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(s).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setSInput(String(EXAMPLES[i].s)); handleReset(); }, [handleReset]);

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔍 First Unique Character', dockMode: 'split-right' },
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Input String */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Input String</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.s.split('').map((char, idx) => (
                    <motion.div
                      key={`char-${idx}`}
                      animate={{
                        scale: step.currentIdx === idx ? 1.2 : 1,
                      }}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        backgroundColor:
                          step.currentIdx === idx
                            ? '#fed7aa'
                            : step.phase === 'count' && step.highlighted === char
                            ? '#fcd34d'
                            : '#fef3c7',
                        border:
                          step.currentIdx === idx
                            ? '2px solid #f59e0b'
                            : step.phase === 'count' && step.highlighted === char
                            ? '2px solid #eab308'
                            : '1px solid #fcd34d',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#92400e',
                      }}
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Character Frequency Map */}
              {step.phase !== 'init' && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Character Frequencies</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {Object.entries(step.charCount)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([char, count]) => (
                        <motion.div
                          key={`freq-${char}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 4,
                            backgroundColor:
                              step.highlighted === char
                                ? count === 1
                                  ? '#dcfce7'
                                  : '#fee2e2'
                                : '#f1f5f9',
                            border:
                              step.highlighted === char
                                ? count === 1
                                  ? '2px solid #10b981'
                                  : '2px solid #ef4444'
                                : '1px solid #cbd5e1',
                            fontSize: 12,
                            fontWeight: 600,
                            color:
                              step.highlighted === char
                                ? count === 1
                                  ? '#047857'
                                  : '#991b1b'
                                : '#334155',
                          }}
                        >
                          '{char}': {count}
                        </motion.div>
                      ))}
                  </div>
                </div>
              )}

              {/* Result */}
              {step.phase === 'found' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    ✓ Found unique character '{step.highlighted}' at index {step.result}
                  </div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.result >= 0 ? '#dcfce7' : '#fee2e2',
                    border: step.result >= 0 ? '2px solid #10b981' : '2px solid #ef4444',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: step.result >= 0 ? '#166534' : '#991b1b' }}>
                    {step.result >= 0 ? `✓ Result: ${step.result}` : '✗ No unique character: -1'}
                  </div>
                </motion.div>
              )}

              {/* Algorithm explanation */}
              {step.phase === 'count' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fcd34d',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#92400e',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Counting Phase:</div>
                  <div>Store frequency of each character</div>
                </motion.div>
              )}

              {step.phase === 'search' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#1e40af',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Search Phase:</div>
                  <div>Find first character with frequency = 1</div>
                </motion.div>
              )}
            </>
          )}
        </div>),
  }), [step, connectivity, setActiveLineDom, exIdx, applyExample])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"}]}
          values={{ s: sInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
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
          prevDisabled={stepIndex <= 0}
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
