import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import "./Visualizer.css"
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'pack_word', 'close_line', 'justify', 'done']

const SOLUTION_CODE = [
  { line: 1, text: 'def fullJustify(words, maxWidth):' },
  { line: 2, text: '    lines, cur, curLen = [], [], 0' },
  { line: 3, text: '    for w in words:' },
  { line: 4, text: '        if curLen + len(cur) + len(w) > maxWidth:' },
  { line: 5, text: '            lines.append(justify(cur, curLen, maxWidth, False))' },
  { line: 6, text: '            cur, curLen = [], 0' },
  { line: 7, text: '        cur.append(w)' },
  { line: 8, text: '        curLen += len(w)' },
  { line: 9, text: '    lines.append(justify(cur, curLen, maxWidth, True))' },
  { line: 10, text: '    return lines' },
  { line: 11, text: '' },
  { line: 12, text: 'def justify(cur, curLen, maxWidth, last):' },
  { line: 13, text: '    if last or len(cur) == 1:' },
  { line: 14, text: '        return " ".join(cur).ljust(maxWidth)' },
  { line: 15, text: '    slots = len(cur) - 1' },
  { line: 16, text: '    space, extra = divmod(maxWidth - curLen, slots)' },
  { line: 17, text: '    return distribute(cur, space, extra)' },
]

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'pack_word',
  4: 'close_line',
  5: 'close_line',
  6: 'close_line',
  7: 'pack_word',
  8: 'pack_word',
  9: 'done',
  10: 'done',
  13: 'justify',
  14: 'justify',
  15: 'justify',
  16: 'justify',
  17: 'justify',
}

// Build a fully-justified line string from a buffer of words.
function justifyLine(cur, curLen, maxWidth, isLast) {
  if (cur.length === 0) return ''.padEnd(maxWidth, ' ')
  if (isLast || cur.length === 1) {
    const joined = cur.join(' ')
    return joined.padEnd(maxWidth, ' ')
  }
  const slots = cur.length - 1
  const totalSpaces = maxWidth - curLen
  const base = Math.floor(totalSpaces / slots)
  let extra = totalSpaces % slots
  let out = ''
  for (let i = 0; i < cur.length; i++) {
    out += cur[i]
    if (i < slots) {
      const gap = base + (extra > 0 ? 1 : 0)
      if (extra > 0) extra--
      out += ' '.repeat(gap)
    }
  }
  return out
}

function generateSteps(words, maxWidth) {
  const steps = []
  const lines = []

  steps.push({
    activeLine: 2,
    phase: 'init',
    index: -1,
    cur: [],
    curLen: 0,
    lines: [],
    maxWidth,
    message: `Start greedy line packing with maxWidth = ${maxWidth}.`,
  })

  let cur = []
  let curLen = 0

  for (let i = 0; i < words.length; i++) {
    const w = words[i]
    // Would adding this word (plus the minimum single spaces between words) overflow?
    const projected = curLen + cur.length + w.length
    const overflow = cur.length > 0 && projected > maxWidth

    steps.push({
      activeLine: 4,
      phase: 'close_line',
      index: i,
      cur: [...cur],
      curLen,
      lines: [...lines],
      maxWidth,
      trying: w,
      projected,
      overflow,
      message: overflow
        ? `Adding "${w}" needs ${projected} chars > ${maxWidth}. Close the current line.`
        : `Word "${w}" fits: ${projected} <= ${maxWidth}. Keep packing.`,
    })

    if (overflow) {
      const produced = justifyLine(cur, curLen, maxWidth, false)
      lines.push(produced)
      steps.push({
        activeLine: 5,
        phase: 'justify',
        index: i,
        cur: [...cur],
        curLen,
        lines: [...lines],
        maxWidth,
        produced,
        message: `Full-justify "${cur.join(' ')}" spreading spaces evenly (extra to the left).`,
      })
      cur = []
      curLen = 0
    }

    cur.push(w)
    curLen += w.length
    steps.push({
      activeLine: 7,
      phase: 'pack_word',
      index: i,
      cur: [...cur],
      curLen,
      lines: [...lines],
      maxWidth,
      added: w,
      message: `Add "${w}" to the buffer. Buffer chars = ${curLen}, words = ${cur.length}.`,
    })
  }

  const produced = justifyLine(cur, curLen, maxWidth, true)
  lines.push(produced)
  steps.push({
    activeLine: 9,
    phase: 'justify',
    index: words.length - 1,
    cur: [...cur],
    curLen,
    lines: [...lines],
    maxWidth,
    produced,
    isLast: true,
    message: `Last line: left-justify "${cur.join(' ')}" and pad the right with spaces.`,
  })

  steps.push({
    activeLine: 10,
    phase: 'done',
    index: words.length,
    cur: [],
    curLen: 0,
    lines: [...lines],
    maxWidth,
    done: true,
    message: `Done. Produced ${lines.length} line(s), each exactly ${maxWidth} chars.`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', words: ['This', 'is', 'an', 'example', 'of', 'text', 'justification.'], maxWidth: 16 },
  { label: 'Example 2', words: ['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], maxWidth: 16 },
]

const ACCENT = '#ec4899'

// Renders one produced line as fixed-width monospace cells, spaces shown as '·'.
function LineRow({ text, maxWidth, highlight }) {
  const chars = text.split('')
  while (chars.length < maxWidth) chars.push(' ')
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {chars.map((ch, i) => {
        const isSpace = ch === ' '
        return (
          <div
            key={i}
            style={{
              width: 18,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: isSpace ? 400 : 700,
              borderRadius: 3,
              color: isSpace ? '#9d174d' : '#831843',
              background: isSpace ? '#fbcfe8' : '#fce7f3',
              border: highlight ? `1px solid ${ACCENT}` : '1px solid #f9a8d4',
            }}
          >
            {isSpace ? '·' : ch}
          </div>
        )
      })}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#9d174d', fontSize: 13 }}>
        Press play to justify the text.
      </div>
    )
  }

  const { maxWidth = 0, index = -1, cur = [], lines = [] } = step
  const curSet = new Set(cur)
  const ruler = Array.from({ length: maxWidth }, (_, i) => i)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, background: '#fce7f3', borderRadius: 6, borderLeft: `4px solid ${ACCENT}` }}>
        <div style={{ fontSize: 12, color: '#9d174d' }}>{step.message}</div>
      </div>

      {/* Words list — highlight current index and buffered words */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#831843', marginBottom: 6 }}>Words</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {step.wordsAll?.map((w, i) => {
            const isCurrent = i === index
            const isBuffered = curSet.has(w) && i <= index
            return (
              <motion.div
                key={`${w}-${i}`}
                animate={{ scale: isCurrent ? 1.08 : 1 }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#831843',
                  background: isBuffered ? '#f9a8d4' : '#fce7f3',
                  border: isCurrent ? `3px solid ${ACCENT}` : '1px solid #f9a8d4',
                }}
              >
                {w}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current buffer line */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#831843', marginBottom: 6 }}>
          Buffer line ({cur.join(' ').length + (cur.length ? 0 : 0)} chars, {cur.length} word(s))
        </div>
        <div style={{ display: 'flex', gap: 6, minHeight: 28, alignItems: 'center' }}>
          {cur.length === 0 ? (
            <span style={{ fontSize: 12, color: '#9d174d', fontStyle: 'italic' }}>empty</span>
          ) : (
            cur.map((w, i) => (
              <span key={`${w}-${i}`} style={{
                fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#831843',
                background: '#fbcfe8', padding: '4px 8px', borderRadius: 4,
              }}>{w}</span>
            ))
          )}
        </div>
      </div>

      {/* Fixed-width ruler + finished lines */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#831843', marginBottom: 6 }}>
          Justified output (maxWidth = {maxWidth})
        </div>
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {/* Ruler */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
            {ruler.map((i) => (
              <div key={i} style={{
                width: 18, textAlign: 'center', fontFamily: 'monospace', fontSize: 10, color: '#be185d',
              }}>{i % 10}</div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lines.length === 0 ? (
              <div style={{ fontSize: 12, color: '#9d174d', fontStyle: 'italic' }}>no completed lines yet</div>
            ) : (
              lines.map((ln, i) => (
                <LineRow
                  key={i}
                  text={ln}
                  maxWidth={maxWidth}
                  highlight={step.produced != null && ln === step.produced && i === lines.length - 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Problem68Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [wordsInput, setWordsInput] = useState("[\"This\",\"is\",\"an\",\"example\",\"of\",\"text\",\"justification\"]");
  const [maxWidthInput, setMaxWidthInput] = useState(16);
  const { words, maxWidth, inputError } = useMemo(() => {
    try {
      const parsedWords = JSON.parse(wordsInput); if (!Array.isArray(parsedWords)) throw new Error('words must be an array');
      const parsedMaxWidth = Number(maxWidthInput); if (isNaN(parsedMaxWidth)) throw new Error('maxWidth must be a number');
      return { words: parsedWords, maxWidth: parsedMaxWidth, inputError: '' };
    } catch (e) {
      return { words: "[\"This\",\"is\",\"an\",\"example\",\"of\",\"text\",\"justification\"]", maxWidth: 16, inputError: e.message };
    }
  }, [wordsInput, maxWidthInput]);
  const steps = useMemo(
    () => generateSteps(words, maxWidth).map((c) => ({
      ...c,
      wordsAll: words,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [words, maxWidth]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setWordsInput(JSON.stringify(e.words)); setMaxWidthInput(String(e.maxWidth)); handleReset(); }, [handleReset]);
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
      {showPatternOverlay && (
        <CodePatternAnnotations
          linePatterns={LINE_PATTERN_MAP}
          currentPhase={step?.phase}
          activeLineDom={activeLineDom}
          activeLine={step?.activeLine}
        />
      )}
    </div>
  )

  const vizPanel = (
    <>
    <div style={{ position: 'relative', height: '100%' }}>
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="problem68-status" style={{ padding: '8px 16px', fontSize: 12, color: 'var(--text-secondary)', overflow: 'auto' }}>
      {step && (
        <>
          <strong>Step {stepIndex + 1}:</strong> {step.phase}
        </>
      )}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
      )}
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
    </>
  )

  // Lumino panel state
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '📐 Text Justification', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem68-shell">
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', flexWrap: 'wrap' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            className="problem68-button"
            onClick={() => applyEx(e)}
            style={ex.label === e.label ? { background: '#ec489930', borderColor: '#ec489960' } : undefined}
          >
            {e.label} (w={e.maxWidth})
          </button>
        ))}
      </div>
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
