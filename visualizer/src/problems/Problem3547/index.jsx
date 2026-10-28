import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Walk', description: 'Walk along the path or cycle to order the nodes.' },
    { id: 'assign', label: 'Assign', description: 'Give each node on the walk the next zigzag value.' },
    { id: 'done', label: 'Complete', description: 'Sum the products over all edges.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n and edges (JSON)',
  url: 'https://leetcode.com/problems/maximum-sum-of-edge-values-in-a-graph/',
  complexity: 'O(n + m) time after sorting the zigzag values, which are built directly. The visualization caps n at 12.',
  examples: [
    { label: 'Path', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]]}' },
    { label: 'Cycle', input: '{"n":6,"edges":[[0,3],[4,5],[2,0],[1,3],[2,4],[1,5]]}' },
  ],
}

export default function MaximumSumOfEdgeValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Zigzag values in walk order" length={run.z.length} valueAt={i => run.z[i]} active={step.at ?? -1}
      roleAt={i => (i <= (step.at ?? -1) ? 'placed' : '')} />
    <output aria-label="Sum">{step.phase === 'done' ? `Total: ${run.result}` : 'Total not known yet'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The larger values go in the middle of the walk so that each large value is multiplied by two large neighbours.</p>
  </>} />
}
