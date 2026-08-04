import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './AssignCookiesVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findContentChildren(self, g: List[int], s: List[int]) -> int:' },
  { line: 3, text: '        g.sort()' },
  { line: 4, text: '        s.sort()' },
  { line: 5, text: '        ' },
  { line: 6, text: '        child_idx = 0' },
  { line: 7, text: '        cookie_idx = 0' },
  { line: 8, text: '        ' },
  { line: 9, text: '        while child_idx < len(g) and cookie_idx < len(s):' },
  { line: 10, text: '            if s[cookie_idx] >= g[child_idx]:' },
  { line: 11, text: '                child_idx += 1' },
  { line: 12, text: '            cookie_idx += 1' },
  { line: 13, text: '        ' },
  { line: 14, text: '        return child_idx' },
]

const PATTERNS = ['sort', 'match', 'satisfy', 'move', 'done']
const LINE_PATTERN_MAP = {
  3: 'sort',
  9: 'match',
  10: 'satisfy',
  12: 'move',
  14: 'done',
}

function generateSteps(g, s) {
  const steps = []

  if (!Array.isArray(g) || !Array.isArray(s) || g.length === 0 || s.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 14,
      relatedLines: [14],
      message: 'Empty input.',
      result: 0,
      done: true,
    })
    return steps
  }

  const gSorted = [...g].sort((a, b) => a - b)
  const sSorted = [...s].sort((a, b) => a - b)

  steps.push({
    phase: 'sort',
    activeLine: 3,
    relatedLines: [3, 4],
    message: 'Sort both greed and cookie arrays.',
    g: gSorted,
    s: sSorted,
  })

  let childIdx = 0
  let cookieIdx = 0

  steps.push({
    phase: 'match',
    activeLine: 9,
    relatedLines: [9],
    message: 'Start matching greediness to cookies.',
    g: gSorted,
    s: sSorted,
    childIdx,
    cookieIdx,
    satisfied: 0,
  })

  let satisfied = 0

  while (childIdx < gSorted.length && cookieIdx < sSorted.length) {
    steps.push({
      phase: 'satisfy',
      activeLine: 10,
      relatedLines: [10],
      message: `Cookie ${sSorted[cookieIdx]} >= Greed ${gSorted[childIdx]}? ${sSorted[cookieIdx] >= gSorted[childIdx] ? 'Yes' : 'No'}`,
      g: gSorted,
      s: sSorted,
      childIdx,
      cookieIdx,
      satisfied,
      checkChild: childIdx,
      checkCookie: cookieIdx,
    })

    if (sSorted[cookieIdx] >= gSorted[childIdx]) {
      satisfied++
      steps.push({
        phase: 'match',
        activeLine: 11,
        relatedLines: [11],
        message: `Child ${childIdx} satisfied with cookie ${cookieIdx}! Move to next child.`,
        g: gSorted,
        s: sSorted,
        childIdx,
        cookieIdx,
        satisfied,
      })
      childIdx++
    } else {
      steps.push({
        phase: 'move',
        activeLine: 12,
        relatedLines: [12],
        message: `Cookie too small. Try next cookie.`,
        g: gSorted,
        s: sSorted,
        childIdx,
        cookieIdx,
        satisfied,
      })
    }

    cookieIdx++
  }

  steps.push({
    phase: 'done',
    activeLine: 14,
    relatedLines: [14],
    message: `Satisfied ${satisfied} children total.`,
    result: satisfied,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step?.g && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Greediness Factors (Sorted)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {step.g.map((greed, idx) => (
                <motion.div
                  key={`g-${idx}-${greed}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: '#334155',
                    borderColor: idx === step.childIdx ? '#38bdf8' : '#64748b',
                    color: idx === step.childIdx ? '#38bdf8' : '#94a3b8',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {greed}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.s && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Cookies (Sorted)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {step.s.map((cookie, idx) => (
                <motion.div
                  key={`s-${idx}-${cookie}`}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: '#334155',
                    borderColor: idx === step.cookieIdx ? '#f59e0b' : '#64748b',
                    color: idx === step.cookieIdx ? '#f59e0b' : '#94a3b8',
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {cookie}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.checkChild !== undefined && step?.checkCookie !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #64748b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Current Matching</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace' }}>
            Child greed: {step.g[step.checkChild]} ↔ Cookie: {step.s[step.checkCookie]}
          </div>
        </div>
      )}

      {step?.satisfied !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
            {step.done ? 'Total Satisfied' : 'Currently Satisfied'}
          </div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#22c55e' }}>{step.satisfied}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function AssignCookiesVisualizer() {
  const examples = useMemo(() => getExamplesOr('assign-cookies', []), [])
  const [gInput, setGInput] = useState('[1,2,3]')
  const [sInput, setSInput] = useState('[1,1]')

  const { g, gError } = useMemo(() => {
    try {
      const parsed = JSON.parse(gInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array')
      return { g: parsed, gError: '' }
    } catch (e) {
      return { g: [], gError: e.message }
    }
  }, [gInput])

  const { s, sError } = useMemo(() => {
    try {
      const parsed = JSON.parse(sInput)
      if (!Array.isArray(parsed)) throw new Error('Input must be array')
      return { s: parsed, sError: '' }
    } catch (e) {
      return { s: [], sError: e.message }
    }
  }, [sInput])

  const steps = useMemo(() => generateSteps(g, s), [g, s])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setGInput(JSON.stringify(ex.g || ex.greed || []))
      setSInput(JSON.stringify(ex.s || ex.cookies || []))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
        ),
      },
      {
        id: 'viz',
        title: '🍪 Assign Cookies',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Greed Factors</div>
                <textarea
                  value={gInput}
                  onChange={(e) => {
                    setGInput(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    height: 60,
                    padding: '8px',
                    borderRadius: 4,
                    border: gError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
                {gError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{gError}</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Cookies</div>
                <textarea
                  value={sInput}
                  onChange={(e) => {
                    setSInput(e.target.value)
                    handleReset()
                  }}
                  style={{
                    width: '100%',
                    height: 60,
                    padding: '8px',
                    borderRadius: 4,
                    border: sError ? '2px solid #f87171' : '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    resize: 'vertical',
                  }}
                />
                {sError && <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{sError}</div>}
              </div>
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, gInput, sInput, gError, sError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
      </FloatingPanel>
    </div>
  )
}
