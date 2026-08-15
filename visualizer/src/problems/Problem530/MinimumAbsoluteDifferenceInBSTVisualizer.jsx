import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './MinimumAbsoluteDifferenceInBSTVisualizer.css'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('minimum-absolute-difference-in-bst')

const PATTERNS = ['compute_diff', 'done', 'init', 'update_min', 'visit_node']
const LINE_PATTERN_MAP = {
  1: 'init',
  4: 'loop',
  7: 'process',
  8: 'process',
  13: 'done'
}


const EXAMPLES = getExamples('minimum-absolute-difference-in-bst')

function generateSteps(root) {
  const steps = []
  const inorderSequence = []
  let prev = null
  let minDiff = Infinity

  steps.push({
    activeLine: 1,
    root,
    inorderSequence,
    prev,
    minDiff,
    phase: 'init',
    message: 'Start inorder traversal of BST',
    relatedLines: [1]
  })

  function inorder(nodeIdx, depth = 0) {
    if (nodeIdx === null) return

    const leftIdx = nodeIdx * 2 + 1
    const rightIdx = nodeIdx * 2 + 2

    if (leftIdx < root.length) inorder(leftIdx, depth + 1)

    const val = root[nodeIdx]
    inorderSequence.push(val)

    steps.push({
      activeLine: 4,
      root,
      nodeIdx,
      val,
      inorderSequence: [...inorderSequence],
      prev,
      minDiff,
      phase: 'visit_node',
      message: `Visit node ${val} (depth ${depth})`,
      relatedLines: [4],
      depth
    })

    if (prev !== null) {
      const diff = val - prev
      steps.push({
        activeLine: 7,
        root,
        nodeIdx,
        val,
        prev,
        diff,
        inorderSequence: [...inorderSequence],
        minDiff,
        phase: 'compute_diff',
        message: `Difference: ${val} - ${prev} = ${diff}`,
        relatedLines: [7],
        depth
      })

      if (diff < minDiff) {
        minDiff = diff
        steps.push({
          activeLine: 8,
          root,
          nodeIdx,
          val,
          prev,
          diff,
          minDiff,
          inorderSequence: [...inorderSequence],
          phase: 'update_min',
          message: `Update minimum difference to ${minDiff}`,
          relatedLines: [8],
          depth
        })
      }
    }

    prev = val

    if (rightIdx < root.length) inorder(rightIdx, depth + 1)
  }

  inorder(0)

  steps.push({
    activeLine: 13,
    root,
    inorderSequence,
    minDiff,
    phase: 'done',
    message: `Minimum absolute difference: ${minDiff}`,
    relatedLines: [13],
    done: true,
    result: minDiff
  })

  return steps
}

function VisualizationPanel({ root, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      {/* Story */}
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find the minimum absolute difference between any two values in a BST using inorder traversal."
        </div>
      </div>

      {/* Examples */}
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
                backgroundColor: '#f1f5f9'
              }}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inorder Sequence */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Inorder Sequence</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {step?.inorderSequence?.map((val, idx) => {
            const isLast = idx === step.inorderSequence.length - 1
            const isPrev = step?.prev === val && isLast
            return (
              <motion.div
                key={`inorder-${idx}`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  fontWeight: 600,
                  backgroundColor: isPrev ? '#dbeafe' : '#f1f5f9',
                  borderColor: isPrev ? '#0284c7' : '#cbd5e1',
                  color: isPrev ? '#0c4a6e' : '#334155'
                }}
                animate={{ scale: isPrev ? 1.15 : 1 }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current Pair */}
      {step?.phase === 'compute_diff' && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '1px solid #fbbf24'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ color: '#92400e', marginBottom: 8, fontWeight: 600 }}>
            Comparing consecutive values
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
              <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>Previous</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#b45309' }}>{step.prev}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#92400e', fontWeight: 600 }}>→</div>
            <div style={{ textAlign: 'center', fontFamily: 'monospace' }}>
              <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>Current</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#b45309' }}>{step.val}</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'monospace' }}>
            <div style={{ color: '#b45309', fontSize: 11, marginBottom: 4 }}>Difference</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{step.diff}</div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 6,
          border: '2px solid #0284c7',
          textAlign: 'center'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Min Absolute Difference</div>
        <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0284c7' }}>
          {step?.minDiff === Infinity ? '∞' : step?.minDiff}
        </div>
        <div style={{ fontSize: 12, color: '#0284c7', marginTop: 8 }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function MinimumAbsoluteDifferenceInBSTVisualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { root: [4, 2, 6, 1, 3] })

  const steps = useMemo(
    () =>
      generateSteps(ex.root).map((current) => ({
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

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🌳 Min Difference in BST', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: 'relative' }}>

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

        </div>),
    viz: (<VisualizationPanel
          root={ex.root}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
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
        {showPatternOverlay && (
          <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />
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
          onSpeedChange={e => setSpeed(Number(e.target.value))}
          showPatternOverlay={showPatternOverlay}
          onShowPatternOverlayChange={setShowPatternOverlay}
          patternOverlayLabel="Show pattern overlay"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      
    </div>
  )
}
