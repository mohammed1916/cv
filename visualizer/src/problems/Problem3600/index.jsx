import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Candidates', description: 'List every strength and doubled strength as a possible answer.' },
    { id: 'try', label: 'Test threshold', description: 'Check whether a spanning tree can keep every edge at or above this stability within k upgrades.' },
    { id: 'done', label: 'Complete', description: 'Report the largest feasible stability, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges as [u, v, s, must] and k (JSON)',
  url: 'https://leetcode.com/problems/maximize-spanning-tree-stability-with-upgrades/',
  complexity: 'O(c * m * alpha) for c candidate thresholds. The visualization caps n at 6 and edges at 8.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"edges":[[0,1,2,1],[1,2,3,0]],"k":1}' },
    { label: 'Example 2', input: '{"n":3,"edges":[[0,1,4,0],[1,2,3,0],[0,2,1,0]],"k":2}' },
  ],
}

export default function SpanningTreeStability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Edge strengths" length={run.input.edges.length} valueAt={i => run.input.edges[i][2]} active={-1} />
    <output aria-label="Threshold">{step.T === null ? `Best so far: ${step.best}` : `Testing ${step.T}: ${step.ok ? 'feasible' : 'not feasible'}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A threshold works when every tree edge can reach it, so the test is a Kruskal pass that uses the fewest upgrades.</p>
  </>} />
}
