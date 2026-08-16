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
const PATTERNS = ['deserialize_start', 'done', 'null_node', 'process_node', 'read_node', 'reading', 'serialized', 'start']
const LINE_PATTERN_MAP = {
  1: 'done',
  2: 'start',
  5: 'null_node',
  7: 'process_node',
  11: 'serialized',
  13: 'deserialize_start',
  17: 'reading',
  20: 'read_node',
  25: 'done'
}


const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def serialize(root: TreeNode) -> str:' },
  { line: 2, text: '    result = []' },
  { line: 3, text: '    def dfs(node):' },
  { line: 4, text: '        if not node:' },
  { line: 5, text: '            result.append("#")' },
  { line: 6, text: '            return' },
  { line: 7, text: '        result.append(str(node.val))' },
  { line: 8, text: '        dfs(node.left)' },
  { line: 9, text: '        dfs(node.right)' },
  { line: 10, text: '    dfs(root)' },
  { line: 11, text: '    return ",".join(result)' },
  { line: 12, text: 'def deserialize(data: str) -> TreeNode:' },
  { line: 13, text: '    nodes = data.split(",")' },
  { line: 14, text: '    idx = 0' },
  { line: 15, text: '    def build():' },
  { line: 16, text: '        nonlocal idx' },
  { line: 17, text: '        if nodes[idx] == "#":' },
  { line: 18, text: '            idx += 1' },
  { line: 19, text: '            return None' },
  { line: 20, text: '        node = TreeNode(int(nodes[idx]))' },
  { line: 21, text: '        idx += 1' },
  { line: 22, text: '        node.left = build()' },
  { line: 23, text: '        node.right = build()' },
  { line: 24, text: '        return node' },
  { line: 25, text: '    return build()' },
]
const SOLUTION_CODE = SOLUTION_CODE_INLINE

const EXAMPLES = getExamplesOr('serialize-and-deserialize-bst', [
  { label: 'Example 1', tree: [2, 1, 3], expected: '2,1,3,#,#,#,#' },
  { label: 'Example 2', tree: [1, 0, 50, null, null, 25, 75], expected: '1,0,50,#,#,25,75' },
  { label: 'Example 3', tree: [5, 3, 7], expected: '5,3,7,#,#,#,#' },
])

const SNIPPETS = [
  { id: 'serialize', label: 'Serialize (DFS)', lines: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: 'deserialize', label: 'Deserialize (Build)', lines: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] },
]

function generateSteps(treeValues) {
  const steps = []

  if (!Array.isArray(treeValues) || treeValues.length === 0) {
    return [{
      phase: 'done',
      activeLine: 1,
      serialized: '#',
      nodeCount: 0,
      stepNum: 0,
      message: 'Empty tree.',
    }]
  }

  steps.push({
    phase: 'start',
    activeLine: 2,
    serialized: '',
    nodeCount: 0,
    stepNum: 0,
    message: `Starting serialization of tree with ${treeValues.length} nodes`,
  })

  const nodes = treeValues
  const serialized = []
  let stepNum = 1

  const dfs = (val, depth) => {
    if (val === null || val === undefined) {
      serialized.push('#')
      steps.push({
        phase: 'null_node',
        activeLine: 5,
        serialized: serialized.join(','),
        stepNum,
        depth,
        message: `Null node encountered`,
      })
      stepNum++
      return
    }

    serialized.push(val)
    steps.push({
      phase: 'process_node',
      activeLine: 7,
      serialized: serialized.join(','),
      nodeValue: val,
      stepNum,
      depth,
      message: `Processing node: ${val}`,
    })
    stepNum++
  }

  for (const val of nodes) {
    if (val !== null && val !== undefined) {
      dfs(val, 0)
    }
  }

  steps.push({
    phase: 'serialized',
    activeLine: 11,
    serialized: serialized.join(','),
    nodeCount: nodes.filter(n => n !== null && n !== undefined).length,
    stepNum,
    message: `Serialized: ${serialized.join(',')}`,
  })
  stepNum++

  steps.push({
    phase: 'deserialize_start',
    activeLine: 13,
    serialized: serialized.join(','),
    nodeCount: nodes.filter(n => n !== null && n !== undefined).length,
    stepNum,
    message: `Deserializing from string...`,
  })
  stepNum++

  const parts = serialized.join(',').split(',')
  let idx = 0

  const deserialized = []

  while (idx < parts.length) {
    const part = parts[idx]
    steps.push({
      phase: 'reading',
      activeLine: 17,
      serialized: serialized.join(','),
      currentPart: part,
      idx,
      deserialized: [...deserialized],
      stepNum,
      message: `Reading position ${idx}: ${part}`,
    })
    stepNum++

    if (part !== '#') {
      deserialized.push(part)
      steps.push({
        phase: 'read_node',
        activeLine: 20,
        serialized: serialized.join(','),
        currentPart: part,
        idx,
        deserialized: [...deserialized],
        stepNum,
        message: `Read node: ${part}`,
      })
      stepNum++
    }

    idx++
  }

  steps.push({
    phase: 'done',
    activeLine: 25,
    serialized: serialized.join(','),
    deserialized,
    stepNum,
    message: `Deserialized nodes: ${deserialized.join(', ')}`,
  })

  return steps
}

function snippetIdForPhase(phase) {
  if (phase === 'start' || phase === 'null_node' || phase === 'process_node' || phase === 'serialized') return 'serialize'
  if (phase === 'deserialize_start' || phase === 'reading' || phase === 'read_node') return 'deserialize'
  if (phase === 'done') return 'deserialize'
  return 'serialize'
}

function SerializedView({ serialized }) {
  const parts = serialized.split(',')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Serialized String
      </header>
      <div style={{
        padding: 12,
        backgroundColor: '#f0fdf4',
        borderRadius: 4,
        border: '1px solid #86efac',
        wordBreak: 'break-all',
        fontSize: 11,
        fontFamily: 'monospace',
        color: '#166534',
      }}>
        {serialized || '(empty)'}
      </div>
      <div style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        minHeight: 50,
        padding: 8,
        backgroundColor: 'var(--surface)',
        borderRadius: 4,
      }}>
        {parts.map((part, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              padding: '4px 8px',
              backgroundColor: part === '#' ? '#fecaca' : '#dbeafe',
              border: `1px solid ${part === '#' ? '#dc2626' : '#3b82f6'}`,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              color: part === '#' ? '#7f1d1d' : '#1e40af',
            }}
          >
            {part}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TreeStructure({ treeValues }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <header style={{ fontSize: 12, fontWeight: 600, color: 'var(--surface2)' }}>
        Tree Values (level-order)
      </header>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 80, alignContent: 'flex-start' }}>
        {treeValues.map((val, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            style={{
              minWidth: 50,
              height: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: val === null || val === undefined ? '#f3f4f6' : '#dbeafe',
              border: `2px solid ${val === null || val === undefined ? '#d1d5db' : '#3b82f6'}`,
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              color: val === null || val === undefined ? '#6b7280' : '#1e40af',
            }}
          >
            {val === null || val === undefined ? 'null' : val}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, treeValues, EXAMPLES, handleExampleClick, treeInput, setTreeInput, handleReset }) {
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

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
          Tree (comma-separated, null for missing nodes)
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={treeInput}
            onChange={(e) => { setTreeInput(e.target.value); handleReset() }}
            placeholder="e.g., 2,1,3"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: '1px solid var(--border)',
              borderRadius: 4,
              fontSize: 12,
              fontFamily: 'monospace',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={handleReset}
            style={{
              padding: '8px 10px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--text)',
              border: '1px solid var(--primary)',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1 }}>
        <TreeStructure treeValues={treeValues} />
        <SerializedView serialized={step?.serialized || ''} />
      </div>

      <div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 4, border: '1px solid #86efac' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#166534', marginBottom: 2 }}>
          Serialization/Deserialization
        </div>
        <div style={{ fontSize: 12, color: '#178740', lineHeight: 1.4 }}>
          Convert BST to string representation and back, using pre-order traversal.
        </div>
      </div>
    </section>
  )
}

const SOLUTION_CODE_WITH_CONNECTIVITY = SOLUTION_CODE

export default function Problem449Visualizer() {
  const [treeInput, setTreeInput] = useState('2,1,3')

  const treeValues = useMemo(() => {
    if (!treeInput || treeInput.trim() === '') return []
    return treeInput.split(',').map(s => {
      const trimmed = s.trim()
      if (trimmed === 'null' || trimmed === '') return null
      const n = parseInt(trimmed)
      return isNaN(n) ? null : n
    })
  }, [treeInput])

  const steps = useMemo(
    () => generateSteps(treeValues).map((current) => ({
      ...current,
      snippetId: snippetIdForPhase(current.phase),
      relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
    })),
    [treeValues],
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
          setTreeInput={setTreeInput}
          handleReset={handleReset}
        />),
  }), [
    step,
    SOLUTION_CODE_WITH_CONNECTIVITY,
    connectivity,
    setActiveLineDom,
    treeValues,
    treeInput,
    autoScrollCode,
    handleReset,
  ])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"tree","label":"tree","type":"string"}]}
        values={{ tree: treeInput }}
        onChange={(k, v) => { if (k === 'tree') setTreeInput(v); handleReset() }}
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
