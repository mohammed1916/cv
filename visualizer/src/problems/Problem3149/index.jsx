import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import CyclePermutationView from './CyclePermutationView'
import { buildTrace, parseInput, code, python } from './algorithm'
import './CyclePermutationView.css'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the cycle at index 0.' },
    { id: 'choose', label: 'Choose', description: 'Pick the next index with the cheapest completion.' },
    { id: 'close', label: 'Close', description: 'Pay the edge back to 0.' },
    { id: 'done', label: 'Result', description: 'Report the permutation.' },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (a permutation of 0 to n-1)',
  url: 'https://leetcode.com/problems/find-the-minimum-cost-array-permutation/',
  complexity: 'O(2^n * n^2) time and O(2^n * n) space with a bitmask table. The visualization caps n at 8; the official limit is 14.',
  examples: [
    { label: 'Four values', input: '{"nums":[2,0,3,1]}' },
    { label: 'Reversed', input: '{"nums":[3,2,1,0]}' },
    { label: 'Pair', input: '{"nums":[1,0]}' },
  ],
}

export default function FindTheMinimumCostArrayPermutation() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <CyclePermutationView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>The score sums |perm[i] - nums[perm[i + 1]]| around the whole cycle, so the value looked up is the next entry, not the neighbour in nums.</p>
    </>} />
}
