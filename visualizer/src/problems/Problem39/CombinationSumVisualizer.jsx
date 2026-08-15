import { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './CombinationSumVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodePatternAnnotations from "../../components/CodePatternAnnotations"
import PatternLegend from "../../components/PatternLegend"
import LuminoDockPanel from '../../components/LuminoDockPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:' },
  { line: 3, text: '        res = []' },
  { line: 4, text: '        def dfs(i, current_path, total):' },
  { line: 5, text: '            if total == target:' },
  { line: 6, text: '                res.append(current_path.copy())' },
  { line: 7, text: '                return' },
  { line: 8, text: '            if i >= len(candidates) or total > target:' },
  { line: 9, text: '                return' },
  { line: 10, text: '            ' },
  { line: 11, text: '            # Include candidates[i]' },
  { line: 12, text: '            current_path.append(candidates[i])' },
  { line: 13, text: '            dfs(i, current_path, total + candidates[i])' },
  { line: 14, text: '            ' },
  { line: 15, text: '            # Skip candidates[i]' },
  { line: 16, text: '            current_path.pop()' },
  { line: 17, text: '            dfs(i + 1, current_path, total)' },
  { line: 18, text: '            ' },
  { line: 19, text: '        dfs(0, [], 0)' },
  { line: 20, text: '        return res' },
]

const COMBINATIONSUM_PATTERNS = ['call_dfs', 'call_include', 'call_skip', 'check_bound', 'check_target', 'done', 'enter_dfs', 'found', 'include', 'init', 'pop', 'return_bound', 'return_target']

// Map which code line corresponds to which pattern
const LINE_PATTERN_MAP = {
  3: 'init',
  4: 'enter_dfs',
  5: 'check_target',
  6: 'found',
  7: 'return_target',
  8: 'check_bound',
  9: 'return_bound',
  12: 'include',
  13: 'call_include',
  16: 'pop',
  17: 'call_skip',
  19: 'call_dfs',
  20: 'done',
}

function generateSteps(candidates, target) {
  const steps = []
  const res = []
  const callStack = []
  let stepCounter = 0

  if (!candidates || candidates.length === 0) {
    steps.push({
      phase: 'done', i: null, path: [], total: 0, res: [],
      activeLine: 20, message: 'Empty candidates array. Return [].'
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

  // Pre-sort candidates for more logical visual progression (optional, but good practice)
  const sortedCandidates = [...candidates].sort((a, b) => a - b)

  steps.push({
    phase: 'init', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 3, message: 'Initialize empty results list res = [].'
  })

  steps.push({
    phase: 'call_dfs', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 19, message: 'Initial call: dfs(0, [], 0).'
  })

  function dfs(i, current_path, total) {
    // Artificial limit to prevent infinite loops / huge traces
    if (stepCounter++ > 1500) return

    const activePathKey = registerTrieNode(current_path, steps.length)

    const stackEntry = `dfs(${i}, [${current_path.join(', ')}], ${total})`

    steps.push({
      phase: 'enter_dfs', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 4, message: `Entering ${stackEntry}.`
    })

    steps.push({
      phase: 'check_target', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 5, message: `Check if total (${total}) == target (${target}).`
    })

    if (total === target) {
      res.push([...current_path])
      steps.push({
        phase: 'found', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 6, message: `Target reached! Append [${current_path.join(', ')}] to res.`
      })
      steps.push({
        phase: 'return_target', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 7, message: 'Return from current DFS call.'
      })
      return
    }

    steps.push({
      phase: 'check_bound', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 8, message: `Check if out of bounds (i >= ${sortedCandidates.length}) or exceeded target (${total} > ${target}).`
    })

    if (i >= sortedCandidates.length || total > target) {
      steps.push({
        phase: 'return_bound', i, path: [...current_path], total, res: [...res], activePathKey,
        activeLine: 9, message: `Condition met (i=${i}, total=${total}). Backtrack/return.`
      })
      return
    }

    // Include candidate
    current_path.push(sortedCandidates[i])
    steps.push({
      phase: 'include', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 12, message: `Include candidates[${i}] (${sortedCandidates[i]}). Path is now [${current_path.join(', ')}].`
    })

    steps.push({
      phase: 'call_include', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 13, message: `Recursive call including ${sortedCandidates[i]}: dfs(${i}, [${current_path.join(', ')}], ${total + sortedCandidates[i]}).`
    })

    dfs(i, current_path, total + sortedCandidates[i])

    // Skip candidate
    const popped = current_path.pop()
    steps.push({
      phase: 'pop', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 16, message: `Backtrack: pop ${popped} from path. Path is now [${current_path.join(', ')}].`
    })

    steps.push({
      phase: 'call_skip', i, path: [...current_path], total, res: [...res], activePathKey,
      activeLine: 17, message: `Recursive call skipping candidates[${i}]: dfs(${i + 1}, [${current_path.join(', ')}], ${total}).`
    })

    dfs(i + 1, current_path, total)
  }

  dfs(0, [], 0)

  steps.push({
    phase: 'done', i: null, path: [], total: 0, res: [...res], activePathKey: '',
    activeLine: 20, message: `Search complete. Found ${res.length} combinations.`
  })

  // To simplify rendering, we attach the sorted candidates and treeNodes to the first step
  steps[0].sortedCandidates = sortedCandidates
  steps[0].treeNodes = treeNodes

  return steps
}

const EXAMPLES = getExamples('combination-sum')

function RecursionTreeNode({ nodeKey, treeNodes, activeKey, currentStepIndex, linePrefix = "", childBasePrefix = "" }) {
  const node = treeNodes.get(nodeKey)
  if (!node || node.firstStep > currentStepIndex) return null

  const isActive = nodeKey === activeKey
  const visibleChildren = node.children.filter(k => treeNodes.get(k).firstStep <= currentStepIndex)

  return (
    <div className="cs-tree-node">
      <div className={`cs-tree-label ${isActive ? 'active' : ''}`}>
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

export default function CombinationSumVisualizer() {
  const [candidatesInput, setCandidatesInput] = useState('[2, 3, 6, 7]')
  const [targetInput, setTargetInput] = useState('7')

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const { candidates, target, inputError } = useMemo(() => {
    try {
      const c = JSON.parse(candidatesInput)
      const t = Number(targetInput)
      if (!Array.isArray(c) || c.some((x) => typeof x !== 'number' || x <= 0)) throw new Error('Candidates must be positive integers.')
      if (isNaN(t) || t <= 0) throw new Error('Target must be a positive integer.')
      return { candidates: c, target: t, inputError: '' }
    } catch (e) {
      return { candidates: [2, 3, 6, 7], target: 7, inputError: e.message || 'Invalid input' }
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

  // Step 3: Extract panels into constants
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

    <div className="cs-panel">
      <div className="cs-panel-head">
        State & Recursion Tree
        {inputError && <span style={{ color: '#ea0c0c', marginLeft: 8 }}>{inputError}</span>}
      </div>
      <div className="cs-panel-body">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => applyExample(ex)}
              className="cs-example-btn"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <input
            value={candidatesInput}
            onChange={(e) => { setCandidatesInput(e.target.value);

 handleReset() }}
            placeholder="[2, 3, 6, 7]"
            className="cs-input"
            style={{ flex: 1, margin: 0 }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 13, fontFamily: 'monospace' }}>target=</span>
          <input
            value={targetInput}
            onChange={(e) => { setTargetInput(e.target.value); handleReset() }}
            placeholder="7"
            className="cs-input"
            style={{ width: '60px', margin: 0, textAlign: 'center' }}
          />
        </div>

        <div className="cs-candidates-row">
          <span className="cs-label">Candidates (Sorted):</span>
          <div className="cs-array">
            {sortedCandidates.map((val, idx) => (
              <div key={idx} className={`cs-candidate ${step?.i === idx ? 'active' : ''}`}>
                <span className="cs-val">{val}</span>
                <span className="cs-idx">i={idx}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-state-cards">
          <div className="cs-card">
            <div className="cs-card-title">current_path</div>
            <div className="cs-card-value">
              [{step?.path?.join(', ') || ''}]
            </div>
          </div>
          <div className="cs-card">
            <div className="cs-card-title">total</div>
            <div className={`cs-card-value ${step?.total === target ? 'match' : step?.total > target ? 'exceed' : ''}`}>
              {step?.total ?? 0} <span className="cs-card-sub">/ {target}</span>
            </div>
          </div>
        </div>

        <div className="cs-stack-container">
          <div className="cs-section-title">Recursion Tree (Explored Paths)</div>
          <div className="cs-tree-container">
            {steps[0]?.treeNodes && (
              <RecursionTreeNode
                nodeKey=""
                treeNodes={steps[0].treeNodes}
                activeKey={step?.activePathKey}
                currentStepIndex={stepIndex}
              />
            )}
            {(!steps[0]?.treeNodes || stepIndex < 0) && (
              <div className="cs-empty-stack">Tree is empty</div>
            )}
          </div>
        </div>

        <div className="cs-res-container">
          <div className="cs-section-title">Results (res)</div>
          <div className="cs-res-list">
            <AnimatePresence>
              {step?.res?.map((arr, idx) => (
                <motion.div
                  key={idx}
                  className="cs-res-item"
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
    <div className={`cs-status ${step?.phase === 'found' ? 'found' : step?.phase === 'return_bound' ? 'bound' : ''}`}>
      {step?.message ?? 'Press Play or Step to begin.'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && (
        <PatternLegend currentPhase={step?.phase} usedPatterns={COMBINATIONSUM_PATTERNS} />
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

  // Step 4: Add panelConfigs and state
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

  // Step 5: Replace return with portals
  return (
    <div className="combination-sum-shell">
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
