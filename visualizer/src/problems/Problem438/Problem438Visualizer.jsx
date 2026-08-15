import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem438Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { createPortal } from 'react-dom'

// Pattern annotations
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names



const EXAMPLES = getExamplesOr('find-all-anagrams-in-string', [
  { label: 'Example 1', s: 'cbaebabacd', p: 'abc' },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findAnagrams(s,p):' },
  { line: 2, text: '    if not s or not p or len(p)>len(s):' },
  { line: 3, text: '        return []' },
  { line: 4, text: '    result=[]' },
  { line: 5, text: '    pChars={}' },
  { line: 6, text: '    for c in p: pChars[c]=pChars.get(c,0)+1' },
  { line: 7, text: '    for i in range(len(s)-len(p)+1):' },
  { line: 8, text: '        window=s[i:i+len(p)]' },
  { line: 9, text: '        wChars={}' },
  { line: 10, text: '        for c in window: wChars[c]=wChars.get(c,0)+1' },
  { line: 11, text: '        if pChars==wChars: result.append(i)' },
  { line: 12, text: '    return result' },
]

function generateSteps(s, p) {
  const steps = []

  steps.push({ activeLine: 1, message: `Input validation: s="${s}", p="${p}"` })

  if (!s || !p || p.length > s.length) {
    steps.push({ activeLine: 1, message: 'Invalid input → return []', done: true, result: [] })
    return steps
  }

  steps.push({ activeLine: 2, message: 'Initialize result array' })

  const pLen = p.length
  steps.push({ activeLine: 3, message: `Get pattern length: pLen = ${pLen}` })

  const result = []
  steps.push({ activeLine: 4, message: `Start loop: i from 0 to ${s.length - pLen}` })

  // Prepare pattern character frequency
  const pChars = {}
  for (const c of p) pChars[c] = (pChars[c] ?? 0) + 1
  steps.push({ activeLine: 5, message: `Count pattern chars: ${JSON.stringify(pChars)}` })

  for (let i = 0; i <= s.length - pLen; i++) {
    const window = s.substring(i, i + pLen)
    steps.push({ activeLine: 6, message: `Loop i=${i}: extract window "${window}"` })

    // Count window characters
    const windowChars = {}
    for (const c of window) windowChars[c] = (windowChars[c] ?? 0) + 1
    steps.push({ activeLine: 7, message: `Count window chars: ${JSON.stringify(windowChars)}` })

    // Check if anagram
    const isAnagram = JSON.stringify(pChars) === JSON.stringify(windowChars)
    steps.push({ activeLine: 8, message: `Compare frequencies: ${isAnagram ? 'match!' : 'no match'}` })

    if (isAnagram) {
      result.push(i)
      steps.push({ activeLine: 9, message: `Found anagram at index ${i}` })
      steps.push({ activeLine: 10, message: `Record result: ${JSON.stringify(result)}` })
    }
  }

  steps.push({ activeLine: 11, message: `Done looping. Final result length: ${result.length}` })
  steps.push({ activeLine: 12, message: `Return result: [${result.join(', ')}]`, done: true, result })
  return steps
}

function StringVisualization({ s, windowStart, windowEnd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>String with Window</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {s && s.split('').map((char, idx) => {
            const inWindow = idx >= windowStart && idx < windowEnd

            return (
              <motion.div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: inWindow ? '#dbeafe' : '#f1f5f9',
                  border: inWindow ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: inWindow ? '#0c4a6e' : '#64748b',
                }}
                animate={{ scale: inWindow ? 1.1 : 1 }}
                >
                  {char}
                </div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                  {idx}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PatternVisualization({ p }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Pattern to Find</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f3e8ff',
        borderRadius: 8,
        border: '2px solid #8b5cf6',
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {p && p.split('').map((char, idx) => (
            <div
              key={idx}
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                backgroundColor: '#ede9fe',
                border: '2px solid #8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#6b21a8',
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultsVisualization({ s, result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Anagram Start Indices</div>
      <div style={{
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        border: '2px solid #10b981',
        minHeight: 60,
      }}>
        {result && result.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {result.map((idx, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#d1fae5',
                  borderRadius: 4,
                  border: '2px solid #10b981',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#047857',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                {idx}
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No anagrams found yet</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx, s, p, windowStart, windowEnd, result }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 10, backgroundColor: '#e0e7ff', borderRadius: 6, border: '1px solid #6366f1', fontSize: 12, color: '#3730a3' }}>
          {step.message}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <PatternVisualization p={p} />

      <StringVisualization
        s={s}
        windowStart={windowStart || 0}
        windowEnd={windowEnd || 0}
      />

      <ResultsVisualization
        s={s}
        result={result || []}
      />
    </div>
  )
}

export default function Problem438Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("cbaebabacd");
  const [pInput, setPInput] = useState("abc");
  const { s, p, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      const parsedP = pInput;
      return { s: parsedS, p: parsedP, inputError: '' };
    } catch (e) {
      return { s: "cbaebabacd", p: "abc", inputError: e.message };
    }
  }, [sInput, pInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () =>
      generateSteps(s, p).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
        s: s,
        p: p,
        result: current.result || [],
      })),
    [s, p]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); setPInput(String(e.p)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔤 Anagrams', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          step={step}
          applyEx={applyEx}
          s={s}
          p={p}
          windowStart={step?.windowStart || 0}
          windowEnd={step?.windowEnd || 0}
          result={step?.result || []}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"},{"key":"p","label":"p","type":"string"}]}
          values={{ s: sInput, p: pInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 'p') setPInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
