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
import './Problem456Visualizer.css'

const PATTERNS = ['init', 'scan', 'found', 'pop', 'push', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'scan',
  5: 'found',
  7: 'pop',
  8: 'pop',
  9: 'push',
  10: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def find132pattern(nums) -> bool:' },
  { line: 2, text: '    stack = []          # decreasing candidates for "3"' },
  { line: 3, text: '    third = float("-inf")  # best candidate for "2"' },
  { line: 4, text: '    for num in reversed(nums):' },
  { line: 5, text: '        if num < third:' },
  { line: 6, text: '            return True     # num is the "1"' },
  { line: 7, text: '        while stack and stack[-1] < num:' },
  { line: 8, text: '            third = stack.pop()' },
  { line: 9, text: '        stack.append(num)' },
  { line: 10, text: '    return False' },
]

function parseArr(text) {
  const cleaned = (text ?? '').replace(/[[\]]/g, '').trim()
  if (!cleaned) return []
  return cleaned.split(/[\s,]+/).map((t) => {
    const v = Number(t)
    if (Number.isNaN(v)) throw new Error(`"${t}" is not a number`)
    return v
  })
}

function generateSteps(text) {
  const steps = []
  try {
    const nums = parseArr(text)
    if (nums.length === 0) throw new Error('enter at least one number')
    if (nums.length > 20) throw new Error('keep the array to 20 elements or fewer')

    const stack = [] // indices into nums; nums values are strictly decreasing bottom→top
    let third = -Infinity

    const snap = (extra) => ({
      nums,
      stack: stack.map((idx) => nums[idx]),
      stackIdx: [...stack],
      third,
      ...extra,
    })

    steps.push(snap({
      phase: 'init',
      activeLine: 3,
      message: `nums=[${nums}]. Scan right-to-left. Stack holds "3" candidates (decreasing); third is the best "2" so far.`,
    }))

    for (let i = nums.length - 1; i >= 0; i--) {
      const num = nums[i]

      steps.push(snap({
        phase: 'scan',
        activeLine: 5,
        pointer: i,
        message: `i=${i}: num=${num}. Is num < third (${third === -Infinity ? '-inf' : third})?`,
      }))

      if (num < third) {
        steps.push(snap({
          phase: 'found',
          activeLine: 6,
          pointer: i,
          found: true,
          result: true,
          message: `${num} < ${third} → 132 pattern found: nums[${i}]=${num} is the "1", ${third} is the "2", and some larger value to their right is the "3".`,
        }))
        return steps
      }

      while (stack.length && nums[stack[stack.length - 1]] < num) {
        const popped = nums[stack.pop()]
        third = popped
        steps.push(snap({
          phase: 'pop',
          activeLine: 8,
          pointer: i,
          popped,
          message: `Stack top ${popped} < ${num} → pop it; third = ${third} (a "2" smaller than the "3" ${num}).`,
        }))
      }

      stack.push(i)
      steps.push(snap({
        phase: 'push',
        activeLine: 9,
        pointer: i,
        message: `Push ${num} as a "3" candidate. Stack (top last): [${stack.map((idx) => nums[idx])}]`,
      }))
    }

    steps.push(snap({
      phase: 'done',
      activeLine: 10,
      result: false,
      message: 'Scanned the whole array without finding a 132 pattern → false.',
    }))
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, error: true, message: `Error: ${e.message}` })
  }
  return steps
}

const EXAMPLES = getExamplesOr('132-pattern', [
  { label: 'Example 1', nums: '1,2,3,4' },
  { label: 'Example 2', nums: '3,1,4,2' },
  { label: 'Example 3', nums: '-1,3,2,0' },
])

export default function Problem456Visualizer() {
  const [text, setText] = useState('3,1,4,2')
  const [panelDivs, setPanelDivs] = useState(null)

  const inputError = useMemo(() => {
    try {
      const a = parseArr(text)
      if (a.length === 0) return 'enter at least one number'
      if (a.length > 20) return 'keep the array to 20 elements or fewer'
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
    setText(ex.nums)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const barScale = useMemo(() => {
    const nums = step?.nums ?? []
    if (!nums.length) return { min: 0, span: 1 }
    const min = Math.min(...nums, 0)
    const max = Math.max(...nums, 1)
    return { min, span: Math.max(max - min, 1) }
  }, [step])

  const primaryPanel = (
    <div className="p456-panel-primary">
      <div className="p456-card">
        <div className="p456-section-label">Input</div>
        <div className="p456-input-row">
          <div className="p456-field grow">
            <label className="p456-input-label" htmlFor="p456-nums">nums</label>
            <input
              id="p456-nums"
              className={`p456-input mono ${inputError ? 'has-error' : ''}`}
              value={text}
              onChange={(e) => { setText(e.target.value); handleReset() }}
              placeholder="3,1,4,2"
            />
          </div>
        </div>
        <p className={`p456-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Look for i < j < k with nums[i] < nums[k] < nums[j] — a low, a high, then a middle.'}
        </p>
        <div className="p456-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p456-example-btn ${text === ex.nums ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {step && !step.error && (
        <div className="p456-card">
          <div className="p456-section-label">Array (scanning right → left)</div>
          <div className="p456-bars">
            {step.nums.map((v, idx) => {
              const height = 12 + ((v - barScale.min) / barScale.span) * 96
              const inStack = step.stackIdx?.includes(idx)
              return (
                <div key={idx} className="p456-bar-col">
                  <motion.div
                    className={`p456-bar ${idx === step.pointer ? 'cursor' : ''} ${inStack ? 'in-stack' : ''} ${step.found && idx === step.pointer ? 'found' : ''}`}
                    animate={{ height }}
                    initial={false}
                  />
                  <div className={`p456-bar-val ${idx === step.pointer ? 'cursor' : ''}`}>{v}</div>
                  <div className="p456-bar-idx">{idx}</div>
                </div>
              )
            })}
          </div>
          <div className="p456-legend">
            <span><i className="p456-sw cursor" /> current</span>
            <span><i className="p456-sw in-stack" /> on stack (&quot;3&quot; candidate)</span>
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <div className={`p456-result ${step.result ? 'yes' : 'no'}`}>
          <div className="p456-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p456-result-val">{String(step.result)}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p456-panel-state">
      <div className="p456-card">
        <div className="p456-section-label">Monotonic Stack (top first)</div>
        {step?.stack?.length ? (
          <div className="p456-stack">
            {[...step.stack].reverse().map((v, idx) => (
              <div key={idx} className={`p456-stack-entry ${idx === 0 ? 'top' : ''}`}>
                <span className="p456-stack-val">{v}</span>
                {idx === 0 && <span className="p456-stack-tag">top</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="p456-hint">Stack is empty.</p>
        )}
      </div>

      <div className="p456-card">
        <div className="p456-section-label">Variables</div>
        <div className="p456-stat-grid">
          <div className="p456-stat highlight">
            <span className="p456-stat-key">third (&quot;2&quot;)</span>
            <span className="p456-stat-val">{step?.third === -Infinity ? '-inf' : step?.third ?? '-inf'}</span>
          </div>
          {step?.pointer !== undefined && (
            <div className="p456-stat"><span className="p456-stat-key">i</span><span className="p456-stat-val">{step.pointer}</span></div>
          )}
          {step?.popped !== undefined && (
            <div className="p456-stat"><span className="p456-stat-key">popped</span><span className="p456-stat-val">{step.popped}</span></div>
          )}
          <div className="p456-stat"><span className="p456-stat-key">stack size</span><span className="p456-stat-val">{step?.stack?.length ?? 0}</span></div>
        </div>
        <p className="p456-hint">
          Any value below <code>third</code> completes the pattern as the &quot;1&quot;.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p456-panel-code">
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
    <div className="p456-panel-status">
      <div className={`p456-status ${step?.phase === 'found' || step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    []
  )

  return (
    <div className="p456-shell">
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
        document.body
      )}
    </div>
  )
}
