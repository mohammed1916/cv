import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
import './PermutationsIIVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def permuteUnique(self, nums: List[int]) -> List[List[int]]:' },
  { line: 3, text: '        nums.sort()' },
  { line: 4, text: '        result = []' },
  { line: 5, text: '        used = [False] * len(nums)' },
  { line: 6, text: '        ' },
  { line: 7, text: '        def backtrack(current):' },
  { line: 8, text: '            if len(current) == len(nums):' },
  { line: 9, text: '                result.append(current[:])' },
  { line: 10, text: '                return' },
  { line: 11, text: '            ' },
  { line: 12, text: '            for i in range(len(nums)):' },
  { line: 13, text: '                if used[i] or (i > 0 and nums[i]==nums[i-1] and not used[i-1]):' },
  { line: 14, text: '                    continue' },
  { line: 15, text: '                current.append(nums[i])' },
  { line: 16, text: '                used[i] = True' },
  { line: 17, text: '                backtrack(current)' },
  { line: 18, text: '                current.pop()' },
  { line: 19, text: '                used[i] = False' },
  { line: 20, text: '        backtrack([])' },
  { line: 21, text: '        return result' },
]

const PATTERNS = ['init', 'backtrack', 'skip', 'add', 'result', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  7: 'backtrack',
  13: 'skip',
  15: 'add',
  9: 'result',
  21: 'done',
}

function generateSteps(numsInput) {
  const steps = []

  if (!Array.isArray(numsInput) || numsInput.length === 0 || numsInput.length > 8) {
    steps.push({
      phase: 'done',
      activeLine: 21,
      relatedLines: [21],
      message: 'Invalid input (must be 1-8 elements).',
      done: true,
    })
    return steps
  }

  const nums = [...numsInput].sort((a, b) => a - b)

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4, 5],
    message: `Sorted: [${nums.join(', ')}]`,
    nums,
    result: [],
    currentPath: [],
    used: Array(nums.length).fill(false),
  })

  const result = []
  const used = Array(nums.length).fill(false)

  function generateBacktrackSteps(current, depth) {
    if (current.length === nums.length) {
      result.push([...current])
      steps.push({
        phase: 'result',
        activeLine: 9,
        relatedLines: [8, 9],
        message: `Found permutation: [${current.join(', ')}]`,
        nums,
        result: result.map(r => [...r]),
        currentPath: current,
        used: [...used],
        depth,
      })
      return
    }

    steps.push({
      phase: 'backtrack',
      activeLine: 12,
      relatedLines: [12],
      message: `Backtrack: trying to add element at position ${current.length}`,
      nums,
      result: result.map(r => [...r]),
      currentPath: current,
      used: [...used],
      depth,
    })

    for (let i = 0; i < nums.length; i++) {
      if (used[i]) {
        steps.push({
          phase: 'skip',
          activeLine: 13,
          relatedLines: [13],
          message: `Skip nums[${i}]=${nums[i]} (already used)`,
          nums,
          result: result.map(r => [...r]),
          currentPath: current,
          used: [...used],
          depth,
          skippedIdx: i,
        })
        continue
      }

      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) {
        steps.push({
          phase: 'skip',
          activeLine: 13,
          relatedLines: [13],
          message: `Skip nums[${i}]=${nums[i]} (duplicate of unused nums[${i - 1}])`,
          nums,
          result: result.map(r => [...r]),
          currentPath: current,
          used: [...used],
          depth,
          skippedIdx: i,
        })
        continue
      }

      current.push(nums[i])
      used[i] = true

      steps.push({
        phase: 'add',
        activeLine: 15,
        relatedLines: [15, 16],
        message: `Add nums[${i}]=${nums[i]} → current=[${current.join(', ')}]`,
        nums,
        result: result.map(r => [...r]),
        currentPath: [...current],
        used: [...used],
        depth,
        addedIdx: i,
      })

      generateBacktrackSteps(current, depth + 1)

      current.pop()
      used[i] = false
    }
  }

  generateBacktrackSteps([], 0)

  steps.push({
    phase: 'done',
    activeLine: 21,
    relatedLines: [21],
    message: `Generated ${result.length} unique permutations`,
    result: result.map(r => [...r]),
    done: true,
  })

  return steps
}

function VisualizationPanel({ nums, step, applyExample, examples }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Examples</div>
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

      <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '1px solid #475569' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Input</div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
          [{nums.join(', ')}]
        </div>
      </div>

      {step?.currentPath !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Current Path</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>
            [{step.currentPath.join(', ')}] ({step.currentPath.length}/{nums.length})
          </div>
        </div>
      )}

      {step?.result && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
            Permutations Found ({step.result.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 150, overflowY: 'auto' }}>
            <AnimatePresence mode="popLayout">
              {step.result.slice(-5).map((perm, idx) => (
                <motion.div
                  key={`perm-${step.result.length}-${idx}`}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 4,
                    border: '1px solid #475569',
                    backgroundColor: '#334155',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    color: '#22c55e',
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                >
                  [{perm.join(', ')}]
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.result && (
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Total Permutations</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22c55e' }}>{step.result.length}</div>
        </motion.div>
      )}
    </div>
  )
}

export default function PermutationsIIVisualizer() {
  const examples = useMemo(() => getExamplesOr('permutations-ii', []), [])
  const [numsInput, setNumsInput] = useState('[1,1,2]')

  const { nums, inputError } = useMemo(() => {
    try {
      const n = JSON.parse(numsInput)
      if (!Array.isArray(n)) throw new Error('Input must be array')
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

  // Step 2: Extract panels into consts
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

  const vizPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 12, overflow: 'auto' }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Input Array</div>
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
          placeholder="[1,1,2]"
        />
        {inputError && (
          <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
        )}
      </div>
      <VisualizationPanel nums={nums} step={step} applyExample={applyExample} examples={examples} />
    </div>
  )

  const statusPanel = (
    <div style={{ fontSize: 13, color: '#64748b', padding: '8px 12px' }}>
      Step {stepIndex + 1} / {steps.length}
    </div>
  )

  // Step 3: Add panelConfigs with Lumino layout
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'code', title: 'Code', dockMode: 'split-right' },
      { id: 'viz', title: '🔀 Permutations II', dockMode: 'split-right' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="permutii-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
          {panelDivs.viz && createPortal(vizPanel, panelDivs.viz)}
          {panelDivs.status && createPortal(statusPanel, panelDivs.status)}
        </>
      )}
      {createPortal(
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
        </FloatingPanel>,
        document.body
      )}
    </div>
  )
}
