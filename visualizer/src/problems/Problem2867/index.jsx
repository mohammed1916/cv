import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty count.' },
    { id: 'walk', label: 'Walk', description: 'Start a walk from one node.' },
    { id: 'pair', label: 'Count pair', description: 'The path has exactly one prime label.' },
    { id: 'skip', label: 'Skip', description: 'The path has zero or several primes.' },
    { id: 'done', label: 'Result', description: 'Report the number of valid pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 10) and edges (tree, labels 1 to n)',
  url: 'https://leetcode.com/problems/count-valid-paths-in-a-tree/',
  complexity: 'O(n^2) time in this walk-per-node version. The visualization caps n at 10.',
  examples: [
    { label: 'Example', input: '{"n":5,"edges":[[1,2],[1,3],[2,4],[2,5]]}' },
    { label: 'Path', input: '{"n":3,"edges":[[1,2],[2,3]]}' },
  ],
}

export default function CountValidPathsInATree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const edges = run.input.edges.map(([a, b]) => [a - 1, b - 1])
    const labels = Array.from({ length: run.input.n }, (_, i) => String(i + 1))
    return <>
      <GraphTraversalView title="Tree (labels 1 to n)" n={run.input.n} edges={edges} labels={labels}
        current={step.u > 0 ? step.u - 1 : null} visited={step.reached.map(v => v - 1)} />
      <output aria-label="Count">{`Walk from ${step.u > 0 ? step.u : '-'}, reached ${step.v > 0 ? step.v : '-'} with ${step.primes} prime${step.primes === 1 ? '' : 's'}. Valid pairs: ${step.count}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A pair (u, v) with u less than v is valid when its path holds exactly one node whose label is prime.</p>
    <p>Walking outward from each start node carries the prime count along the path, so every pair is checked once.</p>
  </>} />
}
