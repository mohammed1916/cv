import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import './NextGreaterElementIIVisualizer.css'

const PATTERNS = ['init', 'visit', 'pop', 'push', 'skip', 'wrap', 'done', 'error']

const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'init',
  7: 'visit',
  8: 'visit',
  9: 'pop',
  10: 'pop',
  12: 'push',
  14: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def nextGreaterElements(nums):' },
  { line: 2, text: '    n = len(nums)' },
  { line: 3, text: '    result = [-1] * n' },
  { line: 4, text: '    stack = []  # holds indices, values decreasing' },
  { line: 5, text: '' },
  { line: 6, text: '    # Two passes simulate the circular wrap-around.' },
  { line: 7, text: '    for i in range(2 * n):' },
  { line: 8, text: '        idx = i % n' },
  { line: 9, text: '        while stack and nums[stack[-1]] < nums[idx]:' },
  { line: 10, text: '            result[stack.pop()] = nums[idx]' },
  { line: 11, text: '        if i < n:' },
  { line: 12, text: '            stack.append(idx)' },
  { line: 13, text: '' },
  { line: 14, text: '    return result' },
]

const EXAMPLES = getExamplesOr('next-greater-element-ii', [
  { label: 'Example 1', text: '1,2,1' },
  { label: 'Example 2', text: '1,2,3,4,3' },
  { label: 'Decreasing', text: '5,4,3,2,1' },
]).map((ex) => ({
  label: ex.label,
  text: ex.text ?? (ex.nums ?? []).join(','),
}))

function parseNums(text) {
  const parts = text.split(/[,\s[\]]+/).filter((s) => s !== '')
  if (parts.length === 0) throw new Error('Enter numbers, e.g. 1,2,1')
  const nums = parts.map(Number)
  if (nums.some((n) => Number.isNaN(n))) throw new Error('All entries must be numbers')
  if (nums.length > 16) throw new Error('Keep the array to 16 elements or fewer')
  return nums
}

function generateSteps(text) {
  const steps = []

  try {
    const nums = parseNums(text)
    const n = nums.length
    const result = new Array(n).fill(-1)
    const stack = []

    steps.push({
      phase: 'init',
      activeLine: 3,
      message: `n = ${n}. result starts as all -1; the stack holds indices whose next-greater is still unknown.`,
      nums,
      result: [...result],
      stack: [],
    })

    for (let i = 0; i < 2 * n; i += 1) {
      const idx = i % n
      const secondPass = i >= n

      steps.push({
        phase: secondPass ? 'wrap' : 'visit',
        activeLine: 8,
        message: secondPass
          ? `Second pass (wrap-around): i=${i} → index ${idx}, value ${nums[idx]}. Resolve leftovers only, don't push.`
          : `i=${i} → index ${idx}, value ${nums[idx]}. Can it resolve anything on the stack?`,
        nums,
        result: [...result],
        stack: [...stack],
        cursor: idx,
        pass: secondPass ? 2 : 1,
        i,
      })

      let popped = false
      while (stack.length > 0 && nums[stack[stack.length - 1]] < nums[idx]) {
        const top = stack.pop()
        result[top] = nums[idx]
        popped = true
        steps.push({
          phase: 'pop',
          activeLine: 10,
          message: `nums[${top}] = ${nums[top]} < ${nums[idx]} → pop index ${top}, result[${top}] = ${nums[idx]}`,
          nums,
          result: [...result],
          stack: [...stack],
          cursor: idx,
          resolvedIndex: top,
          pass: secondPass ? 2 : 1,
          i,
        })
      }

      if (!popped && stack.length > 0) {
        steps.push({
          phase: 'skip',
          activeLine: 9,
          message: `Stack top nums[${stack[stack.length - 1]}] = ${nums[stack[stack.length - 1]]} ≥ ${nums[idx]} — nothing to resolve.`,
          nums,
          result: [...result],
          stack: [...stack],
          cursor: idx,
          pass: secondPass ? 2 : 1,
          i,
        })
      }

      if (i < n) {
        stack.push(idx)
        steps.push({
          phase: 'push',
          activeLine: 12,
          message: `First pass — push index ${idx} (value ${nums[idx]}) and wait for a bigger value.`,
          nums,
          result: [...result],
          stack: [...stack],
          cursor: idx,
          pass: 1,
          i,
        })
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 14,
      message: `Done. Indices still on the stack (${stack.length ? stack.join(', ') : 'none'}) have no greater element anywhere — they stay -1. Result: [${result.join(', ')}]`,
      nums,
      result: [...result],
      stack: [...stack],
      done: true,
      finalResult: [...result],
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

export default function NextGreaterElementIIVisualizer() {
  const [text, setText] = useState(EXAMPLES[0]?.text || '1,2,1')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      parseNums(text)
      return ''
    } catch (e) {
      return e.message
    }
  }, [text])

  const steps = useMemo(
    () => generateSteps(text).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [text],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setText(ex.text)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const primaryPanel = (
    <div className="p503-panel-primary">
      <div className="p503-card">
        <div className="p503-section-label">Input Array (circular)</div>
        <input
          className={`p503-input mono ${inputError ? 'has-error' : ''}`}
          value={text}
          onChange={(e) => { setText(e.target.value); handleReset() }}
          placeholder="1,2,1"
        />
        <p className={`p503-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'The search wraps past the end back to the start. Two passes over the array cover the wrap.'}
        </p>
        <div className="p503-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p503-example-btn ${text === ex.text ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p503-card">
        <div className="p503-section-label">
          Array {step?.pass ? `· pass ${step.pass}` : ''}
        </div>
        <div className="p503-row">
          {(step?.nums ?? []).map((v, idx) => (
            <motion.div
              key={idx}
              className={[
                'p503-cell',
                idx === step?.cursor ? 'cursor' : '',
                idx === step?.resolvedIndex ? 'resolved' : '',
                step?.stack?.includes(idx) ? 'stacked' : '',
              ].filter(Boolean).join(' ')}
              animate={{ scale: idx === step?.cursor ? 1.15 : 1 }}
            >
              <span className="p503-cell-idx">{idx}</span>
              <span className="p503-cell-val">{v}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p503-card">
        <div className="p503-section-label">result[]</div>
        <div className="p503-row">
          {(step?.result ?? []).map((v, idx) => (
            <motion.div
              key={idx}
              className={[
                'p503-cell',
                'result',
                v !== -1 ? 'filled' : '',
                idx === step?.resolvedIndex ? 'resolved' : '',
              ].filter(Boolean).join(' ')}
              animate={{ scale: idx === step?.resolvedIndex ? 1.15 : 1 }}
            >
              <span className="p503-cell-idx">{idx}</span>
              <span className="p503-cell-val">{v}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const statePanel = (
    <div className="p503-panel-state">
      <div className="p503-card">
        <div className="p503-section-label">Monotonic Stack (indices)</div>
        {step?.stack?.length ? (
          <div className="p503-stack">
            {[...step.stack].reverse().map((idx, k) => (
              <motion.div
                key={idx}
                className={`p503-stack-item ${k === 0 ? 'top' : ''}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="p503-stack-key">idx {idx}</span>
                <span className="p503-stack-val">{step.nums?.[idx]}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="p503-hint">Stack is empty.</p>
        )}
        <p className="p503-hint" style={{ marginTop: '0.55rem' }}>
          Values from bottom to top are non-increasing; the top is the next index waiting for a bigger value.
        </p>
      </div>

      <div className="p503-card">
        <div className="p503-section-label">Loop State</div>
        <div className="p503-stat-grid">
          <div className="p503-stat">
            <span className="p503-stat-key">i</span>
            <span className="p503-stat-val">{step?.i ?? '—'}</span>
          </div>
          <div className="p503-stat">
            <span className="p503-stat-key">index</span>
            <span className="p503-stat-val">{step?.cursor ?? '—'}</span>
          </div>
          <div className={`p503-stat ${step?.pass === 2 ? 'highlight' : ''}`}>
            <span className="p503-stat-key">pass</span>
            <span className="p503-stat-val">{step?.pass ?? '—'}</span>
          </div>
          <div className="p503-stat">
            <span className="p503-stat-key">unresolved</span>
            <span className="p503-stat-val">{step?.stack?.length ?? 0}</span>
          </div>
        </div>
      </div>

      {step?.finalResult && (
        <div className="p503-result">
          <div className="p503-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p503-result-val mono">[{step.finalResult.join(', ')}]</div>
        </div>
      )}
    </div>
  )

  const codePanel = (
    <div className="p503-panel-code">
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
  )

  const statusPanel = (
    <div className="p503-panel-status">
      <div className={`p503-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
    <>
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
    </>
  )

  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'Visualization', dockMode: 'split-right' },
      { id: 'state', title: 'State', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    [],
  )

  return (
    <div className="p503-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.state && createPortal(statePanel, panelDivs.state)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body,
      )}
    </div>
  )
}
