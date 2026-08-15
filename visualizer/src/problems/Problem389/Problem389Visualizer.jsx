import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem389Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['complete', 'init', 'xor_s', 'xor_t']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'init',
  5: 'xor_s',
  6: 'xor_s',
  8: 'xor_t',
  9: 'xor_t',
  11: 'complete',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findTheDifference(s, t):' },
  { line: 2, text: '    # Use XOR: a ^ a = 0, a ^ 0 = a' },
  { line: 3, text: '    result = 0' },
  { line: 4, text: '    # XOR all characters from s' },
  { line: 5, text: '    for char in s:' },
  { line: 6, text: '        result ^= ord(char)' },
  { line: 7, text: '    # XOR all characters from t' },
  { line: 8, text: '    for char in t:' },
  { line: 9, text: '        result ^= ord(char)' },
  { line: 10, text: '    # Remaining bit pattern is the difference' },
  { line: 11, text: '    return chr(result)' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s, t) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    s,
    t,
    sIdx: -1,
    tIdx: -1,
    result: 0,
    message: `Find difference between "${s}" and "${t}" using XOR`,
  })

  steps.push({
    activeLine: 3,
    phase: 'init',
    s,
    t,
    sIdx: -1,
    tIdx: -1,
    result: 0,
    message: 'Initialize result = 0',
  })

  steps.push({
    activeLine: 5,
    phase: 'xor_s',
    s,
    t,
    sIdx: -1,
    tIdx: -1,
    result: 0,
    message: 'XOR all characters from s',
  })

  let result = 0
  s.split('').forEach((char, idx) => {
    const charCode = char.charCodeAt(0)
    result ^= charCode

    steps.push({
      activeLine: 6,
      phase: 'xor_s',
      s,
      t,
      sIdx: idx,
      tIdx: -1,
      result,
      currentChar: char,
      currentCharCode: charCode,
      message: `s[${idx}]='${char}' (${charCode}): result = ${result}`,
    })
  })

  steps.push({
    activeLine: 8,
    phase: 'xor_t',
    s,
    t,
    sIdx: -1,
    tIdx: -1,
    result,
    message: 'XOR all characters from t',
  })

  t.split('').forEach((char, idx) => {
    const charCode = char.charCodeAt(0)
    result ^= charCode

    steps.push({
      activeLine: 9,
      phase: 'xor_t',
      s,
      t,
      sIdx: -1,
      tIdx: idx,
      result,
      currentChar: char,
      currentCharCode: charCode,
      message: `t[${idx}]='${char}' (${charCode}): result = ${result}`,
    })
  })

  const finalChar = String.fromCharCode(result)

  steps.push({
    activeLine: 11,
    phase: 'complete',
    s,
    t,
    sIdx: -1,
    tIdx: -1,
    result,
    finalChar,
    message: `XOR complete! Difference character: '${finalChar}' (${result})`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple',
    s: 'a',
    t: 'aa',
  },
  {
    label: 'With Multiple',
    s: 'ab',
    t: 'bac',
  },
  {
    label: 'Longer',
    s: 'abc',
    t: 'abcd',
  },
]

export default function Problem389Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [sInput, setSInput] = useState(EXAMPLES[0]?.s ?? '');
  const [tInput, setTInput] = useState("");
  const { s, t, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      const parsedT = tInput;
      return { s: parsedS, t: parsedT, inputError: '' };
    } catch (e) {
      return { s: EXAMPLES[exIdx]?.s ?? '', t: EXAMPLES[exIdx]?.t ?? '', inputError: e.message };
    }
  }, [sInput, tInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(s, t).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setSInput(String(EXAMPLES[i].s)); setTInput(String(EXAMPLES[i].t)); handleReset(); }, [handleReset]);

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
      title: '⊕ XOR Difference Finder',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
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

              {/* Strings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>String s</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.s.split('').map((char, idx) => (
                      <motion.div
                        key={`s-${idx}`}
                        animate={{
                          scale: step.sIdx === idx ? 1.2 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: step.sIdx === idx ? '#dbeafe' : '#f1f5f9',
                          border: step.sIdx === idx ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          fontSize: 12,
                          fontWeight: 600,
                          color: step.sIdx === idx ? '#0c4a6e' : '#334155',
                        }}
                      >
                        {char}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>String t</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {step.t.split('').map((char, idx) => (
                      <motion.div
                        key={`t-${idx}`}
                        animate={{
                          scale: step.tIdx === idx ? 1.2 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          backgroundColor: step.tIdx === idx ? '#dcfce7' : '#f1f5f9',
                          border: step.tIdx === idx ? '2px solid #10b981' : '1px solid #cbd5e1',
                          fontSize: 12,
                          fontWeight: 600,
                          color: step.tIdx === idx ? '#047857' : '#334155',
                        }}
                      >
                        {char}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Current XOR state */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: 10, backgroundColor: '#f0f9ff', borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 600, color: '#0c4a6e' }}>Current XOR Result</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>{step.result}</div>
                </div>
                {step.currentCharCode !== undefined && (
                  <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: '#92400e' }}>Char Code</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
                      '{step.currentChar}' = {step.currentCharCode}
                    </div>
                  </div>
                )}
              </div>

              {/* XOR Operation Info */}
              {(step.phase === 'xor_s' || step.phase === 'xor_t') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 12,
                    backgroundColor: step.phase === 'xor_s' ? '#eff6ff' : '#f0fdf4',
                    border: step.phase === 'xor_s' ? '2px solid #0284c7' : '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: step.phase === 'xor_s' ? '#0c4a6e' : '#166534' }}>
                    {step.phase === 'xor_s' ? 'Processing string s' : 'Processing string t'}
                  </div>
                  {step.currentChar && (
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      {step.currentChar} ^ result = {step.result}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Explanation */}
              {step.phase === 'init' && (
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
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>XOR Properties:</div>
                  <div>a ⊕ a = 0 (same bits cancel out)</div>
                  <div>a ⊕ 0 = a (XOR with 0 preserves value)</div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 12,
                    backgroundColor: '#dcfce7',
                    border: '2px solid #10b981',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>
                    ✓ Difference found: '{step.finalChar}'
                  </div>
                  <div style={{ fontSize: 11, marginTop: 4, color: '#047857' }}>
                    All duplicate chars cancel out via XOR
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"},{"key":"t","label":"t","type":"string"}]}
          values={{ s: sInput, t: tInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 't') setTInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
