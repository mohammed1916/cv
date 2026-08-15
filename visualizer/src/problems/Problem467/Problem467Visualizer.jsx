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
import './Problem467Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import PatternOverlay from "../../components/PatternOverlay";
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('unique-substrings-in-wraparound-string')

const PATTERNS = []

const EXAMPLES = getExamples('unique-substrings-in-wraparound-string')

function generateSteps(s) {
  const steps = []
  const dp = {}

  steps.push({
    activeLine: 1,
    s,
    index: 0,
    length: 1,
    dp: {},
    message: 'Initialize DP map to track max length ending with each letter'
  })

  let length = 1

  for (let i = 1; i < s.length; i++) {
    steps.push({
      activeLine: 2,
      s,
      index: i,
      length,
      dp: { ...dp },
      message: `Check s[${i}]='${s[i]}' and s[${i-1}]='${s[i-1]}'`
    })

    if ((s.charCodeAt(i) - s.charCodeAt(i - 1) + 26) % 26 === 1) {
      length++
      steps.push({
        activeLine: 3,
        s,
        index: i,
        length,
        dp: { ...dp },
        message: `Characters are consecutive: increment length to ${length}`
      })
    } else {
      length = 1
      steps.push({
        activeLine: 4,
        s,
        index: i,
        length,
        dp: { ...dp },
        message: `Not consecutive: reset length to 1`
      })
    }

    dp[s[i]] = Math.max(dp[s[i]] || 0, length)
    steps.push({
      activeLine: 5,
      s,
      index: i,
      length,
      dp: { ...dp },
      message: `Update dp['${s[i]}'] = ${dp[s[i]]}`
    })
  }

  const result = Object.values(dp).reduce((a, b) => a + b, 0)

  steps.push({
    activeLine: 6,
    s,
    index: s.length,
    length: 1,
    dp: { ...dp },
    done: true,
    message: `Total unique substrings: ${result}`
  })

  return steps
}

function VisualizationPanel({ s, step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, borderLeft: '4px solid #0284c7' }}>
        <div style={{ fontSize: 12, color: '#075985', fontStyle: 'italic' }}>
          "Find unique substrings in a wraparound string. Letters wrap: z→a. Use dynamic programming to track the longest consecutive substring ending with each letter."
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
          String: "{s}"
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {s.split('').map((char, idx) => {
            const isActive = step && idx === step.index && !step.done
            const isProcessed = step && idx < step.index
            return (
              <motion.div
                key={`char-${idx}`}
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
          DP Map (Max Length per Ending Letter)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))', gap: 8 }}>
          {Object.entries(step?.dp || {}).map(([letter, maxLen]) => (
            <motion.div
              key={`dp-${letter}`}
              style={{
                padding: '12px',
                borderRadius: 4,
                border: '2px solid #10b981',
                backgroundColor: '#f0fdf4',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#047857' }}>{letter}</div>
              <div style={{ fontSize: 12, color: '#0c865d', marginTop: 4 }}>{maxLen}</div>
            </motion.div>
          ))}
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
          <div style={{ fontSize: 12, color: '#065f46', fontWeight: 600, marginBottom: 8 }}>Current Length</div>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#0c865d' }}>
            {step?.length ?? 1}
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
            Position {step?.index ?? 0} of {s.length}
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

export default function Problem467Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("abc");
  const { s, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      return { s: parsedS, inputError: '' };
    } catch (e) {
      return { s: "abc", inputError: e.message };
    }
  }, [sInput]);

  const steps = useMemo(
    () =>
      generateSteps(s).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [s]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((e) => { setEx(e); setSInput(String(e.s)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '📝 Unique Substrings', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<CodeTracePanel
          step={step}
          codeLines={SOLUTION_CODE}
          highlightedLines={connectivity.highlightedLines}
          onLineSelect={connectivity.handleLineSelect}
          onActiveLineDomChange={setActiveLineDom}
        />),
    viz: (<VisualizationPanel
          s={s}
          step={step}
          applyEx={applyEx}
        />),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, ex, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"s","label":"s","type":"string"}]}
          values={{ s: sInput }}
          onChange={(k, v) => { if (k === 's') setSInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={ex?.label}
          applyExample={applyEx}
          inputError={inputError}
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
