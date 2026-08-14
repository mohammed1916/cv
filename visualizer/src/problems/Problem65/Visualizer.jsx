import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'digit', 'sign', 'dot', 'exp', 'invalid', 'done']

const SOLUTION_CODE = [
  { line: 1, text: 'def isNumber(s: str) -> bool:' },
  { line: 2, text: '    seenDigit = seenDot = seenExp = False' },
  { line: 3, text: '    digitAfterExp = True' },
  { line: 4, text: '    for i, c in enumerate(s):' },
  { line: 5, text: '        if c.isdigit():' },
  { line: 6, text: '            seenDigit = digitAfterExp = True' },
  { line: 7, text: "        elif c in '+-':" },
  { line: 8, text: "            if i > 0 and s[i-1] not in 'eE': return False" },
  { line: 9, text: "        elif c == '.':" },
  { line: 10, text: '            if seenDot or seenExp: return False' },
  { line: 11, text: '            seenDot = True' },
  { line: 12, text: "        elif c in 'eE':" },
  { line: 13, text: '            if seenExp or not seenDigit: return False' },
  { line: 14, text: '            seenExp = True; digitAfterExp = False' },
  { line: 15, text: '        else:' },
  { line: 16, text: '            return False' },
  { line: 17, text: '    return seenDigit and digitAfterExp' },
]

const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'init',
  4: 'init',
  5: 'digit',
  6: 'digit',
  7: 'sign',
  8: 'sign',
  9: 'dot',
  10: 'dot',
  11: 'dot',
  12: 'exp',
  13: 'exp',
  14: 'exp',
  16: 'invalid',
  17: 'done',
}

function generateSteps(s) {
  const steps = []
  const chars = [...s]

  let seenDigit = false
  let seenDot = false
  let seenExp = false
  let digitAfterExp = true

  const snapshot = (extra) => ({
    chars,
    seenDigit,
    seenDot,
    seenExp,
    ...extra,
  })

  steps.push(
    snapshot({
      activeLine: 2,
      phase: 'init',
      idx: -1,
      valid: true,
      message: `Initialize flags: scan "${s}" left to right.`,
    }),
  )

  let invalid = false
  let invalidReason = ''

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]

    if (/[0-9]/.test(c)) {
      seenDigit = true
      digitAfterExp = true
      steps.push(
        snapshot({
          activeLine: 6,
          phase: 'digit',
          idx: i,
          valid: true,
          message: `'${c}' is a digit → seenDigit = true.`,
        }),
      )
    } else if (c === '+' || c === '-') {
      const prev = i > 0 ? chars[i - 1] : null
      const ok = i === 0 || prev === 'e' || prev === 'E'
      if (!ok) {
        invalid = true
        invalidReason = `Sign '${c}' at index ${i} is not at the start or right after 'e'/'E'.`
        steps.push(
          snapshot({
            activeLine: 8,
            phase: 'invalid',
            idx: i,
            valid: false,
            message: invalidReason,
          }),
        )
        break
      }
      steps.push(
        snapshot({
          activeLine: 8,
          phase: 'sign',
          idx: i,
          valid: true,
          message: `Sign '${c}' is valid (${i === 0 ? 'at start' : "right after 'e'/'E'"}).`,
        }),
      )
    } else if (c === '.') {
      if (seenDot || seenExp) {
        invalid = true
        invalidReason = seenDot
          ? "Second '.' encountered — a number can have at most one dot."
          : "'.' cannot appear after an exponent 'e'/'E'."
        steps.push(
          snapshot({
            activeLine: 10,
            phase: 'invalid',
            idx: i,
            valid: false,
            message: invalidReason,
          }),
        )
        break
      }
      seenDot = true
      steps.push(
        snapshot({
          activeLine: 11,
          phase: 'dot',
          idx: i,
          valid: true,
          message: `'.' is valid → seenDot = true.`,
        }),
      )
    } else if (c === 'e' || c === 'E') {
      if (seenExp || !seenDigit) {
        invalid = true
        invalidReason = seenExp
          ? "Second '" + c + "' — only one exponent is allowed."
          : `'${c}' needs at least one digit before it.`
        steps.push(
          snapshot({
            activeLine: 13,
            phase: 'invalid',
            idx: i,
            valid: false,
            message: invalidReason,
          }),
        )
        break
      }
      seenExp = true
      digitAfterExp = false
      steps.push(
        snapshot({
          activeLine: 14,
          phase: 'exp',
          idx: i,
          valid: true,
          message: `'${c}' starts an exponent → need a digit after it.`,
        }),
      )
    } else {
      invalid = true
      invalidReason = `'${c}' is not a valid character for a number.`
      steps.push(
        snapshot({
          activeLine: 16,
          phase: 'invalid',
          idx: i,
          valid: false,
          message: invalidReason,
        }),
      )
      break
    }
  }

  const isValid = !invalid && seenDigit && digitAfterExp
  let verdictMsg
  if (invalid) {
    verdictMsg = `Not a valid number: ${invalidReason}`
  } else if (!seenDigit) {
    verdictMsg = 'Not a valid number: no digits were seen.'
  } else if (!digitAfterExp) {
    verdictMsg = "Not a valid number: exponent 'e'/'E' has no digit after it."
  } else {
    verdictMsg = `"${s}" is a valid number ✓`
  }

  steps.push(
    snapshot({
      activeLine: 17,
      phase: 'done',
      idx: -1,
      valid: isValid,
      digitAfterExp,
      finalVerdict: true,
      result: isValid,
      message: verdictMsg,
    }),
  )

  return steps
}

const EXAMPLES = [
  { label: 'Valid decimal', s: '3.14' },
  { label: 'Sci notation', s: '2e10' },
  { label: 'Invalid', s: '1a' },
  { label: 'Sign+dot', s: '+.8' },
]

function FlagBadge({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '10px 14px',
        borderRadius: 8,
        minWidth: 92,
        backgroundColor: value ? '#dcfce7' : '#f1f5f9',
        border: `2px solid ${value ? '#16a34a' : '#cbd5e1'}`,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', fontFamily: 'monospace' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 800, color: value ? '#15803d' : '#94a3b8' }}>
        {value ? 'true' : 'false'}
      </span>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play to scan the string character by character.
      </div>
    )
  }

  const { chars = [], idx = -1, seenDigit, seenDot, seenExp, valid, phase } = step
  const isDone = phase === 'done'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 16 }}>
      {/* Character cells */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          Input scan
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {chars.length === 0 && (
            <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>
              (empty string)
            </div>
          )}
          {chars.map((c, i) => {
            const isCurrent = i === idx
            const isPast = idx >= 0 && i < idx
            const isBadHere = isCurrent && valid === false
            let bg = '#f8fafc'
            let border = '#e2e8f0'
            let color = '#334155'
            if (isBadHere) {
              bg = '#fee2e2'
              border = '#dc2626'
              color = '#991b1b'
            } else if (isCurrent) {
              bg = '#ede9fe'
              border = '#8b5cf6'
              color = '#5b21b6'
            } else if (isPast) {
              bg = '#eef2ff'
              border = '#c7d2fe'
              color = '#4338ca'
            }
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{i}</span>
                <motion.div
                  animate={isCurrent ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  style={{
                    width: 38,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    backgroundColor: bg,
                    border: `2px solid ${border}`,
                    color,
                    fontFamily: 'monospace',
                    fontSize: 20,
                    fontWeight: 700,
                  }}
                >
                  {c === ' ' ? '␣' : c}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Flags panel */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>
          Flags
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <FlagBadge label="seenDigit" value={!!seenDigit} />
          <FlagBadge label="seenDot" value={!!seenDot} />
          <FlagBadge label="seenExp" value={!!seenExp} />
        </div>
      </div>

      {/* Running verdict */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        key={`${idx}-${phase}`}
        style={{
          padding: 14,
          borderRadius: 8,
          border: `2px solid ${valid === false ? '#dc2626' : isDone ? '#16a34a' : '#8b5cf6'}`,
          backgroundColor: valid === false ? '#fef2f2' : isDone ? '#f0fdf4' : '#faf5ff',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: valid === false ? '#991b1b' : isDone ? '#15803d' : '#6d28d9',
            marginBottom: 6,
          }}
        >
          {isDone
            ? step.result
              ? '✓ Valid number'
              : '✗ Not a valid number'
            : valid === false
              ? '✗ Invalid so far'
              : 'Valid so far'}
        </div>
        <div style={{ fontSize: 13, color: '#334155' }}>{step.message}</div>
      </motion.div>
    </div>
  )
}

export default function Problem65Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("3.14");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "3.14", inputError: e.message };
    }
  }, [sInput]);
  const steps = useMemo(
    () =>
      generateSteps(s).map((c) => ({
        ...c,
        relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
      })),
    [s],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Panel divs state
  const [panelDivs, setPanelDivs] = useState(null)

  // Extract panels into consts
  const primaryPanel = (
    <>
    <div className="problem65-panel">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 12px 0' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            onClick={() => applyEx(e)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${ex.label === e.label ? '#8b5cf6' : '#cbd5e1'}`,
              backgroundColor: ex.label === e.label ? '#ede9fe' : '#ffffff',
              color: ex.label === e.label ? '#5b21b6' : '#475569',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {e.label}: <span style={{ fontFamily: 'monospace' }}>{`"${e.s}"`}</span>
          </button>
        ))}
      </div>
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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

  const vizPanel = (
    <div className="problem65-panel">
      <VisualizationPanel step={step} />
    </div>
  )

  const statusPanel = (
    <div className="problem65-status" style={{ padding: 8, fontSize: 12, color: '#64748b' }}>
      Step {stepIndex + 1} / {steps.length}
    </div>
  )

  const playbackPanel = (
    <>
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

  // Panel configuration
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Examples', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'viz', title: '🔢 Valid Number', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem65-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
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
