import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem532Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def findPairs(nums, k):' },
  { line: 2, text: '    if k < 0: return []' },
  { line: 3, text: '    count = {}' },
  { line: 4, text: '    for num in nums:' },
  { line: 5, text: '        count[num] = count.get(num, 0) + 1' },
  { line: 6, text: '    pairs = []' },
  { line: 7, text: '    for num in count:' },
  { line: 8, text: '        if k == 0 and count[num] > 1:' },
  { line: 9, text: '            pairs.append([num, num])' },
  { line: 10, text: '        elif k > 0 and num + k in count:' },
  { line: 11, text: '            pairs.append([num, num + k])' },
  { line: 12, text: '    return pairs' },
]

function generateSteps(nums, k) {
  const steps = []
  const count = {}

  steps.push({
    activeLine: 1,
    count: {},
    pairs: [],
    k,
    message: `Find k-diff pairs where k=${k}`,
  })

  nums.forEach((num) => {
    count[num] = (count[num] || 0) + 1
    steps.push({
      activeLine: 5,
      count: { ...count },
      pairs: [],
      k,
      currentNum: num,
      message: `Count[${num}]=${count[num]}`,
    })
  })

  const pairs = []

  Object.keys(count).forEach((numStr) => {
    const num = parseInt(numStr)

    steps.push({
      activeLine: 7,
      count: { ...count },
      pairs: [...pairs],
      k,
      currentNum: num,
      message: `Check num=${num}`,
    })

    if (k === 0) {
      if (count[num] > 1) {
        pairs.push([num, num])
        steps.push({
          activeLine: 9,
          count: { ...count },
          pairs: [...pairs],
          k,
          currentNum: num,
          found: true,
          message: `Found pair [${num}, ${num}]`,
        })
      }
    } else if (k > 0 && count[num + k]) {
      pairs.push([num, num + k])
      steps.push({
        activeLine: 11,
        count: { ...count },
        pairs: [...pairs],
        k,
        currentNum: num,
        found: true,
        message: `Found pair [${num}, ${num + k}]`,
      })
    }
  })

  steps.push({
    activeLine: 12,
    count: { ...count },
    pairs: [...pairs],
    k,
    message: `Return ${pairs.length} pair(s)`,
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', nums: [3, 1, 4, 1, 5], k: 2 },
  { label: 'Example 2', nums: [1, 2, 3, 4, 5], k: 0 },
  { label: 'Example 3', nums: [1, 1, 1, 1], k: 0 },
]

export default function Problem532Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.nums, ex.k), [ex])
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
        title: '🔍 K-diff Pairs',
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

                  {/* K value */}
                  <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4, marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>K Value</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.k}</div>
                  </div>

                  {/* Count map */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Frequency Map:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.entries(step.count).map(([num, cnt]) => (
                        <div
                          key={num}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: parseInt(num) === step.currentNum ? '#dbeafe' : '#f1f5f9',
                            border: `1px solid ${parseInt(num) === step.currentNum ? '#0ea5e9' : '#cbd5e1'}`,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          {num}:{cnt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pairs found */}
                  {step.pairs.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 10, color: '#334155' }}>Pairs Found:</div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {step.pairs.map((pair, i) => (
                          <motion.span
                            key={i}
                            animate={{ scale: step.found ? 1.1 : 1 }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#dcfce7',
                              border: '1px solid #10b981',
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            [{pair[0]}, {pair[1]}]
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}
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
