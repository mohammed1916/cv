import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import AnimatedIterationList from '../../components/shared/AnimatedIterationList'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Visualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'def removeDuplicates(nums):' },
  { line: 2, text: '    if len(nums) <= 2: return len(nums)' },
  { line: 3, text: '    k = 2  # write pointer' },
  { line: 4, text: '    for i in range(2, len(nums)):' },
  { line: 5, text: '        if nums[i] != nums[k-2]:' },
  { line: 6, text: '            nums[k] = nums[i]' },
  { line: 7, text: '            k += 1' },
  { line: 8, text: '    return k' },
]

function generateSteps(numsIn) {
  const steps = []
  const arr = [...numsIn]

  if (arr.length <= 2) {
    steps.push({
      phase: 'init',
      activeLine: 2,
      arr: [...arr],
      k: arr.length,
      i: -1,
      count: arr.length,
      message: `Array length ≤ 2. Return ${arr.length}`,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    arr: [...arr],
    k: 2,
    i: -1,
    count: arr.length,
    message: 'Initialize k=2 (can have at most 2 duplicates)',
  })

  for (let i = 2; i < arr.length; i++) {
    steps.push({
      phase: 'check',
      activeLine: 4,
      arr: [...arr],
      k,
      i,
      count: arr.length,
      message: `i=${i}: Check if nums[${i}]=${arr[i]} != nums[${k - 2}]=${arr[k - 2]}`,
    })

    if (arr[i] !== arr[k - 2]) {
      arr[k] = arr[i]
      steps.push({
        phase: 'write',
        activeLine: 6,
        arr: [...arr],
        k,
        i,
        count: arr.length,
        message: `Condition true! Write nums[${i}]=${arr[i]} to nums[${k}]`,
      })

      k++
      steps.push({
        phase: 'increment',
        activeLine: 7,
        arr: [...arr],
        k,
        i,
        count: arr.length,
        message: `Increment k: k=${k}`,
      })
    } else {
      steps.push({
        phase: 'skip',
        activeLine: 5,
        arr: [...arr],
        k,
        i,
        count: arr.length,
        message: `Condition false. Too many duplicates, skip nums[${i}]=${arr[i]}`,
      })
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 8,
    arr: [...arr],
    k,
    i: -1,
    count: arr.length,
    message: `Return k=${k}. First ${k} elements: [${arr.slice(0, k).join(', ')}]`,
  })

  return steps
}

const EXAMPLES = getExamples('remove-duplicates-ii') || [
  { label: 'Example 1', nums: [1, 1, 1, 2, 2, 3] },
  { label: 'Example 2', nums: [0, 0, 1, 1, 1, 1, 2, 3, 3] },
  { label: 'All duplicates', nums: [1, 1, 1, 1] },
  { label: 'No duplicates', nums: [1, 2, 3, 4] },
]

function VisualizationPanel({ applyExample, numsInput, setNumsInput, nums, inputError, handleReset, step }) {
  return (
    <div className="rd2-viz-panel">
      <div className="rd2-panel">
        <header className="rd2-head">
          <span>Remove Duplicates (At Most 2 per Element)</span>
          {inputError && <span className="rd2-error">{inputError}</span>}
        </header>
        <div className="rd2-body">
          <div className="rd2-examples">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                className="rd2-chip"
                onClick={() => applyExample(ex)}
              >
                {ex.label}
              </button>
            ))}
          </div>
          <input
            className="rd2-input"
            value={numsInput}
            onChange={(e) => {
              setNumsInput(e.target.value)
              handleReset()
            }}
            placeholder="e.g., [1, 1, 1, 2, 2, 3]"
          />

          <div className="rd2-section-label">Array State (In-Place)</div>
          <AnimatedIterationList
            items={nums}
            styleName="pointer-lane"
            className="rd2-arr"
            getItemState={(_, index) => {
              const isI = index === step?.i
              const isK = index === step?.k
              const inResult = index < step?.k
              return {
                stateClass: `${isI ? 'i-cell' : ''} ${isK && !isI ? 'k-cell' : ''} ${
                  inResult && !isI && !isK ? 'result' : ''
                }`.trim(),
                isActive: isI || isK,
              }
            }}
            renderBelow={(_, index) => {
              const isI = index === step?.i
              const isK = index === step?.k
              return (
                <div className="rd2-ptrs">
                  {isI && <span className="rd2-ptr i">i</span>}
                  {isK && <span className="rd2-ptr k">k</span>}
                </div>
              )
            }}
          />

          <div className="rd2-divider-row">
            <div className="rd2-divider-label">result zone (0..k-1)</div>
            <div className="rd2-divider-bar" style={{ width: `${(step?.k ?? 2) * 52}px` }} />
          </div>

          {step?.phase === 'done' && (
            <div className="rd2-result">
              ✓ k = {step.k} → valid elements: [{nums.slice(0, step.k).join(', ')}]
            </div>
          )}
        </div>
      </div>
      <div className="rd2-status">{step?.message || 'Press Play to begin.'}</div>
    </div>
  )
}

export default function RemoveDuplicatesIIVisualizer() {
  const [numsInput, setNumsInput] = useState('[1,1,1,2,2,3]')

  const { nums, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(numsInput)
      if (!Array.isArray(parsed)) throw new Error('Must be array')
      const numArray = parsed.map(Number)
      if (numArray.length === 0) throw new Error('Array cannot be empty')
      return { nums: numArray.slice(0, 20), inputError: '' }
    } catch (e) {
      return { nums: [1, 1, 1, 2, 2, 3], inputError: e.message }
    }
  }, [numsInput])

  const steps = useMemo(() => generateSteps(nums), [nums])
  const { stepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback((ex) => {
    setNumsInput(JSON.stringify(ex.nums))
    handleReset()
  }, [handleReset])

  const dockPanels = useMemo(
    () => [
      {
        id: 'viz',
        title: 'Visualization',
        content: (
          <VisualizationPanel
            applyExample={applyExample}
            numsInput={numsInput}
            setNumsInput={setNumsInput}
            nums={nums}
            inputError={inputError}
            handleReset={handleReset}
            step={step}
          />
        ),
      },
      {
        id: 'code',
        title: 'Code',
        content: (
          <CodeTracePanel
            step={step}
            codeLines={SOLUTION_CODE}
            onActiveLineDomChange={setActiveLineDom}
            autoScroll={autoScrollCode}
          />
        ),
      },
    ],
    [step, autoScrollCode, applyExample, numsInput, nums, inputError, handleReset]
  )

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['viz', 'code']], minimized: [] }}
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
          showAutoScroll
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
