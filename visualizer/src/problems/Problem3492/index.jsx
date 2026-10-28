import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up the grid and an empty load.' },
    { id: 'place', label: 'Place', description: 'Load one more container.' },
    { id: 'done', label: 'Complete', description: 'Report the count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (1 to 10), w (1 to 10) and maxWeight (0 to 200) (JSON)',
  url: 'https://leetcode.com/problems/maximum-containers-on-a-ship/',
  complexity: 'O(min(n * n, maxWeight / w)) time. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"w":2,"maxWeight":7}' },
    { label: 'Example 2', input: '{"n":3,"w":3,"maxWeight":7}' },
  ],
}

export default function ShipContainers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Containers placed" length={step.count} valueAt={() => run.input.w}
      active={step.count - 1} roleAt={() => 'placed'} />
    <output aria-label="Load">{`Load ${step.load} of ${run.input.maxWeight}, containers ${step.count} of ${run.input.n * run.input.n}`}</output>
  </>} renderReasoning={() => <>
    <p>All containers weigh the same, so the answer depends only on how many fit under the limit, capped by the number of grid cells.</p>
    <p>Adding containers one at a time and stopping at the first one that would overload the ship gives that count directly.</p>
  </>} />
}
