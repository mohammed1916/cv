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
import './Problem434Visualizer.css'

const PATTERNS = ['init', 'scan', 'segment_start', 'inside', 'space', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'scan',
  6: 'space',
  7: 'segment_start',
  8: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def countSegments(s: str) -> int:' },
  { line: 2, text: '    count = 0' },
  { line: 3, text: '    for i, ch in enumerate(s):' },
  { line: 4, text: '        # a segment starts at a non-space whose' },
  { line: 5, text: '        # left neighbour is a space (or the string start)' },
  { line: 6, text: '        if ch != " " and (i == 0 or s[i - 1] == " "):' },
  { line: 7, text: '            count += 1' },
  { line: 8, text: '    return count' },
]

function generateSteps(text) {
  const steps = []
  try {
    const s = text ?? ''
    if (s.length > 80) throw new Error('keep the string to 80 characters or fewer')

    let count = 0
    const marks = new Array(s.length).fill(null) // 'start' | 'inside' | 'space'

    const snap = (extra) => ({
      s,
      count,
      marks: [...marks],
      ...extra,
    })

    steps.push(snap({
      phase: 'init',
      activeLine: 2,
      message: `s = "${s}" (length ${s.length}). Count = 0. A segment is a maximal run of non-space characters.`,
    }))

    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      const isStart = ch !== ' ' && (i === 0 || s[i - 1] === ' ')

      if (ch === ' ') {
        marks[i] = 'space'
        steps.push(snap({
          phase: 'space',
          activeLine: 6,
          pointer: i,
          message: `i=${i}: space — not a segment start.`,
        }))
      } else if (isStart) {
        count++
        marks[i] = 'start'
        steps.push(snap({
          phase: 'segment_start',
          activeLine: 7,
          pointer: i,
          message: `i=${i}: '${ch}' with a space (or string start) to its left → new segment #${count}.`,
        }))
      } else {
        marks[i] = 'inside'
        steps.push(snap({
          phase: 'inside',
          activeLine: 6,
          pointer: i,
          message: `i=${i}: '${ch}' continues the current segment.`,
        }))
      }
    }

    const segments = s.split(' ').filter((p) => p.length > 0)
    steps.push(snap({
      phase: 'done',
      activeLine: 8,
      result: count,
      segments,
      message: `Result: ${count} segment(s)${segments.length ? ` — ${segments.map((p) => `"${p}"`).join(', ')}` : ''}.`,
    }))
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, error: true, message: `Error: ${e.message}` })
  }
  return steps
}

const EXAMPLES = getExamplesOr('number-of-segments-in-a-string', [
  { label: 'Example 1', s: 'Hello, my name is John' },
  { label: 'Example 2', s: 'Hello' },
  { label: 'Padded', s: '   love   live!  mu   ' },
  { label: 'Empty', s: '' },
])

export default function Problem434Visualizer() {
  const [text, setText] = useState('Hello, my name is John')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(
    () => (text.length > 80 ? 'keep the string to 80 characters or fewer' : ''),
    [text],
  )

  const steps = useMemo(
    () => generateSteps(text).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [text],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setText(ex.s)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const primaryPanel = (
    <div className="p434-panel-primary">
      <div className="p434-card">
        <div className="p434-section-label">Input</div>
        <div className="p434-input-row">
          <div className="p434-field grow">
            <label className="p434-input-label" htmlFor="p434-s">s</label>
            <input
              id="p434-s"
              className={`p434-input mono ${inputError ? 'has-error' : ''}`}
              value={text}
              onChange={(e) => { setText(e.target.value); handleReset() }}
              placeholder="Hello, my name is John"
            />
          </div>
        </div>
        <p className={`p434-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Leading, trailing and repeated spaces do not create empty segments.'}
        </p>
        <div className="p434-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p434-example-btn ${text === ex.s ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {step && !step.error && (
        <div className="p434-card">
          <div className="p434-section-label">Character Scan</div>
          {step.s.length === 0 ? (
            <p className="p434-hint">Empty string — 0 segments.</p>
          ) : (
            <div className="p434-chars">
              {step.s.split('').map((ch, idx) => (
                <motion.div
                  key={idx}
                  className={`p434-char ${step.marks[idx] ?? ''} ${idx === step.pointer ? 'pointer' : ''}`}
                  animate={{ scale: idx === step.pointer ? 1.15 : 1 }}
                >
                  <span className="p434-char-glyph">{ch === ' ' ? '␣' : ch}</span>
                  <span className="p434-char-idx">{idx}</span>
                </motion.div>
              ))}
            </div>
          )}
          <div className="p434-legend">
            <span><i className="p434-sw start" /> segment start</span>
            <span><i className="p434-sw inside" /> inside segment</span>
            <span><i className="p434-sw space" /> space</span>
          </div>
        </div>
      )}

      {step?.segments && (
        <div className="p434-card">
          <div className="p434-section-label">Segments Found</div>
          <div className="p434-segments">
            {step.segments.length === 0
              ? <p className="p434-hint">None.</p>
              : step.segments.map((seg, idx) => (
                <div key={idx} className="p434-segment">
                  <span className="p434-segment-n">{idx + 1}</span>{seg}
                </div>
              ))}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div className="p434-result">
          <div className="p434-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p434-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p434-panel-state">
      <div className="p434-card">
        <div className="p434-section-label">Counters</div>
        <div className="p434-stat-grid">
          <div className="p434-stat highlight"><span className="p434-stat-key">count</span><span className="p434-stat-val">{step?.count ?? 0}</span></div>
          {step?.pointer !== undefined && (
            <div className="p434-stat"><span className="p434-stat-key">i</span><span className="p434-stat-val">{step.pointer}</span></div>
          )}
          <div className="p434-stat"><span className="p434-stat-key">len(s)</span><span className="p434-stat-val">{step?.s?.length ?? 0}</span></div>
        </div>
      </div>

      {step && !step.error && step.pointer !== undefined && (
        <div className="p434-card">
          <div className="p434-section-label">Boundary Test</div>
          <div className="p434-stat-grid">
            <div className="p434-stat">
              <span className="p434-stat-key">s[i]</span>
              <span className="p434-stat-val">{step.s[step.pointer] === ' ' ? '␣' : step.s[step.pointer]}</span>
            </div>
            <div className="p434-stat">
              <span className="p434-stat-key">s[i-1]</span>
              <span className="p434-stat-val">
                {step.pointer === 0 ? '—' : (step.s[step.pointer - 1] === ' ' ? '␣' : step.s[step.pointer - 1])}
              </span>
            </div>
          </div>
          <p className="p434-hint">
            Start when s[i] is not a space AND (i == 0 OR s[i-1] is a space).
          </p>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p434-panel-code">
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
    <div className="p434-panel-status">
      <div className={`p434-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    []
  )

  return (
    <div className="p434-shell">
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
        document.body
      )}
    </div>
  )
}
