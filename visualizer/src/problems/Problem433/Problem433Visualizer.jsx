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
import './Problem433Visualizer.css'

const EXAMPLES = getExamples('minimum-genetic-mutation') || [
  { label: 'Example 1', start: 'AACCCCCC', end: 'AACCCCTA', bank: ['AACCCCTA'] },
]

function generateSteps(start, end, bank) {
  const steps = []

  steps.push({ activeLine: 1, message: `Find minimum mutations from "${start}" to "${end}"`, start, end, bank, queue: [start], visited: new Set([start]), distance: 0 })

  if (!bank || bank.length === 0) {
    steps.push({ activeLine: 2, message: 'Bank is empty → impossible (-1)', done: true, start, end, bank, result: -1 })
    return steps
  }

  if (start === end) {
    steps.push({ activeLine: 3, message: `Start equals end → 0 mutations needed`, done: true, start, end, bank, result: 0 })
    return steps
  }

  steps.push({ activeLine: 4, message: 'Initialize BFS queue', queue: [start], visited: new Set([start]), distance: 0 })

  let queue = [start]
  let visited = new Set([start])
  const bankSet = new Set(bank)

  steps.push({ activeLine: 5, message: 'Convert bank to set for O(1) lookup', bankSet: new Set(bank) })

  let distance = 0
  const bases = ['A', 'C', 'G', 'T']

  for (let iter = 0; iter < Math.min(5, queue.length + bank.length); iter++) {
    steps.push({ activeLine: 6, message: `BFS iteration ${iter}: queue has ${queue.length} genes`, queue: [...queue], visited: new Set(visited), distance })

    if (queue[iter]) {
      const current = queue[iter]
      steps.push({ activeLine: 7, message: `Dequeue: "${current}"`, current, queue: [...queue], visited: new Set(visited), distance })

      if (current === end) {
        steps.push({ activeLine: 8, message: `Found end gene! Distance: ${distance}`, done: true, start, end, bank, result: distance })
        return steps
      }

      let nextGenes = []
      for (let i = 0; i < current.length && nextGenes.length < 3; i++) {
        for (const base of bases) {
          if (base === current[i]) continue
          const next = current.slice(0, i) + base + current.slice(i + 1)
          if (bankSet.has(next) && !visited.has(next)) {
            nextGenes.push(next)
            visited.add(next)
            queue.push(next)
          }
        }
      }

      steps.push({ activeLine: 9, message: `Generate neighbors by flipping positions: found ${nextGenes.length} valid next genes`, nextGenes, current, queue: [...queue], visited: new Set(visited), distance })
    }

    distance++
  }

  steps.push({ activeLine: 10, message: `BFS complete. End not found → impossible (-1)`, done: true, start, end, bank, result: -1 })
  return steps
}

function GeneSequenceVisualization({ gene, highlight }) {
  const bases = ['A', 'T', 'G', 'C']
  const geneArray = gene ? gene.split('') : []

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: 12,
      backgroundColor: '#f1f5f9',
      borderRadius: 8,
      border: '2px solid #cbd5e1',
    }}>
      {geneArray.map((base, idx) => (
        <motion.div
          key={idx}
          style={{
            width: 36,
            height: 36,
            borderRadius: 4,
            backgroundColor: highlight && highlight === idx ? '#dbeafe' : bases.includes(base) ? '#f3f4f6' : '#f1f5f9',
            border: highlight && highlight === idx ? '3px solid #0284c7' : bases.includes(base) ? '2px solid #cbd5e1' : '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: highlight && highlight === idx ? '#0c4a6e' : bases.includes(base) ? '#1e293b' : '#64748b',
          }}
          animate={{
            scale: highlight && highlight === idx ? 1.15 : 1,
          }}
        >
          {base}
        </motion.div>
      ))}
    </div>
  )
}

function VisualizationPanel({ step, applyEx }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, overflow: 'auto' }}>
      {step && (
        <div style={{ padding: 12, backgroundColor: '#dbeafe', borderRadius: 6, border: '2px solid #0284c7', fontSize: 12, color: '#0c4a6e' }}>
          {step.message}
        </div>
      )}

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

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Start Gene</div>
        <GeneSequenceVisualization gene={step?.start} />
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>End Gene (Target)</div>
        <GeneSequenceVisualization gene={step?.end} />
      </div>

      {step?.current && (
        <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 6, border: '2px solid #8b5cf6' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b21a8', marginBottom: 6 }}>Current Gene (Dequeued)</div>
          <GeneSequenceVisualization gene={step.current} />
        </div>
      )}

      {step?.nextGenes && step.nextGenes.length > 0 && (
        <div style={{ padding: 12, backgroundColor: '#ecfdf5', borderRadius: 6, border: '2px solid #10b981' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 8 }}>Generated Neighbors</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {step.nextGenes.map((g, i) => (
              <GeneSequenceVisualization key={i} gene={g} />
            ))}
          </div>
        </div>
      )}

      {step?.queue && (
        <div style={{ padding: 12, backgroundColor: '#f0f9ff', borderRadius: 6, border: '2px solid #0284c7' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0c4a6e', marginBottom: 8 }}>Queue (next to explore)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {step.queue.slice(0, 3).map((q, i) => (
              <div key={i} style={{ fontFamily: 'monospace', fontSize: 11, color: '#075985' }}>
                {i}. {q}
              </div>
            ))}
            {step.queue.length > 3 && <div style={{ fontSize: 11, color: '#64748b' }}>... and {step.queue.length - 3} more</div>}
          </div>
        </div>
      )}

      {step?.distance !== undefined && (
        <div style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 6, border: '2px solid #f59e0b' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>Distance: {step.distance}</div>
        </div>
      )}

      {step?.result !== undefined && (
        <div style={{ padding: 12, backgroundColor: step.result === -1 ? '#fee2e2' : '#dcfce7', borderRadius: 6, border: `2px solid ${step.result === -1 ? '#ef4444' : '#22c55e'}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: step.result === -1 ? '#dc2626' : '#16a34a' }}>
            Result: {step.result === -1 ? 'Impossible (-1)' : `${step.result} mutations`}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Problem433Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0])
  const SOLUTION_CODE = useSolutionCode('minimum-genetic-mutation')

  const steps = useMemo(
    () => generateSteps(ex.start, ex.end, ex.bank).map(c => ({ ...c, relatedLines: c.relatedLines ?? (c.activeLine != null ? [c.activeLine] : []) })),
    [ex]
  )

  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const applyEx = useCallback((e) => { setEx(e); handleReset(); }, [handleReset])

  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })
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
      title: '🧬 Gene Mutation',
      content: <VisualizationPanel step={step} applyEx={applyEx} />,
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, applyEx])

  return (
    <div className="problem-shell">
      <DockableWorkspace panels={dockPanels} initialLayout={{ rows: [['code', 'viz']], minimized: [] }} />
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
