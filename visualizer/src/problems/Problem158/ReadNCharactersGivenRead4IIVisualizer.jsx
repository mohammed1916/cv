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
import './ReadNCharactersGivenRead4IIVisualizer.css'

const EXAMPLES = getExamples('read-n-characters-given-read4-ii') || [
  { label: 'Example 1', file: 'abcdefghij', calls: [[3], [2], [4]] },
  { label: 'Example 2', file: 'abcdefghij', calls: [[1], [0], [4], [5]] },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.queue = []' },
  { line: 4, text: '    def read(self, n):' },
  { line: 5, text: '        while len(self.queue) < n:' },
  { line: 6, text: '            chunk = read4()' },
  { line: 7, text: '            if not chunk:' },
  { line: 8, text: '                break' },
  { line: 9, text: '            self.queue.extend(chunk)' },
  { line: 10, text: '        result = self.queue[:n]' },
  { line: 11, text: '        self.queue = self.queue[n:]' },
  { line: 12, text: '        return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(file, callSequence) {
  const steps = []

  if (!file || file.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty file',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: 'Read N Characters II: handle multiple read() calls with caching',
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    message: 'Initialize queue for caching between calls',
    relatedLines: [2, 3],
  })

  const allSteps = []
  let globalQueue = []
  let fileIndex = 0

  for (let callIdx = 0; callIdx < callSequence.length; callIdx++) {
    const n = callSequence[callIdx][0]

    allSteps.push({
      activeLine: 4,
      callNum: callIdx + 1,
      n,
      globalQueue: [...globalQueue],
      message: `Call ${callIdx + 1}: read(${n})`,
      relatedLines: [4],
    })

    // Fill queue
    while (globalQueue.length < n && fileIndex < file.length) {
      allSteps.push({
        activeLine: 5,
        callNum: callIdx + 1,
        n,
        globalQueue: [...globalQueue],
        needed: n - globalQueue.length,
        message: `Queue has ${globalQueue.length}, need ${n}. Call read4()`,
        relatedLines: [5, 6],
      })

      const chunkSize = Math.min(4, file.length - fileIndex)
      const chunk = file.substring(fileIndex, fileIndex + chunkSize).split('')
      fileIndex += chunkSize

      if (chunkSize === 0) {
        allSteps.push({
          activeLine: 7,
          callNum: callIdx + 1,
          n,
          globalQueue: [...globalQueue],
          message: 'EOF reached',
          relatedLines: [7, 8],
        })
        break
      }

      globalQueue.push(...chunk)

      allSteps.push({
        activeLine: 9,
        callNum: callIdx + 1,
        n,
        globalQueue: [...globalQueue],
        chunk,
        message: `Added chunk: [${chunk.join(', ')}]`,
        relatedLines: [9],
      })
    }

    const result = globalQueue.slice(0, n)

    allSteps.push({
      activeLine: 10,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Extract first ${n}: [${result.join(', ')}]`,
      relatedLines: [10],
    })

    globalQueue = globalQueue.slice(n)

    allSteps.push({
      activeLine: 11,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Queue after: [${globalQueue.join(', ')}]`,
      relatedLines: [11],
    })

    allSteps.push({
      activeLine: 12,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Return: [${result.join(', ')}]`,
      relatedLines: [12],
    })
  }

  allSteps.push({
    activeLine: 12,
    done: true,
    message: 'All read() calls completed',
    relatedLines: [12],
  })

  return allSteps
}

function CharacterBox({ char, style = {} }) {
  return (
    <motion.div
      style={{
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        backgroundColor: '#a5b4fc',
        border: '2px solid #4f46e5',
        fontSize: 12,
        fontWeight: 600,
        color: '#1e1b4b',
        fontFamily: 'monospace',
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {char}
    </motion.div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fed7aa', borderRadius: 6, borderLeft: '4px solid #f97316' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Multiple calls with cache: queue holds between calls, fill on demand.
        </div>
      </div>

      {step.callNum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#fecaca', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 4 }}>
            Call #{step.callNum}
          </div>
          <div style={{ fontSize: 13, color: '#7f1d1d' }}>
            read({step.n})
          </div>
        </motion.div>
      )}

      {step.chunk && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
            Read4 Chunk
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {step.chunk.map((char, idx) => (
              <CharacterBox key={idx} char={char} />
            ))}
          </div>
        </motion.div>
      )}

      {step.globalQueue && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Queue (cache)
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.globalQueue.length > 0 ? (
              step.globalQueue.map((char, idx) => (
                <CharacterBox
                  key={idx}
                  char={char}
                  style={{
                    backgroundColor: '#d1fae5',
                    border: '2px solid #10b981',
                    color: '#065f46',
                  }}
                />
              ))
            ) : (
              <div style={{ fontSize: 11, color: '#0c4a6e' }}>empty</div>
            )}
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Return Value
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {step.result.map((char, idx) => (
              <CharacterBox
                key={idx}
                char={char}
                style={{
                  backgroundColor: '#86efac',
                  border: '2px solid #22c55e',
                  color: '#065f46',
                }}
              />
            ))}
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

export default function ReadNCharactersGivenRead4IIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.file, input.calls).map((s) => ({
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
        title: '📖 Read N Chars II',
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
