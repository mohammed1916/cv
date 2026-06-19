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
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem491Visualizer.css'

const EXAMPLES = getExamples('increasing-subsequences') || [
  { label: 'Example 1', nums: [4,6,7,7] },
  { label: 'Example 2', nums: [4,4,3,2,1] },
]

function generateSteps(nums) {
  const steps = []
  const result = []
  let stepCount = 0

  steps.push({
    activeLine: 1,
    nums,
    currentPath: [],
    result: [],
    stepCount: stepCount++,
    message: 'Start backtracking to find all increasing subsequences'
  })

  function backtrack(idx, path, last) {
    if (path.length >= 2) {
      result.push([...path])
      steps.push({
        activeLine: 2,
        nums,
        currentPath: path,
        result: [...result],
        stepCount: stepCount++,
        message: `Found subsequence: [${path.join(',')}]`
      })
    }

    const usedSet = new Set()
    for (let i = idx; i < nums.length; i++) {
      if (usedSet.has(nums[i]) || nums[i] <= last) continue
      usedSet.add(nums[i])

      path.push(nums[i])
      backtrack(i + 1, path, nums[i])
      path.pop()
    }
  }

  backtrack(0, [], Number.NEGATIVE_INFINITY)

  steps.push({
    activeLine: 3,
    nums,
    currentPath: [],
    result,
    stepCount: stepCount++,
    done: true,
    message: `Found ${result.length} increasing subsequences`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f97316' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Find all increasing subsequences (length >= 2) without duplicates using backtracking.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((num, idx) => (
            <motion.div
              key={`num-${idx}`}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: '2px solid #f97316',
                fontWeight: 700,
                backgroundColor: '#fff7ed',
                color: '#f97316'
              }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>

      {step?.currentPath && step.currentPath.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fed7aa',
            borderRadius: 6,
            border: '2px solid #f97316'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e' }}>Current Path</div>
          <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#92400e' }}>
            [{step.currentPath.join(', ')}]
          </div>
        </motion.div>
      )}

      {step?.result && step.result.length > 0 && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#d1fae5',
            borderRadius: 6,
            border: '1px solid #10b981',
            maxHeight: 150,
            overflowY: 'auto'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>
            Found Subsequences ({step.result.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {step.result.slice(-5).map((seq, idx) => (
              <div key={idx} style={{
                padding: '4px 8px',
                backgroundColor: '#d1fae5',
                borderRadius: 3,
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#047857'
              }}>
                [{seq.join(',')}]
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #f97316',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>Total Subsequences</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#f97316' }}>
          {step?.result?.length ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#f97316', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem491Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('increasing-subsequences')

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

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    { id: 'code', title: 'Code', content: (<CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />) },
    { id: 'viz', title: '🔢 Increasing Subsequences', content: (<VisualizationPanel nums={ex.nums} step={step} applyEx={applyEx} />) },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Playback Controls">
        <PlaybackControls isPlaying={isPlaying} isDone={isDone} speed={speed} onPlayToggle={togglePlay} onPrev={stepBack} onNext={stepForward} onReset={handleReset} prevDisabled={stepIndex < 0} nextDisabled={isDone} resetDisabled={stepIndex < 0} onSpeedChange={e => setSpeed(Number(e.target.value))} showPatternOverlay={showPatternOverlay} onShowPatternOverlayChange={setShowPatternOverlay} patternOverlayLabel="Show pattern overlay" showPatternOverlayToggle />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
