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
import './Problem491Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import PatternOverlay from "../../components/PatternOverlay";
import { createPortal } from 'react-dom'

const PATTERNS = {
  'init': { icon: '◯', label: 'Initialize', color: '#06b6d4' },
  'loop': { icon: '⟳', label: 'Iterate', color: '#3b82f6' },
  'check_loop': { icon: '⟳', label: 'Loop Check', color: '#3b82f6' },
  'found': { icon: '✓', label: 'Match Found', color: '#10b981' },
  'done': { icon: '✓', label: 'Complete', color: '#10b981' },
}

const LINE_PATTERN_MAP = {


  1: 'init',


  2: 'loop',


  3: 'loop',


  4: 'loop',


  5: 'loop',


  6: 'loop',


  7: 'loop',


  8: 'loop',


  9: 'loop',


  10: 'loop',


  11: 'loop',


  12: 'done',


}

const EXAMPLES = getExamplesOr('increasing-subsequences', [
  { label: 'Example 1', nums: [4, 6, 7, 7] },
  { label: 'Example 2', nums: [4, 4, 3, 2, 1] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def findIncreasingSubsequences(nums):' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    def dfs(idx, path, last):' },
  { line: 4, text: '        if len(path) >= 2: result.append(path[:])' },
  { line: 5, text: '        used = set()' },
  { line: 6, text: '        for i in range(idx, len(nums)):' },
  { line: 7, text: '            if nums[i] in used: continue' },
  { line: 8, text: '            if nums[i] < last: continue' },
  { line: 9, text: '            used.add(nums[i])' },
  { line: 10, text: '            path.append(nums[i])' },
  { line: 11, text: '            dfs(i+1, path, nums[i])' },
  { line: 12, text: '            path.pop()' },
]

function generateSteps(nums) {
  const steps = []

  if (!nums || nums.length === 0) {
    steps.push({ activeLine: 1, message: 'Empty array → no subsequences', done: true, result: [] })
    return steps
  }

  steps.push({ activeLine: 1, message: `Initialize backtracking: nums=[${nums.join(',')}]`, nums, result: [] })

  steps.push({ activeLine: 2, message: 'Initialize result array and DFS' })

  const result = []
  let dfsCallCount = 0

  // Simulate DFS with pruning
  const visited = new Set()
  steps.push({ activeLine: 3, message: 'Used set for deduplication across same recursion level' })

  // First level: try each num as first element
  for (let i = 0; i < Math.min(nums.length, 3); i++) {
    if (visited.has(nums[i])) {
      steps.push({ activeLine: 4, message: `Skip nums[${i}]=${nums[i]} (duplicate at this level)`, skipped: true })
      continue
    }

    visited.add(nums[i])
    dfsCallCount++
    steps.push({ activeLine: 5, message: `DFS call #${dfsCallCount}: start with nums[${i}]=${nums[i]}`, path: [nums[i]] })

    // Try second elements
    for (let j = i + 1; j < Math.min(nums.length, i + 3); j++) {
      if (nums[j] > nums[i]) {
        const path = [nums[i], nums[j]]
        steps.push({ activeLine: 6, message: `Can extend: path=[${path.join(',')}]`, path })
        result.push([...path])
        steps.push({ activeLine: 7, message: `Add to result (length >= 2): [${path.join(',')}]`, result: [...result] })

        // Try extending further
        for (let k = j + 1; k < Math.min(nums.length, j + 2); k++) {
          if (nums[k] > nums[j]) {
            const extendedPath = [...path, nums[k]]
            steps.push({ activeLine: 8, message: `Extend further: [${extendedPath.join(',')}]`, path: extendedPath })
            result.push([...extendedPath])
            steps.push({ activeLine: 9, message: `Add extended to result: [${extendedPath.join(',')}]`, result: [...result] })
          }
        }
      }
    }

    steps.push({ activeLine: 10, message: `Backtrack from nums[${i}]`, path: [] })
  }

  steps.push({ activeLine: 11, message: `DFS complete: found ${result.length} subsequences`, result })

  // Remove duplicates if any
  const uniqueResult = []
  const seen = new Set()
  for (const seq of result) {
    const key = seq.join(',')
    if (!seen.has(key)) {
      seen.add(key)
      uniqueResult.push(seq)
    }
  }

  steps.push({ activeLine: 12, message: `Deduplicate: final result has ${uniqueResult.length} unique subsequences`, result: uniqueResult, done: true })
  return steps
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map(e => (
            <button
              key={e.label}
              onClick={() => applyEx(e)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontSize: 12,
                backgroundColor: '#f1f5f9',
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 6 }}>Algorithm</div>
        <div style={{ fontSize: 11, color: '#075985', lineHeight: 1.5 }}>
          Backtracking with pruning: only extend with strictly increasing numbers. Skip duplicates at each level. Collect all subsequences ≥ 2 elements.
        </div>
      </div>

      {step?.nums && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Input Array</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {step.nums.map((num, i) => (
              <motion.div
                key={i}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: 6,
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#475569',
                }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.path && step.path.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #d8b4fe' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 8 }}>Current Path (DFS)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {step.path.map((num, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: '#ede9fe',
                  border: '2px solid #d8b4fe',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#6b21a8',
                  fontSize: 12,
                }}
                animate={{ scale: 1 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step?.result && step.result.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 8 }}>Found Subsequences ({step.result.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {step.result.slice(0, 6).map((seq, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  fontFamily: 'monospace',
                  fontSize: 11,
                  color: '#047857',
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                [{seq.join(', ')}]
              </motion.div>
            ))}
            {step.result.length > 6 && (
              <div style={{ fontSize: 11, color: '#94a3b8' }}>... and {step.result.length - 6} more</div>
            )}
          </div>
        </div>
      )}

      {step?.skipped && (
        <div style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b', fontSize: 11, color: '#92400e' }}>
          ⊘ Duplicate skipped (dedup at this level)
        </div>
      )}
    </div>
  )
}

export default function Problem491Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [numsInput, setNumsInput] = useState("[4,6,7,7]");
  const { nums, inputError } = useMemo(() => {
    try {
      const parsedNums = JSON.parse(numsInput); if (!Array.isArray(parsedNums)) throw new Error('nums must be an array');
      return { nums: parsedNums, inputError: '' };
    } catch (e) {
      return { nums: "[4,6,7,7]", inputError: e.message };
    }
  }, [numsInput]);
  const SOLUTION_CODE = SOLUTION_CODE_INLINE

  const steps = useMemo(
    () => generateSteps(nums).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [nums]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); setNumsInput(JSON.stringify(e.nums)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '⬆️ Increasing Subsequences', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel step={step} applyEx={applyEx} />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"nums","label":"nums","type":"array"}]}
          values={{ nums: numsInput }}
          onChange={(k, v) => { if (k === 'nums') setNumsInput(v); handleReset() }}
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

