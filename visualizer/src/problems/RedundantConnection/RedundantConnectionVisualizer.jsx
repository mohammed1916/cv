import { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import DockableWorkspace from '../../components/shared/DockableWorkspace'
import FloatingPanel from '../../components/shared/FloatingPanel'
import CodeTracePanel from '../../components/CodeTracePanel'
import PlaybackControls from '../../components/PlaybackControls'
import PatternOverlay from '../../components/PatternOverlay'
import { usePlaybackState } from '../../hooks/usePlaybackState'
import { usePatternOverlay } from '../../hooks/usePatternOverlay'
import { useCodeVisualConnectivity } from '../../hooks/useCodeVisualConnectivity'
import { useSolutionCode } from '../../hooks/useSolutionCode'
import { getExamples } from '../../config/examplesRegistry'
import './RedundantConnectionVisualizer.css'

const SOLUTION_CODE = [
  { line: 1, text: 'class Solution:' },
  { line: 2, text: '    def findRedundantConnection(self, edges):' },
  { line: 3, text: '        parent = [i for i in range(len(edges)+1)]' },
  { line: 4, text: '        rank = [1] * (len(edges)+1)' },
  { line: 5, text: '        def find(x):' },
  { line: 6, text: '            while x != parent[x]: x = parent[x]' },
  { line: 7, text: '            return x' },
  { line: 8, text: '        def union(a, b):' },
  { line: 9, text: '            ra, rb = find(a), find(b)' },
  { line: 10, text: '            if ra == rb: return False' },
  { line: 11, text: '            if rank[ra] < rank[rb]: parent[ra] = rb' },
  { line: 12, text: '            elif rank[ra] > rank[rb]: parent[rb] = ra' },
  { line: 13, text: '            else: parent[rb] = ra; rank[ra] += 1' },
  { line: 14, text: '            return True' },
  { line: 15, text: '        for u, v in edges:' },
  { line: 16, text: '            if not union(u, v): return [u, v]' },
]

function parseEdges(input) {
  const parsed = JSON.parse(input)
  if (!Array.isArray(parsed)) throw new Error('edges must be 2D array')
  return parsed.map((e) => [Number(e[0]), Number(e[1])])
}

function generateSteps(edges) {
  const n = edges.length
  const parent = Array.from({ length: n + 1 }, (_, i) => i)
  const rank = Array(n + 1).fill(1)
  const steps = [{ phase: 'init', activeLine: 4, edge: null, parent: [...parent], rank: [...rank], roots: [], redundant: null, message: 'Initialize parent and rank arrays.' }]

  const find = (x) => {
    while (x !== parent[x]) x = parent[x]
    return x
  }

  for (const [u, v] of edges) {
    const ru = find(u)
    const rv = find(v)
    steps.push({
      phase: 'check',
      activeLine: 10,
      edge: [u, v],
      parent: [...parent],
      rank: [...rank],
      roots: [ru, rv],
      redundant: null,
      message: `Edge [${u}, ${v}]: roots are ${ru} and ${rv}.`,
    })
    if (ru === rv) {
      steps.push({
        phase: 'done',
        activeLine: 16,
        edge: [u, v],
        parent: [...parent],
        rank: [...rank],
        roots: [ru, rv],
        redundant: [u, v],
        message: `Cycle found. Redundant edge is [${u}, ${v}].`,
      })
      return steps
    }
    if (rank[ru] < rank[rv]) parent[ru] = rv
    else if (rank[ru] > rank[rv]) parent[rv] = ru
    else {
      parent[rv] = ru
      rank[ru] += 1
    }
    steps.push({
      phase: 'union',
      activeLine: 14,
      edge: [u, v],
      parent: [...parent],
      rank: [...rank],
      roots: [ru, rv],
      redundant: null,
      message: `Union ${u} and ${v}.`,
    })
  }

  steps.push({ phase: 'done', activeLine: 16, edge: null, parent: [...parent], rank: [...rank], roots: [], redundant: null, message: 'No redundant edge found.' })
  return steps
}

const EXAMPLES = getExamples('redundant-connection')

export default function RedundantConnectionVisualizer() {
  const [edgesInput, setEdgesInput] = useState('[[1,2],[1,3],[2,3]]')
  const SOLUTION_CODE = useSolutionCode('redundant-connection')
  const { edges, inputError } = useMemo(() => {
    try {
      return { edges: parseEdges(edgesInput), inputError: '' }
    } catch (e) {
      return { edges: [[1, 2], [1, 3], [2, 3]], inputError: e.message || 'Invalid input' }
    }
  }, [edgesInput])

  const steps = useMemo(() => generateSteps(edges), [edges])
  const { stepIndex, setStepIndex, stepForward, stepBack, togglePlay, handleReset, isPlaying, speed, setSpeed, isDone } = usePlaybackState(steps.length)
  const step = stepIndex >= 0 ? steps[stepIndex] : null
  const { showPatternOverlay, setShowPatternOverlay, activeLineDom, setActiveLineDom } = usePatternOverlay()
  const connectivity = useCodeVisualConnectivity({ steps, stepIndex, onStepJump: setStepIndex })

  const applyExample = useCallback((ex) => { setEdgesInput(JSON.stringify(ex.edges)); handleReset() }, [handleReset])
  const nodes = useMemo(() => Array.from(new Set(edges.flat())), [edges])

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
      title: '🔗 Union-Find',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: 16, overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {EXAMPLES.map(ex => (
              <button key={ex.label} onClick={() => applyExample(ex)} style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 12, backgroundColor: '#f1f5f9' }}>
                {ex.label}
              </button>
            ))}
          </div>
          <div>
            <input style={{ width: '100%', padding: '8px', borderRadius: 4, border: inputError ? '2px solid #ef4444' : '1px solid #cbd5e1', fontSize: 12, fontFamily: 'monospace' }} value={edgesInput} onChange={e => { setEdgesInput(e.target.value); handleReset() }} />
            {inputError && <div style={{ color: '#991b1b', fontSize: 11, marginTop: 4 }}>{inputError}</div>}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Edges</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {edges.map(([u, v], i) => (
              <motion.div key={`${u}-${v}-${i}`} animate={{ scale: step?.edge?.[0] === u && step?.edge?.[1] === v ? 1.2 : 1 }} style={{
                padding: '8px 12px', borderRadius: 4,
                backgroundColor: step?.edge?.[0] === u && step?.edge?.[1] === v ? '#fbbf24' : '#f3f4f6',
                border: step?.edge?.[0] === u && step?.edge?.[1] === v ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                fontSize: 12, fontWeight: 'bold', color: '#1e293b'
              }}>
                [{u}, {v}]
              </motion.div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>Node State</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 6 }}>
            {nodes.map(n => (
              <div key={n} style={{ padding: 8, backgroundColor: '#f8fafc', borderRadius: 4, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Node {n}</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#1e293b' }}>p:{step?.parent?.[n] ?? n}</div>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#0ea5e9' }}>r:{step?.rank?.[n] ?? 1}</div>
              </div>
            ))}
          </div>

          {step?.redundant && (
            <div style={{ padding: 12, backgroundColor: '#fee2e2', borderRadius: 6, border: '2px solid #fecaca', textAlign: 'center', fontWeight: 600, color: '#991b1b' }}>
              ⚠️ Redundant edge: [{step.redundant[0]}, {step.redundant[1]}]
            </div>
          )}
        </div>
      ),
    },
  ], [step, SOLUTION_CODE, connectivity, setActiveLineDom, edges, edgesInput, inputError, applyExample, nodes])

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
