import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './OneEditDistanceVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('one-edit-distance') || [
  { label: 'Example 1', s1: 'ab', s2: 'acb' },
  { label: 'Example 2', s1: 'cab', s2: 'ab' },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def isOneEditDistance(s1, s2):' },
  { line: 2, text: '    if abs(len(s1) - len(s2)) > 1:' },
  { line: 3, text: '        return False' },
  { line: 4, text: '    if len(s1) > len(s2):' },
  { line: 5, text: '        s1, s2 = s2, s1  # s1 <= s2' },
  { line: 6, text: '    for i in range(len(s1)):' },
  { line: 7, text: '        if s1[i] != s2[i]:' },
  { line: 8, text: '            return s1[i+1:] == s2[i+1:]' },
  { line: 9, text: '    return len(s2) - len(s1) == 1' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(s1, s2) {
  const steps = []

  steps.push({
    activeLine: 1,
    s1,
    s2,
    message: `Check if "${s1}" and "${s2}" are one edit distance apart`,
    relatedLines: [1],
  })

  const lenDiff = Math.abs(s1.length - s2.length)

  steps.push({
    activeLine: 2,
    s1,
    s2,
    lenDiff,
    message: `Length difference: ${lenDiff}`,
    relatedLines: [2],
  })

  if (lenDiff > 1) {
    steps.push({
      activeLine: 3,
      s1,
      s2,
      result: false,
      done: true,
      message: `Length diff > 1: not one edit distance`,
      relatedLines: [3],
    })
    return steps
  }

  let a = s1
  let b = s2
  let swapped = false

  if (s1.length > s2.length) {
    a = s2
    b = s1
    swapped = true

    steps.push({
      activeLine: 4,
      s1,
      s2,
      a,
      b,
      message: 'Swap to ensure shorter string is first',
      relatedLines: [4, 5],
    })
  }

  steps.push({
    activeLine: 6,
    s1,
    s2,
    a,
    b,
    message: `Compare char by char: a="${a}", b="${b}"`,
    relatedLines: [6],
  })

  for (let i = 0; i < a.length; i++) {
    steps.push({
      activeLine: 7,
      s1,
      s2,
      a,
      b,
      i,
      aChar: a[i],
      bChar: b[i],
      message: `Position ${i}: '${a[i]}' vs '${b[i]}'`,
      relatedLines: [7],
    })

    if (a[i] !== b[i]) {
      const aRest = a.substring(i + 1)
      const bRest = b.substring(i + 1)
      const match = aRest === bRest

      steps.push({
        activeLine: 8,
        s1,
        s2,
        a,
        b,
        i,
        mismatchPos: i,
        aRest,
        bRest,
        message: `Mismatch at ${i}: a rest="${aRest}", b rest="${bRest}"`,
        relatedLines: [8],
      })

      steps.push({
        activeLine: 8,
        s1,
        s2,
        result: match,
        done: true,
        message: `Rest matches: ${match} → ${match ? 'True (one edit)' : 'False (more than one edit)'}`,
        relatedLines: [8],
      })

      return steps
    }
  }

  steps.push({
    activeLine: 9,
    s1,
    s2,
    a,
    b,
    lenDiff,
    message: `All chars match. Length diff: ${b.length - a.length}`,
    relatedLines: [9],
  })

  const result = b.length - a.length === 1

  steps.push({
    activeLine: 9,
    s1,
    s2,
    result,
    done: true,
    message: `${result ? 'True (one insertion)' : 'False (identical)'}`,
    relatedLines: [9],
  })

  return steps
}

function StringComparison({ s1, s2, highlightIdx, mismatchPos }) {
  const maxLen = Math.max(s1.length, s2.length)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
          String 1
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {s1.split('').map((char, idx) => {
            const isMismatch = mismatchPos !== undefined && idx === mismatchPos
            const isHighlight = highlightIdx !== undefined && idx === highlightIdx

            return (
              <motion.div
                key={idx}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  backgroundColor: isMismatch ? '#fecaca' : isHighlight ? '#fbbf24' : '#e2e8f0',
                  border: isMismatch ? '2px solid #ef4444' : isHighlight ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                }}
                animate={{ scale: isHighlight ? 1.15 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
          String 2
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {s2.split('').map((char, idx) => {
            const isMismatch = mismatchPos !== undefined && idx === mismatchPos
            const isHighlight = highlightIdx !== undefined && idx === highlightIdx

            return (
              <motion.div
                key={idx}
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  backgroundColor: isMismatch ? '#fecaca' : isHighlight ? '#fbbf24' : '#e2e8f0',
                  border: isMismatch ? '2px solid #ef4444' : isHighlight ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                }}
                animate={{ scale: isHighlight ? 1.15 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fbcfe8', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          Compare strings: mismatch check rest, length check insertion.
        </div>
      </div>

      {step.s1 && step.s2 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            String Comparison
          </div>
          <StringComparison
            s1={step.s1}
            s2={step.s2}
            highlightIdx={step.i}
            mismatchPos={step.mismatchPos}
          />
        </motion.div>
      )}

      {step.lenDiff !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Length Difference
          </div>
          <div style={{ fontSize: 13, color: '#065f46' }}>
            |{step.s1?.length || 0} - {step.s2?.length || 0}| = {step.lenDiff}
          </div>
        </motion.div>
      )}

      {step.aRest !== undefined && step.bRest !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            After Mismatch
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, color: '#5b21b6', fontFamily: 'monospace' }}>
            <div>Rest 1: "{step.aRest}"</div>
            <div>Rest 2: "{step.bRest}"</div>
            <div>Match: {step.aRest === step.bRest ? '✓ Yes' : '✗ No'}</div>
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? '#dcfce7' : '#fee2e2',
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: step.result ? '#065f46' : '#7f1d1d', marginBottom: 4 }}>
            Result
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: step.result ? '#10b981' : '#ef4444' }}>
            {step.result ? 'True' : 'False'}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function OneEditDistanceVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.s1, input.s2).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [input]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panels into consts
  const primaryPanel = (
    <div className="oed-panel">
      <div className="oed-panel-head">✏️ One Edit Distance</div>
      <div className="oed-panel-body">
        <VisualizationPanel step={step} />
      </div>
    </div>
  )

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

  const statusPanel = (
    <div className="oed-status">
      {step?.message ?? 'Press Play or Step to begin.'}
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

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '✏️ One Edit Distance', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="oed-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
