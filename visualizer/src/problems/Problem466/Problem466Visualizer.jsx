import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'

import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamples } from '../../config/examplesRegistry'
import './Problem466Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
const SOLUTION_CODE = getSolutionCode('count-the-repetitions')

const PATTERNS = []

const EXAMPLES = getExamples('count-the-repetitions')

function generateSteps(s1, s2) {
  const steps = []

  steps.push({
    activeLine: 1,
    s1,
    s2,
    s1Idx: 0,
    s2Idx: 0,
    count: 0,
    message: 'Initialize pointers for both strings'
  })

  let s1Idx = 0, s2Idx = 0, count = 0
  const maxIterations = s1.length * (s2.length + 1)
  let iterations = 0

  while (s1Idx < s1.length && iterations < maxIterations) {
    steps.push({
      activeLine: 2,
      s1,
      s2,
      s1Idx,
      s2Idx,
      count,
      message: `Compare s1[${s1Idx}]=${s1[s1Idx]} with s2[${s2Idx}]=${s2[s2Idx]}`
    })

    if (s1[s1Idx] === s2[s2Idx]) {
      s2Idx++
      steps.push({
        activeLine: 3,
        s1,
        s2,
        s1Idx,
        s2Idx,
        count,
        message: `Characters match, advance s2 pointer to ${s2Idx}`
      })

      if (s2Idx === s2.length) {
        s2Idx = 0
        count++
        steps.push({
          activeLine: 4,
          s1,
          s2,
          s1Idx,
          s2Idx,
          count,
          message: `Completed s2, increment count to ${count}, reset s2 pointer`
        })
      }
    }

    s1Idx++
    steps.push({
      activeLine: 5,
      s1,
      s2,
      s1Idx,
      s2Idx,
      count,
      message: `Advance s1 pointer to ${s1Idx}`
    })

    iterations++
  }

  steps.push({
    activeLine: 6,
    s1,
    s2,
    s1Idx,
    s2Idx,
    count,
    done: true,
    message: `Done: s1 contains ${count} repetitions of s2`
  })

  return steps
}

function VisualizationPanel({ s1, s2, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Count how many times s2 appears as a substring in an infinite repetition of s1. Use two pointers to match characters and count complete matches."
        </div>
      </div>

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

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          s1: "{s1}"
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s1.split('').map((char, idx) => {
            const isActive = step && idx === step.s1Idx && !step.done
            const isProcessed = step && idx < step.s1Idx
            return (
              <motion.div
                key={`s1-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fef08a' : isProcessed ? '#d1fae5' : '#f1f5f9',
                  borderColor: isActive ? '#eab308' : isProcessed ? '#10b981' : '#cbd5e1',
                  color: isActive ? '#854d0e' : isProcessed ? '#047857' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
          s2: "{s2}" (Match target)
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s2.split('').map((char, idx) => {
            const isActive = step && idx === step.s2Idx && !step.done
            const isMatched = step && idx < step.s2Idx
            return (
              <motion.div
                key={`s2-${idx}`}
                style={{
                  padding: '8px 12px',
                  borderRadius: 4,
                  border: '2px solid',
                  fontFamily: 'monospace',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: isActive ? '#fee2e2' : isMatched ? '#dcfce7' : '#f1f5f9',
                  borderColor: isActive ? '#dc2626' : isMatched ? '#22c55e' : '#cbd5e1',
                  color: isActive ? '#991b1b' : isMatched ? '#16a34a' : '#334155'
                }}
                animate={{ scale: isActive ? 1.15 : 1 }}
              >
                {char}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#f0fdf4',
            borderRadius: 6,
            border: '2px solid #10b981'
          }}
        >
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Repetitions Found</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>
            {step?.count ?? 0}
          </div>
        </motion.div>

        <motion.div
          style={{
            padding: 16,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b'
          }}
        >
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 8 }}>Progress</div>
          <div style={{ fontSize: 12, color: '#b45309' }}>
            s1: {step?.s1Idx ?? 0}/{s1.length} | s2: {step?.s2Idx ?? 0}/{s2.length}
          </div>
        </motion.div>
      </div>

      <motion.div
        style={{
          padding: 16,
          backgroundColor: '#f8f4ff',
          borderRadius: 6,
          border: '2px solid #8b5cf6'
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>Status</div>
        <div style={{ fontSize: 12, color: '#7c3aed' }}>
          {step?.message || ''}
        </div>
      </motion.div>
    </div>
  )
}

export default function Problem466Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [s1Input, setS1Input] = useState("acb");
  const [s2Input, setS2Input] = useState("ab");
  const { s1, s2, inputError } = useMemo(() => {
    try {
      const parsedS1 = s1Input;
      const parsedS2 = s2Input;
      return { s1: parsedS1, s2: parsedS2, inputError: '' };
    } catch (e) {
      return { s1: "acb", s2: "ab", inputError: e.message };
    }
  }, [s1Input, s2Input]);

  const steps = useMemo(
    () =>
      generateSteps(s1, s2).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s1, s2]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setS1Input(String(e.s1)); setS2Input(String(e.s2)); handleReset(); }, [handleReset]);

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
      title: '🔁 Count The Repetitions',
      content: (
        <VisualizationPanel
          s1={s1}
          s2={s2}
          step={step}
          applyEx={applyEx}
        />
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])

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
          onSpeedChange={e => setSpeed(Number(
            <>e.target.value
    </>))}
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
