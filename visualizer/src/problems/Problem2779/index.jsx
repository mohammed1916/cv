import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort the values so that close values sit next to each other.' },
    { id: 'shrink', label: 'Shrink', description: 'Move the left end while the spread is too wide.' },
    { id: 'record', label: 'Record', description: 'Keep the largest group that fits the spread.' },
    { id: 'done', label: 'Complete', description: 'Report the maximum beauty.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k',
  url: 'https://leetcode.com/problems/maximum-beauty-of-an-array-after-applying-operation/',
  complexity: 'O(n log n) time for the sort and O(n) for the window. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,6,1,2],"k":2}' },
    { label: 'Equal values', input: '{"nums":[1,1,1,1],"k":10}' },
  ],
}

export default function MaximumBeauty() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.right}
      roleAt={i => (i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Spread">{`Spread ${step.right >= 0 ? run.sorted[step.right] - run.sorted[step.left] : 0} of allowed ${2 * run.input.k}. Best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A group can all become one value exactly when its largest and smallest values differ by at most 2k.</p>
  </>} />
}
