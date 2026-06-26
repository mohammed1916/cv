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
import { getExamples } from '../../config/examplesRegistry'
import './CompareVersionNumbersVisualizer.css'

const EXAMPLES = getExamples('compare-version-numbers') || [
  { label: 'Example 1', version1: '1.0', version2: '1.0.0' },
  { label: 'Example 2', version1: '0.1', version2: '0.1.0' },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def compareVersion(v1, v2):' },
  { line: 2, text: '    parts1 = list(map(int, v1.split(".")))' },
  { line: 3, text: '    parts2 = list(map(int, v2.split(".")))' },
  { line: 4, text: '    max_len = max(len(parts1), len(parts2))' },
  { line: 5, text: '    for i in range(max_len):' },
  { line: 6, text: '        p1 = parts1[i] if i < len(parts1) else 0' },
  { line: 7, text: '        p2 = parts2[i] if i < len(parts2) else 0' },
  { line: 8, text: '        if p1 < p2: return -1' },
  { line: 9, text: '        if p1 > p2: return 1' },
  { line: 10, text: '    return 0' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(version1, version2) {
  const steps = []

  steps.push({
    activeLine: 1,
    version1,
    version2,
    message: `Compare versions: "${version1}" vs "${version2}"`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    version1,
    version2,
    message: 'Split versions by "." and convert to integers',
    relatedLines: [2, 3],
  })

  const parts1 = version1.split('.').map(Number)
  const parts2 = version2.split('.').map(Number)

  steps.push({
    activeLine: 2,
    version1,
    version2,
    parts1,
    parts2,
    message: `v1 parts: [${parts1.join(', ')}], v2 parts: [${parts2.join(', ')}]`,
    relatedLines: [2, 3],
  })

  const maxLen = Math.max(parts1.length, parts2.length)

  steps.push({
    activeLine: 4,
    version1,
    version2,
    parts1,
    parts2,
    maxLen,
    message: `Max length: ${maxLen}`,
    relatedLines: [4],
  })

  steps.push({
    activeLine: 5,
    version1,
    version2,
    parts1,
    parts2,
    maxLen,
    message: 'Compare each revision level',
    relatedLines: [5],
  })

  for (let i = 0; i < maxLen; i++) {
    const p1 = i < parts1.length ? parts1[i] : 0
    const p2 = i < parts2.length ? parts2[i] : 0

    steps.push({
      activeLine: 6,
      version1,
      version2,
      parts1,
      parts2,
      i,
      p1,
      p2,
      message: `Index ${i}: v1[${i}]=${p1}, v2[${i}]=${p2}`,
      relatedLines: [6, 7],
    })

    if (p1 < p2) {
      steps.push({
        activeLine: 8,
        version1,
        version2,
        parts1,
        parts2,
        i,
        p1,
        p2,
        result: -1,
        done: true,
        message: `${p1} < ${p2}: v1 is smaller → return -1`,
        relatedLines: [8],
      })
      return steps
    }

    if (p1 > p2) {
      steps.push({
        activeLine: 9,
        version1,
        version2,
        parts1,
        parts2,
        i,
        p1,
        p2,
        result: 1,
        done: true,
        message: `${p1} > ${p2}: v1 is larger → return 1`,
        relatedLines: [9],
      })
      return steps
    }

    steps.push({
      activeLine: 5,
      version1,
      version2,
      parts1,
      parts2,
      i,
      p1,
      p2,
      message: `${p1} == ${p2}: equal, continue`,
      relatedLines: [5],
    })
  }

  steps.push({
    activeLine: 10,
    version1,
    version2,
    parts1,
    parts2,
    result: 0,
    done: true,
    message: 'All parts equal → return 0',
    relatedLines: [10],
  })

  return steps
}

function VersionParts({ parts, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {parts.map((part, idx) => (
          <motion.div
            key={idx}
            style={{
              padding: '6px 8px',
              borderRadius: 3,
              backgroundColor: '#a5b4fc',
              border: '2px solid #4f46e5',
              fontSize: 12,
              fontWeight: 600,
              color: '#1e1b4b',
              fontFamily: 'monospace',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {part}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>
          Parse versions: split by dots, pad shorter with zeros, compare element-wise.
        </div>
      </div>

      {step.version1 && step.version2 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Input Versions
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#065f46', fontFamily: 'monospace' }}>
            <div>v1: {step.version1}</div>
            <div>v2: {step.version2}</div>
          </div>
        </motion.div>
      )}

      {step.parts1 && step.parts2 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <VersionParts parts={step.parts1} label="Version 1 Parts" />
            <VersionParts parts={step.parts2} label="Version 2 Parts" />
          </div>
        </motion.div>
      )}

      {step.i !== undefined && step.p1 !== undefined && step.p2 !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Current Comparison (Index {step.i})
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>
            <div style={{ color: '#0c4a6e' }}>
              {step.p1}
            </div>
            <div style={{ color: '#64748b' }}>
              {step.p1 < step.p2 ? '<' : step.p1 > step.p2 ? '>' : '=='}
            </div>
            <div style={{ color: '#0c4a6e' }}>
              {step.p2}
            </div>
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor:
              step.result === 0 ? '#f3e8ff' : step.result < 0 ? '#fecaca' : '#dcfce7',
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: step.result === 0 ? '#5b21b6' : step.result < 0 ? '#7f1d1d' : '#065f46',
              marginBottom: 4,
            }}
          >
            Result
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: step.result === 0 ? '#8b5cf6' : step.result < 0 ? '#ef4444' : '#10b981',
              fontFamily: 'monospace',
            }}
          >
            {step.result === 0 ? '0 (equal)' : step.result < 0 ? '-1 (v1 smaller)' : '1 (v1 larger)'}
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

export default function CompareVersionNumbersVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.version1, input.version2).map((s) => ({
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

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />
        ),
      },
      {
        id: 'viz',
        title: '🔢 Compare Versions',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
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
