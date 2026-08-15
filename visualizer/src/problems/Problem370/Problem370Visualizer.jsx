import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import './Problem370Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

const PATTERNS = ['complete', 'init', 'prefix_sum', 'processing']
const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'processing',
  5: 'processing',
  6: 'processing',
  10: 'prefix_sum',
  11: 'prefix_sum',
  13: 'complete'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def getModifiedArray(length, updates):' },
  { line: 2, text: '    diff = [0] * (length + 1)' },
  { line: 3, text: '    # Process each update' },
  { line: 4, text: '    for start, end, inc in updates:' },
  { line: 5, text: '        diff[start] += inc' },
  { line: 6, text: '        diff[end + 1] -= inc' },
  { line: 7, text: '    # Compute prefix sum' },
  { line: 8, text: '    result = []' },
  { line: 9, text: '    sum_val = 0' },
  { line: 10, text: '    for i in range(length):' },
  { line: 11, text: '        sum_val += diff[i]' },
  { line: 12, text: '        result.append(sum_val)' },
  { line: 13, text: '    return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(length, updates) {
  const steps = []
  const diff = new Array(length + 1).fill(0)

  // Step 1: Initialize difference array
  steps.push({
    activeLine: 2,
    phase: 'init',
    diff: [...diff],
    originalArray: new Array(length).fill(0),
    result: new Array(length).fill(0),
    updateIndex: -1,
    currentUpdate: null,
    prefixSumIndex: -1,
    message: `Initialize difference array of size ${length + 1}. Each update will mark start and end.`,
  })

  // Step 2-3: Process each update
  updates.forEach((update, idx) => {
    const [start, end, inc] = update

    steps.push({
      activeLine: 4,
      phase: 'processing',
      diff: [...diff],
      originalArray: new Array(length).fill(0),
      result: new Array(length).fill(0),
      updateIndex: idx,
      currentUpdate: update,
      prefixSumIndex: -1,
      highlighted: null,
      message: `Process update [${start}, ${end}, +${inc}]: add ${inc} to range [${start}, ${end}]`,
    })

    // Mark start
    diff[start] += inc
    steps.push({
      activeLine: 5,
      phase: 'processing',
      diff: [...diff],
      originalArray: new Array(length).fill(0),
      result: new Array(length).fill(0),
      updateIndex: idx,
      currentUpdate: update,
      prefixSumIndex: -1,
      highlighted: { position: start, type: 'mark_start' },
      message: `Mark start: diff[${start}] += ${inc} = ${diff[start]}`,
    })

    // Mark end
    diff[end + 1] -= inc
    steps.push({
      activeLine: 6,
      phase: 'processing',
      diff: [...diff],
      originalArray: new Array(length).fill(0),
      result: new Array(length).fill(0),
      updateIndex: idx,
      currentUpdate: update,
      prefixSumIndex: -1,
      highlighted: { position: end + 1, type: 'mark_end' },
      message: `Mark end: diff[${end + 1}] -= ${inc} = ${diff[end + 1]}`,
    })
  })

  // Step 4: Compute prefix sum
  steps.push({
    activeLine: 10,
    phase: 'prefix_sum',
    diff: [...diff],
    originalArray: new Array(length).fill(0),
    result: [...new Array(length).fill(0)],
    updateIndex: -1,
    currentUpdate: null,
    prefixSumIndex: -1,
    message: 'Start computing prefix sum to get final values.',
  })

  let sum_val = 0
  for (let i = 0; i < length; i++) {
    sum_val += diff[i]
    const resultCopy = new Array(length).fill(0)
    for (let j = 0; j <= i; j++) {
      resultCopy[j] = sum_val
    }

    steps.push({
      activeLine: 11,
      phase: 'prefix_sum',
      diff: [...diff],
      originalArray: new Array(length).fill(0),
      result: [...resultCopy],
      updateIndex: -1,
      currentUpdate: null,
      prefixSumIndex: i,
      highlighted: { position: i, type: 'prefix_sum' },
      message: `Compute sum[${i}]: ${sum_val} = previous sum + diff[${i}]`,
    })
  }

  const finalResult = new Array(length).fill(0)
  sum_val = 0
  for (let i = 0; i < length; i++) {
    sum_val += diff[i]
    finalResult[i] = sum_val
  }

  steps.push({
    activeLine: 13,
    phase: 'complete',
    diff: [...diff],
    originalArray: new Array(length).fill(0),
    result: [...finalResult],
    updateIndex: -1,
    currentUpdate: null,
    prefixSumIndex: -1,
    message: `Complete! Final result: [${finalResult.join(', ')}]`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Simple Range',
    length: 5,
    updates: [[1, 3, 2]],
  },
  {
    label: 'Multiple Ranges',
    length: 5,
    updates: [
      [1, 3, 2],
      [2, 4, 3],
    ],
  },
  {
    label: 'Overlapping Ranges',
    length: 5,
    updates: [
      [1, 3, 2],
      [0, 2, 1],
      [2, 4, 3],
    ],
  },
]

export default function Problem370Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [lengthInput, setLengthInput] = useState(JSON.stringify(EXAMPLES[0]?.length ?? []));
  const [updatesInput, setUpdatesInput] = useState("");
  const { length, updates, inputError } = useMemo(() => {
    try {
      const parsedLength = JSON.parse(lengthInput); if (!Array.isArray(parsedLength)) throw new Error('length must be an array');
      const parsedUpdates = JSON.parse(updatesInput); if (!Array.isArray(parsedUpdates)) throw new Error('updates must be an array');
      return { length: parsedLength, updates: parsedUpdates, inputError: '' };
    } catch (e) {
      return { length: EXAMPLES[exIdx]?.length ?? '', updates: EXAMPLES[exIdx]?.updates ?? '', inputError: e.message };
    }
  }, [lengthInput, updatesInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(() => generateSteps(length, updates), [ex])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setLengthInput(JSON.stringify(EXAMPLES[i].length)); setUpdatesInput(JSON.stringify(EXAMPLES[i].updates)); handleReset(); }, [handleReset]);

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: 'relative' }}>
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            highlightedLines={connectivity.highlightedLines}
            onLineSelect={connectivity.handleLineSelect}
            onActiveLineDomChange={setActiveLineDom}
          />
          {step && (
            <CodePatternAnnotations
              linePatterns={LINE_PATTERN_MAP}
              currentPhase={step.phase}
              activeLineDom={activeLineDom}
              activeLine={step.activeLine}
            />
          )}
        </div>
      ),
    },
    {
      id: 'viz',
      title: '📊 Range Addition Visualizer',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          {/* Example selector */}
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
              {/* Message */}
              <div style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                {step.message}
              </div>

              {/* Current Update */}
              {step.currentUpdate && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#fef3c7',
                    border: '2px solid #f59e0b',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>Current Update:</div>
                  <div style={{ marginTop: 4 }}>
                    Add <span style={{ color: '#d97706', fontWeight: 600 }}>+{step.currentUpdate[2]}</span> to range [
                    <span style={{ color: '#d97706', fontWeight: 600 }}>{step.currentUpdate[0]}</span>,{' '}
                    <span style={{ color: '#d97706', fontWeight: 600 }}>{step.currentUpdate[1]}</span>]
                  </div>
                </motion.div>
              )}

              {/* Original Array */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Original Array</div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.originalArray.map((val, idx) => (
                    <div
                      key={`orig-${idx}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#f1f5f9',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#334155',
                        minWidth: 40,
                        textAlign: 'center',
                      }}
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>

              {/* Difference Array */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                  Difference Array {step.phase === 'processing' ? '(Building)' : '(Complete)'}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.diff.map((val, idx) => {
                    let bgColor = '#f1f5f9'
                    let borderColor = '#cbd5e1'
                    let textColor = '#334155'

                    if (step.highlighted?.type === 'mark_start' && idx === step.highlighted.position) {
                      bgColor = '#dcfce7'
                      borderColor = '#10b981'
                      textColor = '#047857'
                    } else if (step.highlighted?.type === 'mark_end' && idx === step.highlighted.position) {
                      bgColor = '#fee2e2'
                      borderColor = '#ef4444'
                      textColor = '#991b1b'
                    } else if (step.phase === 'processing' && step.currentUpdate) {
                      const [start, end] = step.currentUpdate
                      if (idx >= start && idx <= end) {
                        bgColor = '#dbeafe'
                        borderColor = '#0284c7'
                        textColor = '#0c4a6e'
                      }
                    }

                    return (
                      <motion.div
                        key={`diff-${idx}`}
                        animate={{
                          scale: step.highlighted?.position === idx ? 1.15 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: `2px solid ${borderColor}`,
                          backgroundColor: bgColor,
                          fontSize: 12,
                          fontWeight: 600,
                          color: textColor,
                          minWidth: 45,
                          textAlign: 'center',
                        }}
                      >
      
                        {val}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Result Array (Prefix Sum) */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                  Result Array (Prefix Sum)
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {step.result.map((val, idx) => {
                    const isCurrent = step.prefixSumIndex === idx && step.phase === 'prefix_sum'
                    const isProcessed = idx < step.prefixSumIndex && step.phase === 'prefix_sum'

                    return (
                      <motion.div
                        key={`result-${idx}`}
                        animate={{
                          scale: isCurrent ? 1.15 : 1,
                        }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 4,
                          border: '2px solid',
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: isCurrent ? '#fbbf24' : isProcessed ? '#d1fae5' : '#f1f5f9',
                          borderColor: isCurrent ? '#f59e0b' : isProcessed ? '#10b981' : '#cbd5e1',
                          color: isCurrent ? '#78350f' : isProcessed ? '#047857' : '#334155',
                          minWidth: 45,
                          textAlign: 'center',
                        }}
                      >
                        {val}
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Algorithm Explanation */}
              {step.phase === 'processing' && step.currentUpdate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#1e40af',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Key Insight:</div>
                  <div>
                    Instead of updating all elements [start, end], mark the boundaries in a difference array. The prefix sum will
                    automatically propagate the increment!
                  </div>
                </motion.div>
              )}

              {step.phase === 'prefix_sum' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 6,
                    fontSize: 11,
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Prefix Sum Phase:</div>
                  <div>Computing cumulative sum from difference array produces the final result with all updates applied.</div>
                </motion.div>
              )}

              {step.phase === 'complete' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: 10,
                    backgroundColor: '#dbeafe',
                    border: '2px solid #0284c7',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0c4a6e',
                  }}
                >
                  ✓ Complete! Time: O(n + m), Space: O(n) where n = length, m = updates count
                </motion.div>
              )}
            </>
          )}
        </div>
      ),
    },
  ], [step, connectivity, setActiveLineDom, exIdx, applyExample])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"length","label":"length","type":"number"},{"key":"updates","label":"updates","type":"array"}]}
          values={{ length: lengthInput, updates: updatesInput }}
          onChange={(k, v) => { if (k === 'length') setLengthInput(v); if (k === 'updates') setUpdatesInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={(e) => applyExample(EXAMPLES.indexOf(e))}
          inputError={inputError}
        />
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
