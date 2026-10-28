import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how often each value appears.' },
    { id: 'pick', label: 'Remove a value', description: 'Remove every copy of the next most frequent value.' },
    { id: 'done', label: 'Complete', description: 'Report the size of the chosen set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Even-length array of integers 1 to 9 as JSON',
  url: 'https://leetcode.com/problems/reduce-array-size-to-the-half/',
  complexity: 'O(n log n) time for sorting the counts, O(n) space.',
  examples: [
    { label: 'Example 1', input: '[3,3,3,3,5,5,5,2,2,7]' },
    { label: 'Example 2', input: '[7,7,7,7,7,7]' },
  ],
}

export default function ReduceArrayToHalf() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (step.chosen.includes(run.input[i]) ? 'removed' : '')} />
    <output aria-label="Removed so far">{`Removed ${step.removed} of ${run.input.length}; chosen values: ${step.chosen.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>Removing a value takes out all of its copies, so the values with the most copies give the most progress per choice.</p>
    <p>Taking values in decreasing frequency order reaches half the array with the fewest chosen values.</p>
  </>} />
}
