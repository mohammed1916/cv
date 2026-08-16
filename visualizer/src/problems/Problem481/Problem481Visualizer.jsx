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
import { getExamplesOr } from '../../config/examplesRegistry'
import './Problem481Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'loop',


  7: 'loop',


  8: 'loop',


  9: 'loop',


  10: 'loop',


  11: 'done',


}

const EXAMPLES = getExamplesOr('magical-string', [
  { label: 'Example 1', n: 6 },
  { label: 'Example 2', n: 15 },
])

function generateSteps(n) {
  const steps = []

  if (n <= 0) {
    steps.push({ activeLine: 1, message: 'n ≤ 0 → return 0', done: true, result: 0 })
    return steps
  }

  steps.push({ activeLine: 1, message: `Build magical string up to length ${n}`, n })

  // Initialize: s = "122"
  const s = ['1', '2', '2']
  steps.push({ activeLine: 2, message: `Initialize: s = "122" (base pattern)`, s: [...s] })

  steps.push({ activeLine: 3, message: `Start index pointer at i=0 (pointing to s[0]='1')`, i: 0 })

  let i = 0
  let charIndex = 1 // Which char to use (alternates 1, 2, 1, 2, ...)

  for (let iter = 0; iter < 6 && s.length < n; iter++) {
    const count = parseInt(s[i])
    const nextChar = charIndex === 1 ? '2' : '1'

    steps.push({ activeLine: 4, message: `Read s[${i}]=${count}: next char to repeat is '${nextChar}'`, index: i, count })

    steps.push({ activeLine: 5, message: `Will append ${count} × '${nextChar}' to string`, char: nextChar, count })

    for (let j = 0; j < count && s.length < n; j++) {
      s.push(nextChar)
      steps.push({ activeLine: 6, message: `Append: s.length=${s.length}, added '${nextChar}'`, s: [...s] })
    }

    charIndex = charIndex === 1 ? 2 : 1
    steps.push({ activeLine: 7, message: `Next char: toggle to '${charIndex === 1 ? '1' : '2'}'` })

    i++
    steps.push({ activeLine: 8, message: `Move pointer: i=${i}`, i })

    if (s.length >= n) {
      steps.push({ activeLine: 9, message: `String length ${s.length} ≥ target ${n}, stop` })
      break
    }
  }

  // Count ones
  const ones = s.slice(0, n).filter(ch => ch === '1').length
  steps.push({ activeLine: 10, message: `Trim to length ${n}: s = "${s.slice(0, n).join('')}"` })

  steps.push({ activeLine: 11, message: `Count '1's: ${ones}`, done: true, s: s.slice(0, n), result: ones })
  return steps
}

function VisualizationPanel({ n, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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
                backgroundColor: 'var(--surface2)',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Pattern</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Magical string: s[i] tells how many times to append the next digit. Starts "122", alternates appending 2s and 1s.
        </div>
      </div>

      {step?.n && (
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #10b981' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#166534' }}>Target Length</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 700, color: '#12873d' }}>{step.n}</div>
        </div>
      )}

      {step?.s && step.s.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
            Magical String ({step.s.length} / {step.n})
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid var(--border)', maxHeight: 100, overflowY: 'auto' }}>
            {step.s.map((ch, idx) => (
              <motion.div
                key={`${idx}-${ch}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: ch === '1' ? '#f0fdf4' : '#fee2e2',
                  border: `2px solid ${ch === '1' ? '#10b981' : '#dc2626'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: ch === '1' ? '#10b981' : '#dc2626',
                }}
                animate={{ scale: 1 }}
              >
                {ch}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.index !== undefined && (
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Current Index Pointer</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#a36907' }}>i = {step.index}</div>
        </div>
      )}

      {step?.count !== undefined && (
        <div style={{ padding: 10, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #d8b4fe' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6b21a8', marginBottom: 4 }}>Repeat Count</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>{step.count}</div>
        </div>
      )}

      {step?.char && (
        <div style={{ padding: 10, backgroundColor: step.char === '1' ? '#f0fdf4' : '#fee2e2', borderRadius: 6, border: `2px solid ${step.char === '1' ? '#10b981' : '#dc2626'}` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: step.char === '1' ? '#166534' : '#991b1b', marginBottom: 4 }}>Char to Append</div>
          <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 700, color: step.char === '1' ? '#16a34a' : '#dc2626' }}>'{step.char}'</div>
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 4 }}>Count of '1's in First {step.n} Chars</div>
          <div style={{ fontSize: 20, fontFamily: 'monospace', fontWeight: 700, color: '#12873d' }}>{step.result}</div>
        </div>
      )}
    </div>
  )
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def magicalString(n):' },
  { line: 2, text: '    s=[1,2,2]' },
  { line: 3, text: '    i=2' },
  { line: 4, text: '    while len(s)<n:' },
  { line: 5, text: '        s+=[3-s[-1]]*s[i]' },
  { line: 6, text: '        i+=1' },
  { line: 7, text: '    return sum(1 for x in s[:n] if x==1)' },
  { line: 8, text: '' },
  { line: 9, text: '' },
  { line: 10, text: '' },
  { line: 11, text: '' },
  { line: 12, text: '' },
]

export default function Problem481Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [nInput, setNInput] = useState(6);
  const { n, inputError } = useMemo(() => {
    try {
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { n: parsedN, inputError: '' };
    } catch (e) {
      return { n: 6, inputError: e.message };
    }
  }, [nInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(n).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [n]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setNInput(String(e.n)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '✨ Magical String', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel n={n} step={step} applyEx={applyEx} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"n","label":"n","type":"number"}]}
          values={{ n: nInput }}
          onChange={(k, v) => { if (k === 'n') setNInput(v); handleReset() }}
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}

