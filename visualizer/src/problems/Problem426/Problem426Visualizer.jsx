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
import './Problem426Visualizer.css'

const EXAMPLES = getExamples('bst-to-doubly-linked-list')

function generateSteps(values) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    values,
    visitedNodes: [],
    linkedList: [],
    message: `Start in-order traversal of BST to convert to circular DLL`,
  })

  let visitedNodes = []
  let linkedList = []

  for (let i = 0; i < Math.min(values.length, 5); i++) {
    const val = values[i]
    visitedNodes.push(val)
    linkedList.push(val)

    steps.push({
      activeLine: 2,
      phase: 'traverse',
      values,
      visitedNodes: [...visitedNodes],
      linkedList: [...linkedList],
      currentVal: val,
      message: `Visit node ${val} in in-order traversal`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'connect',
    values,
    visitedNodes: [...visitedNodes],
    linkedList: [...linkedList],
    isCircular: true,
    message: `Connect tail back to head to form circular list`,
  })

  return steps
}

function TreeNodeVisualization({ value, isVisited, isCurrent, x = 0, y = 0 }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <circle
        cx={x}
        cy={y}
        r={25}
        fill={isCurrent ? '#fee2e2' : isVisited ? '#ecfdf5' : '#f1f5f9'}
        stroke={isCurrent ? '#dc2626' : isVisited ? '#10b981' : '#cbd5e1'}
        strokeWidth={isCurrent ? 3 : 2}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dy="0.3em"
        fontSize="14"
        fontWeight="600"
        fill={isCurrent ? '#991b1b' : isVisited ? '#047857' : '#475569'}
      >
        {value}
      </text>
    </motion.g>
  )
}

function TreeVisualization({ values, visitedNodes, currentVal }) {
  const width = 300
  const height = 250

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>BST Structure</div>
      <svg width={width} height={height} style={{ border: '2px solid #cbd5e1', borderRadius: 8 }}>
        {values.slice(0, 5).map((val, idx) => {
          const x = 50 + (idx % 3) * 80
          const y = 50 + Math.floor(idx / 3) * 80
          return (
            <TreeNodeVisualization
              key={idx}
              value={val}
              isVisited={visitedNodes.includes(val)}
              isCurrent={val === currentVal}
              x={x}
              y={y}
            />
          )
        })}
      </svg>
    </div>
  )
}

function LinkedListVisualization({ linkedList, isCircular }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
        Converted DLL {isCircular && '(Circular)'}
      </div>
      <div style={{
        display: 'flex',
        gap: 4,
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        {linkedList.map((val, idx) => (
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
              width: 36,
              height: 36,
              borderRadius: 4,
              backgroundColor: '#dbeafe',
              border: '2px solid #0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#0c4a6e',
            }}>
              {val}
            </div>
            {idx < linkedList.length - 1 && (
              <div style={{ fontSize: 16, color: '#cbd5e1' }}>↔</div>
            )}
          </motion.div>
        ))}
        {isCircular && linkedList.length > 0 && (
          <div style={{
            fontSize: 11,
            color: '#10b981',
            fontWeight: 600,
            marginLeft: 8,
          }}>
            ⟲ circular
          </div>
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
        <TreeVisualization
          values={step?.values || []}
          visitedNodes={step?.visitedNodes || []}
          currentVal={step?.currentVal}
        />

        <LinkedListVisualization
          linkedList={step?.linkedList || []}
          isCircular={step?.isCircular || false}
        />
      </div>
    </div>
  )
}

export default function Problem426Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { values: [4, 2, 5, 1, 3], label: 'BST' })
  const SOLUTION_CODE = useSolutionCode('bst-to-doubly-linked-list')

  const steps = useMemo(
    () =>
      generateSteps(ex.values).map((current) => ({
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
      title: '🌳 BST to DLL',
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
