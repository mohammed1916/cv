import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the numbers; the smallest sits at the front of the heap.' },
    { id: 'combine', label: 'Combine', description: 'Remove the two smallest numbers and push twice the smaller plus the larger.' },
    { id: 'done', label: 'Complete', description: 'Report the operation count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": threshold}',
  url: 'https://leetcode.com/problems/minimum-operations-to-exceed-threshold-value-ii/',
  complexity: 'O(n log n + ops log n) time with a min heap. The visualization caps input at 8 numbers and threshold 30.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,11,10,1,3],"k":10}' },
    { label: 'Example 2', input: '{"nums":[1,1,2,4,9],"k":20}' },
  ],
}

export default function ThresholdOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in the heap (sorted)" length={step.values.length} valueAt={i => step.values[i]}
      roleAt={i => (step.pair.includes(step.values[i]) ? 'combining' : step.values[i] >= run.input.k ? 'done' : '')} />
    <output aria-label="Operations">{`Operations so far: ${step.ops}`}</output>
  </>} renderReasoning={() => <>
    <p>The smallest number is the only one that can fall below the threshold, so each operation combines the two smallest.</p>
    <p>The result 2x + y is at least as large as both inputs, so the numbers left below the threshold keep shrinking until none remain.</p>
  </>} />
}
