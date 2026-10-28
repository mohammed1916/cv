import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Last value', description: 'The last value is the first bound.' },
    { id: 'split', label: 'Split', description: 'The value is too large for the bound, so split it into parts.' },
    { id: 'keep', label: 'Keep', description: 'The value already fits under the bound.' },
    { id: 'done', label: 'Complete', description: 'Report the number of operations.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums: 1 to 12 positive integers up to 50',
  url: 'https://leetcode.com/problems/minimum-replacements-to-sort-the-array/',
  complexity: 'O(n) time for n values. The visualization caps values at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,9,3]}' },
    { label: 'Sorted', input: '{"nums":[1,2,3,4,5]}' },
  ],
}

export default function MinimumReplacements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Bound">{`Bound for the value on the left: ${step.prev}; operations so far: ${step.ops}`}</output>
  </>} renderReasoning={() => <>
    <p>Each value must be split into parts that do not exceed the smallest part of the value to its right, so scanning from the right keeps the bound as loose as possible.</p>
    <p>Splitting into the fewest parts keeps the smallest part as large as possible, which gives the next value on the left the loosest bound.</p>
  </>} />
}
