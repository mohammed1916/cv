import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { getExamplesOr } from '../../config/examplesRegistry'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";

import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'
const PATTERNS = ['checking', 'delete_node', 'done', 'found_node', 'go_left', 'go_right', 'not_found', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  3: 'checking',
  4: 'go_left',
  6: 'go_right',
  7: 'found_node',
  15: 'delete_node',
  17: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def deleteNode(root: TreeNode, key: int) -> TreeNode:' },
  { line: 2, text: '    if not root: return None' },
  { line: 3, text: '    if key < root.val:' },
  { line: 4, text: '        root.left = deleteNode(root.left, key)' },
  { line: 5, text: '    elif key > root.val:' },
  { line: 6, text: '        root.right = deleteNode(root.right, key)' },
  { line: 7, text: '    else:' },
  { line: 8, text: '        if not root.left:' },
  { line: 9, text: '            return root.right' },
  { line: 10, text: '        if not root.right:' },
  { line: 11, text: '            return root.left' },
  { line: 12, text: '        min_right = root.right' },
  { line: 13, text: '        while min_right.left:' },
  { line: 14, text: '            min_right = min_right.left' },
  { line: 15, text: '        root.val = min_right.val' },
  { line: 16, text: '        root.right = deleteNode(root.right, min_right.val)' },
  { line: 17, text: '    return root' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('delete-node-in-a-bst', [
  { label: 'Example 1', tree: [5, 3, 6, 2, 4, null, 7], key: 3, expected: [5, 4, 6, 2, null, null, 7] },
  { label: 'Example 2', tree: [5, 3, 6], key: 0, expected: [5, 3, 6] },
  { label: 'Example 3', tree: [5], key: 5, expected: [] },
])

const SNIPPETS = [
  { id: 'base', label: 'Base Cases', lines: [2] },
  { id: 'search', label: 'Search', lines: [3, 4, 5, 6] },
  { id: 'delete', label: 'Delete Cases', lines: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 'return', label: 'Return', lines: [17] },
]

function generateSteps(treeValues, key) {
  const steps = []

  if (!Array.isArray(treeValues) || treeValues.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      treeValues: [],
      key,
      stepNum: 0,
      message: 'Empty tree.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    treeValues: [...treeValues],
    key,
    stepNum: 0,
    message: `Starting deletion of key=${key} from tree`,
  })

  let removed = false
  let stepNum = 1

  const removeRecursive = (values, k, depth = 0) => {
    if (!values || values.length === 0) {
      steps.push({
        phase: 'not_found',
        activeLine: 2,
        treeValues: [...values],
        key,
        depth,
        stepNum,
        message: `Empty tree - key not found`,
      })
      stepNum++
      return values
    }

    const root = values[0]

    if (root === null || root === undefined) {
      return values
    }

    steps.push({
      phase: 'checking',
      activeLine: 3,
      treeValues: [...values],
      key,
      depth,
      currentVal: root,
      stepNum,
      message: `At node ${root}, comparing with key=${k}`,
    })
    stepNum++

    if (k < root) {
      steps.push({
        phase: 'go_left',
        activeLine: 4,
        treeValues: [...values],
        key,
        depth,
        stepNum,
        message: `Key < root, going left`,
      })
      stepNum++
      return values
    } else if (k > root) {
      steps.push({
        phase: 'go_right',
        activeLine: 6,
        treeValues: [...values],
        key,
        depth,
        stepNum,
        message: `Key > root, going right`,
      })
      stepNum++
      return values
    } else {
      steps.push({
        phase: 'found_node',
        activeLine: 7,
        treeValues: [...values],
        key,
        depth,
        currentVal: root,
        stepNum,
        message: `Found node ${root}! Processing deletion`,
      })
      stepNum++

      removed = true
      steps.push({
        phase: 'delete_node',
        activeLine: 15,
        treeValues: values.filter((_, i) => i !== 0),
        key,
        depth,
        stepNum,
        message: `Node removed from tree`,
      })
      stepNum++

      return values.filter((_, i) => i !== 0)
    }
  }

  removeRecursive(treeValues, key, 0)

  steps.push({
    phase: 'done',
    activeLine: 17,
    treeValues: removed ? treeValues.filter((_, i) => i !== 0) : [...treeValues],
    key,
    stepNum,
    message: removed ? `Deletion complete` : `Key not found - tree unchanged`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start') return 'base'
  if (phase === 'checking' || phase === 'go_left' || phase === 'go_right') return 'search'
  if (phase === 'found_node' || phase === 'delete_node') return 'delete'
  if (phase === 'done') return 'return'
  return 'base'
}

function TreeDisplay({ treeValues, currentVal, key }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Tree Structure ({treeValues.filter(v => v !== null && v !== undefined).length} nodes)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {treeValues.map((val, i) => {
          const isTarget = val === key
          const isHighlight = val === currentVal
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: isHighlight ? 1.15 : 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isTarget ? '#fecaca' : isHighlight ? '#fef08a' : '#dbeafe',
                border: `2px solid ${isTarget ? '#dc2626' : isHighlight ? '#eab308' : '#3b82f6'}`,
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: isTarget ? '#7f1d1d' : isHighlight ? '#713f12' : '#1e40af',
              }}
            >
              {val === null || val === undefined ? '∅' : val}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function SearchStatus({ step }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Search Status
      </header>
      <div style={{
        padding: 12,
        backgroundColor: 'var(--surface)',
        borderRadius: 4,
        border: '1px solid var(--border)',
        fontSize: 12,
        color: 'var(--text-muted)',
        minHeight: 60,
      }}>
        {step?.message || 'Waiting...'}
      </div>
      <div style={{
        padding: 8,
        backgroundColor: '#e0e7ff',
        borderRadius: 4,
        border: '1px solid #818cf8',
        fontSize: 11,
        color: '#3730a3',
        textAlign: 'center',
        fontWeight: 600,
      }}>
        Searching for key: {step?.key ?? '?'}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, treeValues, EXAMPLES, handleExampleClick, treeInput, keyInput, setTreeInput, setKeyInput, handleReset }) {
  return (
    <section style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--surface2)', marginBottom: 8 }}>
          Examples
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => handleExampleClick(ex)}
              style={{
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface2)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Tree (comma-separated)
          </label>
          <input
            value={treeInput}
            onChange={(e) => { setTreeInput(e.target.value); handleReset() }}
            placeholder="e.g., 5,3,6,2,4,null,7"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
            Key to Delete
          </label>
          <input
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); handleReset() }}
            placeholder="e.g., 3"
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        style={{
          padding: '8px 10px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reset
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <TreeDisplay
          treeValues={step?.treeValues || []}
          currentVal={step?.currentVal}
          key={step?.key}
        />
        <SearchStatus step={step} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          BST Deletion
        </div>
        <div style={{ fontSize: 12, color: '#178740', lineHeight: 1.4 }}>
          Find node and delete while maintaining BST property using inorder successor.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem450Visualizer() {
  const [treeInput, setTreeInput] = useState('5,3,6,2,4,null,7')
  const [keyInput, setKeyInput] = useState('3')

  const { treeValues, key } = useMemo(() => {
    const parseTree = (str) => {
      if (!str || str.trim() === '') return []
      return str.split(',').map(s => {
        const trimmed = s.trim()
        if (trimmed === 'null' || trimmed === '') return null
        const n = parseInt(trimmed)
        return isNaN(n) ? null : n
      })
    }

    const k = keyInput ? parseInt(keyInput.trim()) : 0

    return {
      treeValues: parseTree(treeInput),
      key: isNaN(k) ? 0 : k,
    }
  }, [treeInput, keyInput])

  const steps = useMemo(
    () => generateSteps(treeValues, key).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [treeValues, key],
  )

  const {
    stepIndex, setStepIndex, stepForward, stepBack, togglePlay,
    handleReset, isPlaying, speed, setSpeed, isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const [autoScrollCode, setAutoScrollCode] = useAutoScroll()

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    snippetOptions: SNIPPETS,
    onStepJump: setStepIndex,
  })


  const handleExampleClick = useCallback((ex) => {
    setTreeInput(ex.tree.join(','))
    setKeyInput(String(ex.key))
    handleReset()
  }, [handleReset])

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: 'Visualization', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE_WITH_CONNECTIVITY}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
          autoScroll={autoScrollCode}
        />),
    viz: (<VisualizationPanel
          step={step}
          treeValues={treeValues}
          EXAMPLES={EXAMPLES}
          handleExampleClick={handleExampleClick}
          treeInput={treeInput}
          keyInput={keyInput}
          setTreeInput={setTreeInput}
          setKeyInput={setKeyInput}
          handleReset={handleReset}
        />),
  }), [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    treeValues,
    treeInput,
    keyInput,
    autoScrollCode,
    handleReset,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"string"},{"key":"key","label":"key","type":"string"}]}
        values={{ tree: treeInput, key: keyInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); if (k === 'key') setKeyInput(v); handleReset() }}
        showExamples={false}
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
        <div style={{ marginBottom: '12px', fontSize: 12, color: 'var(--text-muted)' }}>
          {step?.message ?? 'Press Play or Step to begin.'}
        </div>
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
          showAutoScroll={true}
          autoScroll={autoScrollCode}
          onAutoScrollChange={setAutoScrollCode}
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
