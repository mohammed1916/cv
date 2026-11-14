import IndexedSequence from '../../components/shared/IndexedSequence'
import authoredExamples0 from '../../config/examples/read-n-characters-given-read4-ii.js';
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

import './ReadNCharactersGivenRead4IIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = (authoredExamples0.length ? authoredExamples0 : [])

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

    allSteps.push({ fileIndex,
      activeLine: 4,
      callNum: callIdx + 1,
      n,
      globalQueue: [...globalQueue],
      message: `Call ${callIdx + 1}: read(${n})`,
      relatedLines: [4],
    })

    // Fill queue
    while (globalQueue.length < n && fileIndex < file.length) {
      allSteps.push({ fileIndex,
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
        allSteps.push({ fileIndex,
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

      allSteps.push({ fileIndex,
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

    allSteps.push({ fileIndex,
      activeLine: 10,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Extract first ${n}: [${result.join(', ')}]`,
      relatedLines: [10],
    })

    globalQueue = globalQueue.slice(n)

    allSteps.push({ fileIndex,
      activeLine: 11,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Queue after: [${globalQueue.join(', ')}]`,
      relatedLines: [11],
    })

    allSteps.push({ fileIndex,
      activeLine: 12,
      callNum: callIdx + 1,
      n,
      result,
      globalQueue: [...globalQueue],
      message: `Return: [${result.join(', ')}]`,
      relatedLines: [12],
    })
  }

  allSteps.push({ fileIndex,
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
  const consumed = step.fileIndex ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      {step.file && <IndexedSequence label="File (pointer marks the next unread character)" length={step.file.length} active={Math.min(consumed, step.file.length - 1)}
        valueAt={i => step.file[i]} roleAt={i => (i < consumed ? 'read' : '')} />}
      <div style={{ padding: 12, backgroundColor: "color-mix(in srgb, var(--warning) 22%, var(--surface))", borderRadius: 6, borderLeft: '4px solid var(--warning)' }}>
        <div style={{ fontSize: 12, color: 'var(--warning)', fontStyle: 'italic' }}>
          Multiple calls with cache: queue holds between calls, fill on demand.
        </div>
      </div>

      {step.callNum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: "color-mix(in srgb, var(--error) 22%, var(--surface))", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--error)', marginBottom: 4 }}>
            Call #{step.callNum}
          </div>
          <div style={{ fontSize: 13, color: 'var(--error)' }}>
            read({step.n})
          </div>
        </motion.div>
      )}

      {step.chunk && (
        <IndexedSequence label="Read4 chunk" length={step.chunk.length} active={-1}
          valueAt={i => step.chunk[i]} roleAt={() => 'chunk'} />
      )}

      {step.globalQueue && (step.globalQueue.length > 0 ? (
        <IndexedSequence label="Queue (cache)" length={step.globalQueue.length} active={-1}
          valueAt={i => step.globalQueue[i]} roleAt={() => 'cached'} />
      ) : (
        <section aria-label="Queue (cache)">
          <h3>Queue (cache)</h3>
          <div style={{ fontSize: 11, color: 'var(--primary)' }}>empty</div>
        </section>
      ))}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: "var(--surface2)", borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
            Return Value
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

export default function ReadNCharactersGivenRead4IIVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [fileInput, setFileInput] = useState("abcdefghij");
  const [callsInput, setCallsInput] = useState("[[3],[2],[4]]");
  const { file, calls, inputError } = useMemo(() => {
    try {
      const parsedFile = fileInput;
      const parsedCalls = JSON.parse(callsInput); if (!Array.isArray(parsedCalls)) throw new Error('calls must be an array');
      return { file: parsedFile, calls: parsedCalls, inputError: '' };
    } catch (e) {
      return { file: "abcdefghij", calls: "[[3],[2],[4]]", inputError: e.message };
    }
  }, [fileInput, callsInput]);
  const steps = useMemo(
    () =>
      generateSteps(file, calls).map((s) => ({
        ...s,
        file,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [file, calls]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels into consts
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
      {showPatternOverlay && <CodePatternAnnotations step={step} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"file","label":"file","type":"string"},{"key":"calls","label":"calls","type":"array"}]}
        values={{ file: fileInput, calls: callsInput }}
        onChange={(k, v) => { if (k === 'file') setFileInput(v); if (k === 'calls') setCallsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="rnc2-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="rnc2-status">
      {step?.message ? `Step ${stepIndex + 1}: ${step.message}` : 'Ready'}
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
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
    </>
  )

  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '📖 Read N Chars II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-right', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="rnc2-shell">
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
    </div>
  )
}
