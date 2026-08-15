import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import VisualizerPlaybackSection from '../../components/VisualizerPlaybackSection'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useApplyExample } from '../../hooks/useApplyExample'
import { useVisualizationFeatures } from '../../hooks/useVisualizationFeatures'
import { getVisualizationFeatures } from '../../config/visualizationRegistry'
import { getExamples } from '../../config/examplesRegistry'
import './MinimumWindowSubstringVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import LuminoDockPanel from '../../components/LuminoDockPanel'
const SOLUTION_CODE = getSolutionCode('minimum-window-substring')

const MINIMUMWINDOWSUBSTRING_PATTERNS = ['best', 'done', 'expand', 'init', 'shrink']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'done',
  7: 'init',
  13: 'expand',
  15: 'best',
  19: 'shrink',
  20: 'done',
}

function buildNeed(t) {
  const out = {}
  for (const ch of t) out[ch] = (out[ch] || 0) + 1
  return out
}

function generateSteps(s, t) {
  const steps = []
  if (!s || !t) {
    return [{ phase: 'done', activeLine: 3, s, t, left: 0, right: -1, need: buildNeed(t), have: {}, formed: 0, required: Object.keys(buildNeed(t)).length, best: null, message: 'Empty input. Return "".' }]
  }

  const need = buildNeed(t)
  const have = {}
  const required = Object.keys(need).length
  let formed = 0
  let left = 0
  let best = null
  steps.push({ phase: 'init', activeLine: 7, s, t, left, right: -1, need: { ...need }, have: { ...have }, formed, required, best, message: `Need ${required} unique chars from t.` })

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]
    have[ch] = (have[ch] || 0) + 1
    if (need[ch] && have[ch] === need[ch]) formed++
    steps.push({ phase: 'expand', activeLine: 13, s, t, left, right, need: { ...need }, have: { ...have }, formed, required, best, message: `Expand right to ${right} ('${ch}'). formed=${formed}/${required}.` })

    while (left <= right && formed === required) {
      const len = right - left + 1
      if (!best || len < best.len) {
        best = { len, l: left, r: right, value: s.slice(left, right + 1) }
        steps.push({ phase: 'best', activeLine: 15, s, t, left, right, need: { ...need }, have: { ...have }, formed, required, best: { ...best }, message: `New best window "${best.value}" [${best.l}, ${best.r}].` })
      }
      const drop = s[left]
      have[drop] -= 1
      if (need[drop] && have[drop] < need[drop]) formed--
      left++
      steps.push({ phase: 'shrink', activeLine: 19, s, t, left, right, need: { ...need }, have: { ...have }, formed, required, best: best ? { ...best } : null, message: `Shrink left, removed '${drop}', formed=${formed}/${required}.` })
    }
  }

  steps.push({ phase: 'done', activeLine: 20, s, t, left, right: s.length - 1, need: { ...need }, have: { ...have }, formed, required, best, message: best ? `Return "${best.value}".` : 'No valid window found. Return "".' })
  return steps
}

const EXAMPLES = getExamples('minimum-window-substring')

const SNIPPETS = [
  { id: 'init', label: 'Init', lines: [4, 5, 6, 7, 8, 9] },
  { id: 'loop', label: 'Expand', lines: [10, 11, 12, 13, 14] },
  { id: 'update', label: 'Shrink/Update', lines: [15, 16, 17, 18, 19] },
  { id: 'return', label: 'Return', lines: [20] },
]

function snippetIdForPhase(phase) {
  if (phase === 'init') return 'init'
  if (phase === 'expand') return 'loop'
  if (phase === 'best' || phase === 'shrink') return 'update'
  if (phase === 'done') return 'return'
  return 'loop'
}

export default function MinimumWindowSubstringVisualizer() {
  // Load solution code from registry

  const [sInput, setSInput] = useState('ADOBECODEBANC')
  const [tInput, setTInput] = useState('ABC')
  const s = sInput ?? ''
  const t = tInput ?? ''

  const steps = useMemo(
    () => generateSteps(s, t).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [s, t],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useApplyExample((ex) => {
    setSInput(ex.s)
    setTInput(ex.t)
  }, handleReset)

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })

  // Use modular visualization features system
  const vizFeatureDefs = getVisualizationFeatures('minimum-window-substring')
  const { items: vizFeatures, toggle: toggleVizFeature } = useVisualizationFeatures(vizFeatureDefs)

  const handleSInputChange = useCallback((e) => {
    setSInput(e.target.value)
    handleReset()
  }, [handleReset])

  const handleTInputChange = useCallback((e) => {
    setTInput(e.target.value)
    handleReset()
  }, [handleReset])

  // Extract panels for Lumino layout
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"},{"key":"t","label":"t","type":"string"}]}
        values={{ s: sInput, t: tInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); if (k === 't') setTInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
      />

    <div className="mws-panel">
      <header className="mws-head"><span>Sliding Window</span></header>
      <div className="mws-body">
        <div className="mws-examples">
          {EXAMPLES.map((ex) => <button key={ex.label} className="mws-chip" onClick={() => applyExample(ex)}>{ex.label}</button>)}
        </div>
        <div className="mws-inputs">
          <input className="mws-input" value={sInput} onChange={handleSInputChange} placeholder="s" />
          <input className="mws-input small" value={tInput} onChange={handleTInputChange} placeholder="t" />
        </div>
        <div className="mws-string">
          {s.split('').map((ch, i) => {
            const inWindow = i >= (step?.left ?? 0) && i <= (step?.right ?? -1)
            const left = i === step?.left
            const right = i === step?.right
            const inBest = step?.best && i >= step.best.l && i <= step.best.r
            const focusLines = right
              ? [10, 11, 12, 13]
              : left
                ? [16, 17, 18, 19]
                : inBest
                  ? [15, 20]
                  : [10, 14]
            return (
              <motion.div
                key={`${ch}-${i}`}
                className={`mws-char ${inWindow ? 'window' : ''} ${left ? 'left' : ''} ${right ? 'right' : ''} ${inBest ? 'best' : ''}`}
                onClick={() =>
                  connectivity.setVisualFocus({
                    lines: focusLines,
                    reason: `Character '${ch}' at index ${i} selected in window view.`,
                    targetType: 'char',
                    targetId: String(i),
                  })
                }
                style={{ cursor: 'pointer' }}
              >
                <span>{ch}</span>
                <small>{i}</small>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  
    </>)

  const statePanel = (
    <div className="mws-panel">
      <header className="mws-head"><span>Frequency State</span></header>
      <div className="mws-body">
        <div className="mws-metrics">
          <div><span>formed</span><strong>{step?.formed ?? 0}</strong></div>
          <div><span>required</span><strong>{step?.required ?? 0}</strong></div>
          <div><span>best</span><strong>{step?.best?.value ?? '—'}</strong></div>
        </div>
        <div className="mws-freq-grid">
          {Object.entries(step?.need || {}).map(([ch, req]) => {
            const hv = step?.have?.[ch] || 0
            return (
              <div
                key={ch}
                className={`mws-freq ${hv >= req ? 'ok' : ''}`}
                onClick={() =>
                  connectivity.setVisualFocus({
                    lines: [4, 5, 6, 7, 11, 12, 13, 18],
                    reason: `Frequency bucket '${ch}' selected (${hv}/${req}).`,
                    targetType: 'freq',
                    targetId: ch,
                  })
                }
                style={{ cursor: 'pointer' }}
              >
                <span>{ch}</span>
                <strong>{hv}/{req}</strong>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <VisualizerPlaybackSection
        step={step}
        codeLines={SOLUTION_CODE}
        statusClassName="mws-status"
        statusDone={step?.phase === 'done'}
        statusMessage={step?.message}
        fallbackStatus="Press Play to begin."
        playback={{
          stepIndex,
          stepForward,
          stepBack,
          togglePlay,
          handleReset,
          isPlaying,
          speed,
          setSpeed,
          isDone,
        }}
        connectivity={{
          snippetOptions: SNIPPETS,
          activeSnippetId: connectivity.activeSnippetId,
          highlightedLines: connectivity.highlightedLines,
          linkInfo: connectivity.linkInfo,
          onLineSelect: connectivity.handleLineSelect,
          onSnippetSelect: connectivity.handleSnippetSelect,
        }}
        visualizationFeatures={vizFeatures}
        onVisualizationToggle={toggleVizFeature}
        disableResizer
      />
    </div>
  )

  const statusPanel = (
    <div className="mws-status" style={{ borderRadius: '8px', padding: '10px 12px', background: 'rgba(15,23,42,.7)', borderTop: '1px solid var(--border)' }}>
      {step?.message || 'Press Play to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {/* Playback controls handled in VisualizerPlaybackSection */}
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Sliding Window', dockMode: 'split-right' },
      { id: 'state', title: 'Frequency State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="mws-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
    </div>
  )
}
