import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './AssignCookiesVisualizer.css'

const EXAMPLES = getExamples('assign-cookies')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findContentChildren(g, s):' },
  { line: 2, text: '    g.sort()' },
  { line: 3, text: '    s.sort()' },
  { line: 4, text: '    child = 0' },
  { line: 5, text: '    for cookie in s:' },
  { line: 6, text: '        if child < len(g) and cookie >= g[child]:' },
  { line: 7, text: '            child += 1' },
  { line: 8, text: '    return child' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(g, s) {
  const steps = []
  const gSorted = [...g].sort((a, b) => a - b)
  const sSorted = [...s].sort((a, b) => a - b)

  // Initialize
  steps.push({
    activeLine: 1,
    g: gSorted,
    s: sSorted,
    gPointer: -1,
    sPointer: -1,
    assigned: [],
    satisfied: 0,
    message: 'Initialize: sort greed factors and cookies'
  })

  let assigned = []
  let i = 0

  // Iterate through cookies
  for (let j = 0; j < sSorted.length; j++) {
    steps.push({
      activeLine: 3,
      g: gSorted,
      s: sSorted,
      gPointer: i,
      sPointer: j,
      assigned,
      satisfied: i,
      message: `Check cookie ${sSorted[j]}: Can satisfy child ${gPointer < gSorted.length ? gSorted[gPointer] : 'N/A'}?`
    })

    if (i < gSorted.length && gSorted[i] <= sSorted[j]) {
      assigned.push({ childGreed: gSorted[i], cookie: sSorted[j] })
      i++
      steps.push({
        activeLine: 4,
        g: gSorted,
        s: sSorted,
        gPointer: i,
        sPointer: j,
        assigned: [...assigned],
        satisfied: i,
        message: `Assign cookie ${sSorted[j]} to child with greed ${gSorted[i - 1]}. Moving to next child.`
      })
    } else {
      steps.push({
        activeLine: 5,
        g: gSorted,
        s: sSorted,
        gPointer: i,
        sPointer: j + 1,
        assigned,
        satisfied: i,
        message: `Cookie ${sSorted[j]} cannot satisfy current child. Try next cookie.`
      })
    }
  }

  steps.push({
    activeLine: 6,
    g: gSorted,
    s: sSorted,
    gPointer: i,
    sPointer: sSorted.length,
    assigned,
    satisfied: i,
    done: true,
    message: `Done! Satisfied ${i} children out of ${gSorted.length}`
  })

  return steps
}

function VisualizationPanel({ g, s, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "You are a teacher distributing cookies to children. Each child has a greed factor g[i] (minimum cookie size they need), and each cookie has size s[j]. A child will be content with a cookie only if the cookie size is &gt;= greed factor. Your goal: maximize satisfied children."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Children Greed Factors */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Children Greed Factors: {JSON.stringify(step?.g || g)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.g?.map((greed, idx) => {
            const isActive = step && idx === step.gPointer && !step.done
            const isProcessed = step && idx < step.gPointer
            return (
              <motion.div
                key={`g-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#dbeafe' : isProcessed ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#0284c7' : isProcessed ? '#10b981' : '#cbd5e1',
                  color: isActive ? '#0c4a6e' : isProcessed ? '#047857' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {greed}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Cookies */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Cookie Sizes: {JSON.stringify(step?.s || s)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.s?.map((cookie, idx) => {
            const isActive = step && idx === step.sPointer && !step.done
            const isUsed = step && step.assigned?.some(a => a.cookie === cookie)
            return (
              <motion.div
                key={`s-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fee2e2' : isUsed ? '#dcfce7' : '#f1f5f9',
                  borderColor: isActive ? '#dc2626' : isUsed ? '#22c55e' : '#cbd5e1',
                  color: isActive ? '#991b1b' : isUsed ? '#16a34a' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                🍪 {cookie}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Assignments */}
      {step?.assigned && step.assigned.length > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 12 }}>
            Assignments ({step.assigned.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {step.assigned.map((a, idx) => (
              <div key={idx} style={{
                padding: '8px 12px',
                backgroundColor: '#dcfce7',
                borderRadius: 4,
                border: '1px solid #10b981',
                fontSize: 12
              }}>
                Child(greed:{a.childGreed}) ← 🍪 {a.cookie}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Status */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7c3aed' }}>
          {step?.satisfied ?? 0} / {step?.g?.length ?? g.length}
        </div>
        <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function AssignCookiesVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { g: [1, 2, 3], s: [1, 1] })

  const steps = useMemo(
    () =>
      generateSteps(ex.g, ex.s).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '🍪 Assign Cookies',
      content: (
        <VisualizationPanel
          g={ex.g}
          s={ex.s}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
