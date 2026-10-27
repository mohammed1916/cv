import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Base', description: 'Compute the minimum spanning tree weight.' },
    { id: 'test', label: 'Test edge', description: 'Remove or force one edge and compare the weight with the base.' },
    { id: 'done', label: 'Complete', description: 'Report the critical and pseudo-critical edges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n and edges as [a, b, weight] triples',
  url: 'https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/',
  complexity: 'O(E^2 * α(n)) after sorting, for E edges. The visualization caps input at 6 vertices and 8 edges.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"edges":[[0,1,1],[1,2,1],[2,3,2],[0,3,2],[0,4,3],[3,4,3],[1,4,6]]}' },
    { label: 'Square', input: '{"n":4,"edges":[[0,1,1],[1,2,1],[2,3,1],[0,3,1]]}' },
  ],
}

const STATUS_LABEL = { critical: 'critical', pseudo: 'pseudo', '': 'none' }

export default function CriticalPseudoEdges() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Edges by index" length={run.input.edges.length}
      valueAt={index => `${run.input.edges[index][0]}-${run.input.edges[index][1]} (${run.input.edges[index][2]})`}
      active={step.index} roleAt={index => step.status[index] || ''} />
    <output aria-label="Base weight">{`Minimum spanning tree weight: ${step.base}`}</output>
    <output aria-label="Statuses">{step.status.map((s, i) => `${i}: ${STATUS_LABEL[s]}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>An edge is critical when every minimum spanning tree uses it, and that is detected by removing it and seeing the weight rise.</p>
    <p>An edge is pseudo-critical when some minimum spanning tree uses it: forcing it in first keeps the base weight.</p>
  </>} />
}
