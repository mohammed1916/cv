import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamples } from '../../config/examplesRegistry'
import './Problem377.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = []

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def combinationSum4(nums, target):' },
  { line: 2, text: '    dp = [0] * (target + 1)' },
  { line: 3, text: '    dp[0] = 1' },
  { line: 4, text: '    for i in range(1, target + 1):' },
  { line: 5, text: '        for num in nums:' },
  { line: 6, text: '            if num <= i:' },
  { line: 7, text: '                dp[i] += dp[i - num]' },
  { line: 8, text: '    return dp[target]' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(nums, target) {
  const steps = []
  const dp = Array(target + 1).fill(0)
  dp[0] = 1

  // Initialization
  steps.push({
    activeLine: 2,
    dp: [...dp],
    target,
    currentIdx: 0,
    currentNum: null,
    message: `Initialize DP array of size ${target + 1}. dp[0] = 1 (base case).`,
  })

  // DP building
  for (let i = 1; i <= target; i++) {
    steps.push({
      activeLine: 4,
      dp: [...dp],
      target,
      currentIdx: i,
      currentNum: null,
      message: `Process target sum ${i}. Try each number to build combinations.`,
    })

    for (let num of nums) {
      if (num <= i) {
        const prevIdx = i - num
        const added = dp[prevIdx]
        dp[i] += dp[prevIdx]

        steps.push({
          activeLine: 7,
          dp: [...dp],
          target,
          currentIdx: i,
          currentNum: num,
          highlighted: [prevIdx, i],
          message: `num=${num}: dp[${i}] += dp[${prevIdx}] (${added} combinations added, total now ${dp[i]}).`,
        })
      }
    }
  }

  // Result
  steps.push({
    activeLine: 8,
    dp: [...dp],
    target,
    currentIdx: target,
    currentNum: null,
    message: `Final: dp[${target}] = ${dp[target]} ordered combinations.`,
  })

  return steps
}

const EXAMPLES = [
  {
    label: 'Example 1',
    nums: [1, 2, 3],
    target: 4,
  },
  {
    label: 'Example 2',
    nums: [1, 3, 4],
    target: 5,
  },
  {
    label: 'Example 3',
    nums: [1, 2],
    target: 3,
  },
]

export default function Problem377Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [numsInput, setNumsInput] = useState(JSON.stringify(EXAMPLES[0]?.nums ?? []));
  const [targetInput, setTargetInput] = useState("");
  const { nums, target, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      const parsedTarget = Number(targetInput); if (isNaN(parsedTarget)) throw new Error('target must be a number');
      return { nums: parsedNums, target: parsedTarget, inputError: '' };
    } catch (e) {
      return { nums: EXAMPLES[exIdx]?.nums ?? '', target: EXAMPLES[exIdx]?.target ?? '', inputError: e.message };
    }
  }, [numsInput, targetInput]);
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const ex = EXAMPLES[exIdx]
  const steps = useMemo(
    () => generateSteps(nums, target).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [ex],
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((i) => { setExIdx(i); setNumsInput(JSON.stringify(EXAMPLES[i].nums)); setTargetInput(String(EXAMPLES[i].target)); handleReset(); }, [handleReset]);

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <div style={{ position: "relative" }}>
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
      title: '📊 DP Table & Combinations',
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
              </div>

              <div style={{ padding: 8, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Available Numbers:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {nums.map((num) => (
                    <motion.div
                      key={num}
                      animate={{ scale: num === step.currentNum ? 1.2 : 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: num === step.currentNum ? '2px solid #f59e0b' : '1px solid #d97706',
                        backgroundColor: num === step.currentNum ? '#fbbf24' : '#fcd34d',
                        color: '#78350f',
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#1e40af' }}>DP Table (Sum → Combination Count):</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {step.dp.map((count, sum) => (
                    <motion.div
                      key={sum}
                      animate={{ scale: sum === step.currentIdx ? 1.2 : 1 }}
                      style={{
                        padding: 8,
                        borderRadius: 4,
                        border: sum === step.currentIdx ? '2px solid #0ea5e9' : sum === 0 ? '2px solid #10b981' : '1px solid #cbd5e1',
                        backgroundColor:
                          sum === step.currentIdx ? '#0ea5e9' :
                          sum === 0 ? '#d1fae5' :
                          step.highlighted?.includes(sum) ? '#bfdbfe' :
                          '#f1f5f9',
                        color:
                          sum === step.currentIdx ? '#fff' :
                          sum === 0 ? '#065f46' :
                          step.highlighted?.includes(sum) ? '#1e40af' :
                          '#1e293b',
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      <div>{sum}</div>
                      <div style={{ fontSize: 10 }}>{count}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6, fontSize: 11 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, color: '#15803d' }}>Result:</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>
                  {step.dp[target]} ordered combinations sum to {target}
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, exIdx, applyExample, ex])

  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
    </div>
  )
}
