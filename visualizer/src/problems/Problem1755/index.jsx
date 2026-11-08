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
    { label: 'Mixed signs', input: '{"nums":[4,-2,9,-5,1],"goal":6}' },
    { label: 'Negative total', input: '{"nums":[-3,-3,11],"goal":-9}' },
  { label: 'Single number', input: "{\"nums\":[5],\"goal\":5}" },
  { label: 'Equal numbers', input: "{\"nums\":[3,3,3,3],\"goal\":6}" },
  { label: 'Extreme values', input: "{\"nums\":[20,20,20,20,20,20,20,20],\"goal\":40}" },
  { label: 'Long run: 8 numbers', input: "{\"nums\":[10,17,-5,6,-10,9,-2,4],\"goal\":32}" },
  ],
}

export default function ClosestSubsequenceSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Left sums (sorted)" length={step.lsums.length} valueAt={i => step.lsums[i]}
      active={step.a} roleAt={i => (i === step.a ? 'current' : '')} />
    <IndexedSequence label="Right sums (sorted): binary search for goal minus the current left sum" length={step.rsums.length} valueAt={i => step.rsums[i]}
      active={step.candidate} roleAt={i => {
        if (step.lo === null || step.lo === undefined) return ''
        if (i === step.lo && i < step.rsums.length) return 'l'
        if (i === step.hi - 1 && step.hi < step.rsums.length + 1) return step.hi === step.lo ? 'l r' : 'r'
        return i === step.candidate ? 'probe' : ''
      }} />
    <output aria-label="Best">{`Goal ${run.input.goal}. Best difference: ${step.best ?? 'not yet'}`}</output>
  </>} renderReasoning={() => <>
    <p>Every subsequence is a left choice plus a right choice, so the sums of each half are enough. Sorting the right sums lets a binary search find the one closest to goal minus each left sum.</p>
    <p>The answer is the smallest difference between the goal and any combined sum.</p>
  </>} />
}
