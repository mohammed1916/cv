import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import './Problem487Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('max-consecutive-ones-iii')

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#048196' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#1b6df5' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#1b6df5' },
  'found': { icon: '✓', label: 'Match Found', color: '#0c865d' },
  'done': { icon: '✓', label: 'Complete', color: '#0c865d' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'done',


}

const EXAMPLES = getExamplesOr('max-consecutive-ones-iii', [
  { label: 'Example 1', nums: [1, 0, 1, 1, 0], k: 1 },
  { label: 'Example 2', nums: [0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k: 3 },
])

function generateSteps(nums, k) {
  const steps = []
  let left = 0
  let maxLen = 0
  let zeros = 0

  steps.push({
    activeLine: 1,
    left: 0,
    right: 0,
    zeros,
    maxLen: 0,
    nums,
    k,
    message: 'Initialize: sliding window with k flips'
  })

  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++

    steps.push({
      activeLine: 2,
      left,
      right,
      zeros,
      maxLen,
      nums,
      k,
      message: `Expand right to index ${right}. Zeros in window: ${zeros}`
    })

    while (zeros > k) {
      steps.push({
        activeLine: 3,
        left,
        right,
        zeros,
        maxLen,
        nums,
        k,
        message: `Too many zeros (${zeros} > ${k}). Shrink from left.`
      })

      if (nums[left] === 0) zeros--
      left++
    }

    maxLen = Math.max(maxLen, right - left + 1)
    steps.push({
      activeLine: 4,
      left,
      right,
      zeros,
      maxLen,
      nums,
      k,
      message: `Valid window [${left}, ${right}] with length ${right - left + 1}. Max: ${maxLen}`
    })
  }

  steps.push({
    activeLine: 5,
    left,
    right: nums.length - 1,
    zeros,
    maxLen,
    nums,
    k,
    done: true,
    message: `Maximum consecutive ones with ${k} flips: ${maxLen}`
  })

  return steps
}

function VisualizationPanel({ nums, step, applyEx, k }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fdf2f8', borderRadius: 6, borderLeft: '4px solid #ec4899' }}>
        <div style={{ fontSize: 12, color: '#831843', fontStyle: 'italic' }}>
          Find the maximum number of consecutive 1's in a binary array if you can flip at most {k} zeros.
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Binary Array</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {nums.map((bit, idx) => {
            const inWindow = step && idx >= step.left && idx <= step.right
            return (
              <motion.div
                key={`b-${idx}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 700,
                  backgroundColor: inWindow ? '#fce7f3' : '#f1f5f9',
                  borderColor: inWindow ? '#ec4899' : '#cbd5e1',
                  color: inWindow ? '#831843' : '#334155'
                }}
                animate={{ scale: inWindow ? 1.1 : 1 }}
              >
                {bit}
              </motion.div>
            )
          })}
        </div>
      </div>

      {step && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fce7f3',
            borderRadius: 6,
            border: '2px solid #ec4899'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#831843', marginBottom: 12 }}>
            Sliding Window State
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Left</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e0177a' }}>{step.left}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Right</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e0177a' }}>{step.right}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Zeros</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e0177a' }}>{step.zeros}/{k}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#831843', marginBottom: 4 }}>Length</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#e0177a' }}>{step.right - step.left + 1}</div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f5e6ff',
          borderRadius: 6,
          border: '2px solid #a855f7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#581c87', marginBottom: 8 }}>Max Consecutive Ones</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#9e42f6' }}>
          {step?.maxLen ?? 0}
        </div>
        <div style={{ fontSize: 12, color: '#9e42f6', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem487Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[1,1,1,0,0,0,1,1,1,1,0]");
  const [kInput, setKInput] = useState(2);
  const { nums: inputNums, k: inputK, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      const parsedK = Number(kInput); if (isNaN(parsedK)) throw new Error('k must be a number');
      return { nums: parsedNums, k: parsedK, inputError: '' };
    } catch (e) {
      return { nums: "[1,1,1,0,0,0,1,1,1,1,0]", k: 2, inputError: e.message };
    }
  }, [numsInput, kInput]);
  const k = inputK || 1

  const steps = useMemo(
    () =>
      generateSteps(inputNums, k).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [inputNums, k]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); setKInput(String(e.k)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🔄 Max Consecutive Ones III', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          nums={inputNums}
          step={step}
          applyEx={applyEx}
          k={k}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, k])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"nums","label":"nums","type":"array"},{"key":"k","label":"k","type":"number"}]}
          values={{ nums: numsInput, k: kInput }}
          onChange={(k, v) => { if (k === 'nums') setNumsInput(v); if (k === 'k') setKInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
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

