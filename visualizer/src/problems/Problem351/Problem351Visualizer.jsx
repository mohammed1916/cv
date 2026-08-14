import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem351.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = []

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class SummaryRanges:' },
  { line: 2, text: '    def __init__(self):' },
  { line: 3, text: '        self.intervals = []' },
  { line: 4, text: '    def addNum(self, val):' },
  { line: 5, text: '        idx = bisect_left(self.intervals, [val])' },
  { line: 6, text: '        new_left = val' },
  { line: 7, text: '        new_right = val' },
  { line: 8, text: '        if idx > 0 and self.intervals[idx-1][1] >= val-1:' },
  { line: 9, text: '            new_left = self.intervals[idx-1][0]' },
  { line: 10, text: '            self.intervals.pop(idx-1)' },
  { line: 11, text: '            idx -= 1' },
  { line: 12, text: '        while idx < len(self.intervals) and self.intervals[idx][0] <= val+1:' },
  { line: 13, text: '            new_right = max(new_right, self.intervals[idx][1])' },
  { line: 14, text: '            self.intervals.pop(idx)' },
  { line: 15, text: '        self.intervals.insert(idx, [new_left, new_right])' },
  { line: 16, text: '    def getSummaryRanges(self):' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums) {
    const steps = []
  const intervals = []

  // Init step
  steps.push({
    activeLine: 2,
    intervals: [],
    currentNum: null,
    addedNums: [],
    message: 'Initialize: empty intervals list',
  })

  nums.forEach((num, idx) => {
    // Find insertion position
    let insertIdx = 0
    for (let i = 0; i < intervals.length; i++) {
      if (intervals[i][0] > num) break
      insertIdx = i + 1
    }

    steps.push({
      activeLine: 5,
      intervals: intervals.map(i => [...i]),
      currentNum: num,
      addedNums: nums.slice(0, idx),
      insertIdx,
      message: `Step ${idx + 1}: Scan for position to add ${num}. Found insertIdx=${insertIdx}`,
    })

    let newLeft = num
    let newRight = num
    let mergedWith = 'none'

    // Check left neighbor
    if (insertIdx > 0 && intervals[insertIdx - 1][1] >= num - 1) {
      steps.push({
        activeLine: 8,
        intervals: intervals.map(i => [...i]),
        currentNum: num,
        addedNums: nums.slice(0, idx),
        insertIdx,
        highlightIdx: insertIdx - 1,
        message: `Interval [${intervals[insertIdx - 1][0]}, ${intervals[insertIdx - 1][1]}] covers or touches ${num}. Merge left.`,
      })

      newLeft = intervals[insertIdx - 1][0]
      intervals.splice(insertIdx - 1, 1)
      insertIdx -= 1
      mergedWith = 'left'
    }

    // Check right neighbors
    let checkIdx = insertIdx
    while (checkIdx < intervals.length && intervals[checkIdx][0] <= num + 1) {
      if (mergedWith === 'none') {
        steps.push({
          activeLine: 12,
          intervals: intervals.map(i => [...i]),
          currentNum: num,
          addedNums: nums.slice(0, idx),
          insertIdx,
          highlightIdx: checkIdx,
          message: `Interval [${intervals[checkIdx][0]}, ${intervals[checkIdx][1]}] can merge with ${num}. Merge right.`,
        })
        mergedWith = 'right'
      } else {
        steps.push({
          activeLine: 13,
          intervals: intervals.map(i => [...i]),
          currentNum: num,
          addedNums: nums.slice(0, idx),
          insertIdx,
          highlightIdx: checkIdx,
          message: `Also merge [${intervals[checkIdx][0]}, ${intervals[checkIdx][1]}]. Expanding range.`,
        })
        mergedWith = 'both'
      }

      newRight = Math.max(newRight, intervals[checkIdx][1])
      intervals.splice(checkIdx, 1)
    }

    // Insert merged interval
    intervals.splice(insertIdx, 0, [newLeft, newRight])

    steps.push({
      activeLine: 15,
      intervals: intervals.map(i => [...i]),
      currentNum: null,
      addedNums: nums.slice(0, idx + 1),
      insertIdx,
      message: `Inserted [${newLeft}, ${newRight}]. Current intervals: ${formatIntervals(intervals)}`,
    })
  })

  steps.push({
    activeLine: 16,
    intervals: intervals.map(i => [...i]),
    currentNum: null,
    addedNums: nums,
    message: `Final summary ranges: ${formatIntervals(intervals)}`,
  })

  return steps
}

function formatIntervals(intervals) {
  if (intervals.length === 0) return '[]'
  return '[' + intervals.map(([a, b]) => a === b ? a.toString() : `${a}->${b}`).join(', ') + ']'
}

const EXAMPLES = [
  {
    label: 'Example 1: Gaps',
    nums: [1, 3, 7, 9],
    description: 'Numbers with gaps form separate intervals',
  },
  {
    label: 'Example 2: Merging',
    nums: [1, 2, 3, 5, 6, 8],
    description: 'Adjacent numbers merge into ranges',
  },
  {
    label: 'Example 3: Complex',
    nums: [1, 2, 4, 5, 7],
    description: 'Mixed gaps and merges',
  },
]

export default function Problem351Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [numsInput, setNumsInput] = useState(JSON.stringify(EXAMPLES[0]?.nums ?? []));
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: EXAMPLES[exIdx]?.nums ?? [], inputError: e.message };
    }
  }, [numsInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(nums), [nums])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    setNumsInput(JSON.stringify(EXAMPLES[idx].nums))
    handleReset()
  }, [handleReset])

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
      title: '📊 Interval Merger',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((e, i) => (
              <button
                key={i}
                onClick={() => applyExample(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: 12,
                  backgroundColor: exIdx === i ? '#dbeafe' : '#f1f5f9',
                  fontWeight: exIdx === i ? 600 : 400,
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {step && (
            <>
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>Step Message</div>
                <div style={{ color: '#475569', fontSize: 12, lineHeight: 1.5 }}>{step.message}</div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b', fontSize: 11 }}>Input Stream</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ex.nums.map((num, i) => (
                    <motion.div
                      key={num}
                      animate={{
                        scale: step?.currentNum === num ? 1.3 : 1,
                        backgroundColor: step?.currentNum === num ? '#fbbf24' : step?.addedNums.includes(num) ? '#dcfce7' : '#e2e8f0',
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af', fontSize: 11 }}>Current Intervals</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {step.intervals.length > 0 ? (
                    step.intervals.map((interval, i) => (
                      <motion.div
                        key={`${i}-${interval[0]}-${interval[1]}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: step.highlightIdx === i ? '#0ea5e9' : '#f0f9ff',
                          border: step.highlightIdx === i ? '2px solid #0284c7' : '1px solid #0ea5e9',
                          borderRadius: 4,
                          color: step.highlightIdx === i ? '#fff' : '#1e40af',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        <span style={{ marginRight: 8 }}>Interval {i + 1}:</span>
                        <span style={{ fontSize: 14 }}>
                          [{interval[0]} {interval[0] === interval[1] ? '' : `→ ${interval[1]}`}]
                        </span>
                        {step.highlightIdx === i && <span style={{ marginLeft: 'auto', fontSize: 10 }}>← Merging</span>}
                      </motion.div>
                    ))
                  ) : (
                    <div style={{ color: '#64748b', fontSize: 12 }}>No intervals yet</div>
                  )}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#f3f4f6', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: '#1e293b', fontSize: 11 }}>Summary</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>Intervals:</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                    {formatIntervals(step.intervals)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample, ex.nums])

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
          prevDisabled={stepIndex <= 0}
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
