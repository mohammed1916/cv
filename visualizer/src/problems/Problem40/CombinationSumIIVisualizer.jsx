import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './CombinationSumIIVisualizer.css'
import FloatingPanel from '../../components/shared/FloatingPanel'

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

const EXAMPLES = getExamples('combination-sum-ii') || [
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
]

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

  return (
    <div className="combination-sum-ii-shell">
      <div className="csii-top">
        <div className="csii-panel">
          <div className="csii-panel-head">
            State & Recursion Tree
            {inputError && <span style={{ color: '#f87171', marginLeft: 8 }}>{inputError}</span>}
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
              <span style={{ color: '#64748b', fontSize: 13, fontFamily: 'monospace' }}>target=</span>
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
                {(!step || step.res.length === 0) && <span style={{ color: '#475569', fontStyle: 'italic', fontSize: 13 }}>[ ]</span>}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="combination-sum-ii-middle">
        <CodeTracePanel step={step} codeLines={SOLUTION_CODE} onActiveLineDomChange={setActiveLineDom} />
      </div>

      <div className={`csii-status ${step?.phase === 'found' ? 'found' : step?.phase === 'return_bound' ? 'bound' : ''}`}>
        {step?.message ?? 'Press Play or Step to begin.'}
      </div>

      <FloatingPanel title="Playback Controls">
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

      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
