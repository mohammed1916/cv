import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import './Problem525Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findMaxLength(nums):' },
  { line: 2, text: '    count = 0' },
  { line: 3, text: '    map = {0: -1}  # count -> earliest index' },
  { line: 4, text: '    max_len = 0' },
  { line: 5, text: '    for i, num in enumerate(nums):' },
  { line: 6, text: '        count += 1 if num == 1 else -1' },
  { line: 7, text: '        if count in map:' },
  { line: 8, text: '            max_len = max(max_len, i - map[count])' },
  { line: 9, text: '        else:' },
  { line: 10, text: '            map[count] = i' },
  { line: 11, text: '    return max_len' },
]

function generateSteps(nums) {
  const steps = []
  const countMap = { '0': -1 }
  let count = 0
  let maxLen = 0

  steps.push({
    activeLine: 1,
    count,
    countMap: { ...countMap },
    maxLen,
    index: -1,
    current: -1,
    message: 'Initialize: count=0, map tracks count→index mapping.',
  })

  nums.forEach((num, i) => {
    const prevCount = count
    count += num === 1 ? 1 : -1

    steps.push({
      activeLine: 6,
      count,
      countMap: { ...countMap },
      maxLen,
      index: i,
      current: num,
      message: `Process nums[${i}]=${num}: count becomes ${count}`,
    })

    if (count.toString() in countMap) {
      const len = i - countMap[count.toString()]
      maxLen = Math.max(maxLen, len)
      steps.push({
        activeLine: 8,
        count,
        countMap: { ...countMap },
        maxLen,
        index: i,
        current: num,
        matchIndex: countMap[count.toString()],
        message: `Found match! count=${count} seen at index ${countMap[count.toString()]}, length=${len}`,
      })
    } else {
      countMap[count.toString()] = i
      steps.push({
        activeLine: 10,
        count,
        countMap: { ...countMap },
        maxLen,
        index: i,
        current: num,
        message: `First occurrence of count=${count} at index ${i}`,
      })
    }
  })

  steps.push({
    activeLine: 11,
    count,
    countMap: { ...countMap },
    maxLen,
    index: nums.length,
    current: -1,
    message: `Return max contiguous length with equal 0s and 1s: ${maxLen}`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', nums: [0, 1] },
  { label: 'Example 2', nums: [0, 1, 0, 1, 1, 0, 0, 1] },
  { label: 'Example 3', nums: [0, 0, 0, 1, 1, 1] },
]

export default function Problem525Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.nums), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((idx) => {
    setExIdx(idx)
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
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
        title: '📊 Array & Count Map',
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
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>

            {step && (
              <>
                <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>

                  {/* Array visualization */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Array:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.nums.map((n, idx) => {
                        const isActive = idx === step.index
                        const isMatched = idx === step.matchIndex
                        return (
                          <motion.div
                            key={idx}
                            animate={{ scale: isActive ? 1.2 : isMatched ? 1.15 : 1 }}
                            style={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 4,
                              fontWeight: 600,
                              fontSize: 12,
                              border: isActive ? '2px solid #0ea5e9' : isMatched ? '2px solid #10b981' : '1px solid #cbd5e1',
                              backgroundColor: isActive ? '#0ea5e9' : isMatched ? '#10b981' : n === 1 ? '#dcfce7' : '#fee2e2',
                              color: isActive || isMatched ? '#fff' : '#1e293b',
                            }}
                          >
                            {n}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Count and Max Length */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                    <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Current Count</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.count}</div>
                    </div>
                    <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                      <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Max Length</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{step.maxLen}</div>
                    </div>
                  </div>

                  {/* Count Map */}
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Count → Index Map:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.entries(step.countMap).map(([k, v]) => (
                        <span
                          key={k}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            borderRadius: 3,
                            fontSize: 10,
                            fontFamily: 'monospace',
                          }}
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample]
  )

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
