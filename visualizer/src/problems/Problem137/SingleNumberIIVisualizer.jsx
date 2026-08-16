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
import { getExamplesOr } from '../../config/examplesRegistry'
import './SingleNumberIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('single-number-ii', [
  { label: 'Example 1', nums: [2, 2, 3, 2] },
  { label: 'Example 2', nums: [0, 1, 0, 1, 0, 1, 99] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def singleNumber(nums):' },
  { line: 2, text: '    ones = 0' },
  { line: 3, text: '    twos = 0' },
  { line: 4, text: '    for num in nums:' },
  { line: 5, text: '        twos |= ones & num' },
  { line: 6, text: '        ones ^= num' },
  { line: 7, text: '        threes = ones & twos' },
  { line: 8, text: '        ones &= ~threes' },
  { line: 9, text: '        twos &= ~threes' },
  { line: 10, text: '    return ones' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty array',
      relatedLines: [1],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    message: `Find single number appearing once (others appear 3 times)`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    ones: 0,
    twos: 0,
    message: 'Initialize: ones (numbers appearing 1 time), twos (appearing 2 times)',
    relatedLines: [2, 3],
  })

  let ones = 0
  let twos = 0

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 4,
      currentNum: num,
      index: i,
      message: `Process number: ${num}`,
      relatedLines: [4],
    })

    // Store in twos if already in ones
    twos |= ones & num

    steps.push({
      activeLine: 5,
      currentNum: num,
      ones,
      twos,
      message: `twos |= ones & ${num} → twos = ${twos}`,
      relatedLines: [5],
    })

    // XOR with ones
    ones ^= num

    steps.push({
      activeLine: 6,
      currentNum: num,
      ones,
      twos,
      message: `ones ^= ${num} → ones = ${ones}`,
      relatedLines: [6],
    })

    // Check for threes
    const threes = ones & twos

    steps.push({
      activeLine: 7,
      currentNum: num,
      ones,
      twos,
      threes,
      message: `threes = ones & twos = ${threes}`,
      relatedLines: [7],
    })

    if (threes) {
      ones &= ~threes
      twos &= ~threes

      steps.push({
        activeLine: 8,
        currentNum: num,
        ones,
        twos,
        threes,
        message: `Clear bits that appeared 3 times: ones = ${ones}, twos = ${twos}`,
        relatedLines: [8, 9],
      })
    }
  }

  steps.push({
    activeLine: 10,
    ones,
    twos,
    done: true,
    message: `Result: ${ones} (appeared once, others appeared 3 times)`,
    relatedLines: [10],
  })

  return steps
}

function BitVisualization({ value, label }) {
  const bits = value.toString(2).padStart(8, '0')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
        {label}: {value} (0b{bits})
      </div>
      <div style={{ display: 'flex', gap: 2 }}>
        {bits.split('').map((bit, idx) => (
          <motion.div
            key={idx}
            style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              backgroundColor: bit === '1' ? '#06b6d4' : 'var(--text-muted)',
              color: '#757575',
              fontSize: 11,
              fontWeight: 600,
              fontFamily: 'monospace',
            }}
            animate={{ scale: 1 }}
          >
            {bit}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#627794' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, borderLeft: '4px solid #8b5cf6' }}>
        <div style={{ fontSize: 12, color: '#5b21b6', fontStyle: 'italic' }}>
          Bit manipulation: track ones/twos, clear when they form threes.
        </div>
      </div>

      {step.currentNum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Current Number: {step.currentNum}
          </div>
          <BitVisualization value={step.currentNum} label="Number" />
        </motion.div>
      )}

      {step.ones !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <BitVisualization value={step.ones} label="Ones" />
            <BitVisualization value={step.twos} label="Twos" />
            {step.threes !== undefined && (
              <BitVisualization value={step.threes} label="Threes (clear)" />
            )}
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

export default function SingleNumberIIVisualizer() {
  const [input, setInput] = useState({"label":"Example 1","nums":[2,2,3,2]});
  const [numsInput, setNumsInput] = useState("[2,2,3,2]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: [2,2,3,2], inputError: e.message };
    }
  }, [numsInput]);  const steps = useMemo(
    () =>
      generateSteps(nums).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [nums]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

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
      {showPatternOverlay && <CodePatternAnnotations {...{ step, activeLineDom, linePatternMap: LINE_PATTERN_MAP }} />}
    </div>
  )

  const vizPanel = (
    <>
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"}]}
        values={{ nums: numsInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyEx}
        inputError={inputError}
      />
    <div className="sn2-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="sn2-status">
      <div style={{ fontSize: 11, padding: 4 }}>Step {stepIndex + 1} / {steps.length}</div>
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
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
      { id: 'viz', title: '🔢 Single Number II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="sn2-shell">
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
