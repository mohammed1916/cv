import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LuminoDockPanel from '../../components/LuminoDockPanel'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import CodePatternAnnotations from '../../components/CodePatternAnnotations'
import PatternLegend from '../../components/PatternLegend'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { getExamplesOr } from '../../config/examplesRegistry'
import './DistributeCandiesVisualizer.css'
import ManualInputPanel from '../../components/shared/ManualInputPanel'
import { createPortal } from 'react-dom'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def distributeCandies(self, candies: List[int]) -> int:' },
  { line: 3, text: '        n = len(candies)' },
  { line: 4, text: '        alice_size = n // 2' },
  { line: 5, text: '        ' },
  { line: 6, text: '        alice_set = set()' },
  { line: 7, text: '        ' },
  { line: 8, text: '        for i in range(alice_size):' },
  { line: 9, text: '            alice_set.add(candies[i])' },
  { line: 10, text: '        ' },
  { line: 11, text: '        unique_count = len(alice_set)' },
  { line: 12, text: '        ' },
  { line: 13, text: '        return min(unique_count, alice_size)' },
]

const PATTERNS = ['setup', 'iteration', 'track_unique', 'calculate', 'result']
const LINE_PATTERN_MAP = {
  3: 'setup',
  4: 'setup',
  8: 'iteration',
  9: 'track_unique',
  11: 'calculate',
  13: 'result',
}

const CANDY_COLORS = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd',
  '#00d2d3', '#ff6348', '#a29bfe', '#74b9ff', '#81ecec',
]

function getCandyColor(type) {
  return CANDY_COLORS[type % CANDY_COLORS.length]
}

function generateSteps(candies) {
  const steps = []

  if (!Array.isArray(candies) || candies.length === 0) {
    steps.push({
      phase: 'result',
      activeLine: 13,
      relatedLines: [13],
      message: 'Invalid input.',
      result: 0,
      done: true,
    })
    return steps
  }

  const n = candies.length
  const alice_size = Math.floor(n / 2)

  steps.push({
    phase: 'setup',
    activeLine: 3,
    relatedLines: [3, 4],
    message: `Array length: ${n}, Alice gets: ${alice_size} candies`,
    n,
    alice_size,
    processedIndex: -1,
  })

  const alice_set = new Set()

  for (let i = 0; i < alice_size; i++) {
    const candy = candies[i]

    steps.push({
      phase: 'iteration',
      activeLine: 8,
      relatedLines: [8],
      message: `Processing position ${i}: candy type ${candy}`,
      n,
      alice_size,
      processedIndex: i,
      currentCandy: candy,
      unique_count: alice_set.size,
    })

    if (!alice_set.has(candy)) {
      steps.push({
        phase: 'track_unique',
        activeLine: 9,
        relatedLines: [9],
        message: `New unique type: ${candy}. Added to Alice's collection.`,
        n,
        alice_size,
        processedIndex: i,
        currentCandy: candy,
        isNewUnique: true,
        unique_count: alice_set.size + 1,
      })
      alice_set.add(candy)
    } else {
      steps.push({
        phase: 'track_unique',
        activeLine: 9,
        relatedLines: [9],
        message: `Type ${candy} already in collection. Skip.`,
        n,
        alice_size,
        processedIndex: i,
        currentCandy: candy,
        isNewUnique: false,
        unique_count: alice_set.size,
      })
    }
  }

  const unique_count = alice_set.size

  steps.push({
    phase: 'calculate',
    activeLine: 11,
    relatedLines: [11],
    message: `Total unique types in Alice's candies: ${unique_count}`,
    n,
    alice_size,
    processedIndex: alice_size - 1,
    unique_count,
  })

  const result = Math.min(unique_count, alice_size)

  steps.push({
    phase: 'result',
    activeLine: 13,
    relatedLines: [13],
    message: `Maximum unique candies: min(${unique_count}, ${alice_size}) = ${result}`,
    n,
    alice_size,
    unique_count,
    result,
    done: true,
  })

  return steps
}

function CandyArray({ candies, processedIndex, alice_size }) {
  const aliceCount = Math.floor(candies.length / 2)

  return (
    <div style={{ padding: 16, backgroundColor: 'var(--surface2)', borderRadius: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 12 }}>Candy Distribution</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {candies.map((candy, idx) => {
          const isAlice = idx < aliceCount
          const isProcessed = idx <= (processedIndex ?? -1)

          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.02 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 4,
                backgroundColor: getCandyColor(candy),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#757575',
                border: `2px solid ${isAlice ? '#22c55e' : 'var(--text-muted)'}`,
                boxShadow: isProcessed ? '0 0 8px rgba(34, 197, 94, 0.5)' : 'none',
                cursor: 'default',
              }}
              title={`Type: ${candy}, Owner: ${isAlice ? 'Alice' : 'Bob'}`}
            >
              {candy}
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#5a779b' }}>
        <div>
          <span style={{ color: '#178740', fontWeight: 600 }}>▪</span> Alice's portion (0-{aliceCount - 1})
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>▪</span> Bob's portion ({aliceCount}-{candies.length - 1})
        </div>
      </div>
    </div>
  )
}

function VisualizationPanel({ step, applyExample, examples, candies }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: '100%', overflow: 'auto' }}>
      {examples?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 8 }}>Examples</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => applyExample(ex)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 11,
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                }}
              >
                {ex.label || `Example ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <CandyArray candies={candies} processedIndex={step?.processedIndex} alice_size={step?.alice_size} />

      {step?.unique_count !== undefined && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <motion.div
            style={{
              padding: 12,
              backgroundColor: 'var(--surface2)',
              borderRadius: 6,
              border: '2px solid #22c55e',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#178740', marginBottom: 6 }}>Unique Types</div>
            <div style={{ fontSize: 18, color: '#178740', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.unique_count}
            </div>
          </motion.div>
          <motion.div
            style={{
              padding: 12,
              backgroundColor: 'var(--surface2)',
              borderRadius: 6,
              border: '2px solid #38bdf8',
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#067db1', marginBottom: 6 }}>Max Unique (n/2)</div>
            <div style={{ fontSize: 18, color: '#067db1', fontFamily: 'monospace', fontWeight: 700 }}>
              {step.alice_size}
            </div>
          </motion.div>
        </div>
      )}

      {step?.result !== undefined && (
        <motion.div
          style={{
            padding: 16,
            backgroundColor: 'var(--surface2)',
            borderRadius: 6,
            border: '2px solid',
            borderColor: '#22c55e',
            textAlign: 'center',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Maximum Unique Candies</div>
          <div
            style={{
              fontSize: 24,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              color: '#178740',
            }}
          >
            {step.result}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function DistributeCandiesVisualizer() {
  const examples = useMemo(() => getExamplesOr('distribute-candies', []), [])
  const [candiesInput, setCandiesInput] = useState('[1,1,2,2,3,3]')

  const { candies, inputError } = useMemo(() => {
    try {
      const c = JSON.parse(candiesInput)
      if (!Array.isArray(c)) throw new Error('Input must be array')
      if (!c.every((v) => typeof v === 'number' && v >= 1)) throw new Error('Values must be positive integers')
      return { candies: c, inputError: '' }
    } catch (e) {
      return { candies: [], inputError: e.message }
    }
  }, [candiesInput])

  const steps = useMemo(() => generateSteps(candies), [candies])

  const {
    stepIndex,
    setStepIndex,
    stepForward,
    stepBack,
    togglePlay,
    handleReset,
    isPlaying,
    speed,
    setSpeed,
    isDone,
  } = usePlaybackState(steps.length)

  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()

  const applyExample = useCallback(
    (ex) => {
      setCandiesInput(JSON.stringify(ex.candies || ex))
      handleReset()
    },
    [handleReset]
  )

  const panelConfigs = useMemo(() => [
    { id: 'code', title: 'Code' },
    { id: 'viz', title: '🍬 Distribute Candies', dockMode: 'split-right' },
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
    viz: (<div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#5577a4', marginBottom: 6 }}>Candies (JSON array)</div>
              <textarea
                value={candiesInput}
                onChange={(e) => {
                  setCandiesInput(e.target.value)
                  handleReset()
                }}
                style={{
                  width: '100%',
                  height: 60,
                  padding: '8px',
                  borderRadius: 4,
                  border: inputError ? '2px solid #f87171' : '1px solid var(--text-muted)',
                  backgroundColor: 'var(--surface2)',
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  fontSize: 12,
                  resize: 'vertical',
                }}
              />
              {inputError && <div style={{ color: '#ea0c0c', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
            </div>
            <VisualizationPanel step={step} applyExample={applyExample} examples={examples} candies={candies} />
          </div>),
  }), [step, connectivity, setActiveLineDom, candiesInput, inputError, examples, applyExample, handleReset, showPatternOverlay, activeLineDom, candies])
  const [panelDivs, setPanelDivs] = useState(null)
  const handlePanelReady = useCallback((divs) => setPanelDivs(divs), [])

  return (
    <div className="problem-shell">
      <ManualInputPanel
        fields={[{"key":"candies","label":"candies","type":"array"}]}
        values={{ candies: candiesInput }}
        onChange={(k, v) => { if (k === 'candies') setCandiesInput(v); handleReset() }}
        examples={examples}
        applyExample={applyExample}
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
        {showPatternOverlay && <PatternLegend currentPhase={step?.phase} usedPatterns={PATTERNS} />}
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
      </FloatingPanel>
    </div>
  )
}
