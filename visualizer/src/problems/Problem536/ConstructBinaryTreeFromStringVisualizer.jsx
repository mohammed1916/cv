import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ConstructBinaryTreeFromStringVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('construct-binary-tree-from-string')

const PATTERNS = ['done', 'init', 'number', 'open', 'pop']
const LINE_PATTERN_MAP = {
  1: 'init',
  7: 'pop',
  8: 'open',
  14: 'done'
}


const EXAMPLES = getExamples('construct-binary-tree-from-string')

const DEFAULT_EX = EXAMPLES[0] || { label: 'Default', s: '4(2(3)(1))(6(5))' }

// The parser below only advances on digits, '-', '(' and ')'. Any other character
// would leave the index unchanged and spin forever, so the input is restricted here.
const VALID_CHARS = /^[0-9()-]*$/

function generateSteps(s) {
  const steps = []
  steps.push({
    activeLine: 1,
    s,
    stack: [],
    i: 0,
    phase: 'init',
    message: `Parse string: ${s}`,
    relatedLines: [1]
  })

  const stack = []
  let i = 0

  while (i < s.length) {
    if (s[i] === ')') {
      stack.pop()
      steps.push({
        activeLine: 7,
        s,
        stack: stack.map(x => x),
        i,
        char: ')',
        phase: 'pop',
        message: `Closing paren at position ${i}, pop stack`,
        relatedLines: [7]
      })
    } else if (s[i] === '(') {
      steps.push({
        activeLine: 8,
        s,
        stack: stack.map(x => x),
        i,
        char: '(',
        phase: 'open',
        message: `Opening paren at position ${i}`,
        relatedLines: [8]
      })
    } else {
      let num = ''
      const startI = i
      while (i < s.length && (s[i].match(/\d/) || s[i] === '-')) {
        num += s[i]
        i++
      }
      i--

      steps.push({
        activeLine: 8,
        s,
        stack: stack.map(x => x),
        i,
        num: parseInt(num),
        phase: 'number',
        message: `Parse number: ${num} at position ${startI}`,
        relatedLines: [8]
      })
    }
    i++
  }

  steps.push({
    activeLine: 14,
    s,
    stack,
    phase: 'done',
    message: `Tree constructed from string`,
    relatedLines: [14],
    done: true
  })

  return steps
}

function VisualizationPanel({ s, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Construct a binary tree from a parenthesized string representation."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: 'var(--surface2)'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input String */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Input String</div>
        <div style={{ padding: 12, backgroundColor: 'var(--surface2)', borderRadius: 6, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
          {s}
        </div>
      </div>

      {/* Parse Progress */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>Parse Position</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s.split('').map((char, idx) => (
            <div
              key={`char-${idx}`}
              style={{
                padding: '8px 10px',
                borderRadius: 4,
                border: '2px solid',
                fontFamily: 'monospace',
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: step?.i === idx ? '#dbeafe' : 'var(--surface2)',
                borderColor: step?.i === idx ? '#0284c7' : 'var(--border)',
                color: step?.i === idx ? '#0c4a6e' : 'var(--border)'
              }}
            >
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Parsing Status</div>
        <div style={{ fontSize: 12, color: '#027bba' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function ConstructBinaryTreeFromStringVisualizer() {
  const [sInput, setSInput] = useState(DEFAULT_EX.s)
  const [activeLabel, setActiveLabel] = useState(DEFAULT_EX.label)

  // Plain string input - no JSON parsing, just validation.
  const { s, inputError } = useMemo(() => {
    const text = sInput.trim()
    if (!VALID_CHARS.test(text)) {
      return { s: DEFAULT_EX.s, inputError: 'only digits, "-", "(" and ")" are allowed' }
    }
    return { s: text, inputError: '' }
  }, [sInput])

  const steps = useMemo(
    () =>
      generateSteps(s).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => {
    setSInput(e.s)
    setActiveLabel(e.label)
    handleReset()
  }, [handleReset])

  const handleFieldChange = useCallback((key, text) => {
    if (key === 's') setSInput(text)
    setActiveLabel('')
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Construct BT from String', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

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
    viz: (<>
        <ManualInputPanel
          fields={[{ key: 's', label: 's', type: 'string' }]}
          values={{ s: sInput }}
          onChange={handleFieldChange}
          examples={EXAMPLES}
          activeLabel={activeLabel}
          applyExample={applyEx}
          inputError={inputError}
        />
        <VisualizationPanel
          s={s}
          step={step}
          applyEx={applyEx}
        />
      </>),
  }), [step, connectivity, setActiveLineDom, s, sInput, activeLabel, inputError, handleFieldChange, applyEx, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
