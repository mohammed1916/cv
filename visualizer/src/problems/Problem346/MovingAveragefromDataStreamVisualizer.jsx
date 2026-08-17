import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './MovingAveragefromDataStreamVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'
import PointerRail from '../../components/shared/PointerRail'
import { createPortal } from 'react-dom'

const MOVING_AVERAGE_PATTERNS = ['init', 'enqueue', 'evict', 'done']

const LINE_PATTERN_MAP = {
  3: 'init', 5: 'enqueue', 6: 'evict', 8: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'class MovingAverage:' },
  { line: 2, text: '    def __init__(self, size: int):' },
  { line: 3, text: '        self.size, self.q, self.total = size, deque(), 0' },
  { line: 4, text: '    def next(self, val: int) -> float:' },
  { line: 5, text: '        self.q.append(val); self.total += val' },
  { line: 6, text: '        if len(self.q) > self.size: self.total -= self.q.popleft()' },
  { line: 7, text: '        return self.total / len(self.q)' },
]

function generateSteps({ size, stream }) {
  const steps = [{ phase: 'init', activeLine: 3, size, stream, queue: [], total: 0, message: `Create an empty queue with window size ${size}.` }]
  const queue = []; let total = 0
  stream.forEach((value, index) => {
    queue.push(value); total += value
    steps.push({ phase: 'enqueue', activeLine: 5, size, stream, streamIndex: index, queue: [...queue], total, average: total / queue.length, message: `Append ${value}; running sum is ${total}.` })
    if (queue.length > size) { const removed = queue.shift(); total -= removed; steps.push({ phase: 'evict', activeLine: 6, size, stream, streamIndex: index, queue: [...queue], removed, total, average: total / queue.length, message: `Window exceeded ${size}; remove ${removed}.` }) }
    steps.push({ phase: 'enqueue', activeLine: 7, size, stream, streamIndex: index, queue: [...queue], total, average: total / queue.length, message: `Average = ${total} / ${queue.length} = ${(total / queue.length).toFixed(2)}.` })
  })
  steps.push({ phase: 'done', activeLine: 7, size, stream, queue: [...queue], total, average: total / queue.length, message: 'Stream complete.' })
  return steps
}

const EXAMPLES = getExamplesOr('moving-average-data-stream', [{ label: 'Classic window', size: 3, stream: [1, 10, 3, 5] }, { label: 'Size two', size: 2, stream: [4, 2, 8, 6] }])

export default function MovingAveragefromDataStreamVisualizer() {
  const [inputValue, setInputValue] = useState(JSON.stringify(EXAMPLES[0]))

  const { input, inputError } = useMemo(() => {
    try {
      const data = JSON.parse(inputValue)
      if (!Number.isInteger(data.size) || data.size < 1 || !Array.isArray(data.stream) || !data.stream.every(Number.isFinite)) throw new Error('Use { "size": 3, "stream": [1, 10, 3, 5] }.')
      return { input: data, inputError: '' }
    } catch (e) {
      return { input: null, inputError: e.message }
    }
  }, [inputValue])

  const steps = useMemo(() => {
    return input ? generateSteps(input).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })) : []
  }, [input])

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setInputValue(JSON.stringify(ex))
    handleReset()
  }, [handleReset])

  const renderVisualization = () => {
    if (!input) return <div className="moving-averagefrom-data-stream-error">{inputError}</div>

    return (
      <div className="moving-averagefrom-data-stream-viz">
        <div className="moving-averagefrom-data-stream-step-info">
          <h3>{step?.message}</h3>
        </div>
        <PointerRail title="Incoming stream" values={input.stream} pointers={step?.streamIndex === undefined ? [] : [{ id: 'next', label: 'next', index: step.streamIndex, tone: 'primary' }]} />
        <PointerRail title="Sliding window queue" values={step?.queue || []} pointers={step?.queue?.length ? [{ id: 'front', label: 'front', index: 0, tone: 'warning' }] : []} note={`sum ${step?.total ?? 0} · average ${(step?.average ?? 0).toFixed(2)}`} />
      </div>
    )
  }

  const panelConfigs = useMemo(() => [
    { id: 'left', title: "Input" },
    { id: 'right', title: "Visualization", dockMode: 'split-right' },
  ], [])
  const panelContents = {
    left: (<div className="moving-averagefrom-data-stream-panel moving-averagefrom-data-stream-panel-input">
            <div className="moving-averagefrom-data-stream-panel-head">Input</div>
            <div className="moving-averagefrom-data-stream-panel-body">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="moving-averagefrom-data-stream-textarea"
                placeholder="Enter input..."
              />
            </div>
          </div>),
    right: (<div className="moving-averagefrom-data-stream-panel moving-averagefrom-data-stream-panel-viz">
            <div className="moving-averagefrom-data-stream-panel-head">Visualization</div>
            <div className="moving-averagefrom-data-stream-panel-body">
              <AnimatePresence mode="wait">
                {renderVisualization()}
              </AnimatePresence>
            </div>
          </div>),
  }
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])
  return (
    <div className="moving-averagefrom-data-stream-shell">
      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.left && createPortal(panelContents.left, panelDivs.left)}
            {panelDivs.right && createPortal(panelContents.right, panelDivs.right)}
          </>
        )}
      </>

      <div style={{ position: 'relative' }}>
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
      </div>

      <div className="moving-averagefrom-data-stream-middle">
        <div className="moving-averagefrom-data-stream-panel" style={{ display: 'none' }}>
          <div className="moving-averagefrom-data-stream-panel-head">Code Trace</div>
          <div className="moving-averagefrom-data-stream-panel-body">
          </div>
        </div>

        <div className="moving-averagefrom-data-stream-panel">
          <div className="moving-averagefrom-data-stream-panel-head">Examples</div>
          <div className="moving-averagefrom-data-stream-panel-body moving-averagefrom-data-stream-examples">
            {EXAMPLES.map((example, i) => (
              <button
                key={i}
                className="moving-averagefrom-data-stream-example-btn"
                onClick={() => {
                  setInputValue(JSON.stringify(example))
                  handleReset()
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="moving-averagefrom-data-stream-status" style={{ margin: '16px', color: 'var(--text-muted)' }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={MOVING_AVERAGE_PATTERNS} />
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
      </FloatingPanel>
    </div>
  )
}
