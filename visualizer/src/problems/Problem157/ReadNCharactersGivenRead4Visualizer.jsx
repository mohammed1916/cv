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
import './ReadNCharactersGivenRead4Visualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamples('read-n-characters-given-read4') || [
  { label: 'Example 1', file: 'abcdefghij', n: 5 },
  { label: 'Example 2', file: 'abcdefghij', n: 12 },
]

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def read(n):' },
  { line: 2, text: '    buf = []' },
  { line: 3, text: '    while len(buf) < n:' },
  { line: 4, text: '        chunk = read4()  # reads up to 4 chars' },
  { line: 5, text: '        if not chunk:' },
  { line: 6, text: '            break  # EOF' },
  { line: 7, text: '        buf.extend(chunk)' },
  { line: 8, text: '    return buf[:n]  # return first n' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(file, n) {
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
    message: `Read ${n} characters from "${file}" using read4()`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    buf: [],
    message: 'Initialize buffer',
    relatedLines: [2],
  })

  const buf = []
  const readChunks = []
  let fileIndex = 0

  while (buf.length < n && fileIndex < file.length) {
    steps.push({
      activeLine: 3,
      buf: [...buf],
      remaining: n - buf.length,
      message: `Read next chunk (need ${n - buf.length} more)`,
      relatedLines: [3],
    })

    // Simulate read4()
    const chunkSize = Math.min(4, file.length - fileIndex)
    const chunk = file.substring(fileIndex, fileIndex + chunkSize).split('')
    fileIndex += chunkSize

    steps.push({
      activeLine: 4,
      buf: [...buf],
      chunk,
      message: `read4() returned: [${chunk.map(c => `"${c}"`).join(', ')}]`,
      relatedLines: [4],
    })

    if (chunk.length === 0) {
      steps.push({
        activeLine: 5,
        buf: [...buf],
        message: 'EOF reached',
        relatedLines: [5, 6],
      })
      break
    }

    buf.push(...chunk)
    readChunks.push([...chunk])

    steps.push({
      activeLine: 7,
      buf: [...buf],
      chunk,
      readChunks: readChunks.map(c => [...c]),
      message: `buf = [${buf.map(c => `"${c}"`).join(', ')}]`,
      relatedLines: [7],
    })
  }

  const result = buf.slice(0, n)

  steps.push({
    activeLine: 8,
    buf: [...buf],
    result,
    readChunks: readChunks.map(c => [...c]),
    done: true,
    message: `Return first ${n}: [${result.map(c => `"${c}"`).join(', ')}]`,
    relatedLines: [8],
  })

  return steps
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
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Simulate read4: read 4 chars at a time, accumulate, return n.
        </div>
      </div>

      {step.chunk && step.chunk.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>
            Current Chunk (read4)
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {step.chunk.map((char, idx) => (
              <CharacterBox key={idx} char={char} />
            ))}
          </div>
        </motion.div>
      )}

      {step.buf && step.buf.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Buffer (accumulated)
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.buf.map((char, idx) => (
              <CharacterBox
                key={idx}
                char={char}
                style={{
                  backgroundColor: '#d1fae5',
                  border: '2px solid #10b981',
                  color: '#065f46',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {step.readChunks && step.readChunks.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
            Read4 Calls ({step.readChunks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step.readChunks.map((chunk, chunkIdx) => (
              <div key={chunkIdx} style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 11, color: '#5b21b6', fontWeight: 600, minWidth: 40 }}>
                  Call {chunkIdx + 1}:
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {chunk.map((char, idx) => (
                    <CharacterBox
                      key={idx}
                      char={char}
                      style={{
                        width: 28,
                        height: 28,
                        fontSize: 11,
                        backgroundColor: '#e9d5ff',
                        border: '1px solid #a78bfa',
                        color: '#5b21b6',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Result (first {step.result.length})
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

export default function ReadNCharactersGivenRead4Visualizer() {
  const [input, setInput] = useState(EXAMPLES[0])
  const steps = useMemo(
    () =>
      generateSteps(input.file, input.n).map((s) => ({
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
        title: '📖 Read N Chars',
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
