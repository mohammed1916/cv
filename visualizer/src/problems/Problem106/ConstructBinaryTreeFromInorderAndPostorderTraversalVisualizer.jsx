import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './ConstructBinaryTreeFromInorderAndPostorderTraversalVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = getExamplesOr('construct-binary-tree-from-inorder-and-postorder-traversal', [
  { label: 'Example 1', inorder: [9, 3, 15, 20, 7], postorder: [9, 15, 7, 20, 3] },
  { label: 'Example 2', inorder: [1], postorder: [1] },
])

const SOLUTION_CODE_INLINE = [
  { line: 1, text: 'def buildTree(inorder, postorder):' },
  { line: 2, text: '    if not inorder: return None' },
  { line: 3, text: '    root_val = postorder[-1]' },
  { line: 4, text: '    root = TreeNode(root_val)' },
  { line: 5, text: '    root_idx = inorder.index(root_val)' },
  { line: 6, text: '    root.left = buildTree(' },
  { line: 7, text: '        inorder[:root_idx],' },
  { line: 8, text: '        postorder[:root_idx])' },
  { line: 9, text: '    root.right = buildTree(' },
  { line: 10, text: '        inorder[root_idx+1:],' },
  { line: 11, text: '        postorder[root_idx:-1])' },
  { line: 12, text: '    return root' },
]

const SOLUTION_CODE = SOLUTION_CODE_INLINE

function generateSteps(inorder, postorder) {
    const steps = []

  if (!inorder || inorder.length === 0) {
    steps.push({
      activeLine: 2,
      inorder: [],
      postorder: [],
      message: 'Base case: empty arrays',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    inorder,
    postorder,
    message: `Build tree from inorder=${JSON.stringify(inorder)}, postorder=${JSON.stringify(postorder)}`,
    relatedLines: [1],
  })

  const buildTreeRecursive = (inStart, inEnd, postStart, postEnd, depth = 0) => {
    if (inStart > inEnd) return null

    const rootVal = postorder[postEnd]
    const rootIdx = inorder.indexOf(rootVal)

    steps.push({
      activeLine: 3,
      inorder,
      postorder,
      rootVal,
      inRange: [inStart, inEnd],
      postRange: [postStart, postEnd],
      rootIdx,
      depth,
      message: `Root: ${rootVal} (postorder[${postEnd}]), found at inorder[${rootIdx}]`,
      relatedLines: [3, 5],
    })

    const leftSize = rootIdx - inStart
    steps.push({
      activeLine: 6,
      inorder,
      postorder,
      rootVal,
      inRange: [inStart, inEnd],
      postRange: [postStart, postEnd],
      rootIdx,
      leftSize,
      leftInRange: [inStart, rootIdx - 1],
      leftPostRange: [postStart, postStart + leftSize - 1],
      depth,
      message: `Split: left has ${leftSize} nodes`,
      relatedLines: [6, 7, 8],
    })

    const root = { val: rootVal, left: null, right: null }

    if (inStart < rootIdx) {
      root.left = buildTreeRecursive(inStart, rootIdx - 1, postStart, postStart + leftSize - 1, depth + 1)
    }

    if (rootIdx < inEnd) {
      root.right = buildTreeRecursive(rootIdx + 1, inEnd, postStart + leftSize, postEnd - 1, depth + 1)
    }

    return root
  }

  buildTreeRecursive(0, inorder.length - 1, 0, postorder.length - 1)

  steps.push({
    activeLine: 12,
    inorder,
    postorder,
    done: true,
    message: 'Tree construction complete',
    relatedLines: [12],
  })

  return steps
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16, color: '#94a3b8' }}>Press play to start</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, borderLeft: '4px solid #f59e0b' }}>
        <div style={{ fontSize: 12, color: '#92400e', fontStyle: 'italic' }}>
          Key insight: Last element of postorder is root. Find it in inorder to split left/right subtrees.
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Inorder</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
          {step.inorder.map((val, idx) => (
            <motion.span
              key={idx}
              style={{
                padding: '4px 8px',
                borderRadius: 3,
                backgroundColor:
                  step.rootIdx === idx
                    ? '#fed7aa'
                    : step.inRange && idx >= step.inRange[0] && idx <= step.inRange[1]
                      ? '#bfdbfe'
                      : step.leftInRange && idx >= step.leftInRange[0] && idx <= step.leftInRange[1]
                        ? '#c7d2fe'
                        : '#e0e7ff',
                border:
                  step.rootIdx === idx
                    ? '2px solid #d97706'
                    : step.leftInRange && idx >= step.leftInRange[0] && idx <= step.leftInRange[1]
                      ? '1px solid #4f46e5'
                      : '1px solid #cbd5e1',
                fontWeight: step.rootIdx === idx ? 700 : 600,
              }}
              animate={{ scale: step.rootIdx === idx ? 1.15 : 1 }}
            >
              {val}
            </motion.span>
          ))}
        </div>
      </div>

      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Postorder</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', fontFamily: 'monospace', fontSize: 11 }}>
          {step.postorder.map((val, idx) => (
            <motion.span
              key={idx}
              style={{
                padding: '4px 8px',
                borderRadius: 3,
                backgroundColor:
                  step.postRange && idx === step.postRange[1]
                    ? '#fed7aa'
                    : step.postRange && idx >= step.postRange[0] && idx <= step.postRange[1]
                      ? '#bfdbfe'
                      : '#e0e7ff',
                border:
                  step.postRange && idx === step.postRange[1]
                    ? '2px solid #d97706'
                    : step.postRange && idx >= step.postRange[0] && idx <= step.postRange[1]
                      ? '1px solid #4f46e5'
                      : '1px solid #cbd5e1',
                fontWeight: step.postRange && idx === step.postRange[1] ? 700 : 600,
              }}
              animate={{ scale: step.postRange && idx === step.postRange[1] ? 1.15 : 1 }}
            >
              {val}
            </motion.span>
          ))}
        </div>
      </div>

      {step.message && (
        <motion.div
          style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, fontSize: 12, color: '#5b21b6' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function ConstructBinaryTreeFromInorderAndPostorderTraversalVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [inorderInput, setInorderInput] = useState("[9,3,15,20,7]");
  const [postorderInput, setPostorderInput] = useState("[9,15,7,20,3]");
  const { inorder, postorder, inputError } = useMemo(() => {
    try {
      const parsedInorder = JSON.parse(inorderInput); if (!Array.isArray(parsedInorder)) throw new Error('inorder must be an array');
      const parsedPostorder = JSON.parse(postorderInput); if (!Array.isArray(parsedPostorder)) throw new Error('postorder must be an array');
      return { inorder: parsedInorder, postorder: parsedPostorder, inputError: '' };
    } catch (e) {
      return { inorder: "[9,3,15,20,7]", postorder: "[9,15,7,20,3]", inputError: e.message };
    }
  }, [inorderInput, postorderInput]);
  const steps = useMemo(
    () =>
      generateSteps(inorder, postorder).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? (s.activeLine ? [s.activeLine] : []),
      })),
    [inorder, postorder]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setInput(e); handleReset() }, [handleReset])
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  // Step 2: Extract panel consts
  const primaryPanel = (
    <>
    <div className="cbtipt-panel">
      <VisualizationPanel step={step} />
    </div>
  
    </>)

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
      {showPatternOverlay && <CodePatternAnnotations step={step} activeLineDom={activeLineDom} patterns={PATTERNS} />}
    </div>
  )

  const statusPanel = (
    <div className="cbtipt-status">
      {step?.message && <span>{step.message}</span>}
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

  // Step 3: Add state + config
  const [panelDivs, setPanelDivs] = useState(null)
  const panelConfigs = useMemo(
    () => [
      { id: 'primary', title: '🌳 Tree Construction', dockMode: 'split-right' },
      { id: 'code', title: 'Code', dockMode: 'split-bottom' },
      { id: 'status', title: 'Status', dockMode: 'split-bottom', ratio: 0.08 },
    ],
    []
  )
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  // Step 4: Replace return with portals
  return (
    <div className="cbtipt-shell">
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
