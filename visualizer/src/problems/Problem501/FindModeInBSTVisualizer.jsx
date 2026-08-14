import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './FindModeInBSTVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findMode(self, root: TreeNode) -> List[int]:' },
  { line: 3, text: '        self.count = {}' },
  { line: 4, text: '        self.max_count = 0' },
  { line: 5, text: '        ' },
  { line: 6, text: '        def inorder(node):' },
  { line: 7, text: '            if not node:' },
  { line: 8, text: '                return' },
  { line: 9, text: '            inorder(node.left)' },
  { line: 10, text: '            self.count[node.val] = self.count.get(node.val, 0) + 1' },
  { line: 11, text: '            self.max_count = max(self.max_count, self.count[node.val])' },
  { line: 12, text: '            inorder(node.right)' },
  { line: 13, text: '        ' },
  { line: 14, text: '        inorder(root)' },
  { line: 15, text: '        return [val for val, cnt in self.count.items() if cnt == self.max_count]' },
]

const PATTERNS = ['init', 'traverse', 'count', 'max_update', 'done']
const LINE_PATTERN_MAP = {
  3: 'init',
  9: 'traverse',
  10: 'count',
  11: 'max_update',
  15: 'done',
}

function generateSteps(treeArray) {
  const steps = []

  if (!Array.isArray(treeArray) || treeArray.length === 0) {
    steps.push({
      phase: 'done',
      activeLine: 15,
      relatedLines: [15],
      message: 'Empty tree.',
      result: [],
      done: true,
    })
    return steps
  }

  steps.push({
    phase: 'init',
    activeLine: 3,
    relatedLines: [3, 4],
    message: 'Initialize count map and max_count.',
    count: {},
    maxCount: 0,
  })

  const count = {}
  let maxCount = 0
  const visited = new Set()

  function inorder(idx, depth) {
    if (idx === null || idx === undefined || visited.has(idx)) return

    const val = treeArray[idx]
    if (val === null || val === undefined) return

    visited.add(idx)

    const leftIdx = 2 * idx + 1
    const rightIdx = 2 * idx + 2

    // Traverse left
    if (leftIdx < treeArray.length && treeArray[leftIdx] !== null) {
      steps.push({
        phase: 'traverse',
        activeLine: 9,
        relatedLines: [7, 8, 9],
        message: `Traverse left from ${val}`,
        count: { ...count },
        maxCount,
        currentVal: val,
        currentDepth: depth,
      })
      inorder(leftIdx, depth + 1)
    }

    // Process current node
    count[val] = (count[val] || 0) + 1

    steps.push({
      phase: 'count',
      activeLine: 10,
      relatedLines: [10],
      message: `Count ${val}: ${count[val]} occurrence(s)`,
      count: { ...count },
      maxCount,
      currentVal: val,
      currentDepth: depth,
    })

    // Update max count
    if (count[val] > maxCount) {
      maxCount = count[val]

      steps.push({
        phase: 'max_update',
        activeLine: 11,
        relatedLines: [11],
        message: `Update max_count to ${maxCount}`,
        count: { ...count },
        maxCount,
        currentVal: val,
        currentDepth: depth,
      })
    }

    // Traverse right
    if (rightIdx < treeArray.length && treeArray[rightIdx] !== null) {
      steps.push({
        phase: 'traverse',
        activeLine: 12,
        relatedLines: [12],
        message: `Traverse right from ${val}`,
        count: { ...count },
        maxCount,
        currentVal: val,
        currentDepth: depth,
      })
      inorder(rightIdx, depth + 1)
    }
  }

  inorder(0, 0)

  const result = Object.entries(count)
    .filter(([,cnt]) => cnt === maxCount)
    .map(([val]) => parseInt(val))
    .sort((a, b) => a - b)

  steps.push({
    phase: 'done',
    activeLine: 15,
    relatedLines: [15],
    message: `Mode(s) with count ${maxCount}: [${result.join(', ')}]`,
    count,
    maxCount,
    result,
    done: true,
  })

  return steps
}

function VisualizationPanel({ step, applyExample, examples }) {
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

      {step?.count && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Value Counts</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <AnimatePresence mode="popLayout">
              {Object.entries(step.count)
                .sort(([aVal], [bVal]) => parseInt(aVal) - parseInt(bVal))
                .map(([val, cnt]) => (
                  <motion.div
                    key={`${val}-${cnt}`}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '2px solid',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: cnt === step.maxCount ? '#1e293b' : '#334155',
                      borderColor: cnt === step.maxCount ? '#22c55e' : '#64748b',
                      color: cnt === step.maxCount ? '#22c55e' : '#94a3b8',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {val}: {cnt}
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step?.maxCount !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#1e293b', borderRadius: 6, border: '2px solid #a78bfa' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#a78bfa', marginBottom: 6 }}>Max Count</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#c4b5fd' }}>{step.maxCount}</div>
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
          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Mode</div>
          <div style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 'bold', color: '#22c55e' }}>
            [{step.result.join(', ')}]
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function FindModeInBSTVisualizer() {
  const examples = useMemo(() => getExamplesOr('find-mode-bst', []), [])
  const [treeInput, setTreeInput] = useState('[1,null,2,2]')

  const { tree, inputError } = useMemo(() => {
    try {
      const t = JSON.parse(treeInput)
      if (!Array.isArray(t)) throw new Error('Input must be array')
      return { tree: t, inputError: '' }
    } catch (e) {
      return { tree: [], inputError: e.message }
    }
  }, [treeInput])

  const steps = useMemo(() => generateSteps(tree), [tree])

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
      setTreeInput(JSON.stringify(ex.tree || ex))
      handleReset()
    },
    [handleReset]
  )

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: (
          <div style={{ position: 'relative' }}>
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
        ),
      },
      {
        id: 'viz',
        title: '🌳 Find Mode in BST',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 6 }}>Tree (level-order, nulls allowed)</div>
              <textarea
                value={treeInput}
                onChange={(e) => {
                  setTreeInput(e.target.value)
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
                placeholder='[1,null,2,2]'
              />
              {inputError && (
                <div style={{ color: '#f87171', fontSize: 11, marginTop: 4 }}>{inputError}</div>
              )}
            </div>
            <VisualizationPanel treeArray={tree} step={step} applyExample={applyExample} examples={examples} />
          </div>
        ),
      },
    ],
    [step, connectivity, setActiveLineDom, treeInput, tree, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom]
  )

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"array"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
        inputError={inputError}
      />

      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
