import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './Problem214Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'build_combined', 'match', 'fallback', 'advance', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'build_combined',
  3: 'init',
  6: 'fallback',
  8: 'match',
  9: 'advance',
  11: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def shortestPalindrome(s):' },
  { line: 2, text: '    combined = s + "#" + s[::-1]' },
  { line: 3, text: '    fail = [0] * len(combined)' },
  { line: 4, text: '    k = 0' },
  { line: 5, text: '    for i in range(1, len(combined)):' },
  { line: 6, text: '        while k > 0 and combined[i] != combined[k]:' },
  { line: 7, text: '            k = fail[k - 1]' },
  { line: 8, text: '        if combined[i] == combined[k]:' },
  { line: 9, text: '            k += 1' },
  { line: 10, text: '        fail[i] = k' },
  { line: 11, text: '    return s[k:][::-1] + s' },
]

function generateSteps(sRaw) {
  const steps = []
  try {
    const s = String(sRaw)
    if (s.length > 24) throw new Error('Use at most 24 characters for a readable trace')
    if (/#/.test(s)) throw new Error('"#" is used as the separator — pick other characters')

    if (s.length === 0) {
      steps.push({
        phase: 'done', activeLine: 11,
        message: 'Empty string is already a palindrome — result is ""',
        s, combined: '', fail: [], k: 0, i: -1, result: '',
      })
      return steps
    }

    const reversed = s.split('').reverse().join('')
    const combined = `${s}#${reversed}`
    const n = combined.length

    steps.push({
      phase: 'build_combined',
      activeLine: 2,
      message: `Build combined = s + "#" + reverse(s) = "${combined}"`,
      s, reversed, combined, fail: new Array(n).fill(0), k: 0, i: -1, sepIndex: s.length,
    })

    const fail = new Array(n).fill(0)
    let k = 0

    steps.push({
      phase: 'init',
      activeLine: 3,
      message: 'Failure (LPS) table initialised to zeros, k = 0',
      s, reversed, combined, fail: [...fail], k, i: -1, sepIndex: s.length,
    })

    for (let i = 1; i < n; i++) {
      while (k > 0 && combined[i] !== combined[k]) {
        const prev = k
        k = fail[k - 1]
        steps.push({
          phase: 'fallback',
          activeLine: 7,
          message: `'${combined[i]}' ≠ '${combined[prev]}' → fall back k from ${prev} to ${k}`,
          s, reversed, combined, fail: [...fail], k, i, sepIndex: s.length,
        })
      }
      if (combined[i] === combined[k]) {
        k += 1
        steps.push({
          phase: 'match',
          activeLine: 9,
          message: `combined[${i}]='${combined[i]}' matches combined[${k - 1}] → k = ${k}`,
          s, reversed, combined, fail: [...fail], k, i, sepIndex: s.length, matched: true,
        })
      } else {
        steps.push({
          phase: 'advance',
          activeLine: 8,
          message: `combined[${i}]='${combined[i]}' does not match with k=0 → prefix length stays 0`,
          s, reversed, combined, fail: [...fail], k, i, sepIndex: s.length,
        })
      }
      fail[i] = k
      steps.push({
        phase: 'advance',
        activeLine: 10,
        message: `fail[${i}] = ${k} (longest palindromic prefix candidate so far)`,
        s, reversed, combined, fail: [...fail], k, i, sepIndex: s.length,
      })
    }

    const prefixLen = k
    const result = s.slice(prefixLen).split('').reverse().join('') + s

    steps.push({
      phase: 'done',
      activeLine: 11,
      message: `Longest palindromic prefix has length ${prefixLen}. Prepend reverse("${s.slice(prefixLen)}") → "${result}"`,
      s, reversed, combined, fail: [...fail], k, i: n - 1, sepIndex: s.length,
      prefixLen, result,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, message: `Error: ${e.message}`, error: true })
  }
  return steps
}

const EXAMPLES = getExamplesOr('shortest-palindrome', [
  { label: 'Example 1', s: 'aacecaaa' },
  { label: 'Example 2', s: 'abcd' },
  { label: 'Example 3', s: 'aabba' },
])

export default function Problem214Visualizer() {
  const [sInput, setSInput] = useState('aacecaaa')
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(
    () => generateSteps(sInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [sInput],
  )

  const inputError = steps.length === 1 && steps[0].error ? steps[0].message : ''

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setSInput(ex.s)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const combined = step?.combined ?? ''

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"}]}
        values={{ s: sInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); handleReset(); }}
        examples={EXAMPLES}
        activeLabel={ex?.label}
        applyExample={applyEx}
        inputError={inputError}
        showExamples={false}
      />

    <div className="p214-panel-primary">
      <div className="p214-card">
        <div className="p214-section-label">Input</div>
        <div className="p214-input-row">
          <div className="p214-field grow">
            <label className="p214-input-label" htmlFor="p214-s">String s</label>
            <input
              id="p214-s"
              className={`p214-input mono ${inputError ? 'has-error' : ''}`}
              value={sInput}
              onChange={(e) => { setSInput(e.target.value); handleReset() }}
              placeholder="aacecaaa"
            />
          </div>
        </div>
        <p className={`p214-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Prepend the fewest characters in front of s to make it a palindrome.'}
        </p>
        <div className="p214-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p214-example-btn ${sInput === ex.s ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} ({ex.s})
            </button>
          ))}
        </div>
      </div>

      <div className="p214-card">
        <div className="p214-section-label">Combined String: s + &apos;#&apos; + reverse(s)</div>
        <div className="p214-strip">
          {combined.split('').map((ch, idx) => {
            const cls = [
              'p214-char',
              idx === step?.sepIndex ? 'sep' : '',
              idx === step?.i ? 'cursor-i' : '',
              idx === step?.k && step?.i !== idx ? 'cursor-k' : '',
              step?.prefixLen !== undefined && idx < step.prefixLen ? 'in-prefix' : '',
            ].filter(Boolean).join(' ')
            return (
              <motion.div
                key={idx}
                className={cls}
                initial={{ scale: 0.85 }}
                animate={{ scale: idx === step?.i ? 1.16 : 1 }}
              >
                <span className="p214-char-val">{ch}</span>
                <span className="p214-char-idx">{idx}</span>
              </motion.div>
            )
          })}
        </div>
        <div className="p214-pointer-key">
          <span className="p214-key cursor-i">i (scan)</span>
          <span className="p214-key cursor-k">k (prefix len)</span>
          <span className="p214-key sep">separator</span>
        </div>
      </div>

      <div className="p214-card">
        <div className="p214-section-label">Failure Table (LPS)</div>
        <div className="p214-strip">
          {(step?.fail ?? []).map((v, idx) => (
            <div key={idx} className={`p214-fail ${idx === step?.i ? 'active' : ''} ${idx > (step?.i ?? -1) ? 'pending' : ''}`}>
              <span className="p214-char-val">{v}</span>
              <span className="p214-char-idx">{idx}</span>
            </div>
          ))}
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p214-result">
          <div className="p214-section-label" style={{ marginBottom: '0.3rem' }}>Shortest Palindrome</div>
          <div className="p214-result-val">{step.result || '""'}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p214-panel-state">
      <div className="p214-card">
        <div className="p214-section-label">Algorithm State</div>
        <div className="p214-stat-grid">
          <div className="p214-stat"><span className="p214-stat-key">i</span><span className="p214-stat-val">{step && step.i >= 0 ? step.i : '—'}</span></div>
          <div className="p214-stat highlight"><span className="p214-stat-key">k</span><span className="p214-stat-val">{step?.k ?? '—'}</span></div>
          <div className="p214-stat"><span className="p214-stat-key">|s|</span><span className="p214-stat-val">{step?.s?.length ?? '—'}</span></div>
          <div className="p214-stat"><span className="p214-stat-key">|combined|</span><span className="p214-stat-val">{combined.length || '—'}</span></div>
        </div>
      </div>

      <div className="p214-card">
        <div className="p214-section-label">Strings</div>
        <div className="p214-stat"><span className="p214-stat-key">s</span><span className="p214-stat-val">{step?.s || '—'}</span></div>
        <div className="p214-stat" style={{ marginTop: '0.4rem' }}>
          <span className="p214-stat-key">reverse(s)</span><span className="p214-stat-val">{step?.reversed || '—'}</span>
        </div>
        {step?.prefixLen !== undefined && (
          <div className="p214-stat" style={{ marginTop: '0.4rem' }}>
            <span className="p214-stat-key">palindromic prefix</span>
            <span className="p214-stat-val">{step.s.slice(0, step.prefixLen) || '""'}</span>
          </div>
        )}
      </div>

      <div className="p214-card">
        <div className="p214-section-label">Why It Works</div>
        <p className="p214-hint">
          The KMP failure value at the final position of s + &apos;#&apos; + reverse(s) is the length of the
          longest prefix of s that is also a suffix of reverse(s) — i.e. the longest palindromic prefix.
          The &apos;#&apos; separator prevents the overlap from crossing the middle.
        </p>
        <p className="p214-hint">O(n) time, O(n) space.</p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p214-panel-code">
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
  )

  const statusPanel = (
    <div className="p214-panel-status">
      <div className={`p214-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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
        onSpeedChange={(e) => setSpeed(Number(e.target.value))}
        showPatternOverlay={showPatternOverlay}
        onShowPatternOverlayChange={setShowPatternOverlay}
        patternOverlayLabel="Show pattern overlay"
        showPatternOverlayToggle
      />
    </>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p214-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
