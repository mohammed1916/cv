import ManualInputPanel from '../../components/shared/ManualInputPanel'
﻿import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'

const PATTERNS = ['done', 'error', 'found', 'init', 'pick', 'skip']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  1: 'error',
  5: 'init',
  11: 'found',
  12: 'skip',
  13: 'pick',
  15: 'done',
}

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def __init__(self, nums):' },
  { line: 3, text: '        self.nums = nums' },
  { line: 4, text: '    ' },
  { line: 5, text: '    def pick(self, target):' },
  { line: 6, text: '        count = 0' },
  { line: 7, text: '        result = -1' },
  { line: 8, text: '        ' },
  { line: 9, text: '        for i, num in enumerate(self.nums):' },
  { line: 10, text: '            if num == target:' },
  { line: 11, text: '                count += 1  # Increment count' },
  { line: 12, text: '                if random.randint(1, count) == 1:' },
  { line: 13, text: '                    result = i  # Pick this index' },
  { line: 14, text: '        ' },
  { line: 15, text: '        return result' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(numsStr, targetStr) {
  const steps = []

  try {
    const nums = JSON.parse(numsStr)
    const target = Number(targetStr)

    if (!Array.isArray(nums)) throw new Error('Input must be an array')
    if (isNaN(target)) throw new Error('Target must be a number')

    steps.push({
      phase: 'init',
      activeLine: 5,
      message: `Initialize pick(${target}). Array: [${nums.join(', ')}]`,
      nums,
      target,
      count: 0,
      result: -1,
      currentIndex: -1,
      matchIndices: nums.map((n, i) => n === target ? i : -1).filter(i => i !== -1),
    })

    let count = 0
    let result = -1
    const matches = []

    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === target) {
        count++
        matches.push(i)

        steps.push({
          phase: 'found',
          activeLine: 11,
          message: `Found target at index ${i}. Count: ${count}`,
          nums,
          target,
          count,
          result,
          currentIndex: i,
          matchIndices: matches,
          probability: `1/${count}`,
        })

        const willPick = count === 1 ? true : Math.random() < 1 / count

        if (willPick) {
          result = i
          steps.push({
            phase: 'pick',
            activeLine: 13,
            message: `Random pick succeeded (1/${count} chance). Selected index ${i}.`,
            nums,
            target,
            count,
            result,
            currentIndex: i,
            matchIndices: matches,
            selectedIndex: i,
            probability: `1/${count}`,
          })
        } else {
          steps.push({
            phase: 'skip',
            activeLine: 12,
            message: `Random check failed. Keep previous result (${result === -1 ? 'none' : result}).`,
            nums,
            target,
            count,
            result,
            currentIndex: i,
            matchIndices: matches,
            selectedIndex: result,
            probability: `1/${count}`,
          })
        }
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 15,
      message: `Complete. Selected index: ${result} (value: ${result === -1 ? 'N/A' : nums[result]})`,
      nums,
      target,
      count,
      result,
      matchIndices: matches,
      selectedIndex: result,
    })

  } catch (e) {
    steps.push({
      phase: 'error',
      activeLine: 1,
      message: `Error: ${e.message}`,
      error: true,
    })
  }

  return steps
}

const EXAMPLES = getExamplesOr('random-pick-index', [
  { label: 'Example 1', nums: '[1,2,3,3,3]', target: '3' },
  { label: 'Example 2', nums: '[1]', target: '1' },
  { label: 'Example 3', nums: '[1,2,3,1,1,1]', target: '1' },
])

export default function Problem398Visualizer() {
  const [numsInput, setNumsInput] = useState('[1,2,3,3,3]')
  const [targetInput, setTargetInput] = useState('3')

  const { nums, target, inputError } = useMemo(() => {
    try {
      const parsed = JSON.parse(numsInput)
      const t = Number(targetInput)
      if (!Array.isArray(parsed)) throw new Error('Array format invalid')
      if (isNaN(t)) throw new Error('Target must be a number')
      return { nums: parsed, target: t, inputError: '' }
    } catch (e) {
      return { nums: [1,2,3,3,3], target: 3, inputError: e.message || 'Invalid input' }
    }
  }, [numsInput, targetInput])

  const steps = useMemo(
    () => generateSteps(numsInput, targetInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [numsInput, targetInput],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setNumsInput(ex.nums)
    setTargetInput(ex.target)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: '12px' }}>
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"},{"key":"target","label":"target","type":"number"}]}
        values={{ nums: numsInput, target: targetInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'target') setTargetInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

      <div style={{ display: 'flex', gap: 16, flex: 1 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#627794', fontSize: '13px', marginBottom: '6px' }}>Array (nums)</div>
              <input
                value={numsInput}
                onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
                placeholder="[1,2,3,3,3]"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
            <div style={{ width: '80px' }}>
              <div style={{ color: '#627794', fontSize: '13px', marginBottom: '6px' }}>Target</div>
              <input
                value={targetInput}
                onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
                placeholder="3"
                type="number"
                style={{
                  width: '100%', padding: '8px', backgroundColor: '#0f172a', color: '#e2e8f0',
                  border: '1px solid #334155', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px'
                }}
              />
            </div>
          </div>

          {inputError && (
            <div style={{ color: '#ea0c0c', fontSize: '12px' }}>{inputError}</div>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px', backgroundColor: '#334155', color: '#e2e8f0',
                  border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                }}
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px' }}>
            <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>Array Visualization</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {nums.map((val, idx) => {
                const isMatch = val === target
                const isSelected = step?.selectedIndex === idx

                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isSelected ? 1.1 : 1 }}
                    style={{
                      width: '44px', height: '44px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 2,
                      backgroundColor: isSelected ? '#06b6d4' : isMatch ? '#8b5cf6' : '#334155',
                      color: '#5577a4', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold',
                      border: isSelected ? '2px solid #0ea5e9' : '1px solid transparent',
                    }}
                  >
                    <div>{val}</div>
                    <div style={{ fontSize: '10px', color: '#5a779b' }}>{idx}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ color: '#627794', fontSize: '13px', marginBottom: '8px' }}>Matching Indices</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {step?.matchIndices?.map((idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: step?.selectedIndex === idx ? '#06b6d4' : '#8b5cf666',
                      padding: '6px 12px', borderRadius: '4px', color: '#5577a4', fontSize: '12px',
                      fontWeight: 'bold', border: step?.selectedIndex === idx ? '2px solid #0ea5e9' : 'none'
                    }}
                  >
                    Index {idx} (value: {nums[idx]})
                  </div>
                ))}
                {!step?.matchIndices || step.matchIndices.length === 0 && (
                  <div style={{ color: '#64748b', fontSize: '12px' }}>No matches found</div>
                )}
              </div>
            </div>

            {step?.probability && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Current Probability</div>
                <div style={{ color: '#7e56f8', fontSize: '16px', fontWeight: 'bold' }}>
                  {step.probability}
                </div>
              </div>
            )}

            {step?.result !== undefined && (
              <div style={{ backgroundColor: '#334155', padding: '8px', borderRadius: '4px', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontSize: '12px' }}>Selected Index</div>
                <div style={{ color: '#048196', fontSize: '18px', fontWeight: 'bold' }}>
                  {step.result === -1 ? 'None' : step.result}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
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
        </div>
      </div>

      <div style={{
        backgroundColor: step?.phase === 'done' ? '#10b98166' : step?.error ? '#ef444466' : '#1e293b',
        padding: '12px', borderRadius: '6px', color: step?.phase === 'done' ? '#86efac' : step?.error ? '#fca5a5' : '#cbd5e1',
        fontSize: '13px', fontFamily: 'monospace'
      }}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <div>
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
          onSpeedChange={(e) => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      </div>
    </div>
  )
}
