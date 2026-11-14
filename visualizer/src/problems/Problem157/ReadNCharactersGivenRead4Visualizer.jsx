import IndexedSequence from '../../components/shared/IndexedSequence'
import authoredExamples0 from '../../config/examples/read-n-characters-given-read4.js';
import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'

import './ReadNCharactersGivenRead4Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = (authoredExamples0.length ? authoredExamples0 : [])

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
        backgroundColor: "color-mix(in srgb, var(--primary) 22%, var(--surface))",
        border: '2px solid var(--primary)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--primary)',
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
  if (!step) return <div style={{ padding: 16, color: "var(--primary)" }}>Press play</div>
  const consumed = (step.readChunks || []).reduce((total, chunk) => total + chunk.length, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      {step.file && <IndexedSequence label="File (pointer marks the next unread character)" length={step.file.length} active={Math.min(consumed, step.file.length - 1)}
        valueAt={i => step.file[i]} roleAt={i => (i < consumed ? 'read' : '')} />}
      <div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6, borderLeft: '4px solid var(--primary)' }}>
        <div style={{ fontSize: 12, color: 'var(--primary)', fontStyle: 'italic' }}>
          Simulate read4: read 4 chars at a time, accumulate, return n.
        </div>
      </div>

      {step.chunk && step.chunk.length > 0 && (
        <IndexedSequence label="Current chunk (read4)" length={step.chunk.length} active={-1}
          valueAt={i => step.chunk[i]} roleAt={() => 'chunk'} />
      )}

      {step.buf && step.buf.length > 0 && (
        <IndexedSequence label="Buffer (accumulated)" length={step.buf.length} active={-1}
          valueAt={i => step.buf[i]} roleAt={() => 'buffered'} />
      )}

      {step.readChunks && step.readChunks.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--info)', marginBottom: 8 }}>
            Read4 Calls ({step.readChunks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step.readChunks.map((chunk, chunkIdx) => (
              <div key={chunkIdx} style={{ display: 'flex', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--info)', fontWeight: 600, minWidth: 40 }}>
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
                        backgroundColor: "var(--surface2)",
                        border: '1px solid var(--info)',
                        color: 'var(--info)',
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
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
            Result (first {step.result.length})
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {step.result.map((char, idx) => (
              <CharacterBox
                key={idx}
                char={char}
                style={{
                  backgroundColor: "color-mix(in srgb, var(--success) 22%, var(--surface))",
                  border: '2px solid var(--success)',
                  color: 'var(--success)',
                }}
              />
            ))}
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

export default function ReadNCharactersGivenRead4Visualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [fileInput, setFileInput] = useState("abcdefghij");
  const [nInput, setNInput] = useState(5);
  const { file, n, inputError } = useMemo(() => {
    try {
      const parsedFile = fileInput;
      const parsedN = Number(nInput); if (isNaN(parsedN)) throw new Error('n must be a number');
      return { file: parsedFile, n: parsedN, inputError: '' };
    } catch (e) {
      return { file: "abcdefghij", n: 5, inputError: e.message };
    }
  }, [fileInput, nInput]);
  const steps = useMemo(
    () =>
      generateSteps(file, n).map((s) => ({
        ...s,
        file,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [file, n]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 3: Extract panels into consts
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
      {showPatternOverlay && <CodePatternAnnotations {...{}} />}
    </div>
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"file","label":"file","type":"string"},{"key":"n","label":"n","type":"number"}]}
        values={{ file: fileInput, n: nInput }}
        onChange={(k, v) => { if (k === 'file') setFileInput(v); if (k === 'n') setNInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div style={{ position: 'relative', height: '100%', overflow: 'auto' }}>
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="rn4-status" style={{ padding: 8, fontSize: 12, color: "var(--primary)" }}>
      {step ? `Step ${stepIndex + 1} / ${steps.length}: ${step.message || 'Processing'}` : 'Ready'}
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
      {showPatternOverlay && <PatternLegend {...{}} />}
    </>
  )

  // Step 4: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '📖 Read N Chars', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-right', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="rn4-shell">
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
