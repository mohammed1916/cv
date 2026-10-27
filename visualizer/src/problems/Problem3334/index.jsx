import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'base', label: 'Keep all', description: 'Score the array with nothing removed.' },
    { id: 'remove', label: 'Remove one', description: 'Score the array after removing one element.' },
    { id: 'done', label: 'Complete', description: 'Report the best score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/find-the-maximum-factor-score-of-array/',
  complexity: 'O(n^2 log M) time for n values up to M, since each removal rescans the list. The visualization caps input at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,4,8,16]}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,4,5]}' },
    { label: 'Single', input: '{"nums":[3]}' },
  ],
}

export default function MaximumFactorScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === step.index ? 'removed' : '')} />
    <output aria-label="Score">{`${step.message} Score of this array: ${step.score}.`}</output>
  </>} renderReasoning={() => <>
    <p>A factor score is the gcd of the values times their lcm, so it is simple to compute for any list.</p>
    <p>Removing at most one element means checking the full array and each array with one element left out.</p>
  </>} />
}
