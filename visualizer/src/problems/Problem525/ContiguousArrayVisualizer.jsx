import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './ContiguousArrayVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'

const PATTERNS = ['init', 'loop', 'process']

const LINE_PATTERN_MAP = {
  1: 'init',
  3: 'loop',
  4: 'loop',
  5: 'loop',
  6: 'process'
}


const EXAMPLES = getExamples('contiguous-array')

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findMaxLength(nums):' },
  { line: 2, text: '    count_map = {0: -1}' },
  { line: 3, text: '    max_length = 0' },
  { line: 4, text: '    count = 0' },
  { line: 5, text: '    for i, num in enumerate(nums):' },
  { line: 6, text: '        count += 1 if num == 1 else -1' },
  { line: 7, text: '        if count in count_map:' },
  { line: 8, text: '            max_length = max(max_length, i - count_map[count])' },
  { line: 9, text: '        else: count_map[count] = i' },
  { line: 10, text: '    return max_length' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(arr) {
  const steps = []
  const map = new Map()
  map.set(0, -1)
  let count = 0
  let maxLen = 0

  // Initialize
  steps.push({
    activeLine: 1,
    arr,
    count,
    map: new Map(map),
    i: -1,
    maxLen,
    message: 'Initialize: map with 0→-1, count=0 for tracking 0/1 balance'
  })

  // Iterate through array
  for (let i = 0; i < arr.length; i++) {
    count += arr[i] === 0 ? -1 : 1

    steps.push({
      activeLine: 3,
      arr,
      count,
      map: new Map(map),
      i,
      maxLen,
      message: `Update count: arr[${i}] = ${arr[i]} → count = ${count} ${arr[i] === 0 ? '(-1)' : '(+1)'}`
    })

    if (map.has(count)) {
      const len = i - map.get(count)
      maxLen = Math.max(maxLen, len)

      steps.push({
        activeLine: 4,
        arr,
        count,
        map: new Map(map),
        i,
        maxLen,
        subarray: [map.get(count) + 1, i],
        message: `Count exists at index ${map.get(count)} → subarray length = ${len}`
      })
    } else {
      const newMap = new Map(map)
      newMap.set(count, i)
      map.set(count, i)

      steps.push({
        activeLine: 5,
        arr,
        count,
        map: newMap,
        i,
        maxLen,
        message: `First occurrence of count ${count} → store at index ${i}`
      })
    }
  }

  steps.push({
    activeLine: 6,
    arr,
    count,
    map: new Map(map),
    i: arr.length,
    maxLen,
    done: true,
    message: `Done! Max contiguous subarray with equal 0s and 1s: ${maxLen}`
  })

  return steps
}

function VisualizationPanel({ arr, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find the maximum length of contiguous subarray with equal number of 0s and 1s. Use a running count: +1 for 1s, -1 for 0s. When count repeats, the subarray between those indices is balanced."
        </div>
      </div>

      {/* Examples */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Array visualization */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Array: {JSON.stringify(step?.arr || arr)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {step?.arr?.map((val, idx) => {
            const isActive = step && idx === step.i && !step.done
            const inSubarray = step?.subarray && idx > step.subarray[0] - 1 && idx <= step.subarray[1]
            return (
              <motion.div
                key={`a-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#dbeafe' : inSubarray ? '#dcfce7' : '#f1f5f9',
                  borderColor: isActive ? '#0284c7' : inSubarray ? '#22c55e' : '#cbd5e1',
                  color: isActive ? '#0c4a6e' : inSubarray ? '#166534' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Count info */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Running Count (0→-1, 1→+1)
        </div>
        <div style={{
          padding: 16,
          backgroundColor: '#f3f4f6',
          borderRadius: 6,
          border: '2px solid #d1d5db',
          fontFamily: 'monospace',
          fontSize: 16,
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          {step?.count ?? 0}
        </div>
      </div>

      {/* Count map */}
      {step?.map && step.map.size > 0 && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 12 }}>
            Count Map (count → index)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Array.from(step.map.entries()).map(([cnt, idx]) => (
              <div key={cnt} style={{
                padding: '8px 12px',
                backgroundColor: '#dcfce7',
                borderRadius: 4,
                border: '1px solid #10b981',
                fontSize: 12
              }}>
                {cnt} → {idx}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Result</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#7c3aed' }}>
          {step?.maxLen ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function ContiguousArrayVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [0, 1] })

  const steps = useMemo(
    () =>
      generateSteps(ex.nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
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
      ),
    },
    {
      id: 'viz',
      title: '🎯 Contiguous Array',
      content: (
        <VisualizationPanel
          arr={ex.nums}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
