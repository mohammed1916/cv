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
import './Problem528Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self, w):' },
  { line: 3, text: '        self.prefix = [0]' },
  { line: 4, text: '        for x in w:' },
  { line: 5, text: '            self.prefix.append(self.prefix[-1] + x)' },
  { line: 6, text: '    def pickIndex(self):' },
  { line: 7, text: '        target = random.randint(1, self.prefix[-1])' },
  { line: 8, text: '        left, right = 0, len(self.prefix)' },
  { line: 9, text: '        while left < right:' },
  { line: 10, text: '            mid = (left + right) // 2' },
  { line: 11, text: '            if self.prefix[mid] < target:' },
  { line: 12, text: '                left = mid + 1' },
  { line: 13, text: '            else:' },
  { line: 14, text: '                right = mid' },
  { line: 15, text: '        return left - 1' },
]

function generateSteps(w, pickIndices) {
  const steps = []
  const prefix = [0]

  steps.push({
    activeLine: 2,
    prefix: [...prefix],
    message: 'Initialize prefix sum array.',
  })

  w.forEach((x, i) => {
    prefix.push(prefix[prefix.length - 1] + x)
    steps.push({
      activeLine: 5,
      prefix: [...prefix],
      currentIdx: i,
      currentWeight: x,
      message: `Add weight ${x}: prefix[${i + 1}] = ${prefix[prefix.length - 1]}`,
    })
  })

  pickIndices.forEach((pickIdx) => {
    const target = Math.floor(Math.random() * prefix[prefix.length - 1]) + 1

    steps.push({
      activeLine: 7,
      prefix: [...prefix],
      target,
      message: `Pick: target=${target}, searching in prefix sum...`,
    })

    let left = 0
    let right = prefix.length

    while (left < right) {
      const mid = Math.floor((left + right) / 2)

      steps.push({
        activeLine: 10,
        prefix: [...prefix],
        target,
        left,
        right,
        mid,
        message: `Binary search: left=${left}, right=${right}, mid=${mid}, prefix[${mid}]=${prefix[mid]}`,
      })

      if (prefix[mid] < target) {
        left = mid + 1
        steps.push({
          activeLine: 12,
          prefix: [...prefix],
          target,
          left,
          right,
          mid,
          message: `${prefix[mid]} < ${target}, move left to ${mid + 1}`,
        })
      } else {
        right = mid
        steps.push({
          activeLine: 14,
          prefix: [...prefix],
          target,
          left,
          right,
          mid,
          message: `${prefix[mid]} >= ${target}, move right to ${mid}`,
        })
      }
    }

    steps.push({
      activeLine: 15,
      prefix: [...prefix],
      target,
      left,
      result: left - 1,
      message: `Result: index ${left - 1}`,
    })
  })

  return steps
}

const EXAMPLES = [
  { label: 'Example 1', w: [1, 3], pickIndices: [1, 2] },
  { label: 'Example 2', w: [1, 2, 3, 4, 5], pickIndices: [3] },
  { label: 'Example 3', w: [2, 2, 2, 2], pickIndices: [2] },
]

export default function Problem528Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(ex.w, ex.pickIndices), [ex])
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
        title: '🎲 Weighted Random Pick',
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

                  {/* Weights */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Weights:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {ex.w.map((w, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: step.currentIdx === i ? '#dbeafe' : '#f1f5f9',
                            border: `1px solid #cbd5e1`,
                            borderRadius: 3,
                            fontSize: 10,
                            fontWeight: 600,
                          }}
                        >
                          w[{i}]={w}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prefix Sum */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 10, color: '#334155' }}>Prefix Sum:</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {step.prefix.map((p, i) => {
                        const isMid = i === step.mid
                        const isTarget = p === step.target
                        return (
                          <motion.div
                            key={i}
                            animate={{ scale: isMid ? 1.2 : 1 }}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: isMid ? '#dbeafe' : isTarget ? '#dcfce7' : '#f1f5f9',
                              border: `2px solid ${isMid ? '#0ea5e9' : isTarget ? '#10b981' : '#cbd5e1'}`,
                              borderRadius: 3,
                              fontSize: 10,
                              fontWeight: 600,
                            }}
                          >
                            {p}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Binary search state */}
                  {step.left !== undefined && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 6, backgroundColor: '#dbeafe', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#1e40af', fontWeight: 600 }}>Left</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1e40af' }}>{step.left}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#fef3c7', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#92400e', fontWeight: 600 }}>Right</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>{step.right}</div>
                      </div>
                      <div style={{ padding: 6, backgroundColor: '#dcfce7', borderRadius: 4 }}>
                        <div style={{ fontSize: 9, color: '#15803d', fontWeight: 600 }}>Target</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d' }}>{step.target}</div>
                      </div>
                      {step.result !== undefined && (
                        <div style={{ padding: 6, backgroundColor: '#f3e8ff', borderRadius: 4 }}>
                          <div style={{ fontSize: 9, color: '#6b21a8', fontWeight: 600 }}>Result</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#6b21a8' }}>{step.result}</div>
                        </div>
                      )}
                    </div>
                  )}
                </>
            )}
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, exIdx, applyExample, ex]
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
