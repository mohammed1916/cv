import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import './Visualizer.css'

const PATTERNS = ['init', 'record', 'skip', 'choose', 'recurse', 'unchoose', 'done']

const LINE_PATTERN_MAP = {
  2: 'init',
  3: 'init',
  5: 'record',
  7: 'recurse',
  8: 'skip',
  9: 'choose',
  10: 'recurse',
  11: 'unchoose',
  13: 'done',
}

const EXAMPLES = [
  { label: 'Example 1', nums: [1, 2, 2] },
  { label: 'Example 2', nums: [0] },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def subsetsWithDup(nums):' },
  { line: 2, text: '    nums.sort()' },
  { line: 3, text: '    res = []' },
  { line: 4, text: '    def backtrack(start, path):' },
  { line: 5, text: '        res.append(path[:])' },
  { line: 6, text: '        for i in range(start, len(nums)):' },
  { line: 7, text: '            if i > start and nums[i] == nums[i-1]:' },
  { line: 8, text: '                continue  # skip duplicate' },
  { line: 9, text: '            path.append(nums[i])' },
  { line: 10, text: '            backtrack(i + 1, path)' },
  { line: 11, text: '            path.pop()' },
  { line: 12, text: '    backtrack(0, [])' },
  { line: 13, text: '    return res' },
]

function generateSteps(inputNums) {
  const steps = []
  const nums = [...inputNums].sort((a, b) => a - b)
  const res = []

  steps.push({
    phase: 'init',
    activeLine: 2,
    nums: [...nums],
    activeIndex: -1,
    path: [],
    res: [],
    message: `Sort nums -> [${nums.join(', ')}] so duplicates sit next to each other.`,
  })

  function backtrack(start, path) {
    // Record the current path as a subset.
    res.push([...path])
    steps.push({
      phase: 'record',
      activeLine: 5,
      nums: [...nums],
      activeIndex: -1,
      path: [...path],
      res: res.map((r) => [...r]),
      recorded: true,
      message: `Record subset [${path.join(', ')}]  (total: ${res.length})`,
    })

    for (let i = start; i < nums.length; i++) {
      if (i > start && nums[i] === nums[i - 1]) {
        steps.push({
          phase: 'skip',
          activeLine: 8,
          nums: [...nums],
          activeIndex: i,
          path: [...path],
          res: res.map((r) => [...r]),
          skipping: true,
          message: `Skip nums[${i}]=${nums[i]} — duplicate of nums[${i - 1}] at same level (avoids duplicate subset).`,
        })
        continue
      }

      path.push(nums[i])
      steps.push({
        phase: 'choose',
        activeLine: 9,
        nums: [...nums],
        activeIndex: i,
        path: [...path],
        res: res.map((r) => [...r]),
        chosen: true,
        message: `Choose nums[${i}]=${nums[i]}, path=[${path.join(', ')}]`,
      })

      steps.push({
        phase: 'recurse',
        activeLine: 10,
        nums: [...nums],
        activeIndex: i,
        path: [...path],
        res: res.map((r) => [...r]),
        message: `Recurse with start=${i + 1}`,
      })

      backtrack(i + 1, path)

      path.pop()
      steps.push({
        phase: 'unchoose',
        activeLine: 11,
        nums: [...nums],
        activeIndex: i,
        path: [...path],
        res: res.map((r) => [...r]),
        message: `Backtrack: un-choose ${nums[i]}, path=[${path.join(', ')}]`,
      })
    }
  }

  backtrack(0, [])

  steps.push({
    phase: 'done',
    activeLine: 13,
    nums: [...nums],
    activeIndex: -1,
    path: [],
    res: res.map((r) => [...r]),
    done: true,
    message: `Done. ${res.length} unique subsets found.`,
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) {
    return (
      <div style={{ padding: 16, color: '#64748b', fontSize: 13 }}>
        Press play to generate all unique subsets.
      </div>
    )
  }

  const { nums = [], activeIndex = -1, path = [], res = [], skipping, chosen } = step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #d97706' }}>
        <div style={{ fontSize: 12, color: '#78350f', fontStyle: 'italic' }}>
          Backtracking over sorted nums. At each level skip a value equal to its
          left neighbour (i &gt; start) to avoid duplicate subsets; record every path.
        </div>
      </div>

      {/* Sorted nums row with the current index highlighted */}
      <div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Sorted nums</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((v, i) => {
            const isActive = i === activeIndex
            const isSkip = isActive && skipping
            const isChoose = isActive && chosen
            return (
              <motion.div
                key={i}
                animate={{ scale: isActive ? 1.12 : 1 }}
                style={{
                  minWidth: 40,
                  padding: '12px 10px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontSize: 15,
                  fontWeight: 800,
                  color: isSkip ? '#7f1d1d' : '#78350f',
                  backgroundColor: isSkip ? '#fecaca' : isChoose ? '#fde68a' : isActive ? '#fef3c7' : '#fffbeb',
                  border: isSkip
                    ? '3px solid #dc2626'
                    : isChoose
                    ? '3px solid #16a34a'
                    : isActive
                    ? '3px solid #d97706'
                    : '1px solid #fcd34d',
                }}
              >
                <div>{v}</div>
                <div style={{ fontSize: 10, marginTop: 2, color: '#a16207', fontWeight: 600 }}>i={i}</div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current path */}
      <div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>Current path</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 700, color: '#78350f' }}>
          <span>[</span>
          {path.map((v, i) => (
            <motion.span
              key={`${i}-${v}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '4px 10px',
                backgroundColor: '#fde68a',
                borderRadius: 6,
                border: '1px solid #d97706',
              }}
            >
              {v}
            </motion.span>
          ))}
          <span>]</span>
        </div>
      </div>

      {/* Accumulated result subsets */}
      <div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
          Result subsets ({res.length})
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {res.map((subset, i) => {
            const isLatest = i === res.length - 1 && step.recorded
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isLatest ? '#065f46' : '#78350f',
                  backgroundColor: isLatest ? '#a7f3d0' : '#fffbeb',
                  border: isLatest ? '2px solid #16a34a' : '1px solid #fcd34d',
                }}
              >
                [{subset.join(', ')}]
              </motion.div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          padding: 12,
          backgroundColor: '#fef3c7',
          borderRadius: 6,
          border: '2px solid #d97706',
          fontSize: 13,
          color: '#78350f',
        }}
      >
        {step.message}
      </div>
    </div>
  )
}

export default function Problem90Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const steps = useMemo(
    () => generateSteps(ex.nums).map((c) => ({
      ...c,
      relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []),
    })),
    [ex]
  )
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Extract panels as constants for portal rendering
  const primaryPanel = (
    <div className="problem90-panel">
      <VisualizationPanel step={step} />
    </div>
  )

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
        highlightedLines={connectivity.highlightedLines}
        onLineSelect={connectivity.handleLineSelect}
        onActiveLineDomChange={setActiveLineDom}
        disableResizer
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
    <div className="problem90-status">
      <div style={{ display: 'flex', gap: 8, padding: '8px 12px', flexWrap: 'wrap' }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.label}
            className="problem90-button"
            onClick={() => applyEx(e)}
            style={{ fontWeight: e.label === ex.label ? 800 : 500 }}
          >
            {e.label}: [{e.nums.join(', ')}]
          </button>
        ))}
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

  // Setup Lumino panel configuration
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🎯 Subsets II', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Examples', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem90-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
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
