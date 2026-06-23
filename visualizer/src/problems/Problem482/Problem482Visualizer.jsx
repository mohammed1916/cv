import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem482Visualizer.css'

const EXAMPLES = getExamples('license-key-formatting') || [
  { label: 'Example 1', s: '5F3Z-2e-9-w', k: 4 },
  { label: 'Example 2', s: '2-4A0r-4k', k: 4 },
]

function generateSteps(s, k) {
  const steps = []

  if (!s || k <= 0) {
    steps.push({ activeLine: 1, message: 'Invalid input', done: true, result: '' })
    return steps
  }

  steps.push({ activeLine: 1, message: `Format license key: remove dashes, uppercase, group by ${k}`, s, k })

  steps.push({ activeLine: 2, message: 'Pass 1: remove dashes and convert to uppercase' })

  const cleaned = []
  for (let i = 0; i < s.length; i++) {
    const char = s[i]
    if (char === '-') {
      steps.push({ activeLine: 3, message: `Skip dash at position ${i}`, char })
    } else {
      const upper = char.toUpperCase()
      cleaned.push(upper)
      steps.push({ activeLine: 4, message: `Add '${char}' → '${upper}' at position ${cleaned.length - 1}`, char: upper, cleaned: [...cleaned] })
    }
  }

  steps.push({ activeLine: 5, message: `Cleaned string: ${cleaned.join('')}`, cleaned: [...cleaned] })

  steps.push({ activeLine: 6, message: `Pass 2: split into groups of ${k} from the end` })

  const groups = []
  let currentGroup = []

  for (let i = cleaned.length - 1; i >= 0; i--) {
    currentGroup.unshift(cleaned[i])
    steps.push({ activeLine: 7, message: `Add cleaned[${i}]='${cleaned[i]}' to group (size=${currentGroup.length})`, current: cleaned[i] })

    if (currentGroup.length === k || i === 0) {
      const groupStr = currentGroup.join('')
      groups.unshift(groupStr)
      steps.push({ activeLine: 8, message: `Group complete: "${groupStr}" → add to result`, group: groupStr, groups: [...groups] })
      currentGroup = []
    }
  }

  const result = groups.join('-')
  steps.push({ activeLine: 9, message: `Final result: "${result}"`, done: true, result, groups: [...groups] })
  return steps
}

function VisualizationPanel({ s, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 6, border: '1px solid #10b981' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#166534' }}>Input</div>
          <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#047857', marginTop: 4, wordBreak: 'break-all' }}>
            {s}
          </div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#92400e' }}>Group Size</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
            {k}
          </div>
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Algorithm</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          (1) Remove dashes & uppercase. (2) Group from right to left, each group has k chars (leftmost may have fewer).
        </div>
      </div>

      {step?.cleaned && step.cleaned.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>After Cleaning</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: 10, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            {step.cleaned.map((ch, i) => (
              <motion.div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                  backgroundColor: step.current === ch ? '#fef08a' : '#dbeafe',
                  border: step.current === ch ? '2px solid #f59e0b' : '1px solid #0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  color: step.current === ch ? '#92400e' : '#0c4a6e',
                }}
                animate={{ scale: step.current === ch ? 1.1 : 1 }}
              >
                {ch}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.groups && step.groups.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Groups Formed</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {step.groups.map((grp, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  backgroundColor: step.group === grp ? '#fef3c7' : '#ecfdf5',
                  border: step.group === grp ? '2px solid #f59e0b' : '1px solid #10b981',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: 12,
                  color: step.group === grp ? '#92400e' : '#047857',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {grp}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.result && (
        <div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6, border: '2px solid #22c55e' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6 }}>Final Result</div>
          <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, color: '#16a34a', wordBreak: 'break-all' }}>
            {step.result}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem482Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('license-key-formatting')

  const steps = useMemo(
    () => generateSteps(ex.s, ex.k).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '🔑 License Key Format',
      content: <VisualizationPanel s={ex.s} k={ex.k} step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
