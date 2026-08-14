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
import './MaxConsecutiveOnesVisualizer.css'

const PATTERNS = ['init', 'scan', 'extend', 'reset', 'new_max', 'done', 'error']

const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'scan',
  6: 'extend',
  7: 'new_max',
  9: 'reset',
  11: 'done',
}

const SOLUTION_CODE = [
  { line: 1, text: 'def findMaxConsecutiveOnes(nums):' },
  { line: 2, text: '    best = current = 0' },
  { line: 3, text: '' },
  { line: 4, text: '    for n in nums:' },
  { line: 5, text: '        if n == 1:' },
  { line: 6, text: '            current += 1' },
  { line: 7, text: '            best = max(best, current)' },
  { line: 8, text: '        else:' },
  { line: 9, text: '            current = 0' },
  { line: 10, text: '' },
  { line: 11, text: '    return best' },
]

// Registry entries carry `nums` arrays; normalise everything to the comma
// string the input field edits so both shapes drive the same control.
const EXAMPLES = getExamplesOr('max-consecutive-ones', [
  { label: 'Example 1', nums: [1, 1, 0, 1, 1, 1] },
  { label: 'Example 2', nums: [1, 0, 1, 1, 0, 1] },
  { label: 'All ones', nums: [1, 1, 1, 1] },
  { label: 'All zeros', nums: [0, 0, 0] },
]).map((ex) => ({
  label: ex.label,
  text: ex.text ?? (ex.nums ?? ex.arr ?? []).join(','),
}))

function parseNums(text) {
  const parts = text.split(/[^01]+/).filter((s) => s !== '')
  if (parts.length === 0) throw new Error('Enter a binary array, e.g. 1,1,0,1,1,1')
  if (parts.length > 40) throw new Error('Keep the array to 40 elements or fewer')
  return parts.map(Number)
}

function generateSteps(text) {
  const steps = []

  try {
    const nums = parseNums(text)

    steps.push({
      phase: 'init',
      activeLine: 2,
      message: `Array of ${nums.length} bits. Track the current run of 1s and the best run seen.`,
      nums,
      current: 0,
      best: 0,
      index: -1,
      runStart: null,
      bestRun: null,
    })

    let current = 0
    let best = 0
    let runStart = 0
    let bestRun = null

    for (let i = 0; i < nums.length; i += 1) {
      steps.push({
        phase: 'scan',
        activeLine: 5,
        message: `nums[${i}] = ${nums[i]} — is it a 1?`,
        nums,
        current,
        best,
        index: i,
        runStart: current > 0 ? runStart : null,
        bestRun,
      })

      if (nums[i] === 1) {
        if (current === 0) runStart = i
        current += 1

        steps.push({
          phase: 'extend',
          activeLine: 6,
          message: `Yes — extend the current run to ${current}.`,
          nums,
          current,
          best,
          index: i,
          runStart,
          bestRun,
        })

        if (current > best) {
          best = current
          bestRun = { start: runStart, end: i }
          steps.push({
            phase: 'new_max',
            activeLine: 7,
            message: `New best run: ${best} (indices ${runStart}–${i}).`,
            nums,
            current,
            best,
            index: i,
            runStart,
            bestRun,
            isNewMax: true,
          })
        } else {
          steps.push({
            phase: 'new_max',
            activeLine: 7,
            message: `best = max(${best}, ${current}) = ${best} — unchanged.`,
            nums,
            current,
            best,
            index: i,
            runStart,
            bestRun,
          })
        }
      } else {
        current = 0
        steps.push({
          phase: 'reset',
          activeLine: 9,
          message: `Hit a 0 — the run breaks. Reset current to 0.`,
          nums,
          current,
          best,
          index: i,
          runStart: null,
          bestRun,
        })
      }
    }

    steps.push({
      phase: 'done',
      activeLine: 11,
      message: `Maximum number of consecutive 1s: ${best}`,
      nums,
      current,
      best,
      index: nums.length,
      runStart: null,
      bestRun,
      result: best,
      done: true,
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

export default function MaxConsecutiveOnesVisualizer() {
  const [text, setText] = useState(EXAMPLES[0]?.text || '1,1,0,1,1,1')
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
    <div className="p485-panel-primary">
      <div className="p485-card">
        <div className="p485-section-label">Binary Array</div>
        <input
          className={`p485-input mono ${inputError ? 'has-error' : ''}`}
          value={text}
          onChange={(e) => { setText(e.target.value); handleReset() }}
          placeholder="1,1,0,1,1,1"
        />
        <p className={`p485-hint ${inputError ? 'error' : ''}`}>
          {inputError || 'Only 0s and 1s. Find the longest unbroken run of 1s.'}
        </p>
        <div className="p485-example-row">
          {EXAMPLES.map((ex) => (
            <button
              type="button"
              key={ex.label}
              className={`p485-example-btn ${text === ex.text ? 'active' : ''}`}
              onClick={() => applyExample(ex)}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p485-card">
        <div className="p485-section-label">Scan</div>
        <div className="p485-bits">
          {(step?.nums ?? []).map((bit, idx) => {
            const isCursor = idx === step?.index
            const inRun = step?.runStart != null && idx >= step.runStart && idx <= step.index
            const inBest = step?.bestRun && idx >= step.bestRun.start && idx <= step.bestRun.end
            return (
              <motion.div
                key={idx}
                className={[
                  'p485-bit',
                  bit === 1 ? 'one' : 'zero',
                  inBest ? 'best' : '',
                  inRun ? 'run' : '',
                  isCursor ? 'cursor' : '',
                ].filter(Boolean).join(' ')}
                animate={{ scale: isCursor ? 1.18 : 1 }}
              >
                {bit}
              </motion.div>
            )
          })}
        </div>
        <div className="p485-legend">
          <span className="p485-swatch run" /> current run
          <span className="p485-swatch best" /> best run
        </div>
      </div>

      {step?.result !== undefined && (
        <div className="p485-result">
          <div className="p485-section-label" style={{ marginBottom: '0.3rem' }}>Max Consecutive Ones</div>
          <div className="p485-result-val">{step.result}</div>
        </div>
      )}
    </div>
  )

  const statePanel = (
    <div className="p485-panel-state">
      <div className="p485-card">
        <div className="p485-section-label">Algorithm State</div>
        <div className="p485-stat-grid">
          <div className="p485-stat">
            <span className="p485-stat-key">index</span>
            <span className="p485-stat-val">{step?.index != null && step.index >= 0 ? step.index : '—'}</span>
          </div>
          <div className="p485-stat">
            <span className="p485-stat-key">current</span>
            <span className="p485-stat-val">{step?.current ?? 0}</span>
          </div>
          <div className={`p485-stat ${step?.isNewMax ? 'highlight' : ''}`}>
            <span className="p485-stat-key">best</span>
            <span className="p485-stat-val">{step?.best ?? 0}</span>
          </div>
        </div>
      </div>

      {step?.bestRun && (
        <div className="p485-card">
          <div className="p485-section-label">Best Run So Far</div>
          <div className="p485-stat">
            <span className="p485-stat-key">indices</span>
            <span className="p485-stat-val">{step.bestRun.start} – {step.bestRun.end}</span>
          </div>
          <p className="p485-hint" style={{ marginTop: '0.45rem' }}>
            Length {step.bestRun.end - step.bestRun.start + 1}.
          </p>
        </div>
      )}

      <div className="p485-card">
        <div className="p485-section-label">Complexity</div>
        <p className="p485-hint">
          One pass, constant extra space: O(n) time, O(1) space.
        </p>
      </div>
    </div>
  )

  const codePanel = (
    <div className="p485-panel-code">
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
    <div className="p485-panel-status">
      <div className={`p485-status ${step?.phase === 'done' ? 'done' : step?.error ? 'error' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>
    </div>
  )

  const playbackPanel = (
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
    <div className="p485-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
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
