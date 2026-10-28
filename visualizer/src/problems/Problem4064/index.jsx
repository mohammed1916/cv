import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'extend', label: 'Extend', description: 'Add the next element to the residue tables.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subarray.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers and k (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/longest-subarray-divisible-by-k-with-at-most-one-negation-ii/',
  complexity: 'O(n · k) time and O(k) space with the residue tables. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,1,2],"k":3}' },
    { label: 'Example 2', input: '{"nums":[5,3,4],"k":7}' },
  ],
}

export default function DivisibleOneNegationII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Best">{`Best valid length so far ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>For every remainder, the tables keep the earliest start of a subarray with that remainder, with no negation and with exactly one negation.</p>
    <p>A subarray is valid when either table has remainder 0 for it, and an earlier start always gives a longer window.</p>
  </>} />
}
