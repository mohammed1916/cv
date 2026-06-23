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
import './ConstructBinaryTreeFromStringVisualizer.css'

const EXAMPLES = getExamples('construct-binary-tree-from-string')

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

      {/* Input String */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input String</div>
        <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all' }}>
          {s}
        </div>
      </div>

      {/* Parse Progress */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Parse Position</div>
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
                backgroundColor: step?.i === idx ? '#dbeafe' : '#f1f5f9',
                borderColor: step?.i === idx ? '#0284c7' : '#cbd5e1',
                color: step?.i === idx ? '#0c4a6e' : '#334155'
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
        <div style={{ fontSize: 12, color: '#0284c7' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function ConstructBinaryTreeFromStringVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { s: '4(2(3)(1))(6(5))' })

  const steps = useMemo(
    () =>
      generateSteps(ex.s).map((current) => ({
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
      title: '🌳 Construct BT from String',
      content: (
        <VisualizationPanel
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
