import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './CountAndSay.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def countAndSay(self, n: int) -> str:' },
  { line: 3, text: '        s = "1"' },
  { line: 4, text: '        ' },
  { line: 5, text: '        for _ in range(n - 1):' },
  { line: 6, text: '            next_seq = ""' },
  { line: 7, text: '            i = 0' },
  { line: 8, text: '            while i < len(s):' },
  { line: 9, text: '                digit = s[i]' },
  { line: 10, text: '                count = 1' },
  { line: 11, text: '                while i + count < len(s) and s[i+count] == digit:' },
  { line: 12, text: '                    count += 1' },
  { line: 13, text: '                next_seq += str(count) + digit' },
  { line: 14, text: '                i += count' },
  { line: 15, text: '            s = next_seq' },
  { line: 16, text: '        return s' },
]

const PATTERNS = ['init', 'iteration', 'count_digit', 'append', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  5: 'iteration',
  11: 'count_digit',
  13: 'append',
  16: 'done',
}

function generateSteps(n) {
  const steps = []

  if (n <= 0 || n > 8) {
    steps.push({
      phase: 'done',
      activeLine: 16,
      relatedLines: [16],
      message: 'Invalid n (must be 1-8).',
      done: true,
    })
    return steps
  }

  let s = '1'

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3],
    message: `Start with s = "1"`,
    s,
    n,
    iteration: 0,
  })

  for (let iter = 0; iter < n - 1; iter++) {
    steps.push({
      phase: 'iteration',
      activeLine: 5,
      relatedLines: [5, 6],
      message: `Iteration ${iter + 1}: Process "${s}"`,
      s,
      n,
      iteration: iter + 1,
    })

    let nextSeq = ''
    let i = 0

    while (i < s.length) {
      const digit = s[i]
      let count = 1

      steps.push({
        phase: 'count_digit',
        activeLine: 9,
        relatedLines: [9, 10],
        message: `Found digit "${digit}" at index ${i}`,
        s,
        nextSeq,
        i,
        digit,
        count: 0,
        n,
        iteration: iter + 1,
      })

      while (i + count < s.length && s[i + count] === digit) {
        count++
      }

      steps.push({
        phase: 'count_digit',
        activeLine: 11,
        relatedLines: [11, 12],
        message: `Count: ${count} occurrence(s) of "${digit}"`,
        s,
        nextSeq,
        i,
        digit,
        count,
        n,
        iteration: iter + 1,
      })

      const newPart = `${count}${digit}`
      nextSeq += newPart

      steps.push({
        phase: 'append',
        activeLine: 13,
        relatedLines: [13],
        message: `Append "${newPart}" → next_seq = "${nextSeq}"`,
        s,
        nextSeq,
        i,
        digit,
        count,
        n,
        iteration: iter + 1,
      })

      i += count
    }

    s = nextSeq

    steps.push({
      phase: 'iteration',
      activeLine: 15,
      relatedLines: [15],
      message: `End iteration ${iter + 1}: s = "${s}"`,
      s,
      n,
      iteration: iter + 1,
    })
  }

  steps.push({
    phase: 'done',
    activeLine: 16,
    relatedLines: [16],
    message: `Result for n=${n}: "${s}"`,
    result: s,
    s,
    done: true,
  })

  return steps
}

function VisualizationPanel({ n, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `n=${ex.n}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>n Value</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#067db1' }}>{n}</div>
      </div>

      {step?.iteration !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#7e56f8', marginBottom: 6 }}>
            Iteration {step.iteration}/{step.n - 1}
          </div>
          <div style={{ fontSize: 12, color: '#5577a4', fontFamily: 'monospace' }}>
            Current: <span style={{ color: '#067db1', fontWeight: 600 }}>"{step.s}"</span>
          </div>
        </div>
      )}

      {step?.digit !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a36907', marginBottom: 6 }}>Digit Analysis</div>
          <div style={{ fontSize: 12, color: '#5577a4', fontFamily: 'monospace' }}>
            Digit: <span style={{ color: '#178740', fontWeight: 600 }}>{step.digit}</span>
            {' '}| Count: <span style={{ color: '#178740', fontWeight: 600 }}>{step.count}</span>
          </div>
        </div>
      )}

      {step?.nextSeq !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #38bdf8' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Building Next Sequence</div>
          <div style={{ fontSize: 12, color: '#5577a4', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            next_seq = "<span style={{ color: '#178740', fontWeight: 600 }}>{step.nextSeq}</span>"
          </div>
        </div>
      )}

      {step?.result && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Result</div>
          <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', color: '#178740', wordBreak: 'break-all' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function CountAndSayVisualizer() {
  const examples = useMemo(() => getExamplesOr('count-and-say', []), [])
  const [nValue, setNValue] = useState(1)

  const steps = useMemo(() => generateSteps(nValue), [nValue])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setNValue(ex.n || 1)
      handleReset()
    },
    [handleReset]
  )

  // Step 2: Extract panels into consts
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>n Value (1-8)</div>
        <input
          type="number"
          value={nValue}
          onChange={(e) => {
            setNValue(Math.max(1, Math.min(8, parseInt(e.target.value, 10) || 1)))
            handleReset()
          }}
          min="1"
          max="8"
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 4,
            border: '1px solid #475569',
            backgroundColor: '#1e293b',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            fontSize: 12,
          }}
        />
      </div>
      <VisualizationPanel n={nValue} step={step} applyExample={applyExample} examples={examples} />
    </div>
  )

  const statusPanel = (
    <div className="count-and-say-status">
      {step?.message || 'Ready'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '📖 Count and Say Sequence', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return block with portals
  return (
    <div className="count-and-say-shell">
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
