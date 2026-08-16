import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './CombinationSumIIVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:' },
  { line: 3, text: '        candidates.sort()' },
  { line: 4, text: '        res = []' },
  { line: 5, text: '        def dfs(i, current_path, total):' },
  { line: 6, text: '            if total == target:' },
  { line: 7, text: '                res.append(current_path.copy())' },
  { line: 8, text: '                return' },
  { line: 9, text: '            if i >= len(candidates) or total > target:' },
  { line: 10, text: '                return' },
  { line: 11, text: '            ' },
  { line: 12, text: '            # Include candidates[i]' },
  { line: 13, text: '            current_path.append(candidates[i])' },
  { line: 14, text: '            dfs(i + 1, current_path, total + candidates[i])' },
  { line: 15, text: '            ' },
  { line: 16, text: '            # Skip candidates[i] and all duplicates' },
  { line: 17, text: '            current_path.pop()' },
  { line: 18, text: '            while i + 1 < len(candidates) and candidates[i] == candidates[i + 1]:' },
  { line: 19, text: '                i += 1' },
  { line: 20, text: '            dfs(i + 1, current_path, total)' },
  { line: 21, text: '            ' },
  { line: 22, text: '        dfs(0, [], 0)' },
  { line: 23, text: '        return res' },
]

const COMBINATIONSUMII_PATTERNS = ['call_dfs', 'call_include', 'call_skip', 'check_bound', 'check_target', 'done', 'enter_dfs', 'found', 'include', 'init', 'init_res', 'pop', 'return_bound', 'return_target', 'skip_dup']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'init_res',
  5: 'enter_dfs',
  6: 'check_target',
  7: 'found',
  8: 'return_target',
  9: 'check_bound',
  10: 'return_bound',
  13: 'include',
  14: 'call_include',
  17: 'pop',
  18: 'skip_dup',
  20: 'call_skip',
  22: 'call_dfs',
  23: 'done',
}

function generateSteps(candidates, target) {
  const steps = []
  const res = []
  let stepCounter = 0

  if (!candidates || candidates.length === 0) {
    steps.push({
      phase: 'done', i: null, path: [], total: 0, res: [],
      activeLine: 23, message: 'Empty candidates array. Return [].'
    })
    return steps
  }

  const treeNodes = new Map()

  function registerTrieNode(pathArray, stepIndex) {
    const key = pathArray.join(',')
    if (!treeNodes.has(key)) {
      treeNodes.set(key, { path: [...pathArray], children: [], firstStep: stepIndex })
      if (pathArray.length > 0) {
        const parentKey = pathArray.slice(0, -1).join(',')
        const parentNode = treeNodes.get(parentKey)
        if (parentNode && !parentNode.children.includes(key)) {
          parentNode.children.push(key)
        }
      }
    }
    return key
  }

  const sortedCandidates = [...candidates].sort((a, b) => a - b)

  steps.push({
    phase: 'init', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 3, message: 'Sort candidates array.'
  })

  steps.push({
    phase: 'init_res', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 4, message: 'Initialize empty results list res = [].'
  })

  steps.push({
    phase: 'call_dfs', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 22, message: 'Initial call: dfs(0, [], 0).'
  })

  function dfs(i, current_path, total) {
    if (stepCounter++ > 1500) return

    const activePathKey = registerTrieNode(current_path, steps.length)

    const stackEntry = `dfs(${i}, [${current_path.join(', ')}], ${total})`

    steps.push({
      phase: 'enter_dfs', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 5, message: `Entering ${stackEntry}.`
    })

    steps.push({
      phase: 'check_target', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 6, message: `Check if total (${total}) == target (${target}).`
    })

    if (total === target) {
      res.push([...current_path])
      steps.push({
        phase: 'found', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 7, message: `Target reached! Append [${current_path.join(', ')}] to res.`
      })
      steps.push({
        phase: 'return_target', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 8, message: 'Return from current DFS call.'
      })
      return
    }

    steps.push({
      phase: 'check_bound', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 9, message: `Check if out of bounds (i >= ${sortedCandidates.length}) or exceeded target (${total} > ${target}).`
    })

    if (i >= sortedCandidates.length || total > target) {
      steps.push({
        phase: 'return_bound', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 10, message: `Condition met (i=${i}, total=${total}). Backtrack/return.`
      })
      return
    }

    current_path.push(sortedCandidates[i])
    steps.push({
      phase: 'include', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 13, message: `Include candidates[${i}] (${sortedCandidates[i]}). Path is now [${current_path.join(', ')}].`
    })

    steps.push({
      phase: 'call_include', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 14, message: `Recursive call including ${sortedCandidates[i]}: dfs(${i + 1}, [${current_path.join(', ')}], ${total + sortedCandidates[i]}).`
    })

    dfs(i + 1, current_path, total + sortedCandidates[i])

    const popped = current_path.pop()
    steps.push({
      phase: 'pop', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 17, message: `Backtrack: pop ${popped} from path. Path is now [${current_path.join(', ')}].`
    })

    let skipIdx = i
    while (skipIdx + 1 < sortedCandidates.length && sortedCandidates[skipIdx] === sortedCandidates[skipIdx + 1]) {
      skipIdx++
      steps.push({
        phase: 'skip_dup', i: skipIdx, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 18, message: `Skip duplicate candidates[${skipIdx}] (${sortedCandidates[skipIdx]}).`
      })
    }

    steps.push({
      phase: 'call_skip', i: skipIdx + 1, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 20, message: `Recursive call skipping candidates[${i}] and duplicates: dfs(${skipIdx + 1}, [${current_path.join(', ')}], ${total}).`
    })

    dfs(skipIdx + 1, current_path, total)
  }

  dfs(0, [], 0)

  steps.push({
    phase: 'done', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 23, message: `Search complete. Found ${res.length} combinations.`
  })

  steps[0].sortedCandidates = sortedCandidates
  steps[0].treeNodes = treeNodes

  return steps
}

const EXAMPLES = getExamplesOr('combination-sum-ii', [
  {
    label: 'Classic',
    candidates: [10, 1, 2, 7, 6, 1, 5],
    target: 8
  },
  {
    label: 'Duplicates',
    candidates: [2, 5, 2, 1, 2],
    target: 5
  },
  {
    label: 'No Answer',
    candidates: [1],
    target: 2
  },
  {
    label: 'Multiple dups',
    candidates: [1, 1, 2, 5, 6, 7, 10],
    target: 8
  }
])

function RecursionTreeNode({ nodeKey, treeNodes, activeKey, currentStepIndex, linePrefix = "", childBasePrefix = "" }) {
  const node = treeNodes.get(nodeKey)
  if (!node || node.firstStep > currentStepIndex) return null

  const isActive = nodeKey === activeKey
  const visibleChildren = node.children.filter(k => treeNodes.get(k).firstStep <= currentStepIndex)

  return (
    <div className="csii-tree-node">
      <div className={`csii-tree-label ${isActive ? 'active' : ''}`}>
        {linePrefix}{nodeKey === "" ? "root" : `[${node.path.join(', ')}]`}
      </div>
      {visibleChildren.map((childKey, idx) => {
        const isLast = idx === visibleChildren.length - 1
        const childLinePrefix = childBasePrefix + (isLast ? "└── " : "├── ")
        const childChildBasePrefix = childBasePrefix + (isLast ? "    " : "│   ")
        return (
          <RecursionTreeNode
            key={childKey}
            nodeKey={childKey}
            treeNodes={treeNodes}
            activeKey={activeKey}
            currentStepIndex={currentStepIndex}
            linePrefix={childLinePrefix}
            childBasePrefix={childChildBasePrefix}
          />
        )
      })}
    </div>
  )
}

export default function CombinationSumIIVisualizer() {
  const [candidatesInput, setCandidatesInput] = useState('[10, 1, 2, 7, 6, 1, 5]')
  const [targetInput, setTargetInput] = useState('8')

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { candidates, target, inputError } = useMemo(() => {
    try {
      const c = JSON.parse(candidatesInput)
      const t = Number(targetInput)
      if (!Array.isArray(c) || c.some((x) => typeof x !== 'number' || x <= 0)) throw new Error('Candidates must be positive integers.')
      if (isNaN(t) || t <= 0) throw new Error('Target must be a positive integer.')
      return { candidates: c, target: t, inputError: '' }
    } catch (e) {
      return { candidates: [10, 1, 2, 7, 6, 1, 5], target: 8, inputError: e.message || 'Invalid input' }
    }
  }, [candidatesInput, targetInput])

  const steps = useMemo(() => generateSteps(candidates, target), [candidates, target])

  const {
    stepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const sortedCandidates = steps[0]?.sortedCandidates || [...candidates].sort((a, b) => a - b)

  const applyExample = useCallback((ex) => {
    setCandidatesInput(JSON.stringify(ex.candidates))
    setTargetInput(String(ex.target))
    handleReset()
  }, [handleReset])

  // Extract panels for Lumino DockPanel
  const primaryPanel = (
    <>

      <ManualInputPanel
        fields={[{"key":"candidates","label":"candidates","type":"array"},{"key":"target","label":"target","type":"number"}]}
        values={{ candidates: candidatesInput, target: targetInput }}
        onChange={(k, v) => { if (k === 'candidates') setCandidatesInput(v); if (k === 'target') setTargetInput(v); handleReset() }}
        examples={EXAMPLES}
        applyExample={applyExample}
        inputError={inputError}
      />

    <div className="csii-panel">
      <div className="csii-panel-head">
        State & Recursion Tree
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="csii-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="csii-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <input
            value={candidatesInput}
            onChange={(e) => { setCandidatesInput(e.target.value); handleReset() }}
            placeholder="[10, 1, 2, 7, 6, 1, 5]"
            className="csii-input"
            style={{ flex: 1, margin: 0 }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>target=</span>
          <input
            value={targetInput}
            onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
            placeholder="8"
            className="csii-input"
            style={{ width: '60px', margin: 0, textAlign: 'center' }}
          />
        </div>

        <div className="csii-candidates-row">
          <span className="csii-label">Candidates (Sorted):</span>
          <div className="csii-array">
            {sortedCandidates.map((val, idx) => (
              <div key={idx} className={`csii-candidate ${step?.i === idx ? 'active' : ''}`}>
                <span className="csii-val">{val}</span>
                <span className="csii-idx">i={idx}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="csii-state-cards">
          <div className="csii-card">
            <div className="csii-card-title">current_path</div>
            <div className="csii-card-value">
              [{step?.path?.join(', ') || ''}]
            </div>
          </div>
          <div className="csii-card">
            <div className="csii-card-title">total</div>
            <div className={`csii-card-value ${step?.total === target ? 'match' : step?.total > target ? 'exceed' : ''}`}>
              {step?.total ?? 0} <span className="csii-card-sub">/ {target}</span>
            </div>
          </div>
        </div>

        <div className="csii-stack-container">
          <div className="csii-section-title">Recursion Tree (Explored Paths)</div>
          <div className="csii-tree-container">
            {steps[0]?.treeNodes && (
              <RecursionTreeNode
                nodeKey=""
                treeNodes={steps[0].treeNodes}
                activeKey={step?.activePathKey}
                currentStepIndex={stepIndex}
              />
            )}
            {(!steps[0]?.treeNodes || stepIndex < 0) && (
              <div className="csii-empty-stack">Tree is empty</div>
            )}
          </div>
        </div>

        <div className="csii-res-container">
          <div className="csii-section-title">Results (res)</div>
          <div className="csii-res-list">
            <AnimatePresence>
              {step?.res?.map((arr, idx) => (
                <motion.div
                  key={idx}
                  className="csii-res-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  [{arr.join(', ')}]
                </motion.div>
              ))}
            </AnimatePresence>
            {(!step || step.res.length === 0) && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>[ ]</span>}
          </div>
        </div>

      </div>
    </div>
  
    </>)

  const codePanel = (
    <div style={{ position: 'relative', height: '100%' }}>
      <CodeTracePanel
        step={step}
        codeLines={SOLUTION_CODE}
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
    <div className={`csii-status ${step?.phase === 'found' ? 'found' : step?.phase === 'return_bound' ? 'bound' : ''}`}>
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={COMBINATIONSUMII_PATTERNS} />
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

  // Lumino DockPanel state and config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: 'State & Recursion Tree', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="csii-shell">
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
