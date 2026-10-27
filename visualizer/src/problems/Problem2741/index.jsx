import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Singles', description: 'Each number starts a one-element arrangement.' },
    { id: 'extend', label: 'Extend', description: 'Grow arrangements of a subset by one divisible neighbour.' },
    { id: 'done', label: 'Complete', description: 'Sum the arrangements that use every number.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a distinct array nums (JSON)',
  url: 'https://leetcode.com/problems/special-permutations/',
  complexity: 'O(2^n * n^2) time and O(2^n * n) space. The visualization caps nums at 8 entries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,4,3]}' },
    { label: 'Powers of two', input: '{"nums":[2,4,8]}' },
  ],
}

export default function SpecialPermutations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers in the subset" length={run.input.nums.length} valueAt={i => run.input.nums[i]}
      active={-1} roleAt={i => ((step.mask >> i) & 1 ? 'in subset' : '')} />
    <output aria-label="Subset">{`Subset bits: ${step.mask.toString(2).padStart(run.input.nums.length, '0')}, valid arrangements: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A permutation is special when each adjacent pair has one number dividing the other, so only the last number placed matters for the next step.</p>
    <p>Tracking the used numbers as a bitmask and the last number gives a table with 2^n * n states.</p>
  </>} />
}
