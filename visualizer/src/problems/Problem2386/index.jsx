import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'Start from the empty choice, which sums to 0.' },
    { id: 'pop', label: 'Pop', description: 'Take the smallest subset sum and push its two successors.' },
    { id: 'done', label: 'Complete', description: 'Subtract the k-th smallest subset sum from the positive total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"nums": [...], "k": rank}',
  url: 'https://leetcode.com/problems/find-the-k-sum-of-an-array/',
  complexity: 'O(n log n + k log k) time with a min heap. The visualization caps input at 8 numbers.',
  examples: [
    { label: 'Three numbers, k 5', input: '{"nums":[4,-1,2],"k":5}' },
    { label: 'Five numbers, k 9', input: '{"nums":[-2,3,6,-4,1],"k":9}' },
    { label: 'Single number', input: '{"nums":[3],"k":2}' },
    { label: 'Equal numbers', input: '{"nums":[2,2,2,2],"k":4}' },
    { label: 'Largest total', input: '{"nums":[20,20,20,20,20,20,20,20],"k":160}' },
    { label: 'Long run: 8 numbers', input: '{"nums":[4,-15,-19,3,-8,5,-1,-17],"k":1}' },
  ],
}

export default function KSumOfArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Absolute values, sorted" length={run.input.nums.length} valueAt={i => Math.abs(run.input.nums[i]).toString()} />
    <output aria-label="Subset sum">{`Subset sum at rank ${step.rank}: ${step.sum}. Positive total: ${step.total}`}</output>
    <p>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Every subsequence sum is the positive total minus the sum of some subset of absolute values, so the k-th largest sum is the positive total minus the k-th smallest subset sum.</p>
    <p>Subset sums can be listed in increasing order: each popped subset is extended by the next value or by shifting its last value one step to the right.</p>
  </>} />
}
