import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem487Visualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('max-consecutive-ones-iii')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamples('max-consecutive-ones-iii') || [
  { label: 'Example 1', nums: [1, 0, 1, 1, 0], k: 1 },
  { label: 'Example 2', nums: [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 3 },
]

function generateSteps(nums, k) {
  const steps = []
  let left = 0
  let maxLen = 0
  let zeros = 0

  steps.push({
    activeLine: 1,
    left: 0,
    right: 0,
    zeros,
    maxLen: 0,
    nums,
    k,
    message: 'Initialize: sliding window with k flips'
  })

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++

    steps.push({
      activeLine: 2,
      left,
      right,
      zeros,
      maxLen,
      nums,
      k,
      message: `Expand right to index ${right}. Zeros in window: ${zeros}`
    })

    while (zeros > k) {
      steps.push({
        activeLine: 3,
        left,
        right,
        zeros,
        maxLen,
        nums,
        k,
        message: `Too many zeros (${zeros} > ${k}). Shrink from left.`
      })

      if (nums[left] === 0) zeros--
      left++
    }

    maxLen = Math.max(maxLen, right - left + 1)
    steps.push({
      activeLine: 4,
      left,
      right,
      zeros,
      maxLen,
      nums,
      k,
      message: `Valid window [${left}, ${right}] with length ${right - left + 1}. Max: ${maxLen}`
    })
  }

  steps.push({
    activeLine: 5,
    left,
    right: nums.length - 1,
    zeros,
    maxLen,
    nums,
    k,
    done: true,
    message: `Maximum consecutive ones with ${k} flips: ${maxLen}`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx, k }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fdf2f8', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          Find the maximum number of consecutive 1's in a binary array if you can flip at most {k} zeros.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Binary Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((bit, idx) => {
            const inWindow = step && idx >= step.left && idx <= step.right
            return (
              <motion.div
                key={`b-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor: inWindow ? '#fce7f3' : '#f1f5f9',
                  borderColor: inWindow ? '#ec4899' : '#cbd5e1',
                  color: inWindow ? '#831843' : '#334155'
                }}
                animate={{ scale: inWindow ? 1.1 : 1 }}
              >
                {bit}
              </motion.div>
            )
          })}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fce7f3',
            borderRadius: 6,
            border: '2px solid #ec4899'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 12 }}>
            Sliding Window State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Left</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>{step.left}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Right</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>{step.right}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Zeros</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>{step.zeros}/{k}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Length</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#ec4899' }}>{step.right - step.left + 1}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f5e6ff',
          borderRadius: 6,
          border: '2px solid #a855f7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#581c87', marginBottom: 8 }}>Max Consecutive Ones</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#a855f7' }}>
          {step?.maxLen ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#a855f7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem487Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const k = ex.k || 1

  const steps = useMemo(
    () =>
      generateSteps(ex.nums, k).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex, k]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '🔄 Max Consecutive Ones III',
      content: (
        <VisualizationPanel
          nums={ex.nums}
          step={step}
          applyEx={applyEx}
          k={k}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, k])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={Object.keys(PATTERNS)} />}
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
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

