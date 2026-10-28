import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Runs', description: 'Measure the longest non-decreasing run that ends at, or starts at, each position.' },
    { id: 'scan', label: 'Change one', description: 'Replace the value at this position and join the runs on either side.' },
    { id: 'done', label: 'Complete', description: 'Report the longest subarray after at most one change.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers from -20 to 20 (JSON)',
  url: 'https://leetcode.com/problems/longest-non-decreasing-subarray-after-replacing-at-most-one-element/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at 14 values.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,1,2]' },
    { label: 'Example 2', input: '[1,3,2,4]' },
  ],
}

export default function LongestAfterOneChange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]}
      active={step.index < run.input.length ? step.index : -1} roleAt={index => (step.index >= 0 && index === step.index ? 'changed' : '')} />
    <output aria-label="Best">{`Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Without a change, a subarray is a run of non-decreasing values. One replaced value can join two runs, but only if the values on both sides of it can fit in order.</p>
    <p>The replaced value can be any integer, so it fits between its neighbours exactly when the left neighbour is at most the right neighbour.</p>
  </>} />
}
