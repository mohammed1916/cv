import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './SingleElementInSortedArrayVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def singleNonDuplicate(self, nums: List[int]) -> int:' },
  { line: 3, text: '        left, right = 0, len(nums) - 1' },
  { line: 4, text: '        ' },
  { line: 5, text: '        while left < right:' },
  { line: 6, text: '            mid = (left + right) // 2' },
  { line: 7, text: '            if mid % 2 == 1:' },
  { line: 8, text: '                mid -= 1' },
  { line: 9, text: '            ' },
  { line: 10, text: '            if nums[mid] == nums[mid + 1]:' },
  { line: 11, text: '                left = mid + 2' },
  { line: 12, text: '            else:' },
  { line: 13, text: '                right = mid' },
  { line: 14, text: '        ' },
  { line: 15, text: '        return nums[left]' },
]

const PATTERNS = ['init', 'search', 'adjust', 'go_right', 'go_left', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  6: 'search',
  7: 'adjust',
  10: 'go_right',
  13: 'go_left',
  15: 'done',
}

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 15,
      relatedLines: [15],
      message: 'Empty array.',
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3],
    message: `Binary search in sorted array with pairs. Find the single element.`,
    left: 0,
    right: nums.length - 1,
  })

  let left = 0
  let right = nums.length - 1

  while (left < right) {
    let mid = Math.floor((left + right) / 2)

    steps.push({
      phase: 'search',
      activeLine: 6,
      relatedLines: [5, 6],
      message: `mid = ${mid}, nums[${mid}] = ${nums[mid]}`,
      left,
      right,
      mid,
    })

    // Ensure mid is even for pair comparison
    if (mid % 2 === 1) {
      steps.push({
        phase: 'adjust',
        activeLine: 8,
        relatedLines: [7, 8],
        message: `mid=${mid} is odd, adjust to ${mid - 1} for even pairing`,
        left,
        right,
        mid,
      })
      mid = mid - 1
    }

    // Compare pair: [mid, mid+1]
    if (nums[mid] === nums[mid + 1]) {
      // Single element is on the right
      steps.push({
        phase: 'go_right',
        activeLine: 11,
        relatedLines: [10, 11],
        message: `nums[${mid}] == nums[${mid + 1}]: pair matched, single is on RIGHT → left = ${mid + 2}`,
        left,
        right,
        mid,
        pairMatched: true,
      })
      left = mid + 2
    } else {
      // Single element is on the left
      steps.push({
        phase: 'go_left',
        activeLine: 13,
        relatedLines: [12, 13],
        message: `nums[${mid}] != nums[${mid + 1}]: pair broken, single is on LEFT → right = ${mid}`,
        left,
        right,
        mid,
        pairMatched: false,
      })
      right = mid
    }
  }

  steps.push({
    phase: 'done',
    activeLine: 15,
    relatedLines: [15],
    message: `Found single element: ${nums[left]}`,
    left,
    result: nums[left],
    done: true,
  })

  return steps
}

function VisualizationPanel({ nums, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #475569',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Array</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxHeight: 120, overflowY: 'auto' }}>
          <AnimatePresence mode="popLayout">
            {nums.map((n, idx) => {
              const isLeft = step?.left === idx
              const isRight = step?.right === idx
              const isMid = step?.mid === idx
              const inMidPair = step?.mid !== undefined && (idx === step.mid || idx === step.mid + 1)

              return (
                <motion.div
                  key={`${idx}-${n}`}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '2px solid',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    minWidth: 40,
                    textAlign: 'center',
                    backgroundColor: isLeft
                      ? '#22c55e'
                      : isRight
                        ? '#f59e0b'
                        : isMid
                          ? '#38bdf8'
                          : inMidPair
                            ? '#a78bfa'
                            : '#334155',
                    borderColor: isLeft ? '#16a34a' : isRight ? '#d97706' : isMid ? '#0ea5e9' : inMidPair ? '#8b5cf6' : '#64748b',
                    color: '#5577a4',
                  }}
                  animate={{ scale: isLeft || isRight || isMid ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {n}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Left</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#178740' }}>{step?.left ?? '-'}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Mid</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#067db1' }}>{step?.mid !== undefined ? step.mid : '-'}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Right</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#a36907' }}>{step?.right ?? '-'}</div>
        </div>
      </div>

      {step?.pairMatched !== undefined && (
        <div
          style={{
            padding: 12,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: step.pairMatched ? '2px solid #38bdf8' : '2px solid #f59e0b',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: step.pairMatched ? '#38bdf8' : '#f59e0b', marginBottom: 6 }}>
            {step.pairMatched ? 'Pair Matched' : 'Pair Broken'}
          </div>
          <div style={{ fontSize: 12, color: '#5577a4', fontFamily: 'monospace' }}>
            {step.pairMatched
              ? `nums[${step.mid}] == nums[${step.mid + 1}] → Single on RIGHT`
              : `nums[${step.mid}] != nums[${step.mid + 1}] → Single on LEFT`}
          </div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#1e293b',
            borderRadius: 6,
            border: '2px solid #22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Single Element</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#178740' }}>{step.result}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function SingleElementInSortedArrayVisualizer() {
  const examples = useMemo(() => getExamplesOr('single-element-in-sorted-array', []), [])
  const [numsInput, setNumsInput] = useState('[1,1,2,3,3,4,4,8,8]')

  const { nums, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      if (!Array.isArray(n)) throw new Error('Input must be an array')
      return { nums: n, inputError: '' }
    } catch (e) {
      return { nums: [], inputError: e.message }
    }
  }, [numsInput])

  const steps = useMemo(() => generateSteps(nums), [nums])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setNumsInput(JSON.stringify(ex.nums || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔎 Single Element Search', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>
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
          </div>),
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Input Array</div>
              <textarea
                value={numsInput}
                onChange={(e) => {
                  setNumsInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid #475569',
                  backgroundColor: '#1e293b',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
                placeholder="[1,1,2,3,3,4,4,8,8]"
              />
              {inputError && (
                <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel nums={nums} step={step} applyExample={applyExample} examples={examples} />
          </div>),
  }), [step, connectivity, setActiveLineDom, numsInput, nums, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"nums","label":"nums","type":"array"}]}
        values={{ nums: numsInput }}
        onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <>
        <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
        {panelDivs && (
          <>
            {panelDivs.code && createPortal(panelContents.code, panelDivs.code)}
            {panelDivs.viz && createPortal(panelContents.viz, panelDivs.viz)}
          </>
        )}
      </>
      <FloatingPanel title="Playback Controls">
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
  )
}
