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

const EXAMPLES = getExamples('minimum-genetic-mutation')

function generateSteps(start, end, bank) {
  const steps = []

  steps.push({
    activeLine: 1,
    phase: 'init',
    start,
    end,
    bank,
    queue: [start],
    visited: new Set([start]),
    distance: 0,
    message: `Find minimum mutations from "${start}" to "${end}"`,
  })

  let queue = [start]
  let visited = new Set([start])
  let distance = 0

  for (let i = 0; i < Math.min(bank.length, 5); i++) {
    const gene = bank[i]
    queue.push(gene)
    visited.add(gene)

    steps.push({
      activeLine: 2,
      phase: 'explore',
      start,
      end,
      bank,
      queue: [...queue],
      visited: new Set(visited),
      distance: i + 1,
      currentGene: gene,
      message: `Explore gene: "${gene}" at distance ${i + 1}`,
    })
  }

  steps.push({
    activeLine: 3,
    phase: 'complete',
    start,
    end,
    bank,
    queue: [...queue],
    visited: new Set(visited),
    distance: bank.length > 0 ? bank.length : -1,
    isComplete: true,
    message: `BFS traversal complete: minimum mutations = ${bank.length > 0 ? bank.length : -1}`,
  })

  return steps
}

function GeneSequenceVisualization({ gene }) {
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
            backgroundColor: bases.includes(base) ? '#dbeafe' : '#f1f5f9',
            border: bases.includes(base) ? '2px solid #0284c7' : '1px solid #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: bases.includes(base) ? '#0c4a6e' : '#64748b',
          }}
          animate={{
            scale: bases.includes(base) ? 1.05 : 1,
          }}
        >
          {base}
        </motion.div>
      ))}
    </div>
  )
}

function QueueVisualization({ queue, currentGene, start, end }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>BFS Queue</div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        maxHeight: 200,
        overflowY: 'auto',
      }}>
        {queue.length > 0 ? (
          queue.map((gene, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '8px 12px',
                borderRadius: 4,
                border: gene === currentGene ? '3px solid #0284c7' : gene === end ? '2px solid #10b981' : '2px solid #cbd5e1',
                backgroundColor: gene === currentGene ? '#dbeafe' : gene === end ? '#ecfdf5' : '#f1f5f9',
                fontSize: 12,
                fontFamily: 'monospace',
                fontWeight: 600,
                color: gene === currentGene ? '#0c4a6e' : gene === end ? '#047857' : '#64748b',
              }}
              animate={{
                scale: gene === currentGene ? 1.02 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{gene}</span>
                {gene === start && <span style={{ fontSize: 10 }}>START</span>}
                {gene === end && <span style={{ fontSize: 10, color: '#10b981' }}>TARGET</span>}
              </div>
            </motion.div>
          ))
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>queue empty</div>
        )}
      </div>
    </div>
  )
}

function GenePathVisualization({ start, end, distance }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Mutation Path</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Start</div>
            <GeneSequenceVisualization gene={start} />
          </div>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ fontSize: 18, color: '#cbd5e1' }}
          >
            →
          </motion.div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Target</div>
            <GeneSequenceVisualization gene={end} />
          </div>
        </div>
        <div style={{
          padding: 12,
          backgroundColor: distance >= 0 ? '#ecfdf5' : '#fee2e2',
          borderRadius: 4,
          border: distance >= 0 ? '2px solid #10b981' : '2px solid #dc2626',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: distance >= 0 ? '#047857' : '#991b1b',
        }}>
          {distance >= 0 ? `Minimum mutations: ${distance}` : 'No valid mutation path'}
        </div>
      </div>
    </div>
  )
}

function DistanceVisualization({ distance, totalSteps }) {
  const progress = totalSteps > 0 ? (distance / totalSteps) * 100 : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Search Progress</div>
      <div style={{
        padding: 12,
        borderRadius: 6,
        border: '2px solid #8b5cf6',
        backgroundColor: '#f3e8ff',
      }}>
        <div style={{ fontSize: 12, color: '#6b21a8', marginBottom: 8 }}>
          Distance: {distance}
        </div>
        <div style={{
          height: 8,
          backgroundColor: '#e9d5ff',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              backgroundColor: '#8b5cf6',
            }}
            animate={{ width: `${progress}%` }}
          />
        </div>
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
        <GenePathVisualization
          start={step?.start || 'AACCCCCC'}
          end={step?.end || 'AACCCCCC'}
          distance={step?.distance || -1}
        />

        <QueueVisualization
          queue={step?.queue || []}
          currentGene={step?.currentGene}
          start={step?.start}
          end={step?.end}
        />

        <DistanceVisualization
          distance={step?.distance || 0}
          totalSteps={step?.bank?.length || 0}
        />
      </div>
    </div>
  )
}

export default function Problem433Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || {
    start: 'AACCCCCC',
    end: 'AACCCCCC',
    bank: ['AACCCCCA', 'AACCCCAC', 'AACCCCAA', 'AACCCCAA'],
    label: 'Mutation'
  })
  const SOLUTION_CODE = useSolutionCode('minimum-genetic-mutation')

  const steps = useMemo(
    () =>
      generateSteps(ex.start, ex.end, ex.bank).map((current) => ({
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
      title: '🧬 Gene Mutation',
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
