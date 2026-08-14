import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './IsomorphicStringsVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'


// ─── Pattern annotations ───────────────────────────────────────────────────
const LINE_PATTERN_MAP = {}  // Auto-generated: maps line numbers to phase names
const PATTERNS = []  // Auto-generated: list of phase names used in this visualizer
const EXAMPLES = [
  { label: 'Example 1', s: 'egg', t: 'add' },
  { label: 'Example 2', s: 'paper', t: 'title' },
]

const SOLUTION_CODE = [
  { line: 1, text: 'def isIsomorphic(s, t):' },
  { line: 2, text: '    if len(s) != len(t): return False' },
  { line: 3, text: '    s_map = {}' },
  { line: 4, text: '    t_map = {}' },
  { line: 5, text: '    for c1, c2 in zip(s, t):' },
  { line: 6, text: '        if c1 in s_map:' },
  { line: 7, text: '            if s_map[c1] != c2: return False' },
  { line: 8, text: '        else:' },
  { line: 9, text: '            s_map[c1] = c2' },
  { line: 10, text: '        if c2 in t_map:' },
  { line: 11, text: '            if t_map[c2] != c1: return False' },
  { line: 12, text: '        else:' },
  { line: 13, text: '            t_map[c2] = c1' },
  { line: 14, text: '    return True' },
]

function generateSteps(s, t) {
    const steps = []
  steps.push({
    activeLine: 1,
    s,
    t,
    message: `Check if "${s}" and "${t}" are isomorphic`,
    relatedLines: [1],
  })

  if (s.length !== t.length) {
    steps.push({
      activeLine: 2,
      result: false,
      done: true,
      message: 'Different lengths, not isomorphic',
      relatedLines: [2],
    })
    return steps
  }

  steps.push({
    activeLine: 3,
    s,
    t,
    message: 'Initialize two mapping dictionaries',
    relatedLines: [3, 4],
  })

  const s_map = {}
  const t_map = {}

  steps.push({
    activeLine: 5,
    s,
    t,
    message: 'Compare character pairs',
    relatedLines: [5],
  })

  for (let i = 0; i < s.length; i++) {
    const c1 = s[i]
    const c2 = t[i]

    steps.push({
      activeLine: 5,
      i,
      c1,
      c2,
      s_map: { ...s_map },
      t_map: { ...t_map },
      message: `Pair ${i}: "${c1}" ↔ "${c2}"`,
      relatedLines: [5],
    })

    if (c1 in s_map) {
      steps.push({
        activeLine: 6,
        i,
        c1,
        c2,
        s_map: { ...s_map },
        t_map: { ...t_map },
        message: `"${c1}" already mapped`,
        relatedLines: [6, 7],
      })

      if (s_map[c1] !== c2) {
        steps.push({
          activeLine: 7,
          i,
          c1,
          c2,
          expected: s_map[c1],
          result: false,
          done: true,
          message: `Expected "${s_map[c1]}" but got "${c2}" - not isomorphic`,
          relatedLines: [7],
        })
        return steps
      }

      steps.push({
        activeLine: 7,
        i,
        c1,
        c2,
        s_map: { ...s_map },
        message: `Consistent: "${c1}" → "${c2}"`,
        relatedLines: [7],
      })
    } else {
      s_map[c1] = c2
      steps.push({
        activeLine: 9,
        i,
        c1,
        c2,
        s_map: { ...s_map },
        message: `Map "${c1}" → "${c2}"`,
        relatedLines: [9],
      })
    }

    if (c2 in t_map) {
      steps.push({
        activeLine: 10,
        i,
        c1,
        c2,
        t_map: { ...t_map },
        message: `"${c2}" already mapped`,
        relatedLines: [10, 11],
      })

      if (t_map[c2] !== c1) {
        steps.push({
          activeLine: 11,
          i,
          c1,
          c2,
          expected: t_map[c2],
          result: false,
          done: true,
          message: 'Reverse mapping conflict - not isomorphic',
          relatedLines: [11],
        })
        return steps
      }

      steps.push({
        activeLine: 11,
        i,
        c1,
        c2,
        t_map: { ...t_map },
        message: `Consistent: "${c2}" → "${c1}"`,
        relatedLines: [11],
      })
    } else {
      t_map[c2] = c1
      steps.push({
        activeLine: 13,
        i,
        c1,
        c2,
        t_map: { ...t_map },
        message: `Reverse map "${c2}" → "${c1}"`,
        relatedLines: [13],
      })
    }
  }

  steps.push({
    activeLine: 14,
    s_map: { ...s_map },
    t_map: { ...t_map },
    result: true,
    done: true,
    message: 'All characters mapped consistently - isomorphic',
    relatedLines: [14],
  })

  return steps
}

function MappingPanel({ title, map, maxItems = 5 }) {
  return (
    <motion.div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#5b21b6', marginBottom: 8 }}>
        {title}
      </div>
      {Object.keys(map).length === 0 ? (
        <div style={{ fontSize: 12, color: '#a78bfa' }}>Empty</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Object.entries(map)
            .slice(0, maxItems)
            .map(([k, v]) => (
              <div key={k} style={{ fontSize: 12, color: '#5b21b6', fontFamily: 'monospace' }}>
                "{k}" → "{v}"
              </div>
            ))}
          {Object.keys(map).length > maxItems && (
            <div style={{ fontSize: 11, color: '#a78bfa' }}>
              ...and {Object.keys(map).length - maxItems} more
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

function VisualizationPanel({ step }) {
  if (!step) return <div style={{ padding: 16 }}>Press play</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ fontSize: 12, color: '#0c4a6e', fontStyle: 'italic' }}>
          Bidirectional mapping: s→t and t→s must be consistent.
        </div>
      </div>

      {step.s && step.t && (
        <motion.div style={{ padding: 12, backgroundColor: '#f0fdf4', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46' }}>
            {step.s} vs {step.t}
          </div>
        </motion.div>
      )}

      {step.i !== undefined && step.c1 && step.c2 && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12 }}>
            Index {step.i}: "{step.c1}" ↔ "{step.c2}"
          </div>
        </motion.div>
      )}

      {step.s_map && <MappingPanel title="S→T Mapping" map={step.s_map} />}

      {step.t_map && <MappingPanel title="T→S Mapping" map={step.t_map} />}

      {step.expected && (
        <motion.div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 12, color: '#7f1d1d' }}>
            Expected: "{step.expected}", Got: "{step.c2}"
          </div>
        </motion.div>
      )}

      {step.result !== undefined && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: step.result ? '#dcfce7' : '#fee2e2',
            borderRadius: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: step.result ? '#10b981' : '#ef4444',
            }}
          >
            {step.result ? 'Isomorphic ✓' : 'Not Isomorphic ✗'}
          </div>
        </motion.div>
      )}

      {step.message && (
        <motion.div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {step.message}
        </motion.div>
      )}
    </div>
  )
}

export default function IsomorphicStringsVisualizer() {
  const [input, setInput] = useState(EXAMPLES[0]);
  const [sInput, setSInput] = useState("egg");
  const [tInput, setTInput] = useState("add");
  const { s, t, inputError } = useMemo(() => {
    try {
      const parsedS = sInput;
      const parsedT = tInput;
      return { s: parsedS, t: parsedT, inputError: '' };
    } catch (e) {
      return { s: "egg", t: "add", inputError: e.message };
    }
  }, [sInput, tInput]);
  const steps = useMemo(
    () =>
      generateSteps(s, t).map((s) => ({
        ...s,
        relatedLines: s.relatedLines ?? [s.activeLine],
      })),
    [s, t]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const dockPanels = useMemo(
    () => [
      {
        id: 'code',
        title: 'Code',
        content: <CodeTracePanel step={step} codeLines={SOLUTION_CODE} highlightedLines={connectivity.highlightedLines} onLineSelect={connectivity.handleLineSelect} onActiveLineDomChange={setActiveLineDom} />,
      },
      {
        id: 'viz',
        title: '🔗 Isomorphic Check',
        content: <VisualizationPanel step={step} />,
      },
    ],
    [step, connectivity, setActiveLineDom]
  )

  return (
    <div className="problem-shell">
      
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
      <FloatingPanel title="Controls">
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
          patternOverlayLabel="Pattern"
          showPatternOverlayToggle
        />
      </FloatingPanel>
      {showPatternOverlay && step && <PatternOverlay step={step} activeLineDom={activeLineDom} />}
    </div>
  )
}
