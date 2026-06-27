import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './KDiffPairsInArrayVisualizer.css'

const EXAMPLES = getExamples('k-diff-pairs-in-array')

function generateSteps(nums, k) {
  const steps = []

  steps.push({
    activeLine: 1,
    nums,
    k,
    count: new Map(nums.map(n => [n, (nums.filter(x => x === n).length)])),
    pairs: 0,
    phase: 'init',
    message: `Find k-diff pairs where k=${k}`,
    relatedLines: [1]
  })

  if (k < 0) {
    steps.push({
      activeLine: 2,
      nums,
      k,
      pairs: 0,
      phase: 'done',
      message: `k < 0: no pairs possible`,
      relatedLines: [2],
      done: true,
      result: 0
    })
    return steps
  }

  const count = new Map()
  for (const num of nums) {
    count.set(num, (count.get(num) || 0) + 1)
  }

  steps.push({
    activeLine: 3,
    nums,
    k,
    count,
    pairs: 0,
    phase: 'count',
    message: `Count frequencies of each number`,
    relatedLines: [3]
  })

  let pairs = 0
  const processedNums = new Set()

  for (const num of count.keys()) {
    if (processedNums.has(num)) continue

    steps.push({
      activeLine: 5,
      nums,
      k,
      count,
      num,
      pairs,
      phase: 'check_num',
      message: `Check number ${num}`,
      relatedLines: [5]
    })

    if (k === 0) {
      if (count.get(num) > 1) {
        pairs++
        steps.push({
          activeLine: 7,
          nums,
          k,
          count,
          num,
          pairs,
          phase: 'found_pair',
          message: `Found pair: (${num}, ${num}) - number appears ${count.get(num)} times`,
          relatedLines: [7]
        })
      }
    } else {
      const target = num + k
      if (count.has(target)) {
        pairs++
        steps.push({
          activeLine: 9,
          nums,
          k,
          count,
          num,
          target,
          pairs,
          phase: 'found_pair',
          message: `Found pair: (${num}, ${target})`,
          relatedLines: [9]
        })
      }
    }

    processedNums.add(num)
  }

  steps.push({
    activeLine: 10,
    nums,
    k,
    count,
    pairs,
    phase: 'done',
    message: `Total k-diff pairs: ${pairs}`,
    relatedLines: [10],
    done: true,
    result: pairs
  })

  return steps
}

function VisualizationPanel({ nums, k, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Count unique pairs (a, b) where a and b differ by exactly k."
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

      {/* Parameters */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Target Difference</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7' }}>{k}</div>
        </div>
        <div style={{ padding: 12, backgroundColor: '#f1f5f9', borderRadius: 6, flex: 1 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Array Size</div>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: '#0284c7' }}>{nums.length}</div>
        </div>
      </div>

      {/* Frequency Map */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Number Frequencies</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {step?.count && Array.from(step.count.entries()).map(([num, freq]) => {
            const isCurrent = step?.num === num
            return (
              <motion.div
                key={`freq-${num}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isCurrent ? '#dbeafe' : '#f1f5f9',
                  borderColor: isCurrent ? '#0284c7' : '#cbd5e1',
                  color: isCurrent ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
              >
                <div style={{ fontSize: 10, color: '#6b7280' }}>{num}</div>
                <div>×{freq}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Pair Info */}
      {step?.phase === 'found_pair' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#dbeafe',
            borderRadius: 6,
            border: '1px solid #0284c7'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#0c4a6e', marginBottom: 8, fontWeight: 600 }}>
            Pair Found!
          </div>
          {k === 0 ? (
            <div style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: 12 }}>
              ({step.num}, {step.num}) - count: {step.count.get(step.num)}
            </div>
          ) : (
            <div style={{ color: '#0284c7', fontFamily: 'monospace', fontSize: 12 }}>
              ({step.num}, {step.target}) - diff: {step.target - step.num}
            </div>
          )}
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>K-Diff Pairs</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.pairs !== undefined ? step.pairs : '...'}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function KDiffPairsInArrayVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { nums: [3, 1, 4, 1, 5], k: 1 })

  const steps = useMemo(
    () =>
      generateSteps(ex.nums, ex.k).map((current) => ({
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
      title: '📊 K-Diff Pairs in Array',
      content: (
        <VisualizationPanel
          nums={ex.nums}
          k={ex.k}
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
