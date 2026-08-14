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
import './MissingRangesVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('missing-ranges', [
  { label: 'Example 1', nums: [0, 1, 3, 50, 75], lower: 0, upper: 99 },
  { label: 'Example 2', nums: [], lower: 1, upper: 1 },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findMissingRanges(nums, lower, upper):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    prev = lower - 1' },
  { line: 4, text: '    for num in nums:' },
  { line: 5, text: '        if num < lower: continue' },
  { line: 6, text: '        if num > upper: break' },
  { line: 7, text: '        if num > prev + 1:' },
  { line: 8, text: '            start = max(prev + 1, lower)' },
  { line: 9, text: '            end = num - 1' },
  { line: 10, text: '            result.append(formatRange(start, end))' },
  { line: 11, text: '        prev = num' },
  { line: 12, text: '    if prev < upper:' },
  { line: 13, text: '        result.append(formatRange(prev+1, upper))' },
  { line: 14, text: '    return result' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums, lower, upper) {
const applyInput = useCallback((e) => { setInput(e); setNumsInput(JSON.stringify(e.nums)); setLowerInput(String(e.lower)); setUpperInput(String(e.upper)); handleReset(); }, [handleReset]);
    const steps = []

  steps.push({
    activeLine: 1,
    nums,
    lower,
    upper,
    message: `Find missing ranges between ${lower} and ${upper}`,
    relatedLines: [1],
  })

  steps.push({
    activeLine: 2,
    nums,
    lower,
    upper,
    message: 'Initialize result list',
    relatedLines: [2, 3],
  })

  const result = []
  let prev = lower - 1

  steps.push({
    activeLine: 4,
    nums,
    lower,
    upper,
    prev,
    message: `Start with prev = ${prev} (lower - 1)`,
    relatedLines: [4],
  })

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]

    steps.push({
      activeLine: 5,
      nums,
      lower,
      upper,
      prev,
      currentNum: num,
      currentIdx: i,
      message: `Process number: ${num}`,
      relatedLines: [5],
    })

    if (num < lower) {
      steps.push({
        activeLine: 5,
        nums,
        lower,
        upper,
        prev,
        currentNum: num,
        currentIdx: i,
        message: `${num} < ${lower}, skip`,
        relatedLines: [5],
      })
      continue
    }

    if (num > upper) {
      steps.push({
        activeLine: 6,
        nums,
        lower,
        upper,
        prev,
        currentNum: num,
        currentIdx: i,
        message: `${num} > ${upper}, stop`,
        relatedLines: [6],
      })
      break
    }

    if (num > prev + 1) {
      steps.push({
        activeLine: 7,
        nums,
        lower,
        upper,
        prev,
        currentNum: num,
        currentIdx: i,
        gap: { start: prev + 1, end: num - 1 },
        message: `Gap found between ${prev + 1} and ${num - 1}`,
        relatedLines: [7],
      })

      const start = Math.max(prev + 1, lower)
      const end = num - 1

      steps.push({
        activeLine: 10,
        nums,
        lower,
        upper,
        prev,
        currentNum: num,
        currentIdx: i,
        gap: { start, end },
        result: [...result, { start, end }],
        message: `Add range: "${start === end ? start : start + '->' + end}"`,
        relatedLines: [10],
      })

      result.push({ start, end })
    }

    prev = num

    steps.push({
      activeLine: 11,
      nums,
      lower,
      upper,
      prev,
      currentNum: num,
      currentIdx: i,
      result: [...result],
      message: `Update prev = ${num}`,
      relatedLines: [11],
    })
  }

  steps.push({
    activeLine: 12,
    nums,
    lower,
    upper,
    prev,
    result: [...result],
    message: `Check final range: prev=${prev}, upper=${upper}`,
    relatedLines: [12],
  })

  if (prev < upper) {
    steps.push({
      activeLine: 13,
      nums,
      lower,
      upper,
      prev,
      finalGap: { start: prev + 1, end: upper },
      result: [...result, { start: prev + 1, end: upper }],
      message: `Add final range: "${prev + 1 === upper ? upper : (prev + 1) + '->' + upper}"`,
      relatedLines: [13],
    })

    result.push({ start: prev + 1, end: upper })
  }

  steps.push({
    activeLine: 14,
    nums,
    lower,
    upper,
    result: [...result],
    done: true,
    message: `Missing ranges: ${result.length === 0 ? 'none' : result.map(r => r.start === r.end ? r.start : `${r.start}->${r.end}`).join(', ')}`,
    relatedLines: [14],
  })

  return steps
}

function NumberLine({ nums, lower, upper, currentIdx, gap, finalGap }) {
  const min = Math.max(0, lower - 5)
  const max = Math.min(upper + 5, upper + 10)
  const range = max - min + 1

  return (
    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', padding: 12 }}>
      {Array.from({ length: range }, (_, i) => min + i).map((num) => {
        const isInRange = num >= lower && num <= upper
        const isNum = nums.includes(num)
        const isGap = gap && num >= gap.start && num <= gap.end
        const isFinalGap = finalGap && num >= finalGap.start && num <= finalGap.end

        return (
          <motion.div
            key={num}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              backgroundColor:
                isGap || isFinalGap
                  ? '#fecaca'
                  : isNum
                  ? '#86efac'
                  : isInRange
                  ? '#e2e8f0'
                  : '#f5f5f5',
              border:
                isGap || isFinalGap
                  ? '2px solid #ef4444'
                  : isNum
                  ? '2px solid #22c55e'
                  : isInRange
                  ? '1px solid #cbd5e1'
                  : 'none',
              fontSize: 11,
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: 'monospace',
            }}
            animate={{ scale: isGap || isFinalGap ? 1.1 : 1 }}
          >
            {num}
          </motion.div>
        )
      })}
    </div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#cffafe', borderRadius: 6, borderLeft: '4px solid #06b6d4' }}>
        <div style={{ fontSize: 12, color: '#164e63', fontStyle: 'italic' }}>
          Scan through numbers: identify gaps in range.
        </div>
      </div>

      {step.nums && step.lower !== undefined && step.upper !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>
            Number Line
          </div>
          <NumberLine
            nums={step.nums}
            lower={step.lower}
            upper={step.upper}
            currentIdx={step.currentIdx}
            gap={step.gap}
            finalGap={step.finalGap}
          />
        </motion.div>
      )}

      {step.currentNum !== undefined && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
            Current Number
          </div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#065f46', fontWeight: 600 }}>
            {step.currentNum}
          </div>
        </motion.div>
      )}

      {step.gap && (
        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#7f1d1d', marginBottom: 4 }}>
            Gap Found
          </div>
          <div style={{ fontSize: 13, color: '#7f1d1d', fontFamily: 'monospace', fontWeight: 600 }}>
            {step.gap.start} to {step.gap.end}
          </div>
        </motion.div>
      )}

      {step.result && step.result.length > 0 && (
        <motion.div style={{ padding: 12, backgroundColor: '#dcfce7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Missing Ranges ({step.result.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step.result.map((range, idx) => (
              <div key={idx} style={{ fontSize: 11, color: '#065f46', fontFamily: 'monospace' }}>
                {range.start === range.end ? range.start : `${range.start}->${range.end}`}
              </div>
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

export default function MissingRangesVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[0,1,3,50,75]");
  const [lowerInput, setLowerInput] = useState(0);
  const [upperInput, setUpperInput] = useState(99);
  const { nums, lower, upper, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      const parsedLower = Number(lowerInput); if (isNaN(parsedLower)) throw new Error('lower must be a number');
      const parsedUpper = Number(upperInput); if (isNaN(parsedUpper)) throw new Error('upper must be a number');
      return { nums: parsedNums, lower: parsedLower, upper: parsedUpper, inputError: '' };
    } catch (e) {
      return { nums: "[0,1,3,50,75]", lower: 0, upper: 99, inputError: e.message };
    }
  }, [numsInput, lowerInput, upperInput]);
  const steps = useMemo(
    () =>
      generateSteps(nums, lower, upper).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [nums, lower, upper]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // ─── Extract panels as consts ───────────────────────────────────────────
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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} linePatternMap={LINE_PATTERN_MAP} patterns={PATTERNS} />}
    </div>
  )

  const primaryPanel = (
    <div className="mrv-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

  const statusPanel = (
    <div className="mrv-status">
      {step?.message ? (
        <div style={{ padding: '8px 12px', fontSize: 12, color: '#94a3b8' }}>
          {step.message}
        </div>
      ) : (
        <div style={{ padding: '8px 12px', fontSize: 12, color: '#64748b' }}>Ready</div>
      )}
    </div>
  )

  const playbackPanel = (
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

  // ─── Lumino state and config ────────────────────────────────────────────
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🔍 Missing Ranges', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="mrv-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
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
