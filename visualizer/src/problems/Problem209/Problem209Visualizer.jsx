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
import './Problem209Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const PATTERNS = ['init', 'expand', 'shrink', 'record', 'done', 'error']
const LINE_PATTERN_MAP = {
  2: 'init',
  4: 'expand',
  6: 'record',
  8: 'shrink',
  10: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def minSubArrayLen(target, nums):' },
  { line: 2, text: '    left = 0; total = 0; best = float("inf")' },
  { line: 3, text: '    for right in range(len(nums)):' },
  { line: 4, text: '        total += nums[right]' },
  { line: 5, text: '        while total >= target:' },
  { line: 6, text: '            best = min(best, right - left + 1)' },
  { line: 7, text: '            total -= nums[left]' },
  { line: 8, text: '            left += 1' },
  { line: 9, text: '    ' },
  { line: 10, text: '    return 0 if best == float("inf") else best' },
]

function parseNums(text) {
  const cleaned = String(text).replace(/[[\]]/g, ' ')
  const parts = cleaned.split(/[\s,]+/).filter((t) => t.length > 0)
  if (parts.length === 0) throw new Error('Provide at least one number')
  return parts.map((p) => {
    const v = Number(p)
    if (!Number.isFinite(v)) throw new Error(`"${p}" is not a number`)
    return v
  })
}

function generateSteps(targetText, numsText) {
  const steps = []
  try {
    const target = Number(targetText)
    if (!Number.isFinite(target) || target <= 0) {
      throw new Error('target must be a positive number')
    }
    const nums = parseNums(numsText)
    if (nums.length > 40) throw new Error('Use at most 40 numbers')

    let left = 0
    let total = 0
    let best = Infinity
    let bestWindow = null

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Sliding window over ${nums.length} numbers, target = ${target}. left=0, total=0, best=∞`,
      nums, target, left, right: -1, total, best, bestWindow,
    })

    for (let right = 0; right < nums.length; right++) {
      total += nums[right]
      steps.push({
        phase: 'expand',
        activeLine: 4,
        message: `Expand right to ${right}: total += ${nums[right]} → ${total}`,
        nums, target, left, right, total, best, bestWindow,
      })

      while (total >= target) {
        const len = right - left + 1
        if (len < best) {
          best = len
          bestWindow = { left, right }
          steps.push({
            phase: 'record',
            activeLine: 6,
            message: `total ${total} >= ${target}. New best length = ${len} (window [${left}..${right}])`,
            nums, target, left, right, total, best, bestWindow, justRecorded: true,
          })
        } else {
          steps.push({
            phase: 'record',
            activeLine: 6,
            message: `total ${total} >= ${target}, but length ${len} is not better than ${best}`,
            nums, target, left, right, total, best, bestWindow,
          })
        }

        total -= nums[left]
        left += 1
        steps.push({
          phase: 'shrink',
          activeLine: 8,
          message: `Shrink from the left: remove ${nums[left - 1]} → total ${total}, left = ${left}`,
          nums, target, left, right, total, best, bestWindow,
        })
      }
    }

    const result = best === Infinity ? 0 : best
    steps.push({
      phase: 'done',
      activeLine: 10,
      message: result === 0
        ? `No subarray sums to at least ${target} — answer is 0`
        : `Minimum subarray length with sum >= ${target} is ${result}`,
      nums, target, left, right: nums.length - 1, total, best, bestWindow, result,
    })
  } catch (e) {
    steps.push({ phase: 'error', activeLine: 1, message: `Error: ${e.message}`, error: true })
  }
  return steps
}

const EXAMPLES = getExamplesOr('minimum-size-subarray-sum', [
  { label: 'Example 1', target: '7', nums: '2,3,1,2,4,3' },
  { label: 'Example 2', target: '4', nums: '1,4,4' },
  { label: 'Example 3', target: '11', nums: '1,1,1,1,1,1,1,1' },
])

export default function Problem209Visualizer() {
  const [targetInput, setTargetInput] = useState('7')
  const [numsInput, setNumsInput] = useState('2,3,1,2,4,3')
  const [panelDivs, setPanelDivs] = useState(null)

  const steps = useMemo(
    () => generateSteps(targetInput, numsInput).map((current) => ({
      ...current,
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [targetInput, numsInput],
  )

  const inputError = steps.length === 1 && steps[0].error ? steps[0].message : ''

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyExample = useCallback((ex) => {
    setTargetInput(ex.target)
    setNumsInput(ex.nums)
    handleReset()
  }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  const nums = step?.nums ?? []

  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"target","label":"target","type":"string"},{"key":"nums","label":"nums","type":"string"}]}
        values={{ target: targetInput, nums: numsInput }}
        onChange={(k, v) => { if (k === 'target') setTargetInput(v); if (k === 'nums') setNumsInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <div className="p209-panel-primary">
      <div className="p209-card">
        <div className="p209-section-label">Input</div>
        <div className="p209-input-row">
          <div className="p209-field">
            <label className="p209-input-label" htmlFor="p209-target">Target</label>
            <input
              id="p209-target"
              className={`p209-input mono short ${inputError ? 'has-error' : ''}`}
              value={targetInput}
              onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
              placeholder="7"
            />
          </div>
          <div className="p209-field grow">
            <label className="p209-input-label" htmlFor="p209-nums">Numbers</label>
            <input
              id="p209-nums"
              className={`p209-input mono ${inputError ? 'has-error' : ''}`}
              value={numsInput}
              onChange={(e) => { setNumsInput(e.target.value); handleReset() }}
              placeholder="2,3,1,2,4,3"
            />
          </div>
        </div>
        <p className={`p209-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Find the shortest contiguous subarray whose sum is at least target.'}
        </p>
        <div className="p209-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p209-example-btn ${targetInput === ex.target && numsInput === ex.nums ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label} (t={ex.target})
            </button>
          ))}
        </div>
      </div>

      <div className="p209-card">
        <div className="p209-section-label">Sliding Window</div>
        <div className="p209-array">
          {nums.map((v, idx) => {
            const inWindow = step && step.right >= 0 && idx >= step.left && idx <= step.right
            const isBest = step?.bestWindow && idx >= step.bestWindow.left && idx <= step.bestWindow.right
            const cls = [
              'p209-cell',
              inWindow ? 'in-window' : '',
              isBest && !inWindow ? 'best' : '',
              idx === step?.left ? 'ptr-left' : '',
              idx === step?.right ? 'ptr-right' : '',
            ].filter(Boolean).join(' ')
            return (
              <motion.div
                key={idx}
                className={cls}
                initial={{ scale: 0.85 }}
                animate={{ scale: inWindow ? 1.06 : 1 }}
              >
                <span className="p209-cell-val">{v}</span>
                <span className="p209-cell-idx">{idx}</span>
              </motion.div>
            )
          })}
        </div>
        <div className="p209-pointer-key">
          <span className="p209-key in-window">window</span>
          <span className="p209-key best">best so far</span>
        </div>
      </div>

      <div className="p209-card">
        <div className="p209-section-label">Window Sum vs Target</div>
        <div className="p209-bar-track">
          <motion.div
            className={`p209-bar-fill ${step && step.total >= step.target ? 'reached' : ''}`}
            animate={{ width: `${Math.min(100, step && step.target ? (step.total / step.target) * 100 : 0)}%` }}
            transition={{ duration: 0.25 }}
          />
        </div>
        <p className="p209-hint">
          total = {step?.total ?? 0} / target = {step?.target ?? '—'}
        </p>
      </div>

      {step?.result !== undefined && (
        <div className="p209-result">
          <div className="p209-section-label" style={{ marginBottom: '0.3rem' }}>Result</div>
          <div className="p209-result-val">{step.result}</div>
        </div>
      )}
    </div>
  
    </>)

  const statePanel = (
    <div className="p209-panel-state">
      <div className="p209-card">
        <div className="p209-section-label">Algorithm State</div>
        <div className="p209-stat-grid">
          <div className="p209-stat"><span className="p209-stat-key">left</span><span className="p209-stat-val">{step?.left ?? '—'}</span></div>
          <div className="p209-stat"><span className="p209-stat-key">right</span><span className="p209-stat-val">{step && step.right >= 0 ? step.right : '—'}</span></div>
          <div className="p209-stat highlight"><span className="p209-stat-key">total</span><span className="p209-stat-val">{step?.total ?? '—'}</span></div>
          <div className="p209-stat highlight"><span className="p209-stat-key">best</span><span className="p209-stat-val">{step ? (step.best === Infinity ? '∞' : step.best) : '—'}</span></div>
          <div className="p209-stat"><span className="p209-stat-key">target</span><span className="p209-stat-val">{step?.target ?? '—'}</span></div>
          <div className="p209-stat">
            <span className="p209-stat-key">size</span>
            <span className="p209-stat-val">{step && step.right >= 0 ? Math.max(0, step.right - step.left + 1) : '—'}</span>
          </div>
        </div>
      </div>

      <div className="p209-card">
        <div className="p209-section-label">Best Window</div>
        {step?.bestWindow ? (
          <div className="p209-stat">
            <span className="p209-stat-key">indices</span>
            <span className="p209-stat-val">[{step.bestWindow.left} … {step.bestWindow.right}]</span>
          </div>
        ) : (
          <p className="p209-hint">No qualifying window found yet.</p>
        )}
      </div>

      <div className="p209-card">
        <div className="p209-section-label">Complexity</div>
        <p className="p209-hint">
          Each index enters and leaves the window at most once → O(n) time, O(1) extra space.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p209-panel-code">
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
    <div className="p209-panel-status">
      <div className={`p209-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
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
    <div className="p209-shell">
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
