import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Direct roads', description: 'Start from the road weights and the zero diagonal.' },
    { id: 'floyd', label: 'Relax', description: 'Allow paths through each middle branch.' },
    { id: 'mask', label: 'Subset', description: 'Test one set of open branches.' },
    { id: 'count', label: 'Count', description: 'The open set satisfies the distance limit.' },
    { id: 'done', label: 'Result', description: 'Report how many sets are valid.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, maxDistance and roads as [u, v, w] triples',
  url: 'https://leetcode.com/problems/number-of-possible-sets-of-closing-branches/',
  complexity: 'O(n^3 + n^2 * 2^n) time, O(n^2) space. The visualization caps n at 6.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"maxDistance":5,"roads":[[0,1,2],[1,2,10],[0,2,10]]}' },
    { label: 'Example 2', input: '{"n":3,"maxDistance":5,"roads":[[0,1,2],[1,2,10]]}' },
  ],
}

export default function ClosingBranches() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="branches" length={run.input.n} valueAt={i => i} active={step.open?.length ? step.open[step.open.length - 1] : 0}
      roleAt={i => (step.open?.includes(i) ? 'window' : '')} />
    <output aria-label="Open set">{`open {${(step.open ?? []).join(', ')}}, valid so far ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Distances use every road, including roads to closed branches, so the shortest paths are computed once on the full network.</p>
    <p>Each subset of open branches is checked independently: it is valid when every pair inside it is within maxDistance.</p>
  </>} />
}
