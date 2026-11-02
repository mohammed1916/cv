import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The prefix starts at the first value.' },
    { id: 'extend', label: 'Extend', description: 'The next value continues the run by one.' },
    { id: 'set', label: 'Prefix', description: 'The run is fixed; search begins at its sum.' },
    { id: 'skip', label: 'Skip', description: 'This candidate is already present.' },
    { id: 'done', label: 'Result', description: 'The smallest missing candidate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from 1 to 50',
  url: 'https://leetcode.com/problems/smallest-missing-integer-greater-than-sequential-prefix-sum/',
  complexity: 'O(n) time and O(n) space for the set of values, plus the search for the missing integer.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,5]' },
    { label: 'Example 2', input: '[3,4,5,1,12,14,13]' },
  ],
}

export default function SmallestMissingSequentialPrefixSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]} active={step.at >= 0 ? step.at : step.end}
      roleAt={i => (i <= step.end ? 'prefix' : '')} />
    <output aria-label="Prefix sum and candidate">{`sum = ${step.total}, candidate = ${step.x ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>The sequential prefix is the longest run where each value is one more than the value before it. Its sum is the starting candidate.</p>
    <p>A set of the array values answers each membership check in constant time, so the search only moves upward past values that are present.</p>
  </>} />
}
