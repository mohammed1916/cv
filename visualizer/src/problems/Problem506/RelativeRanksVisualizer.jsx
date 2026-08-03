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
import './RelativeRanksVisualizer.css'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('relative-ranks')

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


  3: 'done',


}

function generateSteps(nums) {
  const steps = []
  const n = nums.length

  steps.push({
    activeLine: 1,
    nums: [...nums],
    indexed: nums.map((score, idx) => ({ score, idx })),
    result: new Array(n).fill(''),
    currentRank: 0,
    message: 'Create indexed array with original positions'
  })

  const indexed = nums.map((score, idx) => ({ score, idx }))
  const sorted = [...indexed].sort((a, b) => b.score - a.score)
  const result = new Array(n).fill('')

  const medals = ['🥇', '🥈', '🥉']

  for (let i = 0; i < sorted.length; i++) {
    const { score, idx } = sorted[i]
    let rank = i + 1
    const medal = i < 3 ? medals[i] : `${rank}`
    result[idx] = medal

    steps.push({
      activeLine: 2,
      nums,
      indexed: sorted.slice(0, i + 1),
      result: [...result],
      currentRank: rank,
      currentIdx: idx,
      message: `Rank ${rank}: Score ${score} at original position ${idx} ${i < 3 ? '-> ' + medal : ''}`
    })
  }

  steps.push({
    activeLine: 3,
    nums,
    indexed: sorted,
    result: [...result],
    currentRank: n,
    done: true,
    message: `Complete! All ranks assigned.`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx }) {
  const examples = [
    { label: '[10,3,8,9,4]', nums: [10, 3, 8, 9, 4] },
    { label: '[100,90,80,70]', nums: [100, 90, 80, 70] },
    { label: '[5,4,3,2,1]', nums: [5, 4, 3, 2, 1] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          "Assign medals to top 3 competitors, then rank the rest by their scores."
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {examples.map(e => (
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

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Scores
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(step?.nums || nums).map((score, idx) => {
            const isActive = step && step.currentIdx === idx && !step.done
            return (
              <motion.div
                key={`score-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fee2e2' : '#f1f5f9',
                  borderColor: isActive ? '#dc2626' : '#cbd5e1',
                  color: isActive ? '#991b1b' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {score}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          Ranks at Original Positions
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(step?.result || new Array(nums.length).fill('')).map((rank, idx) => (
            <motion.div
              key={`rank-${idx}`}
              style={{
                padding: '12px 16px',
                borderRadius: 6,
                border: '2px solid #10b981',
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: '#dcfce7',
                color: '#065f46',
                minWidth: 60,
                textAlign: 'center'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {rank || '-'}
            </motion.div>
          ))}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '1px solid #10b981',
            fontSize: 12,
            color: '#065f46'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function RelativeRanksVisualizer() {
  const [nums, setNums] = useState([10, 3, 8, 9, 4])

  const steps = useMemo(
    () =>
      generateSteps(nums).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [nums]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setNums(e.nums); handleReset(); }, [handleReset])

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
      title: '🏆 Relative Ranks',
      content: (
        <VisualizationPanel
          nums={nums}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, nums, applyEx])

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

