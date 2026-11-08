import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Prefixes', description: 'Build prefix sums of nums and cost.' },
    { id: 'layer', label: 'Layer', description: 'Start a table for one more subarray.' },
    { id: 'cut', label: 'Cut', description: 'Price one subarray that ends at r and starts at l.' },
    { id: 'done', label: 'Result', description: 'Take the best total over every layer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, cost (same length) and k',
  url: 'https://leetcode.com/problems/minimum-cost-to-divide-array-into-subarrays/',
  complexity: 'O(n^3) time for this visualizer with n up to 8. Layers of this recurrence can be sped up with a convex hull trick.',
  examples: [
    { label: 'Example', input: '{"nums":[2,5],"cost":[3,1],"k":2}' },
    { label: 'Three items', input: '{"nums":[1,4,2],"cost":[2,2,3],"k":1}' },
    { label: 'Single element', input: '{"nums":[3],"cost":[2],"k":1}' },
    { label: 'Equal values tie', input: '{"nums":[4,4,4],"cost":[4,4,4],"k":4}' },
    { label: 'Largest values and k', input: '{"nums":[9,1,9,1,9,1,9,1],"cost":[1,9,1,9,1,9,1,9],"k":9}' },
    { label: 'Long run: 8 pairs', input: '{"nums":[1,1,1,3,1,8,7,5],"cost":[9,2,8,8,5,2,9,8],"k":5}' },
  ],
}

export default function MinimumCostToDivideArrayIntoSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label={`Best cost with ${step.layer} subarray${step.layer === 1 ? '' : 's'}, by end index`}
      length={run.input.nums.length + 1} valueAt={i => (step.cur[i] === Infinity ? '∞' : step.cur[i])}
      active={step.end >= 0 ? step.end : -1} roleAt={i => (step.start >= 0 && i === step.end ? 'cut' : '')} />
    <output aria-label="Layer state">{step.result !== null ? `Minimum total ${step.result}` : step.candidate !== null
      ? `Subarray from ${step.start} to ${step.end}: candidate ${step.candidate}` : step.message}</output>
  </>} renderReasoning={() => <>
    <p>Each subarray is priced by the sum of the prefix of nums up to its end, shifted by k times its position, multiplied by its own cost sum.</p>
    <p>A layer stores, for each end index, the cheapest way to finish that prefix with exactly the layer’s number of subarrays. The answer is the best final entry across layers.</p>
  </>} />
}
