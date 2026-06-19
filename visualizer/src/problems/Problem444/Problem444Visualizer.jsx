import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
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
import './Problem444Visualizer.css'

const EXAMPLES = getExamples('sequence-reconstruction')

function generateSteps(org, seqs) {
  const steps = []

  if (!org || org.length === 0 || !seqs || seqs.length === 0) {
    steps.push({
      activeLine: 1,
      phase: 'init',
      org,
      seqs,
      relationships: [],
      valid: false,
      message: 'Invalid input',
    })
    return steps
  }

  steps.push({
    activeLine: 1,
    phase: 'init',
    org: [...org],
    seqs: seqs.map(s => [...s]),
    relationships: [],
    valid: true,
    message: `Verify if sequences can reconstruct org [${org.join(', ')}]`,
  })

  let relationships = []
  let valid = true

  for (let i = 0; i < seqs.length; i++) {
    const seq = seqs[i]

    steps.push({
      activeLine: 2,
      phase: 'check_sequence',
      org: [...org],
      seqs: seqs.map(s => [...s]),
      relationships: [...relationships],
      valid,
      currentSeq: i,
      message: `Check sequence ${i}: [${seq.join(', ')}]`,
    })

    if (!isSubsequence(org, seq)) {
      valid = false

      steps.push({
        activeLine: 3,
        phase: 'invalid_subseq',
        org: [...org],
        seqs: seqs.map(s => [...s]),
        relationships: [...relationships],
        valid,
        currentSeq: i,
        message: `Sequence ${i} is not a subsequence of org!`,
      })

      break
    }

    for (let j = 0; j < seq.length - 1; j++) {
      const [a, b] = [seq[j], seq[j + 1]]
      const rel = `${a} -> ${b}`

      if (!relationships.includes(rel)) {
        relationships.push(rel)
      }

      steps.push({
        activeLine: 4,
        phase: 'add_relation',
        org: [...org],
        seqs: seqs.map(s => [...s]),
        relationships: [...relationships],
        valid,
        currentSeq: i,
        currentRel: rel,
        message: `Extract relation: ${a} -> ${b}`,
      })
    }
  }

  if (valid) {
    const reconstructed = reconstructSequence(relationships)

    steps.push({
      activeLine: 5,
      phase: 'check_unique',
      org: [...org],
      seqs: seqs.map(s => [...s]),
      relationships: [...relationships],
      valid,
      message: `Check if reconstruction is unique`,
    })

    if (JSON.stringify(reconstructed) === JSON.stringify(org)) {
      steps.push({
        activeLine: 6,
        phase: 'complete',
        org: [...org],
        seqs: seqs.map(s => [...s]),
        relationships: [...relationships],
        valid: true,
        isComplete: true,
        message: `Valid! Sequences uniquely reconstruct org`,
      })
    } else {
      valid = false

      steps.push({
        activeLine: 7,
        phase: 'not_unique',
        org: [...org],
        seqs: seqs.map(s => [...s]),
        relationships: [...relationships],
        valid: false,
        isComplete: true,
        message: `Invalid! Sequences don't uniquely reconstruct org`,
      })
    }
  }

  return steps
}

function isSubsequence(org, seq) {
  let j = 0
  for (let i = 0; i < org.length && j < seq.length; i++) {
    if (org[i] === seq[j]) j++
  }
  return j === seq.length
}

function reconstructSequence(relationships) {
  const result = []
  const inDegree = {}
  const adj = {}

  // Build adjacency list and in-degree map
  for (const rel of relationships) {
    const [a, b] = rel.split(' -> ').map(Number)
    if (!adj[a]) adj[a] = []
    adj[a].push(b)
    inDegree[b] = (inDegree[b] || 0) + 1
    if (!inDegree[a]) inDegree[a] = 0
  }

  // Find topological sort
  const queue = Object.keys(inDegree).filter(k => inDegree[k] === 0).map(Number)

  while (queue.length > 0) {
    if (queue.length !== 1) break // Not unique
    const node = queue.shift()
    result.push(node)

    if (adj[node]) {
      for (const neighbor of adj[node]) {
        inDegree[neighbor]--
        if (inDegree[neighbor] === 0) queue.push(neighbor)
      }
    }
  }

  return result
}

function SequencesVisualization({ seqs, currentSeq }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Input Sequences</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 100,
      }}>
        {seqs && seqs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {seqs.map((seq, idx) => {
              const isActive = idx === currentSeq

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: isActive ? '#fef2f2' : '#f8fafc',
                    borderRadius: 6,
                    border: isActive ? '2px solid #dc2626' : '2px solid #cbd5e1',
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                  animate={{ scale: isActive ? 1.02 : 1 }}
                >
                  {seq.map((num, j) => (
                    <div
                      key={j}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        borderRadius: 4,
                        border: '1px solid #0284c7',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#0c4a6e',
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No sequences</div>
        )}
      </div>
    </div>
  )
}

function OrgSequenceVisualization({ org }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Original Sequence</div>
      <div style={{
        padding: 12,
        backgroundColor: '#ecfdf5',
        borderRadius: 8,
        border: '2px solid #10b981',
      }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {org && org.map((num, idx) => (
            <motion.div
              key={idx}
              style={{
                padding: '6px 10px',
                backgroundColor: '#d1fae5',
                borderRadius: 4,
                border: '2px solid #10b981',
                fontSize: 12,
                fontWeight: 600,
                color: '#047857',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              {num}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RelationshipsVisualization({ relationships, currentRel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Extracted Relations</div>
      <div style={{
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        border: '2px solid #cbd5e1',
        minHeight: 80,
      }}>
        {relationships && relationships.length > 0 ? (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {relationships.map((rel, idx) => {
              const isCurrent = rel === currentRel

              return (
                <motion.div
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    backgroundColor: isCurrent ? '#fcd34d' : '#dbeafe',
                    borderRadius: 4,
                    border: isCurrent ? '2px solid #f59e0b' : '2px solid #0284c7',
                    fontSize: 11,
                    fontWeight: 600,
                    color: isCurrent ? '#b45309' : '#0c4a6e',
                    fontFamily: 'monospace',
                  }}
                  animate={{ scale: isCurrent ? 1.1 : 1 }}
                >
                  {rel}
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: 12 }}>No relations yet</div>
        )}
      </div>
    </div>
  )
}

function ResultVisualization({ valid }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Result</div>
      <div style={{
        padding: 12,
        backgroundColor: valid ? '#ecfdf5' : '#fee2e2',
        borderRadius: 8,
        border: valid ? '2px solid #10b981' : '2px solid #ef4444',
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: 700,
          color: valid ? '#047857' : '#dc2626',
          textAlign: 'center',
        }}>
          {valid ? 'VALID' : 'INVALID'}
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

      <OrgSequenceVisualization
        org={step?.org}
      />

      <SequencesVisualization
        seqs={step?.seqs}
        currentSeq={step?.currentSeq}
      />

      <RelationshipsVisualization
        relationships={step?.relationships}
        currentRel={step?.currentRel}
      />

      <ResultVisualization
        valid={step?.valid}
      />
    </div>
  )
}

export default function Problem444Visualizer() {
  const [ex, setEx] = useState(EXAMPLES[0] || { org: [1, 2, 3], seqs: [[1, 2], [1, 3]], label: 'Example 1' })
  const SOLUTION_CODE = useSolutionCode('sequence-reconstruction')

  const steps = useMemo(
    () =>
      generateSteps(ex.org, ex.seqs).map((current) => ({
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
      title: '🔗 Graph',
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
