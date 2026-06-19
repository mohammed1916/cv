import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './Problem430Visualizer.css'

const EXAMPLES = getExamples('flatten-multilevel-dll')

function generateSteps(listStr) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    listStr,
    flatList: [],
    processingStack: [],
    currentNode: null,
    message: `Start flattening multilevel doubly linked list`,
  })

  let flatList = []
  let processingStack = []

  const nodes = listStr.split(',').slice(0, 8)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i].trim()
    flatList.push(node)
    processingStack.push(node)

    steps.push({
      activeLine: 2,
      phase: 'process_node',
      listStr,
      flatList: [...flatList],
      processingStack: [...processingStack],
      currentNode: node,
      message: `Process node: ${node}`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'complete',
    listStr,
    flatList: [...flatList],
    processingStack: [],
    currentNode: null,
    isComplete: true,
    message: `List flattened successfully`,
  })

  return steps
}

function MultiLevelVisualization({ listStr, currentNode, flatList }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Original Multilevel List</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', marginBottom: 8 }}>
          {listStr}
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {listStr.split(',').slice(0, 5).map((node, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                border: node.trim() === currentNode ? '3px solid #dc2626' : '2px solid #cbd5e1',
                backgroundColor: flatList.includes(node.trim()) ? '#ecfdf5' : '#f1f5f9',
                fontSize: 11,
                fontWeight: 600,
                color: flatList.includes(node.trim()) ? '#047857' : '#64748b',
              }}
              animate={{
                scale: node.trim() === currentNode ? 1.08 : 1,
              }}
            >
              {node.trim()}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FlatListVisualization({ flatList }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Flattened Result</div>
      <div style={{
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {flatList.length > 0 ? (
          flatList.map((node, idx) => (
            <motion.div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                backgroundColor: '#dbeafe',
                border: '2px solid #0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 600,
                color: '#0c4a6e',
              }}>
                {node}
              </div>
              {idx < flatList.length - 1 && (
                <div style={{ fontSize: 14, color: '#cbd5e1' }}>↔</div>
              )}
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>flattening...</div>
        )}
      </div>
    </div>
  )
}

function ProcessingStackVisualization({ stack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>DFS Stack</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 4,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        {stack.length > 0 ? (
          stack.map((node, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: '#f3e8ff',
                border: '1px solid #8b5cf6',
                fontSize: 11,
                fontWeight: 600,
                color: '#6b21a8',
              }}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {node}
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>stack empty</div>
        )}
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 16, padding: 16, overflow: 'auto' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <MultiLevelVisualization
          listStr={step?.listStr || ''}
          currentNode={step?.currentNode}
          flatList={step?.flatList || []}
        />

        <FlatListVisualization
          flatList={step?.flatList || []}
        />

        <ProcessingStackVisualization
          stack={step?.processingStack || []}
        />
      </div>
    </div>
  )
}

export default function Problem430Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { listStr: '1,2,3,4,5,6,null,null,null,7,8', label: 'MultiLevel' })
  const SOLUTION_CODE = useSolutionCode('flatten-multilevel-dll')

  const steps = useMemo(
    () =>
      generateSteps(ex.listStr).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(() => [
    {
      id: 'code',
      title: 'Code',
      content: (
        <CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />
      ),
    },
    {
      id: 'viz',
      title: '⛓️ Flatten DLL',
      content: (
        <VisualizationPanel
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace
        panels={dockPanels}
        initialLayout={{ rows: [['code', 'viz']], minimized: [] }}
      />
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
