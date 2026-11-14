import authoredExamples0 from '../../config/examples/longest-substring-with-at-most-two-distinct-characters.js';import PointerRail from '../../components/shared/PointerRail'


const AUTHORED_INITIAL = authoredExamples0[0];
import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'

import './LongestSubstringWithAtMostTwoDistinctCharactersVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = (authoredExamples0.length ? authoredExamples0 : [])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def lengthOfLongestSubstring(s):' },
  { line: 2, text: '    left = 0' },
  { line: 3, text: '    char_count = {}' },
  { line: 4, text: '    max_len = 0' },
  { line: 5, text: '    for right in range(len(s)):' },
  { line: 6, text: '        ch = s[right]' },
  { line: 7, text: '        char_count[ch] = char_count.get(ch, 0) + 1' },
  { line: 8, text: '        while len(char_count) > 2:' },
  { line: 9, text: '            left_ch = s[left]' },
  { line: 10, text: '            char_count[left_ch] -= 1' },
  { line: 11, text: '            if char_count[left_ch] == 0:' },
  { line: 12, text: '                del char_count[left_ch]' },
  { line: 13, text: '            left += 1' },
  { line: 14, text: '        max_len = max(max_len, right - left + 1)' },
  { line: 15, text: '    return max_len' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s) {
  const steps = []

  if (!s || s.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty string',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    s,
    message: 'Find longest substring with at most 2 distinct characters',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    s,
    left: 0,
    charCount: {},
    maxLen: 0,
    message: 'Initialize: left = 0, sliding window with char count map',
    relatedLines: [2, 3, 4],
  })

  let left = 0
  const charCount = {}
  let maxLen = 0
  let maxSubstring = ''

  for (let right = 0; right < s.length; right++) {
    const ch = s[right]

    steps.push({
      activeLine: 5,
      s,
      left,
      right,
      charCount: { ...charCount },
      maxLen,
      message: `Expand right pointer to ${right} (char: '${ch}')`,
      relatedLines: [5, 6],
    })

    charCount[ch] = (charCount[ch] || 0) + 1

    steps.push({
      activeLine: 7,
      s,
      left,
      right,
      charCount: { ...charCount },
      maxLen,
      message: `Add '${ch}': charCount = ${JSON.stringify(charCount)}`,
      relatedLines: [7],
    })

    while (Object.keys(charCount).length > 2) {
      steps.push({
        activeLine: 8,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Window has ${Object.keys(charCount).length} distinct chars, shrink window`,
        relatedLines: [8],
      })

      const leftCh = s[left]

      charCount[leftCh] -= 1

      steps.push({
        activeLine: 10,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Remove '${leftCh}' from left`,
        relatedLines: [10],
      })

      if (charCount[leftCh] === 0) {
        delete charCount[leftCh]

        steps.push({
          activeLine: 12,
          s,
          left,
          right,
          charCount: { ...charCount },
          maxLen,
          message: `Delete '${leftCh}' (count = 0)`,
          relatedLines: [12],
        })
      }

      left += 1

      steps.push({
        activeLine: 13,
        s,
        left,
        right,
        charCount: { ...charCount },
        maxLen,
        message: `Move left to ${left}`,
        relatedLines: [13],
      })
    }

    const currentLen = right - left + 1
    if (currentLen > maxLen) {
      maxLen = currentLen
      maxSubstring = s.substring(left, right + 1)
    }

    steps.push({
      activeLine: 14,
      s,
      left,
      right,
      charCount: { ...charCount },
      currentLen,
      maxLen,
      maxSubstring,
      message: `Window: "${s.substring(left, right + 1)}" (len=${currentLen}), max=${maxLen}`,
      relatedLines: [14],
    })
  }

  steps.push({
    activeLine: 15,
    s,
    maxLen,
    maxSubstring,
    done: true,
    message: `Result: longest substring = "${maxSubstring}" (length ${maxLen})`,
    relatedLines: [15],
  })

  return steps
}

function StringVisualization({ s, left, right }) {
  if (!s) return null

  return (
    <PointerRail lift={{ scale: 1.1, within: true }}
      title="Input string"
      values={s.split('')}
      pointers={[
        { id: 'l', index: left, label: 'l', tone: 'primary' },
        { id: 'r', index: right, label: 'r', tone: 'primary' },
      ]}
      range={{ start: left, end: right }}
    />
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: "var(--primary)" }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6, borderLeft: '4px solid var(--info)' }}>
        <div style={{ fontSize: 12, color: 'var(--info)', fontStyle: 'italic' }}>
          Sliding window: expand right, shrink left to maintain ≤2 distinct chars.
        </div>
      </div>

      {step.s && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 8 }}>
            String
          </div>
          <StringVisualization s={step.s} left={step.left} right={step.right} />
        </motion.div>
      )}

      {step.left !== undefined && step.right !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
            Window Info
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--success)' }}>
            <div>left: {step.left}, right: {step.right}</div>
            {step.currentLen && <div>current length: {step.currentLen}</div>}
          </div>
        </motion.div>
      )}

      {step.charCount && Object.keys(step.charCount).length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--info)', marginBottom: 8 }}>
            Character Count ({Object.keys(step.charCount).length} distinct)
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(step.charCount).map(([char, count]) => (
              <div key={char} style={{ fontSize: 11, color: 'var(--info)', fontFamily: 'monospace', fontWeight: 600 }}>
                '{char}': {count}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.maxLen !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
            Maximum Length
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: 'var(--success)' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--success)" }}>{step.maxLen}</div>
            {step.maxSubstring && <div>"{step.maxSubstring}"</div>}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: "color-mix(in srgb, var(--warning) 22%, var(--surface))", borderRadius: 6, fontSize: 12, color: 'var(--warning)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function LongestSubstringWithAtMostTwoDistinctCharactersVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","s":"eceba"});
  const [sInput, setSInput] = useState(String(AUTHORED_INITIAL.s));
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "eceba", inputError: e.message };
    }
  }, [sInput]);  const steps = useMemo(
    () =>
      generateSteps(s).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [s]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setSInput(String(e.s)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels into consts
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} linePatternMap={LINE_PATTERN_MAP} />}
    </div>
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"s","label":"s","type":"string"}]}
        values={{ s: sInput }}
        onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="lsatdc-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="lsatdc-status">
      <div style={{ fontSize: 12, color: "var(--primary)" }}>
        {step && step.message ? step.message : 'Press play to begin'}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
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
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
    </>
  )

  // Lumino state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: 'Longest Substring 2 Chars', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-right', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="lsatdc-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
