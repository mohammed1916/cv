import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import ManualInputPanel from '../../components/shared/ManualInputPanel'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const SOLUTION_CODE = [
  { line: 1, text: 'class BSTIterator:' },
  { line: 2, text: '    def __init__(self, root):' },
  { line: 3, text: '        self.stack = []' },
  { line: 4, text: '        self._pushLeft(root)' },
  { line: 5, text: '    def _pushLeft(self, node):' },
  { line: 6, text: '        while node:' },
  { line: 7, text: '            self.stack.append(node)' },
  { line: 8, text: '            node = node.left' },
  { line: 9, text: '    def next(self):' },
  { line: 10, text: '        node = self.stack.pop()' },
  { line: 11, text: '        if node.right:' },
  { line: 12, text: '            self._pushLeft(node.right)' },
  { line: 13, text: '        return node.val' },
]

const EXAMPLES = [
  { label: 'Balanced BST', input: [3, 1, 6, null, 2, 4, 7] },
  { label: 'Single node', input: [1] },
  { label: 'Right chain', input: [1, null, 2, null, null, null, 3] },
]

function generateSteps(treeValues) {
  const steps = []
  if (!Array.isArray(treeValues) || treeValues[0] == null) return [{ activeLine: 3, stack: [], visited: [], message: 'Empty tree: the iterator has no values.' }]
  const stack = [], visited = []
  const snapshot = () => stack.map(index => treeValues[index])
  const pushLeft = (start) => { let index = start; while (index < treeValues.length && treeValues[index] != null) { stack.push(index); steps.push({ activeLine: 7, stack: snapshot(), visited: [...visited], message: `Push ${treeValues[index]} while following its left child.` }); index = index * 2 + 1 } }
  steps.push({ activeLine: 3, stack: [], visited: [], message: 'Initialize the iterator stack, then push the root’s left spine.' })
  pushLeft(0)
  while (stack.length) {
    const index = stack.pop(), value = treeValues[index]
    visited.push(value)
    steps.push({ activeLine: 10, stack: snapshot(), visited: [...visited], message: `next() pops ${value}, the next in-order value.` })
    const right = index * 2 + 2
    if (right < treeValues.length && treeValues[right] != null) { steps.push({ activeLine: 11, stack: snapshot(), visited: [...visited], message: `${value} has right child ${treeValues[right]}; push that subtree’s left spine.` }); pushLeft(right) }
  }
  steps.push({ activeLine: 13, stack: [], visited: [...visited], message: `Traversal complete: [${visited.join(', ')}].` })
  return steps
}

export default function BSTIteratorVisualizer() {
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const [inputText, setInputText] = useState(JSON.stringify(EXAMPLES[0].input))
  const { treeValues, inputError } = useMemo(() => { try { const value = JSON.parse(inputText); if (!Array.isArray(value)) throw new Error('Enter a JSON level-order array.'); return { treeValues: value, inputError: '' } } catch (error) { return { treeValues: EXAMPLES[0].input, inputError: error.message } } }, [inputText])
  const steps = useMemo(() => generateSteps(treeValues), [treeValues])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  // Panel definitions for Lumino
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
      {showPatternOverlay && <CodePatternAnnotations step={step} patterns={PATTERNS} activeLineDom={activeLineDom} />}
    </div>
  )

  const primaryPanel = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
      {step && (
        <>
          <div style={{ padding: 8, backgroundColor: 'var(--surface)', borderRadius: 6, fontSize: 11 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{step.message}</div>
          </div>

          <div style={{ padding: 8, backgroundColor: '#dbeafe', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#1e40af' }}>Stack:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {step.stack.length === 0 ? (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>empty</span>
              ) : (
                step.stack.map((val, i) => (
                  <motion.div
                    key={i}
                    animate={{ x: i === step.stack.length - 1 ? 4 : 0 }}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: i === step.stack.length - 1 ? '#0ea5e9' : '#f0f9ff',
                      border: '1px solid #0ea5e9',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: i === step.stack.length - 1 ? '#fff' : 'var(--surface2)',
                    }}
                  >
                    {val}
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div style={{ padding: 8, backgroundColor: '#dcfce7', borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, marginBottom: 6, color: '#15803d' }}>In-order Sequence:</div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(step.visited || []).map((val, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#dcfce7',
                    border: '1px solid #86efac',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: '#15803d',
                  }}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )

  const statusPanel = (
    <div style={{ padding: 8, fontSize: 11, color: 'var(--text-muted)' }}>
      {step ? `Step ${stepIndex + 1} of ${steps.length}` : 'No step'}
    </div>
  )

  const playbackPanel = (
    <>
      {showPatternOverlay && <PatternLegend patterns={PATTERNS} />}
      <PlaybackControls
        isPlaying={isPlaying}
        isDone={isDone}
        speed={speed}
        onPlayToggle={togglePlay}
        onPrev={stepBack}
        onNext={stepForward}
        onReset={handleReset}
        prevDisabled={stepIndex <= 0}
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

  // Lumino panel configuration
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'input', title: 'Input' },
      { id: 'primary', title: '🌳 Stack State', dockMode: 'split-bottom' },
      { id: 'code', title: 'Code', dockMode: 'split-right' },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="bsti-shell">
      <LuminoDockPanel panels={panelConfigs} onPanelReady={handlePanelReady} />
      {panelDivs && (
        <>
          {panelDivs.primary && createPortal(primaryPanel, panelDivs.primary)}
          {panelDivs.input && createPortal(<ManualInputPanel fields={[{ key: 'tree', label: 'BST level-order JSON', type: 'array' }]} values={{ tree: inputText }} onChange={(_, value) => { setInputText(value); handleReset() }} examples={EXAMPLES} activeLabel={null} applyExample={(example) => { setInputText(JSON.stringify(example.input)); handleReset() }} inputError={inputError} />, panelDivs.input)}
          {panelDivs.code && createPortal(codePanel, panelDivs.code)}
        </>
      )}
      {createPortal(
        <FloatingPanel title="Playback Controls">{playbackPanel}</FloatingPanel>,
        document.body
      )}
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
