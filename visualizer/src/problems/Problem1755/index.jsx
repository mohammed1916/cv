import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'split', label: 'Split', description: 'Split the numbers into two halves.' },
    { id: 'left', label: 'Left sums', description: 'List and sort every subset sum of the left half.' },
    { id: 'right', label: 'Right sums', description: 'List and sort every subset sum of the right half.' },
    { id: 'start', label: 'Best', description: 'Start with a very large best difference.' },
    { id: 'search', label: 'Search', description: 'Find the right sum closest to goal minus the left sum.' },
    { id: 'update', label: 'Update', description: 'Keep the smallest difference found.' },
    { id: 'done', label: 'Complete', description: 'Report the closest subsequence sum difference.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers) and goal (JSON)',
  url: 'https://leetcode.com/problems/closest-subsequence-sum/',
  complexity: 'O(2^(n/2) log 2^(n/2)) time by meet in the middle. The visualization caps n at 8.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,-7,3,5],"goal":6}' },
    { label: 'Example 2', input: '{"nums":[7,-9,15,-2],"goal":-5}' },
  ],
}

export default function ClosestSubsequenceSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Left sums (sorted)" length={step.lsums.length} valueAt={i => step.lsums[i]}
      active={step.a} roleAt={i => (i === step.a ? 'current' : '')} />
    <IndexedSequence label="Right sums (sorted)" length={step.rsums.length} valueAt={i => step.rsums[i]}
      active={step.candidate} roleAt={i => (i === step.candidate ? 'closest' : '')} />
    <output aria-label="Best">{`Goal ${run.input.goal}. Best difference: ${step.best ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every subsequence is a left choice plus a right choice, so the sums of each half are enough. Sorting the right sums lets a binary search find the one closest to goal minus each left sum.</p>
    <p>The answer is the smallest difference between the goal and any combined sum.</p>
  </>} />
}
