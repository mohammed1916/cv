import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import './Problem406Visualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { getSolutionCode } from '../../config/solutionCodeRegistry'
import { createPortal } from 'react-dom'
const SOLUTION_CODE = getSolutionCode('queue-reconstruction-by-height')

const PATTERNS = []
const LINE_PATTERN_MAP = {}

const EXAMPLES = [
  { label: 'Ex1', people: [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]], expected: [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]] },
  { label: 'Ex2', people: [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]], expected: [[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]] },
  { label: 'Simple', people: [[1,0]], expected: [[1,0]] },
]

function generateSteps(people) {
  const steps = []

  if (!people || people.length === 0) {
    steps.push({
      activeLine: 1,
      message: 'Empty input. Return empty queue.',
      phase: 'done',
      sorted: [],
      queue: [],
      currentPerson: null,
    })
    return steps
  }

  // Sort by height descending, then by k ascending
  const sorted = [...people].sort((a, b) => {
    if (a[0] !== b[0]) return b[0] - a[0]
    return a[1] - b[1]
  })

  steps.push({
    activeLine: 1,
    message: 'Start queue reconstruction.',
    phase: 'init',
    sorted: [],
    queue: [],
    currentPerson: null,
    unsorted: people,
  })

  steps.push({
    activeLine: 2,
    message: `Sort by height descending, then by k ascending.`,
    phase: 'sort',
    sorted,
    queue: [],
    currentPerson: null,
    sortedDisplay: sorted.map((p, i) => `[${p[0]},${p[1]}]`).join(', '),
  })

  let queue = []

  for (let i = 0; i < sorted.length; i++) {
    const person = sorted[i]

    steps.push({
      activeLine: 3,
      message: `Process person [${person[0]}, ${person[1]}]: insert at position ${person[1]}`,
      phase: 'process',
      sorted,
      queue: [...queue],
      currentPerson: person,
      currentIdx: person[1],
      insertPos: person[1],
    })

    // Insert at position person[1]
    queue.splice(person[1], 0, person)

    steps.push({
      activeLine: 4,
      message: `Inserted [${person[0]}, ${person[1]}] at position ${person[1]}. Queue: ${queue.map(p => `[${p[0]},${p[1]}]`).join(', ')}`,
      phase: 'inserted',
      sorted,
      queue: [...queue],
      currentPerson: person,
      insertedIdx: queue.indexOf(person),
    })
  }

  steps.push({
    activeLine: 5,
    message: `Queue reconstruction complete. Result: ${queue.map(p => `[${p[0]},${p[1]}]`).join(', ')}`,
    phase: 'done',
    sorted,
    queue: [...queue],
    currentPerson: null,
  })

  return steps
}

function QueueVisualization({ people, step }) {
  const queue = step?.queue || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Queue State</div>

      {/* Current queue */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {queue.length === 0 ? (
          <div style={{ padding: 16, textAlign: 'center', color: '#627794', fontSize: 13 }}>
            (empty queue - process people to fill)
          </div>
        ) : (
          queue.map((person, idx) => {
            const isInserted = person === step?.currentPerson
            return (
              <motion.div
                key={idx}
                style={{
                  padding: 12,
                  backgroundColor: isInserted ? '#dbeafe' : '#f1f5f9',
                  borderRadius: 6,
                  border: isInserted ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
                animate={{ scale: isInserted ? 1.05 : 1 }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', minWidth: 30 }}>#{idx}</div>
                <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    minWidth: 50,
                    textAlign: 'center',
                  }}>
                    h={person[0]}
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#ffffff',
                    borderRadius: 4,
                    fontWeight: 600,
                    fontSize: 13,
                    color: '#1e293b',
                    border: '1px solid #cbd5e1',
                    minWidth: 50,
                    textAlign: 'center',
                  }}>
                    k={person[1]}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Insertion info */}
      {step?.currentPerson && (
        <motion.div
          style={{
            padding: 12,
            backgroundColor: '#fef3c7',
            borderRadius: 6,
            border: '2px solid #f59e0b',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>Current Operation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>Person</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f', fontFamily: 'monospace' }}>
                [{step.currentPerson[0]}, {step.currentPerson[1]}]
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: 8, backgroundColor: '#ffffff', borderRadius: 4 }}>
              <div style={{ fontSize: 10, color: '#92400e' }}>Insert Position</div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#78350f' }}>
                {step.insertPos !== undefined ? step.insertPos : step.currentIdx}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <div style={{ padding: 10, backgroundColor: '#fee2e2', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#7f1d1d', fontWeight: 600 }}>Total People</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#991b1b' }}>{people.length}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#dbeafe', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#0c4a6e', fontWeight: 600 }}>Queue Size</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#027bba' }}>{queue.length}</div>
        </div>
        <div style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#065f46', fontWeight: 600 }}>Remaining</div>
          <div style={{ fontSize: 14, fontWeight: 'bold', color: '#047857' }}>{people.length - queue.length}</div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#475569' }}>{step?.message}</div>
    </div>
  )
}

export default function Problem406Visualizer() {
  const [exIdx, setExIdx] = useState(0)
  const [peopleInput, setPeopleInput] = useState(JSON.stringify(EXAMPLES[0]?.people ?? []));
  const { people, inputError } = useMemo(() => {
    try {
      const parsedPeople = JSON.parse(peopleInput); if (!Array.isArray(parsedPeople)) throw new Error('people must be an array');
      return { people: parsedPeople, inputError: '' };
    } catch (e) {
      return { people: EXAMPLES[exIdx]?.people ?? '', inputError: e.message };
    }
  }, [peopleInput]);
  const example = EXAMPLES[exIdx]

  const steps = useMemo(
    () =>
      generateSteps(people).map((current) => ({
        ...current,
        relatedLines: current.relatedLines ?? (current.activeLine != null ? [current.activeLine] : []),
      })),
    [example]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } =
    usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null

  const applyEx = useCallback((i) => { setExIdx(i); setPeopleInput(JSON.stringify(EXAMPLES[i].people)); handleReset(); }, [handleReset]);

  const connectivity = useCodeVisualConnectivity({
    steps,
    stepIndex,
    onStepJump: setStepIndex,
  })

  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '👥 Queue Reconstruction', dockMode: 'split-right' },
  ], [])
  const panelContents = useMemo(() => ({
    code: (<div style={{ position: "relative" }}>
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, height: '100%' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Examples</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXAMPLES.map((e, idx) => (
                <button
                  key={e.label}
                  onClick={() => applyEx(idx)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: exIdx === idx ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    fontSize: 12,
                    backgroundColor: exIdx === idx ? '#fef3c7' : '#f1f5f9',
                    color: exIdx === idx ? '#92400e' : '#334155',
                    fontWeight: exIdx === idx ? '600' : '400',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <QueueVisualization people={people} step={step} />
        </div>),
  }), [step, SOLUTION_CODE, connectivity, setActiveLineDom, example, exIdx, applyEx])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
        <ManualInputPanel
          fields={[{"key":"people","label":"people","type":"array"}]}
          values={{ people: peopleInput }}
          onChange={(k, v) => { if (k === 'people') setPeopleInput(v); handleReset() }}
          examples={EXAMPLES}
          activeLabel={EXAMPLES[exIdx]?.label}
          applyExample={(e) => applyEx(EXAMPLES.indexOf(e))}
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
