import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import './ReverseStringIIVisualizer.css'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def reverseStr(self, s: str, k: int) -> str:' },
  { line: 3, text: '        s_list = list(s)' },
  { line: 4, text: '        for i in range(0, len(s), 2*k):' },
  { line: 5, text: '            s_list[i:i+k] = s_list[i:i+k][::-1]' },
  { line: 6, text: '        return "".join(s_list)' },
]

const PATTERNS = ['init', 'process', 'reverse', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'process',
  5: 'reverse',
  6: 'done',
}

function generateSteps(str, k) {
  const steps = []

  if (!str || k <= 0) {
    steps.push({
      phase: 'done',
      activeLine: 6,
      relatedLines: [6],
      message: 'Invalid input.',
      result: str,
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [2, 3],
    message: `Convert string to list: "${str}" (k=${k})`,
    s: str,
    k,
  })

  const arr = str.split('')

  for (let i = 0; i < arr.length; i += 2 * k) {
    const segmentEnd = Math.min(i + k, arr.length)

    steps.push({
      phase: 'process',
      activeLine: 4,
      relatedLines: [4],
      message: `Process segment starting at index ${i}`,
      arr: [...arr],
      segmentStart: i,
      segmentEnd,
    })

    const end = segmentEnd
    const segment = arr.slice(i, end).reverse()

    for (let j = 0; j < segment.length; j++) {
      arr[i + j] = segment[j]
    }

    steps.push({
      phase: 'reverse',
      activeLine: 5,
      relatedLines: [5],
      message: `Reverse segment [${i}:${end}]: "${str.substring(i, end)}" → "${segment.join('')}"`,
      arr: [...arr],
      segmentStart: i,
      segmentEnd,
      current: arr.join(''),
    })
  }

  const result = arr.join('')
  steps.push({
    phase: 'done',
    activeLine: 6,
    relatedLines: [6],
    message: `Result: "${result}"`,
    arr,
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ str, k, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
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
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>String</div>
          <div style={{ fontSize: 14, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all' }}>
            "{str}"
          </div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>k Value</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#38bdf8' }}>{k}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Current State</div>
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', minHeight: 40 }}>
          <AnimatePresence mode="popLayout">
            {step?.arr?.map((char, idx) => {
              const inSegment = step?.segmentStart !== undefined && idx >= step.segmentStart && idx < step.segmentEnd
              const isReversing = step?.phase === 'reverse' && inSegment

              return (
                <motion.div
                  key={`${idx}-${char}`}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 28,
                    textAlign: 'center',
                    backgroundColor: isReversing ? '#a78bfa' : inSegment ? '#38bdf8' : '#334155',
                    borderColor: isReversing ? '#8b5cf6' : inSegment ? '#0ea5e9' : '#64748b',
                    color: '#e2e8f0',
                  }}
                  animate={{ scale: inSegment ? 1.15 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {char}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {step?.segmentStart !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Segment</div>
          <div style={{ fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace' }}>
            Index {step.segmentStart} to {step.segmentEnd - 1} (length: {step.segmentEnd - step.segmentStart})
          </div>
        </div>
      )}

      {step?.result !== undefined && (
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
          <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e', wordBreak: 'break-all' }}>
            "{step.result}"
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function ReverseStringIIVisualizer() {
  const examples = useMemo(() => getExamplesOr('reverse-string-ii', []), [])
  const [str, setStr] = useState('abcdefg')
  const [kValue, setKValue] = useState(2)

  const steps = useMemo(() => generateSteps(str, kValue), [str, kValue])

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
      setStr(ex.s || ex)
      setKValue(ex.k || 2)
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '↔ Reverse String II', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
            <CodeTracePanel
              step={step}
              codeLines={SOLUTION_CODE}
              highlightedLines={connectivity.highlightedLines}
              onLineSelect={connectivity.handleLineSelect}
              onActiveLineDomChange={setActiveLineDom}
            />
            {showPatternOverlay && (
              <CodePatternAnnotations
                linePatterns={LINE_PATTERN_MAP}
                currentPhase={step?.phase}
                activeLineDom={activeLineDom}
                activeLine={step?.activeLine}
              />
            )}
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                <input
                  type="text"
                  value={str}
                  onChange={(e) => {
                    setStr(e.target.value)
                    handleReset()
                  }}
                  placeholder="abcdefg"
                  style={{
                    padding: '8px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    fontFamily: 'monospace',
                    fontSize: 12,
                  }}
                />
                <input
                  type="number"
                  value={kValue}
                  onChange={(e) => {
                    setKValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                    handleReset()
                  }}
                  min="1"
                  style={{
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
            </div>
            <VisualizationPanel str={str} k={kValue} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, str, kValue, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
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
      </FloatingPanel>
    </div>
  )
}
