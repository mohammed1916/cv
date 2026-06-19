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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem428Visualizer.css'

const EXAMPLES = getExamples('serialize-deserialize-nary-tree')

function generateSteps(treeStr) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    treeStr,
    serialized: '',
    deserialized: [],
    traversalStack: [],
    message: `Start serialization and deserialization of N-ary tree`,
  })

  let serialized = ''
  let traversalStack = []

  for (let i = 0; i < Math.min(treeStr.length, 8); i++) {
    const char = treeStr[i]
    serialized += char
    traversalStack.push(char)

    steps.push({
      activeLine: 2,
      phase: 'serialize',
      treeStr,
      serialized,
      deserialized: [],
      traversalStack: [...traversalStack],
      currentChar: char,
      message: `Serialize: read character '${char}'`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'deserialize',
    treeStr,
    serialized,
    deserialized: serialized.split(''),
    traversalStack: [...traversalStack],
    isComplete: true,
    message: `Deserialization complete: reconstructed tree`,
  })

  return steps
}

function SerializationVisualization({ serialized, treeStr, currentChar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Serialization Progress</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        fontFamily: 'monospace',
        fontSize: 12,
      }}>
        <div style={{ marginBottom: 8, color: '#475569' }}>Input tree:</div>
        <div style={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}>
          {treeStr.split('').map((char, idx) => (
            <span
              key={idx}
              style={{
                padding: '4px 8px',
                borderRadius: 3,
                backgroundColor: char === currentChar ? '#fee2e2' : '#f1f5f9',
                border: char === currentChar ? '2px solid #dc2626' : '1px solid #cbd5e1',
                color: char === currentChar ? '#991b1b' : '#475569',
                fontWeight: 600,
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <div style={{ color: '#475569', marginBottom: 8 }}>Output:</div>
        <div style={{
          padding: 8,
          backgroundColor: '#dbeafe',
          borderRadius: 4,
          border: '1px solid #0284c7',
          color: '#0c4a6e',
        }}>
          {serialized || '(serializing...)'}
        </div>
      </div>
    </div>
  )
}

function DeserializationVisualization({ deserialized, isComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Deserialization {isComplete && '✓'}
      </div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 60,
      }}>
        {deserialized.length > 0 ? (
          deserialized.map((char, idx) => (
            <motion.span
              key={idx}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: '#ecfdf5',
                border: '1px solid #10b981',
                color: '#047857',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {char}
            </motion.span>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>reconstructing tree...</div>
        )}
      </div>
    </div>
  )
}

function TraversalStackVisualization({ stack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Processing Stack</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 4,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        {stack.length > 0 ? (
          stack.map((item, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: '#f3e8ff',
                border: '1px solid #8b5cf6',
                color: '#6b21a8',
                fontSize: 11,
                fontWeight: 600,
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {item}
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>empty stack</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SerializationVisualization
          serialized={step?.serialized || ''}
          treeStr={step?.treeStr || ''}
          currentChar={step?.currentChar}
        />

        <DeserializationVisualization
          deserialized={step?.deserialized || []}
          isComplete={step?.isComplete || false}
        />

        <TraversalStackVisualization
          stack={step?.traversalStack || []}
        />
      </div>
    </div>
  )
}

export default function Problem428Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { treeStr: '1[3[5[6]4[3[8[4[5[4[8[1[1[6]8]1]2[8]5[2]7[1]7[4[4[2]2]1[1[6]8]1]3[5[1[1[4]3[2]2[4[8]2[1[9]1]1[8]1[1[6]8]1]3[5[1[1[4]3[2]2[4[8]2[1[9]1]1[8]1', label: 'NaryTree' })
  const SOLUTION_CODE = useSolutionCode('serialize-deserialize-nary-tree')

  const steps = useMemo(
    () =>
      generateSteps(ex.treeStr).map((current) => ({
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
      title: '🌳 Serialize/Deserialize',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

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
