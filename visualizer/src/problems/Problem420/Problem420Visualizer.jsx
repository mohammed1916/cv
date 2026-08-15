import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem420Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('strong-password-checker')

const PATTERNS = ['check_char', 'check_length', 'check_length_long', 'count_missing', 'done', 'init', 'scan']
const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'scan',
  3: 'check_char',
  4: 'count_missing',
  5: 'check_length',
  6: 'check_length_long',
  7: 'done'
}


const EXAMPLES = [
  { label: 'Short', password: 'a', expected: 5 },
  { label: 'NoUpper', password: 'aabbcc', expected: 1 },
  { label: 'NoDigit', password: 'ABbBb', expected: 1 },
]

function generateSteps(password) {
  const steps = []

  steps.push({
    activeLine: 1,
    message: `Check password strength: "${password}"`,
    phase: 'init',
    result: 0,
    edits: 0,
    hasLower: false,
    hasUpper: false,
    hasDigit: false,
    length: password.length,
    password,
  })

  let hasLower = false, hasUpper = false, hasDigit = false

  steps.push({
    activeLine: 2,
    message: `Scan password for character types.`,
    phase: 'scan',
    result: 0,
    edits: 0,
    hasLower,
    hasUpper,
    hasDigit,
    length: password.length,
    password,
  })

  for (let i = 0; i < password.length; i++) {
    const char = password[i]
    const isLower = /[a-z]/.test(char)
    const isUpper = /[A-Z]/.test(char)
    const isDigit = /[0-9]/.test(char)

    if (isLower) hasLower = true
    if (isUpper) hasUpper = true
    if (isDigit) hasDigit = true

    steps.push({
      activeLine: 3,
      message: `Char '${char}': lower=${isLower}, upper=${isUpper}, digit=${isDigit}`,
      phase: 'check_char',
      result: 0,
      edits: 0,
      hasLower,
      hasUpper,
      hasDigit,
      length: password.length,
      currentChar: i,
      password,
    })
  }

  let edits = 0
  const missing = (hasLower ? 0 : 1) + (hasUpper ? 0 : 1) + (hasDigit ? 0 : 1)

  steps.push({
    activeLine: 4,
    message: `Missing character types: ${missing}. Need: ${!hasLower ? 'lower ' : ''}${!hasUpper ? 'upper ' : ''}${!hasDigit ? 'digit' : ''}`,
    phase: 'count_missing',
    result: 0,
    edits,
    hasLower,
    hasUpper,
    hasDigit,
    length: password.length,
    missing,
    password,
  })

  edits = missing

  if (password.length < 6) {
    const needed = 6 - password.length
    edits = Math.max(edits, needed)

    steps.push({
      activeLine: 5,
      message: `Password too short. Need ${needed} more characters. Edits: ${edits}`,
      phase: 'check_length',
      result: edits,
      edits,
      hasLower,
      hasUpper,
      hasDigit,
      length: password.length,
      missing,
      password,
    })
  } else if (password.length > 20) {
    const toDelete = password.length - 20
    edits = toDelete + missing

    steps.push({
      activeLine: 6,
      message: `Password too long. Delete ${toDelete} chars. Edits: ${edits}`,
      phase: 'check_length_long',
      result: edits,
      edits,
      hasLower,
      hasUpper,
      hasDigit,
      length: password.length,
      missing,
      password,
    })
  }

  steps.push({
    activeLine: 7,
    message: `Complete. Minimum edits needed: ${edits}`,
    phase: 'done',
    result: edits,
    edits,
    hasLower,
    hasUpper,
    hasDigit,
    length: password.length,
    missing,
    password,
  })

  return steps
}

function PasswordCheckerVisualization({ password, step }) {
  const result = step?.result || 0
  const hasLower = step?.hasLower || false
  const hasUpper = step?.hasUpper || false
  const hasDigit = step?.hasDigit || false
  const length = step?.length || 0
  const missing = step?.missing || 0

  const isValid = hasLower && hasUpper && hasDigit && length >= 6 && length <= 20

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Strong Password Checker</div>

      {/* Password display */}
      <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, border: '2px solid #cbd5e1' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Password</div>
        <div style={{
          fontSize: 14,
          fontFamily: 'monospace',
          color: '#1e293b',
          wordBreak: 'break-all',
          letterSpacing: '2px',
        }}>
          {password.split('').map((char, idx) => {
            const isLower = /[a-z]/.test(char)
            const isUpper = /[A-Z]/.test(char)
            const isDigit = /[0-9]/.test(char)
            const isCurrent = step?.currentChar === idx

            let color = '#64748b'
            if (isLower) color = '#059669'
            if (isUpper) color = '#0284c7'
            if (isDigit) color = '#f59e0b'

            return (
              <span
                key={idx}
                style={{
                  color,
                  fontWeight: isCurrent ? 700 : 600,
                  backgroundColor: isCurrent ? '#c7d2fe' : 'transparent',
                  padding: '2px 4px',
                  borderRadius: '2px',
                }}
              >
                {char}
              </span>
            )
          })}
        </div>
      </div>

      {/* Requirements checklist */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Requirements</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          <div style={{
            padding: 10,
            backgroundColor: hasLower ? '#f0fdf4' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${hasLower ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: hasLower ? '#065f46' : '#7f1d1d' }}>
              {hasLower ? '✓' : '✗'} Lowercase
            </div>
            <div style={{ fontSize: 10, color: hasLower ? '#065f46' : '#7f1d1d', marginTop: 4 }}>
              At least one a-z
            </div>
          </div>
          <div style={{
            padding: 10,
            backgroundColor: hasUpper ? '#f0fdf4' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${hasUpper ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: hasUpper ? '#065f46' : '#7f1d1d' }}>
              {hasUpper ? '✓' : '✗'} Uppercase
            </div>
            <div style={{ fontSize: 10, color: hasUpper ? '#065f46' : '#7f1d1d', marginTop: 4 }}>
              At least one A-Z
            </div>
          </div>
          <div style={{
            padding: 10,
            backgroundColor: hasDigit ? '#f0fdf4' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${hasDigit ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: hasDigit ? '#065f46' : '#7f1d1d' }}>
              {hasDigit ? '✓' : '✗'} Digit
            </div>
            <div style={{ fontSize: 10, color: hasDigit ? '#065f46' : '#7f1d1d', marginTop: 4 }}>
              At least one 0-9
            </div>
          </div>
          <div style={{
            padding: 10,
            backgroundColor: length >= 6 && length <= 20 ? '#f0fdf4' : '#fee2e2',
            borderRadius: 6,
            border: `2px solid ${length >= 6 && length <= 20 ? '#10b981' : '#ef4444'}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: length >= 6 && length <= 20 ? '#065f46' : '#7f1d1d' }}>
              {length >= 6 && length <= 20 ? '✓' : '✗'} Length
            </div>
            <div style={{ fontSize: 10, color: length >= 6 && length <= 20 ? '#065f46' : '#7f1d1d', marginTop: 4 }}>
              6-20 chars ({length})
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div style={{
        padding: 12,
        backgroundColor: isValid ? '#f0fdf4' : '#fee2e2',
        borderRadius: 6,
        border: `2px solid ${isValid ? '#10b981' : '#ef4444'}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: isValid ? '#065f46' : '#7f1d1d' }}>
          {isValid ? '✓ Strong' : '✗ Weak'}
        </div>
        <div style={{ fontSize: 11, color: isValid ? '#065f46' : '#7f1d1d', marginTop: 4 }}>
          {isValid ? 'Password meets all requirements' : `Missing: ${missing} types, Length: ${length < 6 ? 'too short' : length > 20 ? 'too long' : 'ok'}`}
        </div>
      </div>

      {/* Edits needed */}
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #d946ef' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#7e22ce', marginBottom: 4 }}>Minimum Edits</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d946ef' }}>
          {result}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem420Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [passwordInput, setPasswordInput] = useState(JSON.stringify(EXAMPLES[0]?.password ?? []));
  const { password, inputError } = useMemo(() => {
    try {
      const parsedPassword = JSON.parse(passwordInput); if (!Array.isArray(parsedPassword)) throw new Error('password must be an array');
      return { password: parsedPassword, inputError: '' };
    } catch (e) {
      return { password: EXAMPLES[exIdx]?.password ?? '', inputError: e.message };
    }
  }, [passwordInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(password).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setPasswordInput(JSON.stringify(EXAMPLES[i].password)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🎯 Strong Password', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
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
                    border: exIdx === idx ? '2px solid #d946ef' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#f3e8ff' : '#f1f5f9',
                    color: exIdx === idx ? '#7e22ce' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <PasswordCheckerVisualization password={password} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"password","label":"password","type":"string"}]}
          values={{ password: passwordInput }}
          onChange={(k, v) => { if (k === 'password') setPasswordInput(v); handleReset() }}
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
